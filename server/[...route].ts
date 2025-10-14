import type { VercelRequest, VercelResponse } from '@vercel/node';
import { withAuth } from './_middleware/auth.js';
import type { AuthenticatedRequest } from './_shared/auth-types.js';
import { adaptExpressRouter } from './_utils/express-to-vercel-adapter.js';

// Import route modules
import authRouter from './routes/modules/auth.js';
import trainingRouter from './routes/modules/training.js';
import galleryRouter from './routes/modules/gallery.js';
// 🚨 DISABLED: Maya routes now handled by dedicated serverless endpoints
// import mayaRouter from './routes/modules/maya.js';

export const config = { runtime: 'nodejs' } as const;

// Auth routes handled by auth.ts module
const AUTH_ROUTES = [
  '/api/me',
  '/api/auth/user',
  '/api/profile',
  '/api/user/update-gender'
];

// Training routes handled by training.ts module
const TRAINING_ROUTES = [
  '/api/user-model',
  '/api/training/status',
  '/api/training-progress'
];

// Gallery routes handled by gallery.ts module
const GALLERY_ROUTES = [
  '/api/gallery',
  // '/api/gallery-images', // REMOVED: Now handled by pure serverless function with auth middleware
  '/api/images/favorites',
  '/api/images',
  '/api/ai-images'
];

// Maya routes handled by maya.ts module (Phase 4 Migration - Day 5)
// NOTE: Maya routes are now handled by dedicated Vercel serverless functions in /server/api/maya/
// The Express router implementation has been deprecated to avoid routing conflicts

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-stack-access-token');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // 🔥 CRITICAL FIX: Start background monitoring services for serverless environment
  // These services must be started in the serverless handler since routes.ts is not called
  try {
    // Start Training Completion Monitor
    const { TrainingCompletionMonitor } = await import('./training-completion-monitor.js');
    TrainingCompletionMonitor.getInstance().startMonitoring();
    console.log('✅ Started Training Completion Monitor');

    // Start Generation Completion Monitor (CRITICAL for Maya concept cards!)
    const { GenerationCompletionMonitor } = await import('./generation-completion-monitor.js');
    GenerationCompletionMonitor.getInstance().startMonitoring();
    console.log('✅ Started Generation Completion Monitor');

    // Start Migration Monitor to prevent image loss
    const { migrationMonitor } = await import('./migration-monitor.js');
    migrationMonitor.startMonitoring();
    console.log('✅ Started Migration Monitor');
  } catch (monitorError) {
    console.error('❌ Failed to start background monitors:', monitorError);
    // Don't fail the request if monitors can't start
  }

  // Public routes that don't require authentication - handle BEFORE auth middleware
  
  // Health check endpoints
  if (req.url?.includes('/api/health') || req.url?.includes('/api/health-check')) {
    return res.status(200).json({
      status: 'healthy',
      service: 'SSELFIE Studio API',
      timestamp: new Date().toISOString(),
    });
  }

  // Ping endpoint - public
  if (req.url === '/api/ping') {
    return res.status(200).json({
      status: 'ok',
      message: 'SSELFIE Studio API is running',
      timestamp: new Date().toISOString(),
    });
  }

  // Sandra Images API - Public access for image serving
  if (req.url?.startsWith('/api/sandra-images/')) {
    const sandraImagesHandler = await import('./sandra-images.js');
    return sandraImagesHandler.default(req, res);
  }

  // Handle logout
  if (req.url === '/api/logout') {
    const expired = [
      'stack-access',
      'stack-access-token', 
      'stack_session',
      '__Secure-next-auth.session-token'
    ].map(name => `${name}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`);
    
    res.setHeader('Set-Cookie', expired);
    res.setHeader('Cache-Control', 'no-store');
    return res.status(200).json({ ok: true, loggedOut: true });
  }

  // Auto-registration and other auth endpoints
  if (req.url === '/api/auth/auto-register') {
    const { storage } = await import('../server/storage.js');
    const { email, plan, source } = req.body || {};
    
    if (!email || !plan) {
      return res.status(400).json({ error: 'Email and plan are required' });
    }

    try {
      // Check existing user
      const existingUser = await storage.getUserByEmail(email);
      
      if (existingUser) {
        const updatedUser = await storage.updateUserProfile(existingUser.id, {
          plan: plan,
          monthlyGenerationLimit: plan === 'sselfie-studio' ? 100 : -1,
          mayaAiAccess: true,
          lastLoginAt: new Date()
        });

        return res.status(200).json({
          success: true,
          message: 'Account updated successfully',
          userId: updatedUser.id,
          email: updatedUser.email,
          action: 'updated'
        });
      }

      // Create new user
      const newUserId = `user_${Date.now()}_${email.split('@')[0]}`;
      const newUser = await storage.upsertUser({
        id: newUserId,
        email: email,
        displayName: email.split('@')[0],
        firstName: null,
        lastName: null,
        profileImageUrl: null,
        plan: plan,
        monthlyGenerationLimit: plan === 'sselfie-studio' ? 100 : -1,
        onboardingProgress: JSON.stringify({ source: source || 'payment-success' })
      } as any);

      return res.status(201).json({
        success: true,
        message: 'Account pre-created successfully',
        userId: newUser.id,
        email: newUser.email,
        plan: newUser.plan,
        action: 'created'
      });

    } catch (error) {
      return res.status(500).json({
        success: false,
        error: 'Failed to create account',
        message: (error as Error).message
      });
    }
  }

  // 🔥 CRITICAL FIX: Stack Auth API v1 proxy - Handle Stack Auth client API requests
  if (req.url?.startsWith('/api/v1/')) {
    // Stack Auth v1 API requests (e.g., /api/v1/projects/current)
    const stackAuthPath = req.url.replace('/api/v1', ''); 
    const stackAuthUrl = `https://api.stack-auth.com/api/v1${stackAuthPath}`;

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      // 🔥 CRITICAL: Forward all Stack Auth headers from the request
      const stackAuthHeaders = [
        'x-stack-access-type',
        'x-stack-project-id', 
        'x-stack-publishable-client-key',
        'x-stack-secret-server-key',
        'x-stack-access-token',
        'x-stack-refresh-token',
        'x-stack-admin-access-token',
        'x-stack-random-nonce',
        'x-stack-allow-anonymous-user',
        'x-stack-override-error-status',
        'x-stack-client-version'
      ];

      stackAuthHeaders.forEach(header => {
        if (req.headers[header]) {
          headers[header] = req.headers[header] as string;
        }
      });

      // Forward authorization header if present
      if (req.headers.authorization) {
        headers['Authorization'] = req.headers.authorization;
      }

      const response = await fetch(stackAuthUrl, {
        method: req.method,
        headers,
        body: req.method !== 'GET' && req.body ? JSON.stringify(req.body) : undefined
      });

      const contentType = response.headers.get('content-type') || 'application/json';
      let data: string;

      // Handle different content types
      if (contentType.includes('application/json')) {
        data = await response.text();
      } else {
        data = await response.text();
      }

      // Forward response headers
      res.setHeader('Content-Type', contentType);
      res.setHeader('Cache-Control', 'no-store');
      
      // Forward Set-Cookie headers for auth state
      const setCookie = response.headers.get('set-cookie');
      if (setCookie) {
        res.setHeader('Set-Cookie', setCookie);
      }

      return res.status(response.status).send(data);

    } catch (error) {
      return res.status(500).json({
        error: 'Stack Auth v1 proxy failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Stack Auth API proxy - Enhanced with better error handling and logging  
  if (req.url?.startsWith('/api/auth/') && !req.url.includes('auto-register')) {
    const stackAuthPath = req.url.replace('/api/auth', '');
    const stackAuthUrl = `https://api.stack-auth.com/api/v1/projects/${process.env.STACK_AUTH_PROJECT_ID}${stackAuthPath}`;

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'x-stack-project-id': process.env.STACK_AUTH_PROJECT_ID || '',
        'x-stack-publishable-client-key': process.env.VITE_STACK_PUBLISHABLE_CLIENT_KEY || '',
        'x-stack-access-type': 'client', // 🔥 CRITICAL FIX: Required header for Stack Auth API
      };

      // 🔥 ENHANCED: Add server-side authentication if secret key is available and request requires it
      if (process.env.STACK_AUTH_SECRET_KEY && (req.method === 'POST' || req.method === 'PUT' || req.method === 'DELETE')) {
        headers['x-stack-access-type'] = 'server';
        headers['x-stack-secret-server-key'] = process.env.STACK_AUTH_SECRET_KEY;
      }

      // Forward authorization header if present
      if (req.headers.authorization) {
        headers['Authorization'] = req.headers.authorization;
      }

      // Forward Stack Auth specific headers
      const stackHeaders = ['x-stack-access-token', 'x-stack-refresh-token', 'x-stack-admin-access-token'];
      stackHeaders.forEach(header => {
        if (req.headers[header]) {
          headers[header] = req.headers[header] as string;
        }
      });

      const response = await fetch(stackAuthUrl, {
        method: req.method,
        headers,
        body: req.method !== 'GET' && req.body ? JSON.stringify(req.body) : undefined
      });

      const contentType = response.headers.get('content-type') || 'application/json';
      let data: string;

      // Handle different content types
      if (contentType.includes('application/json')) {
        data = await response.text();
      } else {
        data = await response.text();
      }

      // Forward response headers
      res.setHeader('Content-Type', contentType);
      res.setHeader('Cache-Control', 'no-store');
      
      // Forward Set-Cookie headers for auth state
      const setCookie = response.headers.get('set-cookie');
      if (setCookie) {
        res.setHeader('Set-Cookie', setCookie);
      }

      return res.status(response.status).send(data);

    } catch (error) {
      return res.status(500).json({
        error: 'Stack Auth proxy failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Define public routes that should never require authentication
  const isPublicRoute = req.url && (
    req.url.startsWith('/api/health') ||
    req.url === '/api/ping' ||
    req.url.startsWith('/api/sandra-images/') ||
    req.url.startsWith('/api/hair-trends') ||
    req.url.startsWith('/api/auth/') ||
    req.url.startsWith('/api/admin/') || // Admin routes use x-admin-token, not Stack Auth
    req.url.startsWith('/api/webhooks/') || // Webhook endpoints (Replicate, Stripe, etc.)
    req.url === '/api/logout'
  );

  // Define protected routes that require authentication
  const isProtectedRoute = req.url && (
    req.url.includes('/api/me') ||
    req.url.includes('/api/maya') ||
    req.url.includes('/api/video') ||
    req.url.includes('/api/ai-images') ||
    req.url.includes('/api/gallery-images') ||
    req.url.includes('/api/story') ||
    req.url.includes('/api/victoria') ||
    req.url.includes('/api/training') ||
    req.url.includes('/api/user-model')
  );

  // 🔄 AUTH ROUTES: Handle via auth.ts module (Phase 1 Migration)
  const isAuthRoute = req.url && AUTH_ROUTES.some(route => req.url === route || req.url?.startsWith(route));
  if (isAuthRoute) {
    console.log(`🔄 [AUTH MODULE] Handling: ${req.url}`);
    return withAuth(req, res, async (req: AuthenticatedRequest, res: VercelResponse) => {
      // Handle auth routes directly without Express adapter
      if (req.url === '/api/me') {
        res.setHeader('Cache-Control', 'no-store');

        const dbUser = req.user;
        if (!dbUser) {
          return res.status(404).json({ error: 'User not found' });
        }

        const user = {
          id: dbUser.id,
          email: dbUser.email ?? '',
          displayName: dbUser.displayName ?? undefined,
          firstName: dbUser.firstName ?? undefined,
          lastName: dbUser.lastName ?? undefined,
          gender: (dbUser.gender as 'man' | 'woman' | 'other' | undefined) ?? undefined,
          profileImageUrl: dbUser.profileImageUrl ?? undefined,
          plan: dbUser.plan ?? undefined,
          role: dbUser.role ?? undefined,
          monthlyGenerationLimit: dbUser.monthlyGenerationLimit ?? undefined,
          createdAt: dbUser.createdAt
        };

        return res.status(200).json({ data: { user } });
      }

      // For other auth routes, fall back to main handler
      const { default: main } = await import('./index.js');
      return main(req, res);
    });
  }

  // 🔄 TRAINING ROUTES: Handle via training.ts module (Phase 2 Migration - Day 3)
  const isTrainingRoute = req.url && TRAINING_ROUTES.some(route => req.url === route || req.url?.startsWith(route));
  if (isTrainingRoute) {
    console.log(`🔄 [TRAINING MODULE] Handling: ${req.url}`);
    return withAuth(req, res, async (req: AuthenticatedRequest, res: VercelResponse) => {
      const trainingHandler = adaptExpressRouter(trainingRouter);
      return trainingHandler(req, res);
    });
  }

  // 🔄 GALLERY ROUTES: Handle via gallery.ts module (Phase 3 Migration - Day 4)
  const isGalleryRoute = req.url && GALLERY_ROUTES.some(route => req.url === route || req.url?.startsWith(route));
  if (isGalleryRoute) {
    console.log(`🔄 [GALLERY MODULE] Handling: ${req.url}`);
    return withAuth(req, res, async (req: AuthenticatedRequest, res: VercelResponse) => {
      const galleryHandler = adaptExpressRouter(galleryRouter);
      return galleryHandler(req, res);
    });
  }

  // Maya routes are handled by dedicated Vercel serverless functions in /server/api/maya/
  // No Express router routing needed - conflicts resolved

  // Skip auth middleware entirely for public routes
  if (isPublicRoute) {
    const { default: main } = await import('./index.js');
    return main(req, res);
  }

  // Use optional auth for most routes, required auth only for protected routes
  return withAuth(req, res, async (req: AuthenticatedRequest, res: VercelResponse) => {
    // Import main handler dynamically to avoid circular dependencies
    const { default: main } = await import('./index.js');
    return main(req, res);
  }, { 
    optional: !isProtectedRoute 
  });
}

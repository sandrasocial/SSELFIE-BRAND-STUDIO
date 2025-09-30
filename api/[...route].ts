import type { VercelRequest, VercelResponse } from '@vercel/node';
import { withAuth } from '../api/_middleware/auth.js';
import type { AuthenticatedRequest } from './_shared/auth-types.js';
export const config = { runtime: 'nodejs' } as const;

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

  // Gallery Images API - Public access
  if (req.url?.startsWith('/api/gallery-images')) {
    const galleryImagesHandler = await import('./gallery-images.js');
    return galleryImagesHandler.default(req, res);
  }

  // Hair Trends API - Public access
  if (req.url?.startsWith('/api/hair-trends')) {
    const hairTrendsHandler = await import('./hair-trends.js');
    return hairTrendsHandler.default(req, res);
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
      });

      return res.status(201).json({
        success: true,
        message: 'Account pre-created successfully',
        userId: newUser.id,
        email: newUser.email,
        plan: newUser.plan,
        action: 'created'
      });

    } catch (error) {
      console.error('❌ Auto-registration failed:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to create account',
        message: (error as Error).message
      });
    }
  }

  // Stack Auth API proxy - Enhanced with better error handling and logging
  if (req.url?.startsWith('/api/auth/') && !req.url.includes('auto-register')) {
    const stackAuthPath = req.url.replace('/api/auth', '');
    const stackAuthUrl = `https://api.stack-auth.com/api/v1/projects/${process.env.STACK_AUTH_PROJECT_ID}${stackAuthPath}`;
    
    console.log('🔄 Stack Auth proxy:', {
      path: stackAuthPath,
      method: req.method,
      hasAuth: !!req.headers.authorization,
      projectId: process.env.STACK_AUTH_PROJECT_ID?.substring(0, 8) + '...'
    });

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'x-stack-project-id': process.env.STACK_AUTH_PROJECT_ID || '',
        'x-stack-publishable-client-key': process.env.VITE_STACK_PUBLISHABLE_CLIENT_KEY || '',
      };

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

      console.log('✅ Stack Auth proxy success:', {
        status: response.status,
        contentType,
        hasSetCookie: !!setCookie
      });

      return res.status(response.status).send(data);

    } catch (error) {
      console.error('❌ Stack Auth proxy failed:', {
        error: error instanceof Error ? error.message : error,
        url: stackAuthUrl,
        method: req.method
      });
      
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
    req.url.startsWith('/api/gallery-images') ||
    req.url.startsWith('/api/hair-trends') ||
    req.url.startsWith('/api/auth/') ||
    req.url === '/api/logout'
  );

  // Define protected routes that require authentication
  const isProtectedRoute = req.url && (
    req.url.includes('/api/me') ||
    req.url.includes('/api/maya') ||
    req.url.includes('/api/video') ||
    req.url.includes('/api/ai-images') ||
    req.url.includes('/api/story') ||
    req.url.includes('/api/admin') ||
    req.url.includes('/api/victoria') ||
    req.url.includes('/api/training') ||
    req.url.includes('/api/user-model')
  );

  // Skip auth middleware entirely for public routes
  if (isPublicRoute) {
    try {
      const { default: main } = await import('./index.js');
      return main(req, res);
    } catch (error) {
      console.error('❌ Public route handler failed:', {
        url: req.url,
        method: req.method,
        error: error instanceof Error ? { message: error.message, stack: error.stack } : error
      });
      throw error;
    }
  }

  // Use optional auth for most routes, required auth only for protected routes
  try {
    return withAuth(req, res, async (req: AuthenticatedRequest, res: VercelResponse) => {
      try {
        // Import main handler dynamically to avoid circular dependencies
        const { default: main } = await import('./index.js');
        return main(req, res);
      } catch (error) {
        console.error('❌ Route handler failed:', {
          url: req.url,
          method: req.method,
          error: error instanceof Error ? { message: error.message, stack: error.stack } : error
        });
        throw error;
      }
    }, { 
      optional: !isProtectedRoute 
    });
  } catch (error) {
    console.error('❌ Auth middleware failed:', {
      url: req.url,
      method: req.method,
      error: error instanceof Error ? { message: error.message, stack: error.stack } : error
    });
    throw error;
  }
}

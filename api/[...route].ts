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

  // Health check and other non-auth routes
  if (req.url?.includes('/api/health') || req.url?.includes('/api/health-check')) {
    return res.status(200).json({
      status: 'healthy',
      service: 'SSELFIE Studio API',
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

  // Stack Auth API proxy
  if (req.url?.startsWith('/api/auth/') && !req.url.includes('auto-register')) {
    const stackAuthPath = req.url.replace('/api/auth', '');
    const stackAuthUrl = `https://api.stack-auth.com/api/v1/projects/${process.env.STACK_AUTH_PROJECT_ID}${stackAuthPath}`;
    
    try {
      const response = await fetch(stackAuthUrl, {
        method: req.method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': req.headers.authorization || '',
          'x-stack-project-id': process.env.STACK_AUTH_PROJECT_ID || '',
          ...(req.body ? {} : {})
        },
        body: req.body ? JSON.stringify(req.body) : undefined
      });

      const data = await response.text();
      res.setHeader('Content-Type', response.headers.get('content-type') || 'application/json');
      res.setHeader('Cache-Control', 'no-store');
      return res.status(response.status).send(data);

    } catch (error) {
      console.error('Stack Auth proxy failed:', error);
      return res.status(500).json({
        error: 'Stack Auth proxy failed',
        message: (error as Error).message
      });
    }
  }

  // Wrap all other routes with auth middleware
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

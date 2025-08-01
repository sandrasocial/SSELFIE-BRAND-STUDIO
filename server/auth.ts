import { Request, Response } from 'express';
import { getAuthUser } from './replitAuth';
import { db } from './db';
import { users } from '@shared/schema';
import { eq } from 'drizzle-orm';

// Session cookie configuration
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: true,
  sameSite: 'strict' as const,
  maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
};

export async function handleAuth(req: Request, res: Response) {
  try {
    const replitUser = await getAuthUser(req);
    
    if (!replitUser) {
      res.clearCookie('sessionId', COOKIE_OPTIONS);
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Check if user exists in our database
    const existingUser = await db.select()
      .from(users)
      .where(eq(users.replitId, replitUser.id))
      .limit(1);

    if (!existingUser.length) {
      // Create new user if they don't exist
      await db.insert(users).values({
        replitId: replitUser.id,
        username: replitUser.name,
        email: replitUser.email || '',
        avatarUrl: replitUser.profileImage || ''
      });
    }

    // Set secure session cookie
    const sessionId = generateSecureSessionId();
    res.cookie('sessionId', sessionId, COOKIE_OPTIONS);

    return res.json({
      authenticated: true,
      user: {
        id: replitUser.id,
        name: replitUser.name,
        email: replitUser.email,
        profileImage: replitUser.profileImage
      }
    });

  } catch (error) {
    console.error('Auth error:', error);
    res.clearCookie('sessionId', COOKIE_OPTIONS);
    return res.status(500).json({ error: 'Authentication failed' });
  }
}

function generateSecureSessionId(): string {
  return crypto.randomUUID();
}

export async function validateSession(req: Request, res: Response, next: Function) {
  try {
    // CRITICAL FIX: Use Replit OAuth authentication (primary system)
    if (req.isAuthenticated?.() && req.user) {
      const user = req.user as any;
      const now = Math.floor(Date.now() / 1000);
      
      // Check token expiration
      if (user.expires_at && now <= user.expires_at) {
        return next();
      }
      
      // Handle impersonation for admin access
      if (req.session?.impersonatedUser) {
        console.log('🎭 Session validation: Using impersonated user');
        return next();
      }
    }

    // Admin bypass for Sandra's agents (secondary authentication)
    const adminToken = req.headers.authorization?.replace('Bearer ', '') || 
                      req.headers['x-admin-token'] as string;
    
    if (adminToken === 'sandra-admin-2025') {
      console.log('🔐 Admin token authentication successful');
      return next();
    }

    // DEPRECATED: Custom sessionId cookies (being phased out)
    const sessionId = req.cookies.sessionId;
    if (sessionId) {
      console.warn('⚠️ Legacy sessionId cookie detected - please migrate to Replit OAuth');
      // Allow legacy sessions temporarily but log for migration
      return next();
    }

    return res.status(401).json({ 
      error: 'Invalid or expired session',
      authMethods: ['replit_oauth', 'admin_token'],
      migrate: 'Please use /api/login for Replit OAuth authentication'
    });

  } catch (error) {
    console.error('❌ Session validation error:', error);
    return res.status(500).json({ error: 'Authentication system error' });
  }
}
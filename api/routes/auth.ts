/**
 * Authentication and user-related route handlers
 */
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getAuthenticatedUser } from '../middleware/auth';
import { checkCircuitBreaker, withCircuitBreaker, recordCircuitBreakerFailure } from '../utils/circuit-breaker';
import { withDatabaseTimeoutAndRetry } from '../_utils/timing';

// Set logout cookies
function setLogoutCookies(res: VercelResponse) {
  const logoutCookies = [
    '__Secure-next-auth.session-token=; Max-Age=0; Path=/; SameSite=Lax; HttpOnly; Secure',
    'next-auth.session-token=; Max-Age=0; Path=/; SameSite=Lax; HttpOnly',
    '__Secure-authjs.session-token=; Max-Age=0; Path=/; SameSite=Lax; HttpOnly; Secure',
    'authjs.session-token=; Max-Age=0; Path=/; SameSite=Lax; HttpOnly',
    '__vdpl=; Max-Age=0; Path=/; HttpOnly',
    '_vercel_jwt=; Max-Age=0; Path=/; HttpOnly'
  ];
  res.setHeader('Set-Cookie', logoutCookies);
}

export async function handleLogout(req: VercelRequest, res: VercelResponse) {
  setLogoutCookies(res);
  res.setHeader('Cache-Control', 'no-store');
  return res.status(200).json({ ok: true, loggedOut: true });
}

export async function handleAutoRegister(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, stackId, displayName, firstName, lastName, profileImageUrl } = req.body;
    
    if (!email || !stackId) {
      return res.status(400).json({ error: 'email and stackId are required' });
    }

    const { storage } = await import('../../server/storage');
    
    // Check if user already exists
    let existingUser = null;
    try {
      existingUser = await storage.getUserByEmail(email);
    } catch (e) {
      // User doesn't exist, continue with creation
    }

    if (existingUser) {
      // Try by linked stack auth id
      if (existingUser.stackId === stackId) {
        return res.status(200).json({ user: existingUser, created: false });
      }
      
      // Link existing user to Stack Auth
      const updatedUser = await storage.updateUser(existingUser.id, { stackId });
      return res.status(200).json({ user: updatedUser, created: false, linked: true });
    }

    // Create new user
    try {
      // Import storage to create database user
      const newUser = await storage.createUser({
        email,
        stackId,
        firstName: firstName || null,
        lastName: lastName || null,
        profileImageUrl: profileImageUrl || null,
      });

      return res.status(201).json({ user: newUser, created: true });
    } catch (createError) {
      // Create new database user (pre-registration for payment)
      console.log('Creating new user in database:', { email, stackId, firstName, lastName });
      
      const userData = {
        email,
        stackId,
        firstName: firstName || null,
        lastName: lastName || null,
        profileImageUrl: profileImageUrl || null,
      };

      try {
        const createdUser = await storage.createUser(userData);
        return res.status(201).json({ user: createdUser, created: true });
      } catch (finalError) {
        console.error('Failed to create user:', finalError);
        return res.status(500).json({ 
          error: 'Failed to create user', 
          details: (finalError as Error).message 
        });
      }
    }
  } catch (error) {
    console.error('Auto-register error:', error);
    return res.status(500).json({ 
      error: 'Auto-registration failed', 
      details: (error as Error).message 
    });
  }
}

export async function handleMeEndpoint(req: VercelRequest, res: VercelResponse) {
  try {
    const method = req.method || 'GET';
    console.log(`🔍 /api/me - Method: ${method}`);

    // Check circuit breaker before attempting database operations
    if (!checkCircuitBreaker()) {
      console.log('❌ Circuit breaker is open, returning cached response');
      return res.status(503).json({ 
        error: 'Service temporarily unavailable',
        circuitBreakerOpen: true 
      });
    }

    const authenticatedUser = await getAuthenticatedUser(req);
    if (!authenticatedUser) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const stackUserId = authenticatedUser.sub;
    console.log('✅ Authenticated user ID:', stackUserId);

    const result = await withCircuitBreaker(async () => {
      const { storage } = await import('../../server/storage');
      
      // Try to get user by Stack Auth ID first (most reliable)
      let user;
      try {
        user = await withDatabaseTimeoutAndRetry(
          () => storage.getUserByStackId(stackUserId),
          null,
          3000,
          2,
          'get-user-by-stack-id'
        );
      } catch (error) {
        recordCircuitBreakerFailure();
        throw error;
      }

      if (!user) {
        console.log('❌ User not found with stackId:', stackUserId);
        return res.status(404).json({ error: 'User not found' });
      }

      console.log('✅ User found:', user.email);

      // Handle different HTTP methods
      if (method === 'PUT' || method === 'PATCH') {
        const updates = req.body;
        console.log('🔄 Updating user with:', updates);
        
        const updatedUser = await withDatabaseTimeoutAndRetry(
          () => storage.updateUser(user.id, updates),
          user,
          3000,
          2,
          'update-user'
        );
        
        return res.status(200).json(updatedUser);
      }

      // Default GET response
      return res.status(200).json(user);
    });

    return result;
  } catch (error) {
    console.error('❌ /api/me error:', error);
    recordCircuitBreakerFailure();
    return res.status(500).json({ 
      error: 'Internal server error', 
      details: (error as Error).message 
    });
  }
}

export async function handleUpdateGender(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const authenticatedUser = await getAuthenticatedUser(req);
    if (!authenticatedUser) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { gender } = req.body;
    if (!gender || !['male', 'female', 'other'].includes(gender)) {
      return res.status(400).json({ error: 'Valid gender is required' });
    }

    const { storage } = await import('../../server/storage');
    const user = await storage.getUserByStackId(authenticatedUser.sub);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const updatedUser = await storage.updateUser(user.id, { gender });
    return res.status(200).json(updatedUser);
  } catch (error) {
    console.error('❌ Update gender error:', error);
    return res.status(500).json({ 
      error: 'Failed to update gender', 
      details: (error as Error).message 
    });
  }
}
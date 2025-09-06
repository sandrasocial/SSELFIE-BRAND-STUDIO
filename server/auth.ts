import type { Express, Request, Response, NextFunction } from "express";
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { storage } from './storage';

// JWT secret (should be in environment variable in production)
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
const JWT_EXPIRES_IN = '7d'; // Token expires in 7 days

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
    plan: string;
  };
}

// Generate JWT token
export function generateToken(user: { id: string; email: string; role: string; plan: string }) {
  return jwt.sign(
    { 
      id: user.id, 
      email: user.email, 
      role: user.role,
      plan: user.plan 
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

// Verify JWT token
export function verifyToken(token: string) {
  try {
    return jwt.verify(token, JWT_SECRET) as any;
  } catch (error) {
    return null;
  }
}

// Hash password
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

// Compare password
export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// Authentication middleware
export const requireAuth = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    const cookieToken = req.cookies?.token;
    
    // Get token from Authorization header or cookie
    const token = authHeader?.startsWith('Bearer ') 
      ? authHeader.substring(7) 
      : cookieToken;

    if (!token) {
      console.log('🔐 Auth: No token found in headers or cookies');
      return res.status(401).json({ message: 'Authentication required' });
    }

    // Verify token
    const decoded = verifyToken(token);
    if (!decoded) {
      console.log('🔐 Auth: Invalid token');
      return res.status(401).json({ message: 'Invalid token' });
    }

    // Get user from database to ensure they still exist and have latest data
    const user = await storage.getUser(decoded.id);
    if (!user) {
      console.log('🔐 Auth: User not found for token');
      return res.status(401).json({ message: 'User not found' });
    }

    // Attach user to request
    req.user = {
      id: user.id,
      email: user.email,
      role: user.role || 'user',
      plan: user.plan || 'sselfie-studio'
    };

    console.log('✅ Auth: User authenticated:', req.user.email);
    next();
  } catch (error) {
    console.error('❌ Auth error:', error);
    return res.status(401).json({ message: 'Authentication failed' });
  }
};

// Optional authentication (doesn't fail if no token)
export const optionalAuth = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    const cookieToken = req.cookies?.token;
    
    const token = authHeader?.startsWith('Bearer ') 
      ? authHeader.substring(7) 
      : cookieToken;

    if (token) {
      const decoded = verifyToken(token);
      if (decoded) {
        const user = await storage.getUser(decoded.id);
        if (user) {
          req.user = {
            id: user.id,
            email: user.email,
            role: user.role || 'user',
            plan: user.plan || 'sselfie-studio'
          };
        }
      }
    }

    next();
  } catch (error) {
    // Don't fail on optional auth
    next();
  }
};

// Check if user has required plan
export const requirePlan = (allowedPlans: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    if (!allowedPlans.includes(req.user.plan)) {
      return res.status(403).json({ 
        message: 'Subscription required', 
        requiredPlans: allowedPlans,
        currentPlan: req.user.plan 
      });
    }

    next();
  };
};

// Setup authentication routes
export function setupAuth(app: Express) {
  // Cookie parsing is already enabled in the main Express app
  // No additional setup needed for JWT auth
  console.log('🔐 JWT Authentication system initialized');
}
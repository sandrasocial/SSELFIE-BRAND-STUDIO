import { Request, Response, NextFunction } from 'express';
import fs from 'fs';

/**
 * Production Safety Middleware
 * Protects critical system files and user data from agent modifications
 */

// Critical files that should never be modified
const PROTECTED_FILES = [
  'package.json',
  'shared/schema.ts',
  'server/index.ts',
  'drizzle.config.ts',
  '.env',
  'vite.config.ts',
  'tsconfig.json',
  'tailwind.config.ts'
];

// Database operations that are forbidden in production
const FORBIDDEN_SQL_OPERATIONS = [
  'DELETE FROM users',
  'DELETE FROM subscriptions',
  'DELETE FROM payments',
  'DROP TABLE',
  'TRUNCATE',
  'ALTER TABLE users',
  'ALTER TABLE subscriptions',
  'UPDATE users SET',
  'UPDATE subscriptions SET'
];

// API endpoints that should not be modified
const PROTECTED_ENDPOINTS = [
  '/api/auth/',
  '/api/payments/',
  '/api/subscriptions/',
  '/api/users/',
  '/api/stripe/',
  '/api/callback'
];

export const productionSafetyMiddleware = (req: Request, res: Response, next: NextFunction) => {
  try {
    // Skip safety checks for GET requests (read-only)
    if (req.method === 'GET') {
      return next();
    }

    // Check if request is trying to access protected endpoints
    const isProtectedEndpoint = PROTECTED_ENDPOINTS.some(endpoint => 
      req.path.startsWith(endpoint)
    );

    if (isProtectedEndpoint) {
      console.warn(`🚨 PRODUCTION SAFETY: Blocked access to protected endpoint: ${req.path}`);
      return res.status(403).json({
        error: 'Protected endpoint',
        message: 'This endpoint is protected for user safety',
        path: req.path
      });
    }

    // Check SQL operations in request body
    if (req.body?.sql_query) {
      const query = req.body.sql_query.toUpperCase();
      const forbiddenOp = FORBIDDEN_SQL_OPERATIONS.find(op => query.includes(op.toUpperCase()));
      
      if (forbiddenOp) {
        console.warn(`🚨 PRODUCTION SAFETY: Blocked dangerous SQL operation: ${forbiddenOp}`);
        return res.status(403).json({
          error: 'Forbidden SQL operation',
          message: 'This operation could affect user data',
          operation: forbiddenOp
        });
      }
    }

    // Check file modification requests
    if (req.body?.file_path || req.body?.path) {
      const filePath = req.body.file_path || req.body.path;
      const isProtected = PROTECTED_FILES.some(file => 
        filePath.includes(file) || filePath.endsWith(file)
      );

      if (isProtected) {
        console.warn(`🚨 PRODUCTION SAFETY: Blocked modification of protected file: ${filePath}`);
        return res.status(403).json({
          error: 'Protected file',
          message: 'This file is critical for system stability',
          file: filePath
        });
      }
    }

    next();
  } catch (error) {
    console.error('Production safety middleware error:', error);
    // Don't block request on middleware error - fail open for availability
    next();
  }
};

// User data protection middleware
export const userDataProtectionMiddleware = (req: Request, res: Response, next: NextFunction) => {
  try {
    // Block any operations that could expose sensitive user data
    if (req.body?.includeUserData || req.query?.includeUsers) {
      console.warn('🚨 USER DATA PROTECTION: Blocked request for sensitive user data');
      return res.status(403).json({
        error: 'User data protection',
        message: 'User data cannot be exposed through this endpoint'
      });
    }

    // Block email or personal info in logs
    if (req.body?.message && typeof req.body.message === 'string') {
      const emailRegex = /[\w\.-]+@[\w\.-]+\.\w+/g;
      if (emailRegex.test(req.body.message)) {
        // Remove emails from message for logging
        req.body.sanitizedMessage = req.body.message.replace(emailRegex, '[EMAIL_REDACTED]');
      }
    }

    next();
  } catch (error) {
    console.error('User data protection middleware error:', error);
    next();
  }
};

// System health monitoring
export const systemHealthCheck = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Only check for critical files that must exist
    const requiredFiles = [
      'package.json',
      'shared/schema.ts',
      'server/index.ts',
      'drizzle.config.ts'
    ];
    
    const missingFiles = requiredFiles.filter(file => !fs.existsSync(file));
    
    if (missingFiles.length > 0) {
      console.error('🚨 SYSTEM HEALTH: Missing critical files:', missingFiles);
      return res.status(500).json({
        error: 'System integrity compromised',
        message: 'Critical system files are missing',
        missingFiles
      });
    }

    // Check if we're in production mode
    if (process.env.NODE_ENV === 'production') {
      // Additional production-only checks
      if (!process.env.DATABASE_URL) {
        console.error('🚨 PRODUCTION: Missing DATABASE_URL');
        return res.status(500).json({
          error: 'Configuration error',
          message: 'Database configuration missing'
        });
      }
    }

    next();
  } catch (error) {
    console.error('System health check error:', error);
    // Continue for availability, but log the error
    next();
  }
};

// Agent operation validator
export const validateAgentOperation = (agentName: string, operation: string, target?: string) => {
  const timestamp = new Date().toISOString();
  
  console.log(`🤖 AGENT OPERATION: ${agentName} performing ${operation} on ${target || 'system'} at ${timestamp}`);

  // Log all agent operations for audit trail
  const logEntry = {
    timestamp,
    agent: agentName,
    operation,
    target,
    safe: true
  };

  // Check if operation is in safe zone
  if (target && PROTECTED_FILES.some(file => target.includes(file))) {
    logEntry.safe = false;
    console.warn(`⚠️ AGENT WARNING: ${agentName} attempting to modify protected file: ${target}`);
    return { allowed: false, reason: 'Protected file modification' };
  }

  return { allowed: true, logEntry };
};
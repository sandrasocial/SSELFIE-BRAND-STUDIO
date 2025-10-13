/**
 * Centralized Environment Variable Configuration
 * 
 * This file provides a single source of truth for all environment variables
 * with proper fallbacks matching what's actually in Vercel.
 * 
 * Vercel Variables (Production):
 * - VITE_STACK_PROJECT_ID (primary)
 * - STACK_AUTH_SECRET_KEY (primary)
 * - STACK_ADMIN_KEY
 * 
 * Fallbacks for local development:
 * - STACK_AUTH_PROJECT_ID → VITE_STACK_PROJECT_ID
 * - STACK_SECRET_SERVER_KEY → STACK_AUTH_SECRET_KEY
 */

// ===========================
// Stack Auth Configuration
// ===========================

/**
 * Stack Auth Project ID
 * Primary: VITE_STACK_PROJECT_ID (what Vercel has)
 * Fallback: STACK_AUTH_PROJECT_ID (local dev)
 */
export const STACK_PROJECT_ID = 
  process.env.VITE_STACK_PROJECT_ID || 
  process.env.STACK_AUTH_PROJECT_ID || 
  '253d7343-a0d4-43a1-be5c-822f590d40be';

// Debug logging for troubleshooting
console.log('[ENV CONFIG] Loaded Stack Auth configuration:', {
  STACK_PROJECT_ID,
  hasVITE_STACK_PROJECT_ID: !!process.env.VITE_STACK_PROJECT_ID,
  hasSTACK_AUTH_PROJECT_ID: !!process.env.STACK_AUTH_PROJECT_ID,
  hasSTACK_AUTH_SECRET_KEY: !!process.env.STACK_AUTH_SECRET_KEY,
  hasSTACK_SECRET_SERVER_KEY: !!process.env.STACK_SECRET_SERVER_KEY,
});

/**
 * Stack Auth Secret Key (for Admin API calls, NOT JWT verification)
 * Primary: STACK_AUTH_SECRET_KEY (what Vercel has)
 * Fallback: STACK_SECRET_SERVER_KEY (old name)
 */
export const STACK_SECRET_KEY = 
  process.env.STACK_AUTH_SECRET_KEY || 
  process.env.STACK_SECRET_SERVER_KEY || 
  '';

/**
 * Stack Admin Key (for admin operations)
 * Used for Stack Auth admin API endpoints
 */
export const STACK_ADMIN_KEY = 
  process.env.STACK_ADMIN_KEY || 
  process.env.STACK_SERVER_KEY || 
  '';

/**
 * Stack Publishable Key (client-side)
 */
export const STACK_PUBLISHABLE_KEY = 
  process.env.VITE_STACK_PUBLISHABLE_CLIENT_KEY || 
  process.env.STACK_PUBLISHABLE_KEY || 
  '';

/**
 * Stack Webhook Secret
 */
export const STACK_WEBHOOK_SECRET = 
  process.env.STACK_WEBHOOK_SECRET || 
  '';

// ===========================
// Stack Auth URLs
// ===========================

export const STACK_AUTH_API_URL = 'https://api.stack-auth.com/api/v1';

export const STACK_JWKS_URL = `${STACK_AUTH_API_URL}/projects/${STACK_PROJECT_ID}/.well-known/jwks.json`;

export const STACK_ISSUER = `${STACK_AUTH_API_URL}/projects/${STACK_PROJECT_ID}`;

// ===========================
// Database Configuration
// ===========================

export const DATABASE_URL = 
  process.env.DATABASE_URL || 
  process.env.NEON_DB_URL || 
  '';

// ===========================
// External Services
// ===========================

export const REPLICATE_API_TOKEN = process.env.REPLICATE_API_TOKEN || '';
export const REPLICATE_USERNAME = process.env.REPLICATE_USERNAME || 'sandrasocial';

export const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || '';

// AWS S3
export const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID || '';
export const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY || '';
export const AWS_S3_REGION = process.env.AWS_S3_REGION || process.env.AWS_REGION || 'us-east-1';
export const AWS_S3_BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME || process.env.AWS_S3_BUCKET || '';

// ===========================
// Payment Processing
// ===========================

export const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || '';
export const STRIPE_PUBLISHABLE_KEY = 
  process.env.VITE_STRIPE_PUBLISHABLE_KEY || 
  process.env.TESTING_VITE_STRIPE_PUBLIC_KEY || 
  '';

// ===========================
// Admin Configuration
// ===========================

export const ADMIN_USER_ID = process.env.ADMIN_USER_ID || '42585527';
export const SHANNON_USER_ID = process.env.SHANNON_USER_ID || '';
export const ADMIN_TOKEN = process.env.ADMIN_TOKEN || '';

// ===========================
// Server Configuration
// ===========================

export const NODE_ENV = process.env.NODE_ENV || 'development';
export const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3001;

// ===========================
// Email & Communication
// ===========================

export const FLODESK_API_KEY = process.env.FLODESK_API_KEY || '';
export const RESEND_API_KEY = process.env.RESEND_API_KEY || '';

// ===========================
// CRM Integration
// ===========================

export const HIGHLEVEL_API_KEY = process.env.HIGHLEVEL_API_KEY || '';

// ===========================
// Social Media
// ===========================

export const INSTAGRAM_BUSINESS_ACCOUNT_ID = process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID || '';
export const META_ACCESS_TOKEN = process.env.META_ACCESS_TOKEN || '';
export const MANYCHAT_API_TOKEN = process.env.MANYCHAT_API_TOKEN || '';
export const MAKE_API_TOKEN = process.env.MAKE_API_TOKEN || '';

// ===========================
// Security
// ===========================

export const JWT_SECRET = process.env.JWT_SECRET || '';
export const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || '';
export const COOKIE_SECRET = process.env.COOKIE_SECRET || '';

// ===========================
// Validation
// ===========================

/**
 * Check if all required environment variables are set
 */
export function validateEnvironment(): { valid: boolean; missing: string[] } {
  const required = {
    STACK_PROJECT_ID,
    DATABASE_URL,
    REPLICATE_API_TOKEN,
    ANTHROPIC_API_KEY,
  };

  const missing: string[] = [];

  Object.entries(required).forEach(([name, value]) => {
    if (!value || value === '') {
      missing.push(name);
    }
  });

  return {
    valid: missing.length === 0,
    missing,
  };
}

/**
 * Get environment variable with fallback
 * @deprecated Use named exports instead
 */
export function getEnv(key: string, fallback: string = ''): string {
  return process.env[key] || fallback;
}

// ===========================
// Export all for convenience
// ===========================

export default {
  // Stack Auth
  STACK_PROJECT_ID,
  STACK_SECRET_KEY,
  STACK_ADMIN_KEY,
  STACK_PUBLISHABLE_KEY,
  STACK_WEBHOOK_SECRET,
  STACK_AUTH_API_URL,
  STACK_JWKS_URL,
  STACK_ISSUER,
  
  // Database
  DATABASE_URL,
  
  // External Services
  REPLICATE_API_TOKEN,
  REPLICATE_USERNAME,
  ANTHROPIC_API_KEY,
  
  // AWS
  AWS_ACCESS_KEY_ID,
  AWS_SECRET_ACCESS_KEY,
  AWS_S3_REGION,
  AWS_S3_BUCKET_NAME,
  
  // Payment
  STRIPE_SECRET_KEY,
  STRIPE_PUBLISHABLE_KEY,
  
  // Admin
  ADMIN_USER_ID,
  SHANNON_USER_ID,
  ADMIN_TOKEN,
  
  // Server
  NODE_ENV,
  PORT,
  
  // Email
  FLODESK_API_KEY,
  RESEND_API_KEY,
  
  // CRM
  HIGHLEVEL_API_KEY,
  
  // Social
  INSTAGRAM_BUSINESS_ACCOUNT_ID,
  META_ACCESS_TOKEN,
  MANYCHAT_API_TOKEN,
  MAKE_API_TOKEN,
  
  // Security
  JWT_SECRET,
  ENCRYPTION_KEY,
  COOKIE_SECRET,
};

/**
 * Environment Variable Validation
 * This file ensures all required environment variables are present and properly typed
 */

interface EnvVars {
  // Database
  NEON_DB_URL: string;
  
  // Authentication
  STACK_AUTH_PROJECT_ID: string;
  STACK_AUTH_SECRET_KEY: string;
  
  // Frontend Public Variables (must be prefixed with VITE_)
  VITE_STACK_PROJECT_ID: string;
  VITE_STACK_PUBLISHABLE_CLIENT_KEY: string;
  
  // AWS S3
  AWS_S3_BUCKET_NAME: string;
  AWS_S3_REGION: string;
  AWS_ACCESS_KEY_ID: string;
  AWS_SECRET_ACCESS_KEY: string;
  
  // Stripe
  STRIPE_SECRET_KEY: string;
  STRIPE_PUBLISHABLE_KEY: string;
  STRIPE_WEBHOOK_SECRET: string;
  
  // Email
  SENDGRID_API_KEY: string;
  SENDGRID_FROM_EMAIL: string;
  
  // VEO 3
  VEO_3_API_KEY: string;
  VEO_3_API_ENDPOINT: string;
  VEO_3_API_VERSION: string;
  
  // Security
  JWT_SECRET: string;
  COOKIE_SECRET: string;
  ENCRYPTION_KEY: string;
  
  // Monitoring
  SENTRY_DSN?: string;
  DATADOG_API_KEY?: string;
  
  // CDN
  CDN_URL: string;
  CDN_API_KEY: string;
  CDN_ZONE_ID: string;
}

export function validateEnv(): EnvVars {
  const requiredVars: (keyof EnvVars)[] = [
    // Database
    'NEON_DB_URL',
    
    // Authentication
    'STACK_AUTH_PROJECT_ID',
    'STACK_AUTH_SECRET_KEY',
    
    // Frontend Public
    'VITE_STACK_PROJECT_ID',
    'VITE_STACK_PUBLISHABLE_CLIENT_KEY',
    
    // AWS S3
    'AWS_S3_BUCKET_NAME',
    'AWS_S3_REGION',
    'AWS_ACCESS_KEY_ID',
    'AWS_SECRET_ACCESS_KEY',
    
    // Stripe
    'STRIPE_SECRET_KEY',
    'STRIPE_PUBLISHABLE_KEY',
    'STRIPE_WEBHOOK_SECRET',
    
    // Email
    'SENDGRID_API_KEY',
    'SENDGRID_FROM_EMAIL',
    
    // VEO 3
    'VEO_3_API_KEY',
    'VEO_3_API_ENDPOINT',
    'VEO_3_API_VERSION',
    
    // Security
    'JWT_SECRET',
    'COOKIE_SECRET',
    'ENCRYPTION_KEY',
    
    // CDN
    'CDN_URL',
    'CDN_API_KEY',
    'CDN_ZONE_ID'
  ];

  const missingVars = requiredVars.filter(
    (varName) => !process.env[varName]
  );

  if (missingVars.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingVars.join(', ')}`
    );
  }

  return process.env as unknown as EnvVars;
}

export const env = validateEnv();
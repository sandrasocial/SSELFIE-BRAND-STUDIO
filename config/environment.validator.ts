import { z } from 'zod';

// Define schema for different environments
const commonEnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']),
  PORT: z.string().transform(Number),
  DATABASE_URL: z.string().url(),
  JWT_SECRET: z.string().min(32),
  STRIPE_SECRET_KEY: z.string().startsWith('sk_'),
  STRIPE_WEBHOOK_SECRET: z.string().startsWith('whsec_'),
  VICTORIA_AI_KEY: z.string(),
  EMAIL_API_KEY: z.string(),
  
  // Additional required configs
  SESSION_SECRET: z.string().min(32),
  CORS_ORIGIN: z.string().url(),
  RATE_LIMIT_WINDOW: z.string().transform(Number).default('900000'),
  RATE_LIMIT_MAX: z.string().transform(Number).default('100'),
  
  // Storage configs
  S3_BUCKET: z.string(),
  AWS_ACCESS_KEY_ID: z.string(),
  AWS_SECRET_ACCESS_KEY: z.string(),
  AWS_REGION: z.string(),

  // Monitoring
  SENTRY_DSN: z.string().url().optional(),
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
});

const productionEnvSchema = commonEnvSchema.extend({
  NODE_ENV: z.literal('production'),
  SSL_KEY_PATH: z.string(),
  SSL_CERT_PATH: z.string(),
  SENTRY_DSN: z.string().url(), // Required in production
});

export function validateEnvironment() {
  const isProd = process.env.NODE_ENV === 'production';
  const schema = isProd ? productionEnvSchema : commonEnvSchema;

  try {
    const env = schema.parse(process.env);
    
    // Additional validation logic
    if (isProd) {
      // Validate SSL certificate existence
      const fs = require('fs');
      if (!fs.existsSync(env.SSL_KEY_PATH) || !fs.existsSync(env.SSL_CERT_PATH)) {
        throw new Error('SSL certificate files not found');
      }
    }

    // Validate database connection string format
    const dbUrlPattern = /^postgres(ql)?:\/\/[^:]+:[^@]+@[^:]+:\d+\/[^?]+(\?.*)?$/;
    if (!dbUrlPattern.test(env.DATABASE_URL)) {
      throw new Error('Invalid database URL format');
    }

    return env;
  } catch (error) {
    console.error('❌ Environment validation failed:', error);
    process.exit(1);
  }
}

export const env = validateEnvironment();
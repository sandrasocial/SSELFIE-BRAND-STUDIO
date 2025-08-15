import { z } from 'zod';
import dotenv from 'dotenv';

// Configuration schema
const configSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']),
  DATABASE_URL: z.string().url(),
  STRIPE_SECRET_KEY: z.string().min(1),
  STRIPE_WEBHOOK_SECRET: z.string().min(1),
  NEW_RELIC_LICENSE_KEY: z.string().min(1),
  AI_API_KEY: z.string().min(1),
  JWT_SECRET: z.string().min(32),
});

export type Config = z.infer<typeof configSchema>;

export const validateConfig = (): Config => {
  dotenv.config();
  
  try {
    const config = configSchema.parse(process.env);
    return config;
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = error.issues.map(issue => issue.path.join('.'));
      throw new Error(`Missing or invalid environment variables: ${missingVars.join(', ')}`);
    }
    throw error;
  }
};

export const getConfig = (): Config => {
  return validateConfig();
};
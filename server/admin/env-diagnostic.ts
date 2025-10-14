import type { VercelRequest, VercelResponse } from '@vercel/node';

export const config = { runtime: 'nodejs' } as const;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    // Check admin authentication
    const adminToken = req.headers['x-admin-token'];
    if (!adminToken || adminToken !== process.env.ADMIN_TOKEN) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Get all environment variables related to database and critical services
    const envDiagnostics = {
      // Database variables (both expected and actual)
      DATABASE_URL: process.env.DATABASE_URL ? 'SET' : 'UNDEFINED',
      NEON_DB_URL: process.env.NEON_DB_URL ? 'SET' : 'UNDEFINED',
      NEON_DB_HOST: process.env.NEON_DB_HOST ? 'SET' : 'UNDEFINED',
      NEON_DB_NAME: process.env.NEON_DB_NAME ? 'SET' : 'UNDEFINED',
      NEON_DB_USER: process.env.NEON_DB_USER ? 'SET' : 'UNDEFINED',
      NEON_DB_PASSWORD: process.env.NEON_DB_PASSWORD ? 'SET' : 'UNDEFINED',

      // Stack Auth variables
      STACK_SECRET_SERVER_KEY: process.env.STACK_SECRET_SERVER_KEY ? 'SET' : 'UNDEFINED',
      STACK_AUTH_SECRET_KEY: process.env.STACK_AUTH_SECRET_KEY ? 'SET' : 'UNDEFINED',
      VITE_STACK_PUBLISHABLE_CLIENT_KEY: process.env.VITE_STACK_PUBLISHABLE_CLIENT_KEY ? 'SET' : 'UNDEFINED',

      // AWS variables
      AWS_REGION: process.env.AWS_REGION ? 'SET' : 'UNDEFINED',
      AWS_S3_REGION: process.env.AWS_S3_REGION ? 'SET' : 'UNDEFINED',
      AWS_S3_BUCKET: process.env.AWS_S3_BUCKET ? 'SET' : 'UNDEFINED',
      AWS_S3_BUCKET_NAME: process.env.AWS_S3_BUCKET_NAME ? 'SET' : 'UNDEFINED',

      // Environment info
      NODE_ENV: process.env.NODE_ENV,
      VERCEL: process.env.VERCEL ? 'SET' : 'UNDEFINED',
      VERCEL_ENV: process.env.VERCEL_ENV,

      // Check if variables starting with these patterns exist
      allEnvKeys: Object.keys(process.env).filter(key =>
        key.includes('DATABASE') ||
        key.includes('NEON') ||
        key.includes('STACK') ||
        key.includes('AWS')
      )
    };

    return res.status(200).json({
      message: 'Environment variables diagnostic',
      timestamp: new Date().toISOString(),
      diagnostics: envDiagnostics
    });

  } catch (error) {
    console.error('Error in env diagnostic:', error);
    return res.status(500).json({
      error: 'Failed to check environment variables',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
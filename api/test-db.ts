// Test the database connection in production
import { DATABASE_URL } from '../server/env.js';

export default async function handler(req: any, res: any) {
  try {
    // Test 1: Check if DATABASE_URL is available
    console.log('TEST: DATABASE_URL present:', !!DATABASE_URL);
    console.log('TEST: DATABASE_URL length:', DATABASE_URL?.length || 0);
    
    if (!DATABASE_URL) {
      return res.status(500).json({
        error: 'DATABASE_URL not found',
        env: {
          DATABASE_URL: !!process.env.DATABASE_URL,
          NEON_DB_URL: !!process.env.NEON_DB_URL,
          NODE_ENV: process.env.NODE_ENV
        }
      });
    }

    // Test 2: Try to import and use the lazy db connection
    const { db } = await import('../server/drizzle.js');
    
    // Test 3: Try a simple query
    const result = await db.execute(`SELECT 1 as test, NOW() as current_time`);
    
    return res.status(200).json({
      success: true,
      message: 'Database connection working!',
      databaseUrl: DATABASE_URL.substring(0, 20) + '...',
      testResult: result,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Database test failed:', error);
    return res.status(500).json({
      error: 'Database test failed',
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
  }
}
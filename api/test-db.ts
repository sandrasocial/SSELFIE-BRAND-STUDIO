// Test the database connection in production - PUBLIC endpoint for debugging
export default async function handler(req: any, res: any) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // Test 1: Check environment variables without importing anything
    const envStatus = {
      NODE_ENV: process.env.NODE_ENV,
      DATABASE_URL_PRESENT: !!process.env.DATABASE_URL,
      DATABASE_URL_LENGTH: process.env.DATABASE_URL?.length || 0,
      NEON_DB_URL_PRESENT: !!process.env.NEON_DB_URL,
      NEON_DB_URL_LENGTH: process.env.NEON_DB_URL?.length || 0,
      VERCEL_ENV: process.env.VERCEL_ENV,
      VERCEL_URL: process.env.VERCEL_URL
    };

    console.log('🔍 Environment status:', envStatus);

    // Test 2: Try importing env.ts
    let envModuleStatus;
    try {
      const { DATABASE_URL } = await import('../server/env.js');
      envModuleStatus = {
        success: true,
        DATABASE_URL_FROM_MODULE: !!DATABASE_URL,
        DATABASE_URL_MODULE_LENGTH: DATABASE_URL?.length || 0
      };
    } catch (envError) {
      envModuleStatus = {
        success: false,
        error: envError instanceof Error ? envError.message : 'Unknown error'
      };
    }

    console.log('🔍 Env module status:', envModuleStatus);

    // Test 3: Try importing drizzle.ts (this will trigger database connection)
    let drizzleStatus;
    try {
      const { db } = await import('../server/drizzle.js');
      const result = await db.execute(`SELECT 1 as test`);
      drizzleStatus = {
        success: true, 
        connectionWorking: true,
        testResult: result
      };
    } catch (drizzleError) {
      drizzleStatus = {
        success: false,
        connectionWorking: false,
        error: drizzleError instanceof Error ? drizzleError.message : 'Unknown error',
        stack: drizzleError instanceof Error ? drizzleError.stack?.split('\n').slice(0, 5).join('\n') : undefined
      };
    }

    console.log('🔍 Drizzle status:', drizzleStatus);

    return res.status(200).json({
      timestamp: new Date().toISOString(),
      envStatus,
      envModuleStatus,
      drizzleStatus,
      message: drizzleStatus.success ? 'Database connection working!' : 'Database connection failed'
    });

  } catch (error) {
    console.error('💥 Test endpoint failed:', error);
    return res.status(500).json({
      error: 'Test endpoint failed',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
}
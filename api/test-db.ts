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

    // Test 4: Check database content - image tables
    let imageDataStatus;
    try {
      const { db } = await import('../server/drizzle.js');
      
      // Count records in image tables
      const aiImagesCount = await db.execute(`SELECT COUNT(*) as count FROM ai_images`);
      const generatedImagesCount = await db.execute(`SELECT COUNT(*) as count FROM generated_images`);
      const usersCount = await db.execute(`SELECT COUNT(*) as count FROM users`);
      
      // Get sample data
      const sampleUsers = await db.execute(`SELECT id, email, plan FROM users LIMIT 3`);
      const sampleAiImages = await db.execute(`SELECT id, user_id, image_url, style, created_at FROM ai_images LIMIT 3`);
      const sampleGeneratedImages = await db.execute(`SELECT id, user_id, category, selected_url, created_at FROM generated_images LIMIT 3`);
      
      imageDataStatus = {
        success: true,
        counts: {
          users: (usersCount.rows?.[0] as any)?.count || 0,
          aiImages: (aiImagesCount.rows?.[0] as any)?.count || 0,
          generatedImages: (generatedImagesCount.rows?.[0] as any)?.count || 0
        },
        sampleData: {
          users: sampleUsers.rows || sampleUsers,
          aiImages: sampleAiImages.rows || sampleAiImages,
          generatedImages: sampleGeneratedImages.rows || sampleGeneratedImages
        }
      };
    } catch (imageError) {
      imageDataStatus = {
        success: false,
        error: imageError instanceof Error ? imageError.message : 'Unknown error'
      };
    }

    console.log('🔍 Image data status:', imageDataStatus);

    return res.status(200).json({
      timestamp: new Date().toISOString(),
      envStatus,
      envModuleStatus,
      drizzleStatus,
      imageDataStatus,
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
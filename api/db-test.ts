import type { VercelRequest, VercelResponse } from '@vercel/node';
import { neon } from '@neondatabase/serverless';

export const config = { 
  runtime: 'nodejs',
  maxDuration: 25
} as const;

/**
 * Minimal Database Connection Test Endpoint
 * 
 * This endpoint performs an isolated test of the Vercel-to-Neon database connection
 * without any dependencies on application logic (storage.ts, stack-auth.ts, etc.)
 * 
 * Purpose: Identify if the 504 timeout is caused by database connection issues
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Step 1: Log the start of the function
  console.log('🧪 DB-TEST: Function started at:', new Date().toISOString());
  console.log('🧪 DB-TEST: Request method:', req.method);
  console.log('🧪 DB-TEST: Request URL:', req.url);

  try {
    // Step 2: Explicitly read DATABASE_URL and log it (partially masked)
    const databaseUrl = process.env.DATABASE_URL;
    
    if (!databaseUrl) {
      console.log('❌ DB-TEST: DATABASE_URL not found in environment variables');
      return res.status(500).json({
        status: 'error',
        step: 'ENV_READ',
        message: 'DATABASE_URL environment variable not found'
      });
    }
    
    // Log DATABASE_URL with partial masking for security
    const urlStart = databaseUrl.substring(0, 15);
    const urlEnd = databaseUrl.substring(databaseUrl.length - 20);
    const maskedLength = databaseUrl.length - 35;
    const maskedUrl = `${urlStart}${'*'.repeat(Math.max(0, maskedLength))}${urlEnd}`;
    
    console.log('✅ DB-TEST: DATABASE_URL found - Length:', databaseUrl.length);
    console.log('✅ DB-TEST: DATABASE_URL preview:', maskedUrl);
    console.log('✅ DB-TEST: DATABASE_URL starts with postgresql://', databaseUrl.startsWith('postgresql://'));

    // Step 3: Attempt to create a new Neon database client
    console.log('🔗 DB-TEST: Creating Neon database client at:', new Date().toISOString());
    
    let sql;
    try {
      sql = neon(databaseUrl, {
        fetchOptions: {
          priority: 'high',
        },
      });
      console.log('✅ DB-TEST: Neon client created successfully');
    } catch (clientError) {
      console.log('❌ DB-TEST: Failed to create Neon client:', (clientError as Error).message);
      return res.status(500).json({
        status: 'error',
        step: 'CLIENT_CREATE',
        message: `Failed to create Neon client: ${(clientError as Error).message}`
      });
    }

    // Step 4: Attempt to execute the simplest possible query
    console.log('⚡ DB-TEST: Executing simple query (SELECT NOW()) at:', new Date().toISOString());
    
    let queryResult;
    try {
      queryResult = await sql`SELECT NOW() as current_time`;
      console.log('✅ DB-TEST: Query executed successfully at:', new Date().toISOString());
      console.log('✅ DB-TEST: Query result:', queryResult);
    } catch (queryError) {
      console.log('❌ DB-TEST: Query execution failed:', (queryError as Error).message);
      console.log('❌ DB-TEST: Query error stack:', (queryError as Error).stack);
      return res.status(500).json({
        status: 'error',
        step: 'QUERY_EXECUTE',
        message: `Query execution failed: ${(queryError as Error).message}`,
        errorType: (queryError as Error).name
      });
    }

    // Step 5: Return success response
    console.log('🎉 DB-TEST: All steps completed successfully at:', new Date().toISOString());
    
    return res.status(200).json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      databaseUrl: {
        present: true,
        length: databaseUrl.length,
        startsWithPostgresql: databaseUrl.startsWith('postgresql://'),
        preview: maskedUrl
      },
      query: {
        executed: true,
        result: queryResult?.[0] || null
      },
      performance: {
        functionStarted: new Date().toISOString()
      }
    });

  } catch (error) {
    // Catch any unexpected errors
    console.log('💥 DB-TEST: Unexpected error occurred:', (error as Error).message);
    console.log('💥 DB-TEST: Error stack:', (error as Error).stack);
    
    return res.status(500).json({
      status: 'error',
      step: 'UNEXPECTED',
      message: `Unexpected error: ${(error as Error).message}`,
      errorType: (error as Error).name,
      timestamp: new Date().toISOString()
    });
  }
}
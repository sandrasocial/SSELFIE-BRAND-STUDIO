import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Pool } from '@neondatabase/serverless';

export const config = { 
  runtime: 'nodejs',
  maxDuration: 25
} as const;

/**
 * Aggressive Database Connection Test Endpoint
 * 
 * This endpoint uses aggressive timeouts to force faster failures
 * and reveal specific network/connection errors between Vercel and Neon
 * instead of waiting for generic 504 timeouts.
 * 
 * Purpose: Get real error messages from the database client
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Step 1: Log the start of the function
  console.log('🔥 AGGRESSIVE DB-TEST: Function started at:', new Date().toISOString());
  console.log('🔥 AGGRESSIVE DB-TEST: Request method:', req.method);
  console.log('🔥 AGGRESSIVE DB-TEST: Request URL:', req.url);

  try {
    // Step 2: Check DATABASE_URL
    const databaseUrl = process.env.DATABASE_URL;
    
    if (!databaseUrl) {
      console.log('❌ AGGRESSIVE DB-TEST: DATABASE_URL not found in environment variables');
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
    
    console.log('✅ AGGRESSIVE DB-TEST: DATABASE_URL found - Length:', databaseUrl.length);
    console.log('✅ AGGRESSIVE DB-TEST: DATABASE_URL preview:', maskedUrl);

    // Step 3: Create Pool client with aggressive timeout settings
    console.log('🔗 AGGRESSIVE DB-TEST: Creating Pool client with aggressive timeouts at:', new Date().toISOString());
    
    let client;
    try {
      client = new Pool({
        connectionString: databaseUrl,
        // Force the connection to timeout quickly if it can't connect
        connectionTimeoutMillis: 5000, // 5 seconds
        idleTimeoutMillis: 5000, // 5 seconds idle timeout
        max: 1, // Only one connection for this test
        min: 0, // No minimum connections
        allowExitOnIdle: true,
      });
      
      console.log('✅ AGGRESSIVE DB-TEST: Pool client created successfully');
    } catch (clientError) {
      console.log('❌ AGGRESSIVE DB-TEST: Failed to create Pool client:', (clientError as Error).message);
      console.log('❌ AGGRESSIVE DB-TEST: Client error stack:', (clientError as Error).stack);
      return res.status(500).json({
        status: 'error',
        step: 'CLIENT_CREATE',
        message: `Failed to create Pool client: ${(clientError as Error).message}`,
        errorType: (clientError as Error).name
      });
    }

    // Step 4: Execute query with aggressive timeout
    console.log('⚡ AGGRESSIVE DB-TEST: Executing query with aggressive timeout at:', new Date().toISOString());
    
    let queryResult;
    const queryStartTime = Date.now();
    
    try {
      // Set a query timeout as well
      const queryPromise = client.query('SELECT NOW() as current_time, version() as db_version');
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Query timeout after 5 seconds')), 5000);
      });
      
      queryResult = await Promise.race([queryPromise, timeoutPromise]);
      const queryDuration = Date.now() - queryStartTime;
      
      console.log('✅ AGGRESSIVE DB-TEST: Query executed successfully at:', new Date().toISOString());
      console.log('✅ AGGRESSIVE DB-TEST: Query duration:', queryDuration, 'ms');
      console.log('✅ AGGRESSIVE DB-TEST: Query result:', queryResult.rows);
      
    } catch (queryError) {
      const queryDuration = Date.now() - queryStartTime;
      console.log('❌ AGGRESSIVE DB-TEST: Query execution failed after:', queryDuration, 'ms');
      console.log('❌ AGGRESSIVE DB-TEST: Query error message:', (queryError as Error).message);
      console.log('❌ AGGRESSIVE DB-TEST: Query error name:', (queryError as Error).name);
      console.log('❌ AGGRESSIVE DB-TEST: Query error stack:', (queryError as Error).stack);
      
      // Check if it's a timeout vs connection error
      const isTimeoutError = (queryError as Error).message.includes('timeout') || 
                            (queryError as Error).message.includes('Query timeout');
      const isConnectionError = (queryError as Error).message.includes('connect') || 
                               (queryError as Error).message.includes('ECONNREFUSED') ||
                               (queryError as Error).message.includes('ENOTFOUND') ||
                               (queryError as Error).message.includes('ECONNRESET');
      
      return res.status(500).json({
        status: 'error',
        step: 'QUERY_EXECUTE',
        message: `Query execution failed: ${(queryError as Error).message}`,
        errorType: (queryError as Error).name,
        duration: queryDuration,
        errorCategory: isTimeoutError ? 'TIMEOUT' : isConnectionError ? 'CONNECTION' : 'UNKNOWN',
        timestamp: new Date().toISOString()
      });
    } finally {
      // Clean up the client
      try {
        await client.end();
        console.log('✅ AGGRESSIVE DB-TEST: Pool client closed successfully');
      } catch (closeError) {
        console.log('⚠️ AGGRESSIVE DB-TEST: Error closing Pool client:', (closeError as Error).message);
      }
    }

    // Step 5: Return detailed success response
    console.log('🎉 AGGRESSIVE DB-TEST: All steps completed successfully at:', new Date().toISOString());
    
    return res.status(200).json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      databaseUrl: {
        present: true,
        length: databaseUrl.length,
        startsWithPostgresql: databaseUrl.startsWith('postgresql://'),
        preview: maskedUrl
      },
      connection: {
        clientType: 'Pool',
        timeoutConfig: {
          connectionTimeoutMillis: 5000,
          idleTimeoutMillis: 5000,
          queryTimeoutMs: 5000
        }
      },
      query: {
        executed: true,
        result: queryResult?.rows?.[0] || null,
        rowCount: queryResult?.rowCount || 0
      },
      performance: {
        functionStarted: new Date().toISOString(),
        aggressiveTimeouts: true
      }
    });

  } catch (error) {
    // Catch any unexpected errors
    console.log('💥 AGGRESSIVE DB-TEST: Unexpected error occurred:', (error as Error).message);
    console.log('💥 AGGRESSIVE DB-TEST: Error name:', (error as Error).name);
    console.log('💥 AGGRESSIVE DB-TEST: Error stack:', (error as Error).stack);
    
    return res.status(500).json({
      status: 'error',
      step: 'UNEXPECTED',
      message: `Unexpected error: ${(error as Error).message}`,
      errorType: (error as Error).name,
      timestamp: new Date().toISOString()
    });
  }
}
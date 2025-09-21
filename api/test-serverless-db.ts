import type { VercelRequest, VercelResponse } from '@vercel/node';
import { db, query, checkDatabaseHealth, cleanup, transaction } from '../server/db';

export const config = { 
  runtime: 'nodejs',
  maxDuration: 15
} as const;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const testResults = {
    timestamp: new Date().toISOString(),
    tests: [] as any[],
    summary: {
      total: 0,
      passed: 0,
      failed: 0,
      serverlessOptimized: true
    }
  };

  // Helper function to add test result
  const addTest = (name: string, success: boolean, duration: number, details: any = {}) => {
    testResults.tests.push({
      name,
      success,
      duration: `${duration}ms`,
      details,
      timestamp: new Date().toISOString()
    });
    testResults.summary.total++;
    if (success) testResults.summary.passed++;
    else testResults.summary.failed++;
  };

  try {
    console.log('🧪 Running comprehensive Neon serverless tests...');

    // Test 1: Basic Health Check
    const healthStart = Date.now();
    try {
      const health = await checkDatabaseHealth();
      addTest('Health Check', health.healthy, Date.now() - healthStart, {
        latency: health.latency,
        error: health.error
      });
    } catch (error) {
      addTest('Health Check', false, Date.now() - healthStart, {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }

    // Test 2: HTTP Query Function
    const httpQueryStart = Date.now();
    try {
      const result = await query('SELECT NOW() as current_time, \'HTTP Query\' as connection_type');
      addTest('HTTP Query Function', Array.isArray(result.rows) && result.rows.length > 0, Date.now() - httpQueryStart, {
        rowCount: result.rows?.length || 0,
        connectionType: result.rows?.[0]?.connection_type
      });
    } catch (error) {
      addTest('HTTP Query Function', false, Date.now() - httpQueryStart, {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }

    // Test 3: Drizzle ORM with HTTP
    const drizzleStart = Date.now();
    try {
      const result = await db.execute(db.sql`SELECT 'Drizzle HTTP' as test_name, CURRENT_TIMESTAMP as test_time`);
      addTest('Drizzle ORM HTTP', result.rows.length > 0, Date.now() - drizzleStart, {
        rowCount: result.rows.length,
        testName: result.rows[0]?.test_name
      });
    } catch (error) {
      addTest('Drizzle ORM HTTP', false, Date.now() - drizzleStart, {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }

    // Test 4: Multiple Rapid Queries (serverless optimization test)
    const rapidStart = Date.now();
    try {
      const promises = Array.from({ length: 5 }, (_, i) => 
        query(`SELECT ${i + 1} as query_number, NOW() as query_time`)
      );
      const results = await Promise.all(promises);
      const allSuccessful = results.every(r => r.rows && r.rows.length > 0);
      addTest('Rapid Concurrent Queries', allSuccessful, Date.now() - rapidStart, {
        queryCount: promises.length,
        allSuccessful,
        averageLatency: `${(Date.now() - rapidStart) / promises.length}ms`
      });
    } catch (error) {
      addTest('Rapid Concurrent Queries', false, Date.now() - rapidStart, {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }

    // Test 5: Connection cleanup (important for serverless)
    const cleanupStart = Date.now();
    try {
      await cleanup();
      addTest('Connection Cleanup', true, Date.now() - cleanupStart, {
        message: 'Cleanup completed successfully'
      });
    } catch (error) {
      addTest('Connection Cleanup', false, Date.now() - cleanupStart, {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }

    // Determine overall status
    const allTestsPassed = testResults.summary.failed === 0;
    const responseCode = allTestsPassed ? 200 : 503;

    console.log(`✅ Test Results: ${testResults.summary.passed}/${testResults.summary.total} passed`);

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 'no-store, max-age=0');
    
    return res.status(responseCode).json({
      success: allTestsPassed,
      message: allTestsPassed ? 'All Neon serverless tests passed!' : 'Some tests failed',
      ...testResults
    });

  } catch (error) {
    console.error('❌ Test suite error:', error);

    // Ensure cleanup on error
    try {
      await cleanup();
    } catch (cleanupError) {
      console.error('❌ Cleanup error:', cleanupError);
    }

    return res.status(500).json({
      success: false,
      message: 'Test suite encountered an error',
      error: error instanceof Error ? error.message : 'Unknown error',
      ...testResults
    });
  }
}
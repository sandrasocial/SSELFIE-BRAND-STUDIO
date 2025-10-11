// Re-export from drizzle.ts to maintain compatibility
// This file exists for legacy compatibility with migration-monitor.ts
export { db } from './drizzle.js';
import { db } from './drizzle.js';
import { sql } from 'drizzle-orm';

// Export query function using existing drizzle connection
export const query = async (text: string, params?: unknown[]) => {
  try {
    // Use sql template literal instead of sql.raw for better type safety
    if (params && params.length > 0) {
      // For parameterized queries, we need to use a different approach
      const sqlQuery = sql`${sql.raw(text)}`;
      return await db.execute(sqlQuery);
    } else {
      // For simple queries without parameters
      return await db.execute(sql`${sql.raw(text)}`);
    }
  } catch (error) {
    console.error('❌ Database query error:', error);
    throw error;
  }
};

// Pool query function (alias for consistency)
export const poolQuery = query;

// Database health check utility
export async function checkDatabaseHealth(): Promise<{ healthy: boolean; latency?: number; error?: string }> {
  const start = Date.now();
  try {
    const result = await db.execute(sql`SELECT 1 as health_check`);
    const latency = Date.now() - start;
    return {
      healthy: true,
      latency,
    };
  } catch (error) {
    return {
      healthy: false,
      error: error instanceof Error ? error.message : 'Unknown database error',
      latency: Date.now() - start
    };
  }
}

// Transaction helper
export const transaction = db.transaction.bind(db);

// Cleanup function for serverless environments (no-op since drizzle.ts handles this)
export const cleanup = async () => {
  // Connection cleanup is handled by drizzle.ts
  console.log('✅ Database cleanup delegated to drizzle.ts');
};
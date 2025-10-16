// Re-export from drizzle.ts to maintain compatibility
// This file exists for legacy compatibility with migration-monitor.ts
export { db } from './drizzle.js';
import { db } from './drizzle.js';
import { sql } from 'drizzle-orm';
import { neon } from '@neondatabase/serverless';
import { DATABASE_URL } from './env.js';

// Get neon client for raw queries
function getNeonClient() {
  const dbUrl = DATABASE_URL || process.env.DATABASE_URL || process.env.NEON_DB_URL;
  if (!dbUrl) {
    throw new Error('No database connection string available');
  }
  return neon(dbUrl);
}

// Export query function using neon client for raw SQL with parameters
export const query = async (text: string, params?: unknown[]) => {
  try {
    const client = getNeonClient();
    // Convert string to template string for neon client
    const templateString = text as unknown as TemplateStringsArray;
    return await client(templateString, ...(params || []));
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
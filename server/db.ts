import { Pool } from 'pg';
import { DATABASE_URL } from './env.js';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from '../shared/schema.js';

export const pool = new Pool({
  connectionString: DATABASE_URL,
  max: 10,
  min: 2,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000, // Reduced from 10000ms to 5000ms for faster failures
  query_timeout: 8000, // Reduced from 15000ms to 8000ms for faster query failures
  statement_timeout: 8000, // Reduced from 15000ms to 8000ms
  ssl: { rejectUnauthorized: false },
});

// Add connection error handling
pool.on('error', (err) => {
  console.error('❌ Unexpected database pool error:', err);
});

pool.on('connect', () => {
  console.log('✅ Database connection established');
});

pool.on('acquire', () => {
  console.log('🔄 Database connection acquired from pool');
});

pool.on('remove', () => {
  console.log('🗑️ Database connection removed from pool');
});

export const query = (text: string, params?: any[]) => pool.query(text, params);

// Database health check utility
export async function checkDatabaseHealth(): Promise<{ healthy: boolean; latency?: number; error?: string }> {
  const start = Date.now();
  try {
    await query('SELECT 1');
    const latency = Date.now() - start;
    return { healthy: true, latency };
  } catch (error) {
    return { 
      healthy: false, 
      error: error instanceof Error ? error.message : 'Unknown database error',
      latency: Date.now() - start
    };
  }
}

// Export drizzle db instance for ORM operations
export const db = drizzle(pool, { schema });
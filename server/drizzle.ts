/// <reference path="../shared/types/global.d.ts" />
// Correct Drizzle 0.42.0 + Neon WebSocket Pool initialization
import { drizzle } from 'drizzle-orm/neon-serverless';
import { Pool, neonConfig } from '@neondatabase/serverless';
import type { QueryResult as NeonQueryResult } from '@neondatabase/serverless';
import { DATABASE_URL } from './env.js';
import * as schema from '../shared/schema.js';
import * as ws from 'ws';

// Configure WebSocket for Node.js environment
if (typeof window === 'undefined') {
  neonConfig.webSocketConstructor = ws.WebSocket;
}

export interface QueryResult<T = unknown> {
  rows: T[];
  rowCount: number;
  command: string;
  oid?: number;
  fields?: any[];
}

export type QueryParams = string | number | boolean | null | Buffer | Date | QueryParams[];

// Lazy initialization to ensure environment variables are loaded
let _pool: Pool | null = null;
let _db: any = null;

export function getPool() {
  if (!_pool) {
    // Check environment variables dynamically to handle Vercel serverless timing
    const dbUrl = DATABASE_URL || process.env.DATABASE_URL || process.env.NEON_DB_URL;
    console.log('🔍 Database connection check:', {
      DATABASE_URL_FROM_ENV: !!DATABASE_URL,
      PROCESS_ENV_DATABASE_URL: !!process.env.DATABASE_URL,
      PROCESS_ENV_NEON_DB_URL: !!process.env.NEON_DB_URL,
      FINAL_DB_URL: !!dbUrl,
      NODE_ENV: process.env.NODE_ENV
    });
    
    if (!dbUrl) {
      throw new Error(`No database connection string available. DATABASE_URL=${!!DATABASE_URL}, process.env.DATABASE_URL=${!!process.env.DATABASE_URL}, process.env.NEON_DB_URL=${!!process.env.NEON_DB_URL}, NODE_ENV=${process.env.NODE_ENV}`);
    }
    
    // Use WebSocket Pool for Drizzle compatibility - correct constructor
    _pool = new Pool({ connectionString: dbUrl });
    
    console.log('✅ Database Pool connection established successfully');
  }
  return _pool;
}

function getDb() {
  if (!_db) {
    // Drizzle ORM 0.42.x with Neon WebSocket Pool
    const pool = getPool();
    _db = drizzle(pool, { schema });
  }
  return _db;
}

// Export lazy-initialized database connection with proper typing
export const db = new Proxy({} as ReturnType<typeof drizzle<typeof schema>>, {
  get(_, prop) {
    const instance = getDb();
    return instance[prop as keyof typeof instance];
  }
});

// Export a serverless-optimized query helper
export const serverlessQuery = async <T = unknown>(
  text: string, 
  params?: QueryParams[]
): Promise<QueryResult<T>> => {
  try {
    // Validate input
    if (!text?.trim()) {
      throw new Error('Query text is required');
    }

    // Get Pool connection with lazy initialization
    const pool = getPool();

    // Execute query using the correct Pool client method
    const client = await pool.connect();
    try {
      const result = await client.query(text, params || []);
      return {
        rows: result.rows || [],
        command: result.command || 'SELECT', 
        rowCount: result.rowCount || 0,
        oid: (result as any).oid || 0,
        fields: (result as any).fields || []
      } as QueryResult<T>;
    } finally {
      client.release();
    }


  } catch (error) {
    console.error('❌ Serverless query error:', error instanceof Error ? error.message : 'Unknown error');
    throw error instanceof Error ? error : new Error('Query execution failed');
  }
};
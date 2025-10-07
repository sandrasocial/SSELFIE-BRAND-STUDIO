/// <reference path="types/global.d.ts" />
// Fixed: Lazy initialization to prevent serverless environment variable timing issues
import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import type { QueryResult as NeonQueryResult } from '@neondatabase/serverless';
import { DATABASE_URL } from './env.js';
import * as schema from '../shared/schema.js';

export interface QueryResult<T = unknown> {
  rows: T[];
  rowCount: number;
  command: string;
  oid?: number;
  fields?: any[];
}

export type QueryParams = string | number | boolean | null | Buffer | Date | QueryParams[];

// Lazy initialization to ensure environment variables are loaded
let _sql: any = null;
let _db: any = null;

function getSql() {
  if (!_sql) {
    const dbUrl = DATABASE_URL;
    if (!dbUrl) {
      throw new Error(`No database connection string available. DATABASE_URL is ${DATABASE_URL}, NEON_DB_URL is ${process.env.NEON_DB_URL || 'undefined'}`);
    }
    _sql = neon(dbUrl, {
      fetchOptions: {
        priority: 'high' // Prioritize database requests
      }
    });
  }
  return _sql;
}

function getDb() {
  if (!_db) {
    _db = drizzle(getSql(), { schema });
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

    // Get sql connection with lazy initialization
    const sql = getSql();

    // Execute query with proper type handling
    const result = params?.length 
      ? await sql.query(text, params)
      : await sql`${sql.unsafe(text)}`;

    // Ensure result structure - convert array results to QueryResult format
    if (Array.isArray(result)) {
      return {
        rows: result,
        command: 'SELECT',
        rowCount: result.length,
        oid: 0,
        fields: []
      } as QueryResult<T>;
    }

    // Cast to proper type if already in correct format
    const queryResult = result as unknown as NeonQueryResult;

    return {
      rows: queryResult.rows || [],
      command: (queryResult as any).command || 'SELECT',
      rowCount: queryResult.rowCount || 0,
      oid: (queryResult as any).oid || 0,
      fields: (queryResult as any).fields || []
    } as QueryResult<T>;
  } catch (error) {
    console.error('❌ Serverless query error:', error instanceof Error ? error.message : 'Unknown error');
    throw error instanceof Error ? error : new Error('Query execution failed');
  }
};
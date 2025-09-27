import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import type { QueryResult as NeonQueryResult } from '@neondatabase/serverless';
import { DATABASE_URL } from './env';
import * as schema from '../shared/schema';

export interface QueryResult<T = unknown> {
  rows: T[];
  rowCount: number;
  command: string;
}

export type QueryParams = string | number | boolean | null | Buffer | Date | QueryParams[];

// Use HTTP-based connection for drizzle operations (optimal for serverless)
const sql = neon(DATABASE_URL!, {
  fetchOptions: {
    priority: 'high' // Prioritize database requests
  }
});

export const db = drizzle(sql, { schema });

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

    // Execute query with proper type handling
    const result = (params?.length 
      ? await sql.query(text, params)
      : await sql`${sql.unsafe(text)}`) as NeonQueryResult;

    // Ensure result structure
    if (!result || typeof result !== 'object') {
      throw new Error('Invalid query result structure');
    }

    return {
      rows: Array.isArray(result) ? result : [],
      rowCount: Array.isArray(result) ? result.length : 0,
      command: (result as any)?.command || ''
    } as QueryResult<T>;
  } catch (error) {
    console.error('❌ Serverless query error:', error instanceof Error ? error.message : 'Unknown error');
    throw error instanceof Error ? error : new Error('Query execution failed');
  }
};
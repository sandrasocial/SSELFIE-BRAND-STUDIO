import { drizzle } from 'drizzle-orm/neon-http';
import { neon, NeonHttpDatabase, NeonQueryFunction } from '@neondatabase/serverless';
import { DATABASE_URL } from './env.js';
import * as schema from '../shared/schema.js';

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
    const result = params?.length 
      ? await sql.query(text, params) as QueryResult<T>
      : await sql`${sql.unsafe(text)}` as QueryResult<T>;

    // Ensure result structure
    if (!result || typeof result !== 'object') {
      throw new Error('Invalid query result structure');
    }

    return {
      rows: Array.isArray(result.rows) ? result.rows : [],
      rowCount: typeof result.rowCount === 'number' ? result.rowCount : 0,
      command: typeof result.command === 'string' ? result.command : ''
    };
  } catch (error) {
    console.error('❌ Serverless query error:', error instanceof Error ? error.message : 'Unknown error');
    throw error instanceof Error ? error : new Error('Query execution failed');
  }
};
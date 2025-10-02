/// <reference path="types/global.d.ts" />
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
      command: queryResult.command || 'SELECT',
      rowCount: queryResult.rowCount || 0,
      oid: queryResult.oid || 0,
      fields: queryResult.fields || []
    } as QueryResult<T>;
  } catch (error) {
    console.error('❌ Serverless query error:', error instanceof Error ? error.message : 'Unknown error');
    throw error instanceof Error ? error : new Error('Query execution failed');
  }
};
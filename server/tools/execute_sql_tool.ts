// Execute SQL Tool - Fixed SQL execution for Neon/Drizzle
import { db } from '../drizzle';
import { sql } from 'drizzle-orm';
import { QueryResult } from '../drizzle';

export interface SqlParams {
  sql_query: string;
  environment?: 'development' | 'production' | 'test';
}

export interface SqlExecutionResult {
  headers: string[];
  rows: string[][];
  rowCount: number;
  command: string;
}

export interface SqlError extends Error {
  code?: string;
  position?: number;
  detail?: string;
  hint?: string;
  where?: string;
}

export async function execute_sql_tool(params: SqlParams): Promise<string> {
  try {
    // Validate input
    if (!params.sql_query?.trim()) {
      throw new Error('SQL query is required');
    }

    console.log(`🗄️ SQL EXECUTION: ${params.sql_query.substring(0, 100)}...`);
    
    // Execute raw SQL using Drizzle's sql template function
    const result = await db.execute(sql.raw(params.sql_query)) as QueryResult<Record<string, unknown>>;
    
    // Validate result structure
    if (!result || !Array.isArray(result.rows)) {
      throw new Error('Invalid query result structure');
    }
    
    // Format results for display
    const executionResult: SqlExecutionResult = {
      headers: result.rows.length > 0 ? Object.keys(result.rows[0]) : [],
      rows: result.rows.map(row => Object.values(row).map(v => String(v))),
      rowCount: result.rowCount || 0,
      command: result.command || ''
    };
    
    console.log(`🗄️ EXECUTION STATS:`, {
      command: executionResult.command,
      rowCount: executionResult.rowCount,
      headerCount: executionResult.headers.length
    });
    
    // Format as CSV-like string for output
    if (executionResult.rows.length > 0) {
      const csvOutput = [
        executionResult.headers.join(','),
        ...executionResult.rows.map(row => row.join(','))
      ].join('\n');
      
      console.log(`🗄️ FORMATTED RESULT PREVIEW: ${csvOutput.substring(0, 200)}...`);
      return csvOutput;
    } else {
      const message = `Query executed successfully (${executionResult.command}, no results returned)`;
      console.log(`🗄️ NO RESULTS: ${message}`);
      return message;
    }
  } catch (error) {
    // Enhance error reporting with SQL context
    const sqlError: SqlError = new Error(
      error instanceof Error ? error.message : 'Unknown SQL error'
    );
    
    if (error instanceof Error) {
      sqlError.code = (error as any).code;
      sqlError.position = (error as any).position;
      sqlError.detail = (error as any).detail;
      sqlError.hint = (error as any).hint;
      sqlError.where = (error as any).where;
      sqlError.stack = error.stack;
    }
    
    console.error('❌ SQL ERROR:', {
      message: sqlError.message,
      code: sqlError.code,
      position: sqlError.position,
      detail: sqlError.detail,
      hint: sqlError.hint,
      where: sqlError.where
    });
    
    throw sqlError;
  }
}
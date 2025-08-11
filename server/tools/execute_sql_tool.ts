// Execute SQL Tool - Fixed SQL execution for Neon/Drizzle
import { db } from '../db';
import { sql } from 'drizzle-orm';

export interface SqlParams {
  sql_query: string;
  environment?: 'development';
}

export async function execute_sql_tool(params: SqlParams): Promise<string> {
  try {
    console.log(`🗄️ SQL EXECUTION: ${params.sql_query.substring(0, 100)}...`);
    
    // Execute raw SQL using Drizzle's sql template function
    const results = await db.execute(sql.raw(params.sql_query));
    
    // Format results for display
    if (results && results.length > 0) {
      // Convert to CSV-like format for readability
      const headers = Object.keys(results[0]).join(',');
      const rows = results.map(row => Object.values(row).join(',')).join('\n');
      return `${headers}\n${rows}`;
    } else {
      return 'Query executed successfully (no results returned)';
    }
  } catch (error) {
    console.error('❌ SQL ERROR:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown SQL error';
    throw new Error(`SQL execution failed: ${errorMessage}`);
  }
}
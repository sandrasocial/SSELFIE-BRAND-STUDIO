// Execute SQL Tool - Fixed SQL execution for Neon/Drizzle
import { db } from '../db';
import { sql } from 'drizzle-orm';

export interface SqlParams {
  sql_query: string;
  environment?: 'development';
  userId?: string;
  agentName?: string;
  adminContext?: boolean;
}

export async function execute_sql_tool(params: SqlParams): Promise<string> {
  // AUTHENTICATION CHECK: Ensure admin access for SQL operations
  const isAdminUser = params.userId === '42585527' || params.adminContext === true;
  console.log('🔐 SQL AUTHENTICATION:', { userId: params.userId, agentName: params.agentName, adminAccess: isAdminUser });
  
  if (!isAdminUser) {
    throw new Error('SQL access requires admin authentication');
  }
  try {
    console.log(`🗄️ SQL EXECUTION: ${params.sql_query.substring(0, 100)}...`);
    
    // Execute raw SQL using Drizzle's sql template function
    const result = await db.execute(sql.raw(params.sql_query));
    
    console.log(`🗄️ RAW RESULT TYPE:`, typeof result);
    console.log(`🗄️ RESULT ROWS:`, result.rows);
    console.log(`🗄️ ROWS LENGTH:`, result.rows?.length);
    console.log(`🗄️ CONDITION CHECK: result.rows exists?`, !!result.rows, 'Length > 0?', result.rows && result.rows.length > 0);
    
    // Format results for display - Drizzle returns { rows: [...] }
    if (result.rows && result.rows.length > 0) {
      // Convert to CSV-like format for readability
      const headers = Object.keys(result.rows[0]).join(',');
      const rows = result.rows.map(row => Object.values(row).join(',')).join('\n');
      console.log(`🗄️ FORMATTED RESULT: ${headers}\\n${rows.substring(0, 200)}...`);
      return `${headers}\n${rows}`;
    } else {
      console.log(`🗄️ NO RESULTS: Query returned empty rows array`);
      return 'Query executed successfully (no results returned)';
    }
  } catch (error) {
    console.error('❌ SQL ERROR:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown SQL error';
    throw new Error(`SQL execution failed: ${errorMessage}`);
  }
}
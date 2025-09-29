// Execute SQL Tool - Fixed SQL execution for Neon/Drizzle
import { db } from '../drizzle.js';
import { sql } from 'drizzle-orm';
export async function execute_sql_tool(params) {
    try {
        // Validate input
        if (!params.sql_query?.trim()) {
            throw new Error('SQL query is required');
        }
        console.log(`🗄️ SQL EXECUTION: ${params.sql_query.substring(0, 100)}...`);
        // Execute raw SQL using Drizzle's sql template function
        const result = await db.execute(sql.raw(params.sql_query));
        // Validate result structure
        if (!result || !Array.isArray(result.rows)) {
            throw new Error('Invalid query result structure');
        }
        // Format results for display
        const executionResult = {
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
        }
        else {
            const message = `Query executed successfully (${executionResult.command}, no results returned)`;
            console.log(`🗄️ NO RESULTS: ${message}`);
            return message;
        }
    }
    catch (error) {
        // Enhance error reporting with SQL context
        const sqlError = new Error(error instanceof Error ? error.message : 'Unknown SQL error');
        if (error instanceof Error) {
            sqlError.code = error.code;
            sqlError.position = error.position;
            sqlError.detail = error.detail;
            sqlError.hint = error.hint;
            sqlError.where = error.where;
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

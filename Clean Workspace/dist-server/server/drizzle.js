import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import { DATABASE_URL } from './env.js';
import * as schema from '../shared/schema.js';
// Use HTTP-based connection for drizzle operations (optimal for serverless)
const sql = neon(DATABASE_URL, {
    fetchOptions: {
        priority: 'high' // Prioritize database requests
    }
});
export const db = drizzle(sql, { schema });
// Export a serverless-optimized query helper
export const serverlessQuery = async (text, params) => {
    try {
        // Validate input
        if (!text?.trim()) {
            throw new Error('Query text is required');
        }
        // Execute query with proper type handling
        const result = params?.length
            ? await sql.query(text, params)
            : await sql `${sql.unsafe(text)}`;
        // Ensure result structure - convert array results to QueryResult format
        if (Array.isArray(result)) {
            return {
                rows: result,
                command: 'SELECT',
                rowCount: result.length,
                oid: 0,
                fields: []
            };
        }
        // Cast to proper type if already in correct format
        const queryResult = result;
        return {
            rows: queryResult.rows || [],
            command: queryResult.command || 'SELECT',
            rowCount: queryResult.rowCount || 0,
            oid: queryResult.oid || 0,
            fields: queryResult.fields || []
        };
    }
    catch (error) {
        console.error('❌ Serverless query error:', error instanceof Error ? error.message : 'Unknown error');
        throw error instanceof Error ? error : new Error('Query execution failed');
    }
};

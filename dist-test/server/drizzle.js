/// <reference path="types/global.d.ts" />
import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import { DATABASE_URL } from './env.js';
import * as schema from '../shared/schema.js';
// Lazy initialization to ensure environment variables are loaded
let _sql = null;
let _db = null;
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
// Export lazy-initialized database connection
export const db = new Proxy({}, {
    get(_, prop) {
        return getDb()[prop];
    }
});
// Export a serverless-optimized query helper
export const serverlessQuery = async (text, params) => {
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

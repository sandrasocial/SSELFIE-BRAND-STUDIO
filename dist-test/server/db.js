import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { DATABASE_URL } from './env.js';
import * as schema from '../shared/schema.js';
import * as ws from 'ws';
// Configure WebSocket for Node.js environment (required for Pool connections)
neonConfig.webSocketConstructor = ws.WebSocket;
// WebSocket-based pool for all database operations
let wsPool = null;
// Create WebSocket pool - uses the same pattern as drizzle.ts
export const getWebSocketPool = () => {
    if (!wsPool) {
        wsPool = new Pool({
            connectionString: DATABASE_URL,
            max: 5, // Reduced for serverless
            idleTimeoutMillis: 10000, // Shorter idle timeout for serverless
            connectionTimeoutMillis: 5000,
        });
        // Add connection error handling
        wsPool.on('error', (err) => {
            console.error('❌ Unexpected WebSocket pool error:', err);
        });
    }
    return wsPool;
};
// Export query function using WebSocket Pool (matches drizzle.ts pattern)
export const query = async (text, params) => {
    const pool = getWebSocketPool();
    try {
        return await pool.query(text, params);
    }
    catch (error) {
        console.error('❌ Database query error:', error);
        throw error;
    }
};
// Pool query function (alias for consistency)
export const poolQuery = query;
// Database health check utility using WebSocket Pool
export async function checkDatabaseHealth() {
    const start = Date.now();
    try {
        const result = await query('SELECT 1 as health_check');
        const latency = Date.now() - start;
        return {
            healthy: true,
            latency,
        };
    }
    catch (error) {
        return {
            healthy: false,
            error: error instanceof Error ? error.message : 'Unknown database error',
            latency: Date.now() - start
        };
    }
}
// WebSocket-based drizzle instance using the same pattern as drizzle.ts
export const db = drizzle(getWebSocketPool(), { schema });
// Transaction helper using WebSocket Pool
export const transaction = db.transaction.bind(db);
// Cleanup function for serverless environments
export const cleanup = async () => {
    if (wsPool) {
        try {
            await wsPool.end();
            wsPool = null;
        }
        catch (error) {
            console.error('❌ Error cleaning up database connections:', error);
        }
    }
};

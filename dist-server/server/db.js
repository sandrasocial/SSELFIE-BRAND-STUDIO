import { neon, Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { drizzle as drizzleWs } from 'drizzle-orm/neon-serverless';
import { DATABASE_URL } from './env.js';
import * as schema from '../shared/schema.js';
import * as ws from 'ws';
neonConfig.webSocketConstructor = ws.WebSocket;
const sql = neon(DATABASE_URL, {
    fetchOptions: {
        priority: 'high',
    },
});
let wsPool = null;
export const getWebSocketPool = () => {
    if (!wsPool) {
        wsPool = new Pool({
            connectionString: DATABASE_URL,
            max: 5,
            idleTimeoutMillis: 10000,
            connectionTimeoutMillis: 5000,
        });
        wsPool.on('error', (err) => {
            console.error('❌ Unexpected WebSocket pool error:', err);
        });
    }
    return wsPool;
};
export const query = async (text, params) => {
    try {
        if (params && params.length > 0) {
            return await sql.query(text, params);
        }
        else {
            return await sql `${sql.unsafe(text)}`;
        }
    }
    catch (error) {
        console.error('❌ Database query error:', error);
        throw error;
    }
};
export const poolQuery = async (text, params) => {
    const pool = getWebSocketPool();
    try {
        return await pool.query(text, params);
    }
    finally {
    }
};
export async function checkDatabaseHealth() {
    const start = Date.now();
    try {
        const result = await sql `SELECT 1 as health_check`;
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
export const db = drizzle(sql, { schema });
export const dbWs = drizzleWs(getWebSocketPool(), { schema });
export const transaction = async (callback, options) => {
    const queries = [];
    let result;
    const txProxy = new Proxy(db, {
        get(target, prop) {
            const value = target[prop];
            if (typeof value === 'function') {
                return (...args) => {
                    const query = value.apply(target, args);
                    queries.push(query);
                    return query;
                };
            }
            return value;
        }
    });
    try {
        result = await callback(txProxy);
        if (queries.length > 1) {
            await sql.transaction(queries, options);
        }
        return result;
    }
    catch (error) {
        console.error('❌ Transaction error:', error);
        throw error;
    }
};
export const cleanup = async () => {
    if (wsPool) {
        try {
            await wsPool.end();
            wsPool = null;
            console.log('✅ Database connections cleaned up');
        }
        catch (error) {
            console.error('❌ Error cleaning up database connections:', error);
        }
    }
};
//# sourceMappingURL=db.js.map
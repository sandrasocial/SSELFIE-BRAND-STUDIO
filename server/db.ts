import { neon, Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { drizzle as drizzleWs } from 'drizzle-orm/neon-serverless';
import { DATABASE_URL } from '.env.js'
import * as schema from '..shared/schema.js';
import ws from 'ws';

// Configure WebSocket for Node.js environment (required for Pool connections)
neonConfig.webSocketConstructor = ws;

// HTTP-based connection for single queries (faster for non-interactive transactions)
const sql = neon(DATABASE_URL!, {
  fetchOptions: {
    priority: 'high',
  },
});

// WebSocket-based pool for interactive transactions and session support
let wsPool: Pool | null = null;

// Create WebSocket pool only when needed to avoid connection issues
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

// Export HTTP-based query function for single queries (recommended for serverless)
export const query = async (text: string, params?: any[]) => {
  try {
    if (params && params.length > 0) {
      // Use parameterized query for safety
      return await sql.query(text, params);
    } else {
      // Use template literal for simple queries
      return await sql`${sql.unsafe(text)}`;
    }
  } catch (error) {
    console.error('❌ Database query error:', error);
    throw error;
  }
};

// Pool query function for when WebSocket connection is needed
export const poolQuery = async (text: string, params?: any[]) => {
  const pool = getWebSocketPool();
  try {
    return await pool.query(text, params);
  } finally {
    // Don't close pool immediately in serverless - let it timeout naturally
  }
};

// Database health check utility optimized for Neon serverless
export async function checkDatabaseHealth(): Promise<{ healthy: boolean; latency?: number; error?: string }> {
  const start = Date.now();
  try {
    // Use HTTP connection for health check (faster for single queries)
    const result = await sql`SELECT 1 as health_check`;
    const latency = Date.now() - start;
    return { 
      healthy: true, 
      latency,
    };
  } catch (error) {
    return { 
      healthy: false, 
      error: error instanceof Error ? error.message : 'Unknown database error',
      latency: Date.now() - start
    };
  }
}

// HTTP-based drizzle instance for single queries (recommended for serverless)
export const db = drizzle(sql, { schema });

// WebSocket-based drizzle instance for interactive transactions
export const dbWs = drizzleWs(getWebSocketPool(), { schema });

// Transaction helper using HTTP (for non-interactive transactions)
export const transaction = async <T>(
  callback: (tx: typeof db) => Promise<T>,
  options?: {
    isolationLevel?: 'ReadUncommitted' | 'ReadCommitted' | 'RepeatableRead' | 'Serializable';
    readOnly?: boolean;
  }
): Promise<T> => {
  // Use Neon's transaction function for HTTP-based transactions
  const queries: any[] = [];
  let result: T;
  
  // Create a proxy to collect queries
  const txProxy = new Proxy(db, {
    get(target, prop) {
      const value = target[prop as keyof typeof target];
      if (typeof value === 'function') {
        return (...args: any[]) => {
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
      // Use Neon's transaction function for multiple queries
      await sql.transaction(queries, options);
    }
    
    return result;
  } catch (error) {
    console.error('❌ Transaction error:', error);
    throw error;
  }
};

// Cleanup function for serverless environments
export const cleanup = async () => {
  if (wsPool) {
    try {
      await wsPool.end();
      wsPool = null;
      console.log('✅ Database connections cleaned up');
    } catch (error) {
      console.error('❌ Error cleaning up database connections:', error);
    }
  }
};
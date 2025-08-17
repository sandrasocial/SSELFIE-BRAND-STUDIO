import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "../shared/schema";

// Configure WebSocket for serverless environment with error handling
neonConfig.webSocketConstructor = ws;

// Add resilient WebSocket error handling to prevent crashes
// WebSocket proxy disabled to fix connection issues

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is required");
}

// Enhanced connection pool with better error recovery
export const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  max: 10, // Reduced max connections to prevent overwhelming
  min: 1,  // Always keep one connection alive
  idleTimeoutMillis: 60000, // Longer idle timeout
  connectionTimeoutMillis: 5000, // Longer connection timeout
  // acquireTimeoutMillis removed - not supported in this pool version
  maxUses: 7500, // Rotate connections
  allowExitOnIdle: false, // Keep pool alive
});

// Add global error handling for the pool
pool.on('error', (err) => {
  console.warn('🔄 Database pool error (non-fatal):', err.message);
  // Don't crash - let the pool reconnect automatically
});

export const db = drizzle({ client: pool, schema });

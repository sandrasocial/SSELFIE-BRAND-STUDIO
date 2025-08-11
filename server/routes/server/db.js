"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.db = exports.pool = void 0;
const serverless_1 = require("@neondatabase/serverless");
const neon_serverless_1 = require("drizzle-orm/neon-serverless");
const ws_1 = require("ws");
const schema = require("@shared/schema");
// Configure WebSocket for serverless environment with error handling
serverless_1.neonConfig.webSocketConstructor = ws_1.default;
// Add resilient WebSocket error handling to prevent crashes
// WebSocket proxy disabled to fix connection issues
if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL environment variable is required");
}
// Enhanced connection pool with better error recovery
exports.pool = new serverless_1.Pool({
    connectionString: process.env.DATABASE_URL,
    max: 10, // Reduced max connections to prevent overwhelming
    min: 1, // Always keep one connection alive
    idleTimeoutMillis: 60000, // Longer idle timeout
    connectionTimeoutMillis: 5000, // Longer connection timeout
    // acquireTimeoutMillis removed - not supported in this pool version
    maxUses: 7500, // Rotate connections
    allowExitOnIdle: false, // Keep pool alive
});
// Add global error handling for the pool
exports.pool.on('error', (err) => {
    console.warn('🔄 Database pool error (non-fatal):', err.message);
    // Don't crash - let the pool reconnect automatically
});
exports.db = (0, neon_serverless_1.drizzle)({ client: exports.pool, schema });

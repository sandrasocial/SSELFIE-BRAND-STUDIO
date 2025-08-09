import { Pool, PoolConfig } from 'pg';

// Database configuration for Drizzle ORM with PostgreSQL
interface DatabaseConfig {
    host: string;
    port: number;
    user: string;
    password: string | undefined;
    database: string;
    ssl?: any;
}

interface PgError extends Error {
    code?: string;
    severity?: string;
    detail?: string;
}

const baseConfig: DatabaseConfig = {
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT || "5432"),
    user: process.env.DB_USER || "postgres",
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || "sselfie_studio",
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
};

// Pool configuration optimized for production
const poolConfig: PoolConfig = {
    ...baseConfig,
    max: 20,
    min: 5,
    idleTimeoutMillis: 10000,
    connectionTimeoutMillis: 60000,
    application_name: 'SSELFIE_STUDIO'
};

// Create single pool instance
const pool = new Pool(poolConfig);

// Enhanced monitoring with proper error typing
pool.on('connect', (client) => {
    console.log(`✅ DB CONNECTED: ${new Date().toISOString()} - Total: ${pool.totalCount}, Idle: ${pool.idleCount}, Waiting: ${pool.waitingCount}`);
});

pool.on('error', (err: PgError, client) => {
    console.error(`❌ DB ERROR: ${new Date().toISOString()}`, {
        message: err.message,
        code: err.code,
        severity: err.severity,
        detail: err.detail
    });
});

// Health check function
export const healthCheck = async () => {
    try {
        const result = await pool.query('SELECT NOW() as server_time');
        return {
            status: 'healthy',
            server_time: result.rows[0].server_time,
            connections: {
                total: pool.totalCount,
                idle: pool.idleCount,
                active: pool.totalCount - pool.idleCount,
                waiting: pool.waitingCount
            }
        };
    } catch (error) {
        return {
            status: 'unhealthy',
            error: error instanceof Error ? error.message : 'Unknown error'
        };
    }
};

// Graceful shutdown
process.on('SIGINT', async () => {
    await pool.end();
    console.log('✅ Database connections closed');
    process.exit(0);
});

export { pool, baseConfig };
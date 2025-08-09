import { DataSourceOptions } from "typeorm";
import { Pool, PoolConfig } from 'pg';

// Health check interface for monitoring
interface DatabaseHealth {
  status: 'healthy' | 'unhealthy';
  response_time?: string;
  server_time?: Date;
  version?: string;
  connections?: {
    total: number;
    idle: number;
    active: number;
    waiting: number;
  };
  error?: string;
  timestamp?: string;
}

// Unified base configuration for both TypeORM and node-postgres
const baseConfig = {
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT || "5432"),
    username: process.env.DB_USER || "postgres",
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || "sselfie_studio",
};

// Production optimization settings
const productionOptimizations = {
    max: 20,
    min: 5,
    idleTimeoutMillis: 10000,
    connectionTimeoutMillis: 60000,
};

// TypeORM specific configuration
export const typeormConfig: DataSourceOptions = {
    type: "postgres",
    ...baseConfig,
    synchronize: false,
    logging: process.env.NODE_ENV === "development",
    entities: ["database/entities/**/*.ts"],
    migrations: ["database/migrations/**/*.ts"],
    subscribers: ["database/subscribers/**/*.ts"],
    migrationsRun: true,
    extra: {
        ...productionOptimizations,
        ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
    }
};

// Enhanced Pool configuration for direct pg access
const poolConfig: PoolConfig = {
    ...baseConfig,
    ...productionOptimizations,
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
    application_name: 'SSELFIE_STUDIO_PROD'
};

// Create pool instance
const pool = new Pool(poolConfig);

// Enhanced monitoring and logging
pool.on('connect', async (client) => {
    console.log(`✅ DB CONNECTED: ${new Date().toISOString()} - Total: ${pool.totalCount}, Idle: ${pool.idleCount}, Waiting: ${pool.waitingCount}`);
    
    // Set session-level optimizations
    try {
        await client.query(`
            SET statement_timeout = '30s';
            SET idle_in_transaction_session_timeout = '10s';
            SET lock_timeout = '5s';
        `);
    } catch (err) {
        console.warn('Session optimization warning:', err instanceof Error ? err.message : 'Unknown error');
    }
});

pool.on('error', (err, client) => {
    console.error(`❌ DB ERROR: ${new Date().toISOString()}`, {
        message: err.message,
        code: err.code,
        severity: err.severity,
        detail: err.detail
    });
});

pool.on('acquire', () => {
    console.log(`🔄 DB ACQUIRE: Connection acquired - Active: ${pool.totalCount - pool.idleCount}`);
});

pool.on('release', (err) => {
    if (err) {
        console.error('❌ DB RELEASE ERROR:', err instanceof Error ? err.message : 'Unknown error');
    }
});

// Enhanced health check function
const healthCheck = async (): Promise<DatabaseHealth> => {
    try {
        const start = Date.now();
        const result = await pool.query('SELECT NOW() as server_time, version() as version');
        const duration = Date.now() - start;
        
        return {
            status: 'healthy',
            response_time: `${duration}ms`,
            server_time: result.rows[0].server_time,
            version: result.rows[0].version.split(' ')[0],
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
            error: error instanceof Error ? error.message : 'Unknown error',
            timestamp: new Date().toISOString()
        };
    }
};

// Graceful shutdown handler
process.on('SIGINT', async () => {
    console.log('🔄 Graceful shutdown initiated...');
    await pool.end();
    console.log('✅ Database connections closed');
    process.exit(0);
});

export { 
    pool, 
    healthCheck, 
    type DatabaseHealth,
    typeormConfig as default 
};
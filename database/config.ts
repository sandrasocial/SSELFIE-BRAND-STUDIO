import { DataSourceOptions } from "typeorm";
import { Pool, PoolConfig } from 'pg';

// Unified configuration that works for both TypeORM and node-postgres
const baseConfig = {
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT || "5432"),
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
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
    // Production optimizations
    extra: {
        max: 20,
        min: 5,
        idleTimeoutMillis: 10000,
        connectionTimeoutMillis: 60000,
    }
};

// Pool configuration for direct pg access when needed
const poolConfig: PoolConfig = {
    ...baseConfig,
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
    max: 20,
    min: 5,
    idleTimeoutMillis: 10000,
    connectionTimeoutMillis: 60000,
    application_name: 'SSELFIE_STUDIO_PROD'
};

// Create pool instance
const pool = new Pool(poolConfig);

// Enhanced monitoring
pool.on('connect', (client) => {
    console.log(`✅ DB CONNECTED: ${new Date().toISOString()} - Total: ${pool.totalCount}, Idle: ${pool.idleCount}, Waiting: ${pool.waitingCount}`);
});

pool.on('error', (err, client) => {
    console.error(`❌ DB ERROR: ${new Date().toISOString()}`, {
        message: err.message,
        code: err.code,
        severity: err.severity,
        detail: err.detail
    });
});

// Graceful shutdown
process.on('SIGINT', async () => {
    await pool.end();
    console.log('✅ Database connections closed');
    process.exit(0);
});

export { pool, typeormConfig as default };
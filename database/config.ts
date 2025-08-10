import { Pool, PoolConfig } from 'pg';
import { DataSourceOptions } from 'typeorm';
import { config as dotenvConfig } from 'dotenv';

dotenvConfig();

// Shared database configuration
const sharedConfig = {
  username: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'sselfie_studio',
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT || '5432', 10),
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
};

// Direct PostgreSQL pool configuration
const poolConfig: PoolConfig = {
  user: sharedConfig.username,
  host: sharedConfig.host,
  database: sharedConfig.database,
  password: sharedConfig.password,
  port: sharedConfig.port,
  ssl: sharedConfig.ssl,

  // Connection Pool Settings
  max: parseInt(process.env.DB_POOL_MAX || '20', 10),
  min: parseInt(process.env.DB_POOL_MIN || '5', 10),
  idleTimeoutMillis: parseInt(process.env.DB_IDLE_TIMEOUT || '30000', 10),
  connectionTimeoutMillis: parseInt(process.env.DB_CONNECT_TIMEOUT || '2000', 10),

  // Query Settings
  statement_timeout: parseInt(process.env.DB_STATEMENT_TIMEOUT || '30000', 10),
  query_timeout: parseInt(process.env.DB_QUERY_TIMEOUT || '10000', 10),

  // Application Name for monitoring
  application_name: process.env.APP_NAME || 'SSELFIE_STUDIO_PROD'
};

// TypeORM Configuration
export const typeormConfig: DataSourceOptions = {
  type: 'postgres',
  ...sharedConfig,
  synchronize: process.env.NODE_ENV !== 'production',
  logging: process.env.DB_LOGGING === 'true',
  entities: ['src/entities/**/*.ts'],
  migrations: ['src/migrations/**/*.ts'],
  subscribers: ['src/subscribers/**/*.ts'],
  maxQueryExecutionTime: parseInt(process.env.DB_QUERY_TIMEOUT || '10000', 10),
  connectTimeoutMS: parseInt(process.env.DB_CONNECT_TIMEOUT || '2000', 10),
  extra: {
    max: parseInt(process.env.DB_POOL_MAX || '20', 10),
    ssl: sharedConfig.ssl
  }
};

// Create PostgreSQL Pool
export const pool = new Pool(poolConfig);

// Enhanced Connection Monitoring
pool.on('connect', async (client) => {
  console.log(`✅ DB CONNECTED: ${new Date().toISOString()} - Total: ${pool.totalCount}, Idle: ${pool.idleCount}, Waiting: ${pool.waitingCount}`);
  
  try {
    await client.query(`
      SET statement_timeout = '${poolConfig.statement_timeout}ms';
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
    console.error('❌ DB RELEASE ERROR:', err.message);
  }
});

// Health Check Function
export const healthCheck = async () => {
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

// Graceful Shutdown
process.on('SIGINT', async () => {
  console.log('🔄 Graceful shutdown initiated...');
  await pool.end();
  console.log('✅ Database connections closed');
  process.exit(0);
});
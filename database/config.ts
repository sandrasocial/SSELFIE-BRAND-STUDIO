import { Pool, PoolConfig } from 'pg';
import { DataSourceOptions } from 'typeorm';
import { config as dotenvConfig } from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

// Load environment variables
dotenvConfig();

// Constants and Types
const SLOW_QUERY_THRESHOLD = parseInt(process.env.SLOW_QUERY_THRESHOLD || '1000', 10);
const SLOW_QUERY_LOG_LIMIT = parseInt(process.env.SLOW_QUERY_LOG_LIMIT || '100', 10);
const MAX_RETRY_ATTEMPTS = parseInt(process.env.DB_MAX_RETRY_ATTEMPTS || '3', 10);

interface QueryMetrics {
  totalQueries: number;
  totalDuration: number;
  slowQueries: Array<{
    sql: string;
    duration: number;
    timestamp: Date;
    stack?: string;
  }>;
  errors: Array<{
    message: string;
    query?: string;
    timestamp: Date;
  }>;
}

// Validate essential environment variables
const requiredEnvVars = ['DB_PASSWORD', 'DB_NAME'];
const missingVars = requiredEnvVars.filter(v => !process.env[v]);
if (missingVars.length) {
    throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
}

// Enhanced SSL configuration with cert validation
const getSslConfig = () => {
  if (process.env.DB_SSL_CERT_PATH && fs.existsSync(process.env.DB_SSL_CERT_PATH)) {
    return {
      ca: fs.readFileSync(process.env.DB_SSL_CERT_PATH).toString(),
      rejectUnauthorized: process.env.NODE_ENV === 'production',
      checkServerIdentity: process.env.DB_SSL_CHECK_IDENTITY === 'true'
    };
  }
  return process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false;
};

// Enhanced shared database configuration
const sharedConfig = {
  username: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT || '5432', 10),
  ssl: getSslConfig(),
  
  // Application metadata
  application_name: `${process.env.APP_NAME || 'SSELFIE_STUDIO'}_${process.env.NODE_ENV || 'development'}_${process.env.INSTANCE_ID || 'main'}`,
  
  // Connection timeouts
  connectTimeoutMS: parseInt(process.env.DB_CONNECT_TIMEOUT || '2000', 10),
  queryTimeoutMS: parseInt(process.env.DB_QUERY_TIMEOUT || '10000', 10)
};

// Enhanced PostgreSQL pool configuration
const poolConfig: PoolConfig = {
  ...sharedConfig,
  
  // Connection Pool Settings
  max: parseInt(process.env.DB_POOL_MAX || '20', 10),
  min: parseInt(process.env.DB_POOL_MIN || '5', 10),
  idleTimeoutMillis: parseInt(process.env.DB_IDLE_TIMEOUT || '30000', 10),
  connectionTimeoutMillis: sharedConfig.connectTimeoutMS,

  // Query Settings
  statement_timeout: parseInt(process.env.DB_STATEMENT_TIMEOUT || '30000', 10),
  query_timeout: sharedConfig.queryTimeoutMS,

  // Connection Management
  keepalive: true,
  keepaliveInitialDelayMillis: 10000,
};

// Enhanced TypeORM Configuration
export const typeormConfig: DataSourceOptions = {
  type: 'postgres',
  ...sharedConfig,
  synchronize: process.env.NODE_ENV !== 'production',
  logging: process.env.DB_LOGGING === 'true',
  entities: ['src/entities/**/*.ts'],
  migrations: ['src/migrations/**/*.ts'],
  subscribers: ['src/subscribers/**/*.ts'],
  maxQueryExecutionTime: sharedConfig.queryTimeoutMS,
  connectTimeoutMS: sharedConfig.connectTimeoutMS,
  extra: {
    max: poolConfig.max,
    ssl: sharedConfig.ssl,
    keepalive: true,
    statement_timeout: poolConfig.statement_timeout
  }
};

// Initialize metrics
const metrics: QueryMetrics = {
  totalQueries: 0,
  totalDuration: 0,
  slowQueries: [],
  errors: []
};

// Create PostgreSQL Pool with enhanced monitoring
const pool = new Pool(poolConfig);

// Enhanced error handling
pool.on('error', (err, client) => {
  const error = {
    message: err.message,
    timestamp: new Date()
  };
  metrics.errors.push(error);
  console.error('Unexpected error on idle client', err);
});

// Query interceptor for metrics
const executeQuery = async (text: string, params: any[]) => {
  const start = Date.now();
  try {
    const result = await pool.query(text, params);
    const duration = Date.now() - start;
    
    metrics.totalQueries++;
    metrics.totalDuration += duration;

    if (duration > SLOW_QUERY_THRESHOLD) {
      metrics.slowQueries.push({
        sql: text,
        duration,
        timestamp: new Date(),
        stack: new Error().stack
      });

      // Maintain slow query log limit
      if (metrics.slowQueries.length > SLOW_QUERY_LOG_LIMIT) {
        metrics.slowQueries.shift();
      }
    }

    return result;
  } catch (error: any) {
    metrics.errors.push({
      message: error.message,
      query: text,
      timestamp: new Date()
    });
    throw error;
  }
};

// Health check function
const checkDatabaseHealth = async () => {
  try {
    const result = await pool.query('SELECT 1');
    return {
      status: 'healthy',
      metrics: {
        totalQueries: metrics.totalQueries,
        averageQueryTime: metrics.totalQueries ? metrics.totalDuration / metrics.totalQueries : 0,
        slowQueriesCount: metrics.slowQueries.length,
        errorCount: metrics.errors.length
      }
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

export {
  pool,
  executeQuery,
  checkDatabaseHealth,
  metrics
};
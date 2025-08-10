import { Pool, PoolConfig } from 'pg';
import { DataSourceOptions } from 'typeorm';
import { config as dotenvConfig } from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

// Load environment variables
dotenvConfig();

// Constants for configuration
const SLOW_QUERY_THRESHOLD = parseInt(process.env.SLOW_QUERY_THRESHOLD || '1000', 10);
const SLOW_QUERY_LOG_LIMIT = parseInt(process.env.SLOW_QUERY_LOG_LIMIT || '100', 10);

// Validate essential environment variables
const requiredEnvVars = ['DB_PASSWORD'];
const missingVars = requiredEnvVars.filter(v => !process.env[v]);
if (missingVars.length) {
    throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
}

// Environment-specific SSL configuration
const getSslConfig = () => {
  if (process.env.DB_SSL_CERT_PATH && fs.existsSync(process.env.DB_SSL_CERT_PATH)) {
    return {
      ca: fs.readFileSync(process.env.DB_SSL_CERT_PATH).toString(),
      rejectUnauthorized: process.env.NODE_ENV === 'production'
    };
  }
  return process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false;
};

// Enhanced shared database configuration
const sharedConfig = {
  username: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'sselfie_studio',
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT || '5432', 10),
  ssl: getSslConfig(),
  
  // Application metadata
  application_name: `${process.env.APP_NAME || 'SSELFIE_STUDIO'}_${process.env.NODE_ENV || 'development'}_${process.env.INSTANCE_ID || 'main'}`,
  
  // Connection timeouts
  connectTimeoutMS: parseInt(process.env.DB_CONNECT_TIMEOUT || '2000', 10),
  queryTimeoutMS: parseInt(process.env.DB_QUERY_TIMEOUT || '10000', 10)
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
// Enhanced Performance Metrics
const queryStats = {
  totalQueries: 0,
  totalDuration: 0,
  slowQueries: [] as {sql: string, duration: number, timestamp: Date, stack?: string}[],
  errorQueries: [] as {sql: string, error: string, timestamp: Date, stack?: string}[],
  queryTypes: {
    select: 0,
    insert: 0,
    update: 0,
    delete: 0,
    other: 0
  },
  lastReset: new Date()
};

// Query type analysis
const getQueryType = (sql: string): 'select' | 'insert' | 'update' | 'delete' | 'other' => {
  const normalized = sql.trim().toLowerCase();
  if (normalized.startsWith('select')) return 'select';
  if (normalized.startsWith('insert')) return 'insert';
  if (normalized.startsWith('update')) return 'update';
  if (normalized.startsWith('delete')) return 'delete';
  return 'other';
};

// Enhanced query stats with analysis
export const getQueryStats = () => {
  const now = new Date();
  const uptimeMs = now.getTime() - queryStats.lastReset.getTime();
  
  return {
    ...queryStats,
    averageQueryTime: queryStats.totalQueries ? queryStats.totalDuration / queryStats.totalQueries : 0,
    queriesPerSecond: queryStats.totalQueries / (uptimeMs / 1000),
    queryTypeDistribution: {
      ...queryStats.queryTypes,
      percentages: Object.entries(queryStats.queryTypes).reduce((acc, [key, value]) => ({
        ...acc,
        [key]: (value / queryStats.totalQueries * 100).toFixed(2) + '%'
      }), {})
    },
    slowQueryAnalysis: {
      count: queryStats.slowQueries.length,
      averageDuration: queryStats.slowQueries.reduce((acc, q) => acc + q.duration, 0) / (queryStats.slowQueries.length || 1),
      mostRecentSlowQueries: queryStats.slowQueries.slice(-5)
    },
    errorAnalysis: {
      count: queryStats.errorQueries.length,
      recentErrors: queryStats.errorQueries.slice(-5)
    },
    uptime: {
      ms: uptimeMs,
      readable: `${Math.floor(uptimeMs / 1000 / 60)} minutes ${Math.floor((uptimeMs / 1000) % 60)} seconds`
    }
  };
};

export const pool = new Pool({
  ...poolConfig,
  // Add query performance tracking
  interceptors: [{
    query: async (ctx, next) => {
      const start = Date.now();
      try {
        return await next();
      } finally {
        const duration = Date.now() - start;
        queryStats.totalQueries++;
        queryStats.totalDuration += duration;
        
        // Track slow queries (over 1000ms)
        if (duration > 1000) {
          queryStats.slowQueries.push({
            sql: ctx.query.text,
            duration,
            timestamp: new Date()
          });
          // Keep only last 100 slow queries
          if (queryStats.slowQueries.length > 100) {
            queryStats.slowQueries.shift();
          }
        }
      }
    }
  }]
});

// Connection state tracking
const connectionState = {
  lastReconnectAttempt: new Date(0),
  consecutiveFailures: 0,
  healthHistory: [] as {timestamp: Date, status: 'healthy' | 'unhealthy', responseTime?: number}[]
};

// Enhanced Connection Monitoring with auto-recovery
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
// Database configuration for SSELFIE Studio - Production Optimized
const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost', 
  database: process.env.DB_NAME || 'sselfie_studio',
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT || 5432,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
  
  // PRODUCTION PERFORMANCE OPTIMIZATION
  max: 20, // Maximum connections in pool
  min: 5,  // Minimum connections to maintain
  idle: 10000, // 10s idle timeout
  acquire: 60000, // 60s acquire timeout
  evict: 1000, // Evict idle connections every 1s
  
  // CONNECTION OPTIMIZATION
  connectionTimeoutMillis: 2000, // 2s connection timeout
  idleTimeoutMillis: 30000, // 30s idle timeout
  query_timeout: 10000, // 10s query timeout
  
  // STATEMENT OPTIMIZATION
  statement_timeout: 30000, // 30s statement timeout
  
  // PERFORMANCE TUNING
  application_name: 'SSELFIE_STUDIO_PROD'
});

// ENHANCED CONNECTION MONITORING
pool.on('connect', (client) => {
  console.log(`✅ DB CONNECTED: ${new Date().toISOString()} - Total: ${pool.totalCount}, Idle: ${pool.idleCount}, Waiting: ${pool.waitingCount}`);
  
  // Set session-level optimizations
  client.query(`
    SET statement_timeout = '30s';
    SET idle_in_transaction_session_timeout = '10s';
    SET lock_timeout = '5s';
  `).catch(err => console.warn('Session optimization warning:', err.message));
});

pool.on('error', (err, client) => {
  console.error(`❌ DB ERROR: ${new Date().toISOString()}`, {
    message: err.message,
    code: err.code,
    severity: err.severity,
    detail: err.detail
  });
});

pool.on('acquire', (client) => {
  console.log(`🔄 DB ACQUIRE: Connection acquired - Active: ${pool.totalCount - pool.idleCount}`);
});

pool.on('release', (err, client) => {
  if (err) {
    console.error('❌ DB RELEASE ERROR:', err.message);
  }
});

// HEALTH CHECK FUNCTION
const healthCheck = async () => {
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
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
};

// GRACEFUL SHUTDOWN
process.on('SIGINT', async () => {
  console.log('🔄 Graceful shutdown initiated...');
  await pool.end();
  console.log('✅ Database connections closed');
  process.exit(0);
});

module.exports = { pool, healthCheck };
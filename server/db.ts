import { Pool } from 'pg';
import { DATABASE_URL } from './env.js';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from '../shared/schema.js';

export const pool = new Pool({
  connectionString: DATABASE_URL,
  max: 10,
  min: 2,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
  query_timeout: 15000,
  statement_timeout: 15000,
  ssl: { rejectUnauthorized: false },
});

export const query = (text: string, params?: any[]) => pool.query(text, params);

// Export drizzle db instance for ORM operations
export const db = drizzle(pool, { schema });
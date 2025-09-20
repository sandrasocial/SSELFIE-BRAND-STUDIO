import { Pool } from 'pg';
import { DATABASE_URL } from './env.js';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from '../shared/schema.js';

export const pool = new Pool({
  connectionString: DATABASE_URL,
  max: 10,
  ssl: { rejectUnauthorized: false },
});

export const query = (text: string, params?: any[]) => pool.query(text, params);

// Export drizzle db instance for ORM operations
export const db = drizzle(pool, { schema });
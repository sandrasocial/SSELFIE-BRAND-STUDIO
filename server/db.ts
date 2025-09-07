import { Pool } from 'pg';
import { DATABASE_URL } from './env';

export const pool = new Pool({
  connectionString: DATABASE_URL,
  max: 10,
  ssl: { rejectUnauthorized: false },
});

export const query = (text: string, params?: any[]) => pool.query(text, params);
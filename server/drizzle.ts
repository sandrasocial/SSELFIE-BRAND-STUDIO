import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import { DATABASE_URL } from './env.js';
import * as schema from '../shared/schema.js';

// Use HTTP-based connection for drizzle operations
const sql = neon(DATABASE_URL!);
export const db = drizzle(sql, { schema });
import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import { DATABASE_URL } from './env.js';
import * as schema from '../shared/schema.js';

// Use HTTP-based connection for drizzle operations (optimal for serverless)
const sql = neon(DATABASE_URL!, {
  fetchOptions: {
    priority: 'high' // Prioritize database requests
  }
});

export const db = drizzle(sql, { schema });

// Export a serverless-optimized query helper
export const serverlessQuery = async (text: string, params?: any[]) => {
  try {
    if (params && params.length > 0) {
      return await sql.query(text, params);
    } else {
      return await sql`${sql.unsafe(text)}`;
    }
  } catch (error) {
    console.error('❌ Serverless query error:', error);
    throw error;
  }
};
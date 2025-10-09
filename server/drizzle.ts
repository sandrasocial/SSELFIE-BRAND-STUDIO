/// <reference path="../shared/types/global.d.ts" />
// Neon HTTP + Drizzle ORM for Vercel Serverless (WebSocket issues workaround)
import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import { DATABASE_URL } from './env.js';
import * as schema from '../shared/schema.js';

// Lazy initialization for serverless compatibility
let _db: any = null;

function getDb() {
  if (!_db) {
    // Get database URL with fallbacks
    const dbUrl = DATABASE_URL || process.env.DATABASE_URL || process.env.NEON_DB_URL;
    console.log('🔍 Database connection check (HTTP mode):', {
      DATABASE_URL_FROM_ENV: !!DATABASE_URL,
      PROCESS_ENV_DATABASE_URL: !!process.env.DATABASE_URL,
      PROCESS_ENV_NEON_DB_URL: !!process.env.NEON_DB_URL,
      FINAL_DB_URL: !!dbUrl,
      NODE_ENV: process.env.NODE_ENV
    });
    
    if (!dbUrl) {
      throw new Error(`No database connection string available. DATABASE_URL=${!!DATABASE_URL}, process.env.DATABASE_URL=${!!process.env.DATABASE_URL}, process.env.NEON_DB_URL=${!!process.env.NEON_DB_URL}, NODE_ENV=${process.env.NODE_ENV}`);
    }
    
    // Use HTTP adapter instead of WebSocket for Vercel serverless reliability
    const sql = neon(dbUrl);
    _db = drizzle(sql, { schema });
    
    console.log('✅ Database connection established successfully (HTTP mode)');
  }
  return _db;
}

// Export lazy-initialized database connection with proper typing
export const db = new Proxy({} as ReturnType<typeof drizzle<typeof schema>>, {
  get(_, prop) {
    const instance = getDb();
    return instance[prop as keyof typeof instance];
  }
});
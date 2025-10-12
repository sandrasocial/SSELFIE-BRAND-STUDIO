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
    
    if (!dbUrl) {
      throw new Error(`No database connection string available. DATABASE_URL=${!!DATABASE_URL}, process.env.DATABASE_URL=${!!process.env.DATABASE_URL}, process.env.NEON_DB_URL=${!!process.env.NEON_DB_URL}, NODE_ENV=${process.env.NODE_ENV}`);
    }
    
    // Use HTTP adapter with optimized configuration for Vercel serverless
    const sql = neon(dbUrl, {
      fullResults: false // Only return rows, not metadata for better performance
    });
    
    _db = drizzle(sql, { 
      schema,
      // Disable logging in production to reduce overhead
      logger: false
    });
    
    console.log('✅ Database connection established (Neon HTTP serverless mode)');
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
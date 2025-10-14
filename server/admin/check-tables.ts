import type { VercelRequest, VercelResponse } from '@vercel/node';
import { db } from '../../server/drizzle.js';

export const config = { runtime: 'nodejs' } as const;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    // Check admin authentication
    const adminToken = req.headers['x-admin-token'];
    if (!adminToken || adminToken !== process.env.ADMIN_TOKEN) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Query to get all table names in the public schema
    const { sql } = await import('drizzle-orm');
    const result = await db.execute(sql`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);

    const tables = result.rows.map((row: any) => row.table_name);

    return res.status(200).json({
      message: 'Production database tables',
      tableCount: tables.length,
      tables: tables
    });

  } catch (error) {
    console.error('Error checking tables:', error);
    return res.status(500).json({
      error: 'Failed to check tables',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
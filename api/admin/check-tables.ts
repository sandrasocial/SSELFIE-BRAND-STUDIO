import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../server/drizzle.js';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  try {
    // Check admin authentication
    const adminToken = request.headers.get('x-admin-token');
    if (!adminToken || adminToken !== process.env.ADMIN_TOKEN) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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

    return NextResponse.json({
      message: 'Production database tables',
      tableCount: tables.length,
      tables: tables
    }, { status: 200 });

  } catch (error) {
    console.error('Error checking tables:', error);
    return NextResponse.json({ 
      error: 'Failed to check tables',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
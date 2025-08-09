import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';

export async function up(pool: Pool) {
  // Read our SQL files
  const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
  const indexes = fs.readFileSync(path.join(__dirname, 'indexes.sql'), 'utf8');

  // Start transaction
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    // Execute schema creation
    await client.query(schema);
    
    // Execute index creation
    await client.query(indexes);
    
    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

export async function down(pool: Pool) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    // Drop tables in reverse order to handle dependencies
    await client.query(`
      DROP TABLE IF EXISTS payment_history;
      DROP TABLE IF EXISTS subscriptions;
      DROP TABLE IF EXISTS projects;
      DROP TABLE IF EXISTS users;
    `);
    
    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}
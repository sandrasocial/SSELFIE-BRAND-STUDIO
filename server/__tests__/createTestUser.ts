import { Pool } from 'pg';

const TEST_DB_URL = 'postgresql://neondb_owner:npg_eEj1C3aNlYyk@ep-super-waterfall-ad8ahksh-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

export async function createTestUser() {
  const pool = new Pool({ connectionString: TEST_DB_URL, ssl: { rejectUnauthorized: false } });
  const stackAuthId = 'test-user-123';
  const email = 'test@example.com';
  const name = 'Test User';
  await pool.query(`
    INSERT INTO users (id, stack_auth_id, email, display_name, created_at, updated_at)
    VALUES (gen_random_uuid(), $1, $2, $3, NOW(), NOW())
    ON CONFLICT (email) DO UPDATE SET display_name = EXCLUDED.display_name, updated_at = NOW();
  `, [stackAuthId, email, name]);
  // Ensure stack_auth_id is set for the test user
  await pool.query(`UPDATE users SET stack_auth_id = $1 WHERE email = $2;`, [stackAuthId, email]);
  await pool.end();
}

import { pool } from '../src/db';

describe('Database Operations', () => {
  beforeEach(async () => {
    // Clean up test data before each test
    await pool.query('BEGIN');
  });

  afterEach(async () => {
    // Roll back changes after each test
    await pool.query('ROLLBACK');
  });

  test('database connection works', async () => {
    const result = await pool.query('SELECT NOW()');
    expect(result.rows).toBeDefined();
  });

  test('can perform CRUD operations', async () => {
    // Add your CRUD test cases here
    const createResult = await pool.query(
      'CREATE TEMP TABLE test_table(id SERIAL PRIMARY KEY, name TEXT)'
    );
    expect(createResult).toBeDefined();
  });
});
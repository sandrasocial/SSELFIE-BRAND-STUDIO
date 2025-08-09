import { pool } from '../src/db';

// Global test setup
beforeAll(async () => {
  // Add any global setup here
});

// Cleanup after all tests
afterAll(async () => {
  await pool.end();
});
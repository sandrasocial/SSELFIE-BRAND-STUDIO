// Jest setup file for Phase 6 Testing Framework

// Mock environment variables for testing
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';

// Global test setup
beforeAll(() => {
  console.log('🧪 Phase 6 Testing Framework initialized');
});

afterAll(() => {
  console.log('🧪 Phase 6 Testing Framework completed');
});
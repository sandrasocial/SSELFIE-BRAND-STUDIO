// Jest setup file for Phase 6 Testing Framework
import { createRequire } from 'module';
global.require = createRequire(import.meta.url);

// Mock environment variables for testing
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';
process.env.RESEND_API_KEY = process.env.RESEND_API_KEY || 'dummy-resend-key';
process.env.STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || 'dummy-stripe-key';

// Global test setup
beforeAll(() => {
  console.log('🧪 Phase 6 Testing Framework initialized');
});

afterAll(() => {
  console.log('🧪 Phase 6 Testing Framework completed');
});
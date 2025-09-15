// Jest setup file for Phase 6 Testing Framework

// Mock environment variables for testing
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';
process.env.RESEND_API_KEY = process.env.RESEND_API_KEY || 'dummy-resend-key';
process.env.STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || 'dummy-stripe-key';

// Store original timers
const originalSetInterval = global.setInterval;
const originalClearInterval = global.clearInterval;

// Track active intervals for cleanup
const activeIntervals = new Set();

// Override setInterval to track intervals
global.setInterval = (callback, delay) => {
  const id = originalSetInterval(callback, delay);
  activeIntervals.add(id);
  return id;
};

// Override clearInterval to remove from tracking
global.clearInterval = (id) => {
  activeIntervals.delete(id);
  return originalClearInterval(id);
};

// Global test setup
beforeAll(() => {
  console.log('🧪 Phase 6 Testing Framework initialized');
});

afterAll(() => {
  console.log('🧪 Phase 6 Testing Framework completed');
  // Clean up all active intervals
  activeIntervals.forEach(id => {
    originalClearInterval(id);
  });
  activeIntervals.clear();
});

// Clean up after each test
afterEach(() => {
  // Clear any intervals that might have been created during tests
  activeIntervals.forEach(id => {
    originalClearInterval(id);
  });
  activeIntervals.clear();
});
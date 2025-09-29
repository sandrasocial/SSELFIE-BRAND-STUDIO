// Jest setup file for usage service tests
// This file is run before each test file

// Import jest-dom matchers
import '@testing-library/jest-dom';

// Mock console methods to avoid noise in test output
global.console = {
  ...console,
  log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
};

// Setup test environment variables if needed
process.env.NODE_ENV = 'test';

// Global test timeout
jest.setTimeout(10000);
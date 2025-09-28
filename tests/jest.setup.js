// Jest setup file for all tests
// This file is run before each test file

require('@testing-library/jest-dom');

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

// Mock localStorage for client-side tests
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: jest.fn((key) => store[key] || null),
    setItem: jest.fn((key, value) => {
      store[key] = value.toString();
    }),
    removeItem: jest.fn((key) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock sessionStorage
Object.defineProperty(window, 'sessionStorage', {
  value: localStorageMock,
});

// Mock URLSearchParams if not available
if (typeof URLSearchParams === 'undefined') {
  global.URLSearchParams = class URLSearchParams {
    constructor(search) {
      this.params = new Map();
      if (search) {
        search.split('&').forEach(param => {
          const [key, value] = param.split('=');
          this.params.set(key, value);
        });
      }
    }
    
    has(key) {
      return this.params.has(key);
    }
    
    get(key) {
      return this.params.get(key);
    }
  };
}
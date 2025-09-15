/**
 * Base Service Tests
 * Tests for the BaseService class functionality
 */

import { BaseService } from '../../services/base-service';

// Mock storage for testing
const mockStorage = {
  getUser: jest.fn(),
  createUser: jest.fn(),
  updateUser: jest.fn()
};

// Test service that extends BaseService
class TestService extends BaseService {
  constructor() {
    super();
    this.storage = mockStorage as any;
  }

  // Expose protected methods for testing
  public testGenerateId(prefix?: string): string {
    return this.generateId(prefix);
  }

  public testValidateRequired(data: any, fields: string[]): void {
    return this.validateRequired(data, fields);
  }

  public testSanitizeInput(data: any): any {
    return this.sanitizeInput(data);
  }

  public testLog(level: 'info' | 'warn' | 'error', message: string, data?: any): void {
    return this.log(level, message, data);
  }
}

describe('BaseService', () => {
  let testService: TestService;

  beforeEach(() => {
    testService = new TestService();
    jest.clearAllMocks();
  });

  describe('generateId', () => {
    it('should generate a unique ID with default prefix', () => {
      const id1 = testService.testGenerateId();
      const id2 = testService.testGenerateId();
      
      expect(id1).toMatch(/^item_\d+_[a-z0-9]+$/);
      expect(id2).toMatch(/^item_\d+_[a-z0-9]+$/);
      expect(id1).not.toBe(id2);
    });

    it('should generate a unique ID with custom prefix', () => {
      const id = testService.testGenerateId('test');
      
      expect(id).toMatch(/^test_\d+_[a-z0-9]+$/);
    });
  });

  describe('validateRequired', () => {
    it('should not throw when all required fields are present', () => {
      const data = { name: 'John', email: 'john@example.com' };
      const fields = ['name', 'email'];
      
      expect(() => testService.testValidateRequired(data, fields)).not.toThrow();
    });

    it('should throw error when required fields are missing', () => {
      const data = { name: 'John' };
      const fields = ['name', 'email'];
      
      expect(() => testService.testValidateRequired(data, fields)).toThrow('Missing required fields: email');
    });

    it('should throw error when multiple fields are missing', () => {
      const data = {};
      const fields = ['name', 'email', 'age'];
      
      expect(() => testService.testValidateRequired(data, fields)).toThrow('Missing required fields: name, email, age');
    });
  });

  describe('sanitizeInput', () => {
    it('should trim string inputs', () => {
      const input = '  hello world  ';
      const result = testService.testSanitizeInput(input);
      
      expect(result).toBe('hello world');
    });

    it('should sanitize object inputs recursively', () => {
      const input = {
        name: '  John Doe  ',
        email: '  john@example.com  ',
        nested: {
          value: '  nested value  '
        }
      };
      const result = testService.testSanitizeInput(input);
      
      expect(result).toEqual({
        name: 'John Doe',
        email: 'john@example.com',
        nested: {
          value: 'nested value'
        }
      });
    });

    it('should return non-string values unchanged', () => {
      expect(testService.testSanitizeInput(123)).toBe(123);
      expect(testService.testSanitizeInput(true)).toBe(true);
      expect(testService.testSanitizeInput(null)).toBe(null);
    });
  });

  describe('log', () => {
    let consoleSpy: jest.SpyInstance;

    beforeEach(() => {
      consoleSpy = jest.spyOn(console, 'info').mockImplementation();
    });

    afterEach(() => {
      consoleSpy.mockRestore();
    });

    it('should log info messages', () => {
      testService.testLog('info', 'Test message');
      
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringMatching(/\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z\] TestService: Test message/),
        ""
      );
    });

    it('should log with data', () => {
      const data = { userId: '123', action: 'test' };
      testService.testLog('info', 'Test message', data);
      
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringMatching(/TestService: Test message/),
        JSON.stringify(data, null, 2)
      );
    });
  });
});

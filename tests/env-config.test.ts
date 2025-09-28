import { 
  validateEnvironmentConfig,
  getStripeConfig,
  ConfigurationError,
  assertValidConfiguration 
} from '../client/src/utils/env-config';

// Mock import.meta.env
const mockEnv = {
  VITE_STRIPE_PUBLIC_KEY: '',
  TESTING_VITE_STRIPE_PUBLIC_KEY: '',
  DEV: false
};

// Mock import.meta
Object.defineProperty(globalThis, 'import', {
  value: {
    meta: {
      env: mockEnv
    }
  }
});

describe('Environment Configuration', () => {
  beforeEach(() => {
    // Reset mock environment
    mockEnv.VITE_STRIPE_PUBLIC_KEY = '';
    mockEnv.TESTING_VITE_STRIPE_PUBLIC_KEY = '';
    mockEnv.DEV = false;
  });

  describe('validateEnvironmentConfig', () => {
    test('validates with production Stripe key', () => {
      mockEnv.VITE_STRIPE_PUBLIC_KEY = 'pk_live_abc123def456ghi789jkl012mno345pqr678stu901vwx234yz567890abc123def456';

      const result = validateEnvironmentConfig();
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.config?.stripe.isTestMode).toBe(false);
    });

    test('validates with test Stripe key', () => {
      mockEnv.VITE_STRIPE_PUBLIC_KEY = 'pk_test_abc123def456ghi789jkl012mno345pqr678stu901vwx234yz567890abc123def456';

      const result = validateEnvironmentConfig();
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.config?.stripe.isTestMode).toBe(true);
      expect(result.warnings).toContain(expect.stringContaining('test mode'));
    });

    test('falls back to testing key when main key not set', () => {
      mockEnv.TESTING_VITE_STRIPE_PUBLIC_KEY = 'pk_test_abc123def456ghi789jkl012mno345pqr678stu901vwx234yz567890abc123def456';

      const result = validateEnvironmentConfig();
      
      expect(result.isValid).toBe(true);
      expect(result.warnings).toContain(expect.stringContaining('testing Stripe key'));
    });

    test('fails when no Stripe keys are set', () => {
      const result = validateEnvironmentConfig();
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(expect.stringContaining('No Stripe public key found'));
    });

    test('fails with invalid Stripe key format', () => {
      mockEnv.VITE_STRIPE_PUBLIC_KEY = 'invalid_key_format';

      const result = validateEnvironmentConfig();
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(expect.stringContaining('Invalid Stripe public key format'));
    });

    test('fails with too short Stripe key', () => {
      mockEnv.VITE_STRIPE_PUBLIC_KEY = 'pk_test_short';

      const result = validateEnvironmentConfig();
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(expect.stringContaining('too short'));
    });
  });

  describe('getStripeConfig', () => {
    test('returns config when validation passes', () => {
      mockEnv.VITE_STRIPE_PUBLIC_KEY = 'pk_test_abc123def456ghi789jkl012mno345pqr678stu901vwx234yz567890abc123def456';

      const config = getStripeConfig();
      
      expect(config).not.toBeNull();
      expect(config?.publicKey).toBe(mockEnv.VITE_STRIPE_PUBLIC_KEY);
      expect(config?.isTestMode).toBe(true);
    });

    test('returns null when validation fails', () => {
      // No keys set
      const config = getStripeConfig();
      
      expect(config).toBeNull();
    });
  });

  describe('assertValidConfiguration', () => {
    test('passes with valid configuration', () => {
      mockEnv.VITE_STRIPE_PUBLIC_KEY = 'pk_test_abc123def456ghi789jkl012mno345pqr678stu901vwx234yz567890abc123def456';

      expect(() => assertValidConfiguration()).not.toThrow();
    });

    test('throws ConfigurationError with invalid configuration', () => {
      // No keys set
      expect(() => assertValidConfiguration()).toThrow(ConfigurationError);
    });

    test('throws with correct error details', () => {
      try {
        assertValidConfiguration();
      } catch (error) {
        expect(error).toBeInstanceOf(ConfigurationError);
        expect((error as ConfigurationError).errors).toBeDefined();
        expect((error as ConfigurationError).errors.length).toBeGreaterThan(0);
      }
    });
  });
});
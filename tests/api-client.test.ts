import { 
  classifyError, 
  checkNetworkConnectivity,
  type ErrorClassification 
} from '../client/src/utils/api-client';

// Mock fetch for testing
global.fetch = jest.fn();

describe('API Client Utils', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe('classifyError', () => {
    test('classifies network errors correctly', () => {
      const networkError = new Error('Network request failed');
      const classification = classifyError(networkError);

      expect(classification.type).toBe('network');
      expect(classification.severity).toBe('medium');
      expect(classification.shouldRetry).toBe(true);
      expect(classification.userMessage).toContain('Connection problem');
    });

    test('classifies payment errors correctly', () => {
      const paymentError = new Error('Stripe payment failed');
      const classification = classifyError(paymentError);

      expect(classification.type).toBe('payment');
      expect(classification.severity).toBe('high');
      expect(classification.shouldRetry).toBe(false);
      expect(classification.userMessage).toContain('Payment processing error');
    });

    test('classifies validation errors correctly', () => {
      const validationError = new Error('Invalid email address');
      const classification = classifyError(validationError);

      expect(classification.type).toBe('validation');
      expect(classification.severity).toBe('low');
      expect(classification.shouldRetry).toBe(false);
      expect(classification.userMessage).toContain('check your information');
    });

    test('classifies server errors correctly', () => {
      const serverError = new Error('500 Internal Server Error');
      const classification = classifyError(serverError);

      expect(classification.type).toBe('server');
      expect(classification.severity).toBe('high');
      expect(classification.shouldRetry).toBe(true);
      expect(classification.userMessage).toContain('servers are temporarily unavailable');
    });

    test('classifies unknown errors correctly', () => {
      const unknownError = new Error('Something weird happened');
      const classification = classifyError(unknownError);

      expect(classification.type).toBe('unknown');
      expect(classification.severity).toBe('medium');
      expect(classification.shouldRetry).toBe(true);
      expect(classification.userMessage).toContain('unexpected error');
    });
  });

  describe('checkNetworkConnectivity', () => {
    test('returns true when network is available', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true
      });

      const result = await checkNetworkConnectivity();
      expect(result).toBe(true);
    });

    test('returns false when network is unavailable', async () => {
      (fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

      const result = await checkNetworkConnectivity();
      expect(result).toBe(false);
    });

    test('tries fallback CDN when primary health check fails', async () => {
      (fetch as jest.Mock)
        .mockRejectedValueOnce(new Error('Health check failed'))
        .mockResolvedValueOnce({ ok: true });

      const result = await checkNetworkConnectivity();
      expect(result).toBe(true);
      expect(fetch).toHaveBeenCalledTimes(2);
    });
  });
});
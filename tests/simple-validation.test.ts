// Simple validation test without React dependencies
describe('Simple Validation Tests', () => {
  // Email validation helper function (copied from our util for testing)
  function testValidateEmailBasic(email: string): boolean {
    if (!email || !email.trim()) return false;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim().toLowerCase());
  }

  // Payment amount validation
  function testValidatePaymentAmount(amount: number): boolean {
    return amount >= 0.50 && amount <= 9999.99;
  }

  describe('Email Validation Logic', () => {
    test('accepts valid email addresses', () => {
      const validEmails = [
        'test@example.com',
        'user.name@domain.co.uk',
        'test+tag@gmail.com',
        'name@company.org'
      ];

      validEmails.forEach(email => {
        expect(testValidateEmailBasic(email)).toBe(true);
      });
    });

    test('rejects invalid email addresses', () => {
      const invalidEmails = [
        '',
        'invalid',
        '@domain.com', 
        'user@',
        'user@domain'
      ];

      invalidEmails.forEach(email => {
        expect(testValidateEmailBasic(email)).toBe(false);
      });
    });
  });

  describe('Payment Amount Validation Logic', () => {
    test('accepts valid payment amounts', () => {
      const validAmounts = [0.50, 1.00, 47.00, 999.99];
      
      validAmounts.forEach(amount => {
        expect(testValidatePaymentAmount(amount)).toBe(true);
      });
    });

    test('rejects invalid payment amounts', () => {
      const invalidAmounts = [0, 0.49, 10000];
      
      invalidAmounts.forEach(amount => {
        expect(testValidatePaymentAmount(amount)).toBe(false);
      });
    });
  });

  describe('Error Classification Logic', () => {
    function classifyErrorBasic(errorMessage: string): string {
      const message = errorMessage.toLowerCase();
      
      if (message.includes('network') || message.includes('timeout')) {
        return 'network';
      }
      if (message.includes('stripe') || message.includes('payment')) {
        return 'payment';
      }
      if (message.includes('validation') || message.includes('invalid')) {
        return 'validation';
      }
      if (message.includes('500') || message.includes('502')) {
        return 'server';
      }
      return 'unknown';
    }

    test('classifies network errors', () => {
      expect(classifyErrorBasic('Network request failed')).toBe('network');
      expect(classifyErrorBasic('Request timeout')).toBe('network');
    });

    test('classifies payment errors', () => {
      expect(classifyErrorBasic('Stripe payment failed')).toBe('payment');
      expect(classifyErrorBasic('Payment processing error')).toBe('payment');
    });

    test('classifies validation errors', () => {
      expect(classifyErrorBasic('Invalid email address')).toBe('validation');
      expect(classifyErrorBasic('Validation failed')).toBe('validation');
    });

    test('classifies server errors', () => {
      expect(classifyErrorBasic('500 Internal Server Error')).toBe('server');
      expect(classifyErrorBasic('502 Bad Gateway')).toBe('server');
    });

    test('classifies unknown errors', () => {
      expect(classifyErrorBasic('Something weird happened')).toBe('unknown');
    });
  });
});
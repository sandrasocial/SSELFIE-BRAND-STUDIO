import { 
  validateEmail, 
  validatePaymentAmount, 
  validateCheckoutForm,
  validateEmailRealtime,
  type CheckoutFormData 
} from '../client/src/utils/checkout-validation';

describe('Checkout Validation', () => {
  describe('validateEmail', () => {
    test('validates correct email addresses', () => {
      const validEmails = [
        'test@example.com',
        'user.name@domain.co.uk',
        'test+tag@gmail.com',
        'name.lastname@company.org'
      ];

      validEmails.forEach(email => {
        const result = validateEmail(email);
        expect(result.isValid).toBe(true);
        expect(result.error).toBeUndefined();
      });
    });

    test('rejects invalid email addresses', () => {
      const invalidEmails = [
        '',
        'invalid',
        '@domain.com',
        'user@',
        'user..name@domain.com',
        'user@domain',
        'a'.repeat(320) + '@domain.com' // too long
      ];

      invalidEmails.forEach(email => {
        const result = validateEmail(email);
        expect(result.isValid).toBe(false);
        expect(result.error).toBeDefined();
      });
    });

    test('provides suggestions for common typos', () => {
      const typoTests = [
        { input: 'test@gmai.com', expected: 'test@gmail.com' },
        { input: 'user@gmial.com', expected: 'user@gmail.com' },
        { input: 'name@hotmial.com', expected: 'name@hotmail.com' }
      ];

      typoTests.forEach(({ input, expected }) => {
        const result = validateEmail(input);
        expect(result.suggestions).toContain(expected);
      });
    });
  });

  describe('validatePaymentAmount', () => {
    test('validates correct payment amounts', () => {
      const validAmounts = [0.50, 1.00, 47.00, 999.99];

      validAmounts.forEach(amount => {
        const result = validatePaymentAmount(amount);
        expect(result.isValid).toBe(true);
        expect(result.error).toBeUndefined();
      });
    });

    test('rejects invalid payment amounts', () => {
      const invalidAmounts = [0, -1, 0.49, 10000];

      invalidAmounts.forEach(amount => {
        const result = validatePaymentAmount(amount);
        expect(result.isValid).toBe(false);
        expect(result.error).toBeDefined();
      });
    });
  });

  describe('validateCheckoutForm', () => {
    test('validates complete valid form', () => {
      const validForm: CheckoutFormData = {
        email: 'test@example.com',
        amount: 47,
        plan: 'sselfie-studio'
      };

      const result = validateCheckoutForm(validForm);
      expect(result.isValid).toBe(true);
      expect(Object.keys(result.errors)).toHaveLength(0);
    });

    test('catches multiple validation errors', () => {
      const invalidForm: CheckoutFormData = {
        email: 'invalid-email',
        amount: 0,
        plan: ''
      };

      const result = validateCheckoutForm(invalidForm);
      expect(result.isValid).toBe(false);
      expect(result.errors.email).toBeDefined();
      expect(result.errors.amount).toBeDefined();
      expect(result.errors.plan).toBeDefined();
    });
  });

  describe('validateEmailRealtime', () => {
    test('handles empty email', () => {
      const result = validateEmailRealtime('');
      expect(result.status).toBe('empty');
      expect(result.isValid).toBe(false);
    });

    test('handles incomplete email', () => {
      const result = validateEmailRealtime('te');
      expect(result.status).toBe('incomplete');
      expect(result.isValid).toBe(false);
    });

    test('handles valid email', () => {
      const result = validateEmailRealtime('test@example.com');
      expect(result.status).toBe('valid');
      expect(result.isValid).toBe(true);
    });

    test('handles invalid email', () => {
      const result = validateEmailRealtime('invalid-email');
      expect(result.status).toBe('invalid');
      expect(result.isValid).toBe(false);
      expect(result.message).toBeDefined();
    });
  });
});
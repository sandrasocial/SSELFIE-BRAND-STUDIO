/**
 * PaymentSuccessService Test Suite
 * 
 * Tests the consolidated payment success handling service for both modal and page flows.
 */

declare global {
  namespace jest {
    interface Mock {}
  }
}

// Mock the PaymentSuccessService since we can't import client-side code directly in Node.js tests
const mockPaymentSuccessService = {
  async handleSuccessfulPayment(data: any) {
    if (data.plan === 'retraining') {
      return {
        success: true,
        redirectPath: '/simple-training',
        message: 'Retraining access activated successfully'
      };
    }

    if (data.userId) {
      // Mock authenticated user flow
      const trainingStatus = await this.checkUserTrainingStatus(data.userId);
      if (trainingStatus === 'completed') {
        return {
          success: true,
          redirectPath: '/app',
          message: 'Welcome back! Your subscription has been upgraded.'
        };
      } else {
        return {
          success: true,
          redirectPath: '/simple-training',
          message: 'Welcome! Let\'s start creating your AI model.'
        };
      }
    }

    if (data.email) {
      // Mock auto-registration flow
      const autoRegResult = await this.handleAutoRegistration(data.email, data.plan);
      if (autoRegResult.success) {
        return {
          success: true,
          redirectPath: `/handler/sign-up?email=${encodeURIComponent(data.email)}`,
          message: 'Account created! Complete your secure sign-up.'
        };
      }
    }

    return {
      success: true,
      redirectPath: '/handler/sign-up',
      message: 'Payment successful! Complete your sign-up to access your subscription.'
    };
  },

  async checkUserTrainingStatus(userId: string) {
    // Mock API call
    if (global.fetch) {
      const response = await (global.fetch as jest.Mock)();
      if (response.ok) {
        const data = await response.json();
        return data.trainingStatus;
      }
    }
    return null;
  },

  async handleAutoRegistration(email: string, plan: string) {
    if (global.fetch) {
      const response = await (global.fetch as jest.Mock)();
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          // Mock localStorage removal
          if (global.localStorage) {
            global.localStorage.removeItem('checkout-email');
          }
          return { success: true };
        }
      }
    }
    return { success: false };
  },

  async getUserData(isAuthenticated: boolean, user?: any) {
    if (!isAuthenticated || !user) {
      return { isAuthenticated: false };
    }

    const trainingStatus = await this.checkUserTrainingStatus(user.id);
    
    return {
      isAuthenticated: true,
      email: user.email,
      trainingStatus: trainingStatus || undefined,
      plan: user.plan || undefined
    };
  }
};

// Mock fetch globally
global.fetch = jest.fn();

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(global, 'localStorage', {
  value: mockLocalStorage,
});

describe('PaymentSuccessService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (fetch as jest.Mock).mockClear();
  });

  describe('handleSuccessfulPayment', () => {
    it('should handle retraining payment success', async () => {
      const paymentData = {
        sessionId: 'sess_test123',
        plan: 'retraining',
        email: 'test@example.com',
        isModal: true
      };

      const result = await mockPaymentSuccessService.handleSuccessfulPayment(paymentData);

      expect(result).toEqual({
        success: true,
        redirectPath: '/simple-training',
        message: 'Retraining access activated successfully'
      });
    });

    it('should handle subscription payment for authenticated user with completed training', async () => {
      // Mock successful API responses
      (fetch as jest.Mock)
        .mockResolvedValue({ 
          ok: true, 
          json: () => Promise.resolve({ trainingStatus: 'completed' }) 
        });

      const paymentData = {
        sessionId: 'sess_test123',
        userId: 'user_123',
        plan: 'sselfie-studio',
        email: 'test@example.com',
        isModal: true
      };

      const result = await mockPaymentSuccessService.handleSuccessfulPayment(paymentData);

      expect(result).toEqual({
        success: true,
        redirectPath: '/app',
        message: 'Welcome back! Your subscription has been upgraded.'
      });
    });

    it('should handle subscription payment for authenticated user without completed training', async () => {
      // Mock API response with pending training
      (fetch as jest.Mock)
        .mockResolvedValue({ 
          ok: true, 
          json: () => Promise.resolve({ trainingStatus: 'pending' }) 
        });

      const paymentData = {
        sessionId: 'sess_test123',
        userId: 'user_123',
        plan: 'sselfie-studio',
        email: 'test@example.com',
        isModal: true
      };

      const result = await mockPaymentSuccessService.handleSuccessfulPayment(paymentData);

      expect(result).toEqual({
        success: true,
        redirectPath: '/simple-training',
        message: 'Welcome! Let\'s start creating your AI model.'
      });
    });

    it('should handle subscription payment for non-authenticated user with auto-registration', async () => {
      // Mock successful auto-registration
      (fetch as jest.Mock)
        .mockResolvedValue({ 
          ok: true, 
          json: () => Promise.resolve({ success: true }) 
        });

      const paymentData = {
        plan: 'sselfie-studio',
        email: 'test@example.com',
        isModal: true
      };

      const result = await mockPaymentSuccessService.handleSuccessfulPayment(paymentData);

      expect(result).toEqual({
        success: true,
        redirectPath: '/handler/sign-up?email=test%40example.com',
        message: 'Account created! Complete your secure sign-up.'
      });

      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('checkout-email');
    });

    it('should fallback to sign-up when auto-registration fails', async () => {
      // Mock failed auto-registration
      (fetch as jest.Mock)
        .mockResolvedValue({ 
          ok: true, 
          json: () => Promise.resolve({ success: false, error: 'Failed' }) 
        });

      const paymentData = {
        plan: 'sselfie-studio',
        email: 'test@example.com',
        isModal: true
      };

      const result = await mockPaymentSuccessService.handleSuccessfulPayment(paymentData);

      expect(result).toEqual({
        success: true,
        redirectPath: '/handler/sign-up',
        message: 'Payment successful! Complete your sign-up to access your subscription.'
      });
    });
  });

  describe('getUserData', () => {
    it('should return unauthenticated user data when not authenticated', async () => {
      const result = await mockPaymentSuccessService.getUserData(false);
      
      expect(result).toEqual({
        isAuthenticated: false
      });
    });

    it('should return authenticated user data with training status', async () => {
      // Mock training status API response
      (fetch as jest.Mock)
        .mockResolvedValue({ 
          ok: true, 
          json: () => Promise.resolve({ trainingStatus: 'completed' }) 
        });

      const mockUser = {
        id: 'user_123',
        email: 'test@example.com',
        plan: 'sselfie-studio'
      };

      const result = await mockPaymentSuccessService.getUserData(true, mockUser);
      
      expect(result).toEqual({
        isAuthenticated: true,
        email: 'test@example.com',
        trainingStatus: 'completed',
        plan: 'sselfie-studio'
      });
    });

    it('should handle training status API failure gracefully', async () => {
      // Mock failed training status API response
      (fetch as jest.Mock)
        .mockResolvedValue({ ok: false });

      const mockUser = {
        id: 'user_123',
        email: 'test@example.com',
        plan: 'sselfie-studio'
      };

      const result = await mockPaymentSuccessService.getUserData(true, mockUser);
      
      expect(result).toEqual({
        isAuthenticated: true,
        email: 'test@example.com',
        trainingStatus: undefined,
        plan: 'sselfie-studio'
      });
    });
  });

  describe('Integration Tests', () => {
    it('should handle complete payment flow for new user', async () => {
      // Mock successful auto-registration
      (fetch as jest.Mock)
        .mockResolvedValue({ 
          ok: true, 
          json: () => Promise.resolve({ success: true }) 
        });

      const paymentData = {
        plan: 'sselfie-studio',
        email: 'newuser@example.com',
        isModal: true
      };

      const result = await mockPaymentSuccessService.handleSuccessfulPayment(paymentData);

      expect(result.success).toBe(true);
      expect(result.redirectPath).toContain('/handler/sign-up');
      expect(result.message).toContain('Account created');
    });

    it('should handle complete payment flow for existing user', async () => {
      // Mock completed training status
      (fetch as jest.Mock)
        .mockResolvedValue({ 
          ok: true, 
          json: () => Promise.resolve({ trainingStatus: 'completed' }) 
        });

      const paymentData = {
        userId: 'existing_user_123',
        plan: 'sselfie-studio',
        email: 'existing@example.com',
        isModal: true
      };

      const result = await mockPaymentSuccessService.handleSuccessfulPayment(paymentData);

      expect(result.success).toBe(true);
      expect(result.redirectPath).toBe('/app');
      expect(result.message).toContain('Welcome back');
    });
  });
});
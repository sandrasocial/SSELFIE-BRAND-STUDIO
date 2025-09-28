/**
 * PaymentSuccessService - Consolidated payment success handling
 * 
 * This service handles successful payment processing for both modal and page flows,
 * providing a unified interface for user upgrades and redirect logic.
 */

export interface PaymentSuccessData {
  sessionId?: string;
  userId?: string;
  plan: string;
  email?: string;
  isModal?: boolean;
}

export interface UserData {
  isAuthenticated: boolean;
  email?: string;
  trainingStatus?: string;
  plan?: string;
}

export interface PaymentSuccessResult {
  success: boolean;
  redirectPath?: string;
  message?: string;
  error?: string;
}

export class PaymentSuccessService {
  /**
   * Main handler for successful payments
   */
  static async handleSuccessfulPayment(data: PaymentSuccessData): Promise<PaymentSuccessResult> {
    try {
      const { plan, userId, email, isModal = false } = data;

      // Handle retraining payments
      if (plan === 'retraining') {
        return this.handleRetrainingSuccess(data);
      }

      // Handle regular subscription payments
      return this.handleSubscriptionSuccess(data);
    } catch (error) {
      console.error('Payment success handling error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Handle retraining payment success
   */
  private static async handleRetrainingSuccess(data: PaymentSuccessData): Promise<PaymentSuccessResult> {
    console.log('🔄 Handling retraining payment success');
    
    return {
      success: true,
      redirectPath: '/simple-training',
      message: 'Retraining access activated successfully'
    };
  }

  /**
   * Handle subscription payment success
   */
  private static async handleSubscriptionSuccess(data: PaymentSuccessData): Promise<PaymentSuccessResult> {
    const { userId, email, isModal } = data;

    // If user is authenticated, upgrade existing account
    if (userId) {
      await this.upgradeAuthenticatedUser(userId);
      
      // Check training status to determine redirect
      const trainingStatus = await this.checkUserTrainingStatus(userId);
      
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

    // Handle non-authenticated user with email
    if (email) {
      const autoRegResult = await this.handleAutoRegistration(email, data.plan);
      
      if (autoRegResult.success) {
        return {
          success: true,
          redirectPath: `/handler/sign-up?email=${encodeURIComponent(email)}`,
          message: 'Account created! Complete your secure sign-up.'
        };
      }
    }

    // Fallback - redirect to sign-up
    return {
      success: true,
      redirectPath: '/handler/sign-up',
      message: 'Payment successful! Complete your sign-up to access your subscription.'
    };
  }

  /**
   * Upgrade authenticated user account
   */
  private static async upgradeAuthenticatedUser(userId: string): Promise<void> {
    try {
      // Method 1: Try direct user upgrade
      const upgradeResponse = await fetch('/api/upgrade-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: userId,
          plan: 'sselfie-studio'
        })
      });

      if (upgradeResponse.ok) {
        console.log('✅ User upgrade successful');
        return;
      }

      // Method 2: Fallback to automation endpoint
      await fetch('/api/automation/update-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ plan: 'sselfie-studio' })
      });

      console.log('✅ User upgrade via automation successful');
    } catch (error) {
      console.error('User upgrade failed:', error);
      // Don't throw - payment was still processed
    }
  }

  /**
   * Check user training status
   */
  private static async checkUserTrainingStatus(userId: string): Promise<string | null> {
    try {
      const response = await fetch('/api/user-model');
      if (response.ok) {
        const modelData = await response.json();
        return modelData.trainingStatus || null;
      }
    } catch (error) {
      console.log('Could not check training status:', error);
    }
    return null;
  }

  /**
   * Handle auto-registration for paying customers
   */
  private static async handleAutoRegistration(email: string, plan: string): Promise<PaymentSuccessResult> {
    try {
      console.log('🚀 AUTO-REGISTRATION: Creating account for:', email);
      
      const response = await fetch('/api/auth/auto-register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          plan,
          source: 'payment-success'
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        console.log('✅ AUTO-REGISTRATION: Account created successfully');
        
        // Clear stored email
        localStorage.removeItem('checkout-email');
        
        return {
          success: true,
          message: 'Account created successfully'
        };
      } else {
        console.error('❌ AUTO-REGISTRATION: Failed to create account:', data.error);
        return {
          success: false,
          error: 'Failed to create account'
        };
      }
    } catch (error) {
      console.error('❌ AUTO-REGISTRATION: Network error:', error);
      return {
        success: false,
        error: 'Network error during registration'
      };
    }
  }

  /**
   * Get user data for payment success handling
   */
  static async getUserData(isAuthenticated: boolean, user?: any): Promise<UserData> {
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
}

/**
 * Unified success handler function for both modal and page usage
 */
export const handlePaymentSuccess = async (data: PaymentSuccessData): Promise<PaymentSuccessResult> => {
  return PaymentSuccessService.handleSuccessfulPayment(data);
};
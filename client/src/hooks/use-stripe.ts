/**
 * Use Stripe Hook - Maya-Only Architecture
 * React hook for Stripe payment processing integration
 */

import { useState, useEffect } from 'react';
import { loadStripe, Stripe } from '@stripe/stripe-js';
import { useAuth } from './use-auth.js';
import { apiFetch } from '../lib/api.js';
import type {
  UseStripeReturn,
  UseSubscriptionReturn,
  UsePaymentMethodsReturn,
  Subscription,
  PaymentMethod,
  CreateSubscriptionRequest,
  UpdateSubscriptionRequest,
  CreatePaymentMethodRequest,
  CreatePaymentSessionRequest,
  PaymentResponse,
  PaymentError,
  PaymentSession
} from '../../shared/types/payment.js';

// Stripe configuration
const STRIPE_PUBLISHABLE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 
  process.env.STRIPE_PUBLISHABLE_KEY || 
  'pk_test_51234567890abcdef'; // Fallback test key

let stripePromise: Promise<Stripe | null>;

// Initialize Stripe
const getStripe = () => {
  if (!stripePromise) {
    stripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY);
  }
  return stripePromise;
};

/**
 * Main Stripe hook for payment processing
 */
export function useStripe(): UseStripeReturn {
  const [stripe, setStripe] = useState<Stripe | null>(null);
  const [elements, setElements] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<PaymentError | null>(null);

  useEffect(() => {
    const initializeStripe = async () => {
      try {
        const stripeInstance = await getStripe();
        setStripe(stripeInstance);
        
        if (stripeInstance) {
          // Initialize elements when needed
          const elementsInstance = stripeInstance.elements();
          setElements(elementsInstance);
        }
      } catch (err) {
        setError({
          code: 'INITIALIZATION_FAILED',
          message: 'Failed to initialize Stripe. Please try again.',
          type: 'api_error'
        });
      } finally {
        setIsLoading(false);
      }
    };

    initializeStripe();
  }, []);

  return {
    stripe,
    elements,
    isLoading,
    error
  };
}

/**
 * Hook for managing user subscriptions
 */
export function useSubscription(): UseSubscriptionReturn {
  const { user, isAuthenticated } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<PaymentError | null>(null);

  // Fetch current subscription
  useEffect(() => {
    if (isAuthenticated && user) {
      fetchSubscription();
    }
  }, [isAuthenticated, user]);

  const fetchSubscription = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await apiFetch('/subscription');
      setSubscription(response.subscription || null);
    } catch (err) {
      setError({
        code: 'FETCH_FAILED',
        message: 'Failed to fetch subscription details.',
        type: 'api_error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createSubscription = async (request: CreateSubscriptionRequest): Promise<PaymentResponse> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiFetch('/subscription', {
        method: 'POST',
        body: JSON.stringify(request)
      });

      if (response.success) {
        setSubscription(response.subscription);
        return {
          success: true,
          data: response.subscription,
          clientSecret: response.clientSecret,
          redirectUrl: response.redirectUrl
        };
      } else {
        const paymentError: PaymentError = {
          code: response.error?.code || 'SUBSCRIPTION_FAILED',
          message: response.error?.message || 'Failed to create subscription.',
          type: 'payment'
        };
        setError(paymentError);
        return { success: false, error: paymentError };
      }
    } catch (err) {
      const paymentError: PaymentError = {
        code: 'NETWORK_ERROR',
        message: 'Network error. Please try again.',
        type: 'api_error'
      };
      setError(paymentError);
      return { success: false, error: paymentError };
    } finally {
      setIsLoading(false);
    }
  };

  const updateSubscription = async (request: UpdateSubscriptionRequest): Promise<PaymentResponse> => {
    if (!subscription) {
      const error: PaymentError = {
        code: 'SUBSCRIPTION_NOT_FOUND',
        message: 'No active subscription found.',
        type: 'validation'
      };
      setError(error);
      return { success: false, error };
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await apiFetch(`/subscription/${subscription.id}`, {
        method: 'PUT',
        body: JSON.stringify(request)
      });

      if (response.success) {
        setSubscription(response.subscription);
        return {
          success: true,
          data: response.subscription
        };
      } else {
        const paymentError: PaymentError = {
          code: response.error?.code || 'UPDATE_FAILED',
          message: response.error?.message || 'Failed to update subscription.',
          type: 'payment'
        };
        setError(paymentError);
        return { success: false, error: paymentError };
      }
    } catch (err) {
      const paymentError: PaymentError = {
        code: 'NETWORK_ERROR',
        message: 'Network error. Please try again.',
        type: 'api_error'
      };
      setError(paymentError);
      return { success: false, error: paymentError };
    } finally {
      setIsLoading(false);
    }
  };

  const cancelSubscription = async (): Promise<PaymentResponse> => {
    if (!subscription) {
      const error: PaymentError = {
        code: 'SUBSCRIPTION_NOT_FOUND',
        message: 'No active subscription found.',
        type: 'validation'
      };
      setError(error);
      return { success: false, error };
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await apiFetch(`/subscription/${subscription.id}/cancel`, {
        method: 'POST'
      });

      if (response.success) {
        setSubscription(response.subscription);
        return {
          success: true,
          data: response.subscription
        };
      } else {
        const paymentError: PaymentError = {
          code: response.error?.code || 'CANCEL_FAILED',
          message: response.error?.message || 'Failed to cancel subscription.',
          type: 'payment'
        };
        setError(paymentError);
        return { success: false, error: paymentError };
      }
    } catch (err) {
      const paymentError: PaymentError = {
        code: 'NETWORK_ERROR',
        message: 'Network error. Please try again.',
        type: 'api_error'
      };
      setError(paymentError);
      return { success: false, error: paymentError };
    } finally {
      setIsLoading(false);
    }
  };

  const resumeSubscription = async (): Promise<PaymentResponse> => {
    if (!subscription) {
      const error: PaymentError = {
        code: 'SUBSCRIPTION_NOT_FOUND',
        message: 'No active subscription found.',
        type: 'validation'
      };
      setError(error);
      return { success: false, error };
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await apiFetch(`/subscription/${subscription.id}/resume`, {
        method: 'POST'
      });

      if (response.success) {
        setSubscription(response.subscription);
        return {
          success: true,
          data: response.subscription
        };
      } else {
        const paymentError: PaymentError = {
          code: response.error?.code || 'RESUME_FAILED',
          message: response.error?.message || 'Failed to resume subscription.',
          type: 'payment'
        };
        setError(paymentError);
        return { success: false, error: paymentError };
      }
    } catch (err) {
      const paymentError: PaymentError = {
        code: 'NETWORK_ERROR',
        message: 'Network error. Please try again.',
        type: 'api_error'
      };
      setError(paymentError);
      return { success: false, error: paymentError };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    subscription,
    isLoading,
    error,
    createSubscription,
    updateSubscription,
    cancelSubscription,
    resumeSubscription
  };
}

/**
 * Hook for managing payment methods
 */
export function usePaymentMethods(): UsePaymentMethodsReturn {
  const { user, isAuthenticated } = useAuth();
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<PaymentError | null>(null);

  // Fetch payment methods on auth
  useEffect(() => {
    if (isAuthenticated && user) {
      fetchPaymentMethods();
    }
  }, [isAuthenticated, user]);

  const fetchPaymentMethods = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiFetch('/payment-methods');
      setPaymentMethods(response.paymentMethods || []);
    } catch (err) {
      setError({
        code: 'FETCH_FAILED',
        message: 'Failed to fetch payment methods.',
        type: 'api_error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addPaymentMethod = async (request: CreatePaymentMethodRequest): Promise<PaymentResponse> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiFetch('/payment-methods', {
        method: 'POST',
        body: JSON.stringify(request)
      });

      if (response.success) {
        const newPaymentMethod = response.paymentMethod;
        setPaymentMethods(prev => [...prev, newPaymentMethod]);
        return {
          success: true,
          data: newPaymentMethod
        };
      } else {
        const paymentError: PaymentError = {
          code: response.error?.code || 'ADD_FAILED',
          message: response.error?.message || 'Failed to add payment method.',
          type: 'payment'
        };
        setError(paymentError);
        return { success: false, error: paymentError };
      }
    } catch (err) {
      const paymentError: PaymentError = {
        code: 'NETWORK_ERROR',
        message: 'Network error. Please try again.',
        type: 'api_error'
      };
      setError(paymentError);
      return { success: false, error: paymentError };
    } finally {
      setIsLoading(false);
    }
  };

  const removePaymentMethod = async (id: string): Promise<PaymentResponse> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiFetch(`/payment-methods/${id}`, {
        method: 'DELETE'
      });

      if (response.success) {
        setPaymentMethods(prev => prev.filter(pm => pm.id !== id));
        return { success: true };
      } else {
        const paymentError: PaymentError = {
          code: response.error?.code || 'REMOVE_FAILED',
          message: response.error?.message || 'Failed to remove payment method.',
          type: 'payment'
        };
        setError(paymentError);
        return { success: false, error: paymentError };
      }
    } catch (err) {
      const paymentError: PaymentError = {
        code: 'NETWORK_ERROR',
        message: 'Network error. Please try again.',
        type: 'api_error'
      };
      setError(paymentError);
      return { success: false, error: paymentError };
    } finally {
      setIsLoading(false);
    }
  };

  const setDefaultPaymentMethod = async (id: string): Promise<PaymentResponse> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiFetch(`/payment-methods/${id}/default`, {
        method: 'POST'
      });

      if (response.success) {
        // Update local state to reflect new default
        setPaymentMethods(prev => 
          prev.map(pm => ({
            ...pm,
            isDefault: pm.id === id
          }))
        );
        return { success: true };
      } else {
        const paymentError: PaymentError = {
          code: response.error?.code || 'SET_DEFAULT_FAILED',
          message: response.error?.message || 'Failed to set default payment method.',
          type: 'payment'
        };
        setError(paymentError);
        return { success: false, error: paymentError };
      }
    } catch (err) {
      const paymentError: PaymentError = {
        code: 'NETWORK_ERROR',
        message: 'Network error. Please try again.',
        type: 'api_error'
      };
      setError(paymentError);
      return { success: false, error: paymentError };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    paymentMethods,
    isLoading,
    error,
    addPaymentMethod,
    removePaymentMethod,
    setDefaultPaymentMethod
  };
}

/**
 * Helper function to create payment sessions (checkout)
 */
export async function createPaymentSession(request: CreatePaymentSessionRequest): Promise<PaymentSession> {
  const response = await apiFetch('/payment-sessions', {
    method: 'POST',
    body: JSON.stringify(request)
  });

  if (!response.success) {
    throw new Error(response.error?.message || 'Failed to create payment session');
  }

  return response.session;
}

/**
 * Helper function to handle Stripe errors
 */
export function handleStripeError(error: any): PaymentError {
  if (!error) {
    return {
      code: 'UNKNOWN_ERROR',
      message: 'An unknown error occurred.',
      type: 'api_error'
    };
  }

  // Map Stripe error codes to our payment error codes
  const stripeErrorMap: Record<string, { code: PaymentError['code'], type: PaymentError['type'] }> = {
    'card_declined': { code: 'CARD_DECLINED', type: 'payment' },
    'insufficient_funds': { code: 'INSUFFICIENT_FUNDS', type: 'payment' },
    'expired_card': { code: 'EXPIRED_CARD', type: 'validation' },
    'incorrect_cvc': { code: 'INVALID_CVC', type: 'validation' },
    'invalid_expiry_month': { code: 'INVALID_EXPIRY', type: 'validation' },
    'invalid_expiry_year': { code: 'INVALID_EXPIRY', type: 'validation' },
    'invalid_number': { code: 'INVALID_NUMBER', type: 'validation' },
    'processing_error': { code: 'PROCESSING_ERROR', type: 'payment' },
    'rate_limit': { code: 'RATE_LIMITED', type: 'rate_limit' }
  };

  const mapped = stripeErrorMap[error.code] || { code: 'UNKNOWN_ERROR', type: 'api_error' };

  return {
    code: mapped.code,
    message: error.message || 'Payment processing failed.',
    type: mapped.type,
    details: {
      stripeCode: error.code,
      stripeType: error.type
    }
  };
}
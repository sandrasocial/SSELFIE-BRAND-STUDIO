import { useToast } from './use-toast.js';
import { ErrorClassification, classifyError } from '../lib/api-client.js';

export interface ToastOptions {
  title?: string;
  description?: string;
  variant?: 'default' | 'destructive' | 'success' | 'warning';
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export interface EnhancedToastOptions extends ToastOptions {
  showRetry?: boolean;
  onRetry?: () => void;
  persistent?: boolean;
}

export function useEnhancedToast() {
  const { toast } = useToast();

  const showToast = (options: EnhancedToastOptions) => {
    // For now, use the basic toast functionality
    // In a full implementation, this would create rich toast notifications
    toast({
      title: options.title,
      description: options.description
    });

    // Log for development
    if (import.meta.env.DEV) {
      // Development logging disabled for now
    }
  };

  const showErrorToast = (error: Error | string, options: Partial<EnhancedToastOptions> = {}) => {
    const errorObj = typeof error === 'string' ? new Error(error) : error;
    const classification = classifyError(errorObj);

    showToast({
      title: options.title || 'Error',
      description: options.description || classification.userMessage,
      variant: 'destructive',
      showRetry: classification.shouldRetry,
      ...options
    });
  };

  const showSuccessToast = (message: string, options: Partial<EnhancedToastOptions> = {}) => {
    showToast({
      title: 'Success',
      description: message,
      variant: 'success',
      duration: 4000,
      ...options
    });
  };

  const showWarningToast = (message: string, options: Partial<EnhancedToastOptions> = {}) => {
    showToast({
      title: 'Warning',
      description: message,
      variant: 'warning',
      duration: 6000,
      ...options
    });
  };

  const showValidationToast = (field: string, message: string) => {
    showToast({
      title: `${field} Required`,
      description: message,
      variant: 'warning',
      duration: 4000
    });
  };

  const showPaymentSuccessToast = () => {
    showToast({
      title: 'Payment Successful! 🎉',
      description: 'Redirecting to your workspace...',
      variant: 'success',
      duration: 3000
    });
  };

  const showPaymentErrorToast = (error: Error, onRetry?: () => void) => {
    const classification = classifyError(error);
    
    showToast({
      title: 'Payment Failed',
      description: classification.userMessage,
      variant: 'destructive',
      showRetry: classification.shouldRetry,
      onRetry: onRetry,
      persistent: true
    });
  };

  const showNetworkErrorToast = (onRetry?: () => void) => {
    showToast({
      title: 'Connection Problem',
      description: 'Unable to connect to our servers. Please check your internet connection.',
      variant: 'destructive',
      showRetry: true,
      onRetry: onRetry,
      persistent: true
    });
  };

  const showConfigurationErrorToast = () => {
    showToast({
      title: 'Configuration Error',
      description: 'Payment processing is temporarily unavailable. Please contact support.',
      variant: 'destructive',
      persistent: true,
      action: {
        label: 'Contact Support',
        onClick: () => window.location.href = 'mailto:support@sselfie.com'
      }
    });
  };

  return {
    toast: showToast,
    showErrorToast,
    showSuccessToast,
    showWarningToast,
    showValidationToast,
    showPaymentSuccessToast,
    showPaymentErrorToast,
    showNetworkErrorToast,
    showConfigurationErrorToast
  };
}
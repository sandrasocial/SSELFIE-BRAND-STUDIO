import { useToast } from '../hooks/use-toast.js';

export interface ApiError {
  message: string;
  status?: number;
  code?: string;
}

export type ApiErrorInput = {
  response?: {
    data?: {
      message?: string;
      error?: string;
      code?: string;
    };
    status?: number;
  };
  message?: string;
  status?: number;
  code?: string;
} | string | Error | unknown;

export type ToastFunction = (message: { title?: string; description?: string; variant?: 'default' | 'destructive' }) => void;

export class ApiErrorHandler {
  private static retryCount = 0;
  private static maxRetries = 3;
  private static retryDelay = 1000; // 1 second
  private static toastFunction: ToastFunction | null = null;

  /**
   * Set the toast function for error notifications
   */
  static setToastFunction(toastFn: ToastFunction): void {
    this.toastFunction = toastFn;
  }

  /**
   * Handle API errors with user-friendly messages and retry logic
   */
  static async handleError(error: ApiErrorInput, context?: string): Promise<void> {
    console.error(`API Error${context ? ` in ${context}` : ''}:`, error);

    const apiError = this.parseError(error);
    
    // Show user-friendly error message
    this.showUserError(apiError, context);

    // Log error for debugging
    this.logError(apiError, context);
  }

  /**
   * Parse different types of errors into a consistent format
   */
  private static parseError(error: ApiErrorInput): ApiError {
    // Check if it's an object with response property (Axios-like error)
    if (error && typeof error === 'object' && 'response' in error && error.response) {
      const axiosError = error as { response: { data?: { message?: string; error?: string; code?: string }; status?: number } };
      return {
        message: axiosError.response.data?.message || axiosError.response.data?.error || 'An error occurred',
        status: axiosError.response.status,
        code: axiosError.response.data?.code
      };
    }

    // Check if it's an object with message property (standard Error)
    if (error && typeof error === 'object' && 'message' in error && typeof error.message === 'string') {
      const stdError = error as { message: string; status?: number; code?: string };
      return {
        message: stdError.message,
        status: stdError.status,
        code: stdError.code
      };
    }

    // Check if it's a string
    if (typeof error === 'string') {
      return {
        message: error
      };
    }

    // Unknown error
    return {
      message: 'An unexpected error occurred. Please try again.'
    };
  }

  /**
   * Show user-friendly error message
   */
  private static showUserError(error: ApiError, context?: string): void {
    let message = error.message;

    // Customize message based on status code
    switch (error.status) {
      case 400:
        message = 'Invalid request. Please check your input and try again.';
        break;
      case 401:
        message = 'You need to sign in to continue.';
        break;
      case 403:
        message = 'You don\'t have permission to perform this action.';
        break;
      case 404:
        message = 'The requested resource was not found.';
        break;
      case 429:
        message = 'Too many requests. Please wait a moment and try again.';
        break;
      case 500:
        message = 'Server error. Please try again later.';
        break;
      case 503:
        message = 'Service temporarily unavailable. Please try again later.';
        break;
    }

    // Add context if provided
    if (context) {
      message = `${context}: ${message}`;
    }

    // Show toast notification if toast function is available
    if (this.toastFunction) {
      this.toastFunction({
        title: 'Error',
        description: message,
        variant: 'destructive'
      });
    }
  }

  /**
   * Log error for debugging
   */
  private static logError(error: ApiError, context?: string): void {
    const logData = {
      message: error.message,
      status: error.status,
      code: error.code,
      context,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    };

    console.error('Error logged:', logData);

    // In production, you might want to send this to an error reporting service
    if (process.env.NODE_ENV === 'production') {
      // Example: sendToErrorReportingService(logData);
    }
  }

  static async retry<T>(
    apiCall: () => Promise<T>,
    context?: string,
    maxRetries: number = this.maxRetries
  ): Promise<T> {
    let lastError: ApiErrorInput;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await apiCall();
      } catch (error) {
        lastError = error;
        
        if (attempt === maxRetries) {
          // Last attempt failed
          await this.handleError(error, context);
          throw error;
        }

        // Wait before retrying (exponential backoff)
        const delay = this.retryDelay * Math.pow(2, attempt - 1);
        
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    throw lastError!;
  }

  /**
   * Handle network connectivity issues
   */
  static handleNetworkError(): void {
    if (this.toastFunction) {
      this.toastFunction({
        title: 'Connection Error',
        description: 'Please check your internet connection and try again.',
        variant: 'destructive'
      });
    }
  }

  /**
   * Handle authentication errors
   */
  static handleAuthError(): void {
    if (this.toastFunction) {
      this.toastFunction({
        title: 'Authentication Required',
        description: 'Please sign in to continue.',
        variant: 'destructive'
      });
    }

    // Redirect to login after a short delay
    setTimeout(() => {
      window.location.href = '/handler/sign-in';
    }, 2000);
  }

  /**
   * Handle rate limiting errors
   */
  static handleRateLimitError(retryAfter?: number): void {
    const message = retryAfter 
      ? `Too many requests. Please wait ${retryAfter} seconds before trying again.`
      : 'Too many requests. Please wait a moment before trying again.';

    if (this.toastFunction) {
      this.toastFunction({
        title: 'Rate Limited',
        description: message,
        variant: 'destructive'
      });
    }
  }
}

/**
 * Hook for handling API errors in React components
 */
export function useApiErrorHandler() {
  const { toast } = useToast();
  
  // Set the toast function for the static class
  ApiErrorHandler.setToastFunction(toast);

  const handleError = (error: ApiErrorInput, context?: string) => {
    ApiErrorHandler.handleError(error, context);
  };

  const retry = <T>(apiCall: () => Promise<T>, context?: string) => {
    return ApiErrorHandler.retry(apiCall, context);
  };

  return { handleError, retry };
}

export default ApiErrorHandler;

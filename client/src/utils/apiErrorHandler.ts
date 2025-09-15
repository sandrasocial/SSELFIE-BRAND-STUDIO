import { toast } from './toast';

export interface ApiError {
  message: string;
  status?: number;
  code?: string;
}

export class ApiErrorHandler {
  private static retryCount = 0;
  private static maxRetries = 3;
  private static retryDelay = 1000; // 1 second

  /**
   * Handle API errors with user-friendly messages and retry logic
   */
  static async handleError(error: any, context?: string): Promise<void> {
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
  private static parseError(error: any): ApiError {
    if (error?.response?.data) {
      // Axios error
      return {
        message: error.response.data.message || error.response.data.error || 'An error occurred',
        status: error.response.status,
        code: error.response.data.code
      };
    }

    if (error?.message) {
      // Standard Error object
      return {
        message: error.message,
        status: error.status,
        code: error.code
      };
    }

    if (typeof error === 'string') {
      // String error
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

    // Show toast notification
    toast({
      title: 'Error',
      description: message,
      variant: 'destructive'
    });
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

  /**
   * Retry a failed API call with exponential backoff
   */
  static async retry<T>(
    apiCall: () => Promise<T>,
    context?: string,
    maxRetries: number = this.maxRetries
  ): Promise<T> {
    let lastError: any;

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
        console.log(`Retrying in ${delay}ms... (attempt ${attempt}/${maxRetries})`);
        
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    throw lastError;
  }

  /**
   * Handle network connectivity issues
   */
  static handleNetworkError(): void {
    toast({
      title: 'Connection Error',
      description: 'Please check your internet connection and try again.',
      variant: 'destructive'
    });
  }

  /**
   * Handle authentication errors
   */
  static handleAuthError(): void {
    toast({
      title: 'Authentication Required',
      description: 'Please sign in to continue.',
      variant: 'destructive'
    });

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

    toast({
      title: 'Rate Limited',
      description: message,
      variant: 'destructive'
    });
  }
}

/**
 * Hook for handling API errors in React components
 */
export function useApiErrorHandler() {
  const handleError = (error: any, context?: string) => {
    ApiErrorHandler.handleError(error, context);
  };

  const retry = <T>(apiCall: () => Promise<T>, context?: string) => {
    return ApiErrorHandler.retry(apiCall, context);
  };

  return { handleError, retry };
}

export default ApiErrorHandler;

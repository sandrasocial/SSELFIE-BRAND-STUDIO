/**
 * Type-safe error boundary specifically for authentication flows
 * Provides better error handling and recovery for auth-related errors
 */

import React, { Component, ReactNode, ErrorInfo } from 'react';
import type { AuthErrorType } from '../types/auth.js';
import { 
  convertErrorToAuthError, 
  formatAuthErrorMessage, 
  getErrorRecoveryAction,
  logAuthError 
} from '../lib/auth-errors.js';
import { sessionStorage } from '../lib/session-storage.js';

interface Props {
  children: ReactNode;
  fallback?: (error: AuthErrorType, retry: () => void) => ReactNode;
  onError?: (error: AuthErrorType, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: AuthErrorType | null;
  errorInfo: ErrorInfo | null;
}

export class AuthErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    const authError = convertErrorToAuthError(error);
    return {
      hasError: true,
      error: authError,
    };
  }

  override componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    const authError = convertErrorToAuthError(error);
    
    // Log the error
    logAuthError(authError, 'AuthErrorBoundary');
    
    // Clear session if it's a session-related error
    if (authError.code === 'SESSION_EXPIRED' || authError.code === 'SESSION_INVALID') {
      sessionStorage.clearSession();
    }
    
    this.setState({
      error: authError,
      errorInfo,
    });
    
    // Call custom error handler if provided
    this.props.onError?.(authError, errorInfo);
  }

  private handleRetry = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  private handleSignIn = (): void => {
    // Clear any stored session and redirect to sign in
    sessionStorage.clearSession();
    window.location.href = '/handler/sign-in';
  };

  override render(): ReactNode {
    if (this.state.hasError && this.state.error) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.handleRetry);
      }
      
      // Default error UI
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
            <div className="flex items-center mb-4">
              <div className="flex-shrink-0">
                <svg 
                  className="h-5 w-5 text-red-400" 
                  viewBox="0 0 20 20" 
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path 
                    fillRule="evenodd" 
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" 
                    clipRule="evenodd" 
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-gray-800">
                  Authentication Error
                </h3>
              </div>
            </div>
            
            <div className="mb-4">
              <p className="text-sm text-gray-600">
                {formatAuthErrorMessage(this.state.error)}
              </p>
              
              {getErrorRecoveryAction(this.state.error) && (
                <p className="text-sm text-gray-500 mt-2">
                  {getErrorRecoveryAction(this.state.error)}
                </p>
              )}
            </div>
            
            <div className="flex space-x-3">
              {this.state.error.retryable && (
                <button
                  onClick={this.handleRetry}
                  className="flex-1 bg-blue-600 text-white text-sm font-medium py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Try Again
                </button>
              )}
              
              {(this.state.error.code === 'SESSION_EXPIRED' || this.state.error.code === 'SESSION_INVALID') && (
                <button
                  onClick={this.handleSignIn}
                  className="flex-1 bg-gray-600 text-white text-sm font-medium py-2 px-4 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                >
                  Sign In
                </button>
              )}
              
              {!this.state.error.retryable && this.state.error.code !== 'SESSION_EXPIRED' && this.state.error.code !== 'SESSION_INVALID' && (
                <button
                  onClick={() => window.location.reload()}
                  className="flex-1 bg-gray-600 text-white text-sm font-medium py-2 px-4 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                >
                  Reload Page
                </button>
              )}
            </div>
            
            {process.env['NODE_ENV'] === 'development' && this.state.errorInfo && (
              <details className="mt-4">
                <summary className="text-sm text-gray-500 cursor-pointer">
                  Error Details (Development)
                </summary>
                <pre className="mt-2 text-xs text-gray-600 bg-gray-100 p-2 rounded overflow-auto">
                  {this.state.errorInfo.componentStack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// HOC for wrapping components with auth error boundary
export const withAuthErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>,
  fallback?: (error: AuthErrorType, retry: () => void) => ReactNode
) => {
  const WrappedComponent = (props: P) => (
    <AuthErrorBoundary fallback={fallback}>
      <Component {...props} />
    </AuthErrorBoundary>
  );
  
  WrappedComponent.displayName = `withAuthErrorBoundary(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
};
// Training Error Boundary with Retry Logic
// Comprehensive error handling for training flow with recovery strategies

import React, { Component, ReactNode } from 'react';
import { ErrorState, RetryStrategy, DEFAULT_RETRY_STRATEGIES } from '../../types/training.js';
import { Colors, Typography, Spacing, Transitions } from '../../styles/designSystem.js';

interface TrainingErrorBoundaryProps {
  children: ReactNode;
  onRetry?: () => void;
  fallback?: (error: Error, retry: () => void) => ReactNode;
}

interface TrainingErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
  retryCount: number;
  isRetrying: boolean;
}

export class TrainingErrorBoundary extends Component<
  TrainingErrorBoundaryProps,
  TrainingErrorBoundaryState
> {
  private retryStrategies: typeof DEFAULT_RETRY_STRATEGIES;

  constructor(props: TrainingErrorBoundaryProps) {
    super(props);
    
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0,
      isRetrying: false
    };

    this.retryStrategies = DEFAULT_RETRY_STRATEGIES;
  }

  static getDerivedStateFromError(error: Error): Partial<TrainingErrorBoundaryState> {
    return {
      hasError: true,
      error
    };
  }

  override componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({
      error,
      errorInfo
    });

    // Log error for monitoring
    console.error('Training Error Boundary caught error:', error, errorInfo);
    
    // Report to error tracking service if available
    if (typeof window !== 'undefined' && (window as any).errorReporting) {
      (window as any).errorReporting.captureException(error, {
        context: 'TrainingErrorBoundary',
        extra: errorInfo
      });
    }
  }

  private categorizeError = (error: Error): ErrorState => {
    const message = error.message.toLowerCase();
    
    if (message.includes('network') || message.includes('fetch')) {
      return {
        type: 'upload',
        code: 'NETWORK_ERROR',
        message: 'Network connection issue. Please check your internet connection.',
        recoverable: true,
        action: this.handleRetry
      };
    }
    
    if (message.includes('validation') || message.includes('invalid')) {
      return {
        type: 'validation',
        code: 'VALIDATION_ERROR',
        message: 'Image validation failed. Please check your photos and try again.',
        recoverable: true,
        action: this.handleRetry
      };
    }
    
    if (message.includes('training') || message.includes('model')) {
      return {
        type: 'training',
        code: 'TRAINING_ERROR',
        message: 'Training process failed. Our team has been notified.',
        recoverable: true,
        action: this.handleRetry
      };
    }
    
    return {
      type: 'system',
      code: 'UNKNOWN_ERROR',
      message: 'An unexpected error occurred. Please try again.',
      recoverable: true,
      action: this.handleRetry
    };
  };

  private getRetryStrategy = (errorType: ErrorState['type']): RetryStrategy => {
    switch (errorType) {
      case 'upload':
        return this.retryStrategies.upload;
      case 'training':
        return this.retryStrategies.training;
      case 'validation':
        return this.retryStrategies.validation;
      default:
        return this.retryStrategies.upload; // Default strategy
    }
  };

  private handleRetry = async () => {
    if (!this.state.error) return;

    const errorState = this.categorizeError(this.state.error);
    const strategy = this.getRetryStrategy(errorState.type);

    // Check if we've exceeded max attempts
    if (this.state.retryCount >= strategy.maxAttempts) {
      console.error('Max retry attempts exceeded');
      return;
    }

    this.setState({ isRetrying: true });

    // Calculate backoff delay
    const delay = strategy.backoffMs * Math.pow(strategy.backoffMultiplier, this.state.retryCount);
    
    try {
      // Wait for backoff period
      await new Promise(resolve => setTimeout(resolve, delay));
      
      // Call custom retry handler if provided
      if (this.props.onRetry) {
        await this.props.onRetry();
      }

      // Reset error state on successful retry
      this.setState({
        hasError: false,
        error: null,
        errorInfo: null,
        retryCount: this.state.retryCount + 1,
        isRetrying: false
      });
    } catch (retryError) {
      console.error('Retry failed:', retryError);
      this.setState({
        retryCount: this.state.retryCount + 1,
        isRetrying: false
      });
    }
  };

  private handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0,
      isRetrying: false
    });
  };

  override render() {
    if (this.state.hasError && this.state.error) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.handleRetry);
      }

      const errorState = this.categorizeError(this.state.error);
      const strategy = this.getRetryStrategy(errorState.type);
      const canRetry = this.state.retryCount < strategy.maxAttempts;

      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: Colors.background.main,
          padding: Spacing.luxury.md,
          fontFamily: Typography.body.fontFamily
        }}>
          <div style={{
            maxWidth: '600px',
            textAlign: 'center',
            padding: Spacing.luxury.lg,
            background: Colors.background.main,
            border: `1px solid ${Colors.border.light}`,
            borderRadius: '8px',
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)'
          }}>
            {/* Error Icon */}
            <div style={{
              width: '64px',
              height: '64px',
              margin: '0 auto',
              marginBottom: Spacing[6],
              borderRadius: '50%',
              background: Colors.status.error,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: Colors.text.inverse,
              fontSize: '24px'
            }}>
              ⚠
            </div>

            {/* Error Title */}
            <h2 style={{
              fontFamily: Typography.heading.fontFamily,
              fontSize: Typography.heading.fontSize.h3,
              fontWeight: Typography.heading.fontWeight,
              color: Colors.text.primary,
              marginBottom: Spacing[4],
              letterSpacing: Typography.heading.letterSpacing.normal
            }}>
              Something Went Wrong
            </h2>

            {/* Error Message */}
            <p style={{
              fontSize: Typography.body.fontSize.base,
              lineHeight: Typography.body.lineHeight.normal,
              color: Colors.text.secondary,
              marginBottom: Spacing[6]
            }}>
              {errorState.message}
            </p>

            {/* Retry Information */}
            {canRetry && (
              <div style={{
                padding: Spacing[4],
                background: Colors.background.alt,
                borderRadius: '4px',
                marginBottom: Spacing[6],
                fontSize: Typography.body.fontSize.sm,
                color: Colors.text.muted
              }}>
                Attempt {this.state.retryCount + 1} of {strategy.maxAttempts}
              </div>
            )}

            {/* Action Buttons */}
            <div style={{
              display: 'flex',
              gap: Spacing[4],
              justifyContent: 'center',
              flexWrap: 'wrap'
            }}>
              {canRetry && (
                <button
                  onClick={this.handleRetry}
                  disabled={this.state.isRetrying}
                  style={{
                    padding: `${Spacing[3]} ${Spacing[6]}`,
                    fontSize: Typography.body.fontSize.sm,
                    fontWeight: Typography.body.fontWeight.medium,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    background: Colors.primary,
                    color: Colors.text.inverse,
                    border: 'none',
                    borderRadius: '4px',
                    cursor: this.state.isRetrying ? 'not-allowed' : 'pointer',
                    transition: Transitions.luxury.hover,
                    opacity: this.state.isRetrying ? 0.6 : 1
                  }}
                >
                  {this.state.isRetrying ? 'Retrying...' : 'Try Again'}
                </button>
              )}

              <button
                onClick={this.handleReset}
                style={{
                  padding: `${Spacing[3]} ${Spacing[6]}`,
                  fontSize: Typography.body.fontSize.sm,
                  fontWeight: Typography.body.fontWeight.medium,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  background: 'transparent',
                  color: Colors.text.secondary,
                  border: `1px solid ${Colors.border.medium}`,
                  borderRadius: '4px',
                  cursor: 'pointer',
                  transition: Transitions.luxury.hover
                }}
                onMouseEnter={(e) => {
                  const target = e.target as HTMLButtonElement;
                  target.style.borderColor = Colors.primary;
                  target.style.color = Colors.primary;
                }}
                onMouseLeave={(e) => {
                  const target = e.target as HTMLButtonElement;
                  target.style.borderColor = Colors.border.medium;
                  target.style.color = Colors.text.secondary;
                }}
              >
                Start Over
              </button>
            </div>

            {/* Development Error Details */}
            {process.env['NODE_ENV'] === 'development' && this.state.errorInfo && (
              <details style={{
                marginTop: Spacing[8],
                textAlign: 'left',
                fontSize: Typography.body.fontSize.xs,
                color: Colors.text.muted
              }}>
                <summary style={{ cursor: 'pointer', marginBottom: Spacing[2] }}>
                  Error Details (Development)
                </summary>
                <pre style={{
                  background: Colors.background.alt,
                  padding: Spacing[4],
                  borderRadius: '4px',
                  overflow: 'auto',
                  whiteSpace: 'pre-wrap'
                }}>
                  {this.state.error.stack}
                  {'\n\n'}
                  Component Stack:
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
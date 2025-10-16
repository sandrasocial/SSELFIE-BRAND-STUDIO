import * as React from 'react';

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  retryCount: number;
}

export class CheckoutErrorBoundary extends React.Component<Props, State> {
  private retryTimeoutId: NodeJS.Timeout | null = null;

  constructor(props: Props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null,
      retryCount: 0
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return { 
      hasError: true, 
      error,
      retryCount: 0
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.error('Checkout Error Boundary caught error:', error, errorInfo);
    this.props.onError?.(error, errorInfo);
  }

  componentWillUnmount(): void {
    if (this.retryTimeoutId) {
      clearTimeout(this.retryTimeoutId);
    }
  }

  handleRetry = () => {
    if (this.state.retryCount >= 3) {
      console.warn('Maximum retry attempts reached');
      return;
    }

    this.setState((prevState: State) => ({
      hasError: false,
      error: null,
      retryCount: prevState.retryCount + 1
    }));
  };

  handleReload = () => {
    window.location.reload();
  };

  render(): React.ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const isNetworkError = this.state.error?.message?.toLowerCase().includes('network') || 
                             this.state.error?.message?.toLowerCase().includes('fetch');
      const isPaymentError = this.state.error?.message?.toLowerCase().includes('stripe') ||
                             this.state.error?.message?.toLowerCase().includes('payment');

      return (
        <div className="min-h-screen bg-white flex items-center justify-center p-4">
          <div className="max-w-md w-full text-center">
            <div className="mb-8">
              <div className="text-6xl mb-4">⚠️</div>
              <h1 className="text-2xl font-light mb-4" style={{ fontFamily: 'Times New Roman, serif' }}>
                {isPaymentError ? 'Payment Issue' : isNetworkError ? 'Connection Problem' : 'Something Went Wrong'}
              </h1>
              <p className="text-gray-600 mb-8 leading-relaxed">
                {isPaymentError && "We encountered an issue processing your payment. Your card has not been charged."}
                {isNetworkError && "We're having trouble connecting to our servers. Please check your internet connection."}
                {!isPaymentError && !isNetworkError && "An unexpected error occurred. Don't worry - this doesn't affect your account or payment."}
              </p>
            </div>

            <div className="space-y-4">
              {this.state.retryCount < 3 && (
                <button
                  onClick={this.handleRetry}
                  className="w-full bg-black text-white py-3 px-6 text-sm font-medium uppercase tracking-wider hover:bg-gray-800 transition-colors"
                >
                  Try Again ({3 - this.state.retryCount} attempts left)
                </button>
              )}
              
              <button
                onClick={this.handleReload}
                className="w-full border border-gray-300 text-gray-700 py-3 px-6 text-sm font-medium uppercase tracking-wider hover:bg-gray-50 transition-colors"
              >
                Reload Page
              </button>
              
              <button
                onClick={() => window.location.href = '/'}
                className="w-full text-gray-500 py-3 px-6 text-sm font-medium uppercase tracking-wider hover:text-gray-700 transition-colors"
              >
                Return Home
              </button>
            </div>

            {import.meta.env.DEV && this.state.error && (
              <details className="mt-8 p-4 bg-gray-50 rounded text-left">
                <summary className="cursor-pointer text-sm font-medium text-gray-700 mb-2">
                  Error Details (Development)
                </summary>
                <pre className="text-xs text-gray-600 overflow-auto">
                  {this.state.error.message}
                  {this.state.error.stack && '\n\n' + this.state.error.stack}
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
import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

// Luxury Error State Component
const LuxuryErrorState: React.FC<{ error?: Error }> = ({ error }) => (
  <div className="min-h-screen bg-white flex items-center justify-center">
    <div className="max-w-md text-center px-8">
      <div 
        className="text-xs tracking-widest uppercase text-gray-400 mb-8"
        style={{ fontFamily: 'Helvetica Neue', fontWeight: 300, letterSpacing: '0.3em' }}
      >
        System Error
      </div>
      <h1 
        className="text-2xl md:text-3xl text-black mb-6"
        style={{ 
          fontFamily: 'Times New Roman, serif', 
          fontWeight: 200, 
          letterSpacing: '0.25em',
          lineHeight: 1.1
        }}
      >
        Something went wrong
      </h1>
      <p className="text-gray-600 mb-8 leading-relaxed">
        Maya encountered an unexpected error. Please refresh the page or try again later.
      </p>
      <button
        onClick={() => window.location.reload()}
        className="text-xs tracking-widest uppercase text-gray-600 hover:text-black transition-colors duration-300 border-b border-transparent hover:border-black pb-1"
        style={{ fontFamily: 'Helvetica Neue', fontWeight: 300, letterSpacing: '0.2em' }}
      >
        Refresh Page
      </button>
      {process.env.NODE_ENV === 'development' && error && (
        <details className="mt-8 text-left">
          <summary className="text-xs text-gray-400 cursor-pointer">Technical Details</summary>
          <pre className="text-xs text-gray-500 mt-2 overflow-auto">
            {error.message}
            {error.stack}
          </pre>
        </details>
      )}
    </div>
  </div>
);

export class LuxuryErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Maya Error Boundary caught an error:', error, errorInfo);
    
    // In production, you might want to send this to an error reporting service
    if (process.env.NODE_ENV === 'production') {
      // Example: errorReportingService.captureException(error, { extra: errorInfo });
    }
  }

  public render() {
    if (this.state.hasError) {
      return this.props.fallback || <LuxuryErrorState error={this.state.error} />;
    }

    return this.props.children;
  }
}

export default LuxuryErrorBoundary;
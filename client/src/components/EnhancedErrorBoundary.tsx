import React, { Component, ErrorInfo } from 'react';
import { ErrorMetadata } from '../../shared/infrastructure-types.js';
import { infrastructureFlags } from '../../shared/feature-flags.js';
import { useFeatureFlag } from '../hooks/use-feature-flag.js';

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo, metadata: ErrorMetadata) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
}

// Enhanced error boundary with new features
class EnhancedErrorBoundaryImpl extends Component<Props, State> {
  public override state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const metadata: ErrorMetadata = {
      timestamp: Date.now(),
      component: this.constructor.name,
      errorCode: error.name,
      severity: 'medium',
      recoverable: true
    };

    this.props.onError?.(error, errorInfo, metadata);
  }

  public override render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="error-boundary-fallback">
          <h2>Something went wrong</h2>
          <button onClick={() => this.setState({ hasError: false })}>
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// Feature-flagged wrapper
export function EnhancedErrorBoundary(props: Props) {
  const [useNewErrorBoundary] = useFeatureFlag(infrastructureFlags.NEW_ERROR_BOUNDARY);

  if (!useNewErrorBoundary) {
    // Fall back to existing ErrorBoundary if feature flag is off
    const { ErrorBoundary } = require('./ErrorBoundary.js');
    return <ErrorBoundary {...props} />;
  }

  return <EnhancedErrorBoundaryImpl {...props} />;
}
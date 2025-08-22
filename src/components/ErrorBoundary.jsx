import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    });

    // Log error to our error reporting service
    this.logError(error, errorInfo);
  }

  logError = async (error, errorInfo) => {
    try {
      await fetch('/api/log-error', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          error: error.toString(),
          errorInfo: errorInfo,
          location: window.location.href,
          timestamp: new Date().toISOString(),
        }),
      });
    } catch (err) {
      console.error('Failed to log error:', err);
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary-container">
          <h2>Oops! Something went wrong.</h2>
          <p>We're working on fixing this issue. Please try again later.</p>
          <button
            onClick={() => {
              window.location.reload();
            }}
            className="retry-button"
          >
            Retry
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
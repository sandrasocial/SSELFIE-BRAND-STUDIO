import React from 'react';
import './AuthError.css';

interface AuthErrorProps {
  message: string;
  code?: string;
  onRetry?: () => void;
  showRetry?: boolean;
}

export const AuthError: React.FC<AuthErrorProps> = ({
  message,
  code,
  onRetry,
  showRetry = false
}) => {
  return (
    <div className="auth-error" role="alert">
      <div className="error-content">
        <svg 
          className="error-icon" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12" y2="16" />
        </svg>
        
        <div className="error-details">
          <p className="error-message">{message}</p>
          {code && (
            <p className="error-code">Error code: {code}</p>
          )}
        </div>
      </div>

      {showRetry && onRetry && (
        <button 
          className="retry-button"
          onClick={onRetry}
          type="button"
        >
          Try Again
        </button>
      )}
    </div>
  );
};
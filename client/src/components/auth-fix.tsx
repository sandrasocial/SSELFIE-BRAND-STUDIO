import React, { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';

interface AuthFixProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * AuthFix Component
 * 
 * A utility component that handles common authentication edge cases and provides
 * a stable authentication state for child components.
 * 
 * Features:
 * - Handles token refresh automatically
 * - Provides loading states during auth operations
 * - Graceful fallback for unauthenticated states
 * - Prevents flash of unauthenticated content
 */
export const AuthFix: React.FC<AuthFixProps> = ({ 
  children, 
  fallback = <div className="auth-loading">Authenticating...</div> 
}) => {
  const { user, isLoading, error, refreshAuth } = useAuth();
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Handle initial authentication check
    const initializeAuth = async () => {
      try {
        // Attempt to refresh/validate existing auth
        await refreshAuth();
      } catch (err) {
        console.warn('Auth initialization failed:', err);
      } finally {
        setIsInitialized(true);
      }
    };

    if (!isInitialized && !isLoading) {
      initializeAuth();
    }
  }, [isInitialized, isLoading, refreshAuth]);

  // Show loading state during initialization
  if (!isInitialized || isLoading) {
    return <>{fallback}</>;
  }

  // Show error state if authentication failed
  if (error) {
    return (
      <div className="auth-error">
        <p>Authentication error: {error.message}</p>
        <button onClick={() => refreshAuth()}>
          Retry Authentication
        </button>
      </div>
    );
  }

  // Render children if authenticated, fallback if not
  return user ? <>{children}</> : <>{fallback}</>;
};

/**
 * Higher-order component version of AuthFix
 */
export const withAuthFix = <P extends object>(
  Component: React.ComponentType<P>,
  fallback?: React.ReactNode
) => {
  return (props: P) => (
    <AuthFix fallback={fallback}>
      <Component {...props} />
    </AuthFix>
  );
};

export default AuthFix;
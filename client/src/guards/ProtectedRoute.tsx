import { ComponentType, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '../hooks/use-auth';

interface ProtectedRouteProps {
  component: ComponentType<any>;
  [key: string]: any;
}

export default function ProtectedRoute({ component: Component, ...props }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const [, setLocation] = useLocation();
  
  // Enhanced logging for debugging navigation issues
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('ProtectedRoute state:', { isAuthenticated, isLoading, hasUser: !!user });
    }
  }, [isAuthenticated, isLoading, user]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      // Use proper authentication flow
      window.location.href = '/api/login';
    }
  }, [isLoading, isAuthenticated]);
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-black border-t-transparent rounded-full" />
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-black border-t-transparent rounded-full" />
      </div>
    );
  }
  
  return <Component {...props} />;
}
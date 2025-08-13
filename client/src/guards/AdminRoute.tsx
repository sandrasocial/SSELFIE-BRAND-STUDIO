import { ComponentType } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '../hooks/use-auth';

interface AdminRouteProps {
  component: ComponentType<any>;
  [key: string]: any;
}

export default function AdminRoute({ component: Component, ...props }: AdminRouteProps) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  
  // Admin bypass system - protect Sandra's consulting agents infrastructure
  const isAdmin = user?.email === 'ssa@ssasocial.com' ||
                  user?.adminBypass === true;
  
  // Debug logging for admin access
  console.log('🔐 AdminRoute debug:', { 
    userEmail: user?.email, 
    isAdmin, 
    isAuthenticated, 
    isLoading 
  });
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-black border-t-transparent rounded-full" />
      </div>
    );
  }
  
  if (!isAuthenticated) {
    // Redirect to login for unauthenticated users
    window.location.href = '/api/login';
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-black border-t-transparent rounded-full" />
      </div>
    );
  }
  
  if (!isAdmin) {
    // Redirect non-admin users to their workspace
    setLocation('/workspace');
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center p-8">
          <h2 className="text-xl mb-4">Admin Access Required</h2>
          <p className="text-gray-600 mb-4">Redirecting to your workspace...</p>
          <div className="animate-spin w-8 h-8 border-4 border-black border-t-transparent rounded-full mx-auto" />
        </div>
      </div>
    );
  }
  
  return <Component {...props} />;
}
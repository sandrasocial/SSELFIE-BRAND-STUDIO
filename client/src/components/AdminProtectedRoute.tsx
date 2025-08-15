import React from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/hooks/use-auth';

interface AdminProtectedRouteProps {
  component: React.ComponentType<any>;
  [key: string]: any;
}

// Admin route protection for Sandra's admin system access
export function AdminProtectedRoute({ component: Component, ...props }: AdminProtectedRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const [, setLocation] = useLocation();

  React.useEffect(() => {
    if (!isLoading && (!isAuthenticated || user?.email !== 'ssa@ssasocial.com')) {
      setLocation('/admin-access-only');
    }
  }, [isAuthenticated, isLoading, user, setLocation]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-[#0a0a0a] border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-[#666666]">Verifying admin access...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || user?.email !== 'ssa@ssasocial.com') {
    return null;
  }

  return <Component {...props} />;
}

export default AdminProtectedRoute;
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/hooks/useAuth';
import { CircularProgress } from '@mui/material';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredSubscription?: 'creator' | 'entrepreneur';
}

export const ProtectedRoute = ({ 
  children, 
  requiredSubscription 
}: ProtectedRouteProps) => {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }

    if (requiredSubscription && user?.subscription !== requiredSubscription) {
      router.push('/upgrade');
    }
  }, [user, isLoading, router, requiredSubscription]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <CircularProgress />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (requiredSubscription && user.subscription !== requiredSubscription) {
    return null;
  }

  return <>{children}</>;
};
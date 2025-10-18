import React from 'react';
import { useAuth } from '../../../hooks/use-auth.js';
import PageLoader from '../../../components/ui/page-loader.js';

/**
 * AuthGate
 * Central gate to avoid auth race conditions by ensuring the auth state
 * is resolved once before rendering the rest of the app/router.
 *
 * It does NOT redirect. It only blocks rendering while auth is loading.
 * ProtectedRoute remains responsible for guarding protected screens.
 */
export default function AuthGate({ children }: { children: React.ReactNode }) {
  const { isLoading } = useAuth();

  if (isLoading) {
    return <PageLoader />;
  }

  return <>{children}</>;
}


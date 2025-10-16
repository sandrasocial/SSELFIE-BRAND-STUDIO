import * as React from 'react';
import { useStackApp } from '@stackframe/react';
import PageLoader from '../PageLoader';

interface WithStackAuthProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * A component that ensures Stack Auth is properly initialized before rendering children.
 * Use this around components that need Stack Auth context.
 */
export function WithStackAuth({ children, fallback = <PageLoader /> }: WithStackAuthProps) {
  const app = useStackApp();
  const [isReady, setIsReady] = React.useState(false);

  React.useEffect(() => {
    if (!app) return;

    // Check if we already have user info
    app.getUser()
      .then(() => {
        console.log('✅ Stack Auth initialized and user state loaded');
        setIsReady(true);
      })
      .catch(error => {
        if (error?.message?.includes?.('not authenticated')) {
          console.log('✅ Stack Auth initialized (no user)');
          setIsReady(true);
        } else {
          console.error('❌ Stack Auth error:', error);
        }
      });
  }, [app]);

  if (!app || !isReady) {
    return fallback;
  }

  return children;
}
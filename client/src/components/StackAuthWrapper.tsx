import * as React from 'react';
import { StackProvider, StackTheme } from '@stackframe/react';
import { stackClientApp } from '../../../stack/client';

interface StackAuthWrapperProps {
  children: React.ReactNode;
}

function ErrorDisplay({ message }: { message: string }) {
  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center">
      <div className="text-center max-w-md mx-auto px-4">
        <div className="text-red-600 mb-4">⚠️</div>
        <h2 className="text-xl font-semibold text-gray-800 mb-2">Authentication Error</h2>
        <p className="text-gray-600 mb-4">There was a problem initializing authentication.</p>
        <button 
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800 transition-colors"
        >
          Try Again
        </button>
        <details className="mt-4 text-left">
          <summary className="cursor-pointer text-sm text-gray-500">Technical Details</summary>
          <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto">
            {message}
          </pre>
        </details>
      </div>
    </div>
  );
}

function LoadingDisplay({ attempt, maxAttempts }: { attempt: number; maxAttempts: number }) {
  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
        <p className="text-gray-600">Initializing authentication...</p>
        {attempt > 0 && (
          <p className="text-sm text-gray-400 mt-2">
            Attempt {attempt}/{maxAttempts}...
          </p>
        )}
      </div>
    </div>
  );
}

export default function StackAuthWrapper({ children }: StackAuthWrapperProps) {
  console.log('🔐 Initializing Stack Auth wrapper...');
  const [isReady, setIsReady] = React.useState(false);
  const [error, setError] = React.useState<Error | null>(null);
  const initAttempts = React.useRef(0);
  const maxAttempts = 3;

  React.useEffect(() => {
    let mounted = true;
    let timeoutId: NodeJS.Timeout;

    const initializeAuth = async () => {
      try {
        console.log('🔄 Stack Auth initialization starting...');
        if (!stackClientApp) {
          throw new Error('Stack Auth client app is not initialized');
        }

        // Initialize immediately - don't wait for getUser()
        if (mounted) {
          console.log('✅ Stack Auth provider ready');
          setIsReady(true);
          setError(null);
        }

        // Check user state in the background
        try {
          const user = await stackClientApp.getUser();
          console.log('✅ Stack Auth initialized successfully:', user ? 'with user' : 'no user');
        } catch (error: any) {
          if (error?.message?.includes?.('not authenticated')) {
            console.log('✅ Stack Auth initialized successfully (no user)');
          } else {
            console.warn('⚠️ Non-critical Stack Auth error:', error);
          }
        }
      } catch (error) {
        console.error('❌ Stack Auth initialization error:', error);
        if (mounted && initAttempts.current < maxAttempts) {
          initAttempts.current++;
          console.log(`🔄 Retrying Stack Auth initialization (attempt ${initAttempts.current}/${maxAttempts})...`);
          setTimeout(initializeAuth, 1000);
        } else if (mounted) {
          setError(error instanceof Error ? error : new Error('Unknown error during initialization'));
        }
      }
    };

    // Start initialization immediately
    initializeAuth();

    return () => {
      mounted = false;
    };
  }, []);

  if (error) {
    return <ErrorDisplay message={error.message} />;
  }

  if (!isReady) {
    return <LoadingDisplay attempt={initAttempts.current} maxAttempts={maxAttempts} />;
  }

  // Ensure stackClientApp is properly typed and available
  if (!stackClientApp) {
    return <ErrorDisplay message="Stack Auth client app is not available" />;
  }

  // We need to cast to the exact type expected by StackProvider
  return (
    <React.Suspense fallback={<LoadingDisplay attempt={0} maxAttempts={maxAttempts} />}>
      <StackProvider app={stackClientApp as any /* Type cast needed for tokenStore compatibility */}>
        <StackTheme>
          {children}
        </StackTheme>
      </StackProvider>
    </React.Suspense>
  );
}
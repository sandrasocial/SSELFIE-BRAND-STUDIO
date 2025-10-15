import React from 'react';
import { StackProvider, StackTheme } from '@stackframe/react';
import { stackClientApp } from '../../../stack/client';

interface StackAuthWrapperProps {
  children: React.ReactNode;
}

export default function StackAuthWrapper({ children }: StackAuthWrapperProps) {
  console.log('🔐 Initializing Stack Auth wrapper...');
  const [isReady, setIsReady] = React.useState(false);
  const [error, setError] = React.useState<Error | null>(null);
  const initAttempts = React.useRef(0);
  const maxAttempts = 3;

  React.useEffect(() => {
    // Ensure Stack Auth is properly initialized
    const initializeAuth = async () => {
      try {
        if (!stackClientApp) {
          throw new Error('Stack Auth client app is not initialized');
        }

        // Verify Stack Auth is working
        await new Promise<void>((resolve, reject) => {
          const timeout = setTimeout(() => {
            reject(new Error('Stack Auth initialization timeout'));
          }, 5000);

          Promise.resolve(stackClientApp.getUser())
            .then(() => {
              console.log('✅ Stack Auth initialized successfully (with user)');
              clearTimeout(timeout);
              resolve();
            })
            .catch((error) => {
              if (error?.message?.includes('not authenticated')) {
                // This is expected if no user is signed in
                console.log('✅ Stack Auth initialized successfully (no user)');
                clearTimeout(timeout);
                resolve();
              } else {
                reject(error);
              }
            });
        });

        setIsReady(true);
        setError(null);
      } catch (error) {
        console.error('❌ Stack Auth initialization error:', error);
        if (initAttempts.current < maxAttempts) {
          initAttempts.current++;
          console.log(`🔄 Retrying Stack Auth initialization (attempt ${initAttempts.current}/${maxAttempts})...`);
          setTimeout(initializeAuth, 1000); // Retry after 1 second
        } else {
          setError(error as Error);
        }
      }
    };

    initializeAuth();
  }, []);

  if (error) {
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
              {error.message}
            </pre>
          </details>
        </div>
      </div>
    );
  }

  if (!isReady) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-gray-600">Initializing authentication...</p>
          {initAttempts.current > 0 && (
            <p className="text-sm text-gray-400 mt-2">
              Attempt {initAttempts.current}/{maxAttempts}...
            </p>
          )}
        </div>
      </div>
    );
  }

  // Ensure stackClientApp is properly typed and available
  if (!stackClientApp) {
    throw new Error('Stack Auth client app is not available');
  }

  return (
    <StackProvider app={stackClientApp as any /* WORKAROUND: Type mismatch in tokenStore null handling */}>
      <StackTheme>
        {children}
      </StackTheme>
    </StackProvider>
  );
}
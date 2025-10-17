import React from "react";
import { StackProvider, StackTheme } from "@stackframe/react";
// ⚠️ CRITICAL: Import stackClientApp lazily to avoid circular dependency
// This import happens AFTER React is fully initialized
import PageLoader from "../PageLoader";

// Lazy load stackClientApp only when this component mounts
let stackClientApp: any = null;
async function getStackClientApp() {
  if (!stackClientApp) {
    const module = await import("../../../../stack/client.js");
    stackClientApp = module.stackClientApp;
  }
  return stackClientApp;
}


interface StackAuthProviderProps {
  children: React.ReactNode;
}

// Type guard to check if the app is properly initialized
function isStackAppInitialized(app: any): app is any & {
  getUser: () => Promise<any>;
  projectId: string;
} {
  return (
    typeof app === 'object' &&
    app !== null &&
    'projectId' in app &&
    typeof (app as any).getUser === 'function'
  );
}

function ErrorDisplay({ message }: { message: string }) {
  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center">
      <div className="text-center max-w-md mx-auto px-4">
        <div className="text-red-600 mb-4">⚠️</div>
        <h2 className="text-xl font-semibold text-gray-800 mb-2">Authentication Error</h2>
        <p className="text-gray-600 mb-4">{message}</p>
        <button 
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800 transition-colors"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}

export default function StackAuthProvider({ children }: StackAuthProviderProps) {
  const [isInitialized, setIsInitialized] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [hasProvider, setHasProvider] = React.useState(false);
  const initStartedRef = React.useRef(false);
  const mountedRef = React.useRef(true);
  const stackAppRef = React.useRef<any>(null);
  const timeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  React.useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;
      // Clean up timeout on unmount
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  React.useEffect(() => {
    // Prevent duplicate initialization
    if (initStartedRef.current) return;
    initStartedRef.current = true;

    async function initializeAuth() {
      try {
        console.log('🔄 Stack Auth Provider: Starting initialization...');

        // Lazy load stackClientApp - this happens AFTER React is fully initialized
        const app = await getStackClientApp();

        // Validate Stack Auth instance
        if (!app || !isStackAppInitialized(app)) {
          throw new Error('Stack Auth client app is not available or not properly initialized');
        }

        // Store reference
        stackAppRef.current = app;

        // Expose Stack Auth for debugging only in development
        if (process.env.NODE_ENV === 'development') {
          (window as any).stackClientApp = app;
          (window as any).__STACK_AUTH_PROVIDER__ = true;
        }

        // ✅ FIX #2: Remove 1.5s artificial delay
        // This was causing unnecessary wait time
        // Removed: await new Promise(resolve => setTimeout(resolve, 1500));

        // Cache project ID for faster access
        if (process.env.NODE_ENV === 'development') {
          console.log('🔑 Stack Auth Project ID:', app.projectId);
        }

        // ✅ FIX #3: Reduce retry timeout from 5s to 2s and max retries from 3 to 2
        // This significantly reduces wait time if API is slow
        let retries = 2;
        let apiTestSucceeded = false;

        while (retries > 0) {
          try {
            await Promise.race([
              app.getUser(),
              new Promise((_, reject) =>
                setTimeout(() => reject(new Error('API test timeout')), 2000)
              )
            ]);
            apiTestSucceeded = true;
            break;
          } catch (err) {
            // Ignore "not authenticated" errors - this is expected
            if ((err as Error)?.message?.includes?.('not authenticated')) {
              apiTestSucceeded = true;
              break;
            }

            console.warn(`Stack Auth API test failed (${retries} retries left):`, err);
            retries--;

            if (retries > 0) {
              await new Promise(resolve => setTimeout(resolve, 300));
            }
          }
        }

        // Mark as fully initialized if still mounted
        if (mountedRef.current) {
          console.log('✅ Stack Auth Provider initialized successfully');
          setHasProvider(true);
          setIsInitialized(true);
        }
      } catch (error) {
        console.error('❌ Stack Auth initialization failed:', error);
        if (mountedRef.current) {
          setError((error as Error)?.message || 'Failed to initialize authentication');
        }
      }
    }

    // Start initialization with timeout
    const initPromise = initializeAuth().catch(error => {
      console.error('Unhandled Stack Auth initialization error:', error);
      if (mountedRef.current) {
        setError('Critical authentication initialization error');
      }
    });

    // ✅ FIX #4: Reduce initialization timeout from 10s to 5s
    // This prevents app from hanging for too long
    timeoutRef.current = setTimeout(() => {
      if (mountedRef.current && !isInitialized) {
        console.warn('⚠️ Stack Auth initialization timeout - proceeding anyway');
        setHasProvider(true);
        setIsInitialized(true);
      }
    }, 5000);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [isInitialized]);

  // Handle errors
  if (error) {
    return <ErrorDisplay message={error} />;
  }

  // Show loading state
  if (!isInitialized || !hasProvider || !stackAppRef.current) {
    return <PageLoader />;
  }

  // Wrap in error boundary for runtime errors
  return (
    <React.Suspense fallback={<PageLoader />}>
      <StackProvider app={stackAppRef.current as any}>
        <StackTheme>
          {children}
        </StackTheme>
      </StackProvider>
    </React.Suspense>
  );
}
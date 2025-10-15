import React from "react";
import { StackProvider, StackTheme, StackClientApp } from "@stackframe/react";
import { stackClientApp } from "../../../../stack/client.js";
import { PageLoader } from "../PageLoader";
import { patchStackFrameReact } from "../../lib/stackframe-patch";

interface StackAuthProviderProps {
  children: React.ReactNode;
}

// Type guard to check if the app is properly initialized
function isStackAppInitialized(app: StackClientApp): app is StackClientApp & {
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
  const stackAppRef = React.useRef<StackClientApp | null>(null);

  React.useEffect(() => {
    mountedRef.current = true;
    
    // Apply the Stack Auth patch
    try {
      patchStackFrameReact();
    } catch (error) {
      console.error('Failed to patch Stack Auth:', error);
    }

    return () => {
      mountedRef.current = false;
    };
  }, []);

  React.useEffect(() => {
    // Prevent duplicate initialization
    if (initStartedRef.current) return;
    initStartedRef.current = true;

    async function initializeAuth() {
      try {
        // Validate Stack Auth instance
        if (!stackClientApp || !isStackAppInitialized(stackClientApp)) {
          throw new Error('Stack Auth client app is not available or not properly initialized');
        }

        // Store reference
        stackAppRef.current = stackClientApp;

        // Expose Stack Auth for debugging only in development
        if (process.env.NODE_ENV === 'development') {
          (window as any).stackClientApp = stackClientApp;
          (window as any).__STACK_AUTH_PROVIDER__ = true;
        }

        // Give Stack Auth time to fully initialize
        await new Promise(resolve => setTimeout(resolve, 200));

        // Test basic API access (catch failure gracefully)
        try {
          await stackClientApp.getUser();
        } catch (err) {
          // Ignore "not authenticated" errors
          if (!((err as Error)?.message?.includes?.('not authenticated'))) {
            console.warn('Stack Auth API test failed:', err);
          }
        }

        // Mark as fully initialized if still mounted
        if (mountedRef.current) {
          console.log('✅ Stack Auth Provider initialized');
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

    // Start initialization
    initializeAuth().catch(error => {
      console.error('Unhandled Stack Auth initialization error:', error);
      if (mountedRef.current) {
        setError('Critical authentication initialization error');
      }
    });
  }, []);

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
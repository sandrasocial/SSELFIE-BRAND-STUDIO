import React from 'react';
import * as stackAuth from '@stackframe/react';

// @ts-ignore - Stack Auth has broken ESM exports, using workaround
const { SignIn: StackSignIn, useStackApp } = (stackAuth as any).default || stackAuth;

// Custom Stack Auth SignIn wrapper that handles project configuration errors gracefully
export const SafeStackSignIn: React.FC = () => {
  const [hasProjectError, setHasProjectError] = React.useState(false);
  
  React.useEffect(() => {
    // Set up global error handler for Stack Auth project errors
    const handleError = (error: ErrorEvent) => {
      if (error.message.includes('sign_up_enabled') || error.message.includes('_clientProjectFromCrud')) {
        console.error('🛑 Stack Auth project configuration error detected:', error.message);
        setHasProjectError(true);
        error.preventDefault(); // Prevent the error from bubbling up
      }
    };
    
    window.addEventListener('error', handleError);
    
    return () => {
      window.removeEventListener('error', handleError);
    };
  }, []);
  
  if (hasProjectError) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center px-4">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-light tracking-widest mb-8" style={{ fontFamily: 'Times New Roman, serif' }}>
              SSELFIE STUDIO
            </h2>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
              <h3 className="text-lg font-medium text-amber-800 mb-4">Authentication System Loading</h3>
              <p className="text-amber-700 mb-6">
                Our authentication system is initializing. This may take a few moments.
              </p>
              <button
                onClick={() => {
                  setHasProjectError(false);
                  window.location.reload();
                }}
                className="w-full bg-amber-600 hover:bg-amber-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
              >
                Retry Sign In
              </button>
              <div className="mt-4 pt-4 border-t border-amber-200">
                <p className="text-sm text-amber-600">
                  Alternative: <a href="/magic-link" className="underline hover:no-underline">Sign in with email</a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  // Wrap Stack Auth SignIn with error boundary
  return (
    <React.Suspense fallback={
      <div className="min-h-screen bg-stone-50 flex items-center justify-center px-4">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-light tracking-widest mb-8" style={{ fontFamily: 'Times New Roman, serif' }}>
              SSELFIE STUDIO
            </h2>
            <div className="animate-spin w-8 h-8 border-4 border-black border-t-transparent rounded-full mx-auto" />
            <p className="mt-4 text-gray-600">Loading authentication...</p>
          </div>
        </div>
      </div>
    }>
      <ErrorBoundary
        fallback={
          <div className="min-h-screen bg-stone-50 flex items-center justify-center px-4">
            <div className="w-full max-w-md space-y-8">
              <div className="text-center">
                <h2 className="text-3xl font-light tracking-widest mb-8" style={{ fontFamily: 'Times New Roman, serif' }}>
                  SSELFIE STUDIO
                </h2>
                <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                  <h3 className="text-lg font-medium text-red-800 mb-4">Authentication Error</h3>
                  <p className="text-red-700 mb-6">
                    There was an issue loading the sign-in form. Please try refreshing the page.
                  </p>
                  <button
                    onClick={() => window.location.reload()}
                    className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
                  >
                    Refresh Page
                  </button>
                </div>
              </div>
            </div>
          </div>
        }
      >
        <div className="min-h-screen bg-stone-50 flex items-center justify-center px-4">
          <div className="w-full max-w-md space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-light tracking-widest mb-8" style={{ fontFamily: 'Times New Roman, serif' }}>
                WELCOME TO SSELFIE
              </h2>
            </div>
            <StackSignIn />
          </div>
        </div>
      </ErrorBoundary>
    </React.Suspense>
  );
};

// Simple Error Boundary component
class ErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error('Stack Auth SignIn Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}
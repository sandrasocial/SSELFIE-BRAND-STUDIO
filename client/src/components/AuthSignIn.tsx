import React from 'react';
import * as stackAuth from '@stackframe/react';
// @ts-ignore - Stack Auth has broken ESM exports, using workaround
const { SignIn, useStackApp } = (stackAuth as any).default || stackAuth;

// Simple error boundary component for Stack Auth issues
class StackAuthErrorBoundary extends React.Component<
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

  componentDidCatch(error: any) {
    console.error('Stack Auth Error:', error);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

export const AuthSignIn: React.FC = () => {
  // Use Stack Auth's built-in app hook to check initialization state
  const stackApp = useStackApp();
  
  const [hasError, setHasError] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState('');

  // Check if Stack Auth app is ready (this waits for project configuration to load)
  const isStackAuthReady = React.useMemo(() => {
    try {
      // Stack Auth app should be fully initialized when useStackApp returns a valid app
      return !!(stackApp && stackApp.projectId);
    } catch (error) {
      console.error('❌ Stack Auth app check failed:', error);
      setHasError(true);
      setErrorMessage('Authentication system initialization failed');
      return false;
    }
  }, [stackApp]);

  // Show loading state while Stack Auth initializes
  if (!isStackAuthReady && !hasError) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center px-4">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-light tracking-widest" style={{ fontFamily: 'Times New Roman, serif' }}>
              SSELFIE STUDIO
            </h2>
            <p className="mt-2 text-stone-600 font-light">Loading authentication...</p>
          </div>
          <div className="bg-white p-8 rounded-lg shadow-sm border border-stone-200">
            <div className="flex items-center justify-center">
              <div className="animate-spin w-6 h-6 border-2 border-stone-300 border-t-stone-800 rounded-full"></div>
              <span className="ml-3 text-stone-600">Initializing sign-in...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center px-4">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-light tracking-widest" style={{ fontFamily: 'Times New Roman, serif' }}>
              SSELFIE STUDIO
            </h2>
            <p className="mt-2 text-stone-600 font-light">Authentication Temporarily Unavailable</p>
          </div>
          <div className="bg-white p-8 rounded-lg shadow-sm border border-stone-200">
            <p className="text-stone-600 mb-4">We're experiencing technical difficulties with the sign-in system.</p>
            <button 
              onClick={() => window.location.reload()} 
              className="w-full bg-stone-800 text-white py-2 px-4 rounded hover:bg-black transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md space-y-8">
        {/* Premium header */}
        <div className="text-center">
          <h2 
            className="text-3xl font-light tracking-widest"
            style={{ 
              fontFamily: 'Times New Roman, serif'
            }}
          >
            SSELFIE STUDIO
          </h2>
          <p className="mt-2 text-stone-600 font-light">Sign in to your account</p>
        </div>

        {/* Stack Auth Sign In with premium styling and error boundary */}
        <div className="bg-white p-8 rounded-lg shadow-sm border border-stone-200 transition-all duration-300 ease-out">
          <StackAuthErrorBoundary fallback={
            <div className="text-center py-4">
              <p className="text-red-600 mb-2">Sign-in temporarily unavailable</p>
              <button onClick={() => window.location.reload()} className="text-blue-600 underline">
                Refresh page
              </button>
            </div>
          }>
            <SignIn 
              automaticRedirect={true}
              fullPage={false}
            />
          </StackAuthErrorBoundary>
        </div>

        {/* Additional navigation */}
        <div className="text-center">
          <p className="text-sm text-stone-600">
            Don't have an account?{' '}
            <a
              href="/handler/sign-up"
              className="text-stone-800 hover:text-black font-medium underline decoration-stone-300 hover:decoration-stone-600 transition-colors"
            >
              Sign up
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};
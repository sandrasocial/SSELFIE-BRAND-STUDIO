import React from 'react';
import * as stackAuth from '@stackframe/react';
// @ts-ignore - Stack Auth has broken ESM exports, using workaround
const { SignUp, useStackApp } = (stackAuth as any).default || stackAuth;

export const AuthSignUp: React.FC = () => {
  // Use Stack Auth's built-in app hook to check initialization state
  const stackApp = useStackApp();
  
  const [hasError, setHasError] = React.useState(false);

  // Check if Stack Auth app is ready (this waits for project configuration to load)
  const isStackAuthReady = React.useMemo(() => {
    try {
      return !!(stackApp && stackApp.projectId);
    } catch (error) {
      console.error('❌ Stack Auth SignUp app check failed:', error);
      setHasError(true);
      return false;
    }
  }, [stackApp]);

  if (!isStackAuthReady && !hasError) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center px-4">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-light tracking-widest" style={{ fontFamily: 'Times New Roman, serif' }}>
              JOIN SSELFIE STUDIO
            </h2>
            <p className="mt-2 text-stone-600 font-light">Loading registration...</p>
          </div>
          <div className="bg-white p-8 rounded-lg shadow-sm border border-stone-200">
            <div className="flex items-center justify-center">
              <div className="animate-spin w-6 h-6 border-2 border-stone-300 border-t-stone-800 rounded-full"></div>
              <span className="ml-3 text-stone-600">Initializing sign-up...</span>
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
              JOIN SSELFIE STUDIO
            </h2>
            <p className="mt-2 text-stone-600 font-light">Registration Temporarily Unavailable</p>
          </div>
          <div className="bg-white p-8 rounded-lg shadow-sm border border-stone-200">
            <p className="text-stone-600 mb-4">We're experiencing technical difficulties with the registration system.</p>
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
            JOIN SSELFIE STUDIO
          </h2>
          <p className="mt-2 text-stone-600 font-light">Create your account</p>
        </div>

        {/* Stack Auth Sign Up with premium styling */}
        <div className="bg-white p-8 rounded-lg shadow-sm border border-stone-200 transition-all duration-300 ease-out">
          <SignUp 
            automaticRedirect={true}
            fullPage={false}
          />
        </div>

        {/* Additional navigation */}
        <div className="text-center">
          <p className="text-sm text-stone-600">
            Already have an account?{' '}
            <a
              href="/handler/sign-in"
              className="text-stone-800 hover:text-black font-medium underline decoration-stone-300 hover:decoration-stone-600 transition-colors"
            >
              Sign in
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};
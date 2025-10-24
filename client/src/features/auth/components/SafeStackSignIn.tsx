import * as React from 'react';
import { SignIn as StackSignIn } from '@stackframe/react';
import { useAuth } from '../../../hooks/use-auth.js';

// Custom Stack Auth SignIn wrapper that handles project configuration errors gracefully
export const SafeStackSignIn: React.FC = () => {
  
  // Add visible debug indicator
  React.useEffect(() => {
    const debugDiv = document.createElement('div');
    debugDiv.id = 'sselfie-debug';
    debugDiv.style.cssText = 'position:fixed;top:10px;right:10px;background:red;color:white;padding:5px;z-index:9999;font-size:12px;';
    debugDiv.textContent = 'SafeStackSignIn Loaded';
    document.body.appendChild(debugDiv);
    
    return () => {
      const existing = document.getElementById('sselfie-debug');
      if (existing) existing.remove();
    };
  }, []);
  // Only redirect from sign-in pages after successful authentication
  const { isAuthenticated } = useAuth();
  React.useEffect(() => {
    // Only redirect if we're on a sign-in page and authentication is complete
    const isOnSignInPage = window.location.pathname.includes('/sign-in') ||
                          window.location.pathname.includes('/handler/sign-in') ||
                          window.location.pathname.includes('/auth');
    if (isAuthenticated && isOnSignInPage) {
      // Redirect to home (SmartHome will handle routing based on user status)
      window.location.replace("/");
    }
  }, [isAuthenticated]);

  // Enhanced error UI specifically for project config errors
  const [hasProjectError, setHasProjectError] = React.useState(false);

  React.useEffect(() => {
    // Set up global error handler for Stack Auth project errors - more specific targeting
    const handleError = (error: ErrorEvent) => {
      // Only catch very specific Stack Auth project configuration errors
      if (error.message.includes('_clientProjectFromCrud') && error.message.includes('404')) {
        setHasProjectError(true);
        error.preventDefault(); // Prevent the error from bubbling up
      }
      // Don't catch sign_up_enabled errors as they might be recoverable
    };
    
    window.addEventListener('error', handleError);
    
    return () => {
      window.removeEventListener('error', handleError);
    };
  }, []);

  if (hasProjectError) {
    return (
      <div className="min-h-screen bg-amber-50 flex items-center justify-center px-4">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-light tracking-widest mb-8" style={{ fontFamily: 'Times New Roman, serif' }}>
              SSELFIE STUDIO
            </h2>
            <div className="bg-amber-100 border border-amber-200 rounded-lg p-6">
              <h3 className="text-lg font-medium text-amber-800 mb-4">Authentication Service Temporary Issue</h3>
              <p className="text-amber-700 mb-6">
                We're experiencing a temporary issue with our authentication service. This is not your fault.
              </p>
              <button
                onClick={() => window.location.reload()}
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
  
  // \u2705 CLEANUP: Removed nested Suspense boundary
  // RootWrapper handles all Suspense boundaries
  return (
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
  );
};

// Simple Error Boundary component
const ErrorBoundary: React.FC<{ fallback: React.ReactNode; children: React.ReactNode }> = ({ 
  children,
  fallback
}) => {
  const [hasError, setHasError] = React.useState(false);

  React.useEffect(() => {
    const errorHandler = (event: ErrorEvent) => {
      event.preventDefault();
      setHasError(true);
    };

    window.addEventListener('error', errorHandler);
    return () => window.removeEventListener('error', errorHandler);
  }, []);

  if (hasError) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};


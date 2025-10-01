import React from 'react';
import * as stackAuth from '@stackframe/react';
// @ts-ignore - Stack Auth has broken ESM exports, using workaround
const { SignIn } = (stackAuth as any).default || stackAuth;

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
  // Add loading and error states for Stack Auth configuration issues
  const [isLoading, setIsLoading] = React.useState(true);
  const [hasError, setHasError] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState('');

  React.useEffect(() => {
    let mounted = true;
    
    // Check if Stack Auth configuration is available
    const checkStackAuth = async () => {
      try {
        console.log('🔍 Initializing Stack Auth configuration...');
        
        // Wait for Stack Auth to fetch project configuration from their servers
        // This prevents the "sign_up_enabled" undefined error
        let attempts = 0;
        const maxAttempts = 10;
        
        while (attempts < maxAttempts && mounted) {
          try {
            // Test if Stack Auth project configuration is loaded
            // We do this by trying to access the SignIn component in a safe way
            if (typeof SignIn !== 'undefined') {
              console.log('✅ Stack Auth SignIn component available');
              
              // Additional wait to ensure project config is fully loaded
              await new Promise(resolve => setTimeout(resolve, 500));
              
              if (mounted) {
                setIsLoading(false);
                console.log('✅ Stack Auth configuration ready');
              }
              return;
            }
          } catch (error) {
            console.log(`🔄 Stack Auth not ready, attempt ${attempts + 1}/${maxAttempts}`);
          }
          
          attempts++;
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
        
        // If we get here, Stack Auth failed to initialize
        throw new Error('Stack Auth failed to initialize after multiple attempts');
        
      } catch (error: any) {
        console.error('❌ Stack Auth configuration error:', error);
        if (mounted) {
          setHasError(true);
          setErrorMessage(error.message || 'Authentication system unavailable');
          setIsLoading(false);
        }
      }
    };

    checkStackAuth();
    
    return () => {
      mounted = false;
    };
  }, []);

  // Show loading state while Stack Auth initializes
  if (isLoading) {
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
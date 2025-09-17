/* eslint-disable no-console */
import React, { useEffect, useState } from 'react';
import { Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { ProtectedRoute } from './components/ProtectedRoute';
import { Toaster } from "./components/ui/toaster";
import { TooltipProvider } from "./components/ui/tooltip";
import { StackProvider, StackTheme, SignIn, SignUp } from "@stackframe/react";
import { stackClientApp } from "../../stack/client";
import { useAuth } from "./hooks/use-auth";
import { STACK_PROJECT_ID, STACK_PUBLISHABLE_CLIENT_KEY } from './env';
import { useQuery } from "@tanstack/react-query";
import { detectBrowserIssues, showDomainHelp } from "./utils/browserCompat";
import { optimizeImageLoading, enableServiceWorkerCaching } from "./utils/performanceOptimizations";
import { optimizeRuntime } from "./utils/webVitals";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { initializeMobileOptimization } from "./utils/mobileOptimization";
import { performanceMonitor } from "./utils/performanceMonitor";
import { initializeRuntimeOptimization } from "./utils/runtimeOptimization";

// Core pages (loaded immediately) - BRAND STUDIO IS PRIMARY
import AppLayout from "./pages/AppLayout";

// Lazy load non-critical pages for better performance
import { lazy, Suspense } from "react";

const BusinessLanding = lazy(() => import("./pages/business-landing"));
const SimpleTraining = lazy(() => import("./pages/simple-training"));
const SimpleCheckout = lazy(() => import("./pages/simple-checkout"));
const PaymentSuccess = lazy(() => import("./pages/payment-success"));
const ThankYou = lazy(() => import("./pages/thank-you"));

// Components
import { PageLoader } from "./components/PageLoader";

// Smart Home component - Routes authenticated users to Brand Studio
function SmartHome() {
  const [, setLocation] = useLocation();
  const { isAuthenticated, isLoading } = useAuth();

  // Fetch user model status to determine training completion
  const { data: userModel, isLoading: isModelLoading } = useQuery({
    queryKey: ['/api/user-model'],
    enabled: isAuthenticated, // we consider Stack user sufficient to fetch
    retry: false,
    staleTime: 30 * 1000
  });

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      // Check training status and route accordingly
      if (userModel && (userModel as { trainingStatus?: string }).trainingStatus !== 'completed') {
        console.log('🎯 User authenticated but needs training, redirecting to simple-training');
        setLocation('/simple-training');
      } else {
        console.log('✅ User authenticated with completed training, redirecting to Brand Studio');
  setLocation('/app');
      }
    } else if (!isLoading && !isAuthenticated) {
      console.log('🔍 User not authenticated, staying on landing page');
    }
  }, [isAuthenticated, isLoading, userModel, setLocation]);

  // Show loading while determining auth state and training status
  if (isLoading || (isAuthenticated && isModelLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-black border-t-transparent rounded-full" />
      </div>
    );
  }

  // For unauthenticated users, show landing page content
  if (!isAuthenticated) {
    return null; // Let the route system handle showing BusinessLanding
  }

  // For authenticated users, redirect will happen in useEffect
  return null;
}

// Protected wrapper component that handles Stack Auth authentication

function Router() {
  return (
    <div>
      {/* STACK AUTH HANDLER - Explicit routes only to avoid accidental matches */}
      <Route path="/handler/sign-in" component={HandlerRoutes} />
      <Route path="/handler/sign-up" component={HandlerRoutes} />
      <Route path="/handler" component={HandlerRoutes} />
      {/* Guard against accidental /handler/app by redirecting to /app */}
      <Route path="/handler/app" component={() => { window.location.href = '/app'; return null; }} />
      
      {/* OAuth callback handler */}
      <Route path="/handler/oauth-callback" component={OAuthCallbackHandler} />
      
      {/* HOME ROUTE - Smart routing based on authentication and training status */}
      <Route path="/" component={() => {
        const { isAuthenticated, isLoading } = useAuth();
        
        if (isLoading) {
          return <PageLoader />;
        }
        
        if (isAuthenticated) {
          return <SmartHome />;
        }
        
        return (
          <Suspense fallback={<PageLoader />}>
            <BusinessLanding />
          </Suspense>
        );
      }} />
      
      {/* PUBLIC ROUTES */}
      <Route path="/business" component={() => (
        <Suspense fallback={<PageLoader />}>
          <BusinessLanding />
        </Suspense>
      )} />

      {/* PAYMENT FLOW */}
      <Route path="/simple-checkout" component={() => (
        <Suspense fallback={<PageLoader />}>
          <SimpleCheckout />
        </Suspense>
      )} />
      <Route path="/thank-you" component={() => (
        <Suspense fallback={<PageLoader />}>
          <ThankYou />
        </Suspense>
      )} />
      <Route path="/payment-success" component={() => (
        <Suspense fallback={<PageLoader />}>
          <PaymentSuccess />
        </Suspense>
      )} />

      {/* PROTECTED ROUTES */}
      
      {/* AI TRAINING WORKFLOW */}
      <Route path="/simple-training" component={(props) => (
        <ProtectedRoute component={() => (
          <Suspense fallback={<PageLoader />}>
            <SimpleTraining />
          </Suspense>
        )} {...props} />
      )} />

      {/* NEW TABBED UI ROUTE */}
      <Route path="/app" component={() => (
        <Suspense fallback={<PageLoader />}>
          <AppLayout />
        </Suspense>
      )} />



    </div>
  );
}

// OAuth Callback Handler component
function OAuthCallbackHandler() {
  const { isAuthenticated, isLoading, hasStackAuthUser, stackUser } = useAuth();
  const [redirectAttempted, setRedirectAttempted] = useState(false);
  const [showFallback, setShowFallback] = useState(false);
  // ensure we don't get stuck on callback
  useEffect(() => {
    const timer = setTimeout(() => {
      const hasAccess = document.cookie.includes('stack-access');
      if (!hasAccess && !hasStackAuthUser) {
        // if SDK failed to set cookie, bounce once back to sign-in to restart flow
        window.location.replace('/handler/sign-in');
      }
    }, 8000);
    return () => clearTimeout(timer);
  }, [hasStackAuthUser]);
  
  useEffect(() => {
    console.log('🔄 OAuth Callback Handler: Processing authentication...');
    console.log('🍪 Cookies in callback:', document.cookie);
    console.log('🔍 Stack user exists:', !!stackUser?.id);
    console.log('🔍 Has Stack Auth user:', hasStackAuthUser);
    console.log('🔍 Is authenticated:', isAuthenticated);
    console.log('🔍 Is loading:', isLoading);
    console.log('🔍 Current URL:', window.location.href);
    console.log('🔍 URL search params:', window.location.search);
    
    // Check if we have authentication cookies
    const hasStackAccess = document.cookie.includes('stack-access');
    console.log('🔍 Has stack-access cookie:', hasStackAccess);
    
    // Check for OAuth outer cookies
    const oauthOuterCookies = document.cookie.split(';').filter(cookie => cookie.includes('stack-oauth-outer'));
    console.log('🔍 OAuth outer cookies found:', oauthOuterCookies.length);
    
    // Check if this looks like an OAuth callback (has code parameter)
    const hasOAuthCode = window.location.search.includes('code=');
    console.log('🔍 Has OAuth code parameter:', hasOAuthCode);
    
    // Proactively invoke SDK callback handlers if available
    (async () => {
      try {
        const anyApp = stackClientApp as unknown as Record<string, any>;
        if (typeof anyApp?.processOAuthCallback === 'function') {
          await anyApp.processOAuthCallback();
          console.log('🔄 OAuth Callback: processOAuthCallback invoked');
        } else if (typeof anyApp?.handleOAuthCallback === 'function') {
          await anyApp.handleOAuthCallback();
          console.log('🔄 OAuth Callback: handleOAuthCallback invoked');
        }
      } catch (e) {
        console.log('⚠️ OAuth Callback: SDK callback invocation failed (non-fatal)', e);
      }
    })();

    // If we have a Stack Auth user, we can proceed even if database user isn't loaded yet
    if (hasStackAuthUser && !redirectAttempted) {
      console.log('✅ OAuth Callback: Stack Auth user found, redirecting to /app');
      setRedirectAttempted(true);
      // Small delay to ensure cookies are properly set
      setTimeout(() => {
        window.location.href = '/app';
      }, 1000);
    } else if (!isLoading && !hasStackAuthUser && !redirectAttempted) {
      console.log('🔄 OAuth Callback: No Stack Auth user found yet, waiting for Stack Auth to process...');
      
      // Try to force Stack Auth to process the OAuth callback
      const forceProcessOAuth = async () => {
        try {
          if (stackClientApp) {
            console.log('🔄 OAuth Callback: Attempting to force Stack Auth to process OAuth callback...');
            
            // Try to trigger a refresh of the Stack Auth state
            // This might help Stack Auth process the OAuth callback
            setTimeout(() => {
              console.log('🔄 OAuth Callback: Refreshing page to let Stack Auth process OAuth callback...');
              window.location.reload();
            }, 2000);
          }
        } catch (error) {
          console.error('❌ OAuth Callback: Error forcing OAuth processing:', error);
        }
      };
      
      forceProcessOAuth();
      
      // Give Stack Auth more time to process the OAuth callback
      const waitForStackAuth = setTimeout(() => {
        if (hasStackAuthUser) {
          console.log('✅ OAuth Callback: Stack Auth user found after waiting, redirecting to /app');
          setRedirectAttempted(true);
          window.location.href = '/app';
        } else {
          console.log('❌ OAuth Callback: Still no Stack Auth user after waiting, redirecting to sign-in');
          setRedirectAttempted(true);
          window.location.href = '/handler/sign-in';
        }
      }, 5000);
      
      return () => clearTimeout(waitForStackAuth);
    }
    
    // Force redirect after 10 seconds if we have OAuth code but no Stack user
    if (hasOAuthCode && !hasStackAuthUser && !redirectAttempted) {
      const forceRedirectTimer = setTimeout(() => {
        console.log('⚠️ OAuth Callback: Force redirect after timeout');
        setRedirectAttempted(true);
        window.location.href = '/app';
      }, 10000);
      
      return () => clearTimeout(forceRedirectTimer);
    }
    
    // Show fallback link after 3 seconds if still loading
    const fallbackTimer = setTimeout(() => {
      if (isLoading || !hasStackAuthUser) {
        setShowFallback(true);
      }
    }, 3000);
    
    // Also show fallback if we have Stack Auth user but are still loading after 2 seconds
    const quickFallbackTimer = setTimeout(() => {
      if (hasStackAuthUser && isLoading) {
        setShowFallback(true);
      }
    }, 2000);
    
    return () => {
      clearTimeout(fallbackTimer);
      clearTimeout(quickFallbackTimer);
    };
  }, [isAuthenticated, isLoading, hasStackAuthUser, stackUser, redirectAttempted]);
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center max-w-md mx-auto px-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600 mb-2">Completing authentication...</p>
        <p className="text-sm text-gray-500 mb-4">Please wait while we process your login.</p>
        {/* Mount SignIn silently so the SDK can auto-process the OAuth callback */}
        <div style={{ display: 'none' }}>
          <SignIn app={stackClientApp} />
        </div>
        
        {showFallback && (
          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800 mb-3">
              If you're not automatically redirected, click one of the links below:
            </p>
            <div className="space-y-2">
              <a 
                href="/app" 
                className="inline-block bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors mr-2"
              >
                Continue to App
              </a>
              <a 
                href="/handler/sign-in" 
                className="inline-block bg-gray-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-700 transition-colors"
              >
                Try Sign In Again
              </a>
            </div>
            <p className="text-xs text-yellow-700 mt-2">
              This usually happens if you have slow internet or ad blockers enabled.
            </p>
            <div className="mt-3 text-xs text-gray-600">
              <p>Debug info:</p>
              <p>Stack User: {stackUser?.id ? 'Yes' : 'No'}</p>
              <p>Loading: {isLoading ? 'Yes' : 'No'}</p>
              <p>Has Stack Access Cookie: {document.cookie.includes('stack-access') ? 'Yes' : 'No'}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Stack Auth Handler component for authentication routes
function HandlerRoutes() {
  const handlerPath = window.location.pathname.replace('/handler/', '') || '';
  const currentUrl = window.location.href;
  const { isAuthenticated, isLoading } = useAuth();

  // Debug logging
  console.log('🔍 HandlerRoutes: handlerPath =', handlerPath);
  console.log('🔍 HandlerRoutes: currentUrl =', currentUrl);
  console.log('🔍 HandlerRoutes: isAuthenticated =', isAuthenticated);
  console.log('🔍 HandlerRoutes: Cookies =', document.cookie);
  console.log('🔍 HandlerRoutes: Stack Auth config =', {
    projectId: STACK_PROJECT_ID,
    publishableKey: STACK_PUBLISHABLE_CLIENT_KEY?.substring(0, 20) + '...'
  });
  
  // Check for OAuth outer cookies
  const oauthOuterCookies = document.cookie.split(';').filter(cookie => cookie.includes('stack-oauth-outer'));
  console.log('🔍 HandlerRoutes: OAuth outer cookies found:', oauthOuterCookies.length);
  if (oauthOuterCookies.length > 0) {
    console.log('🔍 HandlerRoutes: OAuth outer cookies:', oauthOuterCookies);
  }
  
  // Check for stack-access cookie
  const hasStackAccess = document.cookie.includes('stack-access');
  console.log('🔍 HandlerRoutes: Has stack-access cookie:', hasStackAccess);
  
  // Check if we're in an OAuth callback state (outer cookie)
  const isOAuthCallback = oauthOuterCookies.length > 0;
  console.log('🔍 HandlerRoutes: Is OAuth callback state:', isOAuthCallback);
  const alreadyProcessed = sessionStorage.getItem('oauth_processed') === '1';
  
  // If we're in OAuth callback state, let Stack Auth handle it automatically
  if (isOAuthCallback && !alreadyProcessed) {
    console.log('🔄 HandlerRoutes: OAuth callback detected, redirecting to /handler/oauth-callback...');
    // Redirect to explicit callback route; SDK will read from localStorage
    setTimeout(() => {
      if (window.location.pathname !== '/handler/oauth-callback') {
        const query = window.location.search || '';
        window.location.replace(`/handler/oauth-callback${query}`);
      }
      // prevent multiple redirects
      sessionStorage.setItem('oauth_processed', '1');
    }, 10);
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 mb-2">Processing OAuth authentication...</p>
          <p className="text-sm text-gray-500">Please wait while we complete your login.</p>
        </div>
      </div>
    );
  }

  // Check if Stack Auth is properly configured
  if (!STACK_PROJECT_ID || !STACK_PUBLISHABLE_CLIENT_KEY) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Authentication Error</h1>
            <p className="text-gray-600 mb-6">
              Stack Auth is not properly configured. Please check your environment variables.
            </p>
            <button
              onClick={() => window.location.href = '/'}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              Go Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  // If user is already authenticated, redirect to app
  if (isAuthenticated && !isLoading) {
    console.log('🔍 HandlerRoutes: User is authenticated, redirecting to /app');
    window.location.href = '/app';
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Redirecting to your account...</p>
        </div>
      </div>
    );
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Determine which form to show based on the path
  const isSignUp = handlerPath === 'sign-up' || currentUrl.includes('sign-up');
  const isSignIn = handlerPath === 'sign-in' || currentUrl.includes('sign-in') || !isSignUp;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-light text-gray-900 mb-2" style={{ fontFamily: "Times New Roman, serif" }}>
            SSELFIE
          </h1>
          <p className="text-gray-600">
            {isSignUp ? 'Create your account' : 'Welcome back'}
          </p>
        </div>

            {isSignIn ? (
              <SignIn />
            ) : (
              <SignUp />
            )}

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            {isSignIn ? "Don't have an account? " : "Already have an account? "}
            <button
              onClick={() => {
                const newPath = isSignIn ? '/handler/sign-up' : '/handler/sign-in';
                window.location.href = newPath;
              }}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              {isSignIn ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

function AppWithProvider() {
  return (
    <QueryClientProvider client={queryClient}>
      <StackProvider app={stackClientApp}>
        <StackTheme>
          <TooltipProvider>
            <App />
            <Toaster />
          </TooltipProvider>
        </StackTheme>
      </StackProvider>
    </QueryClientProvider>
  );
}

function App() {
  // Enhanced domain access handling
  useEffect(() => {
    try {
      console.log('SSELFIE Studio: App initializing...');
      
      // Do not force domain canonicalization in client; avoid potential redirect loops
      
      // Check for domain access issues
      const issues = detectBrowserIssues();
      if (issues.length > 0) {
        console.warn('Browser compatibility issues detected:', issues);
        showDomainHelp();
      }
      
      console.log('SSELFIE Studio: Domain access validated, app ready');
      
      // Phase 4: Runtime performance optimizations
      optimizeImageLoading();
      enableServiceWorkerCaching();
      optimizeRuntime();
      
      // Phase 5: Mobile optimization
      initializeMobileOptimization();
      
      // Phase 6: Performance monitoring
      console.log('📊 Performance monitoring initialized');
      console.log('📊 Performance Score:', performanceMonitor.getPerformanceScore());
      
      // Phase 7: Runtime optimization
      initializeRuntimeOptimization();
    } catch (error) {
      console.error('Error in App initialization:', error);
    }
  }, []);

  console.log('SSELFIE Studio: App rendering...');
  
  return (
    <ErrorBoundary>
      <Router />
    </ErrorBoundary>
  );
}

export default AppWithProvider;
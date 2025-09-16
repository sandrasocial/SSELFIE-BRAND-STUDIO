import React, { ComponentType, useEffect } from 'react';
import { Route, useLocation, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { ProtectedRoute } from './components/ProtectedRoute';
import { Toaster } from "./components/ui/toaster";
import { TooltipProvider } from "./components/ui/tooltip";
import { StackHandler, StackProvider, StackTheme, SignIn, SignUp } from "@stackframe/react";
import { stackClientApp } from "../../stack/client";
import { useAuth } from "./hooks/use-auth";
import { STACK_PROJECT_ID, STACK_PUBLISHABLE_CLIENT_KEY } from './env';
import { useQuery } from "@tanstack/react-query";
import { redirectToHttps, detectBrowserIssues, showDomainHelp } from "./utils/browserCompat";
import { optimizeImageLoading, enableServiceWorkerCaching } from "./utils/performanceOptimizations";
import { optimizeRuntime } from "./utils/webVitals";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { initializeMobileOptimization } from "./utils/mobileOptimization";
import { performanceMonitor } from "./utils/performanceMonitor";
import { initializeRuntimeOptimization } from "./utils/runtimeOptimization";

// Core pages (loaded immediately) - BRAND STUDIO IS PRIMARY
import BrandStudioPage from "./pages/BrandStudioPage";
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
    enabled: isAuthenticated,
    retry: false,
    staleTime: 30 * 1000
  });

  useEffect(() => {
    if (!isLoading && !isModelLoading && isAuthenticated) {
      // Check training status and route accordingly
      if (!userModel || (userModel as any).trainingStatus !== 'completed') {
        console.log('🎯 User authenticated but needs training, redirecting to simple-training');
        setLocation('/simple-training');
      } else {
        console.log('✅ User authenticated with completed training, redirecting to Brand Studio');
  setLocation('/app');
      }
    } else if (!isLoading && !isAuthenticated) {
      console.log('🔍 User not authenticated, staying on landing page');
    }
  }, [isAuthenticated, isLoading, isModelLoading, userModel, setLocation]);

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
      {/* STACK AUTH HANDLER - Must be first to catch authentication routes */}
      <Route path="/handler/:path" component={HandlerRoutes} />
      <Route path="/handler" component={HandlerRoutes} />
      
      {/* OAuth callback is handled automatically by Stack Auth */}
      
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
      <Route
        path="/app"
        component={(props) => (
          <ProtectedRoute component={AppLayout} {...props} />
        )}
      />



    </div>
  );
}

// Stack Auth Handler component for authentication routes
function HandlerRoutes({ params }: { params: { [key: string]: string } }) {
  const handlerPath = params.path || '';
  const currentUrl = window.location.href;
  const { isAuthenticated, isLoading } = useAuth();

  // Debug logging
  console.log('🔍 HandlerRoutes: params =', params);
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
  
  // Check if we're in an OAuth callback state (have outer cookies but no access cookie)
  const isOAuthCallback = oauthOuterCookies.length > 0 && !hasStackAccess;
  console.log('🔍 HandlerRoutes: Is OAuth callback state:', isOAuthCallback);
  
  // If we're in OAuth callback state, show loading and let Stack Auth handle it
  if (isOAuthCallback) {
    console.log('🔄 HandlerRoutes: OAuth callback in progress, showing loading...');
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Completing authentication...</p>
          <p className="text-sm text-gray-500 mt-2">Please wait while we process your login.</p>
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
              <SignIn 
                app={stackClientApp}
                afterSignInUrl="/app"
                afterSignUpUrl="/app"
                onSuccess={() => {
                  console.log('🎉 SignIn: Authentication successful!');
                  console.log('🍪 Cookies after sign-in:', document.cookie);
                  // Force a page reload to ensure cookies are properly set
                  setTimeout(() => {
                    window.location.href = '/app';
                  }, 1000);
                }}
              />
            ) : (
              <SignUp 
                app={stackClientApp}
                afterSignInUrl="/app"
                afterSignUpUrl="/app"
                onSuccess={() => {
                  console.log('🎉 SignUp: Registration successful!');
                  console.log('🍪 Cookies after sign-up:', document.cookie);
                  // Force a page reload to ensure cookies are properly set
                  setTimeout(() => {
                    window.location.href = '/app';
                  }, 1000);
                }}
              />
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
      
      // Only apply redirects for production domain, not localhost
      if (window.location.hostname !== 'localhost' && !window.location.hostname.includes('replit')) {
        // Force HTTPS redirect if needed
        if (window.location.protocol === 'http:' && window.location.hostname === 'sselfie.ai') {
          window.location.href = window.location.href.replace('http:', 'https:');
          return;
        }
        
        // Handle www subdomain redirect
        if (window.location.hostname === 'www.sselfie.ai') {
          window.location.href = window.location.href.replace('www.sselfie.ai', 'sselfie.ai');
          return;
        }
      }
      
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
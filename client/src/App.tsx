/* eslint-disable no-console */
import React, { useEffect } from 'react';
import { Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { ProtectedRoute } from './components/ProtectedRoute';
import { Toaster } from "./components/ui/toaster";
import { TooltipProvider } from "./components/ui/tooltip";
import { StackProvider, StackTheme, SignIn, SignUp } from "@stackframe/react";
import { stackClientApp } from "../../stack/client";
import { useAuth } from "./hooks/use-auth";
// Removed unused environment imports - using consolidated config
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
const Terms = lazy(() => import("./pages/terms"));
const Privacy = lazy(() => import("./pages/privacy"));
const AuthSuccess = lazy(() => import("./pages/auth-success"));
const OAuthCallback = lazy(() => import("./pages/OAuthCallback"));

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
      
      {/* OAuth callback handler - single source of truth, no extra fallback */}
      <Route path="/handler/oauth-callback" component={OAuthCallback} />

      {/* Post-auth success handoff */}
      <Route path="/auth-success" component={() => (
        <Suspense fallback={<PageLoader />}>
          <AuthSuccess />
        </Suspense>
      )} />
      
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

      {/* LEGAL ROUTES */}
      <Route path="/terms" component={() => (
        <Suspense fallback={<PageLoader />}>
          <Terms />
        </Suspense>
      )} />
      <Route path="/privacy" component={() => (
        <Suspense fallback={<PageLoader />}>
          <Privacy />
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

// Stack Auth Handler component for authentication routes - SIMPLIFIED
function HandlerRoutes() {
  const handlerPath = window.location.pathname.replace('/handler/', '') || '';
  const { isAuthenticated } = useAuth();

  console.log('🔍 HandlerRoutes: handlerPath =', handlerPath);
  console.log('🔍 HandlerRoutes: isAuthenticated =', isAuthenticated);
  
  // Check for OAuth outer cookies (callback state)
  const oauthOuterCookies = document.cookie.split(';').filter(cookie => cookie.includes('stack-oauth-outer'));
  
  // If we're in OAuth callback state, redirect to callback handler
  if (oauthOuterCookies.length > 0) {
    console.log('🔄 HandlerRoutes: OAuth callback detected, redirecting to callback...');
    window.location.replace('/handler/oauth-callback');
    return <div>Redirecting...</div>;
  }

  // If user is already authenticated, redirect to app
  if (isAuthenticated) {
    console.log('🔍 HandlerRoutes: User is authenticated, redirecting to /app');
    window.location.replace('/app');
    return <div>Redirecting to app...</div>;
  }

  // Determine which form to show based on the path
  const isSignUp = handlerPath === 'sign-up';

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

        {isSignUp ? (
          <SignUp />
        ) : (
          <SignIn />
        )}

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            {!isSignUp ? "Don't have an account? " : "Already have an account? "}
            <button
              onClick={() => {
                const newPath = !isSignUp ? '/handler/sign-up' : '/handler/sign-in';
                window.location.href = newPath;
              }}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              {!isSignUp ? 'Sign up' : 'Sign in'}
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
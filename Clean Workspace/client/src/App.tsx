/* eslint-disable no-console */
import React, { useEffect } from 'react';
import { Route, useLocation } from "wouter";
import { ProtectedRoute } from './components/ProtectedRoute.js';
import { SignIn, SignUp } from "@stackframe/react";
import { useAuth } from "./hooks/use-auth.js";
// Removed unused environment imports - using consolidated config
import { useQuery } from "@tanstack/react-query";
import { detectBrowserIssues, showDomainHelp } from "./utils/browserCompat.js";
import { optimizeImageLoading, enableServiceWorkerCaching } from "./utils/performanceOptimizations.js";
import { optimizeRuntime } from "./utils/webVitals.js";
import { ErrorBoundary } from "./components/ErrorBoundary.js";
import { initializeMobileOptimization } from "./utils/mobileOptimization.js";
import { performanceMonitor } from "./utils/performanceMonitor.js";
import { initializeRuntimeOptimization } from "./utils/runtimeOptimization.js";

// Luxury Mobile Styling
import "./styles/luxury-mobile.css";

// Core pages (loaded immediately) - BRAND STUDIO IS PRIMARY
import SselfieAppLayout from "./app_v2/SselfieAppLayout.js";
import DemoAppLayout from "./app_v2/DemoAppLayout.js";

// Lazy load non-critical pages for better performance
import { lazy, Suspense } from "react";

// Auth components
import { AuthSignIn } from "./components/AuthSignIn.js";
import { AuthSignUp } from "./components/AuthSignUp.js";

const BusinessLanding = lazy(() => import("./pages/landing/business-landing.js"));
const HairLanding = lazy(() => import("./pages/landing/hair-landing.js"));
const HairSignup = lazy(() => import("./pages/landing/hair-signup.js"));
const SimpleTraining = lazy(() => import("./pages/onboarding/simple-training.js"));
const SimpleCheckout = lazy(() => import("./pages/simple-checkout.js"));
const PaymentSuccess = lazy(() => import("./pages/payment-success.js"));
const ThankYou = lazy(() => import("./pages/thank-you.js"));
const Terms = lazy(() => import("./pages/legal/terms.js"));
const Privacy = lazy(() => import("./pages/legal/privacy.js"));
const AuthSuccess = lazy(() => import("./pages/auth-success.js"));
const OAuthCallback = lazy(() => import("./pages/OAuthCallback.js"));

// Critical pages (marked as priority in routed-pages-priority.ts)  
const Maya = lazy(() => import("./pages/maya.js"));
const SSELFIEGallery = lazy(() => import("./pages/sselfie-gallery.js"));

// Stage Mode components (lazy loaded)
const PresenterConsole = lazy(() => import("./features/live/PresenterConsole.js"));
const AudienceClient = lazy(() => import("./features/live/AudienceClient.js"));
const SessionStats = lazy(() => import("./features/live/SessionStats.js"));

// Components
import { PageLoader } from "./components/PageLoader.js";
import { Auth } from "./components/Auth.js";

// Smart Home component - Routes users through simplified journey
// NEW USER JOURNEY: Authentication → Training → App Studio → Advanced Features  
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
      // SIMPLIFIED JOURNEY: Training → App Studio (no old workspace/build flow)
      if (userModel && (userModel as { trainingStatus?: string }).trainingStatus !== 'completed') {
        console.log('🎯 User needs training → /simple-training (onboarding)');
        setLocation('/simple-training');
      } else {
        console.log('✅ User trained → /app (mobile-first studio tabs)');
        setLocation('/app');
      }
    } else if (!isLoading && !isAuthenticated) {
      console.log('🔍 User not authenticated → staying on landing page');
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
      {/* NEW AUTH ROUTES - Premium styled auth components */}
      <Route path="/sign-in" component={AuthSignIn} />
      <Route path="/sign-up" component={AuthSignUp} />

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
      
      <Route path="/hair" component={() => (
        <Suspense fallback={<PageLoader />}>
          <HairLanding />
        </Suspense>
      )} />
      
      <Route path="/hair/signup" component={() => (
        <Suspense fallback={<PageLoader />}>
          <HairSignup />
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

      {/* CRITICAL WORKFLOW PAGES */}
      <Route path="/maya" component={(props) => (
        <ProtectedRoute component={() => (
          <Suspense fallback={<PageLoader />}>
            <Maya />
          </Suspense>
        )} {...props} />
      )} />
      
      <Route path="/sselfie-gallery" component={(props) => (
        <ProtectedRoute component={() => (
          <Suspense fallback={<PageLoader />}>
            <SSELFIEGallery />
          </Suspense>
        )} {...props} />
      )} />

      {/* NEW TABBED UI ROUTE - Protected with Auth wrapper */}
      <Route path="/app" component={() => (
        <ProtectedRoute component={() => (
          <Suspense fallback={<PageLoader />}>
            <SselfieAppLayout />
          </Suspense>
        )} />
      )} />

      {/* DEMO LAYOUT ROUTE - Shows premium UX without auth */}
      <Route path="/demo" component={() => (
        <Suspense fallback={<PageLoader />}>
          <DemoAppLayout />
        </Suspense>
      )} />

      {/* STAGE MODE ROUTES */}
      <Route path="/hair/live/:sessionId" component={() => (
        <ProtectedRoute component={() => (
          <Suspense fallback={<PageLoader />}>
            <PresenterConsole />
          </Suspense>
        )} />
      )} />

      <Route path="/hair/guest/:sessionId" component={() => (
        <Suspense fallback={<PageLoader />}>
          <AudienceClient />
        </Suspense>
      )} />

      <Route path="/hair/live/:sessionId/stats" component={() => (
        <ProtectedRoute component={() => (
          <Suspense fallback={<PageLoader />}>
            <SessionStats />
          </Suspense>
        )} />
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

export default App;
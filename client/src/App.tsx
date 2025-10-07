/* eslint-disable no-console */
import React, { useEffect } from 'react';
import { Route, useLocation } from "wouter";
import { StackHandler } from "@stackframe/react"; 
import { stackClientApp } from '../../stack/client.js';
import { useAuth } from "./hooks/use-auth.js";
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

// Core pages (loaded immediately) - PAID AUTHENTICATED USERS ONLY
import SselfieAppLayout from "./app_v2/SselfieAppLayout.js";

// Lazy load non-critical pages for better performance
import { lazy, Suspense } from "react";

// Auth components (Lazy loaded for better performance)
const MagicLinkSignInPage = lazy(() => import("../features/MagicLinkSignInPage.js").then(module => ({ default: module.MagicLinkSignInPage })));
const MyForgotPassword = lazy(() => import("../features/MyForgotPassword.js").then(module => ({ default: module.MyForgotPassword })));
const PasswordResetPage = lazy(() => import("../features/ResetPasswordPage.js").then(module => ({ default: module.ResetPasswordPage })));
// Temporarily import SignInHandler directly to test if lazy loading is the issue
import SignInHandler from "./pages/handler/sign-in.js";

const BusinessLanding = lazy(() => import("./pages/landing/business-landing.js"));
const SimpleTraining = lazy(() => import("./pages/onboarding/simple-training.js"));
const SimpleCheckout = lazy(() => import("./pages/simple-checkout.js"));
const EmbeddedCheckout = lazy(() => import("./pages/embedded-checkout.js"));
const PaymentSuccess = lazy(() => import("./pages/payment-success.js"));
const ThankYou = lazy(() => import("./pages/thank-you.js"));
const Terms = lazy(() => import("./pages/legal/terms.js"));
const Privacy = lazy(() => import("./pages/legal/privacy.js"));
// Import AuthSuccess directly instead of lazy loading to fix OAuth callback 404 issue
import AuthSuccessComponent from "./pages/auth-success.js";
const NotFound = lazy(() => import("./pages/not-found.js"));
const SSELFIEGallery = lazy(() => import("./pages/sselfie-gallery.js"));

// Components
import { PageLoader } from "./components/PageLoader.js";

// Protected Route Wrapper Component
function ProtectedRouteWrapper({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      setLocation('/handler/sign-in');
    }
  }, [isAuthenticated, isLoading, setLocation]);

  if (isLoading) {
    return <PageLoader />;
  }

  if (!isAuthenticated) {
    return <PageLoader />;
  }

  return <>{children}</>;
}

// Smart Home component - Routes users through simplified journey
// NEW USER JOURNEY: Authentication → Training → App Studio → Advanced Features  
function SmartHome() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      setLocation('/handler/sign-in');
      return;
    }

    // Authenticated user routing logic
    if (user) {
      // Priority 1: Training required (new users or users without training)
      if (!user.trainingCoachingCompleted) {
        setLocation('/simple-training');
        return;
      }

      // Priority 2: Payment required (trained users without active subscription)
      const hasActiveSubscription = user.monthlyGenerationLimit === -1 ||
        (user.plan === 'sselfie-studio' && (user.monthlyGenerationLimit || 0) > 0);
      
      if (!hasActiveSubscription) {
        setLocation('/simple-checkout');
        return;
      }

      // Priority 3: Full access - route to main app
      setLocation('/app');
    }
  }, [isLoading, isAuthenticated, user, setLocation]);

  return <PageLoader />;
}

// 🔥 CLEANED UP: Stack Auth Handler - Single source of truth for authentication
function HandlerRoutes() {
  const handlerPath = window.location.pathname.replace('/handler/', '') || '';

  console.log('🔍 HandlerRoutes: handlerPath =', handlerPath);
  console.log('🔍 HandlerRoutes: full location =', window.location.href);
  console.log('🔍 HandlerRoutes: Stack client app exists =', !!stackClientApp);
  console.log('🔍 HandlerRoutes: Stack client app urls =', stackClientApp?.urls);

  // ✅ Use StackHandler for ALL Stack Auth operations to ensure consistency
  // This includes sign-in, sign-up, magic-link, password-reset, email-verification
  console.log('🔍 HandlerRoutes: Using StackHandler for =', handlerPath);

  try {
    return (
      <StackHandler
        app={stackClientApp}
        location={window.location.pathname + window.location.search + window.location.hash}
        fullPage={true}
      />
    );
  } catch (error) {
    console.error('🔥 StackHandler Error:', error);
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl mb-4">Authentication Error</h2>
          <p className="text-gray-600 mb-4">There was an issue with authentication.</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-black text-white px-6 py-2 rounded"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }
}

function Router() {
  console.log('🔍 Router: Rendering with pathname =', window.location.pathname);
  console.log('🔍 Router: Full URL =', window.location.href);
  
  return (
    <div>
      {/* Post-auth success handoff - MOVED TO TOP for priority matching */}
      <Route path="/auth-success" component={() => (
        <AuthSuccessComponent />
      )} />

      {/* ✅ CLEANED UP: Redirect to Stack Auth handlers for consistency */}
      <Route path="/sign-in" component={() => {
        window.location.replace('/handler/sign-in');
        return <PageLoader />;
      }} />
      <Route path="/sign-up" component={() => {
        window.location.replace('/handler/sign-up');
        return <PageLoader />;
      }} />

      {/* ✅ ADDED: Primary non-OAuth sign-in flows for users without Google */}
      <Route path="/magic-link" component={() => (
        <Suspense fallback={<PageLoader />}>
          <MagicLinkSignInPage />
        </Suspense>
      )} />
      <Route path="/forgot-password" component={() => (
        <Suspense fallback={<PageLoader />}>
          <MyForgotPassword />
        </Suspense>
      )} />
      <Route path="/password-reset" component={() => (
        <Suspense fallback={<PageLoader />}>
          <PasswordResetPage searchParams={Object.fromEntries(new URLSearchParams(window.location.search))} />
        </Suspense>
      )} />

      {/* STACK AUTH HANDLER - Consolidated wildcard route for ALL Stack redirects/callbacks including OAuth */}
      <Route path="/handler/sign-in" component={() => {
        console.log('🔍 Route matched: /handler/sign-in');
        return <SignInHandler />;
      }} />
      <Route path="/handler/sign-up" component={() => {
        console.log('🔍 Route matched: /handler/sign-up');
        return <SignInHandler />;
      }} />
      {/* ✅ CRITICAL FIX: OAuth callback handler MUST come before wildcard routes to preserve query parameters */}
      <Route path="/handler/oauth-callback" component={() => {
        console.log('🔍 Route matched: /handler/oauth-callback');
        return (
          <Suspense fallback={<PageLoader />}>
            <HandlerRoutes />
          </Suspense>
        );
      }} />
      <Route path="/handler/:path*" component={() => {
        console.log('🔍 Route matched: /handler/:path*');
        return (
          <Suspense fallback={<PageLoader />}>
            <HandlerRoutes />
          </Suspense>
        );
      }} />

      {/* Home page - Smart routing based on auth and training status */}
      <Route path="/" component={SmartHome} />

      {/* Public landing pages */}
      <Route path="/business" component={() => (
        <Suspense fallback={<PageLoader />}>
          <BusinessLanding />
        </Suspense>
      )} />

      {/* Protected onboarding and payment routes */}
      <Route path="/simple-training" component={() => (
        <ProtectedRouteWrapper>
          <Suspense fallback={<PageLoader />}>
            <SimpleTraining />
          </Suspense>
        </ProtectedRouteWrapper>
      )} />
      <Route path="/simple-checkout" component={() => (
        <ProtectedRouteWrapper>
          <Suspense fallback={<PageLoader />}>
            <SimpleCheckout />
          </Suspense>
        </ProtectedRouteWrapper>
      )} />
      <Route path="/embedded-checkout" component={() => (
        <Suspense fallback={<PageLoader />}>
          <EmbeddedCheckout />
        </Suspense>
      )} />
      <Route path="/payment-success" component={() => (
        <ProtectedRouteWrapper>
          <Suspense fallback={<PageLoader />}>
            <PaymentSuccess />
          </Suspense>
        </ProtectedRouteWrapper>
      )} />
      <Route path="/thank-you" component={() => (
        <Suspense fallback={<PageLoader />}>
          <ThankYou />
        </Suspense>
      )} />

      {/* Main authenticated app */}
      <Route path="/app" component={() => (
        <ProtectedRouteWrapper>
          <Suspense fallback={<PageLoader />}>
            <SselfieAppLayout />
          </Suspense>
        </ProtectedRouteWrapper>
      )} />

      {/* SSELFIE Gallery - Public showcase */}
      <Route path="/sselfie-gallery" component={() => (
        <Suspense fallback={<PageLoader />}>
          <SSELFIEGallery />
        </Suspense>
      )} />

      {/* Legal pages */}
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

      {/* 404 Not Found - Must be last */}
      <Route path="/:rest*" component={() => (
        <Suspense fallback={<PageLoader />}>
          <NotFound />
        </Suspense>
      )} />
    </div>
  );
}

function App() {
  // Initialize optimizations
  useEffect(() => {
    // Performance monitoring
    performanceMonitor.startMonitoring();
    
    // Browser compatibility checks
    const browserIssues = detectBrowserIssues();
    if (browserIssues.length > 0) {
      console.warn('Browser compatibility issues:', browserIssues);
    }
    
    // Show domain help if needed
    showDomainHelp();
    
    // Optimize image loading
    optimizeImageLoading();
    
    // Enable service worker caching
    enableServiceWorkerCaching();
    
    // Optimize runtime
    optimizeRuntime();
    
    // Mobile optimizations
    initializeMobileOptimization();
    
    // Runtime optimization
    initializeRuntimeOptimization();
    
    return () => {
      performanceMonitor.stopMonitoring();
    };
  }, []);

  console.log('SSELFIE Studio: App rendering...');
  
  return (
    <ErrorBoundary>
      <Router />
    </ErrorBoundary>
  );
}

export default App;
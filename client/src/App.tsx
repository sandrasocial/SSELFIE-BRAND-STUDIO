/* eslint-disable no-console */
import React, { useEffect } from 'react';
import { Route, useLocation } from "wouter";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { StackHandler } from "@stackframe/react"; 
import { stackClientApp } from '../../stack/client.js';
import { useQuery } from "@tanstack/react-query";
import { detectBrowserIssues, showDomainHelp } from "./utils/browserCompat.js";
import { optimizeImageLoading, enableServiceWorkerCaching } from "./utils/performanceOptimizations.js";
import { optimizeRuntime } from "./utils/webVitals.js";
import { initializeMobileOptimization } from "./utils/mobileOptimization.js";
import { performanceMonitor } from "./utils/performanceMonitor.js";
import { WithStackAuth } from "./components/auth/WithStackAuth";
import RootWrapper from "./components/RootWrapper";
// IMPORTANT: Import useAuth after other dependencies to ensure proper provider context
import { useAuth } from "./hooks/use-auth.js";
import { initializeRuntimeOptimization } from "./utils/runtimeOptimization.js";
import { ROUTES } from "./constants/routes.js";
import { MayaDiagnostic } from "./components/MayaDiagnostic.js";

// Luxury Mobile Styling
import "./styles/luxury-mobile.css";

// Core pages (loaded immediately) - PAID AUTHENTICATED USERS ONLY
import SselfieAppLayout from "./app_v2/SselfieAppLayout.js";
import MayaPage from "./pages/MayaPage.js";

// Lazy load non-critical pages for better performance
import { lazy, Suspense } from "react";

// Auth components (Lazy loaded for better performance)
// Temporarily disabled - components don't exist yet
// const MagicLinkSignInPage = lazy(() => import("../features/MagicLinkSignInPage.js").then(module => ({ default: module.MagicLinkSignInPage })));
// const MyForgotPassword = lazy(() => import("../features/MyForgotPassword.js").then(module => ({ default: module.MyForgotPassword })));
// const PasswordResetPage = lazy(() => import("../features/ResetPasswordPage.js").then(module => ({ default: module.ResetPasswordPage })));
// Temporarily import SignInHandler directly to test if lazy loading is the issue
import SignInHandler from "./pages/handler/sign-in";

// Post-login handler for routing based on training status
import PostLoginHandler from "./pages/handler/PostLoginHandler";

const BusinessLanding = lazy(() => import("./pages/landing/business-landing"));
const SimpleTraining = lazy(() => import("./pages/onboarding/simple-training"));
const SimpleCheckout = lazy(() => import("./pages/simple-checkout"));
const EmbeddedCheckout = lazy(() => import("./pages/embedded-checkout"));
const PaymentSuccess = lazy(() => import("./pages/payment-success"));
const ThankYou = lazy(() => import("./pages/thank-you"));
const Terms = lazy(() => import("./pages/legal/terms"));
const Privacy = lazy(() => import("./pages/legal/privacy"));
// Import AuthSuccess directly instead of lazy loading to fix OAuth callback 404 issue
import AuthSuccessComponent from "./pages/auth-success";
import { PUBLIC_ROUTES } from "./constants/routes";
const NotFound = lazy(() => import("./pages/not-found"));
const SSELFIEGallery = lazy(() => import("./pages/sselfie-gallery"));
const AICommandCenter = lazy(() => import("./pages/AICommandCenter"));

// Components
import { PageLoader } from "./components/PageLoader";

// Protected Route Wrapper Component
function ProtectedRouteWrapper({ children }: { children: React.ReactNode }) {
  const [location, setLocation] = useLocation();
  const { isAuthenticated, isLoading } = useAuth();
  
  // Check if current route is public
  const isPublicRoute = PUBLIC_ROUTES.some(route => 
    location === route || location.startsWith(route + '/')
  );

  // Handle auth state changes
  useEffect(() => {
    if (!isLoading && !isAuthenticated && !isPublicRoute) {
      setLocation('/handler/sign-in');
    }
  }, [isAuthenticated, isLoading, isPublicRoute, setLocation]);

  // Allow public routes through without auth check
  if (isPublicRoute) {
    return <>{children}</>;
  }

  // Show loading state
  if (isLoading || !isAuthenticated) {
    return <PageLoader />;
  }

  // Render protected route
  return <>{children}</>;
}

// Smart Home component - Routes users through simplified journey  
// NEW USER JOURNEY: Authentication → AI Training → Payment → App Studio
function SmartHome() {
  const [, setLocation] = useLocation();
  const { isLoading, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      setLocation(ROUTES.BUSINESS_LANDING);
    }
  }, [isLoading, isAuthenticated, setLocation]);

  // Show loading while checking auth
  if (isLoading) {
    return <PageLoader />;
  }

  // If not authenticated, show loader while redirecting
  if (!isAuthenticated) {
    return <PageLoader />;
  }

  // For authenticated users, use PostLoginHandler to determine where to go
  return <PostLoginHandler />;
}

// 🔥 CLEANED UP: Stack Auth Handler - Single source of truth for authentication
function HandlerRoutes() {
  const handlerPath = window.location.pathname.replace('/handler/', '') || '';

  // ✅ Use StackHandler for ALL Stack Auth operations to ensure consistency
  // This includes sign-in, sign-up, magic-link, password-reset, email-verification

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
      {/* Temporarily disabled - components don't exist yet
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
      */}

      {/* STACK AUTH HANDLER - Consolidated wildcard route for ALL Stack redirects/callbacks including OAuth */}
      <Route path="/handler/sign-in" component={() => {
        return <SignInHandler />;
      }} />
      <Route path="/handler/sign-up" component={() => {
        return <SignInHandler />;
      }} />
      {/* ✅ CRITICAL FIX: OAuth callback handler MUST come before wildcard routes to preserve query parameters */}
      <Route path="/handler/oauth-callback" component={() => {
        const OAuthCallback = React.lazy(() => import("./pages/handler/oauth-callback"));
        return (
          <Suspense fallback={<PageLoader />}>
            <OAuthCallback />
          </Suspense>
        );
      }} />
      <Route path="/handler/:path*" component={() => {
        return (
          <Suspense fallback={<PageLoader />}>
            <HandlerRoutes />
          </Suspense>
        );
      }} />

      {/* Home page - Smart routing based on auth and training status */}
      <Route path="/" component={SmartHome} />

      {/* Debug route for auth diagnostics */}
      <Route path="/auth-diagnostic" component={() => {
        const AuthDiagnostic = React.lazy(() => import("./pages/auth-diagnostic"));
        return (
          <Suspense fallback={<PageLoader />}>
            <AuthDiagnostic />
          </Suspense>
        );
      }} />

      {/* Public landing pages */}
      <Route path="/business" component={() => (
        <Suspense fallback={<PageLoader />}>
          <BusinessLanding />
        </Suspense>
      )} />

      {/* Protected onboarding routes */}
      <Route path="/simple-training" component={() => (
        <ProtectedRouteWrapper>
          <Suspense fallback={<PageLoader />}>
            <SimpleTraining />
          </Suspense>
        </ProtectedRouteWrapper>
      )} />
      
      {/* Public checkout - allows new users to purchase before authentication */}
      <Route path="/simple-checkout" component={() => (
        <Suspense fallback={<PageLoader />}>
          <SimpleCheckout />
        </Suspense>
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

      {/* Maya Chat - Direct route for Maya AI chat interface */}
      <Route path="/maya" component={() => (
        <ProtectedRouteWrapper>
          <Suspense fallback={<PageLoader />}>
            <MayaPage />
          </Suspense>
        </ProtectedRouteWrapper>
      )} />

      {/* Main authenticated app routes */}
      <Route path="/app" component={() => (
        <ProtectedRouteWrapper>
          <Suspense fallback={<PageLoader />}>
            <SselfieAppLayout />
          </Suspense>
        </ProtectedRouteWrapper>
      )} />
      <Route path="/app/:tab*" component={() => (
        <ProtectedRouteWrapper>
          <Suspense fallback={<PageLoader />}>
            <SselfieAppLayout />
          </Suspense>
        </ProtectedRouteWrapper>
      )} />

      {/* AI Command Center - Protected route for authenticated users */}
      <Route path="/ai-command-center" component={() => (
        <ProtectedRouteWrapper>
          <Suspense fallback={<PageLoader />}>
            <AICommandCenter />
          </Suspense>
        </ProtectedRouteWrapper>
      )} />

      {/* SSELFIE Gallery - Protected Route */}
      <Route path="/sselfie-gallery" component={() => (
        <ProtectedRouteWrapper>
          <Suspense fallback={<PageLoader />}>
            <SSELFIEGallery />
          </Suspense>
        </ProtectedRouteWrapper>
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
    console.log('🚀 SSELFIE Studio: App useEffect starting...');
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
    
    console.log('✅ SSELFIE Studio: App useEffect completed');
    return () => {
      performanceMonitor.stopMonitoring();
    };
  }, []);

  return (
    <ErrorBoundary>
      <RootWrapper>
        <Router />
      </RootWrapper>
    </ErrorBoundary>
  );
}

export default App;
/* eslint-disable no-console */
import React, { useEffect } from 'react';
import { Route, useLocation } from "wouter";

// Global type declarations for browser APIs
declare global {
  interface Window {
    URLSearchParams: typeof URLSearchParams;
  }
  var URLSearchParams: typeof URLSearchParams;
}
import { ProtectedRoute } from './components/ProtectedRoute.js';
import { StackHandler } from "@stackframe/react"; 
import { stackClientApp } from '../../stack/client.js';
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

// Core pages (loaded immediately) - PAID AUTHENTICATED USERS ONLY
import SselfieAppLayout from "./app_v2/SselfieAppLayout.js";

// Lazy load non-critical pages for better performance
import { lazy, Suspense } from "react";

// Auth components - Using Stack Auth handlers only for consistency
// AuthSignIn and AuthSignUp removed - redirecting to /handler/ routes

// Auth components (Lazy loaded for better performance)
const MagicLinkSignInPage = lazy(() => import("../features/MagicLinkSignInPage.js").then(module => ({ default: module.MagicLinkSignInPage })));
const MyForgotPassword = lazy(() => import("../features/MyForgotPassword.js").then(module => ({ default: module.MyForgotPassword })));
const PasswordResetPage = lazy(() => import("../features/ResetPasswordPage.js").then(module => ({ default: module.ResetPasswordPage })));
// Temporarily import SignInHandler directly to test if lazy loading is the issue
import SignInHandler from "./pages/handler/sign-in.js";


const BusinessLanding = lazy(() => import("./pages/landing/business-landing.js"));
const HairLanding = lazy(() => import("./pages/landing/hair-landing.js"));
const HairSignup = lazy(() => import("./pages/landing/hair-signup.js"));
const SimpleTraining = lazy(() => import("./pages/onboarding/simple-training.js"));
const SimpleCheckout = lazy(() => import("./pages/simple-checkout.js"));
// 🔥 NEW: Embedded checkout page with SSELFIE style guide
const EmbeddedCheckout = lazy(() => import("./pages/embedded-checkout.js"));
const PaymentSuccess = lazy(() => import("./pages/payment-success.js"));
const ThankYou = lazy(() => import("./pages/thank-you.js"));
const Terms = lazy(() => import("./pages/legal/terms.js"));
const Privacy = lazy(() => import("./pages/legal/privacy.js"));
// Import AuthSuccess directly instead of lazy loading to fix OAuth callback 404 issue
import AuthSuccessComponent from "./pages/auth-success.js";
const NotFound = lazy(() => import("./pages/not-found.js"));

// Critical pages (marked as priority in routed-pages-priority.ts)  
const SSELFIEGallery = lazy(() => import("./pages/sselfie-gallery.js"));

// Components
import { PageLoader } from "./components/PageLoader.js";

// Smart Home component - Routes users through simplified journey
// NEW USER JOURNEY: Authentication → Training → App Studio → Advanced Features  
function SmartHome() {
  const [, setLocation] = useLocation();
  const { 
    isAuthenticated, 
    isLoading
  } = useAuth();

  const { 
    data: userModel, 
    isLoading: isModelLoading, 
    isError: isModelError // 💡 CRITICAL: Get the error status
  } = useQuery({
    queryKey: ['/api/user-model'],
    enabled: isAuthenticated,
    retry: false, // Prevents endless re-fetching on permanent errors
    staleTime: 30 * 1000
  });

  useEffect(() => {
      isLoading,
      isAuthenticated,
      isModelLoading,
      isModelError,
      hasUserModel: !!userModel,
      currentPath: window.location.pathname,
      userModelStatus: userModel ? (userModel as { trainingStatus?: string }).trainingStatus : 'no-model'
    });

    // 🔥 LOOP PREVENTION: Don't redirect if we're already where we should be
    const currentPath = window.location.pathname;
    if (currentPath === '/app' || currentPath === '/simple-training') {
      return;
    }

    // 1. Check for authenticated state and completion/error of the model fetch
    if (!isLoading && isAuthenticated) {
      
      // 🔥 CRITICAL FIX: Handle model API errors gracefully for existing users
      if (isModelError) {
        console.error('🛑 User Model fetch failed (isModelError=true)');
        // For authenticated users with API errors, send them to /app instead of training
        // This handles cases where existing users can authenticate but model API fails
        setLocation('/app', { replace: true });
        return;
      }
      
      // 🎯 If model successfully loaded, check training status
      if (!isModelLoading && userModel) {
                const trainingStatus = (userModel as { trainingStatus?: string }).trainingStatus;
        
        if (trainingStatus === 'completed') {
          setLocation('/app', { replace: true });
        } else {
          setLocation('/simple-training', { replace: true });
        }
      } else if (!isModelLoading && !userModel) {
        // Model loaded but no data - likely new user
        setLocation('/simple-training', { replace: true });
      } else {
      }
      // If still loading model, wait for it to complete
      
    } else if (!isLoading && !isAuthenticated) {
    } else {
    }
    
  }, [isAuthenticated, isLoading, isModelLoading, isModelError, userModel, setLocation]);

  // RENDER: Show loader only while actively loading, otherwise the useEffect handles the redirect
  if (isLoading || isModelLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-black border-t-transparent rounded-full" />
      </div>
    );
  }

  // Fallthrough case: if authenticated and model check finished (no redirect triggered yet), 
  // or if unauthenticated and showing the landing page.
  return null;
}

// Protected wrapper component that handles Stack Auth authentication

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
          <PasswordResetPage searchParams={Object.fromEntries(new URL(window.location.href).searchParams)} />
        </Suspense>
      )} />

      {/* STACK AUTH HANDLER - Consolidated wildcard route for ALL Stack redirects/callbacks including OAuth */}
      <Route path="/handler/sign-in" component={() => {
        return <SignInHandler />;
      }} />
      <Route path="/handler/sign-up" component={() => {
        return <SignInHandler />;
      }} />
      {/* ✅ CRITICAL FIX: OAuth callback handler MUST come before wildcard routes to preserve query parameters */}
      <Route path="/handler/oauth-callback" component={() => {
        return (
          <StackHandler
            app={stackClientApp}
            location={window.location.pathname + window.location.search + window.location.hash}
            fullPage={true}
          />
        );
      }} />
      <Route path="/handler/:rest*" component={() => {
        return <HandlerRoutes />;
      }} />
      <Route path="/handler" component={() => {
        return <HandlerRoutes />;
      }} />
      
      {/* Guard against accidental /handler/app by redirecting to /app */}
      <Route path="/handler/app" component={() => { window.location.href = '/app'; return null; }} />
      
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
      {/* 🔥 NEW: Embedded checkout with SSELFIE style guide - fixes scrollability & email duplication */}
      <Route path="/embedded-checkout" component={() => (
        <Suspense fallback={<PageLoader />}>
          <EmbeddedCheckout />
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
      
      {/* AI TRAINING WORKFLOW - Public access for post-payment users */}
      <Route path="/simple-training" component={() => (
        <Suspense fallback={<PageLoader />}>
          <SimpleTraining />
        </Suspense>
      )} />
      <Route path="/training" component={() => (
        <Suspense fallback={<PageLoader />}>
          <SimpleTraining />
        </Suspense>
      )} />

      {/* CRITICAL WORKFLOW PAGES */}
      {/* OLD MAYA ROUTE - Redirect to enhanced Maya in main app */}
      <Route path="/maya" component={() => {
        window.location.replace('/app');
        return <PageLoader />;
      }} />
      
      <Route path="/sselfie-gallery" component={(props) => (
        <ProtectedRoute component={() => (
          <Suspense fallback={<PageLoader />}>
            <SSELFIEGallery />
          </Suspense>
        )} {...props} />
      )} />

      {/* PAID USERS ONLY - Main Studio Interface */}
      <Route path="/app" component={() => (
        <ProtectedRoute component={() => (
          <Suspense fallback={<PageLoader />}>
            {/* SSELFIE Brand Studio - Authenticated Paid Users Only */}
            <SselfieAppLayout />
          </Suspense>
        )} />
      )} />      {/* STUDIO ROUTE ALIAS - Redirects to /app for E2E test compatibility */}
      <Route path="/studio" component={() => {
        window.location.replace('/app');
        return <PageLoader />;
      }} />

      {/* WORKSPACE ROUTE ALIAS - Redirects to /app for compatibility */}
      <Route path="/workspace" component={() => {
        window.location.replace('/app');
        return <PageLoader />;
      }} />



      {/* ROUTE ALIASES & REDIRECTS */}
      <Route path="/gallery" component={() => {
        // Redirect /gallery to /sselfie-gallery for compatibility
        window.location.replace('/sselfie-gallery');
        return <PageLoader />;
      }} />

      {/* CATCH-ALL 404 ROUTE - Must be ABSOLUTE last, use proper syntax */}
      <Route path="/:rest*">
        {() => {
          // Only show 404 if we're not on a valid route
          const validPaths = [
            '/', '/app', '/studio', '/workspace', '/maya', '/sselfie-gallery', 
            '/business', '/hair', '/terms', '/privacy', '/simple-checkout', 
            '/embedded-checkout', '/payment-success', '/thank-you', '/simple-training', 
            '/training', '/magic-link', '/forgot-password', '/password-reset', 
            '/auth-success', '/sign-in', '/sign-up'
          ];
          const currentPath = window.location.pathname;
          
          // Don't show 404 for valid paths or handler routes
          if (validPaths.some(path => currentPath === path || currentPath.startsWith(path + '/')) || 
              currentPath.startsWith('/handler/') || 
              currentPath.startsWith('/hair/')) {
            return null;
          }
          
          return (
            <Suspense fallback={<PageLoader />}>
              <NotFound />
            </Suspense>
          );
        }}
      </Route>
    </div>
  );
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
    console.error('❌ HandlerRoutes: Error rendering StackHandler:', error);
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center px-4">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-light tracking-widest mb-8" style={{ fontFamily: 'Times New Roman, serif' }}>
              SSELFIE STUDIO
            </h2>
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <h3 className="text-lg font-medium text-red-800 mb-4">Authentication Error</h3>
              <p className="text-red-700 mb-6">
                Stack Auth handler failed to load. Please try refreshing the page.
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
    );
  }
}

function App() {
  // Enhanced domain access handling
  useEffect(() => {
    try {
      
      // Do not force domain canonicalization in client; avoid potential redirect loops
      
      // Check for domain access issues
      const issues = detectBrowserIssues();
      if (issues.length > 0) {
        console.warn('Browser compatibility issues detected:', issues);
        showDomainHelp();
      }
      
      
      // Phase 4: Runtime performance optimizations
      optimizeImageLoading();
      enableServiceWorkerCaching();
      optimizeRuntime();
      
      // Phase 5: Mobile optimization
      initializeMobileOptimization();
      
      // Phase 6: Performance monitoring
      
      // Phase 7: Runtime optimization
      initializeRuntimeOptimization();
    } catch (error) {
      console.error('Error in App initialization:', error);
    }
  }, []);

  
  return (
    <ErrorBoundary>
      <Router />
    </ErrorBoundary>
  );
}

export default App;
/* eslint-disable no-console */
import React, { useEffect } from 'react';
import { Route, useLocation } from "wouter";
import { ProtectedRoute } from './components/ProtectedRoute.js';
import * as stackAuth from "@stackframe/react";
// @ts-ignore - Stack Auth has broken ESM exports, using workaround
const { SignIn, SignUp, StackHandler } = (stackAuth as any).default || stackAuth; 
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

// Auth components
import { AuthSignIn } from "./components/AuthSignIn.js";
import { AuthSignUp } from "./components/AuthSignUp.js";

// Auth components (Lazy loaded for better performance)
const MagicLinkSignInPage = lazy(() => import("../features/MagicLinkSignInPage.js").then(module => ({ default: module.MagicLinkSignInPage })));
const MyForgotPassword = lazy(() => import("../features/MyForgotPassword.js").then(module => ({ default: module.MyForgotPassword })));
const PasswordResetPage = lazy(() => import("../features/ResetPasswordPage.js").then(module => ({ default: module.ResetPasswordPage })));

const BusinessLanding = lazy(() => import("./pages/landing/business-landing.js"));
const HairLanding = lazy(() => import("./pages/landing/hair-landing.js"));
const HairSignup = lazy(() => import("./pages/landing/hair-signup.js"));
const SimpleTraining = lazy(() => import("./pages/onboarding/simple-training.js"));
const SimpleCheckout = lazy(() => import("./pages/simple-checkout.js"));
const PaymentSuccess = lazy(() => import("./pages/payment-success.js"));
const ThankYou = lazy(() => import("./pages/thank-you.js"));
const Terms = lazy(() => import("./pages/legal/terms.js"));
const Privacy = lazy(() => import("./pages/legal/privacy.js"));
// Import AuthSuccess directly instead of lazy loading to fix OAuth callback 404 issue
import AuthSuccessComponent from "./pages/auth-success.js";
// 🔥 CRITICAL: Import OAuthCallback directly (not lazy) to ensure it's always available
import OAuthCallback from "./pages/OAuthCallback.js";
const NotFound = lazy(() => import("./pages/not-found.js"));

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
    console.log('🎯 SmartHome routing decision at:', new Date().toISOString());
    console.log('🎯 SmartHome state:', {
      isLoading,
      isAuthenticated,
      isModelLoading,
      isModelError,
      hasUserModel: !!userModel,
      currentPath: window.location.pathname,
      userModelStatus: userModel ? (userModel as any).trainingStatus : 'no-model'
    });

    // 1. Check for authenticated state and completion/error of the model fetch
    if (!isLoading && isAuthenticated) {
      console.log('✅ User is authenticated, checking model status...');
      
      // 🔥 CRITICAL FIX: Handle model API errors gracefully for existing users
      if (isModelError) {
        console.error('🛑 User Model fetch failed (isModelError=true)');
        console.log('🔄 API error detected - allowing authenticated user to access /app as fallback');
        console.log('📍 ROUTING DECISION: /api/user-model failed → /app (fallback for existing users)');
        // For authenticated users with API errors, send them to /app instead of training
        // This handles cases where existing users can authenticate but model API fails
        setLocation('/app', { replace: true });
        return;
      }
      
      // 🎯 If model successfully loaded, check training status
      if (!isModelLoading && userModel) {
        const trainingStatus = (userModel as { trainingStatus?: string }).trainingStatus;
        console.log('📊 Model loaded, training status:', trainingStatus);
        
        if (trainingStatus === 'completed') {
          console.log('✅ User trained and model loaded → /app');
          console.log('📍 ROUTING DECISION: Trained user → /app');
          setLocation('/app', { replace: true });
        } else {
          console.log('🎯 User model loaded but needs training → /simple-training');
          console.log('📍 ROUTING DECISION: Untrained user → /simple-training');
          setLocation('/simple-training', { replace: true });
        }
      } else if (!isModelLoading && !userModel) {
        // Model loaded but no data - likely new user
        console.log('🆕 No user model found → /simple-training (new user)');
        console.log('📍 ROUTING DECISION: New user → /simple-training');
        setLocation('/simple-training', { replace: true });
      } else {
        console.log('⏳ Still loading user model, waiting...');
      }
      // If still loading model, wait for it to complete
      
    } else if (!isLoading && !isAuthenticated) {
      console.log('🔍 User not authenticated → staying on landing page');
      console.log('📍 ROUTING DECISION: Not authenticated → stay on landing');
    } else {
      console.log('⏳ Still loading authentication state...');
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

      {/* NEW AUTH ROUTES - Primary Sign-In/Sign-Up pages using Stack Auth */}
      <Route path="/sign-in" component={() => (
        <Suspense fallback={<PageLoader />}>
          <AuthSignIn />
        </Suspense>
      )} />
      <Route path="/sign-up" component={() => (
        <Suspense fallback={<PageLoader />}>
          <AuthSignUp />
        </Suspense>
      )} />

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

      {/* ✅ CRITICAL FIX: OAuth callback handler MUST come before wildcard routes to preserve query parameters */}
      <Route path="/handler/oauth-callback" component={() => {
        // 🔥 CRITICAL: Use dedicated OAuthCallback component that properly handles token exchange
        // StackHandler is for UI pages (sign-in, sign-up), NOT for OAuth callbacks
        console.log('🔍 OAuth callback route invoked');
        console.log('🔍 URL:', window.location.href);
        console.log('🔍 Cookies before handler:', document.cookie.substring(0, 200));
        
        // No Suspense needed since OAuthCallback is not lazy-loaded
        return <OAuthCallback />;
      }} />
      
      {/* STACK AUTH HANDLER - Consolidated wildcard route for ALL other Stack redirects/callbacks */}
      <Route path="/handler/:rest*" component={HandlerRoutes} />
      <Route path="/handler" component={HandlerRoutes} />
      
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

      {/* ROUTE ALIASES & REDIRECTS */}
      <Route path="/gallery" component={() => {
        // Redirect /gallery to /sselfie-gallery for compatibility
        window.location.replace('/sselfie-gallery');
        return <PageLoader />;
      }} />

      {/* CATCH-ALL 404 ROUTE - Must be last */}
      <Route component={() => (
        <Suspense fallback={<PageLoader />}>
          <NotFound />
        </Suspense>
      )} />
    </div>
  );
}

// Stack Auth Handler component for authentication routes - SIMPLIFIED FIX
function HandlerRoutes() {
  const handlerPath = window.location.pathname.replace('/handler/', '') || '';
  
  console.log('🔍 HandlerRoutes: handlerPath =', handlerPath);
  console.log('🔍 HandlerRoutes: full location =', window.location.href);
  
  // ✅ CRITICAL FIX: Removed OAuth callback handling from here - now handled by dedicated route
  // This prevents route conflicts and preserves OAuth query parameters
  
  // Check if this is a Stack Auth handler path (excluding OAuth callback which has its own route)
  const isStackAuthHandler = handlerPath.includes('magic-link-verify') || 
                             handlerPath.includes('password-reset') ||
                             handlerPath.includes('email-verification');

  // Use StackHandler for other Stack Auth handlers (not OAuth callback)
  if (isStackAuthHandler) {
    console.log('🔍 HandlerRoutes: Using StackHandler for =', handlerPath);
    
    return (
      <StackHandler 
        app={stackClientApp} 
        location={window.location.pathname + window.location.search + window.location.hash}
        fullPage={true}
      />
    );
  }

  // For regular sign-in and sign-up, use the traditional components with custom UI
  const isSignUp = handlerPath.includes('sign-up');
  
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

        {/* Render the appropriate Stack Auth form for sign-in/sign-up */}
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
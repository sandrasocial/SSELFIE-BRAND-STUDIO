/* eslint-disable no-console */
import React, { type ReactNode, useEffect, useState } from 'react';
const { createElement } = React;
import type { JSXComponent, EnhancedProps } from './types/react-types';
import { Route, Switch, useLocation } from "wouter";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { StackHandler, StackProvider, StackTheme } from "@stackframe/react";
// ✅ Import stackClientApp directly - it's already initialized in main.tsx
import { stackClientApp } from "../../stack/client";
import { useQuery } from "@tanstack/react-query";
import { detectBrowserIssues, showDomainHelp } from "./utils/browserCompat.js";
import { optimizeImageLoading } from "./utils/performance.js";
import { optimizeRuntime } from "./utils/webVitals.js";
import { initializeMobileOptimization } from "./utils/mobileOptimization.js";
import { performanceMonitor } from "./utils/performanceMonitor.js";
import RootWrapper from "./components/layout/RootWrapper";
import { useAuth } from "./hooks/use-auth.js";
import { useUserModelStatus } from "./hooks/useUserModelStatus.js";
import { initializeRuntimeOptimization } from "./utils/runtimeOptimization.js";
import { ROUTES } from "./constants/routes.js";
import { MayaDiagnostic } from "./components/MayaDiagnostic.js";

// Luxury Mobile Styling
import "./styles/luxury-mobile.css";

// Import all lazy-loaded pages
import {
  SselfieAppLayout,
  MayaPage,
  BusinessLanding,
  SimpleTraining,
  SimpleCheckout,
  EmbeddedCheckout,
  PaymentSuccess,
  ThankYou,
  Terms,
  Privacy,
  NotFound,
  SSELFIEGallery,
  AICommandCenter
  // SignInPage - REMOVED: Let Stack handle all auth through /handler routes
} from './pages/lazy-pages';

import { PUBLIC_ROUTES } from "./constants/routes";

// Components
import { PageLoader } from './components/loaders';
import { AuthWrapper } from './features/auth/components/AuthWrapper.js';

// ✅ REMOVED: ProtectedRouteWrapper is no longer needed
// StackAuthProvider now handles authentication for all routes
// This eliminates redundant auth checks and loading screens

// Smart Home component - Routes users through simplified journey
// NEW USER JOURNEY: Authentication → AI Training → Payment → App Studio
// ✅ FIXED: Now checks if user has trained model before routing
function SmartHome() {
  const { user, isAuthenticated, isLoading: isAuthLoading } = useAuth({ silent: true });
  const { modelStatus, isLoading: isModelLoading, hasTrainedModel } = useUserModelStatus(isAuthenticated);
  const [hasRedirected, setHasRedirected] = useState(false);

  // 🔧 DEBUG: Add more detailed logging for routing decisions
  console.log('🏠 SmartHome: Routing state debug', {
    isAuthenticated,
    isAuthLoading,
    isModelLoading,
    hasRedirected,
    userId: user?.id?.substring(0, 8) + '...',
    userEmail: user?.email,
    hasTrainedModel,
    trainingStatus: modelStatus?.trainingStatus,
    modelStatusId: modelStatus?.id,
    needsTraining: modelStatus?.needsTraining
  });

  // ✅ FIXED: Only log when state changes (not on every render)
  // This prevents infinite loop caused by console.log triggering re-renders
  useEffect(() => {
    console.log('🏠 SmartHome: State changed', {
      isAuthenticated,
      isAuthLoading,
      isModelLoading,
      userId: user?.id?.substring(0, 8) + '...',
      userEmail: user?.email,
      hasTrainedModel,
      trainingStatus: modelStatus?.trainingStatus,
      hasRedirected
    });
  }, [isAuthenticated, isAuthLoading, isModelLoading, hasTrainedModel, modelStatus?.trainingStatus, hasRedirected]);

  // ✅ FIXED: Handle routing in useEffect to prevent infinite redirects
  useEffect(() => {
    if (isAuthLoading || (isAuthenticated && isModelLoading) || hasRedirected) {
      return;
    }

    if (isAuthenticated && user) {
      // 🔧 FIX: More robust routing logic with explicit model status checks
      const trainingStatus = modelStatus?.trainingStatus;
      const isModelCompleted = trainingStatus === 'completed';
      const hasModelId = !!modelStatus?.id;
      
      // More detailed routing decision
      console.log('🔀 SmartHome: Making routing decision', {
        userId: user.id?.substring(0, 8) + '...',
        hasTrainedModel,
        trainingStatus,
        isModelCompleted,
        hasModelId,
        modelStatus: modelStatus ? {
          id: modelStatus.id,
          trainingStatus: modelStatus.trainingStatus,
          needsTraining: modelStatus.needsTraining,
          canRetrain: modelStatus.canRetrain
        } : null
      });

      if (hasTrainedModel && isModelCompleted) {
        // User has completed trained model - go to Studio
        console.log('✅ SmartHome: User has completed training, routing to /app/studio');
        setHasRedirected(true);
        window.location.href = ROUTES.APP + '/studio';
      } else if (trainingStatus === 'training') {
        // User model is currently training - go to training page to show progress
        console.log('⏳ SmartHome: Model is training, routing to /app/training');
        setHasRedirected(true);
        window.location.href = ROUTES.APP + '/training';
      } else {
        // User needs to start or restart training
        console.log('🎯 SmartHome: User needs training, routing to /app/training');
        setHasRedirected(true);
        window.location.href = ROUTES.APP + '/training';
      }
    } else if (!isAuthLoading && !isAuthenticated) {
      // User not authenticated - redirect to sign-in
      console.log('🔐 SmartHome: User not authenticated, redirecting to /handler/sign-in');
      setHasRedirected(true);
      window.location.href = '/handler/sign-in';
    }
  }, [isAuthenticated, user, hasTrainedModel, isModelLoading, isAuthLoading, hasRedirected, modelStatus?.trainingStatus]);

  if (isAuthLoading || (isAuthenticated && isModelLoading)) {
    return <PageLoader />;
  }

  if (isAuthenticated && user) {
    // Routing handled in useEffect above
    return <PageLoader />;
  } else {
    // User not authenticated - routing handled in useEffect above
    return <PageLoader />;
  }
}

// ✅ Stack Auth Handler - Let Stack handle ALL authentication internally
function HandlerRoutes() {
  const [location] = useLocation();

  console.log('🔍 HandlerRoutes: Processing route:', location);

  if (!stackClientApp) {
    return createElement('div',
      { className: "min-h-screen bg-stone-50 flex items-center justify-center" },
      createElement('div',
        { className: "text-center" },
        createElement('h2', { className: "text-2xl mb-4" }, "Authentication Error"),
        createElement('p', { className: "text-gray-600 mb-4" }, "Stack Auth is not initialized"),
        createElement('button', {
          onClick: () => window.location.reload(),
          className: "bg-black text-white px-6 py-2 rounded"
        }, "Retry")
      )
    );
  }

  // ✅ REMOVED: Custom redirect logic - Let Stack handle ALL authentication flows internally
  // Stack will automatically redirect to afterSignIn/afterSignUp URLs after successful auth

  // ✅ Use StackHandler exactly as Stack Auth documentation shows
  console.log('🔍 HandlerRoutes: Rendering StackHandler for location:', location);
  return createElement(StackHandler, {
    app: stackClientApp,
    location: location,
    fullPage: true
  });
}

function Router() {
  return (
    <main role="main" aria-label="Main content">
      <Switch>
      {/* STACK AUTH HANDLER - Consolidated routes for ALL Stack Auth operations */}
      {/* ✅ FIXED: Explicit OAuth callback route handling */}
      {/* Stack Auth handles all /handler/* routes automatically including:
          - /handler/sign-in (Email/Password authentication)
          - /handler/sign-up (User registration)
          - /handler/oauth-callback (OAuth provider callbacks - Google, GitHub, etc.)
          - /handler/verify-email (Email verification)
          - /handler/reset-password (Password reset)
      */}
      <Route
        path="/handler/:path*"
        component={() => <HandlerRoutes />}
      />

      {/* Home page - Smart routing based on auth and training status */}
      <Route path="/" component={SmartHome} />

      {/* Public landing pages */}
      <Route
        path="/business"
        component={() => <BusinessLanding />}
      />

      {/* Authentication pages - REMOVED: Let Stack handle all auth through /handler routes */}
      {/* <Route
        path="/sign-in"
        component={() => <SignInPage />}
      /> */}

      {/* Protected onboarding routes */}
      <Route
        path="/simple-training"
        component={() => <SimpleTraining />}
      />

      {/* Public checkout - allows new users to purchase before authentication */}
      <Route
        path="/simple-checkout"
        component={() => <SimpleCheckout />}
      />
      <Route
        path="/embedded-checkout"
        component={() => <EmbeddedCheckout />}
      />
      <Route
        path="/payment-success"
        component={() => <PaymentSuccess />}
      />
      <Route
        path="/thank-you"
        component={() => <ThankYou />}
      />

      {/* Maya Chat - Direct route for Maya AI chat interface */}
      <Route
        path="/maya"
        component={() => <MayaPage />}
      />

      {/* Main authenticated app routes */}
      <Route
        path="/app"
        component={() => <SselfieAppLayout />}
      />
      <Route
        path="/app/:tab*"
        component={() => <SselfieAppLayout />}
      />

      {/* AI Command Center - Protected route for authenticated users */}
      <Route
        path="/ai-command-center"
        component={() => <AICommandCenter />}
      />

      {/* SSELFIE Gallery - Protected Route */}
      <Route
        path="/sselfie-gallery"
        component={() => <SSELFIEGallery />}
      />

      {/* Legal pages */}
      <Route
        path="/terms"
        component={() => <Terms />}
      />
      <Route
        path="/privacy"
        component={() => <Privacy />}
      />

      {/* 404 Not Found - Must be last */}
      <Route
        path="/:rest*"
        component={() => <NotFound />}
      />
      </Switch>
    </main>
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

    // ✅ DISABLED: Service worker caching was causing 6-8 min deployment slowdown
    // Service worker was caching API responses, auth tokens, and HTML/JS/CSS inappropriately
    // This caused stale data, auth issues, and broken real-time features
    // PWA still works via manifest.json - service worker registration disabled
    // enableServiceWorkerCaching();

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

  return createElement(ErrorBoundary, null,
    createElement(StackProvider, { app: stackClientApp },
      createElement(StackTheme, null,
        createElement(RootWrapper, null,
          createElement(AuthWrapper, null,
            createElement(Router)
          )
        )
      )
    )
  );
}

export default App;
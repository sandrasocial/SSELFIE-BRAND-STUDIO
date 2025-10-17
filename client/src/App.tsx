/* eslint-disable no-console */
import React, { type ReactNode, useEffect, useState } from 'react';
const { createElement } = React;
import type { JSXComponent, EnhancedProps } from './types/react-types';
import { Route, useLocation } from "wouter";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { StackHandler } from "@stackframe/react";
// ⚠️ CRITICAL: Do NOT import stackClientApp here - it causes circular dependency
// stackClientApp is imported lazily in StackAuthProvider.tsx instead
// Import it dynamically when needed
import { useQuery } from "@tanstack/react-query";
import { detectBrowserIssues, showDomainHelp } from "./utils/browserCompat.js";
import { optimizeImageLoading, enableServiceWorkerCaching } from "./utils/performanceOptimizations.js";
import { optimizeRuntime } from "./utils/webVitals.js";
import { initializeMobileOptimization } from "./utils/mobileOptimization.js";
import { performanceMonitor } from "./utils/performanceMonitor.js";
import { WithStackAuth } from "./components/auth/WithStackAuth";
import RootWrapper from "./components/RootWrapper";
import { useAuth } from "./hooks/use-auth.js";
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
  AuthSuccessComponent,
  NotFound,
  SSELFIEGallery,
  AICommandCenter
} from './pages/lazy-pages';

import { PUBLIC_ROUTES } from "./constants/routes";

// Components
import { PageLoader } from './components/loaders';

// Protected Route Wrapper Component
function ProtectedRouteWrapper({ children }: { children: React.ReactNode }) {
  const [location, setLocation] = useLocation();
  const { isAuthenticated, isLoading } = useAuth();
  const [redirected, setRedirected] = useState(false);

  // Check if current route is public
  const isPublicRoute = PUBLIC_ROUTES.some(route =>
    location === route || location.startsWith(route + '/')
  );

  // Handle auth state changes
  useEffect(() => {
    // Only redirect once to prevent infinite loops
    if (!redirected && !isLoading && !isAuthenticated && !isPublicRoute) {
      console.log(`🔐 ProtectedRouteWrapper: Redirecting unauthenticated user from ${location} to sign-in`);
      setRedirected(true);
      setLocation('/handler/sign-in');
    }
  }, [isAuthenticated, isLoading, isPublicRoute, setLocation, redirected]);

  // Allow public routes through without auth check
  if (isPublicRoute) {
    console.log(`✅ ProtectedRouteWrapper: Public route ${location} - allowing access`);
    return createElement(React.Fragment, null, children);
  }

  // Show loading state while checking auth
  if (isLoading) {
    console.log(`⏳ ProtectedRouteWrapper: Auth is loading for ${location}`);
    return createElement(PageLoader);
  }

  // If not authenticated, show loader while redirecting
  if (!isAuthenticated) {
    console.log(`🔄 ProtectedRouteWrapper: User not authenticated for ${location}, redirecting...`);
    return createElement(PageLoader);
  }

  // Render protected route
  console.log(`✅ ProtectedRouteWrapper: User authenticated, rendering protected route ${location}`);
  return createElement(React.Fragment, null, children);
}

// Smart Home component - Routes users through simplified journey
// NEW USER JOURNEY: Authentication → AI Training → Payment → App Studio
function SmartHome() {
  const [, setLocation] = useLocation();
  const [redirected, setRedirected] = useState(false);

  // ✅ CRITICAL FIX: Don't call useAuth() here - it causes stuck loading page
  // Instead, redirect to business landing immediately
  // The business landing page will handle auth checks if needed
  useEffect(() => {
    if (!redirected) {
      console.log('🔀 SmartHome: Redirecting to business landing');
      setRedirected(true);
      setLocation(ROUTES.BUSINESS_LANDING);
    }
  }, [redirected, setLocation]);

  // Show minimal loading while redirecting
  return <PageLoader />;
}

// 🔥 CLEANED UP: Stack Auth Handler - Single source of truth for authentication
function HandlerRoutes() {
  const [app, setApp] = useState<any>(null);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Lazy load stackClientApp only when needed
    import('../../stack/client').then(module => {
      setApp(module.stackClientApp);
    }).catch(err => {
      console.error('🔥 Failed to load Stack Auth:', err);
      setError(err);
    });
  }, []);

  if (error) {
    return createElement('div',
      { className: "min-h-screen bg-stone-50 flex items-center justify-center" },
      createElement('div',
        { className: "text-center" },
        createElement('h2', { className: "text-2xl mb-4" }, "Authentication Error"),
        createElement('p', { className: "text-gray-600 mb-4" }, "Failed to load authentication: " + error.message),
        createElement('button', {
          onClick: () => window.location.reload(),
          className: "bg-black text-white px-6 py-2 rounded"
        }, "Retry")
      )
    );
  }

  if (!app) {
    return createElement(PageLoader);
  }

  // ✅ Use StackHandler for ALL Stack Auth operations to ensure consistency
  // This includes sign-in, sign-up, magic-link, password-reset, email-verification
  try {
    return createElement(StackHandler, {
      app: app,
      location: window.location.pathname + window.location.search + window.location.hash,
      fullPage: true
    });
  } catch (error) {
    console.error('🔥 StackHandler Error:', error);
    return createElement('div',
      { className: "min-h-screen bg-stone-50 flex items-center justify-center" },
      createElement('div',
        { className: "text-center" },
        createElement('h2', { className: "text-2xl mb-4" }, "Authentication Error"),
        createElement('p', { className: "text-gray-600 mb-4" }, "There was an issue with authentication."),
        createElement('button', {
          onClick: () => window.location.reload(),
          className: "bg-black text-white px-6 py-2 rounded"
        }, "Retry")
      )
    );
  }
}

function Router() {
  return (
    <>
      {/* Post-auth success handoff - MOVED TO TOP for priority matching */}
      <Route
        path="/auth-success"
        component={() => <AuthSuccessComponent />}
      />

      {/* CLEANED UP: Redirect to Stack Auth handlers for consistency */}
      <Route
        path="/sign-in"
        component={() => {
          window.location.replace('/handler/sign-in');
          return <PageLoader />;
        }}
      />
      <Route
        path="/sign-up"
        component={() => {
          window.location.replace('/handler/sign-up');
          return <PageLoader />;
        }}
      />

      {/* STACK AUTH HANDLER - Consolidated routes for ALL Stack Auth operations */}
      {/* CRITICAL FIX: OAuth callback handler MUST come before other routes to preserve query parameters */}
      <Route
        path="/handler/oauth-callback"
        component={() => {
          const OAuthCallback = React.lazy(() => import("./pages/handler/oauth-callback"));
          return <OAuthCallback />;
        }}
      />

      {/* Use HandlerRoutes for all Stack Auth operations for consistency */}
      <Route
        path="/handler/:path*"
        component={() => <HandlerRoutes />}
      />

      {/* Home page - Smart routing based on auth and training status */}
      <Route path="/" component={SmartHome} />

      {/* Debug route for auth diagnostics */}
      <Route
        path="/auth-diagnostic"
        component={() => {
          const AuthDiagnostic = React.lazy(() => import("./pages/auth-diagnostic"));
          return <AuthDiagnostic />;
        }}
      />

      {/* Public landing pages */}
      <Route
        path="/business"
        component={() => <BusinessLanding />}
      />

      {/* Protected onboarding routes */}
      <Route
        path="/simple-training"
        component={() => (
          <ProtectedRouteWrapper>
            <SimpleTraining />
          </ProtectedRouteWrapper>
        )}
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
        component={() => (
          <ProtectedRouteWrapper>
            <PaymentSuccess />
          </ProtectedRouteWrapper>
        )}
      />
      <Route
        path="/thank-you"
        component={() => <ThankYou />}
      />

      {/* Maya Chat - Direct route for Maya AI chat interface */}
      <Route
        path="/maya"
        component={() => (
          <ProtectedRouteWrapper>
            <MayaPage />
          </ProtectedRouteWrapper>
        )}
      />

      {/* Main authenticated app routes */}
      <Route
        path="/app"
        component={() => (
          <ProtectedRouteWrapper>
            <SselfieAppLayout />
          </ProtectedRouteWrapper>
        )}
      />
      <Route
        path="/app/:tab*"
        component={() => (
          <ProtectedRouteWrapper>
            <SselfieAppLayout />
          </ProtectedRouteWrapper>
        )}
      />

      {/* AI Command Center - Protected route for authenticated users */}
      <Route
        path="/ai-command-center"
        component={() => (
          <ProtectedRouteWrapper>
            <AICommandCenter />
          </ProtectedRouteWrapper>
        )}
      />

      {/* SSELFIE Gallery - Protected Route */}
      <Route
        path="/sselfie-gallery"
        component={() => (
          <ProtectedRouteWrapper>
            <SSELFIEGallery />
          </ProtectedRouteWrapper>
        )}
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
    </>
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

  return createElement(ErrorBoundary, null,
    createElement(RootWrapper, null,
      createElement(Router)
    )
  );
}

export default App;
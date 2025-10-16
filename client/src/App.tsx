/* eslint-disable no-console */
import React, { type ReactNode, useEffect } from 'react';
const { createElement } = React;
import type { JSXComponent, EnhancedProps } from './types/react-types';
import { Route, useLocation } from "wouter";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { StackHandler } from "@stackframe/react";
// ⚠️ CRITICAL: Do NOT import stackClientApp here - it causes circular dependency
// stackClientApp is imported lazily in StackAuthProvider.tsx instead
// Import it dynamically when needed
let stackClientApp: any = null;
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
  SignInHandler,
  PostLoginHandler,
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

import { SuspenseWrapper } from './components/SuspenseWrapper';

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
    return createElement(React.Fragment, null, children);
  }

  // Show loading state
  if (isLoading || !isAuthenticated) {
    return createElement(PageLoader);
  }

  // Render protected route
  return createElement(React.Fragment, null, children);
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
  return createElement(SuspenseWrapper, null,
    createElement(PostLoginHandler)
  );
}

// 🔥 CLEANED UP: Stack Auth Handler - Single source of truth for authentication
function HandlerRoutes() {
  const [app, setApp] = React.useState<any>(null);
  const [error, setError] = React.useState<Error | null>(null);

  React.useEffect(() => {
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
  const routes = [
    // Post-auth success handoff - MOVED TO TOP for priority matching
    createElement(Route, {
      path: "/auth-success",
      component: () => createElement(SuspenseWrapper, null, 
        createElement(AuthSuccessComponent)
      )
    }),

    // CLEANED UP: Redirect to Stack Auth handlers for consistency
    createElement(Route, {
      path: "/sign-in",
      component: () => {
        window.location.replace('/handler/sign-in');
        return createElement(PageLoader);
      }
    }),
    createElement(Route, {
      path: "/sign-up",
      component: () => {
        window.location.replace('/handler/sign-up');
        return createElement(PageLoader);
      }
    }),

    // STACK AUTH HANDLER - Consolidated routes for ALL Stack Auth operations
    // CRITICAL FIX: OAuth callback handler MUST come before other routes to preserve query parameters
    createElement(Route, {
      path: "/handler/oauth-callback",
      component: () => {
        const OAuthCallback = React.lazy(() => import("./pages/handler/oauth-callback"));
        return createElement(SuspenseWrapper, null,
          createElement(OAuthCallback)
        );
      }
    }),
      
    // Use HandlerRoutes for all Stack Auth operations for consistency
    createElement(Route, {
      path: "/handler/:path*",
      component: () => createElement(SuspenseWrapper, null,
        createElement(HandlerRoutes)
      )
    }),

    // Home page - Smart routing based on auth and training status
    createElement(Route, {
      path: "/",
      component: SmartHome
    }),

    // Debug route for auth diagnostics
    createElement(Route, {
      path: "/auth-diagnostic",
      component: () => {
        const AuthDiagnostic = React.lazy(() => import("./pages/auth-diagnostic"));
        return createElement(SuspenseWrapper, null,
          createElement(AuthDiagnostic)
        );
      }
    }),

    // Public landing pages
    createElement(Route, {
      path: "/business",
      component: () => createElement(SuspenseWrapper, null,
        createElement(BusinessLanding)
      )
    }),

    // Protected onboarding routes
    createElement(Route, {
      path: "/simple-training",
      component: () => createElement(ProtectedRouteWrapper, null,
        createElement(SuspenseWrapper, null,
          createElement(SimpleTraining)
        )
      )
    }),
      
    // Public checkout - allows new users to purchase before authentication
    createElement(Route, {
      path: "/simple-checkout",
      component: () => createElement(SuspenseWrapper, null,
        createElement(SimpleCheckout)
      )
    }),
    createElement(Route, {
      path: "/embedded-checkout",
      component: () => createElement(SuspenseWrapper, null,
        createElement(EmbeddedCheckout)
      )
    }),
    createElement(Route, {
      path: "/payment-success",
      component: () => createElement(ProtectedRouteWrapper, null,
        createElement(SuspenseWrapper, null,
          createElement(PaymentSuccess)
        )
      )
    }),
    createElement(Route, {
      path: "/thank-you",
      component: () => createElement(SuspenseWrapper, null,
        createElement(ThankYou)
      )
    }),

    // Maya Chat - Direct route for Maya AI chat interface
    createElement(Route, {
      path: "/maya",
      component: () => createElement(ProtectedRouteWrapper, null,
        createElement(SuspenseWrapper, null,
          createElement(MayaPage)
        )
      )
    }),

    // Main authenticated app routes
    createElement(Route, {
      path: "/app",
      component: () => createElement(ProtectedRouteWrapper, null,
        createElement(SuspenseWrapper, null,
          createElement(SselfieAppLayout)
        )
      )
    }),
    createElement(Route, {
      path: "/app/:tab*",
      component: () => createElement(ProtectedRouteWrapper, null,
        createElement(SuspenseWrapper, null,
          createElement(SselfieAppLayout)
        )
      )
    }),

    // AI Command Center - Protected route for authenticated users
    createElement(Route, {
      path: "/ai-command-center",
      component: () => createElement(ProtectedRouteWrapper, null,
        createElement(SuspenseWrapper, null,
          createElement(AICommandCenter)
        )
      )
    }),

    // SSELFIE Gallery - Protected Route
    createElement(Route, {
      path: "/sselfie-gallery",
      component: () => createElement(ProtectedRouteWrapper, null,
        createElement(SuspenseWrapper, null,
          createElement(SSELFIEGallery)
        )
      )
    }),

    // Legal pages
    createElement(Route, {
      path: "/terms",
      component: () => createElement(SuspenseWrapper, null,
        createElement(Terms)
      )
    }),
    createElement(Route, {
      path: "/privacy",
      component: () => createElement(SuspenseWrapper, null,
        createElement(Privacy)
      )
    }),

    // 404 Not Found - Must be last
    createElement(Route, {
      path: "/:rest*",
      component: () => createElement(SuspenseWrapper, null,
        createElement(NotFound)
      )
    })
  ];
  
  return createElement('div', null, routes);
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
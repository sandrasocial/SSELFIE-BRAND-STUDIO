import React, { ComponentType, useEffect } from 'react';
import { Route, useLocation, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { ProtectedRoute } from './components/ProtectedRoute';
import { Toaster } from "./components/ui/toaster";
import { TooltipProvider } from "./components/ui/tooltip";
import { StackProvider, StackTheme, StackHandler } from "@stackframe/react";
import { stackClientApp } from "./stack";
import { useAuth } from "./hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { redirectToHttps, detectBrowserIssues, showDomainHelp } from "./utils/browserCompat";
import { optimizeImageLoading, enableServiceWorkerCaching } from "./utils/performanceOptimizations";
import { optimizeRuntime } from "./utils/webVitals";

// Core pages (loaded immediately) - BRAND STUDIO IS PRIMARY
import BrandStudioPage from "./pages/BrandStudioPage";
import AppLayout from "./pages/AppLayout";

// Import all pages directly to ensure they're included in the main bundle
import BusinessLanding from "./pages/business-landing";
import SimpleTraining from "./pages/simple-training";
import SimpleCheckout from "./pages/simple-checkout";
import PaymentSuccess from "./pages/payment-success";
import ThankYou from "./pages/thank-you";

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
      <Route path="/handler/:path*" component={HandlerRoutes} />
      
      {/* HOME ROUTE - Smart routing based on authentication and training status */}
      <Route path="/" component={() => {
        const { isAuthenticated, isLoading } = useAuth();
        
        if (isLoading) {
          return <PageLoader />;
        }
        
        if (isAuthenticated) {
          return <SmartHome />;
        }
        
        return <BusinessLanding />;
      }} />
      
      {/* PUBLIC ROUTES */}
      <Route path="/business" component={BusinessLanding} />

      {/* PAYMENT FLOW */}
      <Route path="/simple-checkout" component={SimpleCheckout} />
      <Route path="/thank-you" component={ThankYou} />
      <Route path="/payment-success" component={PaymentSuccess} />

      {/* PROTECTED ROUTES */}
      
      {/* AI TRAINING WORKFLOW */}
      <Route path="/simple-training" component={(props) => (
        <ProtectedRoute component={SimpleTraining} {...props} />
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
  const handlerPath = (params["path*"] || params["0"] || '').replace(/[)}]+$/, '');
  return <StackHandler app={stackClientApp} location={handlerPath} fullPage />;
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
    } catch (error) {
      console.error('Error in App initialization:', error);
    }
  }, []);

  console.log('SSELFIE Studio: App rendering...');
  
  return (
    <>
      <Router />
    </>
  );
}

export default AppWithProvider;
import { Route, Switch, useLocation } from "wouter";
import { lazy, Suspense, useEffect } from 'react';
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "./components/ui/toaster";
import { TooltipProvider } from "./components/ui/tooltip";
import { detectBrowserIssues, showDomainHelp } from "./utils/browserCompat";

// Route Groups - Lazy loaded for performance
const PublicRoutes = lazy(() => import('./routes/PublicRoutes'));
const MemberRoutes = lazy(() => import('./routes/MemberRoutes'));
const AdminRoutes = lazy(() => import('./routes/AdminRoutes'));

// Loading component
function LoadingSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin w-8 h-8 border-4 border-black border-t-transparent rounded-full" />
    </div>
  );
}

// Main Router with route delegation
function Router() {
  const [location] = useLocation();
  
  return (
    <Switch>
      {/* ADMIN ROUTES - Protected consulting agents infrastructure */}
      <Route path="/admin*" component={() => <AdminRoutes />} />
      
      {/* MEMBER ROUTES - 5-step business journey */}
      <Route path="/workspace*" component={() => <MemberRoutes />} />
      <Route path="/maya*" component={() => <MemberRoutes />} />
      <Route path="/victoria*" component={() => <MemberRoutes />} />
      <Route path="/onboarding*" component={() => <MemberRoutes />} />
      <Route path="/ai-*" component={() => <MemberRoutes />} />
      <Route path="/simple-*" component={() => <MemberRoutes />} />
      <Route path="/gallery*" component={() => <MemberRoutes />} />
      <Route path="/profile*" component={() => <MemberRoutes />} />
      <Route path="/checkout*" component={() => <MemberRoutes />} />
      <Route path="/payment-*" component={() => <MemberRoutes />} />
      <Route path="/thank-you*" component={() => <MemberRoutes />} />
      <Route path="/welcome*" component={() => <MemberRoutes />} />
      <Route path="/auth-success*" component={() => <MemberRoutes />} />
      <Route path="/switch-account*" component={() => <MemberRoutes />} />
      <Route path="/build*" component={() => <MemberRoutes />} />
      <Route path="/photo-selection*" component={() => <MemberRoutes />} />
      <Route path="/brand-onboarding*" component={() => <MemberRoutes />} />
      <Route path="/custom-photoshoot-library*" component={() => <MemberRoutes />} />
      <Route path="/flatlay-library*" component={() => <MemberRoutes />} />
      <Route path="/flatlays*" component={() => <MemberRoutes />} />
      
      {/* PUBLIC ROUTES - Everything else */}
      <Route path="*" component={() => <PublicRoutes />} />
    </Switch>
  );
}

function AppWithProvider() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <App />
      </TooltipProvider>
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
      
      console.log('SSELFIE Studio: App initialization complete');
    } catch (error) {
      console.warn('SSELFIE Studio: Non-critical initialization error:', error);
    }
  }, []);

  return (
    <div className="App">
      <Suspense fallback={<LoadingSpinner />}>
        <Router />
      </Suspense>
      <Toaster />
    </div>
  );
}

export default AppWithProvider;
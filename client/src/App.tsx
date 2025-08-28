import React, { ComponentType, useEffect, lazy, Suspense } from 'react';
import { Route, useLocation, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "./components/ui/toaster";
import { TooltipProvider } from "./components/ui/tooltip";
import { useAuth } from "./hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { redirectToHttps, detectBrowserIssues, showDomainHelp } from "./utils/browserCompat";

// Core pages (loaded immediately)
import EditorialLanding from "./pages/editorial-landing";
import Workspace from "./pages/workspace";
import Maya from "./pages/maya";

// Lazy loaded pages for better performance
const SSELFIEGallery = lazy(() => import("./pages/sselfie-gallery"));
const SimpleTraining = lazy(() => import("./pages/simple-training"));
const Profile = lazy(() => import("./pages/profile"));
const Pricing = lazy(() => import("./pages/pricing"));
const Onboarding = lazy(() => import("./pages/onboarding"));
const About = lazy(() => import("./pages/about"));
const Blog = lazy(() => import("./pages/blog"));
const Contact = lazy(() => import("./pages/contact"));
const FAQ = lazy(() => import("./pages/faq"));
const Terms = lazy(() => import("./pages/terms"));
const Privacy = lazy(() => import("./pages/privacy"));
const HowItWorks = lazy(() => import("./pages/how-it-works"));
const SelfieGuide = lazy(() => import("./pages/selfie-guide"));
const PaymentSuccess = lazy(() => import("./pages/payment-success"));
const Checkout = lazy(() => import("./pages/checkout"));
const SimpleCheckout = lazy(() => import("./pages/simple-checkout"));
const ThankYou = lazy(() => import("./pages/thank-you"));
const SandraPhotoshoot = lazy(() => import("./pages/sandra-photoshoot"));
const AIGenerator = lazy(() => import("./pages/ai-generator"));
const AIPhotoshoot = lazy(() => import("./pages/ai-photoshoot"));
const MarketingAutomation = lazy(() => import("./pages/marketing-automation"));

// Admin pages - lazy loaded
const AdminBusinessOverview = lazy(() => import("./pages/admin-business-overview"));
const AdminConsultingAgents = lazy(() => import("./pages/admin-consulting-agents"));
const AdminSubscriberImport = lazy(() => import("./pages/admin-subscriber-import"));
const BridgeMonitor = lazy(() => import("./pages/admin/bridge-monitor"));

// Feature pages - lazy loaded
const CustomPhotoshootLibrary = lazy(() => import("./pages/custom-photoshoot-library"));
const FlatlayLibrary = lazy(() => import("./pages/flatlay-library"));
const Victoria = lazy(() => import("./pages/victoria"));
const VictoriaChat = lazy(() => import("./pages/victoria-chat"));
const VictoriaBuilder = lazy(() => import('./pages/victoria-builder'));
const VictoriaPreview = lazy(() => import('./pages/victoria-preview'));
const PhotoSelection = lazy(() => import("./pages/photo-selection"));
const BrandOnboarding = lazy(() => import("./pages/brand-onboarding"));
const AuthSuccess = lazy(() => import("./pages/auth-success"));
const Login = lazy(() => import("./pages/login"));
const DomainHelp = lazy(() => import("./pages/domain-help"));
const SwitchAccount = lazy(() => import("./pages/switch-account"));
const LaunchCountdown = lazy(() => import("./pages/launch-countdown"));
const AdminAccessOnly = lazy(() => import("./pages/admin-access-only"));
const Build = lazy(() => import("./pages/build"));

// Components
import UnifiedLoginButton from "./components/UnifiedLoginButton";
import LoginPrompt from "./components/LoginPrompt";
import { PageLoader } from "./components/PageLoader";

// Removed duplicate photoshoot imports - using existing system

// Smart Home component that routes based on onboarding status
function SmartHome() {
  const [, setLocation] = useLocation();
  const { data: onboardingData, isLoading } = useQuery({
    queryKey: ['/api/onboarding'],
    retry: false,
  });

  // Always show STUDIO workspace as the home page for authenticated users
  // Onboarding is only shown once via direct navigation after first login/payment
  useEffect(() => {
    if (!isLoading) {
      setLocation('/workspace');
    }
  }, [isLoading, setLocation]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-black border-t-transparent rounded-full" />
      </div>
    );
  }
  
  return null;
}

// Protected wrapper component that handles authentication
function ProtectedRoute({ component: Component, ...props }: { component: ComponentType<any>, [key: string]: any }) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const [, setLocation] = useLocation();
  
  // Enhanced logging for debugging navigation issues
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('ProtectedRoute state:', { isAuthenticated, isLoading, hasUser: !!user });
    }
  }, [isAuthenticated, isLoading, user]);

  // FIXED: Move useEffect outside conditional to follow Rules of Hooks
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      // Use proper authentication flow instead of broken login route
      window.location.href = '/api/login';
    }
  }, [isLoading, isAuthenticated, setLocation]);
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-black border-t-transparent rounded-full" />
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-black border-t-transparent rounded-full" />
      </div>
    );
  }
  
  return <Component {...props} />;
}

function Router() {
  return (
    <div>
      {/* STREAMLINED USER JOURNEY: Landing → Simple Checkout → Payment Success → Onboarding → Workspace */}

      {/* LAUNCH COUNTDOWN */}
      <Route path="/launch" component={(props) => (
        <Suspense fallback={<PageLoader />}>
          <LaunchCountdown {...props} />
        </Suspense>
      )} />
      
      {/* PUBLIC PAGES - SINGLE MAIN LANDING PAGE */}
      <Route path="/" component={EditorialLanding} />
      
      {/* UNIFIED AUTHENTICATION PAGE */}
      <Route path="/login" component={() => (
        <div className="min-h-screen flex items-center justify-center bg-white">
          <UnifiedLoginButton text="Sign in to continue" showBrand={true} />
        </div>
      )} />



      {/* ALL OTHER LANDING PAGES ARCHIVED - ONLY EDITORIAL-LANDING.TSX IS USED */}
      <Route path="/about" component={(props) => (
        <Suspense fallback={<PageLoader />}>
          <About {...props} />
        </Suspense>
      )} />
      <Route path="/how-it-works" component={(props) => (
        <Suspense fallback={<PageLoader />}>
          <HowItWorks {...props} />
        </Suspense>
      )} />
      <Route path="/selfie-guide" component={(props) => (
        <Suspense fallback={<PageLoader />}>
          <SelfieGuide {...props} />
        </Suspense>
      )} />
      <Route path="/blog" component={(props) => (
        <Suspense fallback={<PageLoader />}>
          <Blog {...props} />
        </Suspense>
      )} />
      <Route path="/contact" component={(props) => (
        <Suspense fallback={<PageLoader />}>
          <Contact {...props} />
        </Suspense>
      )} />
      <Route path="/faq" component={(props) => (
        <Suspense fallback={<PageLoader />}>
          <FAQ {...props} />
        </Suspense>
      )} />
      <Route path="/terms" component={(props) => (
        <Suspense fallback={<PageLoader />}>
          <Terms {...props} />
        </Suspense>
      )} />
      <Route path="/privacy" component={(props) => (
        <Suspense fallback={<PageLoader />}>
          <Privacy {...props} />
        </Suspense>
      )} />
      <Route path="/pricing" component={(props) => (
        <Suspense fallback={<PageLoader />}>
          <Pricing {...props} />
        </Suspense>
      )} />
      <Route path="/domain-help" component={(props) => (
        <Suspense fallback={<PageLoader />}>
          <DomainHelp {...props} />
        </Suspense>
      )} />

      {/* PAYMENT FLOW */}
      <Route path="/checkout" component={(props) => (
        <Suspense fallback={<PageLoader />}>
          <Checkout {...props} />
        </Suspense>
      )} />
      <Route path="/simple-checkout" component={(props) => (
        <Suspense fallback={<PageLoader />}>
          <SimpleCheckout {...props} />
        </Suspense>
      )} />

      <Route path="/thank-you" component={(props) => (
        <Suspense fallback={<PageLoader />}>
          <ThankYou {...props} />
        </Suspense>
      )} />
      <Route path="/payment-success" component={(props) => (
        <Suspense fallback={<PageLoader />}>
          <PaymentSuccess {...props} />
        </Suspense>
      )} />
      <Route path="/auth-success" component={(props) => (
        <Suspense fallback={<PageLoader />}>
          <AuthSuccess {...props} />
        </Suspense>
      )} />
      <Route path="/switch-account" component={(props) => (
        <Suspense fallback={<PageLoader />}>
          <SwitchAccount {...props} />
        </Suspense>
      )} />


      {/* PROTECTED ROUTES */}
      <Route path="/workspace" component={(props) => <ProtectedRoute component={Workspace} {...props} />} />
      <Route path="/studio">
        <Redirect to="/workspace" />
      </Route>
      <Route path="/onboarding" component={(props) => <ProtectedRoute component={Onboarding} {...props} />} />
      
      {/* AI TRAINING & PHOTOSHOOT WORKFLOW */}
      <Route path="/ai-training">
        <Redirect to="/simple-training" />
      </Route>
      <Route path="/simple-training" component={(props) => (
        <Suspense fallback={<PageLoader />}>
          <ProtectedRoute component={SimpleTraining} {...props} />
        </Suspense>
      )} />

      <Route path="/ai-photoshoot" component={(props) => (
        <Suspense fallback={<PageLoader />}>
          <ProtectedRoute component={AIPhotoshoot} {...props} />
        </Suspense>
      )} />
      <Route path="/sandra-photoshoot" component={(props) => (
        <Suspense fallback={<PageLoader />}>
          <ProtectedRoute component={SandraPhotoshoot} {...props} />
        </Suspense>
      )} />
      <Route path="/custom-photoshoot-library" component={(props) => (
        <Suspense fallback={<PageLoader />}>
          <ProtectedRoute component={CustomPhotoshootLibrary} {...props} />
        </Suspense>
      )} />
      <Route path="/flatlay-library" component={(props) => (
        <Suspense fallback={<PageLoader />}>
          <ProtectedRoute component={FlatlayLibrary} {...props} />
        </Suspense>
      )} />

      <Route path="/ai-generator" component={(props) => (
        <Suspense fallback={<PageLoader />}>
          <ProtectedRoute component={AIGenerator} {...props} />
        </Suspense>
      )} />
      {/* GALLERY ROUTES: Single route with redirect for old path */}
      <Route path="/gallery">
        <Redirect to="/sselfie-gallery" />
      </Route>
      <Route path="/sselfie-gallery" component={(props) => (
        <Suspense fallback={<PageLoader />}>
          <ProtectedRoute component={SSELFIEGallery} {...props} />
        </Suspense>
      )} />
      <Route path="/profile" component={(props) => (
        <Suspense fallback={<PageLoader />}>
          <ProtectedRoute component={Profile} {...props} />
        </Suspense>
      )} />
      
      {/* AI AGENTS */}
      <Route path="/maya" component={(props) => <ProtectedRoute component={Maya} {...props} />} />
      <Route path="/victoria" component={(props) => (
        <Suspense fallback={<PageLoader />}>
          <ProtectedRoute component={Victoria} {...props} />
        </Suspense>
      )} />
      <Route path="/victoria-chat" component={(props) => (
        <Suspense fallback={<PageLoader />}>
          <ProtectedRoute component={VictoriaChat} {...props} />
        </Suspense>
      )} />
      <Route path="/photo-selection" component={(props) => (
        <Suspense fallback={<PageLoader />}>
          <ProtectedRoute component={PhotoSelection} {...props} />
        </Suspense>
      )} />
      <Route path="/brand-onboarding" component={(props) => (
        <Suspense fallback={<PageLoader />}>
          <ProtectedRoute component={BrandOnboarding} {...props} />
        </Suspense>
      )} />
      <Route path="/victoria-builder" component={(props) => (
        <Suspense fallback={<PageLoader />}>
          <ProtectedRoute component={VictoriaBuilder} {...props} />
        </Suspense>
      )} />
      <Route path="/victoria-preview" component={(props) => (
        <Suspense fallback={<PageLoader />}>
          <ProtectedRoute component={VictoriaPreview} {...props} />
        </Suspense>
      )} />
      <Route path="/build" component={(props) => (
        <Suspense fallback={<PageLoader />}>
          <ProtectedRoute component={Build} {...props} />
        </Suspense>
      )} />

      
      {/* SANDRA'S ADMIN SYSTEM - UNIFIED ROUTING */}
      <Route path="/admin" component={(props) => <ProtectedRoute component={AdminConsultingAgents} {...props} />} />
      <Route path="/admin/business-overview" component={(props) => <ProtectedRoute component={AdminBusinessOverview} {...props} />} />
      <Route path="/admin/consulting-agents" component={(props) => <ProtectedRoute component={AdminConsultingAgents} {...props} />} />
      <Route path="/admin/subscriber-import" component={(props) => <ProtectedRoute component={AdminSubscriberImport} {...props} />} />



      <Route path="/admin-access-only" component={AdminAccessOnly} />
      {/* Legacy admin routes - archived */}
      {/* Legacy agent routes removed - use /admin/consulting-agents instead */}
      
      {/* ADMIN MARKETING AUTOMATION */}
      <Route path="/marketing-automation" component={(props) => <ProtectedRoute component={MarketingAutomation} {...props} />} />
      

      {/* Test routes removed - all test files archived */}


    </div>
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
      
      console.log('SSELFIE Studio: Domain access validated, app ready');
    } catch (error) {
      console.error('Error in App initialization:', error);
    }
  }, []);

  console.log('SSELFIE Studio: App rendering...');
  
  return (
    <>
      <Toaster />
      <Router />
    </>
  );
}

export default AppWithProvider;

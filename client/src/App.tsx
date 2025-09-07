import React, { ComponentType, useEffect, lazy, Suspense, startTransition } from 'react';
import { Route, useLocation, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "./components/ui/toaster";
import { TooltipProvider } from "./components/ui/tooltip";
import { StackProvider, StackTheme, StackHandler } from "@stackframe/react";
import { stackClientApp } from "./stack";
import { useAuth } from "./hooks/use-auth";
// Using JWKS backend verification with custom frontend OAuth flow
import { useQuery } from "@tanstack/react-query";
import { redirectToHttps, detectBrowserIssues, showDomainHelp } from "./utils/browserCompat";
import { optimizeImageLoading, enableServiceWorkerCaching } from "./utils/performanceOptimizations";
import { optimizeRuntime } from "./utils/webVitals";
// Neon Auth.js - no client-side provider needed

// Core pages (loaded immediately)
import Workspace from "./pages/workspace";
import Maya from "./pages/maya";

// Lazy loaded pages for better performance
const BusinessLanding = lazy(() => import("./pages/business-landing"));
const SSELFIEGallery = lazy(() => import("./pages/sselfie-gallery"));
const SimpleTraining = lazy(() => import("./pages/simple-training"));
const TeamsLanding = lazy(() => import("./pages/teams-landing"));
const TeamsServicePackages = lazy(() => import("./pages/teams-service-packages"));
const CompanyDashboard = lazy(() => import("./pages/company-dashboard"));
const MayaBrandCustomization = lazy(() => import("./pages/maya-brand-customization"));
const SalesConsultation = lazy(() => import("./pages/sales-consultation"));
const ImplementationTimeline = lazy(() => import("./pages/implementation-timeline"));
const Profile = lazy(() => import("./pages/profile"));
const Pricing = lazy(() => import("./pages/pricing"));
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
const RetrainCheckout = lazy(() => import("./pages/retrain-checkout"));
const ThankYou = lazy(() => import("./pages/thank-you"));
const SandraPhotoshoot = lazy(() => import("./pages/sandra-photoshoot"));
const AIGenerator = lazy(() => import("./pages/ai-generator"));

const MarketingAutomation = lazy(() => import("./pages/marketing-automation"));

// Admin pages - lazy loaded
const AdminControlCenter = lazy(() => import("./pages/admin-control-center"));
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

// ✅ REMOVED: Auth success page no longer needed with direct Stack Auth integration
// ✅ DELETED: Login page removed - using direct Stack Auth OAuth integration
const DomainHelp = lazy(() => import("./pages/domain-help"));

// Stack Auth authentication pages
const AuthSignIn = lazy(() => import("./pages/AuthSignIn"));
const AuthSignUp = lazy(() => import("./pages/AuthSignUp"));
const SwitchAccount = lazy(() => import("./pages/switch-account"));
const LaunchCountdown = lazy(() => import("./pages/launch-countdown"));
const AdminAccessOnly = lazy(() => import("./pages/admin-access-only"));
const Build = lazy(() => import("./pages/build"));
const Settings = lazy(() => import("./pages/settings"));
const EmailDashboard = lazy(() => import("./pages/EmailDashboard"));

// Components
import UnifiedLoginButton from "./components/UnifiedLoginButton";
import LoginPrompt from "./components/LoginPrompt";
import { PageLoader } from "./components/PageLoader";

// Removed duplicate photoshoot imports - using existing system

// Smart Home component - Routes authenticated users to workspace
function SmartHome() {
  const [, setLocation] = useLocation();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        console.log('✅ User authenticated, redirecting to workspace');
        setLocation('/workspace');
      } else {
        console.log('🔍 User not authenticated, staying on landing page');
        // Stay on landing page for unauthenticated users
      }
    }
  }, [isAuthenticated, isLoading, setLocation]);

  // Show loading while determining auth state
  if (isLoading) {
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
function ProtectedRoute({ component: Component, ...props }: { component: ComponentType<any>, [key: string]: any }) {
  try {
    const { isAuthenticated, isLoading, signIn, user } = useAuth();
    const [, setLocation] = useLocation();
    
    // Enhanced logging for debugging navigation issues
    useEffect(() => {
      if (process.env.NODE_ENV === 'development') {
        console.log('ProtectedRoute state:', { isAuthenticated, isLoading, hasUser: !!user });
      }
    }, [isAuthenticated, isLoading, user]);

    // Redirect to sign-in if not authenticated
    useEffect(() => {
      if (!isLoading && !isAuthenticated) {
        console.log('🔍 ProtectedRoute: Redirecting to Stack Auth sign-in');
        setLocation('/auth/sign-in');
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
  } catch (error) {
    console.error('ProtectedRoute error:', error);
    // Fallback UI for React errors
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold mb-4">Loading Authentication...</h2>
          <div className="animate-spin w-8 h-8 border-4 border-black border-t-transparent rounded-full mx-auto" />
        </div>
      </div>
    );
  }
}

function Router() {
  return (
    <div>
      {/* STACK AUTH HANDLER - Must be first to catch authentication routes */}
      <Route path="/handler/:path*" component={HandlerRoutes} />
      
      {/* STREAMLINED USER JOURNEY: Landing → Simple Checkout → Payment Success → Onboarding → Workspace */}

      {/* LAUNCH COUNTDOWN */}
      <Route path="/launch" component={() => (
        <Suspense fallback={<PageLoader />}>
          <LaunchCountdown />
        </Suspense>
      )} />
      
      {/* HOME ROUTE - Smart routing based on authentication */}
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
      
      
      <Route path="/business" component={() => (
        <Suspense fallback={<PageLoader />}>
          <BusinessLanding />
        </Suspense>
      )} />
      



      {/* ALL OTHER LANDING PAGES ARCHIVED - ONLY EDITORIAL-LANDING.TSX IS USED */}
      <Route path="/about" component={() => (
        <Suspense fallback={<PageLoader />}>
          <About />
        </Suspense>
      )} />
      <Route path="/how-it-works" component={() => (
        <Suspense fallback={<PageLoader />}>
          <HowItWorks />
        </Suspense>
      )} />
      <Route path="/selfie-guide" component={() => (
        <Suspense fallback={<PageLoader />}>
          <SelfieGuide />
        </Suspense>
      )} />
      <Route path="/blog" component={() => (
        <Suspense fallback={<PageLoader />}>
          <Blog />
        </Suspense>
      )} />
      <Route path="/contact" component={() => (
        <Suspense fallback={<PageLoader />}>
          <Contact />
        </Suspense>
      )} />
      <Route path="/faq" component={() => (
        <Suspense fallback={<PageLoader />}>
          <FAQ />
        </Suspense>
      )} />
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
      <Route path="/pricing" component={() => (
        <Suspense fallback={<PageLoader />}>
          <Pricing />
        </Suspense>
      )} />
      
      <Route path="/teams" component={() => (
        <Suspense fallback={<PageLoader />}>
          <TeamsLanding />
        </Suspense>
      )} />
      
      <Route path="/teams/packages" component={() => (
        <Suspense fallback={<PageLoader />}>
          <TeamsServicePackages />
        </Suspense>
      )} />
      
      <Route path="/company-dashboard" component={() => (
        <Suspense fallback={<PageLoader />}>
          <CompanyDashboard />
        </Suspense>
      )} />
      
      <Route path="/maya-brand-customization" component={() => (
        <Suspense fallback={<PageLoader />}>
          <MayaBrandCustomization />
        </Suspense>
      )} />
      
      <Route path="/sales-consultation" component={() => (
        <Suspense fallback={<PageLoader />}>
          <SalesConsultation />
        </Suspense>
      )} />
      
      <Route path="/implementation-timeline" component={() => (
        <Suspense fallback={<PageLoader />}>
          <ImplementationTimeline />
        </Suspense>
      )} />
      <Route path="/domain-help" component={() => (
        <Suspense fallback={<PageLoader />}>
          <DomainHelp />
        </Suspense>
      )} />

      {/* JWT AUTH ROUTES */}
      {/* ✅ DELETED: Login route removed - using direct Stack Auth OAuth */}
      <Route path="/auth/sign-in" component={() => (
        <Suspense fallback={<PageLoader />}>
          <AuthSignUp />
        </Suspense>
      )} />
      <Route path="/auth/sign-up" component={() => (
        <Suspense fallback={<PageLoader />}>
          <AuthSignUp />
        </Suspense>
      )} />

      {/* PAYMENT FLOW */}
      <Route path="/checkout" component={() => (
        <Suspense fallback={<PageLoader />}>
          <Checkout />
        </Suspense>
      )} />
      <Route path="/simple-checkout" component={() => (
        <Suspense fallback={<PageLoader />}>
          <SimpleCheckout />
        </Suspense>
      )} />
      {/* 🔄 PHASE 2: DEDICATED RETRAINING CHECKOUT ROUTE */}
      <Route path="/retrain-checkout" component={() => (
        <Suspense fallback={<PageLoader />}>
          <RetrainCheckout />
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
      {/* ✅ REMOVED: Auth success route no longer needed with direct Stack Auth integration */}
      <Route path="/switch-account" component={() => (
        <Suspense fallback={<PageLoader />}>
          <SwitchAccount />
        </Suspense>
      )} />


      {/* PROTECTED ROUTES */}
      <Route path="/workspace" component={(props) => <ProtectedRoute component={Workspace} {...props} />} />
      <Route path="/studio">
        <Redirect to="/workspace" />
      </Route>

      
      {/* AI TRAINING & PHOTOSHOOT WORKFLOW */}
      <Route path="/ai-training">
        <Redirect to="/simple-training" />
      </Route>
      <Route path="/simple-training" component={(props) => (
        <Suspense fallback={<PageLoader />}>
          <ProtectedRoute component={SimpleTraining} {...props} />
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
      <Route path="/settings" component={(props) => (
        <Suspense fallback={<PageLoader />}>
          <ProtectedRoute component={Settings} {...props} />
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

      
      {/* SANDRA'S ADMIN SYSTEM - EMPIRE CONTROL CENTER */}
      <Route path="/admin" component={(props) => (
        <Suspense fallback={<PageLoader />}>
          <ProtectedRoute component={AdminControlCenter} {...props} />
        </Suspense>
      )} />
      <Route path="/admin-control-center" component={(props) => (
        <Suspense fallback={<PageLoader />}>
          <ProtectedRoute component={AdminControlCenter} {...props} />
        </Suspense>
      )} />
      <Route path="/dashboard">
        <Redirect to="/admin" />
      </Route>
      
      {/* ADMIN SUB-PAGES */}
      <Route path="/admin/business-overview" component={(props) => (
        <Suspense fallback={<PageLoader />}>
          <ProtectedRoute component={AdminBusinessOverview} {...props} />
        </Suspense>
      )} />
      <Route path="/admin/consulting-agents" component={(props) => (
        <Suspense fallback={<PageLoader />}>
          <ProtectedRoute component={AdminConsultingAgents} {...props} />
        </Suspense>
      )} />
      <Route path="/admin-consulting-agents" component={(props) => (
        <Suspense fallback={<PageLoader />}>
          <ProtectedRoute component={AdminConsultingAgents} {...props} />
        </Suspense>
      )} />
      <Route path="/admin-business-overview" component={(props) => (
        <Suspense fallback={<PageLoader />}>
          <ProtectedRoute component={AdminBusinessOverview} {...props} />
        </Suspense>
      )} />
      <Route path="/admin/subscriber-import" component={(props) => (
        <Suspense fallback={<PageLoader />}>
          <ProtectedRoute component={AdminSubscriberImport} {...props} />
        </Suspense>
      )} />
      
      <Route path="/admin/email-management" component={(props) => (
        <Suspense fallback={<PageLoader />}>
          <ProtectedRoute component={EmailDashboard} {...props} />
        </Suspense>
      )} />



      <Route path="/admin-access-only" component={AdminAccessOnly} />
      {/* Legacy admin routes - archived */}
      {/* Legacy agent routes removed - use /admin/consulting-agents instead */}
      
      {/* ADMIN MARKETING AUTOMATION */}
      <Route path="/marketing-automation" component={(props) => (
        <Suspense fallback={<PageLoader />}>
          <ProtectedRoute component={MarketingAutomation} {...props} />
        </Suspense>
      )} />
      

      {/* Test routes removed - all test files archived */}


    </div>
  );
}

// Stack Auth Handler component for authentication routes
function HandlerRoutes({ params }: { params: { path?: string } }) {
  // Extract the sub-path after "/handler/" for Stack Auth
  const handlerPath = params.path || '';
  
  // Debug logging
  console.log('🔍 HandlerRoutes:', { params, handlerPath, stackClientApp: !!stackClientApp });
  
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

// Error boundary removed - using simplified Stack Auth setup

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

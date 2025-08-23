import React, { ComponentType, useEffect } from 'react';
import { Route, useLocation, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "./components/ui/toaster";
import { TooltipProvider } from "./components/ui/tooltip";
import { useAuth } from "./hooks/use-auth";
import { redirectToHttps, detectBrowserIssues, showDomainHelp } from "./utils/browserCompat";

// ===== CORE PAGES (KEEP) =====
import EditorialLanding from "./pages/editorial-landing"; // YOUR MAIN LANDING PAGE
import Pricing from "./pages/pricing";
import Workspace from "./pages/workspace"; // MAIN APP
import Onboarding from "./pages/onboarding";
import About from "./pages/about";
import Blog from "./pages/blog";
import Contact from "./pages/contact";
import FAQ from "./pages/faq";
import Terms from "./pages/terms";
import Privacy from "./pages/privacy";
import HowItWorks from "./pages/how-it-works";
import SelfieGuide from "./pages/selfie-guide";
import Profile from "./pages/profile";

// ===== PAYMENT FLOW =====
import SimpleCheckout from "./pages/simple-checkout";
import PaymentSuccess from "./pages/payment-success";
import Welcome from "./pages/welcome";
import ThankYou from "./pages/thank-you";
import AuthSuccess from "./pages/auth-success";
import SwitchAccount from "./pages/switch-account";

// ===== AI FEATURES =====
import SimpleTraining from "./pages/simple-training";
import AIPhotoshoot from "./pages/ai-photoshoot";
import SandraPhotoshoot from "./pages/sandra-photoshoot";
import SandraAI from "./pages/sandra-ai";
import AIGenerator from "./pages/ai-generator";
import SSELFIEGallery from "./pages/sselfie-gallery";

// ===== LIBRARIES =====
import CustomPhotoshootLibrary from "./pages/custom-photoshoot-library";
import FlatlayLibrary from "./pages/flatlay-library";

// ===== AI AGENTS =====
import Maya from "./pages/maya";
import Victoria from "./pages/victoria";
import VictoriaChat from "./pages/victoria-chat";
import VictoriaBuilder from './pages/victoria-builder';
import VictoriaPreview from './pages/victoria-preview';
import PhotoSelection from "./pages/photo-selection";
import BrandOnboarding from "./pages/brand-onboarding";
import Build from "./pages/build";

// ===== ADMIN SYSTEM =====
import AdminBusinessOverview from "./pages/admin-business-overview";
import AdminConsultingAgents from "./pages/admin-consulting-agents";
import AdminSubscriberImport from "./pages/admin-subscriber-import";
import AdminAccessOnly from "./pages/admin-access-only";

// ===== UTILITY PAGES =====
import DomainHelp from "./pages/domain-help";
import LaunchCountdown from "./pages/launch-countdown";

// ===== AUTH COMPONENT =====
import UnifiedLoginButton from "./components/UnifiedLoginButton";

// ===== CLEANED UP PROTECTED ROUTE (NO LOOPS) =====
function ProtectedRoute({ component: Component, ...props }) {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-black border-t-transparent rounded-full" />
      </div>
    );
  }
  
  if (!isAuthenticated) {
    // For Replit environment, handle auth redirect carefully
    if (typeof window !== 'undefined') {
      window.location.href = '/api/login';
    }
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-black border-t-transparent rounded-full mx-auto mb-4" />
          <p>Redirecting to login...</p>
        </div>
      </div>
    );
  }
  
  return <Component {...props} />;
}

// ===== LAUNCH-READY ROUTER =====
function Router() {
  return (
    <div>
      {/* ===== MAIN LANDING PAGE ===== */}
      <Route path="/" component={EditorialLanding} />
      
      {/* ===== LAUNCH COUNTDOWN (IF NEEDED) ===== */}
      <Route path="/launch" component={LaunchCountdown} />
      
      {/* ===== PUBLIC PAGES ===== */}
      <Route path="/about" component={About} />
      <Route path="/how-it-works" component={HowItWorks} />
      <Route path="/selfie-guide" component={SelfieGuide} />
      <Route path="/blog" component={Blog} />
      <Route path="/contact" component={Contact} />
      <Route path="/faq" component={FAQ} />
      <Route path="/terms" component={Terms} />
      <Route path="/privacy" component={Privacy} />
      <Route path="/pricing" component={Pricing} />
      <Route path="/domain-help" component={DomainHelp} />

      {/* ===== SINGLE UNIFIED LOGIN ===== */}
      <Route path="/login" component={() => (
        <div className="min-h-screen flex items-center justify-center bg-white">
          <UnifiedLoginButton text="Sign in to continue" showBrand={true} />
        </div>
      )} />

      {/* ===== PAYMENT & ONBOARDING FLOW ===== */}
      <Route path="/checkout" component={SimpleCheckout} />
      <Route path="/simple-checkout" component={SimpleCheckout} />
      <Route path="/welcome" component={Welcome} />
      <Route path="/thank-you" component={ThankYou} />
      <Route path="/payment-success" component={PaymentSuccess} />
      <Route path="/auth-success" component={AuthSuccess} />
      <Route path="/switch-account" component={SwitchAccount} />

      {/* ===== MAIN APP WORKSPACE ===== */}
      <Route path="/workspace" component={(props) => <ProtectedRoute component={Workspace} {...props} />} />
      <Route path="/onboarding" component={(props) => <ProtectedRoute component={Onboarding} {...props} />} />
      
      {/* Redirect studio to workspace */}
      <Route path="/studio" component={() => <Redirect to="/workspace" />} />

      {/* ===== AI TRAINING & PHOTOSHOOTS ===== */}
      <Route path="/ai-training" component={(props) => <ProtectedRoute component={SimpleTraining} {...props} />} />
      <Route path="/ai-photoshoot" component={(props) => <ProtectedRoute component={AIPhotoshoot} {...props} />} />
      <Route path="/sandra-photoshoot" component={(props) => <ProtectedRoute component={SandraPhotoshoot} {...props} />} />
      <Route path="/sandra-ai" component={(props) => <ProtectedRoute component={SandraAI} {...props} />} />
      <Route path="/ai-generator" component={(props) => <ProtectedRoute component={AIGenerator} {...props} />} />
      
      {/* Redirect simple-training to ai-training */}
      <Route path="/simple-training" component={() => <Redirect to="/ai-training" />} />

      {/* ===== PHOTO GALLERIES & LIBRARIES ===== */}
      <Route path="/gallery" component={(props) => <ProtectedRoute component={SSELFIEGallery} {...props} />} />
      <Route path="/custom-photoshoot-library" component={(props) => <ProtectedRoute component={CustomPhotoshootLibrary} {...props} />} />
      <Route path="/flatlay-library" component={(props) => <ProtectedRoute component={FlatlayLibrary} {...props} />} />
      
      {/* Redirects for renamed routes */}
      <Route path="/sselfie-gallery" component={() => <Redirect to="/gallery" />} />
      <Route path="/flatlays" component={() => <Redirect to="/flatlay-library" />} />

      {/* ===== AI AGENTS ===== */}
      <Route path="/maya" component={(props) => <ProtectedRoute component={Maya} {...props} />} />
      <Route path="/victoria" component={(props) => <ProtectedRoute component={Victoria} {...props} />} />
      <Route path="/victoria-chat" component={(props) => <ProtectedRoute component={VictoriaChat} {...props} />} />
      <Route path="/victoria-builder" component={(props) => <ProtectedRoute component={VictoriaBuilder} {...props} />} />
      <Route path="/victoria-preview" component={(props) => <ProtectedRoute component={VictoriaPreview} {...props} />} />
      <Route path="/build" component={(props) => <ProtectedRoute component={Build} {...props} />} />

      {/* ===== USER PROFILE & SETUP ===== */}
      <Route path="/profile" component={(props) => <ProtectedRoute component={Profile} {...props} />} />
      <Route path="/photo-selection" component={(props) => <ProtectedRoute component={PhotoSelection} {...props} />} />
      <Route path="/brand-onboarding" component={(props) => <ProtectedRoute component={BrandOnboarding} {...props} />} />

      {/* ===== SANDRA'S ADMIN SYSTEM ===== */}
      <Route path="/admin" component={(props) => <ProtectedRoute component={AdminConsultingAgents} {...props} />} />
      <Route path="/admin/business-overview" component={(props) => <ProtectedRoute component={AdminBusinessOverview} {...props} />} />
      <Route path="/admin/consulting-agents" component={(props) => <ProtectedRoute component={AdminConsultingAgents} {...props} />} />
      <Route path="/admin/subscriber-import" component={(props) => <ProtectedRoute component={AdminSubscriberImport} {...props} />} />
      <Route path="/admin-access-only" component={AdminAccessOnly} />

      {/* ===== REDIRECTS FOR OLD ROUTES (NO 404s) ===== */}
      <Route path="/auth" component={() => <Redirect to="/login" />} />
      <Route path="/sign-in" component={() => <Redirect to="/login" />} />
      <Route path="/auth-custom" component={() => <Redirect to="/login" />} />
    </div>
  );
}

// ===== APP WITH PROVIDER =====
function AppWithProvider() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <App />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

// ===== MAIN APP COMPONENT =====
function App() {
  useEffect(() => {
    try {
      console.log('SSELFIE Studio: Initializing...');
      
      // Only apply domain redirects for production (not Replit dev)
      const isProduction = window.location.hostname === 'sselfie.ai';
      const isReplit = window.location.hostname.includes('replit');
      
      if (isProduction && !isReplit) {
        // Force HTTPS
        if (window.location.protocol === 'http:') {
          window.location.href = window.location.href.replace('http:', 'https:');
          return;
        }
        
        // Remove www subdomain
        if (window.location.hostname === 'www.sselfie.ai') {
          window.location.href = window.location.href.replace('www.sselfie.ai', 'sselfie.ai');
          return;
        }
      }
      
      // Check for browser issues (only in production)
      if (isProduction) {
        const issues = detectBrowserIssues();
        if (issues.length > 0) {
          console.warn('Browser compatibility issues:', issues);
          showDomainHelp();
        }
      }
      
      console.log('SSELFIE Studio: Ready for launch! 🚀');
    } catch (error) {
      console.error('App initialization error:', error);
    }
  }, []);

  return (
    <>
      <Toaster />
      <Router />
    </>
  );
}

export default AppWithProvider;
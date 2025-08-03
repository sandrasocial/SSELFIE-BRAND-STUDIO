import React, { useEffect, lazy, Suspense } from "react";
import { Switch, Route, useLocation, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { redirectToHttps, detectBrowserIssues, showDomainHelp } from "./utils/browserCompat";
// import { pwaManager } from "./utils/pwa";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import EditorialLanding from "@/pages/editorial-landing";
import Pricing from "@/pages/pricing";
import Workspace from "@/pages/workspace";
import Onboarding from "@/pages/onboarding";
import About from "@/pages/about";
import Blog from "@/pages/blog";
import Contact from "@/pages/contact";
import FAQ from "@/pages/faq";
import Terms from "@/pages/terms";
import Privacy from "@/pages/privacy";
import HowItWorks from "@/pages/how-it-works";
import SelfieGuide from "@/pages/selfie-guide";
import Profile from "@/pages/profile";
import PaymentSuccess from "@/pages/payment-success";
import Checkout from "@/pages/checkout";
import SimpleCheckout from "@/pages/simple-checkout";
import ThankYou from "@/pages/thank-you";
import SandraPhotoshoot from "@/pages/sandra-photoshoot";
import SandraAI from "@/pages/sandra-ai";
import RachelChat from "@/pages/rachel-chat";
import RachelActivation from "@/pages/rachel-activation";
import SSELFIEGallery from "@/pages/sselfie-gallery";
import AIGenerator from "@/pages/ai-generator";
import AIPhotoshoot from "@/pages/ai-photoshoot";
import SimpleTraining from "@/pages/simple-training";


import AdminDashboard from "@/pages/admin-dashboard";
import AdminBusinessOverview from "@/pages/admin-business-overview";
import AdminConsultingAgents from "@/pages/admin-consulting-agents";
import AdminSubscriberImport from "@/pages/admin-subscriber-import";

import BridgeMonitor from "@/pages/admin/bridge-monitor";
import { UnifiedAgentInterface } from "@/components/admin/UnifiedAgentInterface";


import AgentApproval from "@/pages/agent-approval";
import AgentCommandCenter from "@/pages/agent-command-center";


import CustomPhotoshootLibrary from "@/pages/custom-photoshoot-library";
import FlatlayLibrary from "@/pages/flatlay-library";
import Maya from "@/pages/maya";
import Victoria from "@/pages/victoria";
import VictoriaChat from "@/pages/victoria-chat";

import VictoriaBuilder from '@/pages/victoria-builder';
import VictoriaPreview from '@/pages/victoria-preview';
import PhotoSelection from "@/pages/photo-selection";
import BrandOnboarding from "@/pages/brand-onboarding";
import Welcome from "@/pages/welcome";
import AuthSuccess from "@/pages/auth-success";
import Login from "@/pages/login";
// Unified login system - removed competing auth components
import LoginPrompt from "@/components/LoginPrompt";
import DomainHelp from "@/pages/domain-help";
import SwitchAccount from "@/pages/switch-account";
import LaunchCountdown from "@/pages/launch-countdown";
import AdminAccessOnly from "@/pages/admin-access-only";
import Build from "@/pages/build";

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
function ProtectedRoute({ component: Component, ...props }: { component: React.ComponentType<any>, [key: string]: any }) {
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
    <Switch>
      {/* STREAMLINED USER JOURNEY: Landing → Simple Checkout → Payment Success → Onboarding → Workspace */}

      {/* LAUNCH COUNTDOWN */}
      <Route path="/launch" component={LaunchCountdown} />
      
      {/* PUBLIC PAGES */}
      <Route path="/" component={EditorialLanding} />
      
      {/* UNIFIED AUTHENTICATION PAGE */}
      <Route path="/login" component={() => {
        const UnifiedLoginButton = React.lazy(() => import('@/components/UnifiedLoginButton'));
        return (
          <div className="min-h-screen flex items-center justify-center bg-white">
            <React.Suspense fallback={<div className="animate-spin w-8 h-8 border-4 border-black border-t-transparent rounded-full" />}>
              <UnifiedLoginButton text="Sign in to continue" showBrand={true} />
            </React.Suspense>
          </div>
        );
      }} />
      <Route path="/login-direct" component={() => {
        // Direct redirect to Replit Auth (for cases that need immediate redirect)
        React.useEffect(() => {
          window.location.href = '/api/login';
        }, []);
        
        return (
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin w-8 h-8 border-4 border-black border-t-transparent rounded-full mx-auto mb-4" />
              <p>Redirecting to login...</p>
            </div>
          </div>
        );
      }} />

      {/* DEVELOPMENT TEST PAGE */}
      <Route path="/test" component={() => (
        <div className="p-8">
          <h1 className="text-2xl mb-4">Navigation Test</h1>
          <p>If you can see this, navigation is working!</p>
          <div className="mt-4 space-y-2">
            <div><a href="/workspace" className="text-blue-600 underline">Go to Workspace</a></div>
            <div><a href="/victoria-preview" className="text-blue-600 underline">Go to Victoria Preview</a></div>
            <div><a href="/maya" className="text-blue-600 underline">Go to Maya</a></div>
          </div>
        </div>
      )} />
      <Route path="/old-landing" component={Landing} />
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

      {/* PAYMENT FLOW */}
      <Route path="/checkout" component={Checkout} />
      <Route path="/simple-checkout" component={SimpleCheckout} />
      <Route path="/welcome" component={Welcome} />
      <Route path="/thank-you" component={ThankYou} />
      <Route path="/payment-success" component={PaymentSuccess} />
      <Route path="/auth-success" component={AuthSuccess} />
      <Route path="/switch-account" component={SwitchAccount} />
      <Route path="/auth" component={() => {
        React.useEffect(() => { window.location.href = '/api/login'; }, []);
        return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin w-8 h-8 border-4 border-black border-t-transparent rounded-full" /></div>;
      }} />
      <Route path="/sign-in" component={() => {
        React.useEffect(() => { window.location.href = '/api/login'; }, []);
        return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin w-8 h-8 border-4 border-black border-t-transparent rounded-full" /></div>;
      }} />
      <Route path="/auth-custom" component={() => {
        React.useEffect(() => { window.location.href = '/api/login'; }, []);
        return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin w-8 h-8 border-4 border-black border-t-transparent rounded-full" /></div>;
      }} />

      {/* PROTECTED ROUTES */}
      <Route path="/workspace" component={(props) => <ProtectedRoute component={Workspace} {...props} />} />
      <Route path="/studio" component={(props) => <ProtectedRoute component={Workspace} {...props} />} />
      <Route path="/onboarding" component={(props) => <ProtectedRoute component={Onboarding} {...props} />} />
      
      {/* AI TRAINING & PHOTOSHOOT WORKFLOW */}
      <Route path="/ai-training" component={(props) => <ProtectedRoute component={SimpleTraining} {...props} />} />
      <Route path="/simple-training" component={(props) => <ProtectedRoute component={SimpleTraining} {...props} />} />

      <Route path="/ai-photoshoot" component={(props) => <ProtectedRoute component={AIPhotoshoot} {...props} />} />
      <Route path="/sandra-photoshoot" component={(props) => <ProtectedRoute component={SandraPhotoshoot} {...props} />} />
      <Route path="/custom-photoshoot-library" component={(props) => <ProtectedRoute component={CustomPhotoshootLibrary} {...props} />} />
      <Route path="/flatlay-library" component={(props) => <ProtectedRoute component={FlatlayLibrary} {...props} />} />
      <Route path="/flatlays" component={() => <Redirect to="/flatlay-library" />} />
      <Route path="/sandra-ai" component={(props) => <ProtectedRoute component={SandraAI} {...props} />} />
      <Route path="/ai-generator" component={(props) => <ProtectedRoute component={AIGenerator} {...props} />} />
      <Route path="/gallery" component={(props) => <ProtectedRoute component={SSELFIEGallery} {...props} />} />
      <Route path="/sselfie-gallery" component={(props) => <ProtectedRoute component={SSELFIEGallery} {...props} />} />
      <Route path="/profile" component={(props) => <ProtectedRoute component={Profile} {...props} />} />
      
      {/* AI AGENTS */}
      <Route path="/maya" component={(props) => <ProtectedRoute component={Maya} {...props} />} />
      <Route path="/victoria" component={(props) => <ProtectedRoute component={Victoria} {...props} />} />
      <Route path="/victoria-chat" component={(props) => <ProtectedRoute component={VictoriaChat} {...props} />} />
      <Route path="/photo-selection" component={(props) => <ProtectedRoute component={PhotoSelection} {...props} />} />
      <Route path="/brand-onboarding" component={(props) => <ProtectedRoute component={BrandOnboarding} {...props} />} />
      <Route path="/victoria-builder" component={(props) => <ProtectedRoute component={VictoriaBuilder} {...props} />} />
      <Route path="/victoria-preview" component={(props) => <ProtectedRoute component={VictoriaPreview} {...props} />} />
      <Route path="/build" component={(props) => <ProtectedRoute component={Build} {...props} />} />

      
      {/* SANDRA'S ADMIN DASHBOARD - LUXURY EDITORIAL DESIGN */}
      <Route path="/admin-dashboard" component={(props) => <ProtectedRoute component={AdminDashboard} {...props} />} />
      <Route path="/admin" component={(props) => <ProtectedRoute component={AdminDashboard} {...props} />} />
      <Route path="/admin/unified-agents" component={(props) => <ProtectedRoute component={() => (
        <div className="min-h-screen bg-gray-50">
          <div className="bg-white border-b">
            <div className="max-w-7xl mx-auto px-4 py-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900" style={{ fontFamily: 'Times New Roman, serif' }}>
                    Unified Agent Architecture
                  </h1>
                  <p className="text-gray-600 mt-1">
                    Real-time agent execution and monitoring system
                  </p>
                </div>
                <div className="text-sm text-gray-500">
                  SSELFIE Studio Admin
                </div>
              </div>
            </div>
          </div>
          <div className="max-w-7xl mx-auto px-4 py-8">
            <UnifiedAgentInterface />
          </div>
        </div>
      )} {...props} />} />
      <Route path="/admin/business-overview" component={(props) => <ProtectedRoute component={AdminBusinessOverview} {...props} />} />
      <Route path="/admin/consulting-agents" component={(props) => <ProtectedRoute component={AdminConsultingAgents} {...props} />} />
      <Route path="/admin/subscriber-import" component={(props) => <ProtectedRoute component={AdminSubscriberImport} {...props} />} />


      <Route path="/admin/bridge-monitor" component={(props) => <ProtectedRoute component={BridgeMonitor} {...props} />} />
      <Route path="/admin/agent-activity" component={(props) => <ProtectedRoute component={AgentActivityDashboard} {...props} />} />

      <Route path="/admin-access-only" component={AdminAccessOnly} />
      {/* Old admin routes archived - all functionality moved to main admin dashboard */}
      <Route path="/agent-approval" component={(props) => <ProtectedRoute component={AgentApproval} {...props} />} />
      <Route path="/admin/agent-approval" component={(props) => <ProtectedRoute component={AgentApproval} {...props} />} />
      <Route path="/agent-command" component={(props) => <ProtectedRoute component={AgentCommandCenter} {...props} />} />
      <Route path="/admin/agent-command" component={(props) => <ProtectedRoute component={AgentCommandCenter} {...props} />} />
      <Route path="/agent-dashboard" component={(props) => <ProtectedRoute component={AdminDashboard} {...props} />} />
      <Route path="/admin/agents" component={(props) => <ProtectedRoute component={AdminDashboard} {...props} />} />
      <Route path="/admin/progress" component={() => <div className="p-8">Admin Progress - Coming Soon</div>} />
      <Route path="/admin/roadmap" component={() => <div className="p-8">Admin Roadmap - Coming Soon</div>} />
      <Route path="/admin/ai-models" component={() => <div className="p-8">AI Models Management - Coming Soon</div>} />
      <Route path="/rachel-chat" component={(props) => <ProtectedRoute component={RachelChat} {...props} />} />
      <Route path="/rachel-activation" component={(props) => <ProtectedRoute component={RachelActivation} {...props} />} />
      
      {/* ADMIN MARKETING AUTOMATION */}
      <Route path="/marketing-automation" component={(props) => <ProtectedRoute component={lazy(() => import('@/pages/marketing-automation'))} {...props} />} />
      
      {/* DEBUGGING */}
      <Route path="/test" component={() => (
        <div className="p-8">
          <h1 className="text-2xl mb-4">Navigation Test</h1>
          <p>If you can see this, navigation is working!</p>
          <div className="mt-4 space-y-2">
            <div><a href="/workspace" className="text-blue-600 underline">Go to Workspace</a></div>
            <div><a href="/victoria-preview" className="text-blue-600 underline">Go to Victoria Preview</a></div>
            <div><a href="/maya" className="text-blue-600 underline">Go to Maya</a></div>
          </div>
        </div>
      )} />
      {/* Test routes removed - all test files archived */}
      <Route path="/debug-auth" component={() => {
        const { user, isAuthenticated, isLoading, error } = useAuth();
        return (
          <div className="p-8">
            <h1 className="text-2xl mb-4">Authentication Debug</h1>
            <div className="space-y-2">
              <p>isLoading: {isLoading.toString()}</p>
              <p>isAuthenticated: {isAuthenticated.toString()}</p>
              <p>error: {error?.message || 'none'}</p>
              <p>user: {user ? JSON.stringify(user, null, 2) : 'null'}</p>
              <p>hostname: {window.location.hostname}</p>
              <p>origin: {window.location.origin}</p>
              <div className="mt-4">
                <a href="/login" className="bg-blue-500 text-white px-4 py-2 rounded mr-2">Try Login</a>
                <a href="/workspace" 
                   className="bg-green-500 text-white px-4 py-2 rounded">
                  Go to Workspace
                </a>
              </div>
            </div>
          </div>
        );
      }} />

      <Route component={NotFound} />
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

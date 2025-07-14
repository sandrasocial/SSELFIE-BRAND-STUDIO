import React from "react";
import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
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
import TestLogin from "@/pages/test-login";
import AdminDashboard from "@/pages/admin";
import AdminUsers from "@/pages/admin-users";
import AdminEmails from "@/pages/admin-emails";
import AdminSettings from "@/pages/admin-settings";
import CustomPhotoshootLibrary from "@/pages/custom-photoshoot-library";
import FlatlayLibrary from "@/pages/flatlay-library";
import Maya from "@/pages/maya";
import Victoria from "@/pages/victoria";
import VictoriaChat from "@/pages/victoria-chat";
import { lazy, Suspense } from "react";
import VictoriaBuilder from '@/pages/victoria-builder';
import VictoriaPreview from '@/pages/victoria-preview';
import PhotoSelection from "@/pages/photo-selection";
import BrandOnboarding from "@/pages/brand-onboarding";
import Welcome from "@/pages/welcome";
import AuthSuccess from "@/pages/auth-success";
import Login from "@/pages/login";

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
  React.useEffect(() => {
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
    // Redirect to login for unauthenticated users
    window.location.href = '/api/login';
    return null;
  }
  
  return <Component {...props} />;
}

function Router() {
  return (
    <Switch>
      {/* STREAMLINED USER JOURNEY: Landing → Simple Checkout → Payment Success → Onboarding → Workspace */}

      {/* PUBLIC PAGES */}
      <Route path="/" component={EditorialLanding} />
      
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

      {/* PAYMENT FLOW */}
      <Route path="/checkout" component={Checkout} />
      <Route path="/simple-checkout" component={SimpleCheckout} />
      <Route path="/welcome" component={Welcome} />
      <Route path="/thank-you" component={ThankYou} />
      <Route path="/payment-success" component={PaymentSuccess} />
      <Route path="/auth-success" component={AuthSuccess} />
      <Route path="/login" component={Login} />

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
      
      {/* SANDRA'S ADMIN DASHBOARD */}
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/sandra-admin" component={AdminDashboard} />
      <Route path="/admin/users" component={AdminUsers} />
      <Route path="/admin/emails" component={AdminEmails} />
      <Route path="/admin/settings" component={AdminSettings} />
      <Route path="/admin/progress" component={() => <div className="p-8">Admin Progress - Coming Soon</div>} />
      <Route path="/admin/roadmap" component={() => <div className="p-8">Admin Roadmap - Coming Soon</div>} />
      <Route path="/admin/ai-models" component={() => <div className="p-8">AI Models Management - Coming Soon</div>} />
      <Route path="/rachel-chat" component={(props) => <ProtectedRoute component={RachelChat} {...props} />} />
      <Route path="/rachel-activation" component={(props) => <ProtectedRoute component={RachelActivation} {...props} />} />
      
      {/* ADMIN MARKETING AUTOMATION */}
      <Route path="/marketing-automation" component={(props) => <ProtectedRoute component={lazy(() => import('@/pages/marketing-automation'))} {...props} />} />
      
      {/* DEBUGGING */}
      <Route path="/test-login" component={TestLogin} />

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;

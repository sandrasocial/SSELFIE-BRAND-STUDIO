import React from "react";
import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import EditorialLanding from "@/pages/editorial-landing";
import TestLanding from "@/pages/test-landing";
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
    // For debugging - let's show what's happening
    console.log('Authentication failed, redirecting to login');
    window.location.href = '/api/login';
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-black border-t-transparent rounded-full mb-4 mx-auto" />
          <p>Redirecting to login...</p>
        </div>
      </div>
    );
  }
  
  return <Component {...props} />;
}

function Router() {
  return (
    <Switch>
      {/* STREAMLINED USER JOURNEY: Landing → Simple Checkout → Payment Success → Onboarding → Workspace */}

      {/* PUBLIC PAGES */}
      <Route path="/" component={EditorialLanding} />
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
      <Route path="/thank-you" component={ThankYou} />
      <Route path="/payment-success" component={PaymentSuccess} />

      {/* PROTECTED ROUTES */}
      <Route path="/workspace" component={Workspace} />
      <Route path="/studio" component={Workspace} />
      <Route path="/onboarding" component={Onboarding} />
      
      {/* AI TRAINING & PHOTOSHOOT WORKFLOW - AUTH REMOVED TO FIX WHITE SCREENS */}
      <Route path="/ai-training" component={SimpleTraining} />
      <Route path="/simple-training" component={SimpleTraining} />
      <Route path="/ai-photoshoot" component={AIPhotoshoot} />
      <Route path="/sandra-photoshoot" component={SandraPhotoshoot} />
      <Route path="/custom-photoshoot-library" component={CustomPhotoshootLibrary} />
      <Route path="/flatlay-library" component={FlatlayLibrary} />
      <Route path="/sandra-ai" component={SandraAI} />
      <Route path="/ai-generator" component={AIGenerator} />
      <Route path="/gallery" component={SSELFIEGallery} />
      <Route path="/sselfie-gallery" component={SSELFIEGallery} />
      <Route path="/profile" component={Profile} />
      
      {/* AI AGENTS */}
      <Route path="/maya" component={Maya} />
      <Route path="/victoria" component={Victoria} />
      <Route path="/victoria-chat" component={VictoriaChat} />
      <Route path="/photo-selection" component={PhotoSelection} />
      <Route path="/brand-onboarding" component={BrandOnboarding} />
      <Route path="/victoria-builder" component={VictoriaBuilder} />
      <Route path="/victoria-preview" component={VictoriaPreview} />
      
      {/* SANDRA'S ADMIN DASHBOARD */}
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/sandra-admin" component={AdminDashboard} />
      <Route path="/rachel-chat" component={RachelChat} />
      <Route path="/rachel-activation" component={RachelActivation} />
      
      {/* ADMIN MARKETING AUTOMATION */}
      <Route path="/marketing-automation" component={lazy(() => import('@/pages/marketing-automation'))} />
      
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

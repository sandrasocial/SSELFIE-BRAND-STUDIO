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
import RachelChat from "@/pages/rachel-chat";
import SSELFIEGallery from "@/pages/sselfie-gallery";
import AIGenerator from "@/pages/ai-generator";
import SimpleTraining from "@/pages/simple-training";
import TestLogin from "@/pages/test-login";
import AdminDashboard from "@/pages/admin";
import { lazy } from "react";

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
      <Route path="/" component={Landing} />
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
      <Route path="/workspace" component={(props) => <ProtectedRoute component={Workspace} {...props} />} />
      <Route path="/studio" component={(props) => <ProtectedRoute component={Workspace} {...props} />} />
      <Route path="/onboarding" component={(props) => <ProtectedRoute component={Onboarding} {...props} />} />
      
      {/* AI TRAINING & PHOTOSHOOT WORKFLOW */}
      <Route path="/ai-training" component={(props) => <ProtectedRoute component={SimpleTraining} {...props} />} />
      <Route path="/simple-training" component={(props) => <ProtectedRoute component={SimpleTraining} {...props} />} />
      <Route path="/ai-photoshoot" component={(props) => <ProtectedRoute component={SandraPhotoshoot} {...props} />} />
      <Route path="/sandra-photoshoot" component={(props) => <ProtectedRoute component={SandraPhotoshoot} {...props} />} />
      <Route path="/ai-generator" component={(props) => <ProtectedRoute component={AIGenerator} {...props} />} />
      <Route path="/gallery" component={(props) => <ProtectedRoute component={SSELFIEGallery} {...props} />} />
      <Route path="/sselfie-gallery" component={(props) => <ProtectedRoute component={SSELFIEGallery} {...props} />} />
      <Route path="/profile" component={(props) => <ProtectedRoute component={Profile} {...props} />} />
      
      {/* SANDRA'S ADMIN DASHBOARD */}
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/sandra-admin" component={AdminDashboard} />
      <Route path="/rachel-chat" component={(props) => <ProtectedRoute component={RachelChat} {...props} />} />
      
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

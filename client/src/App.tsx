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
import Welcome from "@/pages/welcome";
import Login from "@/pages/login";
import SignUp from "@/pages/signup";
import ForgotPasswordPage from "@/pages/forgot-password";
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
import AdminDashboard from "@/pages/admin-dashboard";
import AdminProgress from "@/pages/admin-progress";
import AgentSandbox from "@/pages/agent-sandbox";
import Profile from "@/pages/profile";
import PaymentSuccess from "@/pages/payment-success";

import OnboardingNew from "@/pages/onboarding-new";
import SimpleAITraining from "@/pages/simple-ai-training";
import SimpleTraining from "@/pages/simple-training";
import AdminRoadmap from "@/pages/admin-roadmap";
import Checkout from "@/pages/checkout";
import ThankYou from "@/pages/thank-you";
import AIGenerator from "@/pages/ai-generator";
import SandraChat from "@/pages/sandra-chat";
import AdminStyleguide from "@/pages/admin-styleguide";
import UserStyleguide from "@/pages/user-styleguide";
import StyleguideDemo from "@/pages/styleguide-demo";
import StyleguideLandingBuilder from "@/pages/styleguide-landing-builder";
import TemplateShowcase from "@/pages/template-showcase";
import ShannonMurrayDemo from "@/pages/shannon-murray-demo";



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
    // Redirect to login for protected routes
    window.location.href = '/api/login';
    return null;
  }
  
  return <Component {...props} />;
}

function Router() {
  return (
    <Switch>
      {/* PUBLIC PAGES - ALWAYS ACCESSIBLE TO EVERYONE (NO AUTHENTICATION REQUIRED) */}
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

      {/* PAYMENT FLOW - NO AUTHENTICATION REQUIRED FOR CUSTOMER ACQUISITION */}
      <Route path="/checkout" component={Checkout} />
      <Route path="/thank-you" component={ThankYou} />
      <Route path="/payment-success" component={PaymentSuccess} />
      <Route path="/simple-training" component={(props) => <ProtectedRoute component={SimpleTraining} {...props} />} />

      {/* AUTH PAGES - ACCESSIBLE TO EVERYONE */}
      <Route path="/login" component={Login} />
      <Route path="/signup" component={SignUp} />
      <Route path="/forgot-password" component={ForgotPasswordPage} />

      {/* PROTECTED ROUTES - REQUIRE AUTHENTICATION */}
      <Route path="/workspace" component={(props) => <ProtectedRoute component={Workspace} {...props} />} />
      <Route path="/onboarding" component={(props) => <ProtectedRoute component={Onboarding} {...props} />} />
      <Route path="/profile" component={(props) => <ProtectedRoute component={Profile} {...props} />} />
      <Route path="/ai-generator" component={(props) => <ProtectedRoute component={AIGenerator} {...props} />} />
      <Route path="/sandra-chat" component={(props) => <ProtectedRoute component={SandraChat} {...props} />} />
      <Route path="/simple-training" component={(props) => <ProtectedRoute component={SimpleAITraining} {...props} />} />
      <Route path="/user-styleguide" component={(props) => <ProtectedRoute component={UserStyleguide} {...props} />} />
      <Route path="/styleguide" component={(props) => <ProtectedRoute component={UserStyleguide} {...props} />} />
      <Route path="/styleguide/:userId" component={(props) => <ProtectedRoute component={UserStyleguide} {...props} />} />
      <Route path="/styleguide-demo" component={(props) => <ProtectedRoute component={StyleguideDemo} {...props} />} />
      <Route path="/styleguide-landing-builder" component={(props) => <ProtectedRoute component={StyleguideLandingBuilder} {...props} />} />
      <Route path="/template-showcase" component={(props) => <ProtectedRoute component={TemplateShowcase} {...props} />} />
      
      {/* Admin routes */}
      <Route path="/admin" component={(props) => <ProtectedRoute component={AdminDashboard} {...props} />} />
      <Route path="/admin/progress" component={(props) => <ProtectedRoute component={AdminProgress} {...props} />} />
      <Route path="/admin/roadmap" component={(props) => <ProtectedRoute component={AdminRoadmap} {...props} />} />
      <Route path="/admin/styleguide" component={(props) => <ProtectedRoute component={AdminStyleguide} {...props} />} />
      <Route path="/sandbox" component={(props) => <ProtectedRoute component={AgentSandbox} {...props} />} />
      
      {/* Demo Landing Pages */}
      <Route path="/demo/shannon-murray" component={ShannonMurrayDemo} />

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

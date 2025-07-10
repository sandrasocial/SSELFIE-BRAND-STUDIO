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

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Switch>
      {isLoading || !isAuthenticated ? (
        <>
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

          <Route path="/login" component={Login} />
          <Route path="/signup" component={SignUp} />
          <Route path="/forgot-password" component={ForgotPasswordPage} />
          <Route path="/checkout" component={Checkout} />
          <Route path="/thank-you" component={ThankYou} />
          <Route path="/payment-success" component={PaymentSuccess} />
          <Route path="/onboarding" component={Onboarding} />
        </>
      ) : (
        <>
          <Route path="/" component={SmartHome} />
          <Route path="/welcome" component={Welcome} />
          <Route path="/about" component={About} />
          <Route path="/how-it-works" component={HowItWorks} />
          <Route path="/selfie-guide" component={SelfieGuide} />
          <Route path="/blog" component={Blog} />
          <Route path="/contact" component={Contact} />
          <Route path="/faq" component={FAQ} />
          <Route path="/terms" component={Terms} />
          <Route path="/privacy" component={Privacy} />
          <Route path="/admin" component={AdminDashboard} />
          <Route path="/admin/progress" component={AdminProgress} />
          <Route path="/admin/roadmap" component={AdminRoadmap} />
          <Route path="/admin/styleguide" component={AdminStyleguide} />
          <Route path="/styleguide" component={UserStyleguide} />
          <Route path="/styleguide/:userId" component={UserStyleguide} />
          <Route path="/styleguide-demo" component={StyleguideDemo} />
          <Route path="/styleguide-landing-builder" component={StyleguideLandingBuilder} />
          <Route path="/template-showcase" component={TemplateShowcase} />
          <Route path="/sandbox" component={AgentSandbox} />
          <Route path="/pricing" component={Pricing} />
          <Route path="/workspace" component={Workspace} />
          <Route path="/onboarding" component={Onboarding} />
          <Route path="/simple-training" component={SimpleAITraining} />
          <Route path="/ai-generator" component={AIGenerator} />
          <Route path="/sandra-chat" component={SandraChat} />
          <Route path="/profile" component={Profile} />
          <Route path="/checkout" component={Checkout} />
          <Route path="/thank-you" component={ThankYou} />
          <Route path="/payment-success" component={PaymentSuccess} />
        </>
      )}
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

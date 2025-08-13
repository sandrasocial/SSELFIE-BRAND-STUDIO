import { Route, Switch } from "wouter";
import { lazy, Suspense } from 'react';

// Lazy load public components
const EditorialLanding = lazy(() => import('../pages/editorial-landing'));
const Pricing = lazy(() => import('../pages/pricing'));
const About = lazy(() => import('../pages/about'));
const HowItWorks = lazy(() => import('../pages/how-it-works'));
const SelfieGuide = lazy(() => import('../pages/selfie-guide'));
const Blog = lazy(() => import('../pages/blog'));
const Contact = lazy(() => import('../pages/contact'));
const FAQ = lazy(() => import('../pages/faq'));
const Terms = lazy(() => import('../pages/terms'));
const Privacy = lazy(() => import('../pages/privacy'));
const DomainHelp = lazy(() => import('../pages/domain-help'));
const LaunchCountdown = lazy(() => import('../pages/launch-countdown'));

// Import non-lazy components for critical auth flow
import UnifiedLoginButton from '../components/UnifiedLoginButton';

// Loading component
function LoadingSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin w-8 h-8 border-4 border-black border-t-transparent rounded-full" />
    </div>
  );
}

export default function PublicRoutes() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Switch>
        {/* CORE PUBLIC PAGES */}
        <Route path="/" component={EditorialLanding} />
        <Route path="/pricing" component={Pricing} />
        <Route path="/about" component={About} />
        <Route path="/how-it-works" component={HowItWorks} />
        <Route path="/selfie-guide" component={SelfieGuide} />
        <Route path="/blog" component={Blog} />
        <Route path="/contact" component={Contact} />
        <Route path="/faq" component={FAQ} />
        <Route path="/terms" component={Terms} />
        <Route path="/privacy" component={Privacy} />
        <Route path="/domain-help" component={DomainHelp} />
        
        {/* LAUNCH COUNTDOWN */}
        <Route path="/launch" component={LaunchCountdown} />
        
        {/* UNIFIED AUTHENTICATION - SINGLE LOGIN ROUTE */}
        <Route path="/login" component={() => (
          <div className="min-h-screen flex items-center justify-center bg-white">
            <UnifiedLoginButton text="Sign in to continue" showBrand={true} />
          </div>
        )} />
      </Switch>
    </Suspense>
  );
}
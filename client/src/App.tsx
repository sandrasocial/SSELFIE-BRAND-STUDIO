/* eslint-disable no-console */
import React from 'react';
import { Route, Router } from "wouter";

// Global type declarations for browser APIs
declare global {
  interface Window {
    URLSearchParams: typeof URLSearchParams;
  }
  var URLSearchParams: typeof URLSearchParams;
}

// Luxury Mobile Styling
import "./styles/luxury-mobile.css";

// Core pages (loaded immediately) - PAID AUTHENTICATED USERS ONLY
import SselfieAppLayout from "./app_v2/SselfieAppLayout.js";

// Lazy load non-critical pages for better performance
import { lazy, Suspense } from "react";

// Auth components (Lazy loaded for better performance)
const SignInHandler = lazy(() => import("./pages/handler/sign-in.js"));

// Business landing page
const BusinessLanding = lazy(() => import("./pages/landing/business-landing.js"));

// Components
import { PageLoader } from "./components/PageLoader.js";

// Import the existing useAuth hook
import { useAuth } from "./hooks/use-auth.js";

// Loading Screen Component
const LoadingScreen: React.FC = () => (
  <div className="h-screen bg-stone-50 flex items-center justify-center relative overflow-hidden">
    <div className="absolute inset-0 bg-gradient-to-br from-stone-50 via-stone-100 to-stone-50"></div>
    <div className="relative z-10 text-center px-8">
      <div className="w-16 h-16 border border-stone-300 rounded-full animate-spin mx-auto mb-12 flex items-center justify-center">
        <div className="w-2 h-2 bg-stone-600 rounded-full"></div>
      </div>
      <h1 className="text-stone-950 text-4xl font-serif font-extralight tracking-[0.4em] mb-4 leading-none">SSELFIE</h1>
      <p className="text-xs font-light tracking-[0.3em] uppercase text-stone-500">Creating Excellence</p>
    </div>
  </div>
);

// Main App Component
const App: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  // Show loading screen while authentication is loading
  if (isLoading) {
    return <LoadingScreen />;
  }

  // If not authenticated, show sign-in page
  if (!isAuthenticated) {
    return (
      <Suspense fallback={<PageLoader />}>
        <SignInHandler />
      </Suspense>
    );
  }

  // If authenticated, show the main app with routing
  return (
    <Router>
      <div>
        {/* Business landing page (public route, but authenticated users can still access) */}
        <Route path="/" component={() => (
          <Suspense fallback={<PageLoader />}>
            <BusinessLanding />
          </Suspense>
        )} />

        {/* Main authenticated app */}
        <Route path="/app" component={() => (
          <Suspense fallback={<PageLoader />}>
            <SselfieAppLayout />
          </Suspense>
        )} />

        {/* Catch-all route - redirect to app for authenticated users */}
        <Route path="/:rest*" component={() => {
          window.location.href = '/app';
          return <PageLoader />;
        }} />
      </div>
    </Router>
  );
};

export default App;
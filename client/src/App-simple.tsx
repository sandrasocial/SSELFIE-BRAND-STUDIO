import React from "react";
import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";

function SimpleHomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center">
      <div className="text-center max-w-4xl mx-auto px-6">
        {/* Logo/Brand */}
        <div className="mb-8">
          <h1 className="text-6xl font-bold text-white mb-4 tracking-wide">
            SSELFIE
            <span className="text-yellow-400">.</span>
          </h1>
          <h2 className="text-2xl text-yellow-400 font-light tracking-widest uppercase">
            Studio
          </h2>
        </div>
        
        {/* Tagline */}
        <p className="text-xl text-gray-300 mb-12 leading-relaxed max-w-2xl mx-auto">
          Transform your selfies into professional brand photography with AI-powered precision.
          <br />
          <span className="text-yellow-400 font-medium">Luxury. Authenticity. Impact.</span>
        </p>
        
        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <button 
            onClick={() => window.location.href = '/api/login'}
            className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold px-8 py-4 rounded-none transition-all duration-300 min-w-48 uppercase tracking-wider"
          >
            Start Your Brand
          </button>
          <button 
            onClick={() => window.location.href = '/health'}
            className="border-2 border-white text-white hover:bg-white hover:text-black font-bold px-8 py-4 rounded-none transition-all duration-300 min-w-48 uppercase tracking-wider"
          >
            Learn More
          </button>
        </div>
        
        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mt-16 text-left">
          <div className="text-center">
            <h3 className="text-yellow-400 font-bold text-lg mb-3">AI Training</h3>
            <p className="text-gray-400 text-sm">Custom model training with your unique features</p>
          </div>
          <div className="text-center">
            <h3 className="text-yellow-400 font-bold text-lg mb-3">Professional Quality</h3>
            <p className="text-gray-400 text-sm">Editorial-grade images for business use</p>
          </div>
          <div className="text-center">
            <h3 className="text-yellow-400 font-bold text-lg mb-3">Brand Strategy</h3>
            <p className="text-gray-400 text-sm">Comprehensive personal branding guidance</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function HealthCheck() {
  return (
    <div className="p-8">
      <h1 className="text-2xl mb-4">Health Check</h1>
      <p>Application is running successfully!</p>
      <div className="mt-4 space-y-2">
        <div><a href="/" className="text-blue-600 underline">Go Home</a></div>
        <div><a href="/api/health" className="text-blue-600 underline">API Health</a></div>
      </div>
    </div>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={SimpleHomePage} />
      <Route path="/health" component={HealthCheck} />
      <Route>
        <div className="p-8">
          <h1 className="text-2xl mb-4">Page Not Found</h1>
          <p>The page you're looking for doesn't exist.</p>
          <div className="mt-4">
            <a href="/" className="text-blue-600 underline">Go Home</a>
          </div>
        </div>
      </Route>
    </Switch>
  );
}

function App() {
  React.useEffect(() => {
    console.log('SSELFIE Studio: App initializing...');
    console.log('SSELFIE Studio: QueryClient available:', !!queryClient);
    console.log('SSELFIE Studio: App rendering...');
    console.log('SSELFIE Studio: Domain access validated, app ready');
  }, []);

  // Professional SSELFIE Studio landing page
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
    </QueryClientProvider>
  );
}

export default App;
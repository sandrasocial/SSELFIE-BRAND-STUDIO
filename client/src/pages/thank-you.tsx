import { useEffect } from "react";
import { useLocation } from "wouter";

export default function ThankYou() {
  const [, setLocation] = useLocation();

  useEffect(() => {
    // Auto-redirect to onboarding after 5 seconds
    const timer = setTimeout(() => {
      setLocation('/onboarding');
    }, 5000);

    return () => clearTimeout(timer);
  }, [setLocation]);

  const plan = localStorage.getItem('userPlan') || 'sselfie-studio';
  const isPro = plan === 'sselfie-studio-pro';

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="max-w-4xl mx-auto px-8 text-center">
        {/* Success Icon */}
        <div className="w-20 h-20 border-2 border-white rounded-full flex items-center justify-center mx-auto mb-12">
          <div className="w-8 h-8 border-b-2 border-r-2 border-white transform rotate-45 translate-x-1"></div>
        </div>

        <h1 className="font-serif text-4xl md:text-6xl font-light mb-8 leading-tight">
          Welcome to SSELFIE Studio{isPro ? ' PRO' : ''}
        </h1>

        <p className="text-xl mb-12 opacity-80 max-w-2xl mx-auto leading-relaxed">
          Your payment was successful! You're about to build something incredible. 
          Let's get your personal brand started.
        </p>

        <div className="space-y-6 mb-16">
          <div className="text-sm uppercase tracking-[0.3em] opacity-60">
            What happens next:
          </div>
          
          <div className="space-y-4 max-w-md mx-auto text-left">
            <div className="flex items-start">
              <span className="text-white mr-4 mt-1">1.</span>
              <span>Complete your brand onboarding (5 minutes)</span>
            </div>
            <div className="flex items-start">
              <span className="text-white mr-4 mt-1">2.</span>
              <span>Upload your selfies for AI training</span>
            </div>
            <div className="flex items-start">
              <span className="text-white mr-4 mt-1">3.</span>
              <span>Generate your first professional photos</span>
            </div>
            {isPro && (
              <div className="flex items-start">
                <span className="text-white mr-4 mt-1">4.</span>
                <span>Meet Sandra, your personal brand AI mentor</span>
              </div>
            )}
          </div>
        </div>

        <button
          onClick={() => setLocation('/onboarding')}
          className="inline-block px-12 py-4 border-2 border-white text-white text-sm uppercase tracking-[0.3em] hover:bg-white hover:text-black transition-all duration-300"
        >
          Start Building Your Brand
        </button>

        <div className="mt-12 text-sm opacity-60">
          You'll be redirected automatically in a few seconds...
        </div>

        {isPro && (
          <div className="mt-16 p-8 border border-white/20 bg-white/5">
            <h3 className="font-serif text-2xl mb-4">PRO Member Benefits</h3>
            <p className="text-sm opacity-80 leading-relaxed">
              As a PRO member, you get access to Sandra AI - your personal brand mentor who learns 
              your story, remembers your goals, and creates custom strategies just for you. 
              She'll be waiting for you in your workspace!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
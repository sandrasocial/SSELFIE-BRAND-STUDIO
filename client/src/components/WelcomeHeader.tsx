import React from 'react';
import { useAuth } from '../hooks/use-auth.js';
import { Sparkles } from 'lucide-react';

export function WelcomeHeader() {
  const { user } = useAuth();
  
  // Get time-based greeting using user's local time
  const getGreeting = () => {
    const now = new Date();
    const hour = now.getHours();
    
    // More specific time ranges for better greeting accuracy
    if (hour >= 5 && hour < 12) {
      return 'Good Morning';
    } else if (hour >= 12 && hour < 17) {
      return 'Good Afternoon';  
    } else if (hour >= 17 && hour < 22) {
      return 'Good Evening';
    } else {
      // Late night/very early morning - use neutral greeting
      return 'Welcome';
    }
  };

  // Calculate remaining generations
  const monthlyGenerationLimit = user?.monthlyGenerationLimit ?? 100;
  const generationsUsedThisMonth = user?.generationsUsedThisMonth ?? 0;
  const generationsRemaining = monthlyGenerationLimit === -1 ? '∞' : monthlyGenerationLimit - generationsUsedThisMonth;

  // Maya's tip (TODO: Make this dynamic from backend)
  const mayaTip = "Try a 'Golden Hour' concept for a warmer, more approachable feel.";

  return (
    <div className="relative overflow-hidden rounded-3xl mb-8">
      {/* Background Image - You'll provide this */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-stone-100 via-stone-50 to-stone-100"></div>
        {/* Optional: Add background image here when provided */}
        {/* <img src="/path/to/hero-image.jpg" className="w-full h-full object-cover opacity-30" alt="" /> */}
      </div>

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-stone-50/50 to-stone-50"></div>

      {/* Content */}
      <div className="relative z-10 px-6 sm:px-8 py-12 sm:py-16">
        {/* Main Greeting */}
        <div className="mb-8">
          <h1 className="text-4xl sm:text-5xl font-serif font-extralight tracking-[0.3em] text-stone-950 uppercase leading-tight mb-4">
            {getGreeting()}
          </h1>
          <p className="text-xl sm:text-2xl font-serif font-extralight tracking-[0.2em] text-stone-950 uppercase">
            {user?.firstName || 'Creator'}
          </p>
          <p className="text-sm font-light tracking-[0.15em] text-stone-600 mt-3">
            Ready to create something beautiful?
          </p>
        </div>

        {/* Stats & Tips Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Generations Remaining */}
          <div className="bg-stone-100/60 backdrop-blur-sm border border-stone-200/40 rounded-2xl p-5">
            <div className="text-xs tracking-[0.15em] uppercase font-light mb-2 text-stone-500">
              Available
            </div>
            <div className="text-3xl font-serif font-extralight text-stone-950 mb-1">
              {generationsRemaining}
            </div>
            <div className="text-xs font-light text-stone-600">
              {monthlyGenerationLimit === -1 ? 'Unlimited photos' : 'Photos this month'}
            </div>
          </div>

          {/* Maya's Tip */}
          <div className="bg-stone-100/60 backdrop-blur-sm border border-stone-200/40 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 rounded-full bg-stone-500/10 flex items-center justify-center">
                <Sparkles size={12} className="text-stone-600" strokeWidth={1.5} />
              </div>
              <div className="text-xs tracking-[0.15em] uppercase font-light text-stone-500">
                Maya's Tip
              </div>
            </div>
            <p className="text-sm font-light leading-relaxed text-stone-950">
              {mayaTip}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

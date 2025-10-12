import React from 'react';
import { useAuth } from '../hooks/use-auth.js';
import { Sparkles, Zap } from 'lucide-react';
import RecentImagesPreview from './RecentImagesPreview.js';

// Props are optional for backwards compatibility
interface WelcomeHeaderProps {
  firstName?: string;
  hasModel?: boolean;
  onTabChange?: (tabId: string) => void;
}

// Default export to match original AND support both with/without props
export function WelcomeHeader(props?: WelcomeHeaderProps) {
  const { user } = useAuth();
  
  // Extract props with defaults (works whether props passed or not)
  const firstName = props?.firstName;
  const hasModel = props?.hasModel ?? false;
  const onTabChange = props?.onTabChange;
  
  // Use prop firstName if provided, otherwise fall back to user.firstName
  const displayName = firstName || user?.firstName || 'Creator';
  
  // Get time-based greeting using user's local time
  const getGreeting = () => {
    const now = new Date();
    const hour = now.getHours();
    
    if (hour >= 5 && hour < 12) {
      return 'Good Morning';
    } else if (hour >= 12 && hour < 17) {
      return 'Good Afternoon';  
    } else if (hour >= 17 && hour < 22) {
      return 'Good Evening';
    } else {
      return 'Welcome';
    }
  };

  // Calculate remaining generations
  const monthlyGenerationLimit = user?.monthlyGenerationLimit ?? 100;
  const generationsUsedThisMonth = user?.generationsUsedThisMonth ?? 0;
  const generationsRemaining = monthlyGenerationLimit === -1 
    ? '∞' 
    : Math.max(0, monthlyGenerationLimit - generationsUsedThisMonth);

  // Dynamic message based on model status
  const getStatusMessage = () => {
    if (generationsRemaining === 0) {
      return "You've reached your monthly generation limit";
    }
    
    return "Ready to create something beautiful?";
  };

  return (
    <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl mb-6 sm:mb-8">
      {/* Background Gradient */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-stone-100 via-stone-50 to-stone-100"></div>
      </div>

      {/* Decorative Pattern Overlay */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 right-0 w-64 h-64 bg-stone-900 rounded-full blur-3xl transform translate-x-32 -translate-y-32"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-stone-900 rounded-full blur-3xl transform -translate-x-32 translate-y-32"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 px-5 sm:px-8 py-10 sm:py-14">
        {/* Greeting Section */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-stone-600" strokeWidth={1.5} />
            <span className="text-xs tracking-[0.2em] uppercase font-light text-stone-500">
              {hasModel ? 'Studio Ready' : 'Getting Started'}
            </span>
          </div>
          
          <h1 className="text-3xl sm:text-5xl font-serif font-extralight tracking-[0.3em] text-stone-950 uppercase leading-tight mb-3 sm:mb-4">
            {getGreeting()}
          </h1>
          
          <p className="text-xl sm:text-2xl font-serif font-extralight tracking-[0.2em] text-stone-950 uppercase mb-3 sm:mb-4">
            {displayName}
          </p>
          
          <p className="text-sm font-light tracking-[0.1em] text-stone-600 max-w-md">
            {getStatusMessage()}
          </p>
        </div>

        {/* Stats & Tip Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          {/* Generations Remaining Card */}
          <div className="bg-stone-200/40 backdrop-blur-sm border border-stone-300/50 rounded-xl sm:rounded-2xl p-4 sm:p-5">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-stone-500/10 rounded-lg border border-stone-400/20">
                  <Zap className="w-4 h-4 text-stone-600" strokeWidth={1.5} />
                </div>
                <span className="text-xs tracking-[0.15em] uppercase font-light text-stone-500">
                  Remaining
                </span>
              </div>
              <span className="text-2xl sm:text-3xl font-serif font-extralight text-stone-950">
                {generationsRemaining}
              </span>
            </div>
            <p className="text-xs font-light text-stone-600">
              {monthlyGenerationLimit === -1 ? 'Unlimited generations' : 'This month'}
            </p>
          </div>

          {/* Recent Images Preview */}
          <RecentImagesPreview onTabChange={onTabChange} />
        </div>
      </div>
    </div>
  );
}
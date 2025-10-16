import React, { useState } from 'react';
import { cn } from "../../lib/utils.js";
import { LuxuryButton } from "./luxury-button.js";
import { Typography } from "./typography.js";
import { LuxuryLoading } from "./luxury-loading-fixed.js";

interface PremiumTier {
  id: string;
  name: string;
  description: string;
  price: number;
  features: string[];
  exclusive?: boolean;
  popular?: boolean;
}

interface PremiumUpgradeFlowProps {
  currentTier?: string;
  onUpgrade?: (tierId: string) => Promise<void>;
  onClose?: () => void;
  className?: string;
}

const premiumTiers: PremiumTier[] = [
  {
    id: 'premium',
    name: 'Premium Access',
    description: 'Unlock exclusive features and priority support',
    price: 29,
    features: [
      'Unlimited image generations',
      'Priority processing queue',
      'Advanced styling options',
      'Custom model training',
      'Premium support'
    ],
    popular: true
  },
  {
    id: 'luxury',
    name: 'Luxury Experience', 
    description: 'The ultimate SSELFIE experience with VIP treatment',
    price: 99,
    features: [
      'Everything in Premium',
      'Personal style consultant',
      'Custom photo shoots',
      'Exclusive model access',
      'White-glove onboarding',
      'Direct line to Sandra\'s team'
    ],
    exclusive: true
  }
];

export function PremiumUpgradeFlow({
  currentTier, 
  onUpgrade, 
  onClose, 
  className = ''
}: PremiumUpgradeFlowProps) {
  const [selectedTier, setSelectedTier] = useState<string>('premium');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'selection' | 'invitation' | 'processing'>('selection');

  const handleUpgrade = async () => {
    if (!onUpgrade) return;
    
    setLoading(true);
    setStep('processing');
    
    try {
      await onUpgrade(selectedTier);
    } catch (error) {
      console.error('Upgrade failed:', error);
      setStep('selection');
    } finally {
      setLoading(false);
    }
  };

  const selectedTierData = premiumTiers.find(tier => tier.id === selectedTier);

  return (
    <div className={cn(
      "fixed inset-0 bg-black/90 backdrop-blur-editorial flex items-center justify-center z-50 p-luxury-sm",
      "animate-luxury-fade-in",
      className
    )}>
      <div className="bg-white dark:bg-neutral-900 rounded-editorial-xl shadow-luxury-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="relative p-luxury-lg bg-gradient-to-r from-neutral-900 to-neutral-800 text-white rounded-t-editorial-xl">
          <button
            onClick={onClose}
            className="absolute top-luxury-sm right-luxury-sm p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          
          <div className="text-center animate-luxury-fade-up">
            <Typography variant="luxury-eyebrow" className="text-neutral-300 mb-luxury-xs">
              Exclusive Invitation
            </Typography>
            <Typography variant="luxury-title" className="text-white mb-luxury-sm">
              Join Sandra's Inner Circle
            </Typography>
            <Typography variant="luxury-subtitle" className="text-neutral-200 max-w-2xl mx-auto">
              Elevate your style with premium access to SSELFIE's most exclusive features
            </Typography>
          </div>
        </div>

        {step === 'selection' && (
          <div className="p-luxury-lg">
            {/* Tier Selection */}
            <div className="grid md:grid-cols-2 gap-luxury-md mb-luxury-xl">
              {premiumTiers.map((tier, index) => (
                <div
                  key={tier.id}
                  className={cn(
                    "relative p-luxury-md rounded-editorial-lg border-2 cursor-pointer transition-all duration-300",
                    "hover:shadow-luxury hover:scale-[1.02]",
                    selectedTier === tier.id 
                      ? "border-neutral-900 bg-neutral-50 dark:bg-neutral-800 shadow-luxury" 
                      : "border-neutral-200 dark:border-neutral-700 hover:border-neutral-300",
                    "animate-luxury-fade-up"
                  )}
                  style={{ animationDelay: `${index * 0.1}s` }}
                  onClick={() => setSelectedTier(tier.id)}
                >
                  {tier.popular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <span className="bg-neutral-900 text-white px-luxury-xs py-1 rounded-full text-xs font-light tracking-wide uppercase">
                        Most Popular
                      </span>
                    </div>
                  )}
                  
                  {tier.exclusive && (
                    <div className="absolute -top-3 right-luxury-sm">
                      <span className="bg-gradient-to-r from-amber-400 to-amber-600 text-black px-luxury-xs py-1 rounded-full text-xs font-medium tracking-wide uppercase">
                        Exclusive
                      </span>
                    </div>
                  )}

                  <div className="text-center mb-luxury-sm">
                    <Typography variant="h3" className="mb-2">
                      {tier.name}
                    </Typography>
                    <Typography variant="luxury-body" className="text-neutral-600 dark:text-neutral-400 mb-luxury-sm">
                      {tier.description}
                    </Typography>
                    <div className="flex items-baseline justify-center">
                      <span className="text-4xl font-light font-serif">${tier.price}</span>
                      <span className="text-neutral-500 ml-2">/month</span>
                    </div>
                  </div>

                  <ul className="space-y-3">
                    {tier.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start">
                        <svg className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        <Typography variant="small" className="font-light">
                          {feature}
                        </Typography>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {/* CTA Section */}
            <div className="text-center bg-neutral-50 dark:bg-neutral-800 rounded-editorial-lg p-luxury-lg animate-luxury-fade-up">
              <Typography variant="h4" className="mb-luxury-sm">
                Ready to elevate your style?
              </Typography>
              <Typography variant="luxury-body" className="text-neutral-600 dark:text-neutral-400 mb-luxury-md max-w-2xl mx-auto">
                Join thousands of style enthusiasts who have unlocked their full potential with {selectedTierData?.name}.
              </Typography>
              
              <div className="flex flex-col sm:flex-row gap-luxury-xs justify-center items-center">
                <LuxuryButton
                  variant="luxury"
                  size="lg"
                  onClick={() => setStep('invitation')}
                  className="w-full sm:w-auto"
                  shimmer
                >
                  Continue to Exclusive Access
                </LuxuryButton>
                
                <LuxuryButton
                  variant="ghost"
                  size="lg"
                  onClick={onClose}
                  className="w-full sm:w-auto"
                >
                  Maybe Later
                </LuxuryButton>
              </div>
            </div>
          </div>
        )}

        {step === 'invitation' && selectedTierData && (
          <div className="p-luxury-lg text-center animate-luxury-fade-up">
            <div className="max-w-2xl mx-auto">
              <Typography variant="luxury-eyebrow" className="text-neutral-500 mb-luxury-sm">
                You're Invited
              </Typography>
              
              <Typography variant="luxury-title" className="mb-luxury-md">
                Welcome to {selectedTierData.name}
              </Typography>
              
              <Typography variant="luxury-body" className="text-neutral-600 dark:text-neutral-400 mb-luxury-lg">
                You're about to join an exclusive community of style innovators. 
                Your {selectedTierData.name} membership includes VIP access to Sandra's personal styling techniques and cutting-edge AI fashion technology.
              </Typography>

              <div className="bg-gradient-to-r from-neutral-900 to-neutral-800 text-white rounded-editorial-lg p-luxury-md mb-luxury-lg">
                <Typography variant="h4" className="text-white mb-luxury-sm">
                  What happens next?
                </Typography>
                <div className="space-y-luxury-xs text-left">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center mr-4 font-light">1</div>
                    <Typography variant="luxury-body" className="text-neutral-200">
                      Secure payment processing with luxury-grade security
                    </Typography>
                  </div>
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center mr-4 font-light">2</div>
                    <Typography variant="luxury-body" className="text-neutral-200">
                      Immediate access to all {selectedTierData.name} features
                    </Typography>
                  </div>
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center mr-4 font-light">3</div>
                    <Typography variant="luxury-body" className="text-neutral-200">
                      Personal welcome from Sandra's team
                    </Typography>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-luxury-sm justify-center">
                <LuxuryButton
                  variant="luxury"
                  size="lg"
                  onClick={handleUpgrade}
                  className="w-full sm:w-auto"
                  shimmer
                >
                  Begin My Luxury Journey - ${selectedTierData.price}/mo
                </LuxuryButton>
                
                <LuxuryButton
                  variant="secondary"
                  size="lg"
                  onClick={() => setStep('selection')}
                  className="w-full sm:w-auto"
                >
                  Back to Plans
                </LuxuryButton>
              </div>
            </div>
          </div>
        )}

        {step === 'processing' && (
          <div className="p-luxury-xl text-center animate-luxury-fade-up">
            <LuxuryLoading variant="spinner" size="xl" className="mx-auto mb-luxury-md" />
            <Typography variant="luxury-title" className="mb-luxury-sm">
              Preparing Your Luxury Experience
            </Typography>
            <Typography variant="luxury-body" className="text-neutral-600 dark:text-neutral-400">
              We're setting up your exclusive access to {selectedTierData?.name}...
            </Typography>
          </div>
        )}
      </div>
    </div>
  );
};
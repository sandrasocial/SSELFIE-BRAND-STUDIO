import React, { useEffect } from 'react';
import { PreLoginNavigationUnified } from '../components/pre-login-navigation-unified';
import { HeroFullBleed } from '../components/HeroFullBleed';
import { SandraImages } from '../lib/sandra-images';
import { useAuth } from '../hooks/use-auth';
import { Link, useLocation } from 'wouter';
import { useToast } from '../hooks/use-toast';
import { apiRequest } from '../lib/queryClient';

export default function PaymentSuccess() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  useEffect(() => {
    // Get plan from URL params
    const urlParams = new URLSearchParams(window.location.search);
    const plan = urlParams.get('plan');
    
    // If user is authenticated and we have a plan, trigger upgrade immediately
    if (isAuthenticated && user && plan) {
      triggerUserUpgrade(plan);
    } else {
      // Show success message and store plan for later
      toast({
        title: "Payment Successful!",
        description: "Welcome to SSELFIE Studio! Please sign in to access your account.",
      });

      // Store the plan for after authentication
      if (plan) {
        localStorage.setItem('userPlan', plan);
      }
    }
  }, [toast, isAuthenticated, user]);

  // Trigger upgrade automation after successful payment
  const triggerUserUpgrade = async (plan: string) => {
    try {
      // Method 1: Try with authenticated user data
      if (user?.email) {
        const upgradeResponse = await fetch('/api/upgrade-user', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: user.email,
            plan: plan === 'ai-pack' ? 'sselfie-studio' : 'sselfie-studio'
          })
        });

        if (upgradeResponse.ok) {
          const upgradeData = await upgradeResponse.json();
          console.log('✅ User upgrade successful:', upgradeData);
          
          toast({
            title: "Account Upgraded!",
            description: `Welcome to SSELFIE Studio! You now have ${upgradeData.upgradeDetails.monthlyLimit} monthly generations.`,
          });
          
          // Clear stored plan
          localStorage.removeItem('userPlan');
          return;
        }
      }

      // Method 2: Fallback to automation endpoints (if authenticated)
      if (isAuthenticated) {
        await fetch('/api/automation/update-subscription', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ plan: plan === 'ai-pack' ? 'sselfie-studio' : 'sselfie-studio' })
        });
        
        toast({
          title: "Account Upgraded!",
          description: "Welcome to SSELFIE Studio Premium!",
        });
      }
    } catch (error) {
      console.error('Upgrade automation failed:', error);
      // Don't show error to user - they still got their payment processed
    }
  };

  // Get plan details from URL
  const urlParams = new URLSearchParams(window.location.search);
  const plan = urlParams.get('plan') || 'ai-pack';
  
  const getPlanName = (planType: string) => {
    switch (planType) {
      case 'ai-pack': return 'SSELFIE AI';
      case 'studio-founding': return 'STUDIO Founding';
      case 'studio-standard': return 'STUDIO Pro';
      default: return 'SSELFIE AI';
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <PreLoginNavigationUnified />
      
      <HeroFullBleed
        backgroundImage={SandraImages.editorial.luxury1}
        tagline="Welcome to your transformation"
        title="PAYMENT SUCCESSFUL"
        ctaText="Continue"
        onCtaClick={() => {
          // Redirect to our branded login page
          window.location.href = '/login';
        }}
        fullHeight={false}
      />

      <main className="max-w-4xl mx-auto px-8 py-16">
        <div className="text-center mb-16">
          <div className="inline-block bg-[var(--editorial-gray)] text-[var(--luxury-black)] px-6 py-2 text-sm uppercase tracking-wider mb-6">
            {getPlanName(plan)} PURCHASED
          </div>
          <h2 className="text-3xl font-light mb-6" style={{ fontFamily: 'Times New Roman, serif' }}>
            Your Journey Begins Now
          </h2>
          <p className="text-lg text-[#666666] max-w-2xl mx-auto font-light leading-relaxed">
            Thank you for investing in yourself. You're about to build something incredible - 
            a personal brand that reflects exactly who you are becoming.
          </p>
        </div>

        <div className="bg-[#f5f5f5] p-12 text-center">
          <h3 className="text-2xl font-light mb-4" style={{ fontFamily: 'Times New Roman, serif' }}>
            What Happens Next
          </h3>
          <div className="space-y-4 max-w-2xl mx-auto">
            <div className="flex items-start text-left">
              <div className="text-2xl font-light mr-4 mt-1" style={{ fontFamily: 'Times New Roman, serif' }}>01</div>
              <div>
                <h4 className="font-medium text-[#0a0a0a] mb-1">Complete Your Brand Questionnaire</h4>
                <p className="text-sm text-[#666666]">Tell us about your story, your vision, and who you want to become.</p>
              </div>
            </div>
            <div className="flex items-start text-left">
              <div className="text-2xl font-light mr-4 mt-1" style={{ fontFamily: 'Times New Roman, serif' }}>02</div>
              <div>
                <h4 className="font-medium text-[#0a0a0a] mb-1">Upload Your Selfies</h4>
                <p className="text-sm text-[#666666]">Start your AI training or upload your existing photos.</p>
              </div>
            </div>
            <div className="flex items-start text-left">
              <div className="text-2xl font-light mr-4 mt-1" style={{ fontFamily: 'Times New Roman, serif' }}>03</div>
              <div>
                <h4 className="font-medium text-[#0a0a0a] mb-1">Access Your STUDIO</h4>
                <p className="text-sm text-[#666666]">Enter your personalized workspace and start building your brand.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center mt-16">
          <button 
            onClick={() => {
              // Redirect to our branded login page
              window.location.href = '/login';
            }}
            className="bg-[#0a0a0a] text-white px-8 py-4 text-xs uppercase tracking-wider hover:bg-[#333] transition-colors"
          >
            Begin Your Journey
          </button>
        </div>
      </main>
    </div>
  );
}
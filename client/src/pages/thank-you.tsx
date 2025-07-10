import { useEffect, useState } from 'react';
import { Navigation } from '@/components/navigation';
import { HeroFullBleed } from '@/components/HeroFullBleed';
import { SandraImages } from '@/lib/sandra-images';
import { useAuth } from '@/hooks/use-auth';
import { Link } from 'wouter';

export default function ThankYou() {
  const { isAuthenticated } = useAuth();
  const [planType, setPlanType] = useState('ai-pack');

  useEffect(() => {
    // Get plan from URL params
    const urlParams = new URLSearchParams(window.location.search);
    const plan = urlParams.get('plan') || 'ai-pack';
    setPlanType(plan);

    // Trigger automation workflows
    triggerAutomation(plan);
  }, []);

  const triggerAutomation = async (plan: string) => {
    try {
      // Send welcome email
      await fetch('/api/automation/welcome-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan })
      });

      // Setup user onboarding
      await fetch('/api/automation/setup-onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan })
      });

      // Update user subscription
      await fetch('/api/automation/update-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan })
      });
    } catch (error) {
      console.error('Automation trigger failed:', error);
    }
  };

  const getPlanDetails = (plan: string) => {
    // For immediate revenue focus: direct all users to AI training
    return {
      name: 'SSELFIE STUDIO',
      nextStep: 'Train your personal AI model with your selfies to start generating professional brand photos',
      ctaText: 'START AI TRAINING',
      ctaLink: '/simple-training'
    };
  };

  const planDetails = getPlanDetails(planType);

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      
      <HeroFullBleed
        backgroundImage={SandraImages.journey.success}
        title="WELCOME TO SSELFIE"
        tagline="Your transformation starts now"
        alignment="center"
      />

      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        {/* Success Message */}
        <div className="mb-16">
          <h2 className="text-3xl font-light mb-6" style={{ fontFamily: 'Times New Roman, serif' }}>
            Payment Successful!
          </h2>
          <p className="text-xl text-gray-700 mb-8">
            Thank you for choosing {planDetails.name}
          </p>
          <div className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            You're about to join thousands of women who've transformed their personal brand 
            and launched their businesses with SSELFIE. Let's get you started.
          </div>
        </div>

        {/* Next Steps */}
        <div className="border border-gray-200 p-8 mb-12">
          <h3 className="text-xl font-light mb-4" style={{ fontFamily: 'Times New Roman, serif' }}>
            What Happens Next
          </h3>
          <div className="space-y-6 text-left max-w-2xl mx-auto">
            <div className="flex items-start">
              <div className="text-xs uppercase tracking-wider text-gray-500 mr-4 mt-1">01</div>
              <div>
                <div className="font-medium mb-2">Email Confirmation</div>
                <div className="text-gray-600">Check your inbox for your welcome email with login details</div>
              </div>
            </div>
            <div className="flex items-start">
              <div className="text-xs uppercase tracking-wider text-gray-500 mr-4 mt-1">02</div>
              <div>
                <div className="font-medium mb-2">Train Your AI Model</div>
                <div className="text-gray-600">Upload 10+ selfies to create your personal AI model (takes 20 minutes)</div>
              </div>
            </div>
            <div className="flex items-start">
              <div className="text-xs uppercase tracking-wider text-gray-500 mr-4 mt-1">03</div>
              <div>
                <div className="font-medium mb-2">Generate Professional Photos</div>
                <div className="text-gray-600">Start creating your brand photoshoot with 300 monthly AI generations</div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="mb-16">
          <Link href={planDetails.ctaLink}>
            <button className="bg-black text-white px-12 py-4 text-xs uppercase tracking-wider hover:bg-gray-800 transition-colors">
              {planDetails.ctaText}
            </button>
          </Link>
        </div>

        {/* Support */}
        <div className="text-sm text-gray-600">
          <p className="mb-2">Need help getting started?</p>
          <Link href="/contact">
            <span className="text-black hover:underline cursor-pointer">
              Contact our support team
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}
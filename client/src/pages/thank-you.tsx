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
    switch (plan) {
      case 'ai-pack':
        return {
          name: 'SSELFIE AI Pack',
          nextStep: 'Upload your selfies to start generating professional images',
          ctaText: 'START GENERATING',
          ctaLink: '/ai-images'
        };
      case 'studio':
        return {
          name: 'SSELFIE Studio',
          nextStep: 'Complete your onboarding to build your business',
          ctaText: 'START BUILDING',
          ctaLink: '/onboarding'
        };
      case 'studio-pro':
        return {
          name: 'SSELFIE Studio Pro',
          nextStep: 'Schedule your 1:1 setup call and complete onboarding',
          ctaText: 'BOOK YOUR CALL',
          ctaLink: '/onboarding'
        };
      default:
        return {
          name: 'SSELFIE AI Pack',
          nextStep: 'Upload your selfies to start generating professional images',
          ctaText: 'START GENERATING',
          ctaLink: '/ai-images'
        };
    }
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
                <div className="font-medium mb-2">Access Your Account</div>
                <div className="text-gray-600">Your SSELFIE dashboard is ready with all your tools</div>
              </div>
            </div>
            <div className="flex items-start">
              <div className="text-xs uppercase tracking-wider text-gray-500 mr-4 mt-1">03</div>
              <div>
                <div className="font-medium mb-2">Start Your Transformation</div>
                <div className="text-gray-600">{planDetails.nextStep}</div>
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
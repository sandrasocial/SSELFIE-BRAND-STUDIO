import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { SandraImages } from '../lib/sandra-images';

export default function Welcome() {
  const [, setLocation] = useLocation();
  const [plan, setPlan] = useState<string>('sselfie-studio');

  useEffect(() => {
    // Get plan from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const planParam = urlParams.get('plan') || 'sselfie-studio';
    setPlan(planParam);

    // Store successful purchase for onboarding
    localStorage.setItem('justPurchased', 'true');
    localStorage.setItem('selectedPlan', planParam);
  }, []);

  const handleStartJourney = () => {
    // Redirect to login with purchase context
    window.location.href = '/api/login';
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section with Sandra's Image */}
      <div 
        className="relative h-screen flex items-center justify-center"
        style={{
          backgroundImage: `url(${SandraImages.editorial.mirror})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center top',
          backgroundRepeat: 'no-repeat'
        }}
      >
        {/* Overlay */}
        <div className="absolute inset-0 bg-black bg-opacity-40"></div>
        
        {/* Content */}
        <div className="relative z-10 text-center text-white max-w-4xl px-8">
          <div className="mb-6">
            <span className="text-xs uppercase tracking-[0.3em] opacity-90">
              Welcome to SSELFIE Studio
            </span>
          </div>
          
          <h1 
            className="text-4xl md:text-6xl font-light mb-8 leading-tight"
            style={{ fontFamily: 'Times New Roman, serif' }}
          >
            Your transformation
            <br />
            starts now
          </h1>
          
          <p className="text-lg md:text-xl font-light mb-12 max-w-2xl mx-auto leading-relaxed">
            Thank you for investing in yourself! You've just unlocked everything you need to build your personal brand and launch your business.
          </p>

          <div className="space-y-6">
            <button
              onClick={handleStartJourney}
              className="bg-white text-black px-12 py-4 text-xs uppercase tracking-[0.3em] hover:bg-gray-100 transition-colors"
            >
              Start Your Journey
            </button>
            
            <p className="text-sm opacity-75">
              Check your email for your welcome guide
            </p>
          </div>
        </div>
      </div>

      {/* What's Next Section */}
      <div className="py-24 px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 
              className="text-3xl md:text-4xl font-light mb-6"
              style={{ fontFamily: 'Times New Roman, serif' }}
            >
              Here's what happens next
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              I've designed your journey to be simple, supportive, and transformative. Let's build something amazing together.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            {/* Step 1 */}
            <div className="text-center">
              <div className="mb-6">
                <div className="w-16 h-16 bg-black text-white rounded-full flex items-center justify-center mx-auto text-xl font-light">
                  01
                </div>
              </div>
              <h3 className="text-xl font-medium mb-4">Complete Your Onboarding</h3>
              <p className="text-gray-600 leading-relaxed">
                Tell me about your business, upload your selfies, and let's create your personal AI model.
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center">
              <div className="mb-6">
                <div className="w-16 h-16 bg-black text-white rounded-full flex items-center justify-center mx-auto text-xl font-light">
                  02
                </div>
              </div>
              <h3 className="text-xl font-medium mb-4">Generate Your AI Images</h3>
              <p className="text-gray-600 leading-relaxed">
                Work with Maya, your AI photographer, to create 100 professional images every month.
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center">
              <div className="mb-6">
                <div className="w-16 h-16 bg-black text-white rounded-full flex items-center justify-center mx-auto text-xl font-light">
                  03
                </div>
              </div>
              <h3 className="text-xl font-medium mb-4">Launch Your Business</h3>
              <p className="text-gray-600 leading-relaxed">
                Victoria helps you build your landing page, connect payments, and go live with your brand.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Support Section */}
      <div className="bg-gray-50 py-20 px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h3 
            className="text-2xl font-light mb-6"
            style={{ fontFamily: 'Times New Roman, serif' }}
          >
            I'm here every step of the way
          </h3>
          <p className="text-gray-600 text-lg mb-8 leading-relaxed">
            You're not doing this alone. I've built SSELFIE Studio to feel like having your most supportive friend cheering you on. Questions? Just reach out.
          </p>
          <div className="space-y-4">
            <p className="text-sm text-gray-500">
              Email: hello@sselfie.ai
            </p>
            <p className="text-sm text-gray-500">
              Response time: Usually within 24 hours
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
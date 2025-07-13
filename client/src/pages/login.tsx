import React from 'react';
import { Navigation } from '@/components/navigation';
import { HeroFullBleed } from '@/components/HeroFullBleed';
import { SandraImages } from '@/lib/sandra-images';

export default function Login() {
  const handleLogin = () => {
    // Redirect to the Replit OAuth endpoint
    window.location.href = '/api/login';
  };

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      
      <HeroFullBleed
        backgroundImage={SandraImages.editorial.luxury1}
        tagline="Access your transformation"
        title="WELCOME BACK"
        ctaText="Sign In to Your Studio"
        onCtaClick={handleLogin}
        fullHeight={false}
      />

      <main className="max-w-4xl mx-auto px-8 py-16">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-light mb-6" style={{ fontFamily: 'Times New Roman, serif' }}>
            Enter Your Creative Workspace
          </h2>
          <p className="text-lg text-[#666666] max-w-2xl mx-auto font-light leading-relaxed">
            Your personal brand studio is waiting. Access Maya AI for professional photoshoots, 
            Victoria AI for brand strategy, and your complete business-building ecosystem.
          </p>
        </div>

        <div className="max-w-md mx-auto">
          <div className="bg-[#f5f5f5] p-12 text-center">
            <h3 className="text-2xl font-light mb-8" style={{ fontFamily: 'Times New Roman, serif' }}>
              Secure Access
            </h3>
            
            <button 
              onClick={handleLogin}
              className="w-full bg-[#0a0a0a] text-white px-8 py-4 text-xs uppercase tracking-wider hover:bg-[#333] transition-colors mb-6"
            >
              Sign In to SSELFIE Studio
            </button>
            
            <div className="text-sm text-[#666666] space-y-2">
              <p>New to SSELFIE Studio?</p>
              <a 
                href="/simple-checkout" 
                className="text-[#0a0a0a] underline hover:no-underline"
              >
                Start your transformation here
              </a>
            </div>
          </div>
        </div>

        <div className="mt-16 text-center">
          <div className="max-w-2xl mx-auto">
            <h4 className="text-xl font-light mb-4" style={{ fontFamily: 'Times New Roman, serif' }}>
              What You'll Access
            </h4>
            <div className="grid md:grid-cols-3 gap-8 text-sm">
              <div>
                <div className="text-lg font-light mb-2" style={{ fontFamily: 'Times New Roman, serif' }}>Maya AI</div>
                <p className="text-[#666666]">Professional celebrity stylist for AI photoshoots</p>
              </div>
              <div>
                <div className="text-lg font-light mb-2" style={{ fontFamily: 'Times New Roman, serif' }}>Victoria AI</div>
                <p className="text-[#666666]">Personal brand strategist and website builder</p>
              </div>
              <div>
                <div className="text-lg font-light mb-2" style={{ fontFamily: 'Times New Roman, serif' }}>Your Studio</div>
                <p className="text-[#666666]">Complete workspace with gallery and templates</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
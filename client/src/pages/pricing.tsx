import React from 'react';
import { useAuth } from '@/hooks/use-auth';
import { PricingCard } from '@/components/pricing-card';
import { HeroFullBleed } from '@/components/hero-full-bleed';
import { SandraImages } from '@/components/sandra-image-library';
import { Link, useLocation } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import { Navigation } from '@/components/navigation';

export default function Pricing() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  
  // Check for success parameter from payment completion
  const urlParams = new URLSearchParams(window.location.search);
  const success = urlParams.get('success');
  const completedPlan = urlParams.get('plan');

  const handlePricing = (plan: string) => {
    // Single product pricing
    setLocation(`/checkout?plan=sselfie-studio`);
  };

  const handleGetStarted = () => {
    handlePricing("sselfie-studio");
  };

  return (
    <div className="min-h-screen bg-[var(--mid-gray)]">
      <Navigation />

      {/* Hero Section */}
      <HeroFullBleed
        backgroundImage={SandraImages.editorial.mirror}
        tagline="Investment in the woman you're becoming"
        title="PRICING"
        ctaText="Show me"
        onCtaClick={handleGetStarted}
        fullHeight={false}
      />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-8 py-16">
        {/* Success Message */}
        {success && (
          <div className="bg-[var(--editorial-gray)] border border-[var(--accent-line)] p-6 mb-12 text-center">
            <div className="text-[var(--luxury-black)] text-sm uppercase tracking-wider mb-2">
              PAYMENT SUCCESSFUL
            </div>
            <h3 className="text-xl font-light text-[var(--luxury-black)] mb-2" style={{ fontFamily: 'Times New Roman, serif' }}>
              Welcome to SSELFIE Studio!
            </h3>
            <p className="text-[var(--soft-gray)]">
              Your {completedPlan === 'ai-pack' ? 'SSELFIE AI' : completedPlan === 'studio-founding' ? 'STUDIO Founding' : 'STUDIO Pro'} access is now active. Check your email for next steps.
            </p>
          </div>
        )}
        
        {/* Header Section */}
        <section className="text-center mb-20">
          <p className="eyebrow-text text-[var(--soft-gray)] mb-8 system-text">
            PICK YOUR PATH
          </p>
          <h1 className="editorial-headline text-6xl md:text-8xl font-light text-[var(--luxury-black)] mb-12">
            Start where you<br />feel ready
          </h1>
          <p className="text-xl text-[var(--soft-gray)] max-w-3xl mx-auto system-text font-light">
            Look, you don't need to go all in on day one. Test the AI, build your brand, or launch everything. Your call.
          </p>
        </section>

        {/* Single Product Pricing */}
        <section className="flex justify-center mb-20">
          <div className="max-w-md">
            <PricingCard
              title="SSELFIE STUDIO"
              price="€97"
              period="per month"
              description="The world's first AI selfie personal branding system. Train your AI, generate 300 photos monthly, build your brand with Sandra AI. Everything you need in one place."
              imageUrl={SandraImages.editorial.laptop1}
              ctaText="START YOUR TRANSFORMATION"
              onCtaClick={() => handlePricing('sselfie-studio')}
              isPopular={true}
              badge="Complete System"
              className="bg-[var(--editorial-gray)]"
            />
          </div>
        </section>

        {/* FAQ Section */}
        <section className="bg-white p-12 border border-[var(--accent-line)]">
          <h2 className="editorial-headline text-4xl font-light text-[var(--luxury-black)] mb-12 text-center">
            Frequently Asked Questions
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div>
              <h3 className="editorial-headline text-xl font-light text-[var(--luxury-black)] mb-4">
                How does the AI work?
              </h3>
              <p className="text-[var(--soft-gray)] system-text font-light leading-relaxed">
                Upload 10-15 selfies, and our custom-trained AI model creates 30 editorial-quality images 
                that look authentically like you. It's trained specifically for women's personal branding.
              </p>
            </div>
            
            <div>
              <h3 className="editorial-headline text-xl font-light text-[var(--luxury-black)] mb-4">
                What's included in the Studio?
              </h3>
              <p className="text-[var(--soft-gray)] system-text font-light leading-relaxed">
                Complete brand builder with AI images, luxury templates, copy generation, 
                payment setup, booking system, and domain connection. Everything you need to launch.
              </p>
            </div>
            
            <div>
              <h3 className="editorial-headline text-xl font-light text-[var(--luxury-black)] mb-4">
                Can I upgrade later?
              </h3>
              <p className="text-[var(--soft-gray)] system-text font-light leading-relaxed">
                Absolutely. Start with the AI Pack to see the magic, then upgrade to Studio 
                when you're ready to build your complete personal brand.
              </p>
            </div>
            
            <div>
              <h3 className="editorial-headline text-xl font-light text-[var(--luxury-black)] mb-4">
                What if I need help?
              </h3>
              <p className="text-[var(--soft-gray)] system-text font-light leading-relaxed">
                Sandra's AI assistant guides you through every step. Plus, founding members 
                get priority support and direct access to Sandra's strategy sessions.
              </p>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="text-center mt-20">
          <h2 className="editorial-headline text-5xl md:text-6xl font-light text-[var(--luxury-black)] mb-8">
            Ready to build the revolution?
          </h2>
          <p className="text-xl text-[var(--soft-gray)] mb-12 max-w-2xl mx-auto system-text font-light">
            Join thousands of women who've already transformed their selfies into successful businesses.
          </p>
          
          <div className="flex flex-col md:flex-row gap-8 justify-center items-center">
            <button 
              onClick={() => handlePricing('ai-pack')}
              className="luxury-button text-[var(--luxury-black)] border-[var(--accent-line)] hover:border-[var(--luxury-black)] system-text"
            >
              Start With SSELFIE AI (€47)
            </button>
            <button 
              onClick={() => handlePricing('studio-founding')}
              className="bg-[var(--luxury-black)] text-white px-8 py-4 eyebrow-text hover:bg-[var(--luxury-black)]/90 transition-all duration-300 system-text"
            >
              Launch Your Business (€97)
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}

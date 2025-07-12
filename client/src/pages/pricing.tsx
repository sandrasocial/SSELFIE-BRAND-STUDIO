import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { HeroFullBleed } from '@/components/hero-full-bleed';
import { SandraImages } from '@/components/sandra-image-library';
import { Link, useLocation } from 'wouter';
import { useToast } from '@/hooks/use-toast';

export default function Pricing() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [scrolled, setScrolled] = useState(false);
  
  // Check for success parameter from payment completion
  const urlParams = new URLSearchParams(window.location.search);
  const success = urlParams.get('success');
  const completedPlan = urlParams.get('plan');

  // Scroll effect for navigation
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleGetStarted = (plan: string) => {
    if (plan === 'sselfie-studio') {
      toast({
        title: "SSELFIE Studio",
        description: "Redirecting to checkout for $29/month plan...",
      });
      setLocation('/api/login'); // For now, redirect to login
    } else {
      toast({
        title: "SSELFIE Studio PRO", 
        description: "Redirecting to checkout for $67/month plan...",
      });
      setLocation('/api/login'); // For now, redirect to login
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation with scroll effect */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-black/80 backdrop-blur-md' : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <Link href="/" className="text-white text-lg font-light tracking-wider hover:opacity-80 transition-opacity">
              SSELFIE STUDIO
            </Link>
            
            <div className="hidden md:flex space-x-12">
              <Link href="/how-it-works" className="text-white/80 hover:text-white text-sm uppercase tracking-wider transition-colors">
                How It Works
              </Link>
              <Link href="/pricing" className="text-white hover:text-white text-sm uppercase tracking-wider transition-colors">
                Pricing
              </Link>
              <Link href="/blog" className="text-white/80 hover:text-white text-sm uppercase tracking-wider transition-colors">
                Blog
              </Link>
              <Link href="/api/login" className="text-white/80 hover:text-white text-sm uppercase tracking-wider transition-colors">
                Login
              </Link>
            </div>
            
            <div className="md:hidden">
              <button className="text-white text-sm uppercase tracking-wider">
                Menu
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <HeroFullBleed
        backgroundImage={SandraImages.editorial.mirror}
        tagline="Investment in the woman you're becoming"
        title="PRICING"
        ctaText="Choose Your Plan"
        onCtaClick={() => {}} // Scroll to pricing section
        fullHeight={false}
      />

      {/* Main Content */}
      <main className="py-16 sm:py-24 md:py-32">
        {/* Success Message */}
        {success && (
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
            <div className="bg-gray-50 border p-6 text-center">
              <div className="text-black text-sm uppercase tracking-wider mb-2">
                PAYMENT SUCCESSFUL
              </div>
              <h3 className="text-xl font-light text-black mb-2 font-serif">
                Welcome to SSELFIE Studio!
              </h3>
              <p className="text-gray-600">
                Your {completedPlan === 'sselfie-studio' ? 'SSELFIE Studio' : 'SSELFIE Studio PRO'} access is now active. Check your email for next steps.
              </p>
            </div>
          </div>
        )}
        
        {/* Header Section */}
        <section className="text-center mb-12 sm:mb-16 md:mb-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-xs uppercase tracking-[0.4em] text-gray-500 mb-6 sm:mb-8">
              Choose Your Journey
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-light text-black mb-6 sm:mb-8">
              Start where you<br />feel ready
            </h1>
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto font-light leading-relaxed">
              Look, you don't need to go all in on day one. Test the AI, build your brand, or launch everything. Your call.
            </p>
          </div>
        </section>

        {/* Two-Tier Pricing Section */}
        <section className="px-4 sm:px-6 lg:px-8 mb-16 sm:mb-24 md:mb-32">
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-8 sm:gap-10 md:gap-12">
              
              {/* SSELFIE Studio */}
              <div className="bg-gray-50 p-8 sm:p-10 md:p-12 text-center group hover:bg-black hover:text-white transition-all duration-500">
                <h3 className="font-serif text-2xl sm:text-3xl font-light mb-4 sm:mb-6">SSELFIE Studio</h3>
                <div className="text-3xl sm:text-4xl md:text-5xl font-light mb-6 sm:mb-8">$29<span className="text-sm sm:text-base md:text-lg text-gray-500 group-hover:text-white/60">/month</span></div>
                
                <div className="space-y-3 sm:space-y-4 mb-8 sm:mb-10 md:mb-12 text-left">
                  <div className="flex items-start">
                    <span className="text-black group-hover:text-white mr-3">•</span>
                    <span className="text-sm">Personal AI photoshoot (100 images/month)</span>
                  </div>
                  <div className="flex items-start">
                    <span className="text-black group-hover:text-white mr-3">•</span>
                    <span className="text-sm">Luxury flatlay collections</span>
                  </div>
                  <div className="flex items-start">
                    <span className="text-black group-hover:text-white mr-3">•</span>
                    <span className="text-sm">Brand templates & landing pages</span>
                  </div>
                  <div className="flex items-start">
                    <span className="text-black group-hover:text-white mr-3">•</span>
                    <span className="text-sm">Custom domain connection</span>
                  </div>
                </div>
                
                <button
                  onClick={() => handleGetStarted('sselfie-studio')}
                  className="w-full py-4 border border-black group-hover:border-white text-black group-hover:text-white text-xs uppercase tracking-[0.3em] hover:bg-black hover:text-white group-hover:hover:bg-white group-hover:hover:text-black transition-all duration-300"
                >
                  Get Started
                </button>
              </div>

              {/* SSELFIE Studio PRO */}
              <div className="bg-black text-white p-8 sm:p-10 md:p-12 text-center relative">
                <div className="absolute -top-3 sm:-top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-white text-black px-4 sm:px-6 py-1 sm:py-2 text-xs uppercase tracking-[0.3em]">
                    Most Popular
                  </div>
                </div>
                
                <h3 className="font-serif text-2xl sm:text-3xl font-light mb-4 sm:mb-6">SSELFIE Studio PRO</h3>
                <div className="text-3xl sm:text-4xl md:text-5xl font-light mb-6 sm:mb-8">$67<span className="text-sm sm:text-base md:text-lg text-gray-400">/month</span></div>
                
                <div className="space-y-3 sm:space-y-4 mb-8 sm:mb-10 md:mb-12 text-left">
                  <div className="flex items-start">
                    <span className="text-white mr-3">•</span>
                    <span className="text-sm">Everything in Studio</span>
                  </div>
                  <div className="flex items-start">
                    <span className="text-white mr-3">•</span>
                    <span className="text-sm">300 AI images per month</span>
                  </div>
                  <div className="flex items-start">
                    <span className="text-white mr-3">•</span>
                    <span className="text-sm text-white font-medium">Sandra Personal Brand AI Agent</span>
                  </div>
                  <div className="flex items-start">
                    <span className="text-white mr-3">•</span>
                    <span className="text-sm">Custom brand strategy & content</span>
                  </div>
                  <div className="flex items-start">
                    <span className="text-white mr-3">•</span>
                    <span className="text-sm">Priority support & guidance</span>
                  </div>
                </div>
                
                <button
                  onClick={() => handleGetStarted('sselfie-studio-pro')}
                  className="w-full py-4 border border-white text-white text-xs uppercase tracking-[0.3em] hover:bg-white hover:text-black transition-all duration-300"
                >
                  Get Started
                </button>
              </div>
              
            </div>
            
            <div className="text-center mt-8 sm:mt-10 md:mt-12">
              <p className="text-sm text-gray-500 px-4">
                No contracts. Cancel anytime. 30-day money-back guarantee.
              </p>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="px-4 sm:px-6 lg:px-8 mb-16 sm:mb-24 md:mb-32">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12 sm:mb-16">
              <h2 className="font-serif text-3xl sm:text-4xl font-light text-black mb-6">
                Frequently Asked Questions
              </h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-10 md:gap-12">
              <div>
                <h3 className="font-serif text-xl font-light text-black mb-4">
                  What's the difference between the plans?
                </h3>
                <p className="text-gray-600 font-light leading-relaxed">
                  SSELFIE Studio ($29): 100 AI images + luxury flatlay collections + brand templates. 
                  SSELFIE Studio PRO ($67): 300 AI images + Sandra Personal Brand AI Agent for 24/7 strategy guidance.
                </p>
              </div>
              
              <div>
                <h3 className="font-serif text-xl font-light text-black mb-4">
                  How does the AI work?
                </h3>
                <p className="text-gray-600 font-light leading-relaxed">
                  Upload 10-15 selfies, and our custom-trained AI model creates editorial-quality images 
                  that look authentically like you. It's trained specifically for women's personal branding.
                </p>
              </div>
              
              <div>
                <h3 className="font-serif text-xl font-light text-black mb-4">
                  What's this Sandra AI Agent about?
                </h3>
                <p className="text-gray-600 font-light leading-relaxed">
                  PRO users get to chat with my AI twin 24/7 for brand strategy, content ideas, and business guidance. 
                  She knows exactly how I built this and can help you do the same.
                </p>
              </div>
              
              <div>
                <h3 className="font-serif text-xl font-light text-black mb-4">
                  Can I upgrade later?
                </h3>
                <p className="text-gray-600 font-light leading-relaxed">
                  Absolutely. Start with Studio, upgrade to PRO anytime when you're ready for personal brand strategy 
                  and more AI images.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="px-4 sm:px-6 lg:px-8 text-center bg-black text-white py-16 sm:py-24 md:py-32">
          <div className="max-w-4xl mx-auto">
            <blockquote className="font-serif text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-light italic text-white leading-tight mb-6 sm:mb-8">
              "You don't need a plan.<br />
              Just one brave selfie."
            </blockquote>
            
            <p className="text-base sm:text-lg text-white/80 mb-8 sm:mb-10 md:mb-12 max-w-2xl mx-auto">
              Stop waiting for the perfect moment. Start with what you have, where you are, right now.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button 
                onClick={() => handleGetStarted('sselfie-studio')}
                className="px-8 py-4 border border-white text-white text-xs uppercase tracking-[0.3em] hover:bg-white hover:text-black transition-all duration-300"
              >
                Start with Studio ($29)
              </button>
              <button 
                onClick={() => handleGetStarted('sselfie-studio-pro')}
                className="bg-white text-black px-8 py-4 text-xs uppercase tracking-[0.3em] hover:bg-gray-100 transition-all duration-300"
              >
                Go PRO ($67)
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { HeroFullBleed } from '@/components/hero-full-bleed';
import { SandraImages } from '@/components/sandra-image-library';
import { PreLoginNavigationUnified } from '@/components/pre-login-navigation-unified';
import { EmailCaptureModal } from '@/components/email-capture-modal';
import { GlobalFooter } from '@/components/global-footer';
import { Link, useLocation } from 'wouter';
import { useToast } from '@/hooks/use-toast';

export default function Pricing() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);

  // SEO Meta tags setup
  useEffect(() => {
    // Update page title
    document.title = "Pricing - SSELFIE Studio | AI Personal Branding Platform Starting FREE";
    
    // Update meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Start FREE with 5 AI images/month or upgrade to SSELFIE Studio ($47/month) for 100 images + complete brand ecosystem. Maya AI stylist + Victoria AI strategist included.');
    }

    // Update Open Graph tags
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) {
      ogTitle.setAttribute('content', 'Pricing - Start FREE or $47/month | SSELFIE Studio AI Branding');
    }

    const ogDescription = document.querySelector('meta[property="og:description"]');
    if (ogDescription) {
      ogDescription.setAttribute('content', 'Choose your plan: FREE (5 AI images) or SSELFIE Studio ($47/month, 100 images). Maya AI celebrity stylist + Victoria AI brand strategist. Start building your brand today.');
    }

    const ogUrl = document.querySelector('meta[property="og:url"]');
    if (ogUrl) {
      ogUrl.setAttribute('content', 'https://sselfie.ai/pricing');
    }

    // Update Twitter Card tags
    const twitterTitle = document.querySelector('meta[property="twitter:title"]');
    if (twitterTitle) {
      twitterTitle.setAttribute('content', 'SSELFIE Studio Pricing - Start FREE or $47/month');
    }

    const twitterDescription = document.querySelector('meta[property="twitter:description"]');
    if (twitterDescription) {
      twitterDescription.setAttribute('content', 'AI personal branding platform with celebrity stylist Maya and brand strategist Victoria. Start FREE today.');
    }

    // Add structured data for pricing
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "Product",
      "name": "SSELFIE Studio",
      "description": "AI-powered personal branding platform with celebrity stylist and brand strategist",
      "brand": {
        "@type": "Organization",
        "name": "SSELFIE Studio",
        "url": "https://sselfie.ai"
      },
      "offers": [
        {
          "@type": "Offer",
          "name": "FREE Plan",
          "description": "5 AI images per month with Maya AI photographer chat and Victoria AI brand strategist",
          "price": "0",
          "priceCurrency": "USD",
          "availability": "https://schema.org/InStock",
          "url": "https://sselfie.ai/pricing",
          "priceValidUntil": "2025-12-31"
        },
        {
          "@type": "Offer", 
          "name": "SSELFIE Studio",
          "description": "100 AI images per month, unlimited AI agents, luxury collections, custom domains",
          "price": "47",
          "priceCurrency": "USD",
          "availability": "https://schema.org/InStock",
          "url": "https://sselfie.ai/checkout",
          "priceValidUntil": "2025-12-31"
        }
      ],
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "4.9",
        "reviewCount": "120"
      }
    };

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.innerHTML = JSON.stringify(structuredData);
    document.head.appendChild(script);

    return () => {
      // Cleanup structured data on unmount
      const existingScript = document.querySelector('script[type="application/ld+json"]');
      if (existingScript) {
        document.head.removeChild(existingScript);
      }
    };
  }, []);
  
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
    if (plan === 'free') {
      setShowEmailModal(true);
    } else {
      toast({
        title: "SSELFIE Studio", 
        description: "Redirecting to checkout for $47/month plan...",
      });
      localStorage.setItem('selectedPlan', 'sselfie-studio');
      setLocation('/checkout');
    }
  };

  return (
    <div className="min-h-screen bg-white"
         itemScope 
         itemType="https://schema.org/WebPage">
      {/* Standardized Navigation */}
      <PreLoginNavigationUnified />

      {/* Hero Section */}
      <HeroFullBleed
        backgroundImage="https://i.postimg.cc/HsrPfn0G/out-2-26.png"
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
                Your {completedPlan === 'sselfie-studio' ? 'SSELFIE Studio' : 'SSELFIE Studio'} access is now active. Check your email for next steps.
              </p>
            </div>
          </div>
        )}
        
        {/* Header Section - Enhanced Mobile Responsiveness */}
        <section className="text-center mb-12 sm:mb-16 md:mb-20 px-4 sm:px-6 lg:px-8"
                 itemScope
                 itemType="https://schema.org/Organization">
          <div className="max-w-5xl mx-auto">
            <div className="text-xs sm:text-sm uppercase tracking-[0.3em] sm:tracking-[0.4em] text-gray-500 mb-6 sm:mb-8">
              Choose Your Journey
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-light text-black mb-6 sm:mb-8 px-4"
                itemProp="name">
              Start where you<br className="hidden sm:block" />
              <span className="sm:hidden"> </span>feel ready
            </h1>
            <div className="w-16 h-px bg-[#B5B5B3] mx-auto mb-6 sm:mb-8"></div>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto font-light leading-relaxed px-4"
               itemProp="description">
              Look, you don't need to go all in on day one. Start free, test the magic, then upgrade when you're ready. Your call.
            </p>
          </div>
        </section>

        {/* Freemium Pricing Section - Enhanced Mobile Design */}
        <section className="px-4 sm:px-6 lg:px-8 mb-16 sm:mb-24 md:mb-32"
                 itemScope
                 itemType="https://schema.org/Product">
          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 md:gap-10 lg:gap-12">
              
              {/* FREE Tier - Enhanced Mobile */}
              <div className="bg-gray-50 p-6 sm:p-8 md:p-10 lg:p-12 text-center group hover:bg-black hover:text-white transition-all duration-500"
                   itemScope
                   itemType="https://schema.org/Offer">
                <h3 className="font-serif text-xl sm:text-2xl md:text-3xl font-light mb-4 sm:mb-6"
                    itemProp="name">Try SSELFIE</h3>
                <div className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-light mb-6 sm:mb-8"
                     itemProp="price">
                  FREE<span className="text-sm sm:text-base md:text-lg text-gray-500 group-hover:text-white/60"></span>
                </div>
                
                <div className="space-y-3 sm:space-y-4 mb-8 sm:mb-10 md:mb-12 text-left"
                     itemProp="description">
                  <div className="flex items-start">
                    <span className="text-black group-hover:text-white mr-3 flex-shrink-0">•</span>
                    <span className="text-sm sm:text-base">5 AI images per month</span>
                  </div>
                  <div className="flex items-start">
                    <span className="text-black group-hover:text-white mr-3 flex-shrink-0">•</span>
                    <span className="text-sm sm:text-base">Maya AI photographer chat</span>
                  </div>
                  <div className="flex items-start">
                    <span className="text-black group-hover:text-white mr-3 flex-shrink-0">•</span>
                    <span className="text-sm sm:text-base">Victoria AI brand strategist</span>
                  </div>
                  <div className="flex items-start">
                    <span className="text-black group-hover:text-white mr-3 flex-shrink-0">•</span>
                    <span className="text-sm sm:text-base">Basic templates access</span>
                  </div>
                </div>
                
                <button
                  onClick={() => handleGetStarted('free')}
                  className="w-full py-3 sm:py-4 border border-black group-hover:border-white text-black group-hover:text-white text-xs sm:text-sm uppercase tracking-[0.25em] sm:tracking-[0.3em] hover:bg-black hover:text-white group-hover:hover:bg-white group-hover:hover:text-black transition-all duration-300"
                  aria-label="Start free SSELFIE plan with 5 AI images per month"
                >
                  Start Free
                </button>
              </div>

              {/* SSELFIE Studio - Enhanced Mobile */}
              <div className="bg-black text-white p-6 sm:p-8 md:p-10 lg:p-12 text-center relative"
                   itemScope
                   itemType="https://schema.org/Offer">
                <div className="absolute -top-3 sm:-top-4 left-1/2 transform -translate-x-1/2 z-10">
                  <div className="bg-white text-black px-3 sm:px-4 md:px-6 py-1 sm:py-2 text-xs uppercase tracking-[0.25em] sm:tracking-[0.3em]">
                    Best Value
                  </div>
                </div>
                
                <h3 className="font-serif text-xl sm:text-2xl md:text-3xl font-light mb-4 sm:mb-6 mt-2 sm:mt-0"
                    itemProp="name">SSELFIE Studio</h3>
                <div className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-light mb-6 sm:mb-8">
                  <span itemProp="price">$47</span>
                  <span className="text-sm sm:text-base md:text-lg text-gray-400">/month</span>
                </div>
                
                <div className="space-y-3 sm:space-y-4 mb-8 sm:mb-10 md:mb-12 text-left">
                  <div className="flex items-start">
                    <span className="text-white mr-3">•</span>
                    <span className="text-sm">100 AI images per month</span>
                  </div>
                  <div className="flex items-start">
                    <span className="text-white mr-3">•</span>
                    <span className="text-sm">Maya AI + Victoria AI unlimited</span>
                  </div>
                  <div className="flex items-start">
                    <span className="text-white mr-3">•</span>
                    <span className="text-sm">Luxury flatlay collections</span>
                  </div>
                  <div className="flex items-start">
                    <span className="text-white mr-3">•</span>
                    <span className="text-sm">Landing pages + custom domain</span>
                  </div>
                  <div className="flex items-start">
                    <span className="text-white mr-3">•</span>
                    <span className="text-sm">Priority support</span>
                  </div>
                </div>
                
                <button
                  onClick={() => handleGetStarted('sselfie-studio')}
                  className="w-full py-3 sm:py-4 border border-white text-white text-xs sm:text-sm uppercase tracking-[0.25em] sm:tracking-[0.3em] hover:bg-white hover:text-black transition-all duration-300"
                  aria-label="Get SSELFIE Studio plan for $47 per month with 100 AI images"
                >
                  Get Started
                </button>
              </div>
              
            </div>
            
            <div className="text-center mt-8 sm:mt-10 md:mt-12">
              <p className="text-sm sm:text-base text-gray-500 px-4 font-light">
                No contracts. Cancel anytime. 30-day money-back guarantee.
              </p>
            </div>
          </div>
        </section>

        {/* FAQ Section - Enhanced Mobile */}
        <section className="px-4 sm:px-6 lg:px-8 mb-16 sm:mb-24 md:mb-32"
                 itemScope
                 itemType="https://schema.org/FAQPage">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12 sm:mb-16">
              <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-light text-black mb-4 sm:mb-6"
                  itemProp="headline">
                Frequently Asked Questions
              </h2>
              <div className="w-16 h-px bg-[#B5B5B3] mx-auto"></div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 md:gap-10 lg:gap-12">
              <div className="space-y-3 sm:space-y-4"
                   itemScope
                   itemType="https://schema.org/Question">
                <h3 className="font-serif text-lg sm:text-xl font-light text-black leading-tight"
                    itemProp="name">
                  What's the difference between FREE and Studio?
                </h3>
                <div itemScope itemType="https://schema.org/Answer">
                  <p className="text-sm sm:text-base text-gray-600 font-light leading-relaxed"
                     itemProp="text">
                    FREE: 5 AI images per month + basic chat with MAYA & VICTORIA. 
                    SSELFIE Studio ($47/month): 100 AI images + unlimited AI agents + complete brand ecosystem + custom domains.
                  </p>
                </div>
              </div>
              
              <div className="space-y-3 sm:space-y-4"
                   itemScope
                   itemType="https://schema.org/Question">
                <h3 className="font-serif text-lg sm:text-xl font-light text-black leading-tight"
                    itemProp="name">
                  How does the AI work?
                </h3>
                <div itemScope itemType="https://schema.org/Answer">
                  <p className="text-sm sm:text-base text-gray-600 font-light leading-relaxed"
                     itemProp="text">
                    Upload 10-15 selfies, and our custom-trained AI model creates editorial-quality images 
                    that look authentically like you. It's trained specifically for women's personal branding.
                  </p>
                </div>
              </div>
              
              <div className="space-y-3 sm:space-y-4"
                   itemScope
                   itemType="https://schema.org/Question">
                <h3 className="font-serif text-lg sm:text-xl font-light text-black leading-tight"
                    itemProp="name">
                  Who are MAYA and VICTORIA?
                </h3>
                <div itemScope itemType="https://schema.org/Answer">
                  <p className="text-sm sm:text-base text-gray-600 font-light leading-relaxed"
                     itemProp="text">
                    MAYA is your celebrity stylist/photographer who creates editorial images. VICTORIA is your brand strategist who builds complete websites. Both are AI agents trained on Sandra's expertise.
                  </p>
                </div>
              </div>
              
              <div className="space-y-3 sm:space-y-4"
                   itemScope
                   itemType="https://schema.org/Question">
                <h3 className="font-serif text-lg sm:text-xl font-light text-black leading-tight"
                    itemProp="name">
                  Can I upgrade from FREE to Studio later?
                </h3>
                <div itemScope itemType="https://schema.org/Answer">
                  <p className="text-sm sm:text-base text-gray-600 font-light leading-relaxed"
                     itemProp="text">
                    Absolutely. Start free, upgrade to Studio anytime when you're ready for the full ecosystem 
                    and 100 monthly images.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA - Enhanced Mobile Design */}
        <section className="px-4 sm:px-6 lg:px-8 text-center bg-black text-white py-16 sm:py-24 md:py-32"
                 itemScope
                 itemType="https://schema.org/Organization">
          <div className="max-w-5xl mx-auto">
            <blockquote className="font-serif text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-light italic text-white leading-tight mb-6 sm:mb-8 px-4"
                        itemProp="slogan">
              "You don't need a plan.<br className="hidden sm:block" />
              <span className="sm:hidden"> </span>Just one brave selfie."
            </blockquote>
            
            <p className="text-base sm:text-lg text-white/80 mb-8 sm:mb-10 md:mb-12 max-w-2xl mx-auto px-4 font-light">
              Stop waiting for the perfect moment. Start with what you have, where you are, right now.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button 
                onClick={() => handleGetStarted('free')}
                className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 border border-white text-white text-xs sm:text-sm uppercase tracking-[0.25em] sm:tracking-[0.3em] hover:bg-white hover:text-black transition-all duration-300"
                aria-label="Start free plan with email signup"
              >
                Start Free Today
              </button>
              <button 
                onClick={() => handleGetStarted('sselfie-studio')}
                className="w-full sm:w-auto bg-white text-black px-6 sm:px-8 py-3 sm:py-4 text-xs sm:text-sm uppercase tracking-[0.25em] sm:tracking-[0.3em] hover:bg-gray-100 transition-all duration-300"
                aria-label="Get SSELFIE Studio plan for $47 per month"
              >
                Get Studio $47/mo
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* Global Footer */}
      <GlobalFooter />

      {/* Email Capture Modal */}
      <EmailCaptureModal 
        isOpen={showEmailModal}
        onClose={() => setShowEmailModal(false)}
        plan="free"
      />
    </div>
  );
}

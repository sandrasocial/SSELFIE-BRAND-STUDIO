import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/use-auth';
import { HeroFullBleed } from '../components/hero-full-bleed';
import { SandraImages } from '../components/sandra-image-library';
import { PreLoginNavigationUnified } from '../components/pre-login-navigation-unified';
import { EmailCaptureModal } from '../components/email-capture-modal';
import { GlobalFooter } from '../components/global-footer';
import { Link, useLocation } from 'wouter';
import { useToast } from '../hooks/use-toast';

export default function Pricing() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);

  // SEO Meta tags setup
  useEffect(() => {
    // Update page title
    document.title = "Personal Brand Studio €47/month - AI Personal Branding Platform | SSELFIE Studio";
    
    // Update meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Transform selfies into professional brand photos with AI. Personal Brand Studio €47/month - Your trained AI model, 100 monthly professional photos, Maya AI photographer.');
    }

    // Update Open Graph tags
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) {
      ogTitle.setAttribute('content', 'Personal Brand Studio €47/month | SSELFIE Studio');
    }

    const ogDescription = document.querySelector('meta[property="og:description"]');
    if (ogDescription) {
      ogDescription.setAttribute('content', 'Transform selfies into professional brand photos with AI. Personal Brand Studio €47/month - Your trained AI model, 100 monthly professional photos, Maya AI photographer.');
    }

    const ogUrl = document.querySelector('meta[property="og:url"]');
    if (ogUrl) {
      ogUrl.setAttribute('content', 'https://sselfie.ai/pricing');
    }

    // Update Twitter Card tags
    const twitterTitle = document.querySelector('meta[property="twitter:title"]');
    if (twitterTitle) {
      twitterTitle.setAttribute('content', 'Personal Brand Studio €47/month | SSELFIE Studio');
    }

    const twitterDescription = document.querySelector('meta[property="twitter:description"]');
    if (twitterDescription) {
      twitterDescription.setAttribute('content', 'Transform selfies into professional brand photos with AI. Personal Brand Studio €47/month - Never pay for another photoshoot.');
    }

    // Add structured data for pricing
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "Product",
      "name": "SSELFIE Studio",
      "description": "From divorced single mom to 6-figure personal brand in 90 days. Now helping other moms do the same.",
      "brand": {
        "@type": "Organization",
        "name": "SSELFIE Studio",
        "url": "https://sselfie.ai"
      },
      "offers": [
        {
          "@type": "Offer",
          "name": "Personal Brand Studio",
          "description": "Your trained personal AI model + 100 monthly professional photos + Maya AI photographer access + personal brand photo gallery",
          "price": "47",
          "priceCurrency": "EUR",
          "availability": "https://schema.org/InStock",
          "url": "https://sselfie.ai/simple-checkout",
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
    script.textContent = JSON.stringify(structuredData);
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

  const handleGetStarted = () => {
    toast({
      title: "Personal Brand Studio", 
      description: "Redirecting to checkout for €47/month plan...",
    });
    localStorage.setItem('selectedPlan', 'personal-brand-studio');
    setLocation('/simple-checkout');
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
              Transform your selfies into professional brand photos with AI. Never pay for another photoshoot.
            </p>
          </div>
        </section>

        {/* Single Tier Pricing Section - Enhanced Mobile Design */}
        <section className="px-4 sm:px-6 lg:px-8 mb-16 sm:mb-24 md:mb-32"
                 itemScope
                 itemType="https://schema.org/Product">
          <div className="max-w-md mx-auto">
            {/* PERSONAL BRAND STUDIO - SINGLE TIER */}
            <div className="bg-black text-white p-8 sm:p-10 md:p-12 text-center relative"
                 itemScope
                 itemType="https://schema.org/Offer">
              <div className="absolute -top-3 sm:-top-4 left-1/2 transform -translate-x-1/2">
                <div className="bg-white text-black px-4 sm:px-6 py-1 sm:py-2 text-xs uppercase tracking-[0.3em]">
                  Launch Special
                </div>
              </div>
              
              <h3 className="font-serif text-2xl sm:text-3xl font-light mb-4 sm:mb-6"
                  itemProp="name">Personal Brand Studio</h3>
              <div className="text-3xl sm:text-4xl md:text-5xl font-light mb-6 sm:mb-8">
                <span itemProp="price">€47</span>
                <span className="text-sm sm:text-base md:text-lg text-gray-400">/month</span>
              </div>
              
              <div className="space-y-3 sm:space-y-4 mb-8 sm:mb-10 md:mb-12 text-left">
                <div className="flex items-start">
                  <span className="text-white mr-3">•</span>
                  <span className="text-sm">Your trained personal AI model</span>
                </div>
                <div className="flex items-start">
                  <span className="text-white mr-3">•</span>
                  <span className="text-sm">100 monthly professional photos</span>
                </div>
                <div className="flex items-start">
                  <span className="text-white mr-3">•</span>
                  <span className="text-sm">Maya AI photographer access</span>
                </div>
                <div className="flex items-start">
                  <span className="text-white mr-3">•</span>
                  <span className="text-sm">Personal brand photo gallery</span>
                </div>
                <div className="flex items-start">
                  <span className="text-white mr-3">•</span>
                  <span className="text-sm">Cancel anytime</span>
                </div>
              </div>
              
              <button
                onClick={() => handleGetStarted()}
                className="w-full py-4 border border-white text-white text-xs uppercase tracking-[0.3em] hover:bg-white hover:text-black transition-all duration-300"
                aria-label="Start Personal Brand Studio for €47 per month"
              >
                Start Personal Brand Studio
              </button>
            </div>
            
            <div className="text-center mt-8 sm:mt-10 md:mt-12">
              <p className="text-sm text-gray-500 px-4">
                Never pay for another photoshoot. Your personal AI photographer available 24/7.
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
                  What's included in Personal Brand Studio?
                </h3>
                <div itemScope itemType="https://schema.org/Answer">
                  <p className="text-sm sm:text-base text-gray-600 font-light leading-relaxed"
                     itemProp="text">
                    Personal Brand Studio (€47/month): Your trained personal AI model + 100 monthly professional photos + Maya AI photographer access + personal brand photo gallery.
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
                  Who is Maya AI?
                </h3>
                <div itemScope itemType="https://schema.org/Answer">
                  <p className="text-sm sm:text-base text-gray-600 font-light leading-relaxed"
                     itemProp="text">
                    Maya is your personal AI photographer who creates professional brand photos from your selfies. She knows exactly how to style you and generate photos that look like you hired a professional photographer.
                  </p>
                </div>
              </div>
              
              <div className="space-y-3 sm:space-y-4"
                   itemScope
                   itemType="https://schema.org/Question">
                <h3 className="font-serif text-lg sm:text-xl font-light text-black leading-tight"
                    itemProp="name">
                  How many photos can I generate?
                </h3>
                <div itemScope itemType="https://schema.org/Answer">
                  <p className="text-sm sm:text-base text-gray-600 font-light leading-relaxed"
                     itemProp="text">
                    With Personal Brand Studio, you get 100 monthly professional brand photo generation. Fresh content every month for your personal brand growth.
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
            
            <div className="flex justify-center">
              <button 
                onClick={() => handleGetStarted()}
                className="w-full sm:w-auto px-8 sm:px-12 py-4 sm:py-6 bg-white text-black text-xs sm:text-sm uppercase tracking-[0.25em] sm:tracking-[0.3em] hover:bg-gray-100 transition-all duration-300"
                aria-label="Start Personal Brand Studio for €47 per month"
              >
                Start Personal Brand Studio €47
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
        plan="basic"
        onEmailCaptured={(email) => {
          console.log('Email captured:', email);
          // Email modal will handle redirect to authentication
        }}
      />
    </div>
  );
}

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
      metaDescription.setAttribute('content', 'Start with SSELFIE AI Images (€47 one-time) or upgrade to SSELFIE Studio (€97/month or €147/month) for complete personal branding solution.');
    }

    // Update Open Graph tags
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) {
      ogTitle.setAttribute('content', 'Pricing - €47 AI Images or €97/€147 Studio | SSELFIE');
    }

    const ogDescription = document.querySelector('meta[property="og:description"]');
    if (ogDescription) {
      ogDescription.setAttribute('content', 'Choose your plan: SSELFIE AI Images (€47 one-time) or SSELFIE Studio (€97/month or €147/month) for complete personal branding.');
    }

    const ogUrl = document.querySelector('meta[property="og:url"]');
    if (ogUrl) {
      ogUrl.setAttribute('content', 'https://sselfie.ai/pricing');
    }

    // Update Twitter Card tags
    const twitterTitle = document.querySelector('meta[property="twitter:title"]');
    if (twitterTitle) {
      twitterTitle.setAttribute('content', 'SSELFIE Pricing - €47 AI Images or €97/€147 Studio');
    }

    const twitterDescription = document.querySelector('meta[property="twitter:description"]');
    if (twitterDescription) {
      twitterDescription.setAttribute('content', 'AI personal branding platform. Start with €47 AI images or get the full Studio experience from €97/month.');
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
          "name": "SSELFIE AI Images",
          "description": "Upload 10-15 selfies, get 30 luxury AI images back",
          "price": "47",
          "priceCurrency": "EUR",
          "availability": "https://schema.org/InStock",
          "url": "https://sselfie.ai/ai-images",
          "priceValidUntil": "2025-12-31"
        },
        {
          "@type": "Offer", 
          "name": "SSELFIE Studio Founding Member",
          "description": "Everything you need to build your personal brand in 20 minutes",
          "price": "97",
          "priceCurrency": "EUR",
          "availability": "https://schema.org/InStock",
          "url": "https://sselfie.ai/studio",
          "priceValidUntil": "2025-12-31"
        },
        {
          "@type": "Offer", 
          "name": "SSELFIE Studio Standard",
          "description": "Full platform access for established personal brands",
          "price": "147",
          "priceCurrency": "EUR",
          "availability": "https://schema.org/InStock",
          "url": "https://sselfie.ai/studio-standard",
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
        title: "SSELFIE Studio Premium", 
        description: "Redirecting to checkout for €67/month luxury plan...",
      });
      localStorage.setItem('selectedPlan', 'sselfie-studio-premium');
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
                    <span className="text-sm sm:text-base">6 AI images per month</span>
                  </div>
                  <div className="flex items-start">
                    <span className="text-black group-hover:text-white mr-3 flex-shrink-0">•</span>
                    <span className="text-sm sm:text-base">Maya AI photographer chat</span>
                  </div>
                  <div className="flex items-start">
                    <span className="text-black group-hover:text-white mr-3 flex-shrink-0">•</span>
                    <span className="text-sm sm:text-base">Standard FLUX quality</span>
                  </div>
                  <div className="flex items-start">
                    <span className="text-black group-hover:text-white mr-3 flex-shrink-0">•</span>
                    <span className="text-sm sm:text-base">One AI model training</span>
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
                    itemProp="name">SSELFIE Studio Premium</h3>
                <div className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-light mb-6 sm:mb-8">
                  <span itemProp="price">€67</span>
                  <span className="text-sm sm:text-base md:text-lg text-gray-400">/month</span>
                </div>
                
                <div className="space-y-3 sm:space-y-4 mb-8 sm:mb-10 md:mb-12 text-left">
                  <div className="flex items-start">
                    <span className="text-white mr-3">•</span>
                    <span className="text-sm">100 ultra-realistic AI images</span>
                  </div>
                  <div className="flex items-start">
                    <span className="text-white mr-3">•</span>
                    <span className="text-sm">FLUX Pro luxury models</span>
                  </div>
                  <div className="flex items-start">
                    <span className="text-white mr-3">•</span>
                    <span className="text-sm">Maya AI unlimited chat</span>
                  </div>
                  <div className="flex items-start">
                    <span className="text-white mr-3">•</span>
                    <span className="text-sm">Premium training quality</span>
                  </div>
                  <div className="flex items-start">
                    <span className="text-white mr-3">•</span>
                    <span className="text-sm">Commercial usage rights</span>
                  </div>
                </div>
                
                <button
                  onClick={() => handleGetStarted('sselfie-studio')}
                  className="w-full py-3 sm:py-4 border border-white text-white text-xs sm:text-sm uppercase tracking-[0.25em] sm:tracking-[0.3em] hover:bg-white hover:text-black transition-all duration-300"
                  aria-label="Get SSELFIE Studio Premium plan for €67 per month with 100 ultra-realistic AI images"
                >
                  Get Premium
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
                  What's the difference between FREE and Premium?
                </h3>
                <div itemScope itemType="https://schema.org/Answer">
                  <p className="text-sm sm:text-base text-gray-600 font-light leading-relaxed"
                     itemProp="text">
                    FREE: 6 AI images per month + Maya AI chat with standard FLUX quality. 
                    Premium (€67/month): 100 ultra-realistic images with FLUX Pro luxury models + unlimited Maya AI chat.
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
                    MAYA is your AI photographer who creates ultra-realistic editorial images that look exactly like you. She's trained on luxury fashion photography and professional styling expertise.
                  </p>
                </div>
              </div>
              
              <div className="space-y-3 sm:space-y-4"
                   itemScope
                   itemType="https://schema.org/Question">
                <h3 className="font-serif text-lg sm:text-xl font-light text-black leading-tight"
                    itemProp="name">
                  Can I upgrade from FREE to Premium later?
                </h3>
                <div itemScope itemType="https://schema.org/Answer">
                  <p className="text-sm sm:text-base text-gray-600 font-light leading-relaxed"
                     itemProp="text">
                    Absolutely. Start free, upgrade to Premium anytime when you're ready for ultra-realistic FLUX Pro quality 
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
                aria-label="Get SSELFIE Studio Premium plan for €67 per month"
              >
                Get Premium €67/mo
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
        onEmailCaptured={(email) => {
          console.log('Email captured:', email);
          // Email modal will handle redirect to authentication
        }}
      />
    </div>
  );
}

import React, { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { SandraImages } from "../../lib/sandra-images";
import { PortfolioSection } from "../../components/portfolio-section";
import FreeTierSignup from "../../components/free-tier-signup";
import WelcomeEditorial from "../../components/welcome-editorial";
import { EmailCaptureModal } from "../../components/email-capture-modal";
import { InlineEmailCapture } from "../../components/inline-email-capture";
import { GlobalFooter } from "../../components/global-footer";

export default function EditorialLanding() {
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<'free' | 'sselfie-studio'>('free');
  const [, setLocation] = useLocation();

  // SEO Meta Tags and Performance Optimization
  useEffect(() => {
    document.title = "SSELFIE Studio - AI Personal Branding Platform | Transform Selfies Into Professional Photos";
    
    // Update or create meta description with rich keywords
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.setAttribute('name', 'description');
      document.head.appendChild(metaDescription);
    }
    metaDescription.setAttribute('content', 'Transform selfies into professional brand photos with AI. Maya AI photographer & Victoria AI strategist help you build your personal brand and launch your business in 20 minutes. Start free - 5 AI images included.');
    
    // Add comprehensive SEO meta tags
    const seoTags = [
      { name: 'keywords', content: 'AI personal branding, AI photographer, professional headshots AI, personal brand builder, selfie to professional photos, AI brand strategist, business launch platform, professional photos from selfies, AI personal brand coach, digital brand transformation' },
      { property: 'og:title', content: 'SSELFIE Studio - AI Personal Branding Platform | Professional Photos from Selfies' },
      { property: 'og:description', content: 'Transform selfies into professional brand photos with AI. Maya AI photographer & Victoria AI strategist included. Launch your business in 20 minutes. Start free today.' },
      { property: 'og:type', content: 'website' },
      { property: 'og:url', content: window.location.href },
      { property: 'og:site_name', content: 'SSELFIE Studio' },
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: 'SSELFIE Studio - AI Personal Branding Platform' },
      { name: 'twitter:description', content: 'Transform selfies into professional brand photos with AI. Maya AI photographer & Victoria AI strategist. Start free today.' },
      { name: 'twitter:creator', content: '@sandra.social' },
      { name: 'author', content: 'Sandra Sigurjónsdóttir' },
      { name: 'robots', content: 'index, follow, max-image-preview:large' }
    ];
    
    seoTags.forEach(tag => {
      let existingTag = document.querySelector(`meta[${tag.property ? 'property' : 'name'}="${tag.property || tag.name}"]`);
      if (!existingTag) {
        existingTag = document.createElement('meta');
        existingTag.setAttribute(tag.property ? 'property' : 'name', tag.property || tag.name);
        document.head.appendChild(existingTag);
      }
      existingTag.setAttribute('content', tag.content);
    });

    // Add structured data for better search results
    const structuredData = {
      "@context": "https://schema.org",
      "@type": ["WebPage", "SoftwareApplication"],
      "name": "SSELFIE Studio",
      "description": "AI-powered personal branding platform that transforms selfies into professional business photos",
      "url": window.location.href,
      "author": {
        "@type": "Person",
        "name": "Sandra Sigurjónsdóttir",
        "url": "https://instagram.com/sandra.social"
      },
      "applicationCategory": "BusinessApplication",
      "offers": [
        {
          "@type": "Offer",
          "name": "Free Plan",
          "price": "0",
          "priceCurrency": "USD",
          "description": "5 AI images per month, Maya AI photographer chat, Victoria AI strategist chat"
        },
        {
          "@type": "Offer", 
          "name": "SSELFIE Studio",
          "price": "47",
          "priceCurrency": "USD",
          "description": "100 AI images monthly, complete Maya & Victoria AI access, landing page builder"
        }
      ]
    };

    let structuredDataScript = document.querySelector('script[type="application/ld+json"]');
    if (!structuredDataScript) {
      structuredDataScript = document.createElement('script');
      (structuredDataScript as HTMLScriptElement).type = 'application/ld+json';
      document.head.appendChild(structuredDataScript);
    }
    structuredDataScript.textContent = JSON.stringify(structuredData);
  }, []);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 50;
      setScrolled(isScrolled);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleGetStarted = (plan: 'free' | 'sselfie-studio') => {
    // Store the selected plan
    localStorage.setItem('selectedPlan', plan);
    
    // Check if email already captured
    const emailCaptured = localStorage.getItem('emailCaptured');
    
    if (emailCaptured) {
      // Email already captured, proceed to authentication
      if (plan === 'free') {
        window.location.href = '/api/login';
      } else {
        setLocation('/checkout');
      }
    } else {
      // Show email capture modal first
      setSelectedPlan(plan);
      setIsEmailModalOpen(true);
    }
  };



  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-black/80 backdrop-blur-md' : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex items-center justify-between">
            <button 
              onClick={() => setLocation("/")}
              className="font-serif text-xl font-light tracking-wide text-white hover:opacity-70 transition-opacity duration-300"
            >
              SSELFIE
            </button>
            <div className="hidden md:flex items-center space-x-6 lg:space-x-10">
              <button 
                onClick={() => setLocation("/about")}
                className="text-xs uppercase tracking-[0.4em] text-white/80 hover:text-white transition-all duration-300"
              >
                About
              </button>
              <button 
                onClick={() => setLocation("/how-it-works")}
                className="text-xs uppercase tracking-[0.4em] text-white/80 hover:text-white transition-all duration-300"
              >
                How It Works
              </button>
              <button 
                onClick={() => setLocation("/pricing")}
                className="text-xs uppercase tracking-[0.4em] text-white/80 hover:text-white transition-all duration-300"
              >
                Pricing
              </button>
              <button 
                onClick={() => setLocation("/blog")}
                className="text-xs uppercase tracking-[0.4em] text-white/80 hover:text-white transition-all duration-300"
              >
                Blog
              </button>
              <button
                onClick={() => setLocation('/login')}
                className="text-xs uppercase tracking-[0.4em] text-white/80 hover:text-white transition-all duration-300"
              >
                Login
              </button>
            </div>
            
            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden text-xs uppercase tracking-[0.4em] text-white/80 hover:text-white transition-all duration-300"
            >
              MENU
            </button>
            
            <button
              onClick={() => handleGetStarted('free')}
              className="hidden md:block px-6 py-3 border border-white/50 text-white text-xs uppercase tracking-[0.3em] hover:bg-white hover:text-black transition-all duration-300"
            >
              Start Here
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-black/95 backdrop-blur-sm md:hidden">
          <div className="flex flex-col items-center justify-center min-h-screen space-y-12">
            <button 
              onClick={() => { setLocation("/about"); setMobileMenuOpen(false); }}
              className="text-sm uppercase tracking-[0.4em] text-white/80 hover:text-white transition-all duration-300"
            >
              About
            </button>
            <button 
              onClick={() => { setLocation("/how-it-works"); setMobileMenuOpen(false); }}
              className="text-sm uppercase tracking-[0.4em] text-white/80 hover:text-white transition-all duration-300"
            >
              How It Works
            </button>
            <button 
              onClick={() => { setLocation("/pricing"); setMobileMenuOpen(false); }}
              className="text-sm uppercase tracking-[0.4em] text-white/80 hover:text-white transition-all duration-300"
            >
              Pricing
              </button>
            <button 
              onClick={() => { setLocation("/blog"); setMobileMenuOpen(false); }}
              className="text-sm uppercase tracking-[0.4em] text-white/80 hover:text-white transition-all duration-300"
            >
              Blog
            </button>
            <button
              onClick={() => { setLocation('/login'); setMobileMenuOpen(false); }}
              className="text-sm uppercase tracking-[0.4em] text-white/80 hover:text-white transition-all duration-300"
            >
              Login
            </button>
            <button
              onClick={() => { handleGetStarted('free'); setMobileMenuOpen(false); }}
              className="px-8 py-4 border border-white/50 text-white text-xs uppercase tracking-[0.3em] hover:bg-white hover:text-black transition-all duration-300 mt-8"
            >
              Start Here
            </button>
            
            {/* Close Button */}
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="absolute top-8 right-8 text-xs uppercase tracking-[0.4em] text-white/80 hover:text-white transition-all duration-300"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Hero Section - Full Bleed Editorial */}
      <section className="relative min-h-screen flex items-end justify-center bg-black text-white overflow-hidden">
        <div className="absolute inset-0 opacity-40">
          <img
            src={SandraImages.hero.homepage}
            alt="Sandra Sigurjónsdóttir - SSELFIE Studio Founder transforming personal branding with AI"
            className="w-full h-full object-cover object-center"
            loading="eager"
            fetchPriority="high"
          />
        </div>
        
        {/* Hero Content - Positioned Lower */}
        <div className="relative z-10 text-center max-w-6xl px-4 sm:px-6 lg:px-8 pb-16 sm:pb-20 md:pb-24">
          <p className="text-[10px] sm:text-xs uppercase tracking-[0.3em] sm:tracking-[0.4em] text-white/70 mb-4 sm:mb-6 font-light">
            IT STARTS WITH YOUR SELFIES
          </p>
          
          <h1 className="font-serif text-4xl sm:text-6xl md:text-8xl lg:text-9xl xl:text-[10rem] font-extralight text-white tracking-[0.3em] sm:tracking-[0.4em] md:tracking-[0.5em] mb-2 sm:mb-4 leading-none">
            SSELFIE
          </h1>
          
          <p className="text-[10px] sm:text-xs md:text-sm uppercase tracking-[0.3em] sm:tracking-[0.4em] text-white/70 mb-8 sm:mb-10 font-light">
            STUDIO
          </p>
          
          <button
            onClick={() => handleGetStarted('free')}
            className="inline-block text-[10px] sm:text-xs uppercase tracking-[0.25em] sm:tracking-[0.3em] text-white border-b border-white/30 pb-1 sm:pb-2 hover:border-white hover:tracking-[0.3em] sm:hover:tracking-[0.35em] transition-all duration-300"
          >
            START FOR FREE
          </button>
        </div>
      </section>

      {/* Welcome Editorial Section */}
      <WelcomeEditorial />

      {/* Portfolio Section - Showcasing AI-Generated Brand Photos */}
      <PortfolioSection />

      {/* Free Tier Signup Section */}
      <FreeTierSignup />

      {/* Inline Email Capture */}
      <InlineEmailCapture plan="free" />

      {/* Global Footer */}
      <GlobalFooter />

      {/* Email Capture Modal */}
      <EmailCaptureModal
        isOpen={isEmailModalOpen}
        onClose={() => setIsEmailModalOpen(false)}
        plan={selectedPlan}
      />
    </div>
  );
}
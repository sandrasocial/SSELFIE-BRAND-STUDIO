import React, { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { SandraImages } from "../lib/sandra-images";
import { PortfolioSection } from "../components/portfolio-section";
import FreeTierSignup from "../components/free-tier-signup";
import WelcomeEditorial from "../components/welcome-editorial";
import { EmailCaptureModal } from "../components/email-capture-modal";
import { InlineEmailCapture } from "../components/inline-email-capture";
import { GlobalFooter } from "../components/global-footer";

export default function EditorialLanding() {
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [selectedPlan] = useState('personal-brand-studio');
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
    metaDescription.setAttribute('content', 'Turn selfies into professional brand photos with AI. €47/month personal brand studio: your trained model, up to 100 monthly images, and Maya—your AI stylist.');
    
    // Add comprehensive SEO meta tags
    const seoTags = [
      { name: 'keywords', content: 'AI personal branding, AI headshots, professional photos from selfies, personal brand photos, AI photographer, brand studio' },
      { property: 'og:title', content: 'SSELFIE Studio - AI Personal Branding Platform | Professional Photos from Selfies' },
      { property: 'og:description', content: 'Professional brand photos from your selfies. €47/month. No photographer, no awkwardness—just you, looking like a pro.' },
      { property: 'og:type', content: 'website' },
      { property: 'og:url', content: window.location.href },
      { property: 'og:site_name', content: 'SSELFIE Studio' },
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: 'SSELFIE Studio - AI Personal Branding Platform' },
      { name: 'twitter:description', content: 'Professional brand photos from your selfies. €47/month. No photographer, no awkwardness—just you, looking like a pro.' },
      { name: 'twitter:creator', content: '@sandra.social' },
      { name: 'author', content: 'Sandra Sigurjónsdóttir' },
      { name: 'robots', content: 'index, follow, max-image-preview:large' }
    ];
    
    seoTags.forEach(tag => {
      let existingTag = document.querySelector(`meta[${tag.property ? 'property' : 'name'}="${tag.property || tag.name}"]`);
      if (!existingTag) {
        existingTag = document.createElement('meta');
        existingTag.setAttribute(tag.property ? 'property' : 'name', tag.property || tag.name!);
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
          "name": "Personal Brand Studio",
          "price": "47",
          "priceCurrency": "EUR",
          "description": "Your trained personal AI model + 100 monthly professional photos + Maya AI photographer access + personal brand photo gallery"
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

  const handleGetStarted = (plan: string = 'personal-brand-studio') => {
    // Store the selected plan
    localStorage.setItem('selectedPlan', plan);
    
    // Check if email already captured
    const emailCaptured = localStorage.getItem('emailCaptured');
    
    if (emailCaptured) {
      // Email already captured, proceed to checkout for both plans
      setLocation('/simple-checkout');
    } else {
      // Show email capture modal first
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
              <button 
                onClick={() => setLocation("/contact")}
                className="text-xs uppercase tracking-[0.4em] text-white/80 hover:text-white transition-all duration-300"
              >
                Contact
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
              onClick={() => handleGetStarted()}
              className="hidden md:block px-6 py-3 border border-white/50 text-white text-xs uppercase tracking-[0.3em] hover:bg-white hover:text-black transition-all duration-300"
            >
              Start €47
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
              onClick={() => { setLocation("/contact"); setMobileMenuOpen(false); }}
              className="text-sm uppercase tracking-[0.4em] text-white/80 hover:text-white transition-all duration-300"
            >
              Contact
            </button>
            <button
              onClick={() => { handleGetStarted(); setMobileMenuOpen(false); }}
              className="px-8 py-4 border border-white/50 text-white text-xs uppercase tracking-[0.3em] hover:bg-white hover:text-black transition-all duration-300 mt-8"
            >
              Start €47
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
        <div className="absolute inset-0 opacity-60">
          <img
            src="https://sselfie-training-zips.s3.eu-north-1.amazonaws.com/generated-images/42585527/maya_5te0ac4q2xrme0cs07ns8685h0_0_1756673852393.png"
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
            onClick={() => handleGetStarted()}
            className="group inline-block"
          >
            <span className="text-[10px] sm:text-xs uppercase tracking-[0.25em] sm:tracking-[0.3em] text-white border-b border-white/30 pb-1 sm:pb-2 group-hover:border-white group-hover:tracking-[0.3em] sm:group-hover:tracking-[0.35em] transition-all duration-300">
              Begin Your Journey €47
            </span>
          </button>
        </div>
      </section>

      {/* EDITORIAL QUOTE - Sandra's Voice */}
      <section className="py-16 sm:py-24 lg:py-32 bg-white">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-8 lg:px-16">
          <div className="grid grid-cols-12 gap-4 sm:gap-6 lg:gap-8">
            <div className="col-span-12 lg:col-span-2 lg:col-start-2">
              <div className="h-[1px] w-full bg-gray-200 mb-4 sm:mb-6 lg:mb-8"></div>
              <p className="text-[8px] sm:text-[9px] lg:text-[10px] tracking-[0.4em] sm:tracking-[0.5em] uppercase text-gray-400 text-center lg:text-left">
                The Truth
              </p>
            </div>
            <div className="col-span-12 lg:col-span-7">
              <blockquote className="font-serif text-[clamp(1.5rem,5vw,4.5rem)] leading-[0.95] font-thin text-black text-center lg:text-left px-4 sm:px-0">
                I went from teaching selfies to building the AI that creates them for you. Because real talk? You don't have time for angles or waiting on edits. You need photos now—so your brand can move.
              </blockquote>
              <div className="mt-8 sm:mt-10 lg:mt-12 flex items-center justify-center lg:justify-start gap-4 sm:gap-6">
                <div className="w-12 sm:w-16 lg:w-20 h-[1px] bg-gray-300"></div>
                <p className="text-[8px] sm:text-[9px] lg:text-[10px] tracking-[0.4em] sm:tracking-[0.5em] uppercase text-gray-500">
                  Sandra Sigurjónsdóttir, built from scratch
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* WELCOME EDITORIAL COMPONENT */}
      <WelcomeEditorial />

      {/* FEATURES - Editorial Spread */}
      <section className="py-16 sm:py-24 lg:py-32 bg-black text-white">
        <div className="max-w-[1800px] mx-auto px-4 sm:px-8 lg:px-16">
          <div className="grid grid-cols-12 gap-4 sm:gap-8 mb-12 sm:mb-16 lg:mb-24">
            <div className="col-span-12 lg:col-span-8 lg:col-start-3 text-center lg:text-left">
              <p className="text-[9px] sm:text-[10px] tracking-[0.4em] sm:tracking-[0.5em] uppercase text-white/40 mb-4 sm:mb-6 lg:mb-8">
                The Method
              </p>
              <h2 className="font-serif text-[clamp(2rem,7vw,6rem)] leading-[0.85] font-thin px-4 sm:px-0">
                Turn your selfies into brand photos that sell.<br/>
                <span className="italic text-white/60">Simple. Fast. On your terms.</span>
              </h2>
            </div>
          </div>
          
          {/* Feature Cards - Magazine Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
            {/* AI Photoshoot */}
            <div className="border border-white/10 p-6 sm:p-10 lg:p-16 group hover:bg-white hover:text-black transition-all duration-700">
              <div className="flex justify-between items-start mb-6 sm:mb-8">
                <span className="text-[60px] sm:text-[80px] lg:text-[100px] font-serif font-thin opacity-10 leading-none">01</span>
                <span className="text-[8px] sm:text-[9px] lg:text-[10px] tracking-[0.3em] sm:tracking-[0.4em] uppercase opacity-50 mt-2 sm:mt-4">
                  Feature
                </span>
              </div>
              <h3 className="font-serif text-xl sm:text-2xl lg:text-3xl font-thin mb-4 sm:mb-6 -mt-12 sm:-mt-16 lg:-mt-20">
                AI Photoshoot
              </h3>
              <p className="text-xs sm:text-sm font-light leading-relaxed opacity-70 group-hover:opacity-100">
                Upload 10–20 selfies. Get a full set of images that look professionally shot—without a studio, lights, or stress.
              </p>
            </div>
            
            {/* Maya AI */}
            <div className="border border-white/10 p-6 sm:p-10 lg:p-16 group hover:bg-white hover:text-black transition-all duration-700">
              <div className="flex justify-between items-start mb-6 sm:mb-8">
                <span className="text-[60px] sm:text-[80px] lg:text-[100px] font-serif font-thin opacity-10 leading-none">02</span>
                <span className="text-[8px] sm:text-[9px] lg:text-[10px] tracking-[0.3em] sm:tracking-[0.4em] uppercase opacity-50 mt-2 sm:mt-4">
                  Feature
                </span>
              </div>
              <h3 className="font-serif text-xl sm:text-2xl lg:text-3xl font-thin mb-4 sm:mb-6 -mt-12 sm:-mt-16 lg:-mt-20">
                Maya, your AI stylist
              </h3>
              <p className="text-xs sm:text-sm font-light leading-relaxed opacity-70 group-hover:opacity-100">
                Tell Maya the vibe: "power CEO," "coffee shop founder," "launch day." She styles the shoot and delivers ready-to-post photos.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* PRICING - Editorial Minimalism */}
      <section className="relative py-16 sm:py-24 lg:py-32 bg-white">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-8 lg:px-16">
          <div className="grid grid-cols-12 gap-6 lg:gap-8">
            {/* Left Side - Price Statement */}
            <div className="col-span-12 lg:col-span-5 text-center lg:text-left">
              <div className="lg:sticky lg:top-32">
                <p className="text-[8px] sm:text-[9px] lg:text-[10px] tracking-[0.4em] sm:tracking-[0.5em] uppercase text-gray-400 mb-6 sm:mb-8">
                  Investment
                </p>
                <div className="mb-6 sm:mb-8">
                  <span className="font-serif text-[clamp(4rem,12vw,10rem)] leading-[0.8] font-thin">€47</span>
                  <span className="text-xs sm:text-sm font-light text-gray-500 ml-2 sm:ml-4">per month</span>
                </div>
                <button
                  onClick={() => handleGetStarted()}
                  className="group"
                >
                  <span className="text-[9px] sm:text-[10px] lg:text-[11px] tracking-[0.3em] sm:tracking-[0.4em] uppercase text-black border-b border-gray-300 pb-1 sm:pb-2 group-hover:border-black transition-all duration-300">
                    Start Your Journey
                  </span>
                </button>
              </div>
            </div>
            
            {/* Right Side - Details */}
            <div className="col-span-12 lg:col-span-6 lg:col-start-7 mt-8 lg:mt-0">
              <h3 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-thin mb-8 sm:mb-10 lg:mb-12 text-center lg:text-left">
                Personal Brand<br/>
                <span className="italic text-gray-400">Studio</span>
              </h3>
              
              <div className="space-y-6 sm:space-y-8 mb-8 sm:mb-10 lg:mb-12">
                <div className="flex items-start gap-4 sm:gap-6 group">
                  <span className="text-2xl sm:text-3xl font-thin text-gray-200 group-hover:text-black transition-colors">•</span>
                  <div>
                    <h4 className="text-xs sm:text-sm font-light mb-1 sm:mb-2">Your trained personal AI model</h4>
                    <p className="text-[10px] sm:text-xs text-gray-500">Keeps your look consistent across shoots.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4 sm:gap-6 group">
                  <span className="text-2xl sm:text-3xl font-thin text-gray-200 group-hover:text-black transition-colors">•</span>
                  <div>
                    <h4 className="text-xs sm:text-sm font-light mb-1 sm:mb-2">Up to 100 new photos monthly</h4>
                    <p className="text-[10px] sm:text-xs text-gray-500">Fresh content for socials, site, launches.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4 sm:gap-6 group">
                  <span className="text-2xl sm:text-3xl font-thin text-gray-200 group-hover:text-black transition-colors">•</span>
                  <div>
                    <h4 className="text-xs sm:text-sm font-light mb-1 sm:mb-2">Maya AI stylist access</h4>
                    <p className="text-[10px] sm:text-xs text-gray-500">Describe the vibe—get the set.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4 sm:gap-6 group">
                  <span className="text-2xl sm:text-3xl font-thin text-gray-200 group-hover:text-black transition-colors">•</span>
                  <div>
                    <h4 className="text-xs sm:text-sm font-light mb-1 sm:mb-2">Private brand gallery</h4>
                    <p className="text-[10px] sm:text-xs text-gray-500">Save favorites. Download fast.</p>
                  </div>
                </div>
              </div>
              
              <p className="text-[10px] sm:text-xs text-gray-400 text-center lg:text-left">
                Cancel anytime. Your selfies stay private.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* PORTFOLIO SECTION */}
      <section className="py-16 sm:py-24 lg:py-32 bg-gray-50">
        <div className="max-w-[1800px] mx-auto px-4 sm:px-8 lg:px-16">
          <div className="grid grid-cols-12 gap-4 sm:gap-6 lg:gap-8 mb-12 sm:mb-16 lg:mb-20">
            <div className="col-span-12 lg:col-span-6 lg:col-start-2 text-center lg:text-left">
              <p className="text-[8px] sm:text-[9px] lg:text-[10px] tracking-[0.4em] sm:tracking-[0.5em] uppercase text-gray-400 mb-4 sm:mb-6">
                Portfolio
              </p>
              <h2 className="font-serif text-[clamp(2rem,6vw,5rem)] leading-[0.9] font-thin text-black px-4 sm:px-0">
                Real women. Real brands.<br/>
                <span className="italic">What professional looks like—without the studio.</span>
              </h2>
            </div>
          </div>
          
          <PortfolioSection />
        </div>
      </section>

      {/* TESTIMONIAL - Editorial Style */}
      <section className="py-16 sm:py-24 lg:py-32 bg-gray-50">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-8 lg:px-16">
          <div className="grid grid-cols-12 gap-4 sm:gap-6 lg:gap-8">
            <div className="col-span-12 lg:col-span-8 lg:col-start-3">
              <div className="text-center">
                <p className="text-[8px] sm:text-[9px] lg:text-[10px] tracking-[0.4em] sm:tracking-[0.5em] uppercase text-gray-400 mb-8 sm:mb-10 lg:mb-12">
                  What she said
                </p>
                <blockquote className="font-serif text-[clamp(1.2rem,4vw,3rem)] leading-[1.2] font-thin italic text-gray-900 mb-8 sm:mb-10 lg:mb-12 px-4">
                  "These don't *look* AI. They look like me on my best day, every day. I finally show up online like the woman I'm building into."
                </blockquote>
                <div className="flex items-center justify-center gap-4 sm:gap-6">
                  <div className="w-12 sm:w-16 lg:w-20 h-[1px] bg-gray-300"></div>
                  <p className="text-[8px] sm:text-[9px] lg:text-[10px] tracking-[0.4em] sm:tracking-[0.5em] uppercase text-gray-500">
                    Elena — Coach & Creator
                  </p>
                  <div className="w-12 sm:w-16 lg:w-20 h-[1px] bg-gray-300"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CTA - Sandra's Mission */}
      <section className="relative py-20 sm:py-32 lg:py-40 bg-black text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-[400px] sm:w-[600px] lg:w-[800px] h-[400px] sm:h-[600px] lg:h-[800px] border border-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-[300px] sm:w-[500px] lg:w-[600px] h-[300px] sm:h-[500px] lg:h-[600px] border border-white/10 rounded-full translate-y-1/2 -translate-x-1/2"></div>
        </div>
        
        <div className="relative max-w-[1200px] mx-auto px-4 sm:px-8 lg:px-16 text-center">
          <blockquote className="font-serif text-[clamp(1.8rem,6vw,5rem)] leading-[0.9] font-thin italic mb-8 sm:mb-12 lg:mb-16 px-4">
            "Your phone.<br />
            My system.<br />
            Your next-level brand."
          </blockquote>
          
          <p className="text-sm sm:text-base text-white/60 mb-8 sm:mb-10 lg:mb-12 max-w-lg mx-auto px-4">
            I built the photographer I needed when I was starting from zero. Now she's yours—so you can show up like the CEO version of you.
          </p>
          
          <button
            onClick={() => handleGetStarted()}
            className="border border-white/20 px-8 sm:px-12 lg:px-14 py-4 sm:py-5 lg:py-6 hover:bg-white hover:text-black transition-all duration-700 group"
          >
            <span className="text-[10px] sm:text-[11px] tracking-[0.4em] sm:tracking-[0.5em] uppercase font-light text-white group-hover:text-black transition-colors duration-700">
              Start Today €47
            </span>
          </button>
        </div>
      </section>

      {/* Global Footer */}
      <GlobalFooter />

      {/* Email Capture Modal */}
      <EmailCaptureModal
        isOpen={isEmailModalOpen}
        onClose={() => setIsEmailModalOpen(false)}
        plan={selectedPlan}
        onEmailCaptured={(email) => {
          console.log('Email captured:', email);
          // Email modal will handle redirect to authentication
        }}
      />
    </div>
  );
}
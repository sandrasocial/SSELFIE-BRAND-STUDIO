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
            src="https://sselfie-training-zips.s3.eu-north-1.amazonaws.com/generated-images/undefined/undefined_1756382691095.png"
            alt="Sandra Sigurjónsdóttir - SSELFIE Studio Founder transforming personal branding with AI"
            className="w-full h-full object-cover object-top"
            loading="eager"
          />
        </div>
        
        {/* Hero Content - Positioned Lower */}
        <div className="relative z-10 text-center max-w-6xl px-4 sm:px-6 lg:px-8 pb-16 sm:pb-20 md:pb-24">
          <p className="text-[10px] sm:text-xs uppercase tracking-[0.3em] sm:tracking-[0.4em] text-white/70 mb-4 sm:mb-6 font-light">
            It starts with your selfies.
          </p>
          
          <h1 className="font-serif text-4xl sm:text-6xl md:text-8xl lg:text-9xl xl:text-[10rem] font-extralight text-white tracking-[0.3em] sm:tracking-[0.4em] md:tracking-[0.5em] mb-2 sm:mb-4 leading-none">
            SSELFIE
          </h1>
          
          <p className="text-[10px] sm:text-xs md:text-sm uppercase tracking-[0.3em] sm:tracking-[0.4em] text-white/70 mb-4 sm:mb-6 font-light">
            STUDIO
          </p>
          
          <p className="text-xs sm:text-sm md:text-base text-white/80 mb-8 sm:mb-10 font-light italic">
            Your selfies. My system. Your next-level brand.
          </p>
          
          <button
            onClick={() => handleGetStarted()}
            className="group inline-block"
          >
            <span className="text-[10px] sm:text-xs uppercase tracking-[0.25em] sm:tracking-[0.3em] text-white border-b border-white/30 pb-1 sm:pb-2 group-hover:border-white group-hover:tracking-[0.3em] sm:group-hover:tracking-[0.35em] transition-all duration-300">
              Start My AI Photoshoot – €47
            </span>
          </button>
        </div>
      </section>

      {/* EDITORIAL QUOTE - Sandra's Voice */}
      <section className="py-16 sm:py-24 lg:py-32 bg-white">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-8 lg:px-16">
          <div className="grid grid-cols-12 gap-6 lg:gap-12">
            {/* Left - Image */}
            <div className="col-span-12 lg:col-span-6">
              <div className="relative overflow-hidden bg-gray-100" style={{ aspectRatio: '3/4' }}>
                <img
                  src="https://sselfie-training-zips.s3.eu-north-1.amazonaws.com/generated-images/undefined/undefined_1756240155921.png"
                  alt="Professional brand consistency"
                  className="w-full h-full object-cover object-top transition-transform duration-1000 hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-transparent to-transparent"></div>
              </div>
            </div>
            
            {/* Right - Text */}
            <div className="col-span-12 lg:col-span-6 flex items-center">
              <div className="max-w-lg">
                <p className="text-[8px] sm:text-[10px] tracking-[0.4em] uppercase text-gray-400 mb-6">
                  Real Talk
                </p>
                
                <h2 className="font-serif text-[clamp(2rem,5vw,3.5rem)] font-thin leading-[0.9] mb-8">
                  Can I be real with you for a second?
                </h2>
                
                <div className="space-y-4 text-sm sm:text-base text-gray-800 leading-relaxed">
                  <p>
                    <strong>Your photos are your business card now.</strong> People decide if they trust you based on your Instagram in about 2 seconds.
                  </p>
                  
                  <p>
                    <strong>Consistency literally makes you money.</strong> When your brand looks cohesive everywhere, that's when people pull out their credit card.
                  </p>
                </div>
                
                <div className="mt-8 flex items-center gap-4">
                  <div className="w-12 h-[1px] bg-gray-300"></div>
                  <p className="text-[8px] tracking-[0.4em] uppercase text-gray-500">Sandra</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* WELCOME EDITORIAL COMPONENT */}
      <WelcomeEditorial />

      {/* FEATURES - Editorial Spread Style */}
      <section className="py-16 sm:py-24 lg:py-32 bg-black text-white">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-8 lg:px-16">
          {/* Section Header */}
          <div className="text-center mb-16 sm:mb-20 lg:mb-24">
            <p className="text-[9px] sm:text-[10px] tracking-[0.4em] sm:tracking-[0.5em] uppercase text-white/40 mb-6 sm:mb-8">
              How It Actually Works
            </p>
            <h2 className="font-serif text-[clamp(2rem,6vw,4rem)] leading-[0.85] font-thin">
              Your selfies. My system.<br/>
              <span className="italic text-white/60">Your next-level brand.</span>
            </h2>
          </div>
          
          {/* Step 1 - TRAIN (Image Left, Text Right) */}
          <div className="grid grid-cols-12 gap-8 lg:gap-16 mb-20 lg:mb-32">
            <div className="col-span-12 lg:col-span-6">
              <div className="relative overflow-hidden" style={{ aspectRatio: '3/4' }}>
                <img
                  src="https://sselfie-training-zips.s3.eu-north-1.amazonaws.com/generated-images/42585527/maya_nxsdf9gfxdrma0crzzc87381t0_0_1756639025507.png"
                  alt="Train your AI model with selfies"
                  className="w-full h-full object-cover object-top transition-transform duration-1000 hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent"></div>
                <div className="absolute bottom-6 left-6 right-6">
                  <span className="bg-white/10 backdrop-blur-sm px-3 py-1 text-[8px] tracking-[0.3em] uppercase text-white/90 mb-2 inline-block">
                    Step 1
                  </span>
                  <h3 className="font-serif text-3xl font-thin tracking-[0.2em] text-white">
                    T R A I N
                  </h3>
                </div>
              </div>
            </div>
            
            <div className="col-span-12 lg:col-span-6 flex items-center">
              <div className="max-w-lg">
                <h4 className="font-serif text-2xl sm:text-3xl font-thin mb-6 text-white">
                  Train Your AI Model
                </h4>
                <div className="space-y-4 text-sm sm:text-base text-white/80 leading-relaxed">
                  <p>
                    Upload 10–20 selfies and I'll train your personal AI model to understand your unique features, expressions, and energy.
                  </p>
                  <p className="font-medium text-white">
                    Once. That's it. Your AI twin is ready.
                  </p>
                </div>
                <div className="mt-8 flex items-center gap-4">
                  <div className="w-12 h-[1px] bg-white/30"></div>
                  <p className="text-[8px] tracking-[0.4em] uppercase text-white/50">Model Ready</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Step 2 - STYLE (Text Left, Image Right) */}
          <div className="grid grid-cols-12 gap-8 lg:gap-16 mb-20 lg:mb-32">
            <div className="col-span-12 lg:col-span-6 order-2 lg:order-1 flex items-center">
              <div className="max-w-lg">
                <h4 className="font-serif text-2xl sm:text-3xl font-thin mb-6 text-white">
                  Style with Maya
                </h4>
                <div className="space-y-4 text-sm sm:text-base text-white/80 leading-relaxed">
                  <p>
                    Tell Maya the vibe: "Business," "Travel," "Future Self," "GRWM." She creates the entire photoshoot concept.
                  </p>
                  <p className="font-medium text-white">
                    10+ styled collections ready to generate.
                  </p>
                </div>
                <div className="mt-8 flex items-center gap-4">
                  <div className="w-12 h-[1px] bg-white/30"></div>
                  <p className="text-[8px] tracking-[0.4em] uppercase text-white/50">Maya Ready</p>
                </div>
              </div>
            </div>
            
            <div className="col-span-12 lg:col-span-6 order-1 lg:order-2">
              <div className="relative overflow-hidden" style={{ aspectRatio: '3/4' }}>
                <img
                  src="https://sselfie-training-zips.s3.eu-north-1.amazonaws.com/generated-images/42585527/maya_8r00hax7n1rm80cryjbs9enxam_0_1756450255292.png"
                  alt="Style with Maya AI stylist"
                  className="w-full h-full object-cover object-top transition-transform duration-1000 hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent"></div>
                <div className="absolute bottom-6 left-6 right-6">
                  <span className="bg-white/10 backdrop-blur-sm px-3 py-1 text-[8px] tracking-[0.3em] uppercase text-white/90 mb-2 inline-block">
                    Step 2
                  </span>
                  <h3 className="font-serif text-3xl font-thin tracking-[0.2em] text-white">
                    S T Y L E
                  </h3>
                </div>
              </div>
            </div>
          </div>
          
          {/* Step 3 - GALLERY (Image Left, Text Right) */}
          <div className="grid grid-cols-12 gap-8 lg:gap-16">
            <div className="col-span-12 lg:col-span-6">
              <div className="relative overflow-hidden" style={{ aspectRatio: '3/4' }}>
                <img
                  src="https://sselfie-training-zips.s3.eu-north-1.amazonaws.com/generated-images/42585527/maya_3hj19rf19xrmc0cryyz81tk7pg_0_1756503154230.png"
                  alt="Curate your brand photo gallery"
                  className="w-full h-full object-cover object-top transition-transform duration-1000 hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent"></div>
                <div className="absolute bottom-6 left-6 right-6">
                  <span className="bg-white/10 backdrop-blur-sm px-3 py-1 text-[8px] tracking-[0.3em] uppercase text-white/90 mb-2 inline-block">
                    Step 3
                  </span>
                  <h3 className="font-serif text-3xl font-thin tracking-[0.2em] text-white">
                    G A L L E R Y
                  </h3>
                </div>
              </div>
            </div>
            
            <div className="col-span-12 lg:col-span-6 flex items-center">
              <div className="max-w-lg">
                <h4 className="font-serif text-2xl sm:text-3xl font-thin mb-6 text-white">
                  Curate Your Gallery
                </h4>
                <div className="space-y-4 text-sm sm:text-base text-white/80 leading-relaxed">
                  <p>
                    Download your photos and watch your brand transform. Professional content, every month.
                  </p>
                  <p className="font-medium text-white">
                    Your personal brand photo gallery is ready.
                  </p>
                </div>
                <div className="mt-8 flex items-center gap-4">
                  <div className="w-12 h-[1px] bg-white/30"></div>
                  <p className="text-[8px] tracking-[0.4em] uppercase text-white/50">View Gallery</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PRICING - Editorial Spread Style */}
      <section className="py-16 sm:py-24 lg:py-32 bg-gray-50">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-8 lg:px-16">
          <div className="grid grid-cols-12 gap-8 lg:gap-16">
            {/* Left - Text Content */}
            <div className="col-span-12 lg:col-span-7 flex items-center">
              <div className="max-w-2xl">
                <p className="text-[10px] tracking-[0.4em] uppercase text-gray-400 mb-8">
                  Let's Talk Money
                </p>
                
                <h2 className="font-serif text-[clamp(2rem,5vw,4rem)] font-thin mb-8">
                  €47 a month.
                </h2>
                
                <div className="space-y-6 text-base sm:text-lg text-gray-800 leading-relaxed">
                  <p>
                    <strong>That's less than one dinner out.</strong> Less than one photographer session that you'd use once.
                  </p>
                  
                  <p>
                    For unlimited professional photos, every month, that actually look like <strong>you</strong>.
                  </p>
                  
                  <p className="text-sm text-gray-600 italic">
                    Your competitors are booking clients with their stunning feeds while you're debating whether AI photos are "authentic enough."
                  </p>
                </div>
                
                <div className="mt-10">
                  <button 
                    onClick={() => handleGetStarted()}
                    className="bg-black text-white px-12 py-4 text-xs tracking-[0.3em] uppercase hover:bg-gray-800 transition-colors"
                  >
                    I'm Ready - €47
                  </button>
                </div>
                
                <div className="mt-8 flex items-center gap-4">
                  <div className="w-12 h-[1px] bg-gray-300"></div>
                  <p className="text-[8px] tracking-[0.4em] uppercase text-gray-500">Launch Special</p>
                </div>
              </div>
            </div>
            
            {/* Right - Visual Content */}
            <div className="col-span-12 lg:col-span-5">
              <div className="relative overflow-hidden" style={{ aspectRatio: '3/4' }}>
                <img
                  src="https://sselfie-training-zips.s3.eu-north-1.amazonaws.com/generated-images/42585527/maya_rr4fnv2rb5rm80crzyd87jm48g_0_1756634973175.png"
                  alt="Professional brand transformation results"
                  className="w-full h-full object-cover object-top transition-transform duration-1000 hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
                <div className="absolute bottom-6 left-6 right-6">
                  <p className="text-[8px] sm:text-[10px] tracking-[0.4em] uppercase text-white/80 mb-2">
                    Your Investment
                  </p>
                  <p className="text-white text-sm sm:text-base font-light">
                    In the woman you're becoming
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>



      {/* SANDRA'S STORY - The Real Origin */}
      <section className="py-16 sm:py-24 lg:py-32 bg-white">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-8 lg:px-16">
          <div className="grid grid-cols-12 gap-8 lg:gap-16">
            {/* Left - Story Content */}
            <div className="col-span-12 lg:col-span-7 order-2 lg:order-1">
              <div className="max-w-2xl">
                <p className="text-[8px] sm:text-[9px] lg:text-[10px] tracking-[0.4em] sm:tracking-[0.5em] uppercase text-gray-400 mb-6 sm:mb-8">
                  What Actually Happened
                </p>
                
                <h2 className="font-serif text-[clamp(2rem,5vw,4rem)] font-thin leading-[0.9] mb-8 sm:mb-12">
                  How the selfie machine was born
                </h2>
                
                <div className="space-y-6 text-sm sm:text-base leading-relaxed text-gray-800">
                  <p>
                    I had <strong>$12 in my bank account</strong>, trying to build a business from my kitchen table while the kids watched Netflix.
                  </p>
                  
                  <p>
                    I knew I needed my personal brand to show both my story and my personality — but in a <strong>WOW way.</strong>
                  </p>
                  
                  <p>
                    Hiring a brand photoshoot? Not something I could afford. So I started taking my own photos with my iPhone.
                  </p>
                  
                  <p>
                    When I started getting DMs asking <em>"how do I take my photos?"</em> I began teaching selfies on Instagram.
                  </p>
                  
                  <p>
                    All of a sudden it became my niche. Taking good photos to showcase your personal brand consistently online? <strong>That's a skill.</strong>
                  </p>
                  
                  <p>
                    That's when I thought... <em>maybe I can create a selfie machine?</em>
                  </p>
                  
                  <p className="font-medium text-black text-lg">
                    So I did. <span className="text-sm text-gray-600">(Thanks, ADHD.)</span>
                  </p>
                </div>
                
                <div className="mt-12 sm:mt-16">
                  <div className="inline-flex items-center gap-4 sm:gap-6">
                    <div className="w-12 sm:w-16 lg:w-20 h-[1px] bg-gray-300"></div>
                    <p className="text-[8px] sm:text-[9px] lg:text-[10px] tracking-[0.4em] sm:tracking-[0.5em] uppercase text-gray-500">
                      From $12 → 120K followers → Your AI photographer
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Right - Hero Image */}
            <div className="col-span-12 lg:col-span-5 order-1 lg:order-2">
              <div className="relative overflow-hidden" style={{ aspectRatio: '3/4' }}>
                <img
                  src="https://sselfie-training-zips.s3.eu-north-1.amazonaws.com/generated-images/42585527/maya_g826ygf2d9rm80crzjkvnvmpyr_0_1756585536824.png"
                  alt="Sandra building SSELFIE - from kitchen table to AI revolution"
                  className="w-full h-full object-cover object-top transition-transform duration-1000 hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent"></div>
                <div className="absolute bottom-6 left-6 right-6">
                  <p className="text-[8px] sm:text-[10px] tracking-[0.4em] sm:tracking-[0.5em] uppercase text-white/80 mb-2">
                    The Beginning
                  </p>
                  <p className="text-white text-sm sm:text-base font-light">
                    Building something from nothing
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CTA - Sandra's Promise */}
      <section className="relative py-20 sm:py-32 lg:py-40 bg-black text-white overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <img
            src="https://sselfie-training-zips.s3.eu-north-1.amazonaws.com/generated-images/undefined/undefined_1756382691095.png"
            alt="Transform your brand"
            className="w-full h-full object-cover object-top"
          />
        </div>
        
        <div className="relative max-w-[1200px] mx-auto px-4 sm:px-8 lg:px-16 text-center">
          <p className="text-[8px] sm:text-[9px] lg:text-[10px] tracking-[0.4em] sm:tracking-[0.5em] uppercase text-white/40 mb-8">
            The Real Promise
          </p>
          
          <blockquote className="font-serif text-[clamp(1.8rem,6vw,4rem)] leading-[0.9] font-thin mb-8 sm:mb-12 lg:mb-16 px-4">
            Look, this isn't about perfect photos.<br/>
            It's about finally looking like<br/>
            the woman you're becoming.
          </blockquote>
          
          <div className="max-w-2xl mx-auto mb-8 sm:mb-12">
            <p className="text-sm sm:text-base text-white/70 leading-relaxed mb-6">
              The woman you're becoming doesn't wait for the "perfect" moment, the right photographer, or permission to be visible.
            </p>
            <p className="text-base sm:text-lg text-white font-medium">
              She just needs her selfies and my system.
            </p>
          </div>
          
          <div className="border border-white/20 inline-block">
            <button
              onClick={() => handleGetStarted()}
              className="px-12 sm:px-16 py-5 sm:py-6 hover:bg-white hover:text-black transition-all duration-700 group"
            >
              <span className="text-[10px] sm:text-[11px] tracking-[0.4em] sm:tracking-[0.5em] uppercase font-light">
                Build Your Empire — €47
              </span>
              <div className="text-[8px] tracking-[0.3em] uppercase text-white/50 group-hover:text-black/50 mt-2">
                Your mess is your message
              </div>
            </button>
          </div>
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
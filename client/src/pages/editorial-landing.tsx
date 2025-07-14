import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { SandraImages } from "@/lib/sandra-images";
import { PortfolioSection } from "@/components/portfolio-section";
import FreeTierSignup from "@/components/free-tier-signup";
import WelcomeEditorial from "@/components/welcome-editorial";

export default function EditorialLanding() {
  // SEO Meta Tags
  useEffect(() => {
    document.title = "SSELFIE Studio - AI-Powered Personal Brand Photos & Business Launch";
    
    // Update or create meta description
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.setAttribute('name', 'description');
      document.head.appendChild(metaDescription);
    }
    metaDescription.setAttribute('content', 'Transform your selfies into professional brand photos with AI. Get 5 free images, build your personal brand, and launch your business in 20 minutes. Start free today.');
    
    // Add Open Graph tags
    const ogTags = [
      { property: 'og:title', content: 'SSELFIE Studio - Transform Selfies into Professional Brand Photos' },
      { property: 'og:description', content: 'AI-powered personal branding platform. Transform selfies into professional photos and launch your business in 20 minutes.' },
      { property: 'og:type', content: 'website' },
      { property: 'og:url', content: window.location.href },
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: 'SSELFIE Studio - AI Brand Photos' },
      { name: 'twitter:description', content: 'Transform your selfies into professional brand photos with AI. Start free today.' }
    ];
    
    ogTags.forEach(tag => {
      let existingTag = document.querySelector(`meta[${tag.property ? 'property' : 'name'}="${tag.property || tag.name}"]`);
      if (!existingTag) {
        existingTag = document.createElement('meta');
        existingTag.setAttribute(tag.property ? 'property' : 'name', tag.property || tag.name);
        document.head.appendChild(existingTag);
      }
      existingTag.setAttribute('content', tag.content);
    });
  }, []);
  const [, setLocation] = useLocation();
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

  const handleGetStarted = (plan: string) => {
    localStorage.setItem('selectedPlan', plan);
    if (plan === 'free') {
      // Route to login for free tier
      window.location.href = '/api/login';
    } else {
      // Route to checkout for paid plans
      setLocation('/checkout');
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
                onClick={() => window.location.href = '/api/login'}
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
              onClick={() => handleGetStarted('sselfie-studio')}
              className="hidden md:block px-6 py-3 border border-white/50 text-white text-xs uppercase tracking-[0.3em] hover:bg-white hover:text-black transition-all duration-300"
            >
              Get Started
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
              onClick={() => { window.location.href = '/api/login'; setMobileMenuOpen(false); }}
              className="text-sm uppercase tracking-[0.4em] text-white/80 hover:text-white transition-all duration-300"
            >
              Login
            </button>
            <button
              onClick={() => { handleGetStarted('sselfie-studio'); setMobileMenuOpen(false); }}
              className="px-8 py-4 border border-white/50 text-white text-xs uppercase tracking-[0.3em] hover:bg-white hover:text-black transition-all duration-300 mt-8"
            >
              Get Started
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
            alt="Sandra"
            className="w-full h-full object-cover"
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

      {/* Welcome Section - Editorial Style */}
      <WelcomeEditorial />

      {/* Features Section - Editorial Grid */}
      <section className="py-16 sm:py-24 md:py-32 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16 md:mb-20">
            <div className="text-xs uppercase tracking-[0.4em] text-gray-500 mb-6 sm:mb-8">
              What I Do
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-light text-black mb-6 sm:mb-8 px-4">
              Your complete<br />personal brand transformation
            </h2>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {/* AI Photoshoot */}
            <div className="bg-white group hover:bg-black hover:text-white transition-all duration-500">
              <div className="aspect-square bg-gray-100 overflow-hidden relative">
                <img
                  src={SandraImages.portraits.professional[0]}
                  alt="AI Photoshoot"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-8">
                  <div className="text-white">
                    <h4 className="text-xs uppercase tracking-[0.3em] mb-2">AI Photoshoot</h4>
                    <p className="text-sm opacity-80">Professional brand photos from your selfies</p>
                  </div>
                </div>
              </div>
              <div className="p-6 sm:p-8">
                <div className="text-6xl sm:text-8xl font-serif font-extralight opacity-10 absolute">01</div>
                <h3 className="font-serif text-xl sm:text-2xl font-light mb-3 sm:mb-4 relative z-10">AI Photoshoot</h3>
                <p className="text-sm text-gray-600 group-hover:text-white/80 leading-relaxed">
                  Upload your phone selfies, get photos that look like you hired a fancy photographer. No studio required.
                </p>
              </div>
            </div>

            {/* Luxury Flatlays */}
            <div className="bg-white group hover:bg-black hover:text-white transition-all duration-500">
              <div className="aspect-square bg-gray-100 overflow-hidden relative">
                <img
                  src={SandraImages.flatlays.workspace1}
                  alt="Luxury Flatlays"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-8">
                  <div className="text-white">
                    <h4 className="text-xs uppercase tracking-[0.3em] mb-2">Luxury Flatlays</h4>
                    <p className="text-sm opacity-80">Curated luxury lifestyle collections</p>
                  </div>
                </div>
              </div>
              <div className="p-6 sm:p-8">
                <div className="text-6xl sm:text-8xl font-serif font-extralight opacity-10 absolute">02</div>
                <h3 className="font-serif text-xl sm:text-2xl font-light mb-3 sm:mb-4 relative z-10">Luxury Flatlays</h3>
                <p className="text-sm text-gray-600 group-hover:text-white/80 leading-relaxed">
                  Gorgeous flatlay collections that make your brand look expensive. Perfect for when you need content but don't have time to style it yourself.
                </p>
              </div>
            </div>

            {/* Sandra's AI Agents */}
            <div className="bg-white group hover:bg-black hover:text-white transition-all duration-500">
              <div className="aspect-square bg-gray-100 overflow-hidden relative">
                <img
                  src={SandraImages.hero.agents}
                  alt="Sandra's AI Agents"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-8">
                  <div className="text-white">
                    <h4 className="text-xs uppercase tracking-[0.3em] mb-2">Sandra's Agents</h4>
                    <p className="text-sm opacity-80">Meet Victoria and Maya</p>
                  </div>
                </div>
              </div>
              <div className="p-6 sm:p-8">
                <div className="text-6xl sm:text-8xl font-serif font-extralight opacity-10 absolute">03</div>
                <h3 className="font-serif text-xl sm:text-2xl font-light mb-3 sm:mb-4 relative z-10">Sandra's Agents</h3>
                <p className="text-sm text-gray-600 group-hover:text-white/80 leading-relaxed">
                  You get my trained AI agents Victoria and Maya. Victoria handles your brand strategy, Maya's your celebrity stylist. Like having my whole team in your pocket.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section - Editorial Layout */}
      <section className="py-16 sm:py-24 md:py-32 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16 md:mb-20">
            <div className="text-xs uppercase tracking-[0.4em] text-gray-500 mb-6 sm:mb-8">
              Choose Your Journey
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-light text-black px-4">
              Simple. Powerful.
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8 sm:gap-10 md:gap-12">
            {/* FREE PLAN */}
            <div className="bg-gray-50 p-8 sm:p-10 md:p-12 text-center group hover:bg-black hover:text-white transition-all duration-500">
              <h3 className="font-serif text-2xl sm:text-3xl font-light mb-4 sm:mb-6">Start Free</h3>
              <div className="text-3xl sm:text-4xl md:text-5xl font-light mb-6 sm:mb-8">FREE<span className="text-sm sm:text-base md:text-lg text-gray-500 group-hover:text-white/60"> forever</span></div>
              
              <div className="space-y-3 sm:space-y-4 mb-8 sm:mb-10 md:mb-12 text-left">
                <div className="flex items-start">
                  <span className="text-black group-hover:text-white mr-3">•</span>
                  <span className="text-sm">5 AI images per month</span>
                </div>
                <div className="flex items-start">
                  <span className="text-black group-hover:text-white mr-3">•</span>
                  <span className="text-sm">Maya AI photographer chat</span>
                </div>
                <div className="flex items-start">
                  <span className="text-black group-hover:text-white mr-3">•</span>
                  <span className="text-sm">Victoria AI brand strategist chat</span>
                </div>
                <div className="flex items-start">
                  <span className="text-black group-hover:text-white mr-3">•</span>
                  <span className="text-sm">Basic luxury flatlay collections</span>
                </div>
              </div>
              
              <button
                onClick={() => handleGetStarted('free')}
                className="w-full py-4 border border-black group-hover:border-white text-black group-hover:text-white text-xs uppercase tracking-[0.3em] hover:bg-black hover:text-white group-hover:hover:bg-white group-hover:hover:text-black transition-all duration-300"
              >
                Start Free Today
              </button>
            </div>

            {/* SSELFIE STUDIO PAID */}
            <div className="bg-black text-white p-8 sm:p-10 md:p-12 text-center relative">
              <div className="absolute -top-3 sm:-top-4 left-1/2 transform -translate-x-1/2">
                <div className="bg-white text-black px-4 sm:px-6 py-1 sm:py-2 text-xs uppercase tracking-[0.3em]">
                  Most Popular
                </div>
              </div>
              
              <h3 className="font-serif text-2xl sm:text-3xl font-light mb-4 sm:mb-6">SSELFIE Studio</h3>
              <div className="text-3xl sm:text-4xl md:text-5xl font-light mb-6 sm:mb-8">$47<span className="text-sm sm:text-base md:text-lg text-gray-400">/month</span></div>
              
              <div className="space-y-3 sm:space-y-4 mb-8 sm:mb-10 md:mb-12 text-left">
                <div className="flex items-start">
                  <span className="text-white mr-3">•</span>
                  <span className="text-sm">100 AI images per month</span>
                </div>
                <div className="flex items-start">
                  <span className="text-white mr-3">•</span>
                  <span className="text-sm">Full luxury flatlay collections</span>
                </div>
                <div className="flex items-start">
                  <span className="text-white mr-3">•</span>
                  <span className="text-sm">Maya & Victoria AI agents</span>
                </div>
                <div className="flex items-start">
                  <span className="text-white mr-3">•</span>
                  <span className="text-sm">Brand templates & landing pages</span>
                </div>
                <div className="flex items-start">
                  <span className="text-white mr-3">•</span>
                  <span className="text-sm">Custom domain connection</span>
                </div>
                <div className="flex items-start">
                  <span className="text-white mr-3">•</span>
                  <span className="text-sm">Priority support</span>
                </div>
              </div>
              
              <button
                onClick={() => handleGetStarted('sselfie-studio')}
                className="w-full py-4 border border-white text-white text-xs uppercase tracking-[0.3em] hover:bg-white hover:text-black transition-all duration-300"
              >
                Start Studio $47/mo
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

      {/* Portfolio Gallery Section */}
      <section className="py-16 sm:py-24 md:py-32 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16 md:mb-20">
            <div className="text-xs uppercase tracking-[0.4em] text-gray-500 mb-6 sm:mb-8">
              My AI Portfolio
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-light text-black px-4">
              Real results from<br />my personal brand
            </h2>
          </div>
          
          <PortfolioSection />
        </div>
      </section>

      {/* Testimonial Section */}
      <section className="py-16 sm:py-24 md:py-32 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="text-xs uppercase tracking-[0.4em] text-gray-500 mb-6 sm:mb-8">
            Real Stories
          </div>
          
          <blockquote className="font-serif text-xl sm:text-2xl md:text-3xl font-light italic text-black leading-tight mb-6 sm:mb-8 px-4">
            "I thought I knew what I was doing, but Sandra's system completely changed how I show up online. 
            The AI photos don't look AI - they look like me, but the version of me I've always wanted to be."
          </blockquote>
          
          <div className="text-sm text-gray-600 uppercase tracking-wide">
            — ELENA M., LIFE COACH
          </div>
        </div>
      </section>

      {/* Free Tier Signup Component */}
      <FreeTierSignup />

      {/* Quote Section - Editorial */}
      <section className="py-32 bg-black text-white text-center">
        <div className="max-w-4xl mx-auto px-8">
          <blockquote className="font-serif text-3xl md:text-4xl lg:text-5xl font-light italic leading-tight mb-12">
            "When you show up as her?<br />
            Everything changes."
          </blockquote>
          
          <button
            onClick={() => handleGetStarted('free')}
            className="inline-block px-12 py-6 border border-white text-white text-xs uppercase tracking-[0.3em] hover:bg-white hover:text-black transition-all duration-300 mr-4"
          >
            Start Free Today
          </button>
          <button
            onClick={() => handleGetStarted('sselfie-studio')}
            className="inline-block px-12 py-6 bg-white text-black text-xs uppercase tracking-[0.3em] hover:bg-gray-100 transition-all duration-300"
          >
            Get Studio $47/mo
          </button>
        </div>
      </section>
    </div>
  );
}
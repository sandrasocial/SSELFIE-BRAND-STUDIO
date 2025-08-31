import React, { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { SandraImages } from "../lib/sandra-images";
import { EmailCaptureModal } from "../components/email-capture-modal";
import { GlobalFooter } from "../components/global-footer";
import { useToast } from "../hooks/use-toast";

export default function PricingEditorial() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  // SEO Meta Tags and Performance Optimization
  useEffect(() => {
    document.title = "Personal Brand Studio €47/month - AI Personal Branding Platform | SSELFIE Studio";
    
    // Update or create meta description with rich keywords
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.setAttribute('name', 'description');
      document.head.appendChild(metaDescription);
    }
    metaDescription.setAttribute('content', 'Transform selfies into professional brand photos with AI. Personal Brand Studio €47/month - Your trained AI model, 100 monthly professional photos, Maya AI photographer.');
    
    // Add comprehensive SEO meta tags
    const seoTags = [
      { name: 'keywords', content: 'AI personal branding pricing, AI photographer subscription, professional headshots AI cost, personal brand studio pricing, selfie to professional photos subscription, AI brand strategist pricing, business launch platform cost' },
      { property: 'og:title', content: 'Personal Brand Studio €47/month | SSELFIE Studio' },
      { property: 'og:description', content: 'Transform selfies into professional brand photos with AI. Personal Brand Studio €47/month - Your trained AI model, 100 monthly professional photos, Maya AI photographer.' },
      { property: 'og:type', content: 'website' },
      { property: 'og:url', content: window.location.href },
      { property: 'og:site_name', content: 'SSELFIE Studio' },
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: 'Personal Brand Studio €47/month | SSELFIE Studio' },
      { name: 'twitter:description', content: 'Transform selfies into professional brand photos with AI. Personal Brand Studio €47/month - Never pay for another photoshoot.' },
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
      "@type": ["WebPage", "PricingPage"],
      "name": "SSELFIE Studio Pricing",
      "description": "AI-powered personal branding platform pricing. Transform selfies into professional business photos for €47/month.",
      "url": window.location.href,
      "author": {
        "@type": "Person",
        "name": "Sandra Sigurjónsdóttir",
        "url": "https://instagram.com/sandra.social"
      },
      "offers": {
        "@type": "Offer",
        "name": "Personal Brand Studio",
        "description": "Your trained personal AI model + 100 monthly professional photos + Maya AI photographer access + personal brand photo gallery",
        "price": "47",
        "priceCurrency": "EUR",
        "availability": "https://schema.org/InStock",
        "url": "https://sselfie.ai/simple-checkout"
      }
    };

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(structuredData);
    document.head.appendChild(script);

    return () => {
      const existingScript = document.querySelector('script[type="application/ld+json"]');
      if (existingScript) {
        document.head.removeChild(existingScript);
      }
    };
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
    <div className="min-h-screen bg-white">
      {/* Editorial Navigation - Same as Landing Page */}
      <nav className="fixed top-0 w-full z-50 bg-black text-white">
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
                className="text-xs uppercase tracking-[0.4em] text-white border-b border-white/50 pb-1"
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
              className="text-sm uppercase tracking-[0.4em] text-white border-b border-white/50 pb-1"
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

      {/* Hero Section - Editorial Style */}
      <section className="relative min-h-screen flex items-center justify-center bg-black text-white overflow-hidden">
        <div className="absolute inset-0 opacity-30">
          <img
            src={SandraImages.editorial.thinking}
            alt="Sandra Sigurjónsdóttir - SSELFIE Studio Personal Brand Investment"
            className="w-full h-full object-cover object-center"
            loading="eager"
            fetchpriority="high"
          />
        </div>
        
        <div className="relative z-10 text-center max-w-6xl px-4 sm:px-6 lg:px-8">
          <p className="text-[10px] sm:text-xs uppercase tracking-[0.3em] sm:tracking-[0.4em] text-white/70 mb-4 sm:mb-6 font-light">
            INVESTMENT IN THE WOMAN YOU'RE BECOMING
          </p>
          
          <h1 className="font-serif text-4xl sm:text-6xl md:text-8xl lg:text-9xl xl:text-[8rem] font-extralight text-white tracking-[0.3em] sm:tracking-[0.4em] md:tracking-[0.5em] mb-8 sm:mb-12 leading-none">
            €47
          </h1>
          
          <p className="text-sm sm:text-base md:text-lg uppercase tracking-[0.3em] sm:tracking-[0.4em] text-white/80 mb-8 sm:mb-12 font-light max-w-2xl mx-auto leading-relaxed">
            Personal Brand Studio<br className="hidden sm:block" />
            <span className="sm:hidden"> </span>Monthly Subscription
          </p>
          
          <button
            onClick={() => handleGetStarted()}
            className="group inline-block"
          >
            <span className="text-[10px] sm:text-xs uppercase tracking-[0.25em] sm:tracking-[0.3em] text-white border-b border-white/30 pb-1 sm:pb-2 group-hover:border-white group-hover:tracking-[0.3em] sm:group-hover:tracking-[0.35em] transition-all duration-300">
              Start Your Journey
            </span>
          </button>
        </div>
      </section>

      {/* What's Included - Editorial Style */}
      <section className="py-20 sm:py-32 lg:py-40 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 sm:mb-24">
            <p className="text-[10px] sm:text-xs uppercase tracking-[0.3em] sm:tracking-[0.4em] text-gray-500 mb-6 sm:mb-8 font-light">
              WHAT'S INCLUDED
            </p>
            
            <h2 className="font-serif text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-extralight text-black tracking-[0.2em] sm:tracking-[0.3em] mb-8 sm:mb-12 leading-tight">
              <span className="block">Your</span>
              <span className="block ml-8 sm:ml-16">Complete</span>
              <span className="block ml-16 sm:ml-32"><em>Studio</em></span>
            </h2>
          </div>

          {/* Features Grid - Editorial Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 mb-20">
            {/* Feature 1 */}
            <div className="text-center lg:text-left">
              <div className="text-[10px] uppercase tracking-[0.4em] text-gray-400 mb-4">01</div>
              <h3 className="font-serif text-2xl sm:text-3xl font-light text-black mb-6 leading-tight">
                Your Trained<br />Personal AI Model
              </h3>
              <p className="text-base sm:text-lg text-gray-600 font-light leading-relaxed">
                Upload 10-15 selfies and get a custom AI model trained specifically on you. 
                It learns your features, angles, and style preferences to create authentic photos.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="text-center lg:text-right">
              <div className="text-[10px] uppercase tracking-[0.4em] text-gray-400 mb-4">02</div>
              <h3 className="font-serif text-2xl sm:text-3xl font-light text-black mb-6 leading-tight">
                100 Monthly<br />Professional Photos
              </h3>
              <p className="text-base sm:text-lg text-gray-600 font-light leading-relaxed">
                Generate unlimited variations until you get the perfect shot. 
                Fresh content every month for all your personal branding needs.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="text-center lg:text-left">
              <div className="text-[10px] uppercase tracking-[0.4em] text-gray-400 mb-4">03</div>
              <h3 className="font-serif text-2xl sm:text-3xl font-light text-black mb-6 leading-tight">
                Maya AI<br />Photographer Access
              </h3>
              <p className="text-base sm:text-lg text-gray-600 font-light leading-relaxed">
                Your personal AI stylist who knows exactly how to position you, 
                what lighting works best, and how to create editorial-quality results.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="text-center lg:text-right">
              <div className="text-[10px] uppercase tracking-[0.4em] text-gray-400 mb-4">04</div>
              <h3 className="font-serif text-2xl sm:text-3xl font-light text-black mb-6 leading-tight">
                Personal Brand<br />Photo Gallery
              </h3>
              <p className="text-base sm:text-lg text-gray-600 font-light leading-relaxed">
                Organize and access all your professional photos in one place. 
                Download in high resolution for all your marketing needs.
              </p>
            </div>
          </div>

          {/* CTA Section */}
          <div className="text-center">
            <div className="w-32 h-px bg-gray-300 mx-auto mb-12"></div>
            <button
              onClick={() => handleGetStarted()}
              className="inline-block px-12 py-4 border border-black text-black text-xs uppercase tracking-[0.3em] hover:bg-black hover:text-white transition-all duration-300"
            >
              Start Personal Brand Studio
            </button>
            <p className="text-sm text-gray-500 mt-6 font-light">
              Cancel anytime. No long-term commitment.
            </p>
          </div>
        </div>
      </section>

      {/* Success Stories - Editorial Quote Section */}
      <section className="py-20 sm:py-32 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <blockquote className="font-serif text-2xl sm:text-3xl md:text-4xl font-light italic text-black leading-tight mb-8">
            "I went from hiding behind my phone<br className="hidden sm:block" />
            <span className="sm:hidden"> </span>to building a 6-figure business<br className="hidden sm:block" />
            <span className="sm:hidden"> </span>in 90 days."
          </blockquote>
          <cite className="text-[10px] sm:text-xs uppercase tracking-[0.4em] text-gray-500 font-light">
            — Sandra's Story
          </cite>
        </div>
      </section>

      {/* FAQ Section - Editorial Style */}
      <section className="py-20 sm:py-32 lg:py-40 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 sm:mb-24">
            <p className="text-[10px] sm:text-xs uppercase tracking-[0.3em] sm:tracking-[0.4em] text-gray-500 mb-6 sm:mb-8 font-light">
              FREQUENTLY ASKED
            </p>
            
            <h2 className="font-serif text-3xl sm:text-5xl md:text-6xl font-extralight text-black tracking-[0.2em] sm:tracking-[0.3em] mb-8 sm:mb-12 leading-tight">
              Questions
            </h2>
          </div>

          <div className="space-y-12 sm:space-y-16 max-w-4xl mx-auto">
            {/* FAQ Item 1 */}
            <div className="border-b border-gray-200 pb-8">
              <h3 className="font-serif text-xl sm:text-2xl font-light text-black mb-4 leading-tight">
                How does the AI work?
              </h3>
              <p className="text-base sm:text-lg text-gray-600 font-light leading-relaxed">
                Upload 10-15 selfies, and our custom-trained AI model creates editorial-quality images 
                that look authentically like you. It's trained specifically for women's personal branding 
                and understands lighting, angles, and professional styling.
              </p>
            </div>

            {/* FAQ Item 2 */}
            <div className="border-b border-gray-200 pb-8">
              <h3 className="font-serif text-xl sm:text-2xl font-light text-black mb-4 leading-tight">
                Who is Maya AI?
              </h3>
              <p className="text-base sm:text-lg text-gray-600 font-light leading-relaxed">
                Maya is your personal AI photographer who creates professional brand photos from your selfies. 
                She knows exactly how to style you and generate photos that look like you hired a professional photographer.
              </p>
            </div>

            {/* FAQ Item 3 */}
            <div className="border-b border-gray-200 pb-8">
              <h3 className="font-serif text-xl sm:text-2xl font-light text-black mb-4 leading-tight">
                What if I'm not satisfied?
              </h3>
              <p className="text-base sm:text-lg text-gray-600 font-light leading-relaxed">
                You can cancel anytime. No long-term commitment required. 
                We're confident you'll love your professional AI photos, but if not, you can stop your subscription at any time.
              </p>
            </div>

            {/* FAQ Item 4 */}
            <div className="pb-8">
              <h3 className="font-serif text-xl sm:text-2xl font-light text-black mb-4 leading-tight">
                How quickly can I start generating photos?
              </h3>
              <p className="text-base sm:text-lg text-gray-600 font-light leading-relaxed">
                Once you upload your selfies, your personal AI model trains for 24-48 hours. 
                After that, you can generate professional photos instantly with Maya's help.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA - Editorial Style */}
      <section className="relative min-h-[60vh] flex items-center justify-center bg-black text-white overflow-hidden">
        <div className="absolute inset-0 opacity-40">
          <img
            src={SandraImages.editorial.laughing}
            alt="Start your personal brand transformation"
            className="w-full h-full object-cover object-center"
          />
        </div>
        
        <div className="relative z-10 text-center max-w-4xl px-4 sm:px-6 lg:px-8">
          <h2 className="font-serif text-3xl sm:text-5xl md:text-6xl font-extralight text-white tracking-[0.2em] sm:tracking-[0.3em] mb-8 sm:mb-12 leading-tight">
            <span className="block">Ready to</span>
            <span className="block ml-8 sm:ml-16">Stop Hiding?</span>
          </h2>
          
          <button
            onClick={() => handleGetStarted()}
            className="group inline-block"
          >
            <span className="text-[10px] sm:text-xs uppercase tracking-[0.25em] sm:tracking-[0.3em] text-white border-b border-white/30 pb-1 sm:pb-2 group-hover:border-white group-hover:tracking-[0.3em] sm:group-hover:tracking-[0.35em] transition-all duration-300">
              Start Personal Brand Studio €47
            </span>
          </button>
        </div>
      </section>

      {/* Email Capture Modal */}
      <EmailCaptureModal 
        isOpen={isEmailModalOpen}
        onClose={() => setIsEmailModalOpen(false)}
        plan="personal-brand-studio"
      />

      {/* Global Footer */}
      <GlobalFooter />
    </div>
  );
};
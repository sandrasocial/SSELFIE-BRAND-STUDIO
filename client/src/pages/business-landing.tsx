import React, { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { GlobalFooter } from "../components/global-footer";
import { useStackApp } from "@stackframe/stack";
import { STACK_PROJECT_ID, STACK_PUBLISHABLE_CLIENT_KEY } from "../env";

export default function BusinessLanding() {
  const [, setLocation] = useLocation();
  // Safely use Stack Auth hook with error handling for when outside provider
  let app;
  try {
    app = useStackApp();
  } catch (error) {
    // This is fine - component can work without Stack Auth for public pages
    app = null;
  }

  // Comprehensive SEO Meta Tags
  useEffect(() => {
    // Primary SEO tags
    document.title = "AI Professional Photos From Selfies €47/month | SSELFIE Studio";

    const metaTags = [
      { name: 'description', content: 'Transform your selfies into professional AI photos for €47/month. Get LinkedIn headshots, business portraits & brand photos instantly. No photoshoot needed - just upload selfies, get 100 monthly professional photos. Start your AI transformation today.' },
      { name: 'keywords', content: 'AI professional photos, selfies to headshots, AI headshots €47, LinkedIn profile photos, business portraits AI, professional photos from selfies, AI photographer, personal branding photos, business headshots, social media photos AI, professional selfie transformation, AI photo generation, headshot photography AI' },
      { name: 'author', content: 'SSELFIE Studio' },
      { name: 'robots', content: 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1.0, viewport-fit=cover' },
      { name: 'theme-color', content: '#000000' },
      { name: 'msapplication-TileColor', content: '#000000' },

      // Open Graph tags for social sharing
      { property: 'og:title', content: 'AI Professional Photos From Selfies €47/month | SSELFIE Studio' },
      { property: 'og:description', content: 'Transform your selfies into professional AI photos for €47/month. Get LinkedIn headshots, business portraits & brand photos instantly. No photoshoot needed.' },
      { property: 'og:type', content: 'website' },
      { property: 'og:url', content: 'https://sselfie.ai/business' },
      { property: 'og:image', content: 'https://sselfie.ai/og-business.jpg' },
      { property: 'og:image:width', content: '1200' },
      { property: 'og:image:height', content: '630' },
      { property: 'og:image:alt', content: 'Professional AI-generated photos from selfies for personal branding' },
      { property: 'og:site_name', content: 'SSELFIE Studio' },
      { property: 'og:locale', content: 'en_US' },

      // Twitter Card tags
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: 'AI Professional Photos From Selfies €47/month' },
      { name: 'twitter:description', content: 'Transform your selfies into professional AI photos for €47/month. Get LinkedIn headshots & business portraits instantly. No photoshoot needed.' },
      { name: 'twitter:image', content: 'https://sselfie.ai/twitter-business.jpg' },
      { name: 'twitter:image:alt', content: 'Professional AI-generated photos from selfies' },

      // Enhanced SEO and Performance tags  
      { name: 'format-detection', content: 'telephone=no' },
      { name: 'google-site-verification', content: '' }, // Add verification when available
      { name: 'language', content: 'en' },
      { name: 'revisit-after', content: '7 days' },
      { name: 'rating', content: 'general' },
      { name: 'apple-mobile-web-app-capable', content: 'yes' },
      { name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' },
      { name: 'mobile-web-app-capable', content: 'yes' },
      { name: 'HandheldFriendly', content: 'true' },
      { name: 'MobileOptimized', content: '320' },
    ];

    // Set canonical URL
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', 'https://sselfie.ai/business');
    
    // Add favicon and app icons
    const faviconLinks = [
      { rel: 'icon', type: 'image/png', href: '/favicon.png', sizes: '32x32' },
      { rel: 'apple-touch-icon', href: '/favicon.png', sizes: '180x180' },
      { rel: 'manifest', href: '/site.webmanifest' }
    ];
    
    faviconLinks.forEach(linkData => {
      let link = document.querySelector(`link[rel="${linkData.rel}"]`);
      if (!link) {
        link = document.createElement('link');
        link.setAttribute('rel', linkData.rel);
        if (linkData.type) link.setAttribute('type', linkData.type);
        if (linkData.sizes) link.setAttribute('sizes', linkData.sizes);
        document.head.appendChild(link);
      }
      link.setAttribute('href', linkData.href);
    });

    // Apply all meta tags
    metaTags.forEach(tag => {
      const selector = tag.name ? `meta[name="${tag.name}"]` : `meta[property="${tag.property}"]`;
      let meta = document.querySelector(selector);
      if (!meta) {
        meta = document.createElement('meta');
        if (tag.name) meta.setAttribute('name', tag.name);
        if (tag.property) meta.setAttribute('property', tag.property);
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', tag.content);
    });

    // Add comprehensive JSON-LD structured data for enhanced SEO and rich snippets
    const structuredData = [
      // Organization Schema
      {
        "@context": "https://schema.org",
        "@type": "Organization",
        "name": "SSELFIE Studio",
        "url": "https://sselfie.ai",
        "logo": "https://sselfie.ai/favicon.ico",
        "description": "AI-powered professional photo generation platform that transforms selfies into business-quality headshots and brand photos",
        "foundingDate": "2024",
        "sameAs": [
          "https://instagram.com/sandra.social"
        ],
        "contactPoint": {
          "@type": "ContactPoint",
          "email": "hello@sselfie.ai",
          "contactType": "customer service"
        }
      },
      // Primary Service Schema  
      {
        "@context": "https://schema.org",
        "@type": "Service",
        "name": "AI Professional Photo Generation",
        "description": "Transform your selfies into professional headshots and business photos using advanced AI technology. Perfect for LinkedIn profiles, business cards, and professional branding.",
        "provider": {
          "@type": "Organization",
          "name": "SSELFIE Studio",
          "url": "https://sselfie.ai"
        },
        "serviceType": "AI Photography Service",
        "areaServed": "Worldwide",
        "category": "Professional Photography",
        "audience": {
          "@type": "Audience",
          "audienceType": "Business Professionals"
        },
        "offers": {
          "@type": "Offer",
          "name": "SSELFIE Studio Monthly Subscription",
          "description": "Monthly professional AI photos from your selfies - 100 photos per month",
          "price": "47",
          "priceCurrency": "EUR",
          "availability": "https://schema.org/InStock",
          "url": "https://sselfie.ai/simple-checkout",
          "priceValidUntil": "2025-12-31",
          "itemOffered": {
            "@type": "Service",
            "name": "AI Professional Photo Generation Service"
          }
        }
      },
      // FAQ Schema for Voice Search & Rich Snippets
      {
        "@context": "https://schema.org", 
        "@type": "FAQPage",
        "mainEntity": [
          {
            "@type": "Question",
            "name": "How does SSELFIE Studio work?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Simply upload 15-25 selfies to train your personal AI model, then generate unlimited professional photos for €47/month. Our AI creates LinkedIn headshots, business portraits, and brand photos from your selfies."
            }
          },
          {
            "@type": "Question", 
            "name": "What types of professional photos can I create?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Create LinkedIn headshots, business portraits, website photos, social media content, professional headshots for business cards, conference photos, and personal branding images."
            }
          },
          {
            "@type": "Question",
            "name": "How much does SSELFIE Studio cost?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "€47/month for unlimited access to Maya AI photographer and 100 monthly professional photos. No setup fees, cancel anytime. Much more affordable than traditional €1500+ photoshoots."
            }
          }
        ]
      },
      // Product Schema for Enhanced Visibility
      {
        "@context": "https://schema.org",
        "@type": "Product",
        "name": "SSELFIE Studio AI Photography Platform",
        "description": "Professional AI photo generation platform that creates business headshots and brand photos from selfies",
        "brand": {
          "@type": "Brand", 
          "name": "SSELFIE Studio"
        },
        "category": "Software as a Service",
        "offers": {
          "@type": "Offer",
          "price": "47",
          "priceCurrency": "EUR",
          "availability": "https://schema.org/InStock",
          "url": "https://sselfie.ai/simple-checkout"
        }
      }
    ];

    // Remove existing structured data scripts and add comprehensive schema
    const existingScripts = document.querySelectorAll('script[type="application/ld+json"]');
    existingScripts.forEach(script => script.remove());
    
    structuredData.forEach((schema, index) => {
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.textContent = JSON.stringify(schema);
      document.head.appendChild(script);
    });
  }, []);

  const handleGetStarted = () => {
    localStorage.setItem('selectedPlan', 'sselfie-studio');
    setLocation('/simple-checkout');
  };

  const handleLogin = async () => {
    console.log('🔍 Login button clicked');
    console.log('🔍 Stack Auth app available:', !!app);
    console.log('🔍 Environment vars:', { STACK_PROJECT_ID, STACK_PUBLISHABLE_CLIENT_KEY });
    
    if (!app) {
      console.log('🔄 Using fallback login method');
      // Fallback to direct OAuth URL
      const projectId = STACK_PROJECT_ID;
      const publishableKey = STACK_PUBLISHABLE_CLIENT_KEY;

      if (publishableKey) {
        console.log('🚀 Redirecting to Stack Auth handler');
        window.location.href = `/handler/sign-in`;
      } else {
        console.error('❌ No publishable key found');
      }
      return;
    }

    try {
      console.log('🚀 Using Stack Auth SDK method');
      // ✅ Use Stack Auth SDK method
      await app.signInWithOAuth('google');
    } catch (error) {
      console.error('❌ Stack Auth: OAuth login failed:', error);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Business Navigation with Mobile Support */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex items-center justify-between">
            <div 
              className="font-serif text-lg sm:text-xl font-light tracking-wide text-white cursor-pointer touch-manipulation"
              style={{ fontFamily: "Times New Roman, serif", minHeight: '44px', display: 'flex', alignItems: 'center' }}
              onClick={() => setLocation("/")}
            >
              SSELFIE
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <button
                onClick={handleLogin}
                className="text-xs uppercase tracking-[0.3em] font-light text-white/70 hover:text-white transition-all duration-300 min-h-[44px] px-3 flex items-center touch-manipulation"
              >
                Login
              </button>
              <button
                onClick={handleGetStarted}
                className="text-white border border-white/30 hover:bg-white hover:text-black transition-colors duration-300 text-xs uppercase tracking-[0.3em] font-light px-8 py-3 min-h-[44px] touch-manipulation"
              >
                Start €47
              </button>
            </div>

            {/* Mobile Navigation - Optimized touch targets */}
            <div className="md:hidden flex items-center space-x-3">
              <button
                onClick={handleLogin}
                className="text-xs uppercase tracking-[0.3em] font-light text-white/70 hover:text-white transition-all duration-300 min-h-[44px] px-3 flex items-center"
              >
                Login
              </button>
              <button
                onClick={handleGetStarted}
                className="text-white border border-white/30 hover:bg-white hover:text-black transition-colors duration-300 text-xs uppercase tracking-[0.3em] font-light px-6 py-3 min-h-[44px] min-w-[120px]"
              >
                Start €47
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* HERO - Optimized Layout */}
      <section className="relative min-h-screen bg-black text-white overflow-hidden">
        <div className="absolute inset-0 opacity-60">
          <img 
            src="https://sselfie-training-zips.s3.eu-north-1.amazonaws.com/generated-images/undefined/undefined_1756382691095.png"
            alt="Professional transformation through AI photography"
            className="w-full h-full object-cover object-center"
          />
        </div>

        <div className="relative z-10 min-h-screen px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto h-screen flex items-end pb-20">
            <div className="w-full max-w-2xl">
              <div className="mb-8">
                <div className="w-16 h-px bg-white/30 mb-6"></div>
              </div>

              <h1 
                className="font-serif font-light mb-6 tracking-[-0.02em] leading-none"
                style={{ 
                  fontFamily: "Times New Roman, serif",
                  fontSize: 'clamp(2rem, 8vw, 4.5rem)'
                }}
              >
                Professional photos from your selfies
              </h1>

              <p className="font-light max-w-xl mb-12"
                 style={{
                   fontSize: 'clamp(1rem, 4vw, 1.25rem)',
                   color: 'rgba(255, 255, 255, 0.8)'
                 }}>
                Upload 15 selfies once. Get 100+ fresh brand photos every month.
              </p>

              <div className="space-y-6">
                <button 
                  onClick={handleGetStarted}
                  className="text-white border border-white/30 hover:bg-white hover:text-black transition-colors duration-300 text-xs uppercase tracking-[0.3em] font-light min-h-[48px] touch-manipulation"
                  style={{
                    padding: 'clamp(12px, 3vw, 16px) clamp(24px, 6vw, 40px)'
                  }}
                >
                  Get 100 Pro Photos — €47
                </button>

                <p className="text-xs text-white/60 tracking-wide">
                  Photos ready in 20 minutes • Cancel anytime
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PROBLEM - Simplified */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="text-xs uppercase tracking-[0.4em] text-gray-400 mb-8">
            The Reality
          </div>

          <h2 
            className="font-serif text-3xl sm:text-4xl md:text-5xl font-light mb-8 text-black leading-tight"
            style={{ fontFamily: "Times New Roman, serif" }}
          >
            Two hours for one decent photo.<br />
            <span className="italic text-gray-600">Still looks amateur.</span>
          </h2>

          <p className="text-lg text-gray-600 mb-12 max-w-2xl mx-auto">
            Scrolling through your camera roll like "what can I post today?" 
            Using the same three photos over and over while competitors look professional.
          </p>
        </div>
      </section>

      {/* SOLUTION - Editorial Process */}
      <section className="py-20 sm:py-32 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 sm:mb-20">
            <div className="text-xs uppercase tracking-[0.4em] text-gray-400 mb-8">
              The Solution
            </div>
            <h2 
              className="font-serif text-3xl sm:text-4xl md:text-5xl font-light mb-6 text-black"
              style={{ fontFamily: "Times New Roman, serif" }}
            >
              Professional photos in<br />
              <span className="italic text-gray-600">three simple steps</span>
            </h2>
            <div className="w-16 h-px bg-gray-300 mx-auto"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-12 lg:gap-16">
            {/* Step 1 */}
            <div className="text-center">
              <div className="relative overflow-hidden rounded-lg mb-6 sm:mb-8"
                   style={{ height: 'clamp(240px, 50vw, 320px)' }}>
                <img
                  src="https://e33979fc-c9be-4f0d-9a7b-6a3e83046828-00-3ij9k7qy14rai.picard.replit.dev/api/proxy-image?url=https%3A%2F%2Fsselfie-training-zips.s3.eu-north-1.amazonaws.com%2Fgenerated-images%2F42585527%2Fmaya_gn5xs1grwxrme0cs3g4tfwe220_0_1757111996442.png"
                  alt="Upload process"
                  className="w-full h-full object-cover object-[center_20%]"
                />
                <div className="absolute top-4 left-4 sm:top-6 sm:left-6 bg-black text-white flex items-center justify-center text-base sm:text-lg font-light"
                     style={{ width: 'clamp(40px, 8vw, 48px)', height: 'clamp(40px, 8vw, 48px)' }}>
                  01
                </div>
              </div>
              <h3 
                className="font-serif text-xl mb-4 text-black font-light"
                style={{ fontFamily: "Times New Roman, serif" }}
              >
                Upload your selfies
              </h3>
              <p className="text-gray-600 leading-relaxed mb-4">
                Send 15-20 selfies from your phone. Mirror selfies, car selfies, 
                bathroom selfies. Whatever you have works.
              </p>
              <p className="text-sm text-gray-500 italic">
                "Any lighting, any background"
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center">
              <div className="relative h-80 mb-8 overflow-hidden rounded-lg">
                <img
                  src="https://sselfie-training-zips.s3.eu-north-1.amazonaws.com/generated-images/42585527/maya_8r00hax7n1rm80cryjbs9enxam_0_1756450255292.png"
                  alt="AI creation process"
                  className="w-full h-full object-cover object-[center_20%]"
                />
                <div className="absolute top-6 left-6 w-12 h-12 bg-black text-white flex items-center justify-center text-lg font-light">
                  02
                </div>
              </div>
              <h3 
                className="font-serif text-xl mb-4 text-black font-light"
                style={{ fontFamily: "Times New Roman, serif" }}
              >
                AI creates professional photos
              </h3>
              <p className="text-gray-600 leading-relaxed mb-4">
                Maya AI learns your face and creates professional photos 
                in different styles. Business, lifestyle, editorial, creative.
              </p>
              <p className="text-sm text-gray-500 italic">
                "Like having a personal photographer"
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center">
              <div className="relative h-80 mb-8 overflow-hidden rounded-lg">
                <img
                  src="https://sselfie-training-zips.s3.eu-north-1.amazonaws.com/generated-images/42585527/maya_5s2emwbk3srma0crywrbh9kg4c_0_1756493820306.png"
                  alt="Professional gallery"
                  className="w-full h-full object-cover object-[center_20%]"
                />
                <div className="absolute top-6 left-6 w-12 h-12 bg-black text-white flex items-center justify-center text-lg font-light">
                  03
                </div>
              </div>
              <h3 
                className="font-serif text-xl mb-4 text-black font-light"
                style={{ fontFamily: "Times New Roman, serif" }}
              >
                Get 100+ monthly photos
              </h3>
              <p className="text-gray-600 leading-relaxed mb-4">
                Download professional photos for LinkedIn, Instagram, 
                your website, marketing materials. Fresh content every month.
              </p>
              <p className="text-sm text-gray-500 italic">
                "Never run out of content again"
              </p>
            </div>
          </div>

          <div className="text-center mt-16 bg-black text-white p-12">
            <p 
              className="text-xl font-light"
              style={{ fontFamily: "Times New Roman, serif" }}
            >
              100+ professional photos monthly for €47 vs €1500+ per single photoshoot
            </p>
          </div>
        </div>
      </section>

      {/* SUCCESS - Simplified */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="text-xs uppercase tracking-[0.4em] text-gray-400 mb-8">
            Your New Reality
          </div>

          <h2 
            className="font-serif text-3xl sm:text-4xl md:text-5xl font-light mb-8 text-black leading-tight"
            style={{ fontFamily: "Times New Roman, serif" }}
          >
            100+ professional photos monthly.<br />
            <span className="italic text-gray-600">Never run out of content.</span>
          </h2>

          <p className="text-lg text-gray-600 mb-12 max-w-2xl mx-auto">
            LinkedIn posts, Instagram stories, website headers, marketing materials. 
            Fresh professional imagery that tells your story across every platform.
          </p>
        </div>
      </section>

      {/* PRICING */}
      <section className="py-20 sm:py-32 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-8">
            {/* Individual Plan */}
            <div className="bg-gray-50 border border-gray-200 p-8">
              <div className="text-center border-b border-gray-200 pb-6 mb-6">
                <h3 
                  className="font-serif text-2xl font-light mb-2 text-black"
                  style={{ fontFamily: "Times New Roman, serif" }}
                >
                  Personal Brand Studio
                </h3>
                <div className="flex items-baseline justify-center">
                  <span className="text-4xl font-light text-black">€47</span>
                  <span className="text-lg text-gray-600 ml-2">monthly</span>
                </div>
                <p className="text-sm text-gray-500 mt-2">versus €1500+ traditional photoshoots</p>
              </div>
              <button 
                onClick={handleGetStarted}
                className="w-full text-black border border-black hover:bg-black hover:text-white transition-colors duration-300 text-xs uppercase tracking-[0.3em] font-light min-h-[48px] touch-manipulation"
                style={{ padding: 'clamp(12px, 3vw, 16px) clamp(16px, 4vw, 24px)' }}
              >
                Begin Transformation
              </button>
              <p className="text-xs text-gray-500 text-center mt-4">30-day money-back guarantee</p>
            </div>

            {/* Team Option */}
            <div className="border-2 border-black p-8">
              <div className="text-center border-b border-gray-200 pb-6 mb-6">
                <h3 
                  className="font-serif text-2xl font-light mb-2 text-black"
                  style={{ fontFamily: "Times New Roman, serif" }}
                >
                  Enterprise Solutions
                </h3>
                <p className="text-gray-600">Professional photography for teams and organizations</p>
              </div>
              <button 
                onClick={() => setLocation('/teams')}
                className="w-full border border-black text-black py-4 text-xs uppercase tracking-[0.3em] font-light hover:bg-black hover:text-white transition-all"
              >
                Request Custom Proposal
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Mini-FAQ */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-serif text-3xl mb-8 font-light" style={{ fontFamily: "Times New Roman, serif" }}>
            FAQ
          </h2>
          
          <details className="mb-4 border-b border-gray-200 pb-4">
            <summary className="cursor-pointer text-lg font-light">Do my selfies need perfect lighting?</summary>
            <p className="mt-2 text-gray-700 font-light">No. Any lighting/background works. Maya learns your face and style.</p>
          </details>
          
          <details className="mb-4 border-b border-gray-200 pb-4">
            <summary className="cursor-pointer text-lg font-light">Will you train on my photos?</summary>
            <p className="mt-2 text-gray-700 font-light">Only with your consent. Your photos stay private.</p>
          </details>
          
          <details className="mb-4 border-b border-gray-200 pb-4">
            <summary className="cursor-pointer text-lg font-light">Cancel anytime?</summary>
            <p className="mt-2 text-gray-700 font-light">Yes—one click in your account.</p>
          </details>
          
          <details className="mb-4 border-b border-gray-200 pb-4">
            <summary className="cursor-pointer text-lg font-light">Commercial usage?</summary>
            <p className="mt-2 text-gray-700 font-light">Yes—use them on your site, socials, and marketing.</p>
          </details>
        </div>
      </section>

      {/* SOCIAL PROOF - Editorial Portrait */}
      <section className="py-20 sm:py-32 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Sandra's Portrait */}
            <div className="relative h-[500px] overflow-hidden">
              <img
                src="https://sselfie-training-zips.s3.eu-north-1.amazonaws.com/generated-images/42585527/maya_g826ygf2d9rm80crzjkvnvmpyr_0_1756585536824.png"
                alt="Sandra Sigurjónsdóttir, Founder"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
              <div className="absolute bottom-6 left-6 right-6">
                <p className="text-white text-sm font-light">Sandra Sigurjónsdóttir</p>
                <p className="text-white/80 text-sm italic">Founder, SSELFIE Studio</p>
              </div>
            </div>

            {/* Content */}
            <div>
              <div className="text-xs uppercase tracking-[0.4em] text-gray-400 mb-8">
                Who built this
              </div>

              <h3 
                className="font-serif text-3xl sm:text-4xl font-light mb-8 text-black"
                style={{ fontFamily: "Times New Roman, serif" }}
              >
                Sandra Sigurjonsdottir
              </h3>
              <p className="text-lg text-gray-600 mb-8">Founder & Creator</p>

              <div className="grid grid-cols-2 gap-8 mb-8">
                <div>
                  <p className="text-3xl font-light text-black">120K</p>
                  <p className="text-gray-600 text-sm">Followers built with this exact method</p>
                </div>

                <div>
                  <p className="text-3xl font-light text-black">€12 → Business</p>
                  <p className="text-gray-600 text-sm">Started with almost nothing</p>
                </div>
              </div>

              <div className="space-y-6 text-gray-700 leading-relaxed">
                <p>
                  Marriage ended. Single mom. Zero business plan. But I had a phone 
                  and I knew I needed professional photos to build anything online.
                </p>

                <p>
                  I couldn't afford €1500 photoshoots, so I figured out how to make 
                  my phone selfies work. Built everything from my kitchen table using this exact system.
                </p>

                <p className="font-medium text-black">
                  Now I'm showing you how to do the same thing.
                </p>
              </div>

              <div className="mt-8 p-6 bg-gray-50 border-l-4 border-black">
                <p className="text-black italic" style={{ fontFamily: "Times New Roman, serif" }}>
                  "Your mess is your message. Your phone has everything you need."
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CTA - Editorial Call to Action */}
      <section className="relative py-24 sm:py-32 bg-black text-white overflow-hidden">
        <div className="absolute inset-0 opacity-30">
          <img
            src="https://sselfie-training-zips.s3.eu-north-1.amazonaws.com/generated-images/42585527/maya_rr4fnv2rb5rm80crzyd87jm48g_0_1756634973175.png"
            alt="Professional transformation"
            className="w-full h-full object-cover"
          />
        </div>

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="text-xs uppercase tracking-[0.4em] text-white/70 mb-8">
            Your Transformation Begins Now
          </div>

          <h2 
            className="font-serif text-4xl sm:text-5xl md:text-6xl font-light mb-8 text-white"
            style={{ fontFamily: "Times New Roman, serif" }}
          >
            Professional photography.<br />
            <span className="italic">Monthly delivery.</span>
          </h2>

          <p className="text-xl text-white/80 mb-12 max-w-2xl mx-auto">
            Upload selfies today. Receive 100+ professional brand photographs within 20 minutes.
          </p>

          <button 
            onClick={handleGetStarted}
            className="group inline-block mb-8"
          >
            <span className="text-xs uppercase tracking-[0.3em] font-light text-white border border-white/30 px-12 py-4 group-hover:bg-white group-hover:text-black transition-all duration-300">
              Transform Your Brand — €47
            </span>
          </button>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <p className="text-2xl font-light mb-2">20min</p>
              <p className="text-xs text-white/70 uppercase tracking-wide">Delivery</p>
            </div>
            <div>
              <p className="text-2xl font-light mb-2">100+</p>
              <p className="text-xs text-white/70 uppercase tracking-wide">Images</p>
            </div>
            <div>
              <p className="text-2xl font-light mb-2">∞</p>
              <p className="text-xs text-white/70 uppercase tracking-wide">Content</p>
            </div>
            <div>
              <p className="text-2xl font-light mb-2">€47</p>
              <p className="text-xs text-white/70 uppercase tracking-wide">Monthly</p>
            </div>
          </div>
        </div>
      </section>

      {/* Sticky CTA */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-sm border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-center">
          <button
            onClick={handleGetStarted}
            className="text-white border border-white/30 hover:bg-white hover:text-black transition-colors duration-300 text-xs uppercase tracking-[0.3em] font-light px-8 py-3"
            style={{ minHeight: 44 }}
          >
            Get 100 Pro Photos — €47
          </button>
        </div>
      </div>

      <GlobalFooter />
    </div>
  );
}
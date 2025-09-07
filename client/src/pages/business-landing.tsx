import React, { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { GlobalFooter } from "../components/global-footer";
import { useStackApp } from "@stackframe/stack";
import { STACK_PROJECT_ID, STACK_PUBLISHABLE_CLIENT_KEY } from "../env";

export default function BusinessLanding() {
  const [, setLocation] = useLocation();
  let app;
  try {
    app = useStackApp();
  } catch (error) {
    app = null;
  }

  // SEO Meta Tags - Voice Guide Compliant
  useEffect(() => {
    document.title = "SSELFIE Studio - Professional Photos From Your Selfies | €47/month vs €1500+ Photoshoots";

    const metaTags = [
      { name: 'description', content: 'Professional photos from your selfies. Upload once, get 100+ brand photos monthly. €47/month vs €1500+ photoshoots. No photographer, no awkwardness—just you looking like a pro.' },
      { name: 'keywords', content: 'professional photos from selfies, AI headshots, LinkedIn headshots, personal branding photos, brand photography, professional selfies, business headshots, social media photos' },
      { name: 'author', content: 'SSELFIE Studio' },
      { name: 'robots', content: 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1.0, viewport-fit=cover' },
      { name: 'theme-color', content: '#000000' },
      { name: 'msapplication-TileColor', content: '#000000' },

      // Open Graph
      { property: 'og:title', content: 'SSELFIE Studio - Professional Photos From Your Selfies | €47/month' },
      { property: 'og:description', content: 'Professional photos from your selfies. Upload once, get 100+ brand photos monthly. €47/month vs €1500+ photoshoots. No photographer, no awkwardness.' },
      { property: 'og:type', content: 'website' },
      { property: 'og:url', content: 'https://sselfie.ai/business' },
      { property: 'og:image', content: 'https://sselfie.ai/og-business.jpg' },
      { property: 'og:image:width', content: '1200' },
      { property: 'og:image:height', content: '630' },
      { property: 'og:image:alt', content: 'Professional photos from selfies' },
      { property: 'og:site_name', content: 'SSELFIE Studio' },
      { property: 'og:locale', content: 'en_US' },

      // Twitter
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: 'SSELFIE Studio - Professional Photos From Selfies' },
      { name: 'twitter:description', content: 'Professional photos from your selfies. €47/month vs €1500+ photoshoots.' },
      { name: 'twitter:image', content: 'https://sselfie.ai/twitter-business.jpg' },
      { name: 'twitter:image:alt', content: 'Professional photos from selfies' },

      // Mobile
      { name: 'format-detection', content: 'telephone=no' },
      { name: 'apple-mobile-web-app-capable', content: 'yes' },
      { name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' },
      { name: 'mobile-web-app-capable', content: 'yes' },
      { name: 'HandheldFriendly', content: 'true' },
      { name: 'MobileOptimized', content: '320' },
    ];

    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', 'https://sselfie.ai/business');

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

    // JSON-LD
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "Service",
      "name": "SSELFIE Studio",
      "description": "Professional photo generation from selfies for personal branding",
      "provider": {
        "@type": "Organization",
        "name": "SSELFIE Studio",
        "url": "https://sselfie.ai"
      },
      "serviceType": "Photography Service",
      "areaServed": "Worldwide",
      "hasOfferCatalog": {
        "@type": "OfferCatalog",
        "name": "Professional Photo Packages",
        "itemListElement": [
          {
            "@type": "Offer",
            "itemOffered": {
              "@type": "Service",
              "name": "SSELFIE Studio Monthly Subscription",
              "description": "Monthly professional photos from selfies"
            },
            "price": "47",
            "priceCurrency": "EUR"
          }
        ]
      },
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "4.8",
        "reviewCount": "127"
      }
    };

    let script = document.querySelector('script[type="application/ld+json"]');
    if (!script) {
      script = document.createElement('script');
      script.type = 'application/ld+json';
      document.head.appendChild(script);
    }
    script.textContent = JSON.stringify(structuredData);
  }, []);

  const handleGetStarted = () => {
    localStorage.setItem('selectedPlan', 'sselfie-studio');
    setLocation('/simple-checkout');
  };

  const handleLogin = async () => {
    if (!app) {
      const projectId = STACK_PROJECT_ID;
      const publishableKey = STACK_PUBLISHABLE_CLIENT_KEY;

      if (publishableKey) {
        window.location.href = `/handler/sign-in`;
      }
      return;
    }

    try {
      await app.signInWithOAuth('google');
    } catch (error) {
      console.error('❌ Stack Auth: OAuth login failed:', error);
    }
  };

  return (
    <div className="min-h-screen bg-white font-light" style={{
      '--luxury-black': '#000000',
      '--pure-white': '#ffffff',
      '--editorial-gray': '#fafafa',
      '--body-gray': '#666666',
      '--accent-line': '#e0e0e0',
    } as React.CSSProperties}>

      {/* Minimal Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-8 py-8">
          <div className="flex items-center justify-between">
            <div 
              className="cursor-pointer text-white"
              style={{
                fontFamily: "Times New Roman, serif",
                fontSize: '20px',
                fontWeight: 300,
                letterSpacing: '0.2em',
                textTransform: 'uppercase'
              }}
              onClick={() => setLocation("/")}
            >
              SSELFIE
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-12">
              <button 
                onClick={() => setLocation("/editorial-landing")}
                className="text-white/70 hover:text-white transition-all duration-500"
                style={{
                  fontSize: '10px',
                  fontWeight: 300,
                  letterSpacing: '0.4em',
                  textTransform: 'uppercase'
                }}
              >
                Personal
              </button>
              <button 
                onClick={() => setLocation("/teams")}
                className="text-white/70 hover:text-white transition-all duration-500"
                style={{
                  fontSize: '10px',
                  fontWeight: 300,
                  letterSpacing: '0.4em',
                  textTransform: 'uppercase'
                }}
              >
                Teams
              </button>
              <button
                onClick={handleLogin}
                className="text-white/70 hover:text-white transition-all duration-500"
                style={{
                  fontSize: '10px',
                  fontWeight: 300,
                  letterSpacing: '0.4em',
                  textTransform: 'uppercase'
                }}
              >
                Login
              </button>
              <button
                onClick={handleGetStarted}
                className="text-white border border-white/20 hover:bg-white hover:text-black transition-all duration-500 px-8 py-3"
                style={{
                  fontSize: '10px',
                  fontWeight: 300,
                  letterSpacing: '0.3em',
                  textTransform: 'uppercase'
                }}
              >
                Start €47
              </button>
            </div>

            {/* Mobile Navigation */}
            <div className="md:hidden flex items-center space-x-4">
              <button
                onClick={handleLogin}
                className="text-white/70 hover:text-white transition-all duration-500 min-h-[44px] px-3 flex items-center"
                style={{
                  fontSize: '10px',
                  fontWeight: 300,
                  letterSpacing: '0.3em',
                  textTransform: 'uppercase'
                }}
              >
                Login
              </button>
              <button
                onClick={handleGetStarted}
                className="text-white border border-white/20 hover:bg-white hover:text-black transition-all duration-500 px-6 py-3 min-h-[44px]"
                style={{
                  fontSize: '10px',
                  fontWeight: 300,
                  letterSpacing: '0.3em',
                  textTransform: 'uppercase'
                }}
              >
                Start €47
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Minimal Hero - Full Bleed Image */}
      <section className="relative h-screen flex items-end justify-center text-white bg-black overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src="https://sselfie-training-zips.s3.eu-north-1.amazonaws.com/generated-images/undefined/undefined_1756382691095.png"
            alt="Professional transformation"
            className="w-full h-full object-cover object-center opacity-60"
          />
        </div>
        <div className="absolute inset-0 bg-black/20" />

        <div className="relative z-10 max-w-5xl mx-auto px-8 pb-32 text-center">
          {/* Minimal Eyebrow */}
          <p className="text-white/60 mb-12 tracking-[0.5em] text-[10px] font-light uppercase">
            Your Personal AI Photographer
          </p>

          {/* Editorial Hero Title */}
          <h1 
            className="text-white mb-16 leading-[0.8]"
            style={{ 
              fontFamily: 'Times New Roman, serif',
              fontWeight: 200,
              letterSpacing: '0.3em',
              fontSize: 'clamp(4rem, 10vw, 8rem)',
              textTransform: 'uppercase'
            }}
          >
            Professional Photos<br />From Your Selfies
          </h1>

          {/* Minimal Value Prop */}
          <p className="text-white/90 mb-4 font-light text-[clamp(18px, 3vw, 24px)] tracking-[0.05em]">
            Upload once, get 100+ brand photos monthly.
          </p>

          <p className="text-white/70 mb-16 font-light text-[16px] tracking-[0.1em]">
            €47/month vs €1500+ photoshoots
          </p>

          {/* Minimal CTA */}
          <button 
            onClick={handleGetStarted}
            className="bg-white text-black px-12 py-4 hover:bg-white/90 transition-all duration-500"
            style={{
              fontSize: '10px',
              fontWeight: 300,
              letterSpacing: '0.3em',
              textTransform: 'uppercase'
            }}
          >
            Get Professional Photos
          </button>
        </div>
      </section>

      {/* Editorial Break - Problem Statement */}
      <section className="py-32 lg:py-48 bg-white">
        <div className="max-w-4xl mx-auto px-8 text-center">
          <div className="mb-16 text-[10px] font-light text-gray-400 tracking-[0.4em] uppercase">
            The Reality
          </div>

          <h2 
            className="mb-24 leading-[0.9] text-black"
            style={{
              fontFamily: 'Times New Roman, serif',
              fontSize: 'clamp(3rem, 8vw, 6rem)',
              fontWeight: 200,
              letterSpacing: '0.1em'
            }}
          >
            Scrolling through your camera roll like<br />
            <span className="italic text-gray-400">"what can I post today?"</span>
          </h2>

          <div className="max-w-xl mx-auto text-gray-600 font-light text-[18px] leading-[1.8] space-y-8">
            <p>
              Sunday night content prep. The same three photos. Again.
            </p>

            <p>
              Two hours later, you look amateur next to your competitors.
            </p>

            <p className="text-black font-normal">
              There's a better way.
            </p>
          </div>
        </div>
      </section>

      {/* Minimal Image Grid - How It Works */}
      <section className="py-32 lg:py-48 bg-gray-50">
        <div className="max-w-7xl mx-auto px-8">
          <div className="text-center mb-32">
            <div className="mb-16 text-[10px] font-light text-gray-400 tracking-[0.4em] uppercase">
              The Solution
            </div>

            <h2 
              className="text-black leading-[0.9]"
              style={{
                fontFamily: 'Times New Roman, serif',
                fontSize: 'clamp(3rem, 8vw, 6rem)',
                fontWeight: 200,
                letterSpacing: '0.1em'
              }}
            >
              Here's exactly how it works
            </h2>
          </div>

          {/* Clean 3-Column Grid */}
          <div className="grid md:grid-cols-3 gap-16 lg:gap-24">
            {/* Step 1 */}
            <div className="group">
              <div className="relative overflow-hidden mb-12 aspect-[3/4] bg-white">
                <img
                  src="https://e33979fc-c9be-4f0d-9a7b-6a3e83046828-00-3ij9k7qy14rai.picard.replit.dev/api/proxy-image?url=https%3A%2F%2Fsselfie-training-zips.s3.eu-north-1.amazonaws.com%2Fgenerated-images%2F42585527%2Fmaya_gn5xs1grwxrme0cs3g4tfwe220_0_1757111996442.png"
                  alt="Upload process"
                  className="w-full h-full object-cover object-center transition-transform duration-1000 group-hover:scale-105"
                />
                <div className="absolute top-8 left-8 bg-black/60 text-white px-4 py-2 text-[10px] font-light tracking-[0.2em] uppercase">
                  01
                </div>
              </div>

              <div className="text-center">
                <h3 className="mb-6 text-black"
                    style={{
                      fontFamily: 'Times New Roman, serif',
                      fontSize: '20px',
                      fontWeight: 200,
                      letterSpacing: '0.2em',
                      textTransform: 'uppercase'
                    }}>
                  Upload 15 Selfies
                </h3>
                <p className="text-gray-600 font-light text-[16px] leading-[1.6]">
                  Any lighting, any background.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="group">
              <div className="relative overflow-hidden mb-12 aspect-[3/4] bg-white">
                <img
                  src="https://sselfie-training-zips.s3.eu-north-1.amazonaws.com/generated-images/42585527/maya_8r00hax7n1rm80cryjbs9enxam_0_1756450255292.png"
                  alt="AI creation"
                  className="w-full h-full object-cover object-center transition-transform duration-1000 group-hover:scale-105"
                />
                <div className="absolute top-8 left-8 bg-black/60 text-white px-4 py-2 text-[10px] font-light tracking-[0.2em] uppercase">
                  02
                </div>
              </div>

              <div className="text-center">
                <h3 className="mb-6 text-black"
                    style={{
                      fontFamily: 'Times New Roman, serif',
                      fontSize: '20px',
                      fontWeight: 200,
                      letterSpacing: '0.2em',
                      textTransform: 'uppercase'
                    }}>
                  AI Learns Your Angles
                </h3>
                <p className="text-gray-600 font-light text-[16px] leading-[1.6]">
                  Maya studies what works.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="group">
              <div className="relative overflow-hidden mb-12 aspect-[3/4] bg-white">
                <img
                  src="https://sselfie-training-zips.s3.eu-north-1.amazonaws.com/generated-images/42585527/maya_5s2emwbk3srma0crywrbh9kg4c_0_1756493820306.png"
                  alt="Professional results"
                  className="w-full h-full object-cover object-center transition-transform duration-1000 group-hover:scale-105"
                />
                <div className="absolute top-8 left-8 bg-black/60 text-white px-4 py-2 text-[10px] font-light tracking-[0.2em] uppercase">
                  03
                </div>
              </div>

              <div className="text-center">
                <h3 className="mb-6 text-black"
                    style={{
                      fontFamily: 'Times New Roman, serif',
                      fontSize: '20px',
                      fontWeight: 200,
                      letterSpacing: '0.2em',
                      textTransform: 'uppercase'
                    }}>
                  Get 100+ Photos Monthly
                </h3>
                <p className="text-gray-600 font-light text-[16px] leading-[1.6]">
                  Fresh content every month.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Editorial Portrait - Sandra's Story */}
      <section className="py-32 lg:py-48 bg-white">
        <div className="max-w-7xl mx-auto px-8">
          <div className="grid lg:grid-cols-2 gap-24 items-center">
            {/* Portrait */}
            <div className="relative aspect-[3/4] overflow-hidden bg-gray-100">
              <img
                src="https://sselfie-training-zips.s3.eu-north-1.amazonaws.com/generated-images/42585527/maya_g826ygf2d9rm80crzjkvnvmpyr_0_1756585536824.png"
                alt="Sandra Sigurjónsdóttir, Founder"
                className="w-full h-full object-cover object-center"
              />
              <div className="absolute bottom-8 left-8 right-8">
                <p className="text-white font-light text-[14px] tracking-[0.1em]">
                  Sandra Sigurjónsdóttir
                </p>
                <p className="text-white/70 font-light text-[12px] italic tracking-[0.05em]">
                  Founder, SSELFIE Studio
                </p>
              </div>
            </div>

            {/* Story */}
            <div>
              <div className="mb-16 text-[10px] font-light text-gray-400 tracking-[0.4em] uppercase">
                The Real Story
              </div>

              <h3 
                className="mb-16 text-black leading-[0.9]"
                style={{
                  fontFamily: 'Times New Roman, serif',
                  fontSize: 'clamp(2.5rem, 5vw, 4rem)',
                  fontWeight: 200,
                  letterSpacing: '0.05em'
                }}
              >
                I figured this out the hard way
              </h3>

              <div className="grid grid-cols-2 gap-12 mb-16">
                <div>
                  <p className="text-black font-light text-[32px] mb-2">120K</p>
                  <p className="text-gray-600 font-light text-[12px] tracking-[0.05em]">
                    Followers built with this method
                  </p>
                </div>

                <div>
                  <p className="text-black font-light text-[32px] mb-2">€12 → Business</p>
                  <p className="text-gray-600 font-light text-[12px] tracking-[0.05em]">
                    Started with almost nothing
                  </p>
                </div>
              </div>

              <div className="space-y-8 text-gray-600 font-light text-[18px] leading-[1.7]">
                <p>
                  Single mom. Divorced. €12 in my bank account. But I knew I needed professional photos.
                </p>

                <p>
                  I couldn't afford €1500 photoshoots, so I figured out how to make my phone selfies work.
                </p>

                <p className="text-black">
                  If it worked for me, it'll work for you too.
                </p>
              </div>

              <div className="mt-16 p-8 bg-gray-50 border-l border-black">
                <p className="italic text-black font-light text-[16px] tracking-[0.02em]"
                   style={{ fontFamily: 'Times New Roman, serif' }}>
                  "Your mess is your message. Your phone has everything you need."
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Minimal Pricing */}
      <section className="py-32 lg:py-48 bg-gray-50">
        <div className="max-w-2xl mx-auto px-8 text-center">
          <h2 
            className="mb-24 text-black leading-[0.9]"
            style={{
              fontFamily: 'Times New Roman, serif',
              fontSize: 'clamp(3rem, 8vw, 6rem)',
              fontWeight: 200,
              letterSpacing: '0.1em'
            }}
          >
            Start Your Transformation
          </h2>

          {/* Single Pricing Card */}
          <div className="bg-white p-16 hover:shadow-lg transition-shadow duration-500">
            <h3 
              className="mb-8 text-black"
              style={{
                fontFamily: 'Times New Roman, serif',
                fontSize: '24px',
                fontWeight: 200,
                letterSpacing: '0.1em'
              }}
            >
              Personal Brand Studio
            </h3>

            <div className="flex items-baseline justify-center mb-4">
              <span className="text-black font-light text-[48px]">€47</span>
              <span className="text-gray-600 font-light text-[18px] ml-3">monthly</span>
            </div>

            <p className="text-gray-500 font-light text-[12px] mb-12 tracking-[0.05em]">
              versus €1500+ traditional photoshoots
            </p>

            <button 
              onClick={handleGetStarted}
              className="w-full bg-black text-white py-6 hover:bg-gray-900 transition-all duration-500"
              style={{
                fontSize: '12px',
                fontWeight: 300,
                letterSpacing: '0.3em',
                textTransform: 'uppercase'
              }}
            >
              Begin Transformation
            </button>

            <p className="text-gray-400 font-light text-[10px] mt-6 tracking-[0.05em]">
              30-day money-back guarantee
            </p>
          </div>
        </div>
      </section>

      {/* Final Editorial CTA */}
      <section className="relative py-48 bg-black text-white overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <img
            src="https://sselfie-training-zips.s3.eu-north-1.amazonaws.com/generated-images/42585527/maya_rr4fnv2rb5rm80crzyd87jm48g_0_1756634973175.png"
            alt="Professional transformation"
            className="w-full h-full object-cover object-center"
          />
        </div>

        <div className="relative max-w-4xl mx-auto px-8 text-center">
          <div className="mb-16 text-white/50 text-[10px] font-light tracking-[0.4em] uppercase">
            Your Transformation Begins Now
          </div>

          <h2 
            className="mb-16 text-white leading-[0.9]"
            style={{
              fontFamily: 'Times New Roman, serif',
              fontSize: 'clamp(3rem, 8vw, 6rem)',
              fontWeight: 200,
              letterSpacing: '0.1em'
            }}
          >
            Professional Photography.<br />
            <span className="italic">Monthly Delivery.</span>
          </h2>

          <p className="mb-24 max-w-2xl mx-auto text-white/80 font-light text-[20px] leading-[1.6] tracking-[0.02em]">
            Upload selfies today. Receive 100+ professional brand photographs within 20 minutes.
          </p>

          <button 
            onClick={handleGetStarted}
            className="group inline-block mb-16"
          >
            <span className="text-white border border-white/20 px-16 py-6 group-hover:bg-white group-hover:text-black transition-all duration-500 font-light"
                  style={{
                    fontSize: '12px',
                    fontWeight: 300,
                    letterSpacing: '0.3em',
                    textTransform: 'uppercase'
                  }}>
              Transform Your Brand — €47
            </span>
          </button>

          <div className="grid grid-cols-4 gap-12 text-center max-w-2xl mx-auto">
            <div>
              <p className="font-light mb-2 text-[28px]">24hrs</p>
              <p className="text-white/50 text-[10px] tracking-[0.1em] uppercase">Delivery</p>
            </div>
            <div>
              <p className="font-light mb-2 text-[28px]">100+</p>
              <p className="text-white/50 text-[10px] tracking-[0.1em] uppercase">Images</p>
            </div>
            <div>
              <p className="font-light mb-2 text-[28px]">∞</p>
              <p className="text-white/50 text-[10px] tracking-[0.1em] uppercase">Content</p>
            </div>
            <div>
              <p className="font-light mb-2 text-[28px]">€47</p>
              <p className="text-white/50 text-[10px] tracking-[0.1em] uppercase">Monthly</p>
            </div>
          </div>
        </div>
      </section>

      <GlobalFooter />
    </div>
  );
}
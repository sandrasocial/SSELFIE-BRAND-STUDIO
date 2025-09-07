import React, { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { GlobalFooter } from "../components/global-footer";
import { useStackApp } from "@stackframe/stack";
import { STACK_PROJECT_ID, STACK_PUBLISHABLE_CLIENT_KEY } from "../env";

export default function BusinessLanding() {
  const [, setLocation] = useLocation();
  const [showFAQ, setShowFAQ] = useState(false);
  let app;
  try {
    app = useStackApp();
  } catch (error) {
    app = null;
  }

  // SEO Meta Tags
  useEffect(() => {
    document.title = "SSELFIE Studio - Professional Photos From Your Selfies | €47/month vs €1500+ Photoshoots";

    const metaTags = [
      { name: 'description', content: 'Get 100+ professional brand photos from your selfies in 20 minutes. €47/month vs €1500+ photoshoots. No photographer needed.' },
      { name: 'keywords', content: 'professional photos from selfies, AI headshots, LinkedIn headshots, personal branding photos, brand photography' },
      { name: 'author', content: 'SSELFIE Studio' },
      { name: 'robots', content: 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1.0, viewport-fit=cover' },
      { name: 'theme-color', content: '#000000' },

      // Open Graph
      { property: 'og:title', content: 'SSELFIE Studio - Professional Photos From Your Selfies | €47/month' },
      { property: 'og:description', content: 'Get 100+ professional brand photos from your selfies in 20 minutes. €47/month vs €1500+ photoshoots.' },
      { property: 'og:type', content: 'website' },
      { property: 'og:url', content: 'https://sselfie.ai/business' },
      { property: 'og:image', content: 'https://sselfie.ai/og-business.jpg' },
      { property: 'og:site_name', content: 'SSELFIE Studio' },

      // Twitter
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: 'Professional Photos From Your Selfies | SSELFIE Studio' },
      { name: 'twitter:description', content: 'Get 100+ professional brand photos from your selfies in 20 minutes. €47/month.' },

      // Mobile Optimization
      { name: 'format-detection', content: 'telephone=no' },
      { name: 'apple-mobile-web-app-capable', content: 'yes' },
      { name: 'HandheldFriendly', content: 'true' },
    ];

    // Canonical URL
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', 'https://sselfie.ai/business');

    // Apply meta tags
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

    // Structured Data
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
      if (STACK_PUBLISHABLE_CLIENT_KEY) {
        window.location.href = `/handler/sign-in`;
      }
      return;
    }

    try {
      await app.signInWithOAuth('google');
    } catch (error) {
      console.error('Stack Auth login failed:', error);
    }
  };

  return (
    <div className="min-h-screen bg-white overflow-x-hidden" style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif' }}>
      {/* Transparent Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-transparent transition-all duration-300">
        <div className="max-w-[1400px] mx-auto px-8 py-6">
          <div className="flex items-center justify-between">
            <div 
              className="cursor-pointer text-white transition-opacity duration-300 hover:opacity-70"
              style={{
                fontFamily: "Times New Roman, serif",
                fontSize: '24px',
                fontWeight: 200,
                letterSpacing: '0.25em',
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
                className="text-white/80 hover:text-white transition-all duration-300"
                style={{
                  fontSize: '12px',
                  fontWeight: 300,
                  letterSpacing: '0.15em',
                  textTransform: 'uppercase'
                }}
              >
                Personal
              </button>
              <button 
                onClick={() => setLocation("/teams")}
                className="text-white/80 hover:text-white transition-all duration-300"
                style={{
                  fontSize: '12px',
                  fontWeight: 300,
                  letterSpacing: '0.15em',
                  textTransform: 'uppercase'
                }}
              >
                Teams
              </button>
              <button
                onClick={handleLogin}
                className="text-white/80 hover:text-white transition-all duration-300"
                style={{
                  fontSize: '12px',
                  fontWeight: 300,
                  letterSpacing: '0.15em',
                  textTransform: 'uppercase'
                }}
              >
                Login
              </button>
              <button
                onClick={handleGetStarted}
                className="text-white border border-white/50 hover:bg-white hover:text-black hover:border-white transition-all duration-500 px-8 py-3 group backdrop-blur-sm"
                style={{
                  fontSize: '11px',
                  fontWeight: 300,
                  letterSpacing: '0.2em',
                  textTransform: 'uppercase'
                }}
              >
                Start €47
              </button>
            </div>

            {/* Mobile Navigation */}
            <div className="md:hidden">
              <button
                onClick={handleGetStarted}
                className="text-white border border-white/50 hover:bg-white hover:text-black transition-all duration-300 px-6 py-3 backdrop-blur-sm"
                style={{
                  fontSize: '11px',
                  fontWeight: 300,
                  letterSpacing: '0.2em',
                  textTransform: 'uppercase'
                }}
              >
                Start €47
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Sticky CTA for Mobile */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 p-4">
        <button 
          onClick={handleGetStarted}
          className="w-full bg-black text-white py-4 hover:bg-gray-900 transition-all duration-300"
          style={{
            fontSize: '12px',
            fontWeight: 300,
            letterSpacing: '0.15em',
            textTransform: 'uppercase'
          }}
        >
          Get Professional Photos — €47
        </button>
      </div>

      {/* Full Bleed Editorial Hero */}
      <section className="relative h-screen w-full overflow-hidden">
        {/* Background Image with Parallax Effect */}
        <div className="absolute inset-0 scale-105 transition-transform duration-[2000ms] hover:scale-100">
          <img 
            src="https://sselfie-training-zips.s3.eu-north-1.amazonaws.com/generated-images/undefined/undefined_1756382691095.png"
            alt="Professional transformation"
            className="w-full h-full object-cover object-center"
            loading="eager"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/40 to-black/80" />
        </div>

        {/* Editorial Content Overlay */}
        <div className="absolute inset-0 flex items-center justify-center px-8">
          <div className="max-w-6xl w-full text-center text-white">
            {/* Eyebrow */}
            <p 
              className="text-white/80 mb-8 animate-fade-in"
              style={{
                fontSize: '11px',
                fontWeight: 300,
                letterSpacing: '0.4em',
                textTransform: 'uppercase',
                animationDelay: '300ms'
              }}
            >
              Professional Brand Photography
            </p>

            {/* Sophisticated Hero Typography */}
            <h1 
              className="text-white mb-16 leading-[0.85] animate-fade-in tracking-tight"
              style={{ 
                fontFamily: 'Times New Roman, serif',
                fontWeight: 100,
                fontSize: 'clamp(3rem, 8vw, 7rem)',
                letterSpacing: '0.02em',
                textTransform: 'uppercase',
                animationDelay: '600ms'
              }}
            >
              <span className="block mb-2">From Selfies</span>
              <span className="block mb-2">to Professional</span>
              <span className="block mb-4 text-white/90">Photography</span>
              <span 
                className="block text-white/60"
                style={{
                  fontSize: 'clamp(1.2rem, 3vw, 2.5rem)',
                  letterSpacing: '0.1em',
                  fontWeight: 200
                }}
              >
                in twenty minutes
              </span>
            </h1>

            {/* Refined Value Proposition */}
            <div className="mb-20 space-y-6 animate-fade-in" style={{ animationDelay: '900ms' }}>
              <p 
                className="text-white/95 font-light"
                style={{
                  fontSize: '20px',
                  lineHeight: 1.5,
                  maxWidth: '700px',
                  margin: '0 auto',
                  letterSpacing: '0.02em'
                }}
              >
                One hundred professional brand photographs monthly
              </p>
              <div className="flex items-center justify-center space-x-8">
                <span 
                  className="text-white/80 font-light"
                  style={{
                    fontSize: '16px',
                    letterSpacing: '0.1em'
                  }}
                >
                  €47/month
                </span>
                <span className="text-white/40">•</span>
                <span 
                  className="text-white/60 font-light line-through"
                  style={{
                    fontSize: '14px',
                    letterSpacing: '0.05em'
                  }}
                >
                  €1500+ photoshoots
                </span>
              </div>
            </div>

            {/* Sophisticated CTA */}
            <button 
              onClick={handleGetStarted}
              className="bg-white/10 backdrop-blur-md text-white border border-white/30 px-20 py-6 hover:bg-white hover:text-black hover:border-white transition-all duration-700 group animate-fade-in mb-20 relative overflow-hidden"
              style={{
                fontSize: '11px',
                fontWeight: 200,
                letterSpacing: '0.25em',
                textTransform: 'uppercase',
                animationDelay: '1200ms'
              }}
            >
              <span className="relative z-10 group-hover:tracking-[0.3em] transition-all duration-700">
                Begin Your Transformation
              </span>
              <div className="absolute inset-0 bg-white translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-700" />
            </button>

            {/* Trust Signals */}
            <div className="flex flex-col md:flex-row items-center justify-center space-y-2 md:space-y-0 md:space-x-8 text-white/60 animate-fade-in" style={{ animationDelay: '1500ms' }}>
              <p style={{ fontSize: '11px', fontWeight: 300, letterSpacing: '0.1em' }}>
                ✓ 30-day money-back guarantee
              </p>
              <p style={{ fontSize: '11px', fontWeight: 300, letterSpacing: '0.1em' }}>
                ✓ Cancel anytime
              </p>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white/60">
          <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white/50 rounded-full mt-2 animate-bounce" />
          </div>
        </div>
      </section>

      {/* Editorial Transformation Section */}
      <section className="py-32 bg-white">
        <div className="max-w-[1400px] mx-auto px-8">
          {/* Editorial Header */}
          <div className="text-center mb-24">
            <p 
              className="text-gray-500 mb-8"
              style={{
                fontSize: '11px',
                fontWeight: 300,
                letterSpacing: '0.4em',
                textTransform: 'uppercase'
              }}
            >
              Transformation Gallery
            </p>
            <h2 
              className="text-black max-w-4xl mx-auto"
              style={{
                fontFamily: 'Times New Roman, serif',
                fontSize: 'clamp(2rem, 5vw, 3.5rem)',
                fontWeight: 200,
                letterSpacing: '0.02em',
                lineHeight: 1.1,
                textTransform: 'uppercase'
              }}
            >
              The Same Person.
              <br />
              Professional Results.
            </h2>
          </div>

          {/* Before/After Luxury Grid */}
          <div className="grid lg:grid-cols-2 gap-16 lg:gap-32 items-start max-w-6xl mx-auto">
            {/* Before */}
            <div className="group">
              <div className="relative overflow-hidden bg-gray-50 mb-8 transition-all duration-700 hover:shadow-2xl">
                <div className="aspect-[3/4]">
                  <img
                    src="https://sselfie-training-zips.s3.eu-north-1.amazonaws.com/generated-images/42585527/sandra_y0b8hff1v9rmmp8r5vkwdxj4mr_0_1756585457633.png"
                    alt="Before - regular selfie"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    loading="lazy"
                  />
                </div>
                <div className="absolute top-6 left-6 bg-black/80 text-white px-4 py-2 backdrop-blur-sm">
                  <span style={{ fontSize: '11px', fontWeight: 300, letterSpacing: '0.2em', textTransform: 'uppercase' }}>
                    Before
                  </span>
                </div>
              </div>
              <div className="text-center">
                <p style={{ fontSize: '14px', fontWeight: 300, color: '#666' }}>
                  Regular phone selfie
                </p>
              </div>
            </div>

            {/* After */}
            <div className="group">
              <div className="relative overflow-hidden bg-gray-50 mb-8 transition-all duration-700 hover:shadow-2xl">
                <div className="aspect-[3/4]">
                  <img
                    src="https://sselfie-training-zips.s3.eu-north-1.amazonaws.com/generated-images/42585527/maya_g826ygf2d9rm80crzjkvnvmpyr_0_1756585536824.png"
                    alt="After - professional photo"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    loading="lazy"
                  />
                </div>
                <div className="absolute top-6 left-6 bg-white/90 text-black px-4 py-2 backdrop-blur-sm">
                  <span style={{ fontSize: '11px', fontWeight: 300, letterSpacing: '0.2em', textTransform: 'uppercase' }}>
                    After
                  </span>
                </div>
              </div>
              <div className="text-center">
                <p style={{ fontSize: '14px', fontWeight: 300, color: '#666' }}>
                  Professional brand photo
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Editorial Process Section */}
      <section className="py-32 bg-gray-50">
        <div className="max-w-[1400px] mx-auto px-8">
          {/* Section Header */}
          <div className="mb-24">
            <p 
              className="text-gray-500 mb-8"
              style={{
                fontSize: '11px',
                fontWeight: 300,
                letterSpacing: '0.4em',
                textTransform: 'uppercase'
              }}
            >
              The Process
            </p>
            <h2 
              className="text-black max-w-3xl"
              style={{
                fontFamily: 'Times New Roman, serif',
                fontSize: 'clamp(2rem, 5vw, 3.5rem)',
                fontWeight: 200,
                letterSpacing: '0.02em',
                lineHeight: 1.1,
                textTransform: 'uppercase'
              }}
            >
              Simple. Elegant. Professional.
            </h2>
          </div>

          {/* Luxury Process Grid */}
          <div className="grid lg:grid-cols-3 gap-16">
            {/* Step 1 */}
            <div className="group">
              <div className="relative overflow-hidden bg-white mb-8 transition-all duration-700 hover:shadow-2xl hover:-translate-y-1">
                <div className="aspect-[3/4]">
                  <img
                    src="https://e33979fc-c9be-4f0d-9a7b-6a3e83046828-00-3ij9k7qy14rai.picard.replit.dev/api/proxy-image?url=https%3A%2F%2Fsselfie-training-zips.s3.eu-north-1.amazonaws.com%2Fgenerated-images%2F42585527%2Fmaya_gn5xs1grwxrme0cs3g4tfwe220_0_1757111996442.png"
                    alt="Upload selfies"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    loading="lazy"
                  />
                </div>
                <div className="absolute top-6 right-6 bg-black text-white w-12 h-12 rounded-full flex items-center justify-center text-lg font-light">
                  01
                </div>
              </div>
              <div>
                <h3 
                  className="text-black mb-4"
                  style={{
                    fontFamily: 'Times New Roman, serif',
                    fontSize: '20px',
                    fontWeight: 200,
                    letterSpacing: '0.05em',
                    textTransform: 'uppercase'
                  }}
                >
                  Upload Your Selfies
                </h3>
                <p 
                  className="text-gray-600"
                  style={{
                    fontSize: '15px',
                    fontWeight: 300,
                    lineHeight: 1.7
                  }}
                >
                  Any lighting, any background. 15 photos from your phone are all we need.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="group">
              <div className="relative overflow-hidden bg-white mb-8 transition-all duration-700 hover:shadow-2xl hover:-translate-y-1">
                <div className="aspect-[3/4]">
                  <img
                    src="https://sselfie-training-zips.s3.eu-north-1.amazonaws.com/generated-images/42585527/maya_8r00hax7n1rm80cryjbs9enxam_0_1756450255292.png"
                    alt="AI training"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    loading="lazy"
                  />
                </div>
                <div className="absolute top-6 right-6 bg-black text-white w-12 h-12 rounded-full flex items-center justify-center text-lg font-light">
                  02
                </div>
              </div>
              <div>
                <h3 
                  className="text-black mb-4"
                  style={{
                    fontFamily: 'Times New Roman, serif',
                    fontSize: '20px',
                    fontWeight: 200,
                    letterSpacing: '0.05em',
                    textTransform: 'uppercase'
                  }}
                >
                  AI Model Training
                </h3>
                <p 
                  className="text-gray-600"
                  style={{
                    fontSize: '15px',
                    fontWeight: 300,
                    lineHeight: 1.7
                  }}
                >
                  Our system learns your unique features and style in just 20 minutes.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="group">
              <div className="relative overflow-hidden bg-white mb-8 transition-all duration-700 hover:shadow-2xl hover:-translate-y-1">
                <div className="aspect-[3/4]">
                  <img
                    src="https://sselfie-training-zips.s3.eu-north-1.amazonaws.com/generated-images/42585527/maya_5s2emwbk3srma0crywrbh9kg4c_0_1756493820306.png"
                    alt="Professional results"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    loading="lazy"
                  />
                </div>
                <div className="absolute top-6 right-6 bg-black text-white w-12 h-12 rounded-full flex items-center justify-center text-lg font-light">
                  03
                </div>
              </div>
              <div>
                <h3 
                  className="text-black mb-4"
                  style={{
                    fontFamily: 'Times New Roman, serif',
                    fontSize: '20px',
                    fontWeight: 200,
                    letterSpacing: '0.05em',
                    textTransform: 'uppercase'
                  }}
                >
                  Professional Gallery
                </h3>
                <p 
                  className="text-gray-600"
                  style={{
                    fontSize: '15px',
                    fontWeight: 300,
                    lineHeight: 1.7
                  }}
                >
                  100+ photos monthly. LinkedIn, Instagram, and website ready.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Editorial Suitability Section */}
      <section className="py-32 bg-white">
        <div className="max-w-5xl mx-auto px-8">
          <h2 
            className="text-black text-center mb-24"
            style={{
              fontFamily: 'Times New Roman, serif',
              fontSize: 'clamp(2rem, 5vw, 3rem)',
              fontWeight: 200,
              letterSpacing: '0.02em',
              lineHeight: 1.1,
              textTransform: 'uppercase'
            }}
          >
            Is This Right For You?
          </h2>

          <div className="grid lg:grid-cols-2 gap-24">
            {/* Perfect If */}
            <div className="editorial-card bg-white p-12 border border-gray-100 transition-all duration-700 hover:bg-black hover:text-white hover:border-black group">
              <h3 
                className="text-green-700 group-hover:text-green-400 mb-8 transition-colors duration-700"
                style={{
                  fontSize: '14px',
                  fontWeight: 400,
                  letterSpacing: '0.2em',
                  textTransform: 'uppercase'
                }}
              >
                Perfect if you
              </h3>
              <div className="space-y-6">
                {[
                  "Need professional photos for LinkedIn or social media",
                  "Want to avoid €1500+ traditional photoshoots",
                  "Run out of quality content to post regularly",
                  "Have decent selfies on your phone",
                  "Value authenticity over artificial perfection"
                ].map((item, index) => (
                  <div key={index} className="flex items-start space-x-4">
                    <span className="text-green-700 group-hover:text-green-400 mt-1 transition-colors duration-700">✓</span>
                    <p 
                      className="text-gray-700 group-hover:text-white transition-colors duration-700"
                      style={{
                        fontSize: '15px',
                        fontWeight: 300,
                        lineHeight: 1.7
                      }}
                    >
                      {item}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Not Suitable If */}
            <div className="editorial-card bg-white p-12 border border-gray-100 transition-all duration-700 hover:bg-black hover:text-white hover:border-black group">
              <h3 
                className="text-red-700 group-hover:text-red-400 mb-8 transition-colors duration-700"
                style={{
                  fontSize: '14px',
                  fontWeight: 400,
                  letterSpacing: '0.2em',
                  textTransform: 'uppercase'
                }}
              >
                Not suitable if
              </h3>
              <div className="space-y-6">
                {[
                  "You only have 1-2 selfies available",
                  "You need group photos or product photography",
                  "You prefer traditional photography exclusively",
                  "You need same-day photo delivery",
                  "You don't maintain an online presence"
                ].map((item, index) => (
                  <div key={index} className="flex items-start space-x-4">
                    <span className="text-red-700 group-hover:text-red-400 mt-1 transition-colors duration-700">✗</span>
                    <p 
                      className="text-gray-700 group-hover:text-white transition-colors duration-700"
                      style={{
                        fontSize: '15px',
                        fontWeight: 300,
                        lineHeight: 1.7
                      }}
                    >
                      {item}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Minimalist FAQ Section */}
      <section className="py-32 bg-gray-50">
        <div className="max-w-4xl mx-auto px-8">
          <div className="mb-24">
            <h2 
              className="text-black"
              style={{
                fontFamily: 'Times New Roman, serif',
                fontSize: 'clamp(2rem, 5vw, 3rem)',
                fontWeight: 200,
                letterSpacing: '0.02em',
                lineHeight: 1.1,
                textTransform: 'uppercase'
              }}
            >
              Questions & Answers
            </h2>
          </div>

          <div className="space-y-12">
            {[
              {
                q: "Do I need professional selfies to start?",
                a: "No. Regular phone selfies work perfectly. Mirror selfies, car selfies, bathroom selfies—we've seen it all work great."
              },
              {
                q: "What about glasses, skin tone, or unique features?",
                a: "Our AI works with all skin tones, glasses, facial hair, and unique features. It learns your specific look and maintains it across all generated photos."
              },
              {
                q: "Can I cancel anytime?",
                a: "Yes. Cancel anytime with one click. No contracts, no questions asked. Plus, 30-day money-back guarantee."
              },
              {
                q: "Will my photos be used to train other AI models?",
                a: "Never. Your photos are used only to create your personal AI model. We never share, sell, or use your photos for training other models."
              },
              {
                q: "How long until I get my first photos?",
                a: "Your AI model trains in 20 minutes. You can start generating professional photos immediately after training completes."
              }
            ].map((faq, index) => (
              <div key={index} className="group cursor-pointer">
                <div className="border-b border-gray-200 pb-8 transition-all duration-500 hover:border-black">
                  <h3 
                    className="text-black mb-4 group-hover:text-gray-600 transition-colors duration-500"
                    style={{
                      fontSize: '18px',
                      fontWeight: 300,
                      lineHeight: 1.4
                    }}
                  >
                    {faq.q}
                  </h3>
                  <p 
                    className="text-gray-600 group-hover:text-black transition-colors duration-500"
                    style={{
                      fontSize: '15px',
                      fontWeight: 300,
                      lineHeight: 1.7
                    }}
                  >
                    {faq.a}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Editorial Pricing Section */}
      <section className="py-32 bg-white">
        <div className="max-w-3xl mx-auto px-8 text-center">
          <div className="mb-16">
            <p 
              className="text-gray-500 mb-8"
              style={{
                fontSize: '11px',
                fontWeight: 300,
                letterSpacing: '0.4em',
                textTransform: 'uppercase'
              }}
            >
              Investment
            </p>
            <h2 
              className="text-black"
              style={{
                fontFamily: 'Times New Roman, serif',
                fontSize: 'clamp(2rem, 5vw, 3rem)',
                fontWeight: 200,
                letterSpacing: '0.02em',
                lineHeight: 1.1,
                textTransform: 'uppercase'
              }}
            >
              Simple, Transparent Pricing
            </h2>
          </div>

          <div className="editorial-card bg-white p-16 border border-gray-100 transition-all duration-700 hover:shadow-2xl group">
            <h3 
              className="text-black mb-8"
              style={{
                fontFamily: 'Times New Roman, serif',
                fontSize: '24px',
                fontWeight: 200,
                letterSpacing: '0.1em',
                textTransform: 'uppercase'
              }}
            >
              Personal Brand Studio
            </h3>

            <div className="mb-8">
              <span 
                className="text-black"
                style={{
                  fontSize: '60px',
                  fontWeight: 200
                }}
              >
                €47
              </span>
              <span 
                className="text-gray-500 ml-2"
                style={{
                  fontSize: '18px',
                  fontWeight: 300
                }}
              >
                per month
              </span>
            </div>

            <p 
              className="text-gray-500 mb-16"
              style={{
                fontSize: '14px',
                fontWeight: 300
              }}
            >
              vs €1500+ traditional photoshoots
            </p>

            <div className="text-left space-y-6 mb-16 max-w-md mx-auto">
              {[
                "100+ professional photos monthly",
                "LinkedIn, Instagram, website ready",
                "Business, lifestyle, editorial styles",
                "20-minute setup process",
                "Cancel anytime",
                "30-day money-back guarantee"
              ].map((feature, index) => (
                <div key={index} className="flex items-start space-x-4">
                  <span className="text-gray-400 mt-1">✓</span>
                  <p 
                    className="text-gray-700"
                    style={{
                      fontSize: '15px',
                      fontWeight: 300
                    }}
                  >
                    {feature}
                  </p>
                </div>
              ))}
            </div>

            <button 
              onClick={handleGetStarted}
              className="w-full bg-black text-white py-4 hover:bg-gray-900 transition-all duration-500 group mb-8"
              style={{
                fontSize: '12px',
                fontWeight: 300,
                letterSpacing: '0.15em',
                textTransform: 'uppercase'
              }}
            >
              <span className="group-hover:tracking-[0.2em] transition-all duration-500">
                Start Your Transformation
              </span>
            </button>

            <p 
              className="text-gray-400"
              style={{
                fontSize: '11px',
                fontWeight: 300
              }}
            >
              30-day money-back guarantee • Cancel anytime
            </p>
          </div>
        </div>
      </section>

      {/* Founder Story Section */}
      <section className="py-32 bg-gray-50">
        <div className="max-w-[1400px] mx-auto px-8">
          <div className="grid lg:grid-cols-2 gap-24 items-center">
            <div className="group">
              <div className="aspect-[3/4] bg-white overflow-hidden transition-all duration-700 hover:shadow-2xl">
                <img
                  src="https://sselfie-training-zips.s3.eu-north-1.amazonaws.com/generated-images/42585527/maya_g826ygf2d9rm80crzjkvnvmpyr_0_1756585536824.png"
                  alt="Sandra Sigurjónsdóttir, Founder"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  loading="lazy"
                />
              </div>
            </div>

            <div className="lg:pl-16">
              <p 
                className="text-gray-500 mb-8"
                style={{
                  fontSize: '11px',
                  fontWeight: 300,
                  letterSpacing: '0.4em',
                  textTransform: 'uppercase'
                }}
              >
                The Founder
              </p>

              <h3 
                className="text-black mb-16"
                style={{
                  fontFamily: 'Times New Roman, serif',
                  fontSize: 'clamp(1.8rem, 4vw, 2.5rem)',
                  fontWeight: 200,
                  letterSpacing: '0.02em',
                  lineHeight: 1.1,
                  textTransform: 'uppercase'
                }}
              >
                I built this because I needed it
              </h3>

              <div className="grid grid-cols-2 gap-16 mb-16">
                <div>
                  <p 
                    className="text-black mb-3"
                    style={{
                      fontSize: '32px',
                      fontWeight: 200
                    }}
                  >
                    120K
                  </p>
                  <p 
                    className="text-gray-600"
                    style={{
                      fontSize: '12px',
                      fontWeight: 300,
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase'
                    }}
                  >
                    Followers built with this method
                  </p>
                </div>
                <div>
                  <p 
                    className="text-black mb-3"
                    style={{
                      fontSize: '32px',
                      fontWeight: 200
                    }}
                  >
                    €12 → Business
                  </p>
                  <p 
                    className="text-gray-600"
                    style={{
                      fontSize: '12px',
                      fontWeight: 300,
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase'
                    }}
                  >
                    Started with almost nothing
                  </p>
                </div>
              </div>

              <div className="space-y-8 mb-16">
                <p 
                  className="text-gray-700"
                  style={{
                    fontSize: '18px',
                    fontWeight: 300,
                    lineHeight: 1.7
                  }}
                >
                  Single mom. Divorced. €12 in my bank account. I knew I needed professional photos to build anything online.
                </p>

                <p 
                  className="text-gray-700"
                  style={{
                    fontSize: '18px',
                    fontWeight: 300,
                    lineHeight: 1.7
                  }}
                >
                  I couldn't afford €1500 photoshoots, so I figured out how to make my phone selfies work professionally.
                </p>

                <p 
                  className="text-black"
                  style={{
                    fontSize: '18px',
                    fontWeight: 400,
                    lineHeight: 1.7
                  }}
                >
                  If it worked for me, it'll work for you.
                </p>
              </div>

              <div className="border-l-4 border-black pl-8">
                <p 
                  className="text-black mb-4"
                  style={{
                    fontFamily: 'Times New Roman, serif',
                    fontSize: '20px',
                    fontWeight: 200,
                    fontStyle: 'italic',
                    lineHeight: 1.4
                  }}
                >
                  "Your mess is your message. Your phone has everything you need."
                </p>
                <p 
                  className="text-gray-600"
                  style={{
                    fontSize: '12px',
                    fontWeight: 300,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase'
                  }}
                >
                  Sandra Sigurjónsdóttir
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final Editorial CTA Section */}
      <section className="relative py-32 bg-black text-white overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="w-full h-full bg-gradient-to-br from-white/10 to-transparent" />
        </div>

        <div className="relative max-w-4xl mx-auto px-8 text-center">
          <h2 
            className="text-white mb-16"
            style={{
              fontFamily: 'Times New Roman, serif',
              fontSize: 'clamp(2rem, 5vw, 3.5rem)',
              fontWeight: 200,
              letterSpacing: '0.02em',
              lineHeight: 1.1,
              textTransform: 'uppercase'
            }}
          >
            Ready to Never Run Out of
            <br />
            Professional Photos?
          </h2>

          <p 
            className="text-white/80 mb-20 max-w-2xl mx-auto"
            style={{
              fontSize: '18px',
              fontWeight: 300,
              lineHeight: 1.7
            }}
          >
            Upload your selfies today. Get 100+ professional brand photos in 20 minutes.
          </p>

          <button 
            onClick={handleGetStarted}
            className="bg-white text-black px-20 py-5 hover:bg-gray-100 transition-all duration-500 group mb-20"
            style={{
              fontSize: '12px',
              fontWeight: 300,
              letterSpacing: '0.15em',
              textTransform: 'uppercase'
            }}
          >
            <span className="group-hover:tracking-[0.2em] transition-all duration-500">
              Start for €47
            </span>
          </button>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-16 max-w-3xl mx-auto">
            {[
              { number: "20min", label: "Setup" },
              { number: "100+", label: "Photos" },
              { number: "€47", label: "Monthly" },
              { number: "30d", label: "Guarantee" }
            ].map((stat, index) => (
              <div key={index} className="text-center group cursor-default">
                <p 
                  className="text-white mb-3 group-hover:scale-110 transition-transform duration-500"
                  style={{
                    fontSize: '28px',
                    fontWeight: 200
                  }}
                >
                  {stat.number}
                </p>
                <p 
                  className="text-white/60"
                  style={{
                    fontSize: '11px',
                    fontWeight: 300,
                    letterSpacing: '0.2em',
                    textTransform: 'uppercase'
                  }}
                >
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <GlobalFooter />

      {/* CSS for animations */}
      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 1000ms cubic-bezier(0.4, 0, 0.2, 1) forwards;
          opacity: 0;
        }

        .editorial-card {
          transition: all 700ms cubic-bezier(0.4, 0, 0.2, 1);
        }

        .editorial-card:hover {
          transform: translateY(-8px);
        }

        /* Custom scrollbar */
        ::-webkit-scrollbar {
          width: 4px;
        }

        ::-webkit-scrollbar-track {
          background: #f5f5f5;
        }

        ::-webkit-scrollbar-thumb {
          background: #000;
          border-radius: 2px;
        }
      `}</style>
    </div>
  );
}
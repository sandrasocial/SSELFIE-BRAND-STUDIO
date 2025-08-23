import React, { useState, useEffect } from 'react';
import { HeroFullBleed } from '../components/hero-full-bleed';
import { SandraImages } from '../components/sandra-image-library';
import { PreLoginNavigationUnified } from '../components/pre-login-navigation-unified';
import { GlobalFooter } from '../components/global-footer';
import { Link } from 'wouter';

const steps = [
  {
    number: "01",
    title: "Choose your plan",
    description: "Basic (€29/month): Personal AI model + 30 photos + Maya AI photographer. Full Access (€67/month): Everything in Basic + 100 photos + Victoria website builder + luxury flatlay library.",
    image: SandraImages.editorial.phone2
  },
  {
    number: "02", 
    title: "Upload your selfies",
    description: "10-15 photos. You get a dead-simple tutorial: 'Face the window, wear what you love, no need for a ring light.'",
    image: "https://i.postimg.cc/bNF14sGc/out-1_(4).png"
  },
  {
    number: "03",
    title: "Meet your AI agents",
    description: "MAYA (celebrity stylist/photographer) creates your editorial images. VICTORIA (brand strategist) builds your complete website. Both chat with you like real consultants.",
    image: "https://i.postimg.cc/K8p0tmbN/out-0-9.webp"
  },
  {
    number: "04",
    title: "Watch the magic",
    description: "Custom AI generates professional editorial photos instantly. No more waiting weeks for a photoshoot or spending thousands on brand photography.",
    image: "https://i.postimg.cc/4N8v1bP5/IMG-6564.jpg"
  },
  {
    number: "05",
    title: "Launch your brand",
    description: "Your best images populate every page. Booking, payments, custom domain connect with one click. Live business in 20 minutes, not 20 weeks.",
    image: "https://i.postimg.cc/nz3mFnXJ/out-3.png"
  }
];

const faqs = [
  {
    question: "What's the difference between Basic and Full Access?",
    answer: "Basic (€29/month): Personal AI model + 30 photos + Maya AI photographer. Full Access (€67/month): Everything in Basic + 100 photos + Victoria website builder + luxury flatlay library + all future features."
  },
  {
    question: "Do I need to be tech-savvy?",
    answer: "Nope. If you can text, you can do this. Everything is one-click simple for both tiers."
  },
  {
    question: "What if I don't have professional photos?",
    answer: "That's the point. Just your phone and window light. I'll show you exactly how to take selfies that work."
  },
  {
    question: "How long does this actually take?",
    answer: "About 20 minutes from first selfie to live business page. Most women do it between coffee and school pickup."
  },
  {
    question: "Who are MAYA and VICTORIA?",
    answer: "MAYA is your celebrity stylist/photographer who creates editorial images. VICTORIA is your brand strategist who builds complete websites. Both are AI agents trained on Sandra's expertise."
  },
  {
    question: "Can I upgrade from Basic to Full Access later?",
    answer: "Absolutely. Start with Basic, upgrade to Full Access anytime when you're ready for Victoria's website builder and the complete ecosystem."
  }
];

export default function HowItWorksPage() {
  // SEO Meta tags setup
  useEffect(() => {
    // Update page title
    document.title = "How It Works - SSELFIE Studio | AI Personal Branding in 20 Minutes";
    
    // Update meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Learn how SSELFIE Studio transforms your phone selfies into professional brand photos in 20 minutes. AI celebrity stylist MAYA + brand strategist VICTORIA = your complete business launch.');
    }

    // Update Open Graph tags
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) {
      ogTitle.setAttribute('content', 'How It Works - Build Your Brand in 20 Minutes | SSELFIE Studio');
    }

    const ogDescription = document.querySelector('meta[property="og:description"]');
    if (ogDescription) {
      ogDescription.setAttribute('content', 'Transform your phone selfies into professional brand photos with AI. Meet MAYA (celebrity stylist) and VICTORIA (brand strategist) - your complete business launch in 20 minutes.');
    }

    const ogUrl = document.querySelector('meta[property="og:url"]');
    if (ogUrl) {
      ogUrl.setAttribute('content', 'https://sselfie.ai/how-it-works');
    }

    // Update Twitter Card tags
    const twitterTitle = document.querySelector('meta[property="twitter:title"]');
    if (twitterTitle) {
      twitterTitle.setAttribute('content', 'How It Works - SSELFIE Studio AI Personal Branding');
    }

    const twitterDescription = document.querySelector('meta[property="twitter:description"]');
    if (twitterDescription) {
      twitterDescription.setAttribute('content', 'Transform your phone selfies into professional brand photos in 20 minutes with AI celebrity stylist and brand strategist.');
    }

    // Add structured data for How-to page
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "HowTo",
      "name": "How to Build Your Personal Brand with AI in 20 Minutes",
      "description": "Step-by-step guide to transforming phone selfies into professional brand photos and complete business launch using SSELFIE Studio",
      "totalTime": "PT20M",
      "supply": [
        {
          "@type": "HowToSupply",
          "name": "Phone camera"
        },
        {
          "@type": "HowToSupply", 
          "name": "Natural lighting"
        }
      ],
      "tool": [
        {
          "@type": "HowToTool",
          "name": "SSELFIE Studio AI Platform"
        }
      ],
      "step": [
        {
          "@type": "HowToStep",
          "name": "Choose Your Plan",
          "text": "Start with Basic (€29/month) or Full Access (€67/month) for complete ecosystem",
          "url": "https://sselfie.ai/pricing"
        },
        {
          "@type": "HowToStep", 
          "name": "Upload Selfies",
          "text": "Upload 10-15 phone selfies with natural lighting",
          "url": "https://sselfie.ai/how-it-works#upload"
        },
        {
          "@type": "HowToStep",
          "name": "Meet AI Agents", 
          "text": "MAYA (celebrity stylist) and VICTORIA (brand strategist) create your content",
          "url": "https://sselfie.ai/how-it-works#agents"
        },
        {
          "@type": "HowToStep",
          "name": "AI Generation",
          "text": "Custom AI generates professional editorial photos instantly", 
          "url": "https://sselfie.ai/how-it-works#generation"
        },
        {
          "@type": "HowToStep",
          "name": "Launch Brand",
          "text": "Complete website with booking, payments, and custom domain in 20 minutes",
          "url": "https://sselfie.ai/how-it-works#launch"
        }
      ],
      "about": {
        "@type": "Organization",
        "name": "SSELFIE Studio",
        "url": "https://sselfie.ai"
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

  return (
    <div className="bg-white"
         itemScope 
         itemType="https://schema.org/HowTo"
    >
      {/* Standardized Navigation */}
      <PreLoginNavigationUnified />
      
      <main>
        {/* Hero Section */}
        <HeroFullBleed
          backgroundImage={SandraImages.hero.about}
          tagline="YOUR STORY, YOUR SELFIE, YOUR WAY"
          title="HOW IT WORKS"
          ctaText="SKIP THE OVERTHINKING"
          ctaLink="/pricing"
          fullHeight={true}
        />

        {/* Intro Section - Editorial Typography */}
        <section className="py-20 md:py-32 px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto text-center">
            <div className="mb-16 md:mb-20">
              <h1 
                className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-light mb-6 tracking-[-0.02em] text-[#0a0a0a]" 
                style={{ fontFamily: 'Times New Roman, serif' }}
              >
                Build your brand<br />in 20 minutes
              </h1>
              <div className="w-16 h-px bg-[#B5B5B3] mx-auto"></div>
            </div>
            
            <div className="max-w-4xl mx-auto space-y-8 md:space-y-10">
              <p 
                className="text-xl md:text-2xl lg:text-3xl font-light leading-relaxed text-[#0a0a0a] italic"
                style={{ fontFamily: 'Times New Roman, serif' }}
              >
                This isn't about perfect photos.
              </p>
              
              <div className="space-y-6 text-lg md:text-xl leading-relaxed text-[#333] font-light max-w-3xl mx-auto">
                <p>It's about your personal brand, built from your selfies with celebrity-level AI styling.</p>
                <p 
                  className="text-xl md:text-2xl font-light italic text-[#0a0a0a] border-l-2 border-[#B5B5B3] pl-8"
                  style={{ fontFamily: 'Times New Roman, serif' }}
                >
                  Here's exactly how it works when you're not in the mood to overthink it
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Steps Section - Enhanced Editorial Design */}
        <section className="py-20 md:py-32 px-4 sm:px-6 lg:px-8 bg-[#f5f5f5]">
          <div className="max-w-7xl mx-auto">
            <div className="space-y-24 md:space-y-32">
              {steps.map((step, index) => (
                <div key={index} className={`grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center ${index % 2 === 1 ? 'lg:[&>*:first-child]:order-2' : ''}`}>
                  <div className="space-y-6 lg:space-y-8">
                    <div className="flex items-baseline gap-4 mb-6">
                      <span 
                        className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-light text-[#0a0a0a] tracking-[-0.02em] leading-none" 
                        style={{ fontFamily: 'Times New Roman, serif' }}
                      >
                        {step.number}
                      </span>
                      <div className="w-8 h-px bg-[#B5B5B3] mt-8"></div>
                    </div>
                    
                    <h2 
                      className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-light text-[#0a0a0a] mb-6 tracking-[-0.01em] leading-tight" 
                      style={{ fontFamily: 'Times New Roman, serif' }}
                    >
                      {step.title}
                    </h2>
                    
                    <p className="text-base sm:text-lg md:text-xl leading-relaxed text-[#333] font-light max-w-lg">
                      {step.description}
                    </p>
                  </div>
                  
                  <div className="relative">
                    <div className="aspect-[4/3] overflow-hidden bg-white shadow-sm">
                      <img
                        src={step.image}
                        alt={`Step ${step.number}: ${step.title}`}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                        loading="lazy"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Transformation Preview - Enhanced Editorial Design */}
        <section className="py-20 md:py-32 px-4 sm:px-6 lg:px-8 bg-white">
          <div className="max-w-6xl mx-auto text-center">
            <div className="mb-16 md:mb-20">
              <h2 
                className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-light mb-6 tracking-[-0.02em] text-[#0a0a0a]" 
                style={{ fontFamily: 'Times New Roman, serif' }}
              >
                Before and after
              </h2>
              <div className="w-16 h-px bg-[#B5B5B3] mx-auto"></div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 lg:gap-16 items-center max-w-5xl mx-auto">
              <div className="text-center">
                <div className="aspect-[3/4] mb-6 overflow-hidden bg-white shadow-sm">
                  <img
                    src="https://i.postimg.cc/76XHGVrv/IMG-3168.jpg"
                    alt="Before: Phone selfie"
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
                <p 
                  className="text-xs sm:text-sm tracking-[0.3em] uppercase text-[#666] font-light"
                  style={{ fontFamily: 'Times New Roman, serif' }}
                >
                  Before
                </p>
                <p className="text-sm text-[#999] mt-2 font-light">Your phone selfie</p>
              </div>
              
              <div className="flex justify-center items-center">
                <div className="text-center space-y-4">
                  <span 
                    className="text-3xl md:text-4xl text-[#0a0a0a] font-light block"
                    style={{ fontFamily: 'Times New Roman, serif' }}
                  >
                    →
                  </span>
                  <p 
                    className="text-xs tracking-[0.4em] uppercase text-[#999] font-light"
                    style={{ fontFamily: 'Times New Roman, serif' }}
                  >
                    AI Magic
                  </p>
                </div>
              </div>
              
              <div className="text-center">
                <div className="aspect-[3/4] mb-6 overflow-hidden bg-white shadow-sm">
                  <img
                    src="https://i.postimg.cc/0jQ8pw9z/IMG-6563.png"
                    alt="After: AI-enhanced editorial photo"
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
                <p 
                  className="text-xs sm:text-sm tracking-[0.3em] uppercase text-[#666] font-light"
                  style={{ fontFamily: 'Times New Roman, serif' }}
                >
                  After
                </p>
                <p className="text-sm text-[#999] mt-2 font-light">Editorial perfection</p>
              </div>
            </div>
            
            <div className="mt-16 md:mt-20">
              <p 
                className="text-xl md:text-2xl lg:text-3xl font-light text-[#0a0a0a] italic"
                style={{ fontFamily: 'Times New Roman, serif' }}
              >
                This could be you.
              </p>
            </div>
          </div>
        </section>

        {/* Quick FAQs - Enhanced Mobile Responsiveness */}
        <section className="py-16 sm:py-20 md:py-24 px-4 sm:px-6 lg:px-8" 
                 itemScope 
                 itemType="https://schema.org/FAQPage">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12 sm:mb-16">
              <h2 
                className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-light text-[#0a0a0a] mb-4 tracking-[-0.01em]" 
                style={{ fontFamily: 'Times New Roman, serif' }}
                itemProp="headline"
              >
                The questions you're actually thinking
              </h2>
              <div className="w-16 h-px bg-[#B5B5B3] mx-auto"></div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-10 md:gap-12">
              {faqs.map((faq, index) => (
                <div key={index} 
                     className="space-y-3 sm:space-y-4"
                     itemScope 
                     itemType="https://schema.org/Question">
                  <h3 
                    className="text-lg sm:text-xl font-medium text-[#0a0a0a] leading-tight"
                    itemProp="name"
                  >
                    {faq.question}
                  </h3>
                  <div itemScope itemType="https://schema.org/Answer">
                    <p 
                      className="text-base sm:text-lg leading-relaxed text-[#666666] font-light"
                      itemProp="text"
                    >
                      {faq.answer}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Power Quote & CTA - Enhanced Mobile Design */}
        <section id="get-started" 
                 className="py-16 sm:py-20 md:py-24 px-4 sm:px-6 lg:px-8 bg-[#0a0a0a] text-center"
                 itemScope 
                 itemType="https://schema.org/Organization">
          <div className="max-w-5xl mx-auto">
            <blockquote 
              className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-light text-white mb-8 sm:mb-12 tracking-[-0.01em] px-4" 
              style={{ fontFamily: 'Times New Roman, serif' }}
              itemProp="slogan"
            >
              "You don't need a plan.<br className="hidden sm:block" />
              <span className="sm:hidden"> </span>Just one brave selfie."
            </blockquote>
            
            <p className="text-base sm:text-lg text-white/80 mb-8 sm:mb-12 max-w-2xl mx-auto font-light px-4">
              Stop waiting for the perfect moment. Start with what you have, where you are, right now.
            </p>
            
            <Link 
              href="/pricing" 
              className="inline-block text-white border border-white/30 hover:bg-white hover:text-[#0a0a0a] transition-colors duration-300 text-[10px] sm:text-[11px] tracking-[0.25em] sm:tracking-[0.3em] uppercase no-underline px-8 sm:px-12 py-4 sm:py-6 font-light w-full sm:w-auto max-w-xs sm:max-w-none"
              itemProp="url"
              aria-label="Start building your personal brand with SSELFIE Studio"
            >
              STOP WAITING, START BUILDING
            </Link>
          </div>
        </section>
      </main>

      {/* Global Footer */}
      <GlobalFooter />
    </div>
  );
}
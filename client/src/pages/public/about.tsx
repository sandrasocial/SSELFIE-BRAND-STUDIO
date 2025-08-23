import React, { useState, useEffect } from 'react';
import { PreLoginNavigationUnified } from '../../components/pre-login-navigation-unified';
import { HeroFullBleed } from '../../components/hero-full-bleed';
import { EditorialStory } from '../../components/editorial-story';
import { EditorialImageBreak } from '../../components/editorial-image-break';
import PowerQuote from '../../components/power-quote';
import { EditorialTestimonials } from '../../components/editorial-testimonials';
import WelcomeEditorial from '../../components/welcome-editorial';
import { EmailCaptureModal } from '../../components/email-capture-modal';
import { GlobalFooter } from '../../components/global-footer';
import { SandraImages } from '../../lib/sandra-images';

export default function AboutPage() {
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);

  const handleEmailCaptured = (email: string) => {
    // Email captured successfully - could redirect to onboarding or show success message
    console.log('Email captured:', email);
  };

  // SEO Meta tags setup
  useEffect(() => {
    // Update page title
    document.title = "About Sandra - SSELFIE Studio Founder | AI Personal Branding Pioneer";
    
    // Update meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Meet Sandra Sigurjónsdóttir, founder of SSELFIE Studio. From divorced single mom to 120K followers in 90 days. Learn how she built the AI personal branding revolution.');
    }

    // Update Open Graph tags
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) {
      ogTitle.setAttribute('content', 'About Sandra - SSELFIE Studio Founder');
    }

    const ogDescription = document.querySelector('meta[property="og:description"]');
    if (ogDescription) {
      ogDescription.setAttribute('content', 'Meet Sandra Sigurjónsdóttir, founder of SSELFIE Studio. From divorced single mom to 120K followers in 90 days.');
    }

    const ogUrl = document.querySelector('meta[property="og:url"]');
    if (ogUrl) {
      ogUrl.setAttribute('content', 'https://sselfie.ai/about');
    }

    // Update Twitter Card tags
    const twitterTitle = document.querySelector('meta[property="twitter:title"]');
    if (twitterTitle) {
      twitterTitle.setAttribute('content', 'About Sandra - SSELFIE Studio Founder');
    }

    const twitterDescription = document.querySelector('meta[property="twitter:description"]');
    if (twitterDescription) {
      twitterDescription.setAttribute('content', 'Meet Sandra Sigurjónsdóttir, founder of SSELFIE Studio. From divorced single mom to 120K followers in 90 days.');
    }

    // Add structured data for About page
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "AboutPage",
      "mainEntity": {
        "@type": "Person",
        "name": "Sandra Sigurjónsdóttir",
        "jobTitle": "Founder & CEO",
        "worksFor": {
          "@type": "Organization",
          "name": "SSELFIE Studio"
        },
        "description": "AI personal branding pioneer who built 120K followers in 90 days",
        "url": "https://sselfie.ai/about",
        "sameAs": [
          "https://instagram.com/sandra.social"
        ]
      },
      "about": {
        "@type": "Organization",
        "name": "SSELFIE Studio",
        "description": "AI-powered personal branding platform"
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
         itemType="https://schema.org/AboutPage"
    >
      <PreLoginNavigationUnified />
      
      <main>
        {/* Hero Section */}
        <HeroFullBleed
          backgroundImage={SandraImages.portraits.professional[0]}
          tagline="The Icelandic Selfie Queen"
          title="SANDRA"
          ctaText="My story"
          ctaLink="#story"
          fullHeight={true}
        />

        {/* Welcome Editorial Story */}
        <WelcomeEditorial />

        {/* Image Break */}
        <EditorialImageBreak
          src={SandraImages.editorial.phone2}
          alt="The moment everything changed"
          height="large"
          overlay={true}
          overlayText="This didn't start as a business. It started as survival."
        />

        {/* The Origin Story */}
        <section className="py-20 md:py-32 bg-[#f5f5f5]">
          <div className="max-w-5xl mx-auto px-8 md:px-12">
            <div className="text-center mb-16 md:mb-20">
              <h2 
                className="text-4xl md:text-5xl lg:text-6xl font-light mb-6 tracking-[-0.02em] text-[#0a0a0a]" 
                style={{ fontFamily: 'Times New Roman, serif' }}
              >
                The Origin Story
              </h2>
              <div className="w-12 h-px bg-[#B5B5B3] mx-auto"></div>
            </div>
            
            <div className="max-w-3xl mx-auto">
              <div className="space-y-8 md:space-y-10">
                <p 
                  className="text-xl md:text-2xl lg:text-3xl font-light leading-relaxed text-[#0a0a0a] text-center italic"
                  style={{ fontFamily: 'Times New Roman, serif' }}
                >
                  This didn't start as a business. It started as survival.
                </p>
                
                <div className="space-y-6 text-lg md:text-xl leading-relaxed text-[#333] font-light">
                  <p>One year ago, I hit rock bottom. Divorced. Three kids. No backup plan. I was heartbroken, exhausted, and completely disconnected from the woman I used to be.</p>
                  
                  <p>I didn't recognize myself. Not in the mirror. Not in my life.</p>
                  
                  <p>And one day, in the middle of all that mess, I picked up my phone. Took a selfie. Posted something honest. Not perfect. Just true.</p>
                  
                  <p 
                    className="text-xl md:text-2xl font-light italic text-[#0a0a0a] border-l-2 border-[#B5B5B3] pl-8"
                    style={{ fontFamily: 'Times New Roman, serif' }}
                  >
                    That one moment sparked something. I didn't need a full plan. I needed one brave post. One real story. One step back to myself.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Timeline Stats */}
        <section className="py-16 md:py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-12 md:gap-16 text-center">
              <div className="space-y-2">
                <h3 className="text-4xl sm:text-5xl md:text-6xl font-light text-[#0a0a0a]" 
                    style={{ fontFamily: 'Times New Roman, serif' }}
                    itemProp="duration">
                  90
                </h3>
                <p className="text-xs sm:text-sm tracking-[0.3em] sm:tracking-[0.4em] uppercase text-[#666] font-inter px-2">
                  Days to 120K followers
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="text-4xl sm:text-5xl md:text-6xl font-light text-[#0a0a0a]" 
                    style={{ fontFamily: 'Times New Roman, serif' }}
                    itemProp="audience">
                  120K
                </h3>
                <p className="text-xs sm:text-sm tracking-[0.3em] sm:tracking-[0.4em] uppercase text-[#666] font-inter px-2">
                  Followers built from scratch
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="text-4xl sm:text-5xl md:text-6xl font-light text-[#0a0a0a]" 
                    style={{ fontFamily: 'Times New Roman, serif' }}
                    itemProp="tool">
                  1
                </h3>
                <p className="text-xs sm:text-sm tracking-[0.3em] sm:tracking-[0.4em] uppercase text-[#666] font-inter px-2">
                  Phone. That's all I had.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Evolution Story */}
        <section className="py-16 md:py-24 bg-white" itemScope itemType="https://schema.org/Story">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
              <div className="order-2 lg:order-1">
                <img 
                  src="https://i.postimg.cc/xdSMgswW/sselfie-1.jpg" 
                  alt="Sandra Sigurjónsdóttir building SSELFIE Studio platform"
                  className="w-full h-[400px] sm:h-[500px] lg:h-[600px] object-cover rounded-sm"
                  loading="lazy"
                  itemProp="image"
                  width="600"
                  height="600"
                />
              </div>
              <div className="order-1 lg:order-2 space-y-6 lg:space-y-8">
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-light tracking-[-0.01em] text-[#0a0a0a]" 
                    style={{ fontFamily: 'Times New Roman, serif' }}
                    itemProp="headline">
                  From there, I kept showing up
                </h2>
                <div className="space-y-4 sm:space-y-6 text-base sm:text-lg leading-relaxed text-[#333] font-light" itemProp="text">
                  <p>Camera in one hand, coffee in the other. And over time, I built a real audience, a real brand, and eventually, a real business.</p>
                  <p>Not because I had it all together. But because I didn't and I stopped hiding that.</p>
                  <p>That's where SSELFIE was born. From one woman deciding to stop shrinking and start showing up.</p>
                  <p className="font-medium text-[#0a0a0a]">Now? I help other women do the same.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Philosophy */}
        <PowerQuote />

        {/* Final Philosophy */}
        <section className="py-16 sm:py-20 md:py-32 bg-white" 
                 itemScope 
                 itemType="https://schema.org/AboutSection">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="mb-12 sm:mb-16 md:mb-20">
              <h2 
                className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-light mb-4 sm:mb-6 tracking-[-0.02em] text-[#0a0a0a] px-4" 
                style={{ fontFamily: 'Times New Roman, serif' }}
                itemProp="headline"
              >
                SSELFIE isn't just about pictures
              </h2>
              <div className="w-12 h-px bg-[#B5B5B3] mx-auto"></div>
            </div>
            
            <div className="max-w-3xl mx-auto space-y-6 sm:space-y-8 md:space-y-10">
              <p 
                className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-light leading-relaxed text-[#0a0a0a] italic px-4"
                style={{ fontFamily: 'Times New Roman, serif' }}
                itemProp="description"
              >
                It's about power.
              </p>
              
              <div className="space-y-4 sm:space-y-6 text-base sm:text-lg md:text-xl leading-relaxed text-[#333] font-light px-4">
                <p>It's about building something from the version of you that almost gave up but didn't.</p>
                <p>Because when you show up as her? Everything changes.</p>
              </div>
              
              <div className="pt-6 sm:pt-8 md:pt-12">
                <button 
                  onClick={() => setIsEmailModalOpen(true)}
                  className="bg-[#0a0a0a] text-white px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-light tracking-wide hover:bg-[#333] transition-colors duration-300 w-full sm:w-auto"
                  style={{ fontFamily: 'Times New Roman, serif' }}
                  aria-label="Start your personal branding comeback story with SSELFIE Studio"
                >
                  Start your comeback story
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Global Footer */}
      <GlobalFooter />

      {/* Email Capture Modal */}
      <EmailCaptureModal
        isOpen={isEmailModalOpen}
        onClose={() => setIsEmailModalOpen(false)}
        plan="free"
        onEmailCaptured={(email) => {
          console.log('Email captured:', email);
          // Email modal will handle redirect to authentication
        }}
      />
    </div>
  );
}
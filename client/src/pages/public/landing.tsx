import React, { useState, useEffect } from 'react';
import { PreLoginNavigationUnified } from '../../components/pre-login-navigation-unified';
import { SandraImages } from '../../lib/sandra-images';
import { GlobalFooter } from '../../components/global-footer';
import { useLocation } from 'wouter';

export default function Landing() {
  const [, setLocation] = useLocation();
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);

  const handleGetStarted = () => {
    setLocation('/simple-checkout');
  };

  // SEO Meta tags setup
  useEffect(() => {
    document.title = "Sandra Sigurjónsdóttir - SSELFIE Studio | Maya AI Personal Brand Photos";
    
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Meet Maya, your AI stylist & photographer who creates perfect personal brand photos. From CEO vibes to cozy coffee shop photos - all for €47/month. No photographer needed.');
    }

    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) {
      ogTitle.setAttribute('content', 'SSELFIE Studio - Maya AI Personal Brand Photos');
    }

    const ogDescription = document.querySelector('meta[property="og:description"]');
    if (ogDescription) {
      ogDescription.setAttribute('content', 'Maya creates photos that look exactly like you for websites, social media, guides, and digital products. €47/month - no photographer or stylist needed.');
    }
  }, []);

  return (
    <div className="bg-white text-[#0a0a0a]">
      <PreLoginNavigationUnified />
      
      {/* Hero Section - Full Bleed Editorial */}
      <section className="relative min-h-screen flex items-end justify-center bg-[#0a0a0a] overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src={SandraImages.editorial.mainHero}
            alt="Sandra Sigurjónsdóttir"
            className="w-full h-full object-cover opacity-60"
          />
        </div>
        <div className="relative z-10 text-center text-white px-6 md:px-12 pb-20 md:pb-32">
          <p className="text-[11px] tracking-[0.4em] uppercase mb-8 opacity-70 font-light">
            Hey gorgeous, it's Sandra
          </p>
          <div className="mb-12">
            <div className="hero-name-stacked">
              <h1 
                className="text-[4rem] md:text-[7rem] lg:text-[9rem] font-light mb-[-10px] tracking-[0.5em] leading-[1]"
                style={{ fontFamily: 'Times New Roman, serif' }}
              >
                SANDRA
              </h1>
              <h1 
                className="text-[2.5rem] md:text-[4rem] lg:text-[5rem] font-light tracking-[0.3em] leading-[1]"
                style={{ fontFamily: 'Times New Roman, serif' }}
              >
                SIGURJÓNSDÓTTIR
              </h1>
            </div>
            <p className="text-[12px] tracking-[0.5em] uppercase text-white/80 font-light mt-8">
              YOUR AI STYLIST & PHOTOGRAPHER
            </p>
          </div>
          <button 
            onClick={handleGetStarted}
            className="bg-transparent border border-white text-white px-8 py-4 text-[11px] tracking-[0.3em] uppercase hover:bg-white hover:text-[#0a0a0a] transition-all duration-300"
          >
            Meet Maya - €47/month
          </button>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 md:py-32 bg-white">
        <div className="max-w-6xl mx-auto px-6 md:px-12">
          <div className="grid md:grid-cols-2 gap-12 md:gap-20 items-center">
            <div>
              <img 
                src={SandraImages.editorial.aboutPhoto}
                alt="Sandra's story"
                className="w-full aspect-[4/5] object-cover"
              />
            </div>
            <div>
              <p className="text-[11px] tracking-[0.4em] uppercase text-[#666666] mb-6">
                About Sandra
              </p>
              <h2 
                className="text-3xl md:text-5xl font-light mb-8 tracking-[-0.01em]"
                style={{ fontFamily: 'Times New Roman, serif' }}
              >
                From divorced single mom to 135K+ followers who built Maya
              </h2>
              <div className="space-y-6 text-lg text-[#666666] font-light leading-relaxed">
                <p>
                  I was broke, burnt out, and tired of looking unprofessional online. 
                  I had big dreams but my Instagram looked like a hot mess. I couldn't 
                  afford a photographer every month, and let's be real - who has time for that anyway?
                </p>
                <p>
                  So I created Maya - my AI stylist, photographer, and honestly, my best friend. 
                  She knows exactly what I need and creates amazing photos instantly.
                </p>
                <p>
                  Now I just tell Maya "I need website photos with boss energy" or "cozy coffee shop vibes for Instagram" and boom - perfect photos that look exactly like me.
                </p>
                <p className="font-medium text-[#0a0a0a]">
                  No more hiring photographers or stylists. Maya's got everything covered.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Power Quote Section */}
      <section className="py-20 md:py-32 bg-[#f5f5f5] text-center">
        <div className="max-w-4xl mx-auto px-6 md:px-12">
          <h2 
            className="text-4xl md:text-6xl font-light mb-8 tracking-[-0.01em]"
            style={{ fontFamily: 'Times New Roman, serif' }}
          >
            "Maya creates photos that look exactly like you for websites, social media, guides, everything"
          </h2>
          <p className="text-lg text-[#666666] font-light">
            Sandra Sigurjónsdóttir
          </p>
        </div>
      </section>

      {/* Editorial Spread - Maya Features */}
      <section className="py-20 md:py-32 bg-white">
        <div className="max-w-6xl mx-auto px-6 md:px-12">
          <div className="grid md:grid-cols-2 gap-12 md:gap-20 items-center">
            <div>
              <p className="text-[11px] tracking-[0.4em] uppercase text-[#666666] mb-6">
                How Maya Works
              </p>
              <h2 
                className="text-3xl md:text-5xl font-light mb-8 tracking-[-0.01em]"
                style={{ fontFamily: 'Times New Roman, serif' }}
              >
                Tell Maya you want CEO vibes or cozy coffee shop photos
              </h2>
              <div className="space-y-6 text-lg text-[#666666] font-light leading-relaxed">
                <p>
                  Maya is like having your own personal stylist and photographer who 
                  totally gets your vibe. She styles you, picks the perfect location, 
                  and creates photos instantly.
                </p>
                <p>
                  Perfect for your website, social media, guides, and digital products. 
                  Photos that look exactly like you - no awkward poses or fake smiles.
                </p>
              </div>
              <button 
                onClick={handleGetStarted}
                className="mt-8 bg-[#0a0a0a] text-white px-8 py-4 text-[11px] tracking-[0.3em] uppercase hover:bg-[#333333] transition-all duration-300"
              >
                Meet Maya Now
              </button>
            </div>
            <div>
              <img 
                src={SandraImages.editorial.mayaDemo}
                alt="Maya AI demonstration"
                className="w-full aspect-[4/5] object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* AI Gallery Grid */}
      <section className="py-20 md:py-32 bg-[#f5f5f5]">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="text-center mb-16">
            <p className="text-[11px] tracking-[0.4em] uppercase text-[#666666] mb-6">
              Real results from Maya
            </p>
            <h2 
              className="text-4xl md:text-6xl font-light mb-8 tracking-[-0.01em]"
              style={{ fontFamily: 'Times New Roman, serif' }}
            >
              Photos that look exactly like you
            </h2>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {[0, 1, 2, 3, 4, 5, 6, 7].map((index) => (
              <div key={index} className="aspect-[4/5] overflow-hidden bg-white">
                <img 
                  src={SandraImages.aiGallery[index]}
                  alt={`Maya AI brand photo ${index + 1}`}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section - Maya Pricing */}
      <section id="services" className="py-20 md:py-32 bg-white">
        <div className="max-w-6xl mx-auto px-6 md:px-12 text-center">
          <p className="text-[11px] tracking-[0.4em] uppercase text-[#666666] mb-6">
            Simple Pricing
          </p>
          <h2 
            className="text-4xl md:text-6xl font-light mb-16 tracking-[-0.01em]"
            style={{ fontFamily: 'Times New Roman, serif' }}
          >
            Everything you need for €47/month
          </h2>
          
          <div className="max-w-2xl mx-auto">
            <div className="bg-[#f5f5f5] p-12 md:p-16">
              <h3 className="text-2xl md:text-3xl font-light mb-6" style={{ fontFamily: 'Times New Roman, serif' }}>
                Maya AI Stylist & Photographer
              </h3>
              <div className="text-5xl md:text-6xl font-light mb-8" style={{ fontFamily: 'Times New Roman, serif' }}>
                €47/month
              </div>
              <div className="space-y-4 text-lg text-[#666666] font-light mb-8">
                <p>✓ Unlimited photos with Maya</p>
                <p>✓ Tell her any style or vibe you want</p>
                <p>✓ Perfect for websites, social media, guides</p>
                <p>✓ Photos that look exactly like you</p>
                <p>✓ Organize everything in SSELFIE Gallery</p>
              </div>
              <button 
                onClick={handleGetStarted}
                className="bg-[#0a0a0a] text-white px-12 py-6 text-[11px] tracking-[0.3em] uppercase hover:bg-[#333333] transition-all duration-300"
              >
                Meet Maya - €47/month
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonial Section */}
      <section className="py-20 md:py-32 bg-[#0a0a0a] text-white text-center">
        <div className="max-w-4xl mx-auto px-6 md:px-12">
          <blockquote 
            className="text-3xl md:text-5xl font-light mb-8 tracking-[-0.01em]"
            style={{ fontFamily: 'Times New Roman, serif' }}
          >
            "Maya gave me professional photos I actually love. No more awkward photoshoots - just tell her what you need and boom, perfect photos."
          </blockquote>
          <cite className="text-lg text-white/80 font-light">
            Sarah, Business Owner
          </cite>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 md:py-32 bg-white text-center">
        <div className="max-w-4xl mx-auto px-6 md:px-12">
          <p className="text-[11px] tracking-[0.4em] uppercase text-[#666666] mb-6">
            Ready to meet Maya?
          </p>
          <h2 
            className="text-4xl md:text-6xl font-light mb-8 tracking-[-0.01em]"
            style={{ fontFamily: 'Times New Roman, serif' }}
          >
            Your AI stylist & photographer who gets it
          </h2>
          <p className="text-xl text-[#666666] font-light mb-12 max-w-2xl mx-auto">
            Tell Maya you want CEO vibes or cozy coffee shop photos. She creates photos that look exactly like you for websites, social media, guides, and digital products.
          </p>
          <button 
            onClick={handleGetStarted}
            className="bg-[#0a0a0a] text-white px-12 py-6 text-[11px] tracking-[0.3em] uppercase hover:bg-[#333333] transition-all duration-300"
          >
            Meet Maya - €47/month
          </button>
        </div>
      </section>

      <GlobalFooter />
    </div>
  );
}
import React, { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { GlobalFooter } from "../components/global-footer";
import { SignIn } from "@stackframe/react";
import { stackClientApp } from "../stack";

export default function HairLanding() {
  const [, setLocation] = useLocation();

  // Comprehensive SEO Meta Tags for Hair Experience
  useEffect(() => {
    // Primary SEO tags
    document.title = "AI Hair & Beauty Professional Photos €47/month | Hair Experience by SSELFIE";

    const metaTags = [
      { name: 'description', content: 'Transform your hair & beauty selfies into stunning professional photos for €47/month. Get salon-quality headshots, styling inspiration & beauty portraits instantly. Perfect for hairstylists, beauty professionals & style influencers.' },
      { name: 'keywords', content: 'AI hair photos, beauty professional photos, hairstylist headshots, salon photography AI, beauty selfies to professional, hair styling photos, beauty brand photography, salon marketing photos, hairstylist portfolio, beauty influencer photos' },
      { name: 'author', content: 'SSELFIE Studio - Hair Experience' },
      { name: 'robots', content: 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1.0, viewport-fit=cover' },
      { name: 'theme-color', content: '#000000' },

      // Open Graph tags for social sharing
      { property: 'og:title', content: 'AI Hair & Beauty Professional Photos €47/month | Hair Experience' },
      { property: 'og:description', content: 'Transform your hair & beauty selfies into stunning professional photos for €47/month. Perfect for hairstylists, beauty professionals & style influencers.' },
      { property: 'og:type', content: 'website' },
      { property: 'og:url', content: 'https://sselfie.ai/hair' },
      { property: 'og:image', content: 'https://sselfie.ai/og-hair.jpg' },
      { property: 'og:image:width', content: '1200' },
      { property: 'og:image:height', content: '630' },
      { property: 'og:image:alt', content: 'Professional AI-generated hair and beauty photos' },
      { property: 'og:site_name', content: 'SSELFIE Studio - Hair Experience' },

      // Twitter Card tags
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: 'AI Hair & Beauty Professional Photos €47/month' },
      { name: 'twitter:description', content: 'Transform your hair & beauty selfies into stunning professional photos. Perfect for hairstylists & beauty professionals.' },
      { name: 'twitter:image', content: 'https://sselfie.ai/twitter-hair.jpg' },
    ];

    // Set canonical URL
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', 'https://sselfie.ai/hair');

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

    // Cleanup on unmount
    return () => {
      document.title = "SSELFIE Studio";
    };
  }, []);

  // Navigation handlers
  const handleLogin = () => {
    setLocation('/handler/sign-in');
  };

  const handleGetStarted = async () => {
    try {
      // Register for Hair Experience via LevelPartner webhook
      const response = await fetch('/api/levelpartner-signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: 'Hair Experience Signup',
          email: '',
          source: 'hair-landing'
        })
      });
      
      if (response.ok) {
        setLocation('/simple-checkout');
      } else {
        // Fallback to direct checkout
        setLocation('/simple-checkout');
      }
    } catch (error) {
      console.error('Hair Experience signup error:', error);
      // Fallback to direct checkout
      setLocation('/simple-checkout');
    }
  };

  // State for mobile menu
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Fixed Top Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-white/10">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div 
              className="font-serif text-xl font-light tracking-wide text-white cursor-pointer"
              style={{ fontFamily: "Times New Roman, serif" }}
              onClick={() => setLocation("/")}
            >
              SSELFIE
              <span className="text-xs uppercase tracking-[0.3em] font-light text-white/70 ml-2">
                HAIR EXPERIENCE
              </span>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <button 
                onClick={() => setLocation("/business")}
                className="text-xs uppercase tracking-[0.3em] font-light text-white/70 hover:text-white transition-all duration-300"
              >
                Business
              </button>
              <button
                onClick={handleLogin}
                className="text-xs uppercase tracking-[0.3em] font-light text-white/70 hover:text-white transition-all duration-300"
              >
                Login
              </button>
              <button
                onClick={handleGetStarted}
                className="text-white border border-white/30 hover:bg-white hover:text-black transition-colors duration-300 text-xs uppercase tracking-[0.3em] font-light px-8 py-3"
              >
                Start Hair Experience €47
              </button>
            </div>

            {/* Mobile Navigation */}
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

      {/* HERO Section */}
      <section className="relative min-h-screen bg-black text-white overflow-hidden">
        <div className="absolute inset-0 opacity-60">
          <img 
            src="https://sselfie-training-zips.s3.eu-north-1.amazonaws.com/generated-images/undefined/hair_beauty_hero_1756382691095.png"
            alt="Professional hair and beauty transformation through AI photography"
            className="w-full h-full object-cover object-center"
          />
        </div>

        <div className="relative z-10 min-h-screen px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto h-screen flex items-end pb-20">
            <div className="w-full max-w-2xl">
              <div className="mb-8">
                <div
                  className="text-xs uppercase tracking-[0.4em] font-light text-white/70 mb-6"
                  style={{ fontFamily: "Times New Roman, serif" }}
                >
                  Hair & Beauty Professional Photos
                </div>
                
                <h1 className="mb-8">
                  <div 
                    className="text-5xl md:text-7xl lg:text-8xl font-light leading-none tracking-wide text-white mb-4"
                    style={{ fontFamily: "Times New Roman, serif", letterSpacing: "0.2em" }}
                  >
                    HAIR
                  </div>
                  <div 
                    className="text-4xl md:text-6xl lg:text-7xl font-light leading-none tracking-wide text-white/90"
                    style={{ fontFamily: "Times New Roman, serif", letterSpacing: "0.15em" }}
                  >
                    EXPERIENCE
                  </div>
                </h1>
                
                <p className="text-lg md:text-xl font-light leading-relaxed text-white/80 mb-8 max-w-xl">
                  Transform your hair and beauty selfies into stunning professional photos. 
                  Perfect for hairstylists, beauty professionals, and style influencers who need 
                  salon-quality content for just €47/month.
                </p>

                <div className="flex flex-col sm:flex-row gap-4">
                  <button
                    onClick={handleGetStarted}
                    className="bg-white text-black px-8 py-4 text-sm uppercase tracking-[0.3em] font-light hover:bg-white/90 transition-colors duration-300"
                  >
                    Start Hair Experience €47/month
                  </button>
                  
                  <button
                    onClick={() => document.getElementById('demo-section')?.scrollIntoView({ behavior: 'smooth' })}
                    className="border border-white/30 text-white px-8 py-4 text-sm uppercase tracking-[0.3em] font-light hover:bg-white/10 transition-colors duration-300"
                  >
                    View Interactive Demo
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* QR Code Registration Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white text-black">
        <div className="max-w-4xl mx-auto text-center">
          <h2 
            className="text-4xl md:text-5xl font-light mb-8"
            style={{ fontFamily: "Times New Roman, serif" }}
          >
            Quick Mobile Signup
          </h2>
          
          <p className="text-lg md:text-xl font-light leading-relaxed text-gray-700 mb-12 max-w-2xl mx-auto">
            Scan to join the Hair Experience instantly. Start creating professional hair and beauty 
            content from your phone in seconds.
          </p>

          <div className="flex flex-col md:flex-row items-center justify-center gap-12">
            <div className="flex flex-col items-center">
              <div className="mb-6 p-4 bg-gray-100 rounded-lg">
                <img 
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent("https://sselfie.ai/hair")}`}
                  alt="QR-kode for påmelding til Hair Experience"
                  className="w-48 h-48"
                />
              </div>
              <p className="text-sm uppercase tracking-[0.3em] font-light text-gray-600">
                Scan with your phone
              </p>
            </div>

            <div className="text-center md:text-left max-w-md">
              <h3 
                className="text-2xl font-light mb-6"
                style={{ fontFamily: "Times New Roman, serif" }}
              >
                Get Started in 3 Steps
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-center">
                  <span className="w-8 h-8 bg-black text-white rounded-full flex items-center justify-center text-sm font-light mr-4">1</span>
                  <span className="font-light">Scan QR code or click signup</span>
                </div>
                <div className="flex items-center">
                  <span className="w-8 h-8 bg-black text-white rounded-full flex items-center justify-center text-sm font-light mr-4">2</span>
                  <span className="font-light">Upload 10+ hair/beauty selfies</span>
                </div>
                <div className="flex items-center">
                  <span className="w-8 h-8 bg-black text-white rounded-full flex items-center justify-center text-sm font-light mr-4">3</span>
                  <span className="font-light">Generate 100 professional photos monthly</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Demo Section */}
      <section id="demo-section" className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 
            className="text-4xl md:text-5xl font-light text-center mb-12 text-black"
            style={{ fontFamily: "Times New Roman, serif" }}
          >
            Interactive Hair & Beauty Demo
          </h2>
          
          <div className="grid md:grid-cols-2 gap-12">
            {/* Mentimeter Embed */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-xl font-light text-black mb-2">Style Preferences Survey</h3>
                <p className="text-gray-600 font-light">Vote on the latest hair and beauty trends</p>
              </div>
              <div className="p-6">
                <div className="h-96 bg-gray-100 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-2xl mb-4" style={{ fontFamily: 'Times New Roman, serif' }}>
                      Interactive Survey
                    </div>
                    <button
                      onClick={() => {
                        window.open('https://www.mentimeter.com/app/presentation/aldn3b6egbvhm8up3oeg6pqnc8xwo8ks', '_blank', 'width=800,height=600');
                      }}
                      className="bg-black text-white px-6 py-2 hover:bg-gray-800 transition-colors font-light text-sm"
                    >
                      Open Hair Trends Survey
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Canva Embed */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-xl font-light text-black mb-2">Design Inspiration</h3>
                <p className="text-gray-600 font-light">Explore professional hair styling layouts</p>
              </div>
              <div className="p-6">
                <div className="h-96 bg-gray-100 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-2xl mb-4" style={{ fontFamily: 'Times New Roman, serif' }}>
                      Design Gallery
                    </div>
                    <button
                      onClick={() => {
                        window.open('https://www.canva.com/design/DAGTKvqGqY0/view?embed', '_blank', 'width=800,height=600');
                      }}
                      className="bg-black text-white px-6 py-2 hover:bg-gray-800 transition-colors font-light text-sm"
                    >
                      View Hair Styling Templates
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Value Proposition Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-black text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 
            className="text-4xl md:text-5xl font-light mb-12"
            style={{ fontFamily: "Times New Roman, serif" }}
          >
            Why Hair Professionals Choose Us
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-6xl font-light mb-6" style={{ fontFamily: "Times New Roman, serif" }}>€47</div>
              <h3 className="text-xl font-light mb-4">vs €1500+ Photoshoots</h3>
              <p className="font-light text-white/80">Get professional salon photography at a fraction of traditional costs</p>
            </div>
            
            <div className="text-center">
              <div className="text-6xl font-light mb-6" style={{ fontFamily: "Times New Roman, serif" }}>100</div>
              <h3 className="text-xl font-light mb-4">Photos Monthly</h3>
              <p className="font-light text-white/80">Unlimited creative content for your hair and beauty brand</p>
            </div>
            
            <div className="text-center">
              <div className="text-6xl font-light mb-6" style={{ fontFamily: "Times New Roman, serif" }}>24h</div>
              <h3 className="text-xl font-light mb-4">Training Time</h3>
              <p className="font-light text-white/80">Your personal AI model ready in just one day</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white text-black">
        <div className="max-w-4xl mx-auto text-center">
          <h2 
            className="text-4xl md:text-5xl font-light mb-8"
            style={{ fontFamily: "Times New Roman, serif" }}
          >
            Ready to Transform Your Hair & Beauty Content?
          </h2>
          
          <p className="text-lg md:text-xl font-light leading-relaxed text-gray-700 mb-12 max-w-2xl mx-auto">
            Join hundreds of hair professionals who are already creating stunning content with AI. 
            Start your Hair Experience today.
          </p>

          <button
            onClick={handleGetStarted}
            className="bg-black text-white px-12 py-4 text-sm uppercase tracking-[0.3em] font-light hover:bg-gray-800 transition-colors duration-300 mb-8"
          >
            Start Hair Experience €47/month
          </button>
          
          <p className="text-sm text-gray-600 font-light">
            No long-term contracts • Cancel anytime • 30-day money-back guarantee
          </p>
        </div>
      </section>

      <GlobalFooter />
    </div>
  );
}

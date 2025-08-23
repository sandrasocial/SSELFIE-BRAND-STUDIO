import React from 'react';
import { PreLoginNavigationUnified } from '../../components/pre-login-navigation-unified';
import { SandraImages } from '../../lib/sandra-images';
import { useLocation } from 'wouter';

export default function Landing() {
  const [, setLocation] = useLocation();

  const handleGetStarted = () => {
    setLocation('/simple-checkout');
  };

  return (
    <div className="bg-white text-[#0a0a0a]">
      <PreLoginNavigationUnified />
      
      {/* Hero Section - Full Bleed */}
      <section className="relative min-h-screen flex items-end justify-center bg-[#0a0a0a] overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src={SandraImages.hero.ai}
            alt="Sandra's AI transformation"
            className="w-full h-full object-cover opacity-40"
          />
        </div>
        <div className="relative z-10 text-center text-white px-6 md:px-12 pb-20 md:pb-32">
          <p className="text-[11px] tracking-[0.4em] uppercase mb-8 opacity-70 font-light">
            Hey gorgeous, it's Sandra
          </p>
          <div className="mb-12">
            <h1 
              className="text-[5rem] md:text-[8rem] lg:text-[10rem] font-light mb-4 tracking-[0.5em] leading-[1]"
              style={{ fontFamily: 'Times New Roman, serif' }}
            >
              SSELFIE
            </h1>
            <p className="text-[12px] tracking-[0.5em] uppercase text-white/80 font-light">
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

      {/* Before/After Gallery */}
      <section className="py-20 md:py-32 bg-[#f5f5f5]">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="text-center mb-16">
            <p className="text-[11px] tracking-[0.4em] uppercase text-[#666666] mb-6">
              Real results from real women
            </p>
            <h2 
              className="text-4xl md:text-6xl font-light mb-8 tracking-[-0.01em]"
              style={{ fontFamily: 'Times New Roman, serif' }}
            >
              Meet Maya - your AI stylist who gets it
            </h2>
            <p className="text-lg text-[#666666] font-light max-w-2xl mx-auto">
              Tell Maya you want CEO vibes or cozy coffee shop photos. She styles you, picks the perfect location, and creates photos that look exactly like you.
            </p>
          </div>
          
          {/* AI Gallery Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {[0, 1, 2, 3, 4, 5, 6, 7].map((index) => (
              <div key={index} className="aspect-[4/5] overflow-hidden bg-white">
                <img 
                  src={SandraImages.aiGallery[index]}
                  alt={`AI brand photo ${index + 1}`}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                />
              </div>
            ))}
          </div>
          
          <div className="text-center mt-12">
            <p className="text-[#666666] font-light">
              Perfect for your website, social media, guides, and digital products • Photos that look exactly like you
            </p>
          </div>
        </div>
      </section>

      {/* Sandra's Story */}
      <section className="py-20 md:py-32 bg-white">
        <div className="max-w-6xl mx-auto px-6 md:px-12">
          <div className="grid md:grid-cols-2 gap-12 md:gap-20 items-center">
            <div>
              <img 
                src={SandraImages.editorial.firstAI}
                alt="Sandra's first AI selfie"
                className="w-full aspect-[4/5] object-cover"
              />
            </div>
            <div>
              <p className="text-[11px] tracking-[0.4em] uppercase text-[#666666] mb-6">
                Okay, here's what happened
              </p>
              <h2 
                className="text-3xl md:text-5xl font-light mb-8 tracking-[-0.01em]"
                style={{ fontFamily: 'Times New Roman, serif' }}
              >
                I was broke, burnt out, and tired of looking unprofessional online
              </h2>
              <div className="space-y-6 text-lg text-[#666666] font-light leading-relaxed">
                <p>
                  Like, seriously. I had big dreams but my Instagram looked like a hot mess. 
                  I couldn't afford a photographer every month, and let's be real - 
                  who has time for that anyway?
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

      {/* How It Works */}
      <section className="py-20 md:py-32 bg-[#0a0a0a] text-white">
        <div className="max-w-6xl mx-auto px-6 md:px-12">
          <div className="text-center mb-20">
            <p className="text-[11px] tracking-[0.4em] uppercase text-white/70 mb-6">
              Super simple process
            </p>
            <h2 
              className="text-4xl md:text-6xl font-light mb-8 tracking-[-0.01em]"
              style={{ fontFamily: 'Times New Roman, serif' }}
            >
              How Maya works her magic
            </h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-12 md:gap-16">
            {/* Step 1 */}
            <div className="text-center">
              <div className="mb-8">
                <img 
                  src={SandraImages.editorial.phone2}
                  alt="Upload selfies"
                  className="w-full aspect-square object-cover mx-auto max-w-xs"
                />
              </div>
              <h3 
                className="text-2xl md:text-3xl font-light mb-4 tracking-[-0.01em]"
                style={{ fontFamily: 'Times New Roman, serif' }}
              >
                Train your unique model
              </h3>
              <p className="text-white/80 font-light leading-relaxed">
                Upload 10-15 selfies. Maya scans your features, face, and posture to create your personal model in 20 minutes.
              </p>
            </div>
            
            {/* Step 2 */}
            <div className="text-center">
              <div className="mb-8">
                <img 
                  src={SandraImages.editorial.aiInProgress}
                  alt="AI processing"
                  className="w-full aspect-square object-cover mx-auto max-w-xs"
                />
              </div>
              <h3 
                className="text-2xl md:text-3xl font-light mb-4 tracking-[-0.01em]"
                style={{ fontFamily: 'Times New Roman, serif' }}
              >
                Chat with Maya
              </h3>
              <p className="text-white/80 font-light leading-relaxed">
                Tell Maya exactly what you want. "CEO photos in a luxury hotel" or "casual coffee shop vibes" - she styles you and picks the perfect location.
              </p>
            </div>
            
            {/* Step 3 */}
            <div className="text-center">
              <div className="mb-8">
                <img 
                  src={SandraImages.editorial.aiSuccess}
                  alt="Professional results"
                  className="w-full aspect-square object-cover mx-auto max-w-xs"
                />
              </div>
              <h3 
                className="text-2xl md:text-3xl font-light mb-4 tracking-[-0.01em]"
                style={{ fontFamily: 'Times New Roman, serif' }}
              >
                Get amazing photos
              </h3>
              <p className="text-white/80 font-light leading-relaxed">
                Maya creates photos that look exactly like you. Organize everything in your SSELFIE Gallery and use them for your website, social media, guides, digital products - everything.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 md:py-32 bg-[#f5f5f5]">
        <div className="max-w-4xl mx-auto px-6 md:px-12 text-center">
          <p className="text-[11px] tracking-[0.4em] uppercase text-[#666666] mb-6">
            Stop looking amateur
          </p>
          <h2 
            className="text-4xl md:text-6xl font-light mb-8 tracking-[-0.01em]"
            style={{ fontFamily: 'Times New Roman, serif' }}
          >
            Meet Maya, your AI stylist & photographer
          </h2>
          <p className="text-xl text-[#666666] font-light mb-12 max-w-2xl mx-auto">
            Maya creates amazing personal brand photos instantly. No photographer, no stylist needed - just tell her what you want.
          </p>
          
          {/* Pricing Card */}
          <div className="bg-white border border-[#e5e5e5] p-12 max-w-lg mx-auto">
            <h3 
              className="text-3xl font-light mb-6 tracking-[-0.01em]"
              style={{ fontFamily: 'Times New Roman, serif' }}
            >
              €47/month
            </h3>
            <div className="space-y-4 text-left mb-8">
              <div className="flex items-center">
                <span className="text-[#0a0a0a] mr-3">✓</span>
                <span className="text-[#666666] font-light">Train your unique AI model (one-time setup)</span>
              </div>
              <div className="flex items-center">
                <span className="text-[#0a0a0a] mr-3">✓</span>
                <span className="text-[#666666] font-light">Chat with Maya anytime for new photos</span>
              </div>
              <div className="flex items-center">
                <span className="text-[#0a0a0a] mr-3">✓</span>
                <span className="text-[#666666] font-light">Photos for website, social media, guides, everything</span>
              </div>
              <div className="flex items-center">
                <span className="text-[#0a0a0a] mr-3">✓</span>
                <span className="text-[#666666] font-light">SSELFIE Gallery to organize all your images</span>
              </div>
              <div className="flex items-center">
                <span className="text-[#0a0a0a] mr-3">✓</span>
                <span className="text-[#666666] font-light">Photos that look exactly like you</span>
              </div>
            </div>
            
            <button 
              onClick={handleGetStarted}
              className="w-full bg-[#0a0a0a] text-white py-4 px-8 text-[11px] tracking-[0.3em] uppercase hover:bg-[#333333] transition-all duration-300 mb-4"
            >
              Meet Maya Now
            </button>
            <p className="text-sm text-[#666666] font-light">
              Cancel anytime • 20-minute setup • Results guaranteed
            </p>
          </div>
        </div>
      </section>

      {/* Coming Soon Tease */}
      <section className="py-20 md:py-32 bg-white">
        <div className="max-w-4xl mx-auto px-6 md:px-12 text-center">
          <p className="text-[11px] tracking-[0.4em] uppercase text-[#666666] mb-6">
            What's next
          </p>
          <h2 
            className="text-3xl md:text-5xl font-light mb-8 tracking-[-0.01em]"
            style={{ fontFamily: 'Times New Roman, serif' }}
          >
            The full SSELFIE Studio is coming soon
          </h2>
          <p className="text-lg text-[#666666] font-light mb-8 max-w-2xl mx-auto">
            Landing page builder, business templates, and automated setup tools. 
            But first, let's get you looking like the boss you are.
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-sm text-[#666666]">
            <span className="bg-[#f5f5f5] px-4 py-2">Landing Page Builder → Coming Soon</span>
            <span className="bg-[#f5f5f5] px-4 py-2">Business Templates → Coming Soon</span>
            <span className="bg-[#f5f5f5] px-4 py-2">Payment Setup → Coming Soon</span>
            <span className="bg-[#f5f5f5] px-4 py-2">Custom Domains → Coming Soon</span>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 md:py-32 bg-[#0a0a0a] text-white text-center">
        <div className="max-w-4xl mx-auto px-6 md:px-12">
          <h2 
            className="text-4xl md:text-6xl font-light mb-8 tracking-[-0.01em]"
            style={{ fontFamily: 'Times New Roman, serif' }}
          >
            Ready to meet Maya?
          </h2>
          <p className="text-xl text-white/80 font-light mb-12 max-w-2xl mx-auto">
            Stop struggling with photos. Maya's waiting to create amazing brand photos that look exactly like you.
          </p>
          <button 
            onClick={handleGetStarted}
            className="bg-white text-[#0a0a0a] px-12 py-4 text-[11px] tracking-[0.3em] uppercase hover:bg-[#f5f5f5] transition-all duration-300"
          >
            Meet Maya - €47/month
          </button>
          <p className="text-sm text-white/60 mt-6">
            Join 1,200+ women who stopped making excuses and started looking like CEOs
          </p>
        </div>
      </section>
    </div>
  );
}
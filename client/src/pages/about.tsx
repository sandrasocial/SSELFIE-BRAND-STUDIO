import React, { useState } from 'react';
import { PreLoginNavigationUnified } from '@/components/pre-login-navigation-unified';
import { HeroFullBleed } from '@/components/hero-full-bleed';
import { EditorialStory } from '@/components/editorial-story';
import { EditorialImageBreak } from '@/components/editorial-image-break';
import PowerQuote from '@/components/power-quote';
import { EditorialTestimonials } from '@/components/editorial-testimonials';
import WelcomeEditorial from '@/components/welcome-editorial';
import { SandraImages } from '@/lib/sandra-images';

export default function AboutPage() {
  const [showEmailPopup, setShowEmailPopup] = useState(false);

  return (
    <div className="bg-white">
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
        <section className="section-padding bg-white">
          <div className="max-w-7xl mx-auto px-8">
            <div className="grid md:grid-cols-3 gap-16 text-center">
              <div>
                <h3 className="text-6xl font-light mb-4 text-[#0a0a0a]" style={{ fontFamily: 'Times New Roman, serif' }}>
                  90
                </h3>
                <p className="text-sm tracking-[0.4em] uppercase text-[#666] font-inter">
                  Days to 120K followers
                </p>
              </div>
              <div>
                <h3 className="text-6xl font-light mb-4 text-[#0a0a0a]" style={{ fontFamily: 'Times New Roman, serif' }}>
                  120K
                </h3>
                <p className="text-sm tracking-[0.4em] uppercase text-[#666] font-inter">
                  Followers built from scratch
                </p>
              </div>
              <div>
                <h3 className="text-6xl font-light mb-4 text-[#0a0a0a]" style={{ fontFamily: 'Times New Roman, serif' }}>
                  1
                </h3>
                <p className="text-sm tracking-[0.4em] uppercase text-[#666] font-inter">
                  Phone. That's all I had.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Evolution Story */}
        <section className="section-padding bg-white">
          <div className="max-w-7xl mx-auto px-8">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div>
                <img 
                  src="https://i.postimg.cc/xdSMgswW/sselfie-1.jpg" 
                  alt="Sandra building SSELFIE"
                  className="w-full h-[600px] object-cover"
                  loading="lazy"
                />
              </div>
              <div>
                <h2 className="text-4xl md:text-5xl font-light mb-8 tracking-[-0.01em]" style={{ fontFamily: 'Times New Roman, serif' }}>
                  From there, I kept showing up
                </h2>
                <div className="space-y-6 text-lg leading-relaxed text-[#333] font-inter">
                  <p>Camera in one hand, coffee in the other. And over time, I built a real audience, a real brand, and eventually, a real business.</p>
                  <p>Not because I had it all together. But because I didn't—and I stopped hiding that.</p>
                  <p>That's where SSELFIE was born. From one woman deciding to stop shrinking and start showing up.</p>
                  <p>Now? I help other women do the same.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Philosophy */}
        <PowerQuote />

        {/* Final Philosophy */}
        <section className="py-20 md:py-32 bg-white">
          <div className="max-w-5xl mx-auto px-8 md:px-12 text-center">
            <div className="mb-16 md:mb-20">
              <h2 
                className="text-4xl md:text-5xl lg:text-6xl font-light mb-6 tracking-[-0.02em] text-[#0a0a0a]" 
                style={{ fontFamily: 'Times New Roman, serif' }}
              >
                SSELFIE isn't just about pictures
              </h2>
              <div className="w-12 h-px bg-[#B5B5B3] mx-auto"></div>
            </div>
            
            <div className="max-w-3xl mx-auto space-y-8 md:space-y-10">
              <p 
                className="text-xl md:text-2xl lg:text-3xl font-light leading-relaxed text-[#0a0a0a] italic"
                style={{ fontFamily: 'Times New Roman, serif' }}
              >
                It's about power.
              </p>
              
              <div className="space-y-6 text-lg md:text-xl leading-relaxed text-[#333] font-light">
                <p>It's about building something from the version of you that almost gave up but didn't.</p>
                <p>Because when you show up as her? Everything changes.</p>
              </div>
              
              <div className="pt-8 md:pt-12">
                <button 
                  onClick={() => setShowEmailPopup(true)}
                  className="bg-[#0a0a0a] text-white px-8 py-4 text-lg font-light tracking-wide hover:bg-[#333] transition-colors duration-300"
                  style={{ fontFamily: 'Times New Roman, serif' }}
                >
                  Start your comeback story
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Email Capture Popup */}
      {showEmailPopup && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white max-w-md w-full p-8 relative">
            <button 
              onClick={() => setShowEmailPopup(false)}
              className="absolute top-4 right-4 text-2xl text-[#666] hover:text-[#0a0a0a]"
            >
              ×
            </button>
            
            <div className="text-center">
              <h3 
                className="text-2xl md:text-3xl font-light mb-4 text-[#0a0a0a]"
                style={{ fontFamily: 'Times New Roman, serif' }}
              >
                Ready for your comeback?
              </h3>
              
              <p className="text-[#666] mb-6 leading-relaxed">
                Join 120K+ women who stopped waiting for permission and started building something real.
              </p>
              
              <form className="space-y-4">
                <input 
                  type="email" 
                  placeholder="Enter your email"
                  className="w-full p-3 border border-[#ddd] focus:border-[#0a0a0a] focus:outline-none"
                  required
                />
                
                <button 
                  type="submit"
                  className="w-full bg-[#0a0a0a] text-white py-3 font-light hover:bg-[#333] transition-colors"
                  style={{ fontFamily: 'Times New Roman, serif' }}
                >
                  Start my comeback story
                </button>
              </form>
              
              <p className="text-xs text-[#999] mt-4">
                No spam. Just real stories and tools that work.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
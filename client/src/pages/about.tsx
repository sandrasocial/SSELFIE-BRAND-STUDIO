import React from 'react';
import { PreLoginNavigationUnified } from '@/components/pre-login-navigation-unified';
import { HeroFullBleed } from '@/components/hero-full-bleed';
import { EditorialStory } from '@/components/editorial-story';
import { EditorialImageBreak } from '@/components/editorial-image-break';
import PowerQuote from '@/components/power-quote';
import { EditorialTestimonials } from '@/components/editorial-testimonials';
import { SandraImages } from '@/components/sandra-image-library';

export default function AboutPage() {
  return (
    <div className="bg-white">
      <PreLoginNavigationUnified />
      
      <main>
        {/* Hero Section */}
        <HeroFullBleed
          backgroundImage={SandraImages.editorial.mirror}
          tagline="The Icelandic Selfie Queen"
          title="SANDRA"
          ctaText="My story"
          ctaLink="#story"
          fullHeight={true}
        />

        {/* Beginning Story */}
        <section id="story" className="section-padding bg-white">
          <div className="max-w-7xl mx-auto px-8">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div>
                <h2 className="text-4xl md:text-5xl font-light mb-8 tracking-[-0.01em]" style={{ fontFamily: 'Times New Roman, serif' }}>
                  Okay, here's what actually happened...
                </h2>
                <div className="space-y-6 text-lg leading-relaxed text-[#333] font-inter">
                  <p>One year ago my marriage ended. Single mom, three kids, zero plan.</p>
                  <p>But I had a phone. And I figured out that was all I needed.</p>
                  <p>90 days later: 120K followers. Today: A business that actually works. Now: Teaching you exactly how I did it.</p>
                  <p>No fancy equipment. No design degree. Just strategy that actually works.</p>
                </div>
              </div>
              <div className="lg:order-first">
                <img 
                  src={SandraImages.editorial.laptop1} 
                  alt="Sandra working"
                  className="w-full h-[600px] object-cover"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Image Break */}
        <EditorialImageBreak
          src={SandraImages.editorial.phone2}
          alt="The moment everything changed"
          height="large"
          overlay={true}
          overlayText="This didn't start as a business. It started as survival."
        />

        {/* The Moment */}
        <section className="section-padding bg-[#f5f5f5]">
          <div className="max-w-4xl mx-auto px-8 text-center">
            <h2 className="text-3xl md:text-4xl font-light mb-12 tracking-[-0.01em]" style={{ fontFamily: 'Times New Roman, serif' }}>
              The Origin Story
            </h2>
            <div className="space-y-8 text-lg leading-relaxed text-[#333] font-inter">
              <p>This didn't start as a business. It started as survival.</p>
              <p>One year ago, I hit rock bottom. Divorced. Three kids. No backup plan. I was heartbroken, exhausted, and completely disconnected from the woman I used to be.</p>
              <p>I didn't recognize myself. Not in the mirror. Not in my life.</p>
              <p>And one day, in the middle of all that mess—I picked up my phone. Took a selfie. Posted something honest. Not perfect. Just true.</p>
              <p>That one moment sparked something. I didn't need a full plan. I needed one brave post. One real story. One step back to myself.</p>
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
                  src={SandraImages.editorial.laptop2} 
                  alt="Building the business"
                  className="w-full h-[600px] object-cover"
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
        <section className="section-padding bg-white">
          <div className="max-w-4xl mx-auto px-8 text-center">
            <h2 className="text-4xl md:text-5xl font-light mb-12 tracking-[-0.01em]" style={{ fontFamily: 'Times New Roman, serif' }}>
              SSELFIE isn't just about pictures
            </h2>
            <div className="space-y-8 text-xl leading-relaxed text-[#333] font-inter">
              <p>It's about power.</p>
              <p>It's about building something from the version of you that almost gave up—but didn't.</p>
              <p>Because when you show up as her? Everything changes.</p>
            </div>
            <div className="mt-16">
              <a 
                href="/pricing"
                className="inline-block text-sm tracking-[0.4em] uppercase text-[#0a0a0a] border border-[#0a0a0a] px-12 py-6 hover:bg-[#0a0a0a] hover:text-white transition-all duration-300 font-inter"
              >
                Let's build something real together
              </a>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
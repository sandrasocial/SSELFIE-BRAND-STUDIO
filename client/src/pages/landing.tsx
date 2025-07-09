import React from 'react';
import { HeroFullBleed } from '@/components/hero-full-bleed';
import { EditorialImageBreak } from '@/components/editorial-image-break';
import { MoodboardGallery } from '@/components/moodboard-gallery';
import { WorkspaceInterface } from '@/components/workspace-interface';
import { PricingCard } from '@/components/pricing-card';
import { SandraImages } from '@/components/sandra-image-library';
import { Navigation } from '@/components/navigation';
import { EditorialStory } from '@/components/editorial-story';
import { useLocation } from 'wouter';

export default function Landing() {
  const [, setLocation] = useLocation();

  const handleGetStarted = () => {
    window.location.href = '/api/login';
  };

  const handlePricing = (plan: string) => {
    const planMap: { [key: string]: string } = {
      'ai-pack': 'ai-pack',
      'studio-founding': 'studio-founding',
      'studio-standard': 'studio-standard'
    };
    
    const planType = planMap[plan] || 'ai-pack';
    setLocation(`/checkout?plan=${planType}`);
  };

  const moodboardItems = [
    { src: SandraImages.journey.rockBottom, alt: "Sandra's journey - Before", span: 4, aspectRatio: "square" },
    { src: SandraImages.journey.building, alt: "Sandra building", span: 4, aspectRatio: "square" },
    { src: SandraImages.journey.today, alt: "Sandra today", span: 4, aspectRatio: "square" },
  ] as const;

  const aiGalleryItems = [
    { src: SandraImages.aiGallery[0], alt: "AI transformation result", span: 3, aspectRatio: "tall" },
    { 
      src: SandraImages.aiGallery[1], 
      alt: "AI transformation result", 
      span: 6, 
      aspectRatio: "wide",
      overlayTitle: "94+ AI Images",
      overlayText: "Available in your gallery"
    },
    { src: SandraImages.aiGallery[2], alt: "AI transformation result", span: 3, aspectRatio: "tall" },
    { src: SandraImages.aiGallery[3], alt: "AI transformation result", span: 4, aspectRatio: "square" },
    { src: SandraImages.aiGallery[4], alt: "AI transformation result", span: 4, aspectRatio: "square" },
    { src: SandraImages.aiGallery[5], alt: "AI transformation result", span: 4, aspectRatio: "square" },
  ] as const;

  return (
    <div className="bg-[var(--mid-gray)] text-[var(--luxury-black)]">
      <Navigation />
      {/* Hero Section */}
      <HeroFullBleed
        backgroundImage={SandraImages.hero.homepage}
        tagline="IT STARTS WITH YOUR SELFIES"
        title="SSELFIE"
        subtitle="STUDIO"
        ctaText="Let's do this"
        onCtaClick={handleGetStarted}
        alignment="center"
        fullHeight={true}
      />

      {/* Sandra's Origin Story - Editorial Layout */}
      <EditorialStory
        headline="Okay, here's what actually happened..."
        paragraphs={[]} // Content is now handled within the component
        imageSrc={SandraImages.editorial.laptop1}
        imageAlt="Sandra working, not posed"
        backgroundColor="#ffffff"
        reversed={true}
      />

      {/* Editorial Moodboard Break */}
      <MoodboardGallery items={moodboardItems} />

      {/* How It Works Section */}
      <section className="bg-[var(--mid-gray)] section-padding">
        <div className="max-w-7xl mx-auto px-8">
          <div className="text-center mb-20">
            <p className="eyebrow-text text-[var(--soft-gray)] mb-8 system-text">
              HERE'S THE THING
            </p>
            <h2 className="editorial-headline text-5xl md:text-7xl text-[var(--luxury-black)] mb-8" style={{ fontWeight: 300, letterSpacing: '-0.01em' }}>
              No fancy equipment.<br />No design degree.
            </h2>
            <p className="text-xl text-[var(--soft-gray)] max-w-2xl mx-auto system-text font-light">
              Just strategy that actually works.
            </p>
          </div>
          
          <WorkspaceInterface onLaunch={handleGetStarted} />
        </div>
      </section>

      {/* Editorial Image Break 2 */}
      <EditorialImageBreak
        src={SandraImages.editorial.mirror}
        alt="AI transformation in progress"
        height="large"
      />

      {/* Simple Process Section */}
      <section className="bg-white section-padding">
        <div className="max-w-6xl mx-auto px-8">
          <div className="text-center mb-20">
            <p className="eyebrow-text text-[var(--soft-gray)] mb-8 system-text">
              HOW IT WORKS
            </p>
            <h2 className="editorial-headline text-6xl md:text-8xl text-[var(--luxury-black)] mb-12" style={{ fontWeight: 300, letterSpacing: '-0.01em' }}>
              You don't need a plan.<br />You need one brave post.
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
            {/* Step 1 */}
            <div className="text-center">
              <div className="aspect-square mb-8 overflow-hidden">
                <img 
                  src={SandraImages.editorial.phone2}
                  alt="Just your phone" 
                  className="w-full h-full object-cover editorial-hover"
                />
              </div>
              <h3 className="editorial-headline text-3xl text-[var(--luxury-black)] mb-4" style={{ fontWeight: 300, letterSpacing: '-0.01em' }}>
                Just your phone
              </h3>
              <p className="text-[var(--soft-gray)] system-text font-light leading-relaxed">
                Upload 10-15 selfies. AI creates 30 editorial images that actually look like you.
              </p>
            </div>
            
            {/* Step 2 */}
            <div className="text-center">
              <div className="aspect-square mb-8 overflow-hidden">
                <img 
                  src={SandraImages.editorial.laptop2}
                  alt="Your story matters" 
                  className="w-full h-full object-cover editorial-hover"
                />
              </div>
              <h3 className="editorial-headline text-3xl text-[var(--luxury-black)] mb-4" style={{ fontWeight: 300, letterSpacing: '-0.01em' }}>
                Your story matters
              </h3>
              <p className="text-[var(--soft-gray)] system-text font-light leading-relaxed">
                Pick a template. Add your story. Everything else is handled.
              </p>
            </div>
            
            {/* Step 3 */}
            <div className="text-center">
              <div className="aspect-square mb-8 overflow-hidden">
                <img 
                  src={SandraImages.editorial.laughing}
                  alt="Show up as her" 
                  className="w-full h-full object-cover editorial-hover"
                />
              </div>
              <h3 className="editorial-headline text-3xl text-[var(--luxury-black)] mb-4" style={{ fontWeight: 300, letterSpacing: '-0.01em' }}>
                Show up as her
              </h3>
              <p className="text-[var(--soft-gray)] system-text font-light leading-relaxed">
                Your business is live. You focus on what you do best - being yourself.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* AI Gallery Showcase */}
      <MoodboardGallery items={aiGalleryItems} />

      {/* Pricing Section */}
      <section className="bg-[var(--luxury-black)] section-padding">
        <div className="max-w-6xl mx-auto px-8">
          <div className="text-center mb-20">
            <p className="eyebrow-text text-white/60 mb-8 system-text">
              START HERE
            </p>
            <h2 className="editorial-headline text-6xl md:text-8xl text-white mb-12" style={{ fontWeight: 300, letterSpacing: '-0.01em' }}>
              Your mess is your message.<br />Let's turn it into money.
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <PricingCard
              title="SSELFIE AI"
              price="€47"
              period="one-time"
              description="Upload 10-15 selfies. Get 30 images that actually look like you. See the magic before you believe it."
              imageUrl={SandraImages.editorial.phone1}
              ctaText="START HERE"
              onCtaClick={() => handlePricing('ai-pack')}
            />
            
            <PricingCard
              title="STUDIO FOUNDING"
              price="€97"
              period="per month"
              description="Your phone becomes your business. AI images, templates, everything connected. 20 minutes to launch."
              imageUrl={SandraImages.editorial.laptop1}
              ctaText="BEGIN"
              onCtaClick={() => handlePricing('studio-founding')}
              isPopular={true}
              badge="For the brave ones"
              className="bg-[var(--editorial-gray)]"
            />
            
            <PricingCard
              title="STUDIO Pro"
              price="€147"
              period="per month"
              description="When you're ready to show up, get seen, and finally get paid for being you."
              imageUrl={SandraImages.hero.pricing}
              ctaText="BEGIN"
              onCtaClick={() => handlePricing('studio-standard')}
            />
          </div>
        </div>
      </section>

      {/* Editorial Quote Break */}
      <section className="bg-white section-padding">
        <div className="max-w-4xl mx-auto px-8 text-center">
          <blockquote className="editorial-headline text-5xl md:text-7xl text-[var(--luxury-black)] leading-tight" style={{ fontWeight: 300, letterSpacing: '-0.01em' }}>
            "This didn't start as a business.<br />
            It started as survival."
          </blockquote>
          <p className="eyebrow-text text-[var(--soft-gray)] mt-12 system-text">
            SANDRA SIGURJONSDOTTIR
          </p>
        </div>
      </section>

      {/* Final Editorial Break */}
      <EditorialImageBreak
        src={SandraImages.journey.today}
        alt="Sandra today - The revolution"
        height="large"
      />

      {/* Call to Action Section */}
      <section className="bg-[var(--luxury-black)] section-padding">
        <div className="max-w-4xl mx-auto px-8 text-center">
          <h2 className="editorial-headline text-6xl md:text-8xl font-light text-white mb-8">
            Ready to build<br />the revolution?
          </h2>
          <p className="text-xl text-white/70 mb-16 max-w-2xl mx-auto leading-relaxed system-text font-light">
            This isn't just a business. This is the future of how women build brands and businesses.
          </p>
          
          <div className="flex flex-col md:flex-row gap-8 justify-center items-center">
            <button 
              onClick={() => handlePricing('ai-pack')}
              className="luxury-button text-white/90 border-white/30 hover:border-white system-text"
            >
              Try SSELFIE AI (€47)
            </button>
            <button 
              onClick={() => handlePricing('studio-founding')}
              className="bg-white text-[var(--luxury-black)] px-8 py-4 eyebrow-text hover:bg-white/90 transition-all duration-300 system-text"
            >
              Launch Your Business (€97)
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[var(--mid-gray)] py-16 border-t border-[var(--accent-line)]">
        <div className="max-w-6xl mx-auto px-8">
          <div className="text-center">
            <h3 className="editorial-headline text-3xl font-light text-[var(--luxury-black)] mb-4">
              SSELFIE Studio
            </h3>
            <p className="text-sm text-[var(--soft-gray)] system-text font-light mb-8">
              Revolutionary AI Personal Brand Platform
            </p>
            <p className="eyebrow-text text-[var(--soft-gray)] system-text">
              Let's build something real together.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

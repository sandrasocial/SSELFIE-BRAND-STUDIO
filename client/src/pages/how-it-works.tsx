import React from 'react';
import { Navigation } from '@/components/navigation';
import { HeroFullBleed } from '@/components/hero-full-bleed';
import { SandraImages } from '@/components/sandra-image-library';
import { Link } from 'wouter';

const steps = [
  {
    number: "01",
    title: "Upload your selfies",
    description: "10-15 photos. You get a dead-simple tutorial: 'Face the window, wear what you love, no need for a ring light.'",
    image: SandraImages.editorial.phone2
  },
  {
    number: "02", 
    title: "Pick your vibe",
    description: "Choose your niche, your look, even your 'dream client' mood.",
    image: SandraImages.editorial.thinking
  },
  {
    number: "03",
    title: "Watch the magic",
    description: "My custom SSELFIE AI model creates a gallery of editorial, on-brand images instantly. No more waiting weeks for a photoshoot.",
    image: SandraImages.editorial.laptop1
  },
  {
    number: "04",
    title: "One-click studio setup",
    description: "Choose your favorite images, pick your luxury layout, plug in your story. If you can text, you can do this.",
    image: SandraImages.editorial.laptop2
  },
  {
    number: "05",
    title: "Everything falls into place",
    description: "Your best selfies drop into every page. Booking, payments, links connect with one click. Share your page: sselfie.studio/yourname",
    image: SandraImages.editorial.laughing
  }
];

const faqs = [
  {
    question: "Do I need to be tech-savvy?",
    answer: "Nope. If you can text, you can do this. Everything is one-click simple."
  },
  {
    question: "What if I don't have professional photos?",
    answer: "That's the point. Just your phone and window light. I'll show you exactly how."
  },
  {
    question: "How long does this actually take?",
    answer: "About 20 minutes from first selfie to live business page. Most women do it between coffee and school pickup."
  },
  {
    question: "What if I want to change something later?",
    answer: "Change anything, anytime. Upload new selfies, switch colors, update your offer. No extra fees."
  }
];

export default function HowItWorksPage() {
  return (
    <div className="bg-white">
      <Navigation />
      
      <main>
        {/* Hero Section */}
        <HeroFullBleed
          backgroundImage={SandraImages.hero.about}
          tagline="YOUR STORY, YOUR SELFIE, YOUR WAY"
          title="HOW IT WORKS"
          ctaText="START YOUR TRANSFORMATION"
          ctaLink="#get-started"
          fullHeight={true}
        />

        {/* Intro Section */}
        <section className="py-20 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-3xl md:text-4xl text-[#0a0a0a] mb-8 font-light tracking-[-0.01em]" style={{ fontFamily: 'Times New Roman, serif' }}>
              Build your brand in 20 minutes
            </h1>
            
            <div className="text-lg leading-relaxed text-[#0a0a0a] font-inter max-w-3xl mx-auto">
              <p>This isn't about perfect photos. It's about your personal brand, built on your best selfies and a little AI magic.</p>
              <p className="mt-4">Here's exactly how it works (when you're not in the mood to overthink it):</p>
            </div>
          </div>
        </section>

        {/* Steps Section */}
        <section className="py-20 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="space-y-32">
              {steps.map((step, index) => (
                <div key={index} className={`flex flex-col lg:flex-row items-center gap-16 ${index % 2 === 1 ? 'lg:flex-row-reverse' : ''}`}>
                  <div className="flex-1">
                    <div className="flex items-center gap-6 mb-6">
                      <span className="text-6xl md:text-7xl font-light text-[#0a0a0a] tracking-[-0.02em]" style={{ fontFamily: 'Times New Roman, serif' }}>
                        {step.number}
                      </span>
                    </div>
                    <h2 className="text-3xl md:text-4xl font-light text-[#0a0a0a] mb-6 tracking-[-0.01em]" style={{ fontFamily: 'Times New Roman, serif' }}>
                      {step.title}
                    </h2>
                    <p className="text-lg leading-relaxed text-[#666666] font-inter">
                      {step.description}
                    </p>
                  </div>
                  <div className="flex-1">
                    <div className="aspect-[4/3] overflow-hidden">
                      <img
                        src={step.image}
                        alt={step.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Transformation Preview */}
        <section className="py-20 px-4 bg-[#f5f5f5]">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-light text-[#0a0a0a] mb-12 tracking-[-0.01em]" style={{ fontFamily: 'Times New Roman, serif' }}>
              Before and after
            </h2>
            
            <div className="grid md:grid-cols-3 gap-8 items-center">
              <div className="text-center">
                <div className="aspect-[3/4] mb-4 bg-[#e5e5e5] flex items-center justify-center">
                  <span className="text-[#999] font-inter">Your phone selfie</span>
                </div>
                <p className="text-sm text-[#666] font-inter">Before</p>
              </div>
              
              <div className="flex justify-center">
                <span className="text-2xl text-[#0a0a0a] font-light">→</span>
              </div>
              
              <div className="text-center">
                <div className="aspect-[3/4] mb-4 overflow-hidden">
                  <img
                    src={SandraImages.editorial.thinking}
                    alt="AI-enhanced editorial photo"
                    className="w-full h-full object-cover"
                  />
                </div>
                <p className="text-sm text-[#666] font-inter">After</p>
              </div>
            </div>
            
            <p className="text-lg text-[#0a0a0a] mt-12 font-inter">
              This could be you.
            </p>
          </div>
        </section>

        {/* Quick FAQs */}
        <section className="py-20 px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-light text-[#0a0a0a] mb-16 text-center tracking-[-0.01em]" style={{ fontFamily: 'Times New Roman, serif' }}>
              The questions you're actually thinking
            </h2>
            
            <div className="grid md:grid-cols-2 gap-12">
              {faqs.map((faq, index) => (
                <div key={index}>
                  <h3 className="text-xl font-medium text-[#0a0a0a] mb-4 font-inter">
                    {faq.question}
                  </h3>
                  <p className="text-lg leading-relaxed text-[#666666] font-inter">
                    {faq.answer}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Power Quote & CTA */}
        <section id="get-started" className="py-20 px-4 bg-[#0a0a0a] text-center">
          <div className="max-w-4xl mx-auto">
            <blockquote className="text-4xl md:text-5xl lg:text-6xl font-light text-white mb-12 tracking-[-0.01em]" style={{ fontFamily: 'Times New Roman, serif' }}>
              "You don't need a plan.<br />
              Just one brave selfie."
            </blockquote>
            
            <p className="text-lg text-white/80 mb-12 max-w-2xl mx-auto font-inter">
              Stop waiting for the perfect moment. Start with what you have, where you are, right now.
            </p>
            
            <Link href="/pricing" className="inline-block text-white border border-white/30 hover:bg-white hover:text-[#0a0a0a] transition-colors duration-300 text-[11px] tracking-[0.3em] uppercase no-underline px-12 py-6 font-light font-inter">
              GET STARTED
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
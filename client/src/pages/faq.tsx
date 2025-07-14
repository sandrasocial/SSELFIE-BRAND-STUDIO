import React from 'react';
import { PreLoginNavigationUnified } from '@/components/pre-login-navigation-unified';
import { HeroFullBleed } from '@/components/hero-full-bleed';
import { SandraImages } from '@/components/sandra-image-library';
import { Link } from 'wouter';

const faqData = [
  {
    question: "Do I need to be good at tech to use SSELFIE?",
    answer: "Nope. If you can upload a photo and tap a button, you're more than qualified. I built this for women who'd rather spend time living than learning new software."
  },
  {
    question: "What if I don't look like an influencer?",
    answer: "Perfect. Me neither. SSELFIE is about real women, real stories, and real brands. No filters, no fake perfection, just you, showing up as her."
  },
  {
    question: "Do I need professional photos?",
    answer: "Absolutely not. All you need is your phone and a little window light. I'll show you exactly how to take the selfies that work (even on a messy Monday)."
  },
  {
    question: "Is this just for coaches?",
    answer: "Nope. It's for anyone who wants to build a personal brand: coaches, service providers, product makers, or \"I'm not sure what I do yet\" types. If you want to be seen, you're in the right place."
  },
  {
    question: "How much time does this take?",
    answer: "You can go from first selfie to live landing page in under an hour. Most women do it between school drop-off and their third cup of coffee."
  },
  {
    question: "What do I get (like, actually)?",
    answer: "• Your own brand mood board (colors, fonts, vibe)\n• Magazine-worthy on-brand selfies (AI-powered, but still you)\n• A done-for-you landing page (with email capture & booking)\n• Your custom SSELFIE link\n• Optional: Downloadable guides and digital products, ready to sell or send"
  },
  {
    question: "What if I want to change something later?",
    answer: "It's your brand. Change anything, anytime. Upload new selfies, switch up your colors, or update your offer whenever you want. No extra fees, no tech headaches."
  },
  {
    question: "Can I use my own domain?",
    answer: "For now, you get a custom sselfie.studio/yourname link. If you're craving a .com, DM me. We're working on it."
  },
  {
    question: "Is this monthly or one-time?",
    answer: "Membership is monthly, so you can update and keep everything fresh. Cancel anytime, no guilt, no drama."
  },
  {
    question: "What if I get stuck?",
    answer: "You won't. But if you do, I'm here. DM me on Instagram or use the contact page."
  }
];

export default function FAQPage() {
  return (
    <div className="bg-white">
      <PreLoginNavigationUnified />
      
      <main>
        {/* Hero Section */}
        <HeroFullBleed
          backgroundImage={SandraImages.editorial.laughing}
          tagline="REAL QUESTIONS, REAL ANSWERS"
          title="FAQ"
          ctaText="STILL CURIOUS? JUST ASK"
          ctaLink="#contact-sandra"
          fullHeight={true}
        />

        {/* FAQ Section */}
        <section className="py-20 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col gap-20">
              {faqData.map((faq, index) => (
                <div 
                  key={index} 
                  className={`${index < faqData.length - 1 ? 'border-b border-[#e5e5e5] pb-20' : ''}`}
                >
                  <h3 className="text-3xl md:text-4xl lg:text-5xl font-light text-[#0a0a0a] mb-6 tracking-[-0.01em] leading-tight" style={{ fontFamily: 'Times New Roman, serif' }}>
                    {faq.question}
                  </h3>
                  <div className="text-lg md:text-xl leading-relaxed text-[#666666] font-light whitespace-pre-line font-inter">
                    {faq.answer}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section id="contact-sandra" className="py-20 px-4 bg-[#0a0a0a] text-center">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-light text-white mb-8 tracking-[-0.01em]" style={{ fontFamily: 'Times New Roman, serif' }}>
              Still have questions?
            </h2>
            
            <p className="text-lg md:text-xl leading-relaxed text-white/80 font-light mb-12 max-w-2xl mx-auto font-inter">
              I get it. Sometimes you just want to talk to a real person.<br />
              Message me on Instagram (@sandra.social) or send a note through the contact page.
            </p>
            
            <div className="flex flex-col gap-4 items-center">
              <a 
                href="https://instagram.com/sandra.social" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-block text-white border border-white/30 hover:bg-white hover:text-[#0a0a0a] transition-colors duration-300 text-[11px] tracking-[0.3em] uppercase no-underline px-8 py-4 font-light font-inter"
              >
                DM ON INSTAGRAM
              </a>
              
              <Link href="/contact">
                <a className="inline-block text-white border border-white/30 hover:bg-white hover:text-[#0a0a0a] transition-colors duration-300 text-[11px] tracking-[0.3em] uppercase no-underline px-8 py-4 font-light font-inter">
                  ASK SANDRA
                </a>
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
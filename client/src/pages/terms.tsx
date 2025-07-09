import React from 'react';
import { Navigation } from '@/components/navigation';
import { HeroFullBleed } from '@/components/hero-full-bleed';
import { SandraImages } from '@/components/sandra-image-library';
import { Link } from 'wouter';

export default function TermsPage() {
  return (
    <div className="bg-white">
      <Navigation />
      
      <main>
        {/* Hero Section */}
        <HeroFullBleed
          backgroundImage={SandraImages.hero.about}
          tagline="THE FINE PRINT, WITHOUT THE FINE PRINT"
          title="TERMS"
          ctaText="HAVE QUESTIONS? JUST ASK"
          ctaLink="#contact"
          fullHeight={true}
        />

        {/* Plain English Overview */}
        <section className="py-20 px-4">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl md:text-4xl text-[#0a0a0a] mb-8 font-light tracking-[-0.01em]" style={{ fontFamily: 'Times New Roman, serif' }}>
              Let's keep it fair.
            </h1>
            
            <div className="space-y-6 text-lg leading-relaxed text-[#0a0a0a] font-inter">
              <p>This is where we lay it all out—no surprises, no gotchas.</p>
              <p>When you use SSELFIE, you're agreeing to a few simple things (and so am I).</p>
              <p>If you ever feel confused, just ask. I'm always here to explain in real words.</p>
            </div>
          </div>
        </section>

        {/* What You Can Expect */}
        <section className="py-20 px-4 bg-[#f5f5f5]">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl text-[#0a0a0a] mb-12 font-light tracking-[-0.01em]" style={{ fontFamily: 'Times New Roman, serif' }}>
              What you can expect from SSELFIE
            </h2>
            
            <div className="space-y-6 text-lg text-[#0a0a0a] font-inter">
              <p>• You get access to everything your plan promises—no hidden fees, no sudden paywalls.</p>
              <p>• Your photos, brand, and content belong to you. Always.</p>
              <p>• We'll do our best to keep the tech running and your stuff safe.</p>
              <p>• We'll update you if anything changes—especially prices, features, or how your data is handled.</p>
            </div>
          </div>
        </section>

        {/* What SSELFIE Expects */}
        <section className="py-20 px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl text-[#0a0a0a] mb-12 font-light tracking-[-0.01em]" style={{ fontFamily: 'Times New Roman, serif' }}>
              What SSELFIE expects from you
            </h2>
            
            <div className="space-y-6 text-lg text-[#0a0a0a] font-inter">
              <p>• Be real. Use your own photos, stories, and info.</p>
              <p>• Don't upload anything illegal, hateful, or that isn't yours.</p>
              <p>• Don't try to hack, copy, or resell SSELFIE or anyone else's work here.</p>
              <p>• If you're stuck or unsure, reach out—don't struggle in silence.</p>
            </div>
          </div>
        </section>

        {/* Membership & Payments */}
        <section className="py-20 px-4 bg-[#f5f5f5]">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl text-[#0a0a0a] mb-12 font-light tracking-[-0.01em]" style={{ fontFamily: 'Times New Roman, serif' }}>
              Membership & payments
            </h2>
            
            <div className="space-y-6 text-lg text-[#0a0a0a] font-inter">
              <p>• Membership is monthly, billed in advance.</p>
              <p>• Cancel anytime—your access stays active until the end of your billing cycle.</p>
              <p>• No refunds for time already used (just like a gym membership).</p>
              <p>• If a payment fails, we'll let you know so you can fix it (no drama).</p>
            </div>
          </div>
        </section>

        {/* Cancelling or Leaving */}
        <section className="py-20 px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl text-[#0a0a0a] mb-12 font-light tracking-[-0.01em]" style={{ fontFamily: 'Times New Roman, serif' }}>
              Cancelling or leaving
            </h2>
            
            <div className="space-y-6 text-lg text-[#0a0a0a] font-inter">
              <p>• Cancel in your dashboard, no angry emails required.</p>
              <p>• When you leave, your info and photos are deleted within 30 days (unless you ask sooner).</p>
              <p>• Want your data back? Download anything you need before you go.</p>
            </div>
          </div>
        </section>

        {/* Changes to Terms */}
        <section className="py-20 px-4 bg-[#f5f5f5]">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl text-[#0a0a0a] mb-12 font-light tracking-[-0.01em]" style={{ fontFamily: 'Times New Roman, serif' }}>
              Changes to the terms
            </h2>
            
            <div className="space-y-6 text-lg text-[#0a0a0a] font-inter">
              <p>• If we change anything big, you'll get a heads-up (never a surprise).</p>
              <p>• Keeping using SSELFIE means you're okay with the updates.</p>
            </div>
          </div>
        </section>

        {/* Legal Basics */}
        <section className="py-20 px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl text-[#0a0a0a] mb-12 font-light tracking-[-0.01em]" style={{ fontFamily: 'Times New Roman, serif' }}>
              Legal basics (in human language)
            </h2>
            
            <div className="space-y-6 text-lg text-[#0a0a0a] font-inter">
              <p>• We follow the laws in the EU and US (GDPR, CCPA, etc.).</p>
              <p>• SSELFIE isn't responsible for what you post—use your best judgment.</p>
              <p>• If something goes wrong (tech bugs, downtime), we'll do our best to fix it fast, but can't be liable for lost business or missed opportunities.</p>
              <p>• If you have a business dispute, let's talk first. If we can't fix it, local Icelandic law applies.</p>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section id="contact" className="py-20 px-4 bg-[#f5f5f5]">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl text-[#0a0a0a] mb-8 font-light tracking-[-0.01em]" style={{ fontFamily: 'Times New Roman, serif' }}>
              Still want it in lawyer-speak? Or just need something explained?
            </h2>
            
            <p className="text-lg text-[#0a0a0a] mb-8 max-w-2xl mx-auto font-inter">
              Send me a note through the contact page or DM me on Instagram (@sandra.social).<br />
              No bots, no wait times, just Sandra.
            </p>
            
            <Link href="/contact">
              <a className="inline-block bg-[#0a0a0a] text-[#f5f5f5] px-8 py-4 font-medium tracking-wide hover:bg-[#2A2A2A] transition-colors duration-200 text-[11px] tracking-[0.3em] uppercase no-underline font-light font-inter">
                ASK SANDRA
              </a>
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
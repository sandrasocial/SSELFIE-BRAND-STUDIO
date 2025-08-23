import React from 'react';
import { PreLoginNavigationUnified } from '../../components/pre-login-navigation-unified';
import { HeroFullBleed } from '../../components/hero-full-bleed';
import { SandraImages } from '../../lib/sandra-images';
import { Link } from 'wouter';

export default function PrivacyPage() {
  return (
    <div className="bg-white">
      <PreLoginNavigationUnified />
      
      <main>
        {/* Hero Section */}
        <HeroFullBleed
          backgroundImage={SandraImages.hero.about}
          tagline="YOUR TRUST, OUR PROMISE"
          title="PRIVACY"
          ctaText="QUESTIONS? JUST ASK"
          ctaLink="#contact"
          fullHeight={true}
        />

        {/* Overview */}
        <section className="py-20 px-4">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl md:text-4xl text-[#0a0a0a] mb-8 font-light tracking-[-0.01em]" style={{ fontFamily: 'Times New Roman, serif' }}>
              Your privacy matters.
            </h1>
            
            <div className="space-y-6 text-lg leading-relaxed text-[#0a0a0a] font-inter">
              <p>We built SSELFIE Studio for women who want to show up authentically. Your trust is everything to us.</p>
              <p>Here's exactly what we collect, how we use it, and how we keep it safe.</p>
              <p>No legal jargon. Just the truth.</p>
            </div>
          </div>
        </section>

        {/* What We Collect */}
        <section className="py-20 px-4 bg-[#f5f5f5]">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl text-[#0a0a0a] mb-12 font-light tracking-[-0.01em]" style={{ fontFamily: 'Times New Roman, serif' }}>
              What we collect
            </h2>
            
            <div className="space-y-6 text-lg text-[#0a0a0a] font-inter">
              <p>• Photos you upload for AI processing</p>
              <p>• Account information (name, email)</p>
              <p>• Usage data to improve our service</p>
              <p>• Payment information (processed securely via Stripe)</p>
            </div>
          </div>
        </section>

        {/* How We Use Your Data */}
        <section className="py-20 px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl text-[#0a0a0a] mb-12 font-light tracking-[-0.01em]" style={{ fontFamily: 'Times New Roman, serif' }}>
              How we use your data
            </h2>
            
            <div className="space-y-6 text-lg text-[#0a0a0a] font-inter">
              <p>• Generate your AI images</p>
              <p>• Provide customer support</p>
              <p>• Send important account updates</p>
              <p>• Improve our AI models (anonymized data only)</p>
            </div>
          </div>
        </section>

        {/* Data Security */}
        <section className="py-20 px-4 bg-[#f5f5f5]">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl text-[#0a0a0a] mb-12 font-light tracking-[-0.01em]" style={{ fontFamily: 'Times New Roman, serif' }}>
              Data security
            </h2>
            
            <div className="space-y-6 text-lg text-[#0a0a0a] font-inter">
              <p>Your images are encrypted in transit and at rest. We use industry-standard security measures and never share your personal photos.</p>
              <p>Only you have access to your generated images. We don't use them for marketing or share them with anyone.</p>
              <p>Payment data is handled by Stripe, not stored on our servers.</p>
            </div>
          </div>
        </section>

        {/* Your Rights */}
        <section className="py-20 px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl text-[#0a0a0a] mb-12 font-light tracking-[-0.01em]" style={{ fontFamily: 'Times New Roman, serif' }}>
              Your rights
            </h2>
            
            <div className="space-y-6 text-lg text-[#0a0a0a] font-inter">
              <p>• Download all your data anytime</p>
              <p>• Update your information</p>
              <p>• Delete your account and all data</p>
              <p>• Ask questions about how your data is used</p>
              <p>• Opt out of marketing emails (you'll still get important account updates)</p>
            </div>
          </div>
        </section>

        {/* Cookies */}
        <section className="py-20 px-4 bg-[#f5f5f5]">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl text-[#0a0a0a] mb-12 font-light tracking-[-0.01em]" style={{ fontFamily: 'Times New Roman, serif' }}>
              Cookies
            </h2>
            
            <div className="space-y-6 text-lg text-[#0a0a0a] font-inter">
              <p>We use cookies to keep you logged in, remember your preferences, and understand how you use the platform.</p>
              <p>Essential cookies (login, security) can't be turned off. Analytics cookies can be disabled in your browser.</p>
              <p>No tracking across other websites. No selling your data to advertisers.</p>
            </div>
          </div>
        </section>

        {/* Updates */}
        <section className="py-20 px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl text-[#0a0a0a] mb-12 font-light tracking-[-0.01em]" style={{ fontFamily: 'Times New Roman, serif' }}>
              Updates to this policy
            </h2>
            
            <div className="space-y-6 text-lg text-[#0a0a0a] font-inter">
              <p>If we change anything important, you'll get an email. No fine print surprises.</p>
              <p>Last updated: July 7, 2025</p>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section id="contact" className="py-20 px-4 bg-[#f5f5f5]">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl text-[#0a0a0a] mb-8 font-light tracking-[-0.01em]" style={{ fontFamily: 'Times New Roman, serif' }}>
              Questions about your privacy?
            </h2>
            
            <p className="text-lg text-[#0a0a0a] mb-8 max-w-2xl mx-auto font-inter">
              Email me directly at hello@sselfie.studio or DM me on Instagram (@sandra.social).<br />
              Real person, real answers.
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
import { useState } from "react";
import { useLocation } from "wouter";
import { SandraImages } from "@/lib/sandra-images";

export default function NewLanding() {
  const [, setLocation] = useLocation();

  const handleGetStarted = (plan: string) => {
    // Store selected plan for checkout
    localStorage.setItem('selectedPlan', plan);
    setLocation('/checkout');
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-8 py-6">
          <div className="flex justify-between items-center">
            <div className="font-serif text-xl tracking-wide text-black">
              SSELFIE
            </div>
            <button
              onClick={() => setLocation('/login')}
              className="text-xs uppercase tracking-widest text-black hover:opacity-60 transition-opacity"
            >
              Login
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section - Full Bleed */}
      <section className="relative min-h-screen flex items-center justify-center bg-black text-white overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 opacity-40">
          <img
            src={SandraImages.hero.homepage}
            alt="Sandra"
            className="w-full h-full object-cover"
          />
        </div>
        
        {/* Hero Content */}
        <div className="relative z-10 text-center max-w-4xl px-8">
          <div className="text-xs uppercase tracking-[0.4em] text-white/70 mb-8 font-light">
            Your Personal Brand Starts Here
          </div>
          
          <h1 className="font-serif text-6xl md:text-8xl lg:text-9xl font-light uppercase tracking-wide leading-none mb-6">
            SSELFIE
          </h1>
          
          <h2 className="font-serif text-2xl md:text-4xl font-light uppercase tracking-[0.3em] opacity-80 mb-12">
            Studio
          </h2>
          
          <p className="text-lg tracking-wide uppercase opacity-80 font-light max-w-2xl mx-auto leading-relaxed">
            It starts with your selfies
          </p>
          
          <div className="mt-16">
            <button
              onClick={() => handleGetStarted('sselfie-studio')}
              className="inline-block px-8 py-4 border border-white text-white text-xs uppercase tracking-[0.3em] hover:bg-white hover:text-black transition-all duration-300"
            >
              Get Started
            </button>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-32 bg-gray-50">
        <div className="max-w-4xl mx-auto px-8 text-center">
          <div className="text-xs uppercase tracking-[0.4em] text-gray-500 mb-8">
            The Origin Story
          </div>
          
          <div className="font-serif text-3xl md:text-5xl leading-tight mb-16 font-light italic">
            "This didn't start as a business.<br />
            It started as survival."
          </div>
          
          <div className="max-w-2xl mx-auto text-lg leading-relaxed text-gray-700 space-y-6">
            <p>
              One year ago, I hit rock bottom. Divorced. Three kids. No backup plan.
              I was heartbroken, exhausted, and completely disconnected from the woman I used to be.
            </p>
            
            <p>
              And one day, in the middle of all that mess—I picked up my phone. Took a selfie. 
              Posted something honest. Not perfect. Just true.
            </p>
            
            <p>
              That one moment sparked something. From there, I kept showing up—camera in one hand, 
              coffee in the other. And over time, I built a real audience, a real brand, 
              and eventually, a real business.
            </p>
            
            <p className="font-medium">
              SSELFIE isn't just about pictures. It's about power.
              It's about building something real from the version of you that almost gave up—but didn't.
            </p>
          </div>
        </div>
      </section>

      {/* What You Get Section */}
      <section className="py-32 bg-white">
        <div className="max-w-6xl mx-auto px-8">
          <div className="text-center mb-20">
            <div className="text-xs uppercase tracking-[0.4em] text-gray-500 mb-8">
              Everything You Need
            </div>
            <h2 className="font-serif text-4xl md:text-6xl font-light text-black">
              Your Personal Brand,<br />Complete.
            </h2>
          </div>

          {/* Feature Cards */}
          <div className="grid md:grid-cols-3 gap-8 mb-20">
            {/* AI Photoshoot */}
            <div className="group">
              <div className="aspect-square bg-gray-100 overflow-hidden mb-6 relative">
                <img
                  src={SandraImages.portraits.professional[0]}
                  alt="AI Photoshoot"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-8">
                  <div className="text-white">
                    <h4 className="text-xs uppercase tracking-[0.3em] mb-2">AI Photoshoot</h4>
                    <p className="text-sm opacity-80">Professional brand photos from your selfies</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Flatlay Collections */}
            <div className="group">
              <div className="aspect-square bg-gray-100 overflow-hidden mb-6 relative">
                <img
                  src={SandraImages.flatlays.workspace1}
                  alt="Flatlay Collections"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-8">
                  <div className="text-white">
                    <h4 className="text-xs uppercase tracking-[0.3em] mb-2">Luxury Flatlays</h4>
                    <p className="text-sm opacity-80">Curated luxury lifestyle collections</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Brand Builder */}
            <div className="group">
              <div className="aspect-square bg-gray-100 overflow-hidden mb-6 relative">
                <img
                  src={SandraImages.hero.dashboard}
                  alt="Brand Builder"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-8">
                  <div className="text-white">
                    <h4 className="text-xs uppercase tracking-[0.3em] mb-2">Brand Builder</h4>
                    <p className="text-sm opacity-80">Professional landing pages in minutes</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-32 bg-gray-50">
        <div className="max-w-4xl mx-auto px-8">
          <div className="text-center mb-20">
            <div className="text-xs uppercase tracking-[0.4em] text-gray-500 mb-8">
              Choose Your Journey
            </div>
            <h2 className="font-serif text-4xl md:text-6xl font-light text-black">
              Simple. Powerful.
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* SSELFIE Studio */}
            <div className="bg-white p-12 border border-gray-200 text-center">
              <h3 className="font-serif text-3xl font-light mb-4">SSELFIE Studio</h3>
              <div className="text-5xl font-light mb-8">$29<span className="text-lg text-gray-500">/month</span></div>
              
              <ul className="text-left space-y-4 mb-12 text-gray-700">
                <li className="flex items-start">
                  <span className="text-black mr-3">•</span>
                  <span>Personal AI photoshoot (100 images/month)</span>
                </li>
                <li className="flex items-start">
                  <span className="text-black mr-3">•</span>
                  <span>Luxury flatlay collections</span>
                </li>
                <li className="flex items-start">
                  <span className="text-black mr-3">•</span>
                  <span>Brand templates & landing pages</span>
                </li>
                <li className="flex items-start">
                  <span className="text-black mr-3">•</span>
                  <span>Custom domain connection</span>
                </li>
              </ul>
              
              <button
                onClick={() => handleGetStarted('sselfie-studio')}
                className="w-full py-4 border-2 border-black text-black text-xs uppercase tracking-[0.3em] hover:bg-black hover:text-white transition-all duration-300"
              >
                Start Your Journey
              </button>
            </div>

            {/* SSELFIE Studio PRO */}
            <div className="bg-black text-white p-12 border border-black text-center relative">
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <div className="bg-white text-black px-6 py-2 text-xs uppercase tracking-widest">
                  Most Popular
                </div>
              </div>
              
              <h3 className="font-serif text-3xl font-light mb-4">SSELFIE Studio PRO</h3>
              <div className="text-5xl font-light mb-8">$67<span className="text-lg text-gray-400">/month</span></div>
              
              <ul className="text-left space-y-4 mb-12 text-gray-300">
                <li className="flex items-start">
                  <span className="text-white mr-3">•</span>
                  <span>Everything in Studio</span>
                </li>
                <li className="flex items-start">
                  <span className="text-white mr-3">•</span>
                  <span>300 AI images per month</span>
                </li>
                <li className="flex items-start">
                  <span className="text-white mr-3">•</span>
                  <span className="text-white">Sandra Personal Brand AI Agent</span>
                </li>
                <li className="flex items-start">
                  <span className="text-white mr-3">•</span>
                  <span>Custom brand strategy & content</span>
                </li>
                <li className="flex items-start">
                  <span className="text-white mr-3">•</span>
                  <span>Priority support & guidance</span>
                </li>
              </ul>
              
              <button
                onClick={() => handleGetStarted('sselfie-studio-pro')}
                className="w-full py-4 border-2 border-white text-white text-xs uppercase tracking-[0.3em] hover:bg-white hover:text-black transition-all duration-300"
              >
                Unlock Everything
              </button>
            </div>
          </div>
          
          <div className="text-center mt-12">
            <p className="text-sm text-gray-500">
              No contracts. Cancel anytime. 30-day money-back guarantee.
            </p>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-32 bg-black text-white text-center">
        <div className="max-w-4xl mx-auto px-8">
          <div className="font-serif text-4xl md:text-6xl font-light mb-12 leading-tight">
            "When you show up as her?<br />
            Everything changes."
          </div>
          
          <button
            onClick={() => handleGetStarted('sselfie-studio-pro')}
            className="inline-block px-12 py-6 border-2 border-white text-white text-sm uppercase tracking-[0.3em] hover:bg-white hover:text-black transition-all duration-300"
          >
            Start Your Transformation
          </button>
        </div>
      </section>
    </div>
  );
}
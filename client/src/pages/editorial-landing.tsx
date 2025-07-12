import { useState } from "react";
import { useLocation } from "wouter";
import { SandraImages } from "@/lib/sandra-images";

export default function EditorialLanding() {
  const [, setLocation] = useLocation();

  const handleGetStarted = (plan: string) => {
    localStorage.setItem('selectedPlan', plan);
    setLocation('/checkout');
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-8 py-5">
          <div className="flex items-center justify-between">
            <div className="font-serif text-xl font-light tracking-wide text-black">
              SSELFIE
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <button className="text-xs uppercase tracking-[0.3em] text-gray-600 hover:text-black transition-colors">
                About
              </button>
              <button className="text-xs uppercase tracking-[0.3em] text-gray-600 hover:text-black transition-colors">
                How It Works
              </button>
              <button className="text-xs uppercase tracking-[0.3em] text-gray-600 hover:text-black transition-colors">
                Pricing
              </button>
              <button className="text-xs uppercase tracking-[0.3em] text-gray-600 hover:text-black transition-colors">
                Blog
              </button>
              <button
                onClick={() => setLocation("/login")}
                className="text-xs uppercase tracking-[0.3em] text-gray-600 hover:text-black transition-colors"
              >
                Login
              </button>
            </div>
            <button
              onClick={() => handleGetStarted('sselfie-studio-pro')}
              className="px-6 py-3 border border-black text-black text-xs uppercase tracking-[0.3em] hover:bg-black hover:text-white transition-all duration-300"
            >
              Start Your Journey
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section - Full Bleed Editorial */}
      <section className="relative min-h-screen flex items-end justify-center bg-black text-white overflow-hidden">
        <div className="absolute inset-0 opacity-40">
          <img
            src={SandraImages.hero.homepage}
            alt="Sandra"
            className="w-full h-full object-cover"
          />
        </div>
        
        {/* Hero Content - Positioned Lower */}
        <div className="relative z-10 text-center max-w-4xl px-8 pb-32">
          <div className="text-xs uppercase tracking-[0.4em] text-white/60 mb-8 font-light">
            Your Personal Brand Starts Here
          </div>
          
          <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl font-extralight uppercase tracking-[0.3em] leading-none mb-4">
            It starts with<br />your selfies
          </h1>
          
          <p className="text-base tracking-wide uppercase opacity-70 font-light max-w-2xl mx-auto leading-relaxed mt-8">
            One year ago my marriage ended. Today? A business that actually works.
          </p>
        </div>
      </section>

      {/* Story Section - Editorial Style */}
      <section className="py-32 bg-white">
        <div className="max-w-4xl mx-auto px-8">
          <div className="text-center mb-20">
            <div className="text-xs uppercase tracking-[0.4em] text-gray-500 mb-8">
              The Story
            </div>
            <blockquote className="font-serif text-3xl md:text-4xl lg:text-5xl font-light italic text-black leading-tight">
              "This didn't start as a business.<br />
              It started as survival."
            </blockquote>
          </div>
          
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="space-y-6 text-gray-700 leading-relaxed">
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
                coffee in the other. And over time, I built a real audience, a real brand, and eventually, 
                a real business.
              </p>
              <p className="font-medium text-black">
                Your mess is your message. Let's turn it into money.
              </p>
            </div>
            
            <div className="aspect-[4/5] bg-gray-100 overflow-hidden">
              <img
                src={SandraImages.journey.building}
                alt="Sandra's journey"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section - Editorial Grid */}
      <section className="py-32 bg-gray-50">
        <div className="max-w-6xl mx-auto px-8">
          <div className="text-center mb-20">
            <div className="text-xs uppercase tracking-[0.4em] text-gray-500 mb-8">
              What We Do
            </div>
            <h2 className="font-serif text-4xl md:text-5xl font-light text-black mb-8">
              Your complete<br />brand transformation
            </h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* AI Photoshoot */}
            <div className="bg-white group hover:bg-black hover:text-white transition-all duration-500">
              <div className="aspect-square bg-gray-100 overflow-hidden relative">
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
              <div className="p-8">
                <div className="text-8xl font-serif font-extralight opacity-10 absolute">01</div>
                <h3 className="font-serif text-2xl font-light mb-4 relative z-10">AI Photoshoot</h3>
                <p className="text-sm text-gray-600 group-hover:text-white/80 leading-relaxed">
                  Upload your selfies, get professional brand photos that look like you hired a photographer.
                </p>
              </div>
            </div>

            {/* Luxury Flatlays */}
            <div className="bg-white group hover:bg-black hover:text-white transition-all duration-500">
              <div className="aspect-square bg-gray-100 overflow-hidden relative">
                <img
                  src={SandraImages.flatlays.workspace1}
                  alt="Luxury Flatlays"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-8">
                  <div className="text-white">
                    <h4 className="text-xs uppercase tracking-[0.3em] mb-2">Luxury Flatlays</h4>
                    <p className="text-sm opacity-80">Curated luxury lifestyle collections</p>
                  </div>
                </div>
              </div>
              <div className="p-8">
                <div className="text-8xl font-serif font-extralight opacity-10 absolute">02</div>
                <h3 className="font-serif text-2xl font-light mb-4 relative z-10">Luxury Flatlays</h3>
                <p className="text-sm text-gray-600 group-hover:text-white/80 leading-relaxed">
                  Professional flatlay collections to elevate your brand with that expensive aesthetic.
                </p>
              </div>
            </div>

            {/* Brand Builder */}
            <div className="bg-white group hover:bg-black hover:text-white transition-all duration-500">
              <div className="aspect-square bg-gray-100 overflow-hidden relative">
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
              <div className="p-8">
                <div className="text-8xl font-serif font-extralight opacity-10 absolute">03</div>
                <h3 className="font-serif text-2xl font-light mb-4 relative z-10">Brand Builder</h3>
                <p className="text-sm text-gray-600 group-hover:text-white/80 leading-relaxed">
                  Build your business with professional templates that actually convert.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section - Editorial Layout */}
      <section className="py-32 bg-white">
        <div className="max-w-4xl mx-auto px-8">
          <div className="text-center mb-20">
            <div className="text-xs uppercase tracking-[0.4em] text-gray-500 mb-8">
              Choose Your Journey
            </div>
            <h2 className="font-serif text-4xl md:text-5xl font-light text-black">
              Simple. Powerful.
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            {/* SSELFIE Studio */}
            <div className="bg-gray-50 p-12 text-center group hover:bg-black hover:text-white transition-all duration-500">
              <h3 className="font-serif text-3xl font-light mb-6">SSELFIE Studio</h3>
              <div className="text-5xl font-light mb-8">$29<span className="text-lg text-gray-500 group-hover:text-white/60">/month</span></div>
              
              <div className="space-y-4 mb-12 text-left">
                <div className="flex items-start">
                  <span className="text-black group-hover:text-white mr-3">•</span>
                  <span className="text-sm">Personal AI photoshoot (100 images/month)</span>
                </div>
                <div className="flex items-start">
                  <span className="text-black group-hover:text-white mr-3">•</span>
                  <span className="text-sm">Luxury flatlay collections</span>
                </div>
                <div className="flex items-start">
                  <span className="text-black group-hover:text-white mr-3">•</span>
                  <span className="text-sm">Brand templates & landing pages</span>
                </div>
                <div className="flex items-start">
                  <span className="text-black group-hover:text-white mr-3">•</span>
                  <span className="text-sm">Custom domain connection</span>
                </div>
              </div>
              
              <button
                onClick={() => handleGetStarted('sselfie-studio')}
                className="w-full py-4 border border-black group-hover:border-white text-black group-hover:text-white text-xs uppercase tracking-[0.3em] hover:bg-black hover:text-white group-hover:hover:bg-white group-hover:hover:text-black transition-all duration-300"
              >
                Start Your Journey
              </button>
            </div>

            {/* SSELFIE Studio PRO */}
            <div className="bg-black text-white p-12 text-center relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <div className="bg-white text-black px-6 py-2 text-xs uppercase tracking-[0.3em]">
                  Most Popular
                </div>
              </div>
              
              <h3 className="font-serif text-3xl font-light mb-6">SSELFIE Studio PRO</h3>
              <div className="text-5xl font-light mb-8">$67<span className="text-lg text-gray-400">/month</span></div>
              
              <div className="space-y-4 mb-12 text-left">
                <div className="flex items-start">
                  <span className="text-white mr-3">•</span>
                  <span className="text-sm">Everything in Studio</span>
                </div>
                <div className="flex items-start">
                  <span className="text-white mr-3">•</span>
                  <span className="text-sm">300 AI images per month</span>
                </div>
                <div className="flex items-start">
                  <span className="text-white mr-3">•</span>
                  <span className="text-sm text-white">Sandra Personal Brand AI Agent</span>
                </div>
                <div className="flex items-start">
                  <span className="text-white mr-3">•</span>
                  <span className="text-sm">Custom brand strategy & content</span>
                </div>
                <div className="flex items-start">
                  <span className="text-white mr-3">•</span>
                  <span className="text-sm">Priority support & guidance</span>
                </div>
              </div>
              
              <button
                onClick={() => handleGetStarted('sselfie-studio-pro')}
                className="w-full py-4 border border-white text-white text-xs uppercase tracking-[0.3em] hover:bg-white hover:text-black transition-all duration-300"
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

      {/* Quote Section - Editorial */}
      <section className="py-32 bg-black text-white text-center">
        <div className="max-w-4xl mx-auto px-8">
          <blockquote className="font-serif text-3xl md:text-4xl lg:text-5xl font-light italic leading-tight mb-12">
            "When you show up as her?<br />
            Everything changes."
          </blockquote>
          
          <button
            onClick={() => handleGetStarted('sselfie-studio-pro')}
            className="inline-block px-12 py-6 border border-white text-white text-xs uppercase tracking-[0.3em] hover:bg-white hover:text-black transition-all duration-300"
          >
            Start Your Transformation
          </button>
        </div>
      </section>
    </div>
  );
}
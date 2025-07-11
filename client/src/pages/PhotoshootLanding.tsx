import React from 'react';
import { Link } from 'wouter';
import { SandraImages } from '@/lib/sandra-images';

export default function PhotoshootLanding() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-8 py-5 flex justify-between items-center">
          <div className="font-serif text-xl font-light tracking-wide">SSELFIE</div>
          <div className="hidden md:flex gap-10">
            <Link href="/about" className="text-xs font-light tracking-widest uppercase hover:opacity-60 transition-opacity">About</Link>
            <Link href="/how-it-works" className="text-xs font-light tracking-widest uppercase hover:opacity-60 transition-opacity">How It Works</Link>
            <Link href="/blog" className="text-xs font-light tracking-widest uppercase hover:opacity-60 transition-opacity">Blog</Link>
            <Link href="/login" className="text-xs font-light tracking-widest uppercase hover:opacity-60 transition-opacity">Login</Link>
          </div>
        </div>
      </nav>

      {/* Hero Section - Full Bleed */}
      <section className="relative min-h-screen flex items-center justify-center bg-black text-white overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 opacity-40">
          <img 
            src={SandraImages.hero.homepage}
            alt="Sandra SSELFIE" 
            className="w-full h-full object-cover"
          />
        </div>
        
        {/* Hero Content */}
        <div className="relative z-10 text-center px-8">
          <div className="text-xs tracking-[0.4em] uppercase text-white/70 mb-10 font-light">
            It starts with your selfies
          </div>
          
          <h1 className="font-serif font-extralight tracking-[0.5em] uppercase mb-5 leading-none text-[clamp(5rem,12vw,12rem)]">
            SSELFIE
          </h1>
          
          <div className="font-serif font-extralight tracking-[0.5em] uppercase mb-16 opacity-80 text-[clamp(1.5rem,4vw,3rem)] leading-none">
            AI BRAND PHOTOSHOOT
          </div>
          
          <div className="text-base tracking-[0.1em] uppercase opacity-80 font-light max-w-2xl mx-auto mb-16">
            Transform your selfies into professional brand photos with AI. €97/month for unlimited generations.
          </div>

          <Link 
            href="/checkout" 
            className="inline-block border border-white text-white px-8 py-4 text-xs tracking-[0.3em] uppercase font-light hover:bg-white hover:text-black transition-all duration-300"
          >
            Start Your Photoshoot
          </Link>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-32 px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-xs tracking-[0.4em] uppercase text-gray-500 mb-8 font-light">
            Simple Process
          </div>
          <h2 className="font-serif font-extralight text-[clamp(3rem,6vw,6rem)] uppercase mb-16 leading-none">
            Three Steps
          </h2>
          
          <div className="grid md:grid-cols-3 gap-16">
            <div className="text-center">
              <div className="w-24 h-24 bg-gray-100 rounded-full mx-auto mb-8 flex items-center justify-center">
                <span className="font-serif text-2xl font-light">01</span>
              </div>
              <h3 className="font-serif text-2xl mb-4 uppercase font-light">Upload</h3>
              <p className="text-gray-600 leading-relaxed font-light">
                Upload 10+ selfies. Our AI trains a custom model just for you in 15 minutes.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-24 h-24 bg-gray-100 rounded-full mx-auto mb-8 flex items-center justify-center">
                <span className="font-serif text-2xl font-light">02</span>
              </div>
              <h3 className="font-serif text-2xl mb-4 uppercase font-light">Chat</h3>
              <p className="text-gray-600 leading-relaxed font-light">
                Tell Sandra AI about your vision. She creates perfect prompts for your brand photoshoot.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-24 h-24 bg-gray-100 rounded-full mx-auto mb-8 flex items-center justify-center">
                <span className="font-serif text-2xl font-light">03</span>
              </div>
              <h3 className="font-serif text-2xl mb-4 uppercase font-light">Generate</h3>
              <p className="text-gray-600 leading-relaxed font-light">
                Get 4 professional brand photos instantly. Save favorites and download to your device.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Image Gallery Preview */}
      <section className="py-32 bg-gray-50">
        <div className="max-w-6xl mx-auto px-8">
          <div className="text-center mb-20">
            <div className="text-xs tracking-[0.4em] uppercase text-gray-500 mb-8 font-light">
              Generated with AI
            </div>
            <h2 className="font-serif font-extralight text-[clamp(3rem,6vw,6rem)] uppercase mb-8 leading-none">
              Your Results
            </h2>
            <p className="text-xl font-light text-gray-600 max-w-2xl mx-auto">
              Professional brand photos created from your selfies using AI technology.
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {SandraImages.aiGallery.slice(0, 8).map((src, index) => (
              <div key={index} className="aspect-[4/5] overflow-hidden bg-gray-200">
                <img 
                  src={src} 
                  alt={`Generated image ${index + 1}`}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing CTA */}
      <section className="py-32 bg-black text-white">
        <div className="max-w-4xl mx-auto px-8 text-center">
          <div className="text-xs tracking-[0.4em] uppercase text-white/70 mb-8 font-light">
            Simple Pricing
          </div>
          
          <h2 className="font-serif font-extralight text-[clamp(3rem,6vw,6rem)] uppercase mb-8 leading-none">
            €97/Month
          </h2>
          
          <p className="text-xl font-light text-white/80 mb-16 max-w-2xl mx-auto">
            Everything you need to create professional brand photos with AI. Cancel anytime.
          </p>
          
          <div className="mb-16">
            <ul className="text-left inline-block space-y-4">
              <li className="flex items-center gap-4">
                <span className="w-2 h-2 bg-white rounded-full"></span>
                <span className="font-light">Custom AI model trained on your selfies</span>
              </li>
              <li className="flex items-center gap-4">
                <span className="w-2 h-2 bg-white rounded-full"></span>
                <span className="font-light">Unlimited professional photo generations</span>
              </li>
              <li className="flex items-center gap-4">
                <span className="w-2 h-2 bg-white rounded-full"></span>
                <span className="font-light">Sandra AI chat for perfect prompts</span>
              </li>
              <li className="flex items-center gap-4">
                <span className="w-2 h-2 bg-white rounded-full"></span>
                <span className="font-light">High-resolution downloads</span>
              </li>
            </ul>
          </div>

          <Link 
            href="/checkout" 
            className="inline-block border border-white text-white px-12 py-6 text-sm tracking-[0.3em] uppercase font-light hover:bg-white hover:text-black transition-all duration-300"
          >
            Start Your Photoshoot
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 bg-gray-50 border-t border-gray-200">
        <div className="max-w-6xl mx-auto px-8 text-center">
          <div className="font-serif text-xl font-light tracking-wide mb-8">SSELFIE</div>
          <div className="text-sm text-gray-500 font-light">
            © 2025 SSELFIE Studio. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
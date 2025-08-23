import React, { useState, useEffect } from 'react';
import { HeroFullBleed } from '../../components/hero-full-bleed';
import { SandraImages } from '../../lib/sandra-images';
import { PreLoginNavigationUnified } from '../../components/pre-login-navigation-unified';
import { GlobalFooter } from '../../components/global-footer';
import { Link } from 'wouter';

// Blog posts data
const featuredPosts = [
  {
    id: 1,
    title: "How I built a personal brand with only my phone and a little courage",
    excerpt: "The real story of starting SSELFIE with nothing but selfies and a stubborn belief that women deserve better than cookie-cutter advice.",
    category: "SSELFIE Stories",
    readTime: "8 min read",
    image: SandraImages.editorial.phone2
  },
  {
    id: 2,
    title: "Branding when you feel like a hot mess",
    excerpt: "Some days you feel unstoppable. Other days you feel like a fraud. Here's how to build a brand that works through both.",
    category: "Mindset & Real Life",
    readTime: "6 min read",
    image: SandraImages.editorial.thinking
  },
  {
    id: 3,
    title: "Why your first offer doesn't have to be perfect (or even close)",
    excerpt: "I launched my first service before I knew what I was doing. Best decision ever. Here's why messy action beats perfect planning.",
    category: "Branding & Offers",
    readTime: "10 min read",
    image: SandraImages.editorial.laptop1
  },
  {
    id: 4,
    title: "Selfies, strategy, and surviving heartbreak: My real method",
    excerpt: "The Method wasn't born in a boardroom. It was born from necessity, heartbreak, and a desperate need to rebuild everything.",
    category: "SSELFIE Stories",
    readTime: "12 min read",
    image: SandraImages.journey.rockBottom
  },
  {
    id: 5,
    title: "The no-agency guide to landing your first client",
    excerpt: "No connections, no experience, no problem. Here's exactly how I went from zero to paying clients without a single networking event.",
    category: "Tutorials & How-Tos",
    readTime: "15 min read",
    image: SandraImages.editorial.laptop2
  },
  {
    id: 6,
    title: "Single mom wisdom: Building a business around real life",
    excerpt: "Forget the 4am morning routines and hustle culture. Here's how to build something sustainable when life is beautifully chaotic.",
    category: "Single Mom Wisdom",
    readTime: "9 min read",
    image: SandraImages.editorial.laughing
  }
];

const categories = [
  "SSELFIE Stories",
  "Tutorials & How-Tos",
  "Mindset & Real Life",
  "Branding & Offers",
  "Single Mom Wisdom"
];

export default function BlogPage() {
  return (
    <div className="bg-white">
      {/* Standardized Navigation */}
      <PreLoginNavigationUnified />
      
      <main>
        {/* Hero Section */}
        <HeroFullBleed
          backgroundImage={SandraImages.hero.about}
          tagline="REAL STORIES, REAL STRATEGY"
          title="THE JOURNAL"
          ctaText="GOT A TOPIC REQUEST? TELL SANDRA"
          ctaLink="#request-topic"
          fullHeight={true}
        />

        {/* Intro Section */}
        <section className="py-20 px-4">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl md:text-4xl text-[#0a0a0a] mb-8 font-light tracking-[-0.01em]" style={{ fontFamily: 'Times New Roman, serif' }}>
              Okay, here's what actually happened…
            </h1>
            
            <div className="space-y-6 text-lg leading-relaxed text-[#0a0a0a] font-inter">
              <p>This isn't your average "blog."</p>
              <p>It's not recycled Pinterest advice or listicles you'll forget in five minutes.</p>
              <p>Every post here is something I wish I'd known when I started. Real talk, real strategy, and a little bit of "you got this" energy.</p>
              <p>Some days it's business. Some days it's mindset. Every day, it's honest.</p>
            </div>
          </div>
        </section>

        {/* Categories */}
        <section className="py-20 px-4 bg-[#f5f5f5]">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-wrap justify-center gap-4 md:gap-6">
              {categories.map((category, index) => (
                <button
                  key={index}
                  className="text-[11px] tracking-[0.3em] uppercase text-[#0a0a0a] bg-transparent border border-[rgba(10,10,10,0.3)] px-6 py-4 hover:bg-[#0a0a0a] hover:text-[#f5f5f5] transition-all duration-300 font-light font-inter"
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Posts Grid */}
        <section className="py-20 px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl text-[#0a0a0a] mb-12 text-center font-light tracking-[-0.01em]" style={{ fontFamily: 'Times New Roman, serif' }}>
              Featured Stories
            </h2>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredPosts.map((post) => (
                <article key={post.id} className="group cursor-pointer">
                  <div className="aspect-[4/3] overflow-hidden mb-6">
                    <img
                      src={post.image}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-sm text-[#666666] font-inter">
                      <span>{post.category}</span>
                      <span>{post.readTime}</span>
                    </div>
                    
                    <h3 className="text-xl font-medium text-[#0a0a0a] group-hover:text-[#666666] transition-colors duration-200 leading-tight font-inter">
                      {post.title}
                    </h3>
                    
                    <p className="text-[#0a0a0a] leading-relaxed font-inter">
                      {post.excerpt}
                    </p>
                    
                    <div className="pt-3">
                      <span className="text-[#0a0a0a] font-medium text-sm tracking-wide hover:text-[#666666] transition-colors duration-200 font-inter">
                        READ MORE →
                      </span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Request Topic Section */}
        <section id="request-topic" className="py-20 px-4 bg-[#f5f5f5]">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl text-[#0a0a0a] mb-8 font-light tracking-[-0.01em]" style={{ fontFamily: 'Times New Roman, serif' }}>
              Want to see something covered?
            </h2>
            
            <p className="text-lg text-[#0a0a0a] mb-8 max-w-2xl mx-auto font-inter">
              DM me on Instagram (@sandra.social) or drop your idea on the contact page.<br />
              This is your space, too. Let's build something real together.
            </p>
            
            <a 
              href="mailto:sandra@sselfie.studio" 
              className="inline-block text-[#f5f5f5] bg-[#0a0a0a] border border-[#0a0a0a] hover:bg-[#f5f5f5] hover:text-[#0a0a0a] transition-colors duration-300 text-[11px] tracking-[0.3em] uppercase no-underline px-8 py-4 font-light font-inter"
            >
              REQUEST A TOPIC
            </a>
          </div>
        </section>
      </main>

      {/* Global Footer */}
      <GlobalFooter />
    </div>
  );
}
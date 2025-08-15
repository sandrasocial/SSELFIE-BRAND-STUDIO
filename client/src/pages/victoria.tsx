import React, { useState } from 'react';
import { MemberNavigation } from '../components/member-navigation';
import { SandraImages } from '../lib/sandra-images';
import { Link } from 'wouter';

interface QuickLinkCard {
  id: string;
  title: string;
  description: string;
  image: string;
  route: string;
  category: string;
}

export default function VictoriaLandingPage() {
  
  // Brand strategy categories for organization
  const strategyCategories = [
    { name: 'Brand Strategy', count: 18, preview: SandraImages.hero.pricing },
    { name: 'Content Planning', count: 22, preview: SandraImages.editorial.laptop1 },
    { name: 'Business Growth', count: 16, preview: SandraImages.journey.success },
    { name: 'Market Positioning', count: 14, preview: SandraImages.editorial.aiSuccess }
  ];

  // Recent strategy sessions preview
  const recentSessions = [
    { id: 1, preview: "Personal brand positioning for coaches...", date: "Today", unread: 1 },
    { id: 2, preview: "Content strategy for LinkedIn growth...", date: "Yesterday", unread: 0 },
    { id: 3, preview: "Target audience identification workshop...", date: "2 days ago", unread: 0 }
  ];

  // Simplified quick link cards - only 3 essential steps
  const quickLinkCards: QuickLinkCard[] = [
    {
      id: 'chat-with-victoria',
      title: 'Chat with Victoria',
      description: 'Strategic brand guidance and business insights from your AI brand strategist',
      image: SandraImages.hero.pricing,
      route: '/victoria-chat',
      category: 'Strategy Session'
    },
    {
      id: 'build-landing-page',
      title: 'Build Landing Page',
      description: 'Create your complete business website with live preview and instant publishing',
      image: SandraImages.journey.success,
      route: '/victoria-preview',
      category: 'Website Builder'
    },
    {
      id: 'advanced-strategy',
      title: 'Advanced Strategy',
      description: 'Deep dive into custom brand positioning and business growth planning',
      image: SandraImages.editorial.aiSuccess,
      route: '/victoria-chat?focus=advanced',
      category: 'Deep Strategy'
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <MemberNavigation />
      
      {/* Coming Soon Banner */}
      <div className="bg-[#f5f5f5] border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 text-center">
          <p className="text-sm text-gray-600">
            <span className="font-medium">Victoria AI Brand Strategist</span> is coming soon after launch. 
            Focus on creating amazing content with Maya AI for now!
          </p>
        </div>
      </div>

      {/* Hero Section - Victoria Introduction */}
      <section className="relative py-20 sm:py-32 px-4 sm:px-6 md:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Hero Content */}
            <div className="order-2 lg:order-1">
              <div className="text-[10px] sm:text-xs font-normal tracking-[0.3em] sm:tracking-[0.4em] uppercase text-[#666666] mb-8">
                AI Brand Strategist
              </div>
              
              <h1 className="font-times text-[clamp(2.5rem,8vw,6rem)] leading-[0.9] font-extralight tracking-[-0.02em] text-black mb-8">
                VICTORIA
              </h1>
              
              <p className="text-lg sm:text-xl font-light leading-relaxed text-[#666666] mb-12 max-w-xl">
                Your AI brand strategist who transforms ambitious women into recognized experts. 
                Victoria helps you clarify your message, position your expertise, and build a personal brand that attracts dream opportunities.
              </p>

              <div className="space-y-6">
                <div className="flex items-center space-x-4">
                  <div className="w-2 h-2 bg-black"></div>
                  <span className="text-sm tracking-[0.1em] uppercase text-[#666666]">Strategic Brand Positioning</span>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-2 h-2 bg-black"></div>
                  <span className="text-sm tracking-[0.1em] uppercase text-[#666666]">Content & Marketing Strategy</span>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-2 h-2 bg-black"></div>
                  <span className="text-sm tracking-[0.1em] uppercase text-[#666666]">Business Growth Planning</span>
                </div>
              </div>
            </div>
            
            {/* Hero Image */}
            <div className="order-1 lg:order-2">
              <div className="aspect-[4/5] bg-[#f5f5f5] overflow-hidden">
                <img 
                  src={SandraImages.hero.pricing}
                  alt="Victoria AI Brand Strategist"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Access Dashboard */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 md:px-8 bg-[#f5f5f5]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-times text-[clamp(2rem,6vw,4rem)] leading-[0.9] font-extralight tracking-[-0.02em] text-black mb-8">
              YOUR VICTORIA DASHBOARD
            </h2>
            <p className="text-base sm:text-lg font-light text-[#666666] max-w-2xl mx-auto">
              Strategic guidance and brand development tools at your fingertips
            </p>
          </div>

          {/* Quick Link Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
            {quickLinkCards.map((card) => (
              <Link key={card.id} href={card.route}>
                <div className="bg-white group hover:bg-[#f9f9f9] transition-all duration-300 cursor-pointer">
                  <div className="aspect-[4/3] overflow-hidden bg-[#f5f5f5]">
                    <img 
                      src={card.image}
                      alt={card.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-8">
                    <div className="text-[10px] tracking-[0.3em] uppercase text-[#666666] mb-4">
                      {card.category}
                    </div>
                    <h3 className="font-times text-xl sm:text-2xl font-light tracking-[-0.01em] text-black mb-4">
                      {card.title}
                    </h3>
                    <p className="text-sm font-light text-[#666666] leading-relaxed">
                      {card.description}
                    </p>
                    <div className="mt-6 text-[10px] tracking-[0.2em] uppercase text-black group-hover:tracking-[0.3em] transition-all duration-300">
                      Access →
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Simple Workflow Guide */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 md:px-8 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-times text-[clamp(2rem,6vw,4rem)] leading-[0.9] font-extralight tracking-[-0.02em] text-black mb-8">
              SIMPLE SUCCESS PATH
            </h2>
            <p className="text-base sm:text-lg font-light text-[#666666] max-w-2xl mx-auto">
              Three steps to your professional brand presence
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
            <Link href="/victoria-chat">
              <div className="group cursor-pointer text-center">
                <div className="aspect-[4/3] overflow-hidden bg-[#f5f5f5] mb-6">
                  <img 
                    src={SandraImages.hero.pricing}
                    alt="Chat with Victoria"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="text-[10px] tracking-[0.3em] uppercase text-[#666666] mb-3">
                  Step 01
                </div>
                <h3 className="font-times text-xl sm:text-2xl font-light tracking-[-0.01em] text-black mb-4">
                  Strategy Chat
                </h3>
                <p className="text-sm font-light text-[#666666] leading-relaxed">
                  Tell Victoria about your business vision and brand goals
                </p>
              </div>
            </Link>

            <Link href="/victoria-preview">
              <div className="group cursor-pointer text-center">
                <div className="aspect-[4/3] overflow-hidden bg-[#f5f5f5] mb-6">
                  <img 
                    src={SandraImages.journey.success}
                    alt="Build Landing Page"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="text-[10px] tracking-[0.3em] uppercase text-[#666666] mb-3">
                  Step 02
                </div>
                <h3 className="font-times text-xl sm:text-2xl font-light tracking-[-0.01em] text-black mb-4">
                  Build & Preview
                </h3>
                <p className="text-sm font-light text-[#666666] leading-relaxed">
                  Create your landing page with live preview and publish instantly
                </p>
              </div>
            </Link>

            <Link href="/victoria-chat?focus=advanced">
              <div className="group cursor-pointer text-center">
                <div className="aspect-[4/3] overflow-hidden bg-[#f5f5f5] mb-6">
                  <img 
                    src={SandraImages.editorial.aiSuccess}
                    alt="Advanced Strategy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="text-[10px] tracking-[0.3em] uppercase text-[#666666] mb-3">
                  Step 03
                </div>
                <h3 className="font-times text-xl sm:text-2xl font-light tracking-[-0.01em] text-black mb-4">
                  Scale & Optimize
                </h3>
                <p className="text-sm font-light text-[#666666] leading-relaxed">
                  Advanced positioning and growth strategy for market leadership
                </p>
              </div>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
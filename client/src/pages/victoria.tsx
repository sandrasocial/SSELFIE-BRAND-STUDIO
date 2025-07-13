import React, { useState } from 'react';
import { WorkspaceNavigation } from '@/components/workspace-navigation';
import { SandraImages } from '@/lib/sandra-images';
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

  // Quick link cards for Victoria's services
  const quickLinkCards: QuickLinkCard[] = [
    {
      id: 'new-chat',
      title: 'Start New Chat with Victoria',
      description: 'Get strategic brand guidance and business insights',
      image: SandraImages.hero.pricing,
      route: '/victoria-chat',
      category: 'Strategy Session'
    },
    {
      id: 'recent-sessions',
      title: 'Recent Strategy Sessions',
      description: 'Continue previous brand strategy discussions',
      image: SandraImages.editorial.laptop1,
      route: '/victoria-chat?history=true',
      category: 'Session History'
    },
    {
      id: 'brand-profile',
      title: 'Brand Profile & Goals',
      description: 'Update your business goals and target market',
      image: SandraImages.journey.success,
      route: '/profile?tab=brand',
      category: 'Brand Setup'
    },
    {
      id: 'strategy-library',
      title: 'Strategy Resources',
      description: 'Access your custom brand strategy templates',
      image: SandraImages.editorial.aiSuccess,
      route: '/strategy-library',
      category: 'Resources'
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <WorkspaceNavigation />

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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
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

      {/* Strategy Categories Overview */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 md:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-times text-[clamp(2rem,6vw,4rem)] leading-[0.9] font-extralight tracking-[-0.02em] text-black mb-8">
              STRATEGY FOCUS AREAS
            </h2>
            <p className="text-base sm:text-lg font-light text-[#666666] max-w-2xl mx-auto">
              Comprehensive brand strategy across all business dimensions
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {strategyCategories.map((category) => (
              <Link key={category.name} href={`/victoria-chat?focus=${category.name.toLowerCase().replace(' ', '-')}`}>
                <div className="group cursor-pointer">
                  <div className="aspect-square overflow-hidden bg-[#f5f5f5] mb-4">
                    <img 
                      src={category.preview}
                      alt={category.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="text-center">
                    <h3 className="font-times text-lg sm:text-xl font-light tracking-[-0.01em] text-black mb-2">
                      {category.name}
                    </h3>
                    <p className="text-xs tracking-[0.1em] uppercase text-[#666666]">
                      {category.count} Resources
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Recent Strategy Sessions */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 md:px-8 bg-[#f5f5f5]">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-times text-[clamp(1.8rem,5vw,3rem)] leading-[0.9] font-extralight tracking-[-0.02em] text-black mb-6">
              RECENT STRATEGY SESSIONS
            </h2>
            <p className="text-base font-light text-[#666666]">
              Continue building your brand strategy with Victoria
            </p>
          </div>

          <div className="space-y-4">
            {recentSessions.map((session) => (
              <Link key={session.id} href={`/victoria-chat?session=${session.id}`}>
                <div className="bg-white p-6 hover:bg-[#f9f9f9] transition-all duration-300 cursor-pointer group">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-light text-black mb-2 group-hover:text-[#333] transition-colors">
                        {session.preview}
                      </p>
                      <div className="flex items-center space-x-4">
                        <span className="text-xs tracking-[0.1em] uppercase text-[#666666]">
                          {session.date}
                        </span>
                        {session.unread > 0 && (
                          <span className="text-xs tracking-[0.1em] uppercase text-black">
                            {session.unread} New Insight
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-[10px] tracking-[0.2em] uppercase text-[#666666] group-hover:text-black group-hover:tracking-[0.3em] transition-all duration-300">
                      Continue →
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link href="/victoria-chat?history=all">
              <button className="text-[10px] tracking-[0.2em] uppercase text-black hover:tracking-[0.3em] transition-all duration-300 pb-2 border-b border-black/20 hover:border-black">
                View All Strategy Sessions
              </button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
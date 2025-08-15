import React, { useState } from 'react';
import { MemberNavigation } from '../components/member-navigation';
import { SandraImages } from '../lib/sandra-images';
import { Link } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../hooks/use-auth';

interface QuickLinkCard {
  id: string;
  title: string;
  description: string;
  image: string;
  route: string;
  category: string;
}

export default function MayaLandingPage() {
  const { user } = useAuth();

  // Fetch real Maya chat history
  const { data: mayaChats, isLoading: chatsLoading } = useQuery({
    queryKey: ['/api/maya-chats'],
    enabled: !!user,
  });
  
  // Image categories for organization
  const imageCategories = [
    { name: 'Editorial', count: 23, preview: SandraImages.editorial.thinking },
    { name: 'Lifestyle', count: 18, preview: SandraImages.editorial.laughing },
    { name: 'Business', count: 15, preview: SandraImages.hero.pricing },
    { name: 'Creative', count: 12, preview: SandraImages.editorial.laptop1 }
  ];

  // Convert real chats to display format
  const recentChats = mayaChats?.slice(0, 3).map((chat: any) => ({
    id: chat.id,
    preview: chat.chatSummary || chat.chatTitle,
    date: new Date(chat.createdAt).toLocaleDateString('en-US', { 
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    }),
    unread: 0
  })) || [];

  // Quick link cards for Maya's services
  const quickLinkCards: QuickLinkCard[] = [
    {
      id: 'new-chat',
      title: 'Start New Chat with Maya',
      description: 'Get personalized photography and styling advice',
      image: SandraImages.editorial.thinking,
      route: '/maya',
      category: 'Chat'
    },
    {
      id: 'recent-chats',
      title: 'Recent Conversations',
      description: 'Continue previous styling discussions',
      image: SandraImages.editorial.laughing,
      route: '/maya?history=true',
      category: 'Chat History'
    },
    {
      id: 'profile-settings',
      title: 'Update Profile & Preferences',
      description: 'Edit your brand profile for better AI recommendations',
      image: SandraImages.hero.pricing,
      route: '/profile',
      category: 'Settings'
    },
    {
      id: 'all-images',
      title: 'View All Images',
      description: 'Browse your complete AI photo collection',
      image: SandraImages.editorial.laptop1,
      route: '/gallery',
      category: 'Gallery'
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <MemberNavigation />

      {/* Hero Section - Maya Introduction */}
      <section className="relative py-20 sm:py-32 px-4 sm:px-6 md:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Hero Content */}
            <div className="order-2 lg:order-1">
              <div className="text-[10px] sm:text-xs font-normal tracking-[0.3em] sm:tracking-[0.4em] uppercase text-[#666666] mb-8">
                AI Photography Stylist
              </div>
              
              <h1 className="font-times text-[clamp(2.5rem,8vw,6rem)] leading-[0.9] font-extralight tracking-[-0.02em] text-black mb-8">
                MAYA
              </h1>
              
              <p className="text-lg sm:text-xl font-light leading-relaxed text-[#666666] mb-12 max-w-xl">
                Your AI photography stylist who understands your aesthetic. Maya creates personalized prompts, 
                style recommendations, and helps you capture the perfect visual story for your brand.
              </p>

              <div className="space-y-6">
                <div className="flex items-center space-x-4">
                  <div className="w-2 h-2 bg-black"></div>
                  <span className="text-sm tracking-[0.1em] uppercase text-[#666666]">Professional Camera Specs</span>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-2 h-2 bg-black"></div>
                  <span className="text-sm tracking-[0.1em] uppercase text-[#666666]">Film Texture & Lighting</span>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-2 h-2 bg-black"></div>
                  <span className="text-sm tracking-[0.1em] uppercase text-[#666666]">Style Learning & Memory</span>
                </div>
              </div>
            </div>
            
            {/* Hero Image */}
            <div className="order-1 lg:order-2">
              <div className="aspect-[4/5] bg-[#f5f5f5] overflow-hidden">
                <img 
                  src={SandraImages.editorial.thinking}
                  alt="Maya AI Photography Stylist"
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
              YOUR MAYA DASHBOARD
            </h2>
            <p className="text-base sm:text-lg font-light text-[#666666] max-w-2xl mx-auto">
              Quick access to all your photography styling tools and conversations
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

      {/* Image Categories Overview */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 md:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-times text-[clamp(2rem,6vw,4rem)] leading-[0.9] font-extralight tracking-[-0.02em] text-black mb-8">
              YOUR IMAGE COLLECTION
            </h2>
            <p className="text-base sm:text-lg font-light text-[#666666] max-w-2xl mx-auto">
              Organized by style and mood for easy browsing
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {imageCategories.map((category) => (
              <Link key={category.name} href={`/gallery?category=${category.name.toLowerCase()}`}>
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
                      {category.count} Images
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Recent Chat History */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 md:px-8 bg-[#f5f5f5]">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-times text-[clamp(1.8rem,5vw,3rem)] leading-[0.9] font-extralight tracking-[-0.02em] text-black mb-6">
              RECENT CONVERSATIONS
            </h2>
            <p className="text-base font-light text-[#666666]">
              Continue where you left off with Maya
            </p>
          </div>

          <div className="space-y-4">
            {chatsLoading ? (
              <div className="text-center py-8">
                <p className="text-sm font-light text-[#666666]">Loading your conversations...</p>
              </div>
            ) : recentChats.length > 0 ? (
              recentChats.map((chat) => (
                <Link key={chat.id} href={`/maya?chat=${chat.id}`}>
                  <div className="bg-white p-6 hover:bg-[#f9f9f9] transition-all duration-300 cursor-pointer group">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-light text-black mb-2 group-hover:text-[#333] transition-colors">
                          {chat.preview}
                        </p>
                        <div className="flex items-center space-x-4">
                          <span className="text-xs tracking-[0.1em] uppercase text-[#666666]">
                            {chat.date}
                          </span>
                          {chat.unread > 0 && (
                            <span className="text-xs tracking-[0.1em] uppercase text-black">
                              {chat.unread} New
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-[10px] tracking-[0.2em] uppercase text-[#666666] group-hover:text-black group-hover:tracking-[0.3em] transition-all duration-300">
                      Continue →
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="text-center py-8">
                <p className="text-sm font-light text-[#666666]">No conversations yet. Start chatting with Maya!</p>
                <Link href="/maya">
                  <button className="mt-4 text-[10px] tracking-[0.2em] uppercase text-black hover:tracking-[0.3em] transition-all duration-300 pb-2 border-b border-black/20 hover:border-black">
                    Start New Chat
                  </button>
                </Link>
              </div>
            )}
          </div>

          <div className="text-center mt-12">
            <Link href="/maya?history=all">
              <button className="text-[10px] tracking-[0.2em] uppercase text-black hover:tracking-[0.3em] transition-all duration-300 pb-2 border-b border-black/20 hover:border-black">
                View All Conversations
              </button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
import React, { useState, useEffect } from 'react';
import { Camera, Home, User, Settings, Star, Grid, Search, Bell, ChevronRight, Heart, Share2, MessageCircle, Play, Plus, MoreHorizontal, Send, X } from 'lucide-react';
import { StudioScreen } from './StudioScreen';
import { MayaScreen } from './MayaScreen';
import { GalleryScreen } from './GalleryScreen';
import { ProfileScreen } from './ProfileScreen';

const SselfieAppLayout = () => {
  const [activeTab, setActiveTab] = useState('studio');
  const [isLoading, setIsLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 2500);
    const clockTimer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => {
      clearTimeout(timer);
      clearInterval(clockTimer);
    };
  }, []);

  const tabs = [
    { id: 'studio', label: 'Studio', icon: Camera },
    { id: 'maya', label: 'Maya', icon: MessageCircle },
    { id: 'gallery', label: 'Gallery', icon: Grid },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  // Mock user and galleryItems for now
  const user = {
    name: 'Sarah Chen',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
    membershipTier: 'Premium',
    followers: '3.2k',
    following: '428',
    posts: '127'
  };

  const galleryItems = [
    'https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=400&h=400&fit=crop'
  ];

  if (isLoading) {
    return (
      <div className="h-screen bg-stone-50 flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-stone-50 via-stone-100 to-stone-50"></div>
        <div className="relative z-10 text-center px-8">
          <div className="w-20 h-20 border border-stone-300 rounded-full animate-spin mx-auto mb-16 flex items-center justify-center">
            <div className="w-3 h-3 bg-stone-600 rounded-full animate-pulse"></div>
          </div>
          <h1 className="text-stone-900 text-4xl font-serif font-thin tracking-[0.5em] mb-6 leading-none">SSELFIE</h1>
          <p className="text-xs font-light tracking-[0.4em] uppercase text-stone-500 opacity-70">Creating Magic</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-stone-50 relative overflow-hidden" style={{ 
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Helvetica Neue", Arial, sans-serif'
    }}>
      {/* Enhanced gradient backdrop */}
      <div className="absolute inset-0 bg-gradient-to-br from-stone-50 via-stone-100/50 to-stone-50"></div>
      {/* Main app container */}
      <div className="relative h-full mx-1 sm:mx-2 pt-1 pb-36 sm:pb-28">
        <div className="h-full bg-stone-100/60 backdrop-blur-3xl rounded-[1.5rem] sm:rounded-[2.5rem] border border-stone-200/80 overflow-hidden shadow-lg">
          {/* Premium status bar */}
          <div className="flex justify-between items-center px-4 sm:px-8 py-4 sm:py-6 pb-3 sm:pb-4">
            <div className="text-stone-900 font-light tracking-wide text-sm sm:text-base">
              {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
            <div className="flex items-center space-x-2">
              <div className="flex space-x-1">
                <div className="w-5 h-2 sm:w-7 sm:h-2.5 bg-stone-800 rounded-full"></div>
                <div className="w-5 h-2 sm:w-7 sm:h-2.5 bg-stone-400 rounded-full"></div>
                <div className="w-5 h-2 sm:w-7 sm:h-2.5 bg-stone-300 rounded-full"></div>
              </div>
            </div>
          </div>
          {/* Content area */}
          <div className="flex-1 px-4 sm:px-8 pb-4 sm:pb-8 pt-2 h-full overflow-y-auto">
            {activeTab === 'studio' && <StudioScreen user={user} />}
            {activeTab === 'maya' && <MayaScreen />}
            {activeTab === 'gallery' && <GalleryScreen items={galleryItems} />}
            {activeTab === 'profile' && <ProfileScreen user={user} />}
          </div>
        </div>
      </div>
      {/* Floating premium tab bar */}
      <div className="absolute bottom-4 sm:bottom-4 left-2 sm:left-3 right-2 sm:right-3">
        <div className="bg-stone-100/95 backdrop-blur-3xl rounded-2xl sm:rounded-3xl border border-stone-200/60 px-1 sm:px-2 py-1 sm:py-2 shadow-lg">
          <div className="flex justify-around items-center">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex flex-col items-center space-y-1 sm:space-y-2 px-3 sm:px-6 py-3 sm:py-4 rounded-xl sm:rounded-2xl transition-all duration-500 ease-out min-w-[60px] sm:min-w-[70px] ${
                    isActive 
                      ? 'bg-stone-200/70 transform scale-105' 
                      : 'hover:bg-stone-200/40 hover:scale-102'
                  }`}
                >
                  <Icon 
                    size={20} 
                    strokeWidth={1}
                    className={`sm:w-6 sm:h-6 transition-all duration-300 ${
                      isActive ? 'text-stone-900' : 'text-stone-500'
                    }`}
                  />
                  <span className={`text-xs font-light tracking-[0.2em] uppercase transition-all duration-300 ${
                    isActive ? 'text-stone-900' : 'text-stone-500'
                  }`}>
                    {tab.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SselfieAppLayout;

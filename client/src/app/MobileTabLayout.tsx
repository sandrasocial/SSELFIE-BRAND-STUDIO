import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { SSELFIEChat } from '../components/SSELFIEChat.js';
import StudioScreen from '../app_v2/StudioScreen.js';
import ProfileScreen from '../app_v2/ProfileScreen.js';
import SettingsScreen from '../app_v2/SettingsScreen.js';
import GalleryTabScreen from '../components/GalleryTabScreen.js';
import { useAuth } from '../hooks/use-auth.js';
import { ThemeToggle } from '../components/ThemeToggle.js';
import { Camera, Grid, User, Settings, MessageCircle, Bell, Battery, Signal, Wifi } from 'lucide-react';

// SSELFIE BRAND STUDIO - MOBILE-FIRST TAB NAVIGATION
// User Journey: Authentication → Training → App Studio (Tabs) → Advanced Features
// 
// Tab Structure (Mobile-Optimized Design):
// 1. Studio Tab - Main creation interface
// 2. Maya Tab - AI styling assistant  
// 3. Gallery Tab - Photo collection (mobile-optimized tab component)
// 4. Profile Tab - User settings & progress
// 5. More Tab - Advanced tools & settings

// Editorial Tab Configuration - Clean and Focused
const createTabs = (user: { name?: string; email?: string; image?: string }) => [
  {
    id: 'studio',
    label: 'Studio',
    icon: Camera,
    description: 'Create with SSELFIE AI',
    component: <StudioScreen />
  },
  {
    id: 'maya',
    label: 'Maya',
    icon: MessageCircle,
    description: 'AI Photo Stylist',
    component: <SSELFIEChat />
  },
  {
    id: 'gallery',
    label: 'Gallery',
    icon: Grid,
    description: 'Your photo collection',
    route: '/gallery'
  },
  {
    id: 'profile',
    label: 'Profile',
    icon: User,
    description: 'Your aesthetic feed',
    component: <ProfileScreen />
  },
  {
    id: 'more',
    label: 'More',
    icon: Settings,
    description: 'Advanced tools & settings',
    component: <SettingsScreen />
  }
];

// Main MobileTabLayout Component - Fixed Structure
function MobileTabLayout() {
  const [activeTab, setActiveTab] = useState('studio');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [batteryLevel, setBatteryLevel] = useState(85);
  const [hasNotifications, setHasNotifications] = useState(true);
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  
  const tabs = createTabs(user || {});
  const currentTab = tabs.find(tab => tab.id === activeTab);

  // Status bar timer
  useEffect(() => {
    const clockTimer = setInterval(() => setCurrentTime(new Date()), 1000);
    
    // Simulate battery level changes
    const batteryTimer = setInterval(() => {
      setBatteryLevel(prev => Math.max(20, prev - Math.random() * 2));
    }, 30000);
    
    return () => {
      clearInterval(clockTimer);
      clearInterval(batteryTimer);
    };
  }, []);

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* Status Bar */}
      <div className="fixed top-0 left-0 right-0 z-50 flex justify-between items-center px-4 py-2 bg-black/90 backdrop-blur-md">
        <div className="text-sm font-medium">
          {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <div className="w-1 h-3 bg-white rounded-full" />
            <div className="w-1 h-3 bg-white/60 rounded-full" />
            <div className="w-1 h-3 bg-white/30 rounded-full" />
          </div>
          
          {isAuthenticated && user && (
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
              <span className="text-xs tracking-wide">ONLINE</span>
            </div>
          )}
          
          <div className="flex items-center gap-1">
            <Bell size={12} />
            {hasNotifications && (
              <div className="w-1 h-1 bg-red-500 rounded-full"></div>
            )}
          </div>
          
          <div className="flex items-center gap-1">
            <Battery size={12} />
            <span className="text-xs">{Math.round(batteryLevel)}%</span>
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="sticky top-10 z-40 bg-black/90 backdrop-blur-md border-b border-white/10 p-4 text-center">
        <h1 className="text-2xl font-serif font-light tracking-[0.3em] text-white uppercase">
          SSELFIE
        </h1>
        <p className="text-xs text-zinc-500 tracking-[0.2em] uppercase">BRAND STUDIO</p>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 px-4 py-6 pb-32 overflow-y-auto">
        {currentTab?.component || (
          <div className="text-center py-12">
            <p className="text-zinc-500 text-sm">Content will load in new page</p>
          </div>
        )}
      </main>

      {/* Tab Navigation - Mobile Optimized */}
      <div 
        className="fixed bottom-4 left-4 right-4 z-50"
        style={{
          paddingBottom: 'env(safe-area-inset-bottom)',
          paddingLeft: 'env(safe-area-inset-left)',
          paddingRight: 'env(safe-area-inset-right)',
        }}
      >
        <div className="bg-zinc-800/90 backdrop-blur-md border border-white/10 rounded-2xl p-2">
          <div className="flex justify-around">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`flex-1 flex flex-col items-center justify-center p-3 rounded-xl transition-all duration-300 min-h-[56px] ${
                    isActive 
                      ? 'bg-white/10 text-white scale-105' 
                      : 'text-zinc-500 hover:text-white hover:bg-white/5'
                  }`}
                  style={{ 
                    WebkitTapHighlightColor: 'transparent',
                    touchAction: 'manipulation'
                  }}
                  title={tab.description}
                  aria-label={`Switch to ${tab.label}`}
                >
                  <Icon size={20} strokeWidth={1.2} className="mb-1" />
                  <span className="text-xs tracking-wide uppercase font-light">
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
}

export default MobileTabLayout;
export { MobileTabLayout };
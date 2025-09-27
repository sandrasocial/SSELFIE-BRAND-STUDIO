import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/use-auth.js';
import { Camera, Grid, User, Settings, MessageCircle, Bell, Battery } from 'lucide-react';

// Import the new app_v2 screen components
import StudioScreen from './StudioScreen.js';
import MayaScreen from './MayaScreen.js';
import GalleryScreen from './GalleryScreen.js';
import ProfileScreen from './ProfileScreen.js';
import SettingsScreen from './SettingsScreen.js';

// SSELFIE BRAND STUDIO - NEW UI LAYOUT
// Replaces the old AppLayout/MobileTabLayout with new app_v2 components

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
    component: <MayaScreen />
  },
  {
    id: 'gallery',
    label: 'Gallery',
    icon: Grid,
    description: 'Your photo collection',
    component: <GalleryScreen />
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

// Main SselfieAppLayout Component
function SselfieAppLayout() {
  const [activeTab, setActiveTab] = useState('studio');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [batteryLevel, setBatteryLevel] = useState(85);
  const [hasNotifications, setHasNotifications] = useState(true);
  const { user, isAuthenticated } = useAuth();
  
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
    <div className="min-h-screen bg-stone-50 flex flex-col" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Helvetica Neue", Arial, sans-serif' }}>
      {/* Status Bar */}
      <div className="fixed top-0 left-0 right-0 z-50 flex justify-between items-center px-6 py-4 bg-stone-100/80 backdrop-blur-3xl border-b border-stone-200/80 shadow-lg">
        <div className="text-stone-900 font-light tracking-wide text-sm">
          {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
        <div className="flex items-center space-x-3">
          <div className="flex space-x-1">
            <div className="w-5 h-2 bg-stone-800 rounded-full"></div>
            <div className="w-5 h-2 bg-stone-400 rounded-full"></div>
            <div className="w-5 h-2 bg-stone-300 rounded-full"></div>
          </div>
          {isAuthenticated && user && (
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
              <span className="text-xs tracking-[0.3em] uppercase font-light text-stone-600">Online</span>
            </div>
          )}
          <div className="flex items-center space-x-1">
            <Bell size={16} strokeWidth={1} className="text-stone-500" />
            {hasNotifications && (
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
            )}
          </div>
          <div className="flex items-center space-x-1">
            <Battery size={16} strokeWidth={1} className="text-stone-500" />
            <span className="text-xs text-stone-700">{Math.round(batteryLevel)}%</span>
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="sticky top-16 z-40 bg-stone-100/80 backdrop-blur-3xl border-b border-stone-200/80 p-6 text-center shadow">
        <h1 className="text-4xl font-serif font-thin tracking-[0.5em] text-stone-900 uppercase mb-2 leading-none">SSELFIE</h1>
        <p className="text-xs font-light tracking-[0.4em] uppercase text-stone-500 opacity-70">Brand Studio</p>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 px-6 py-8 pb-40 overflow-y-auto">
        {currentTab?.component || (
          <div className="text-center py-12">
            <p className="text-stone-500 text-sm">Tab content loading...</p>
          </div>
        )}
      </main>

      {/* Floating Tab Bar */}
      <div
        className="fixed bottom-6 left-4 right-4 z-50"
        style={{
          paddingBottom: 'env(safe-area-inset-bottom)',
          paddingLeft: 'env(safe-area-inset-left)',
          paddingRight: 'env(safe-area-inset-right)',
        }}
      >
        <div className="bg-stone-100/95 backdrop-blur-3xl rounded-2xl border border-stone-200/60 px-2 py-2 shadow-lg">
          <div className="flex justify-around items-center">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`flex flex-col items-center space-y-2 px-6 py-4 rounded-2xl transition-all duration-500 ease-out min-w-[70px] ${
                    isActive
                      ? 'bg-stone-200/70 transform scale-105'
                      : 'hover:bg-stone-200/40 hover:scale-102'
                  }`}
                  style={{ WebkitTapHighlightColor: 'transparent', touchAction: 'manipulation' }}
                  title={tab.description}
                  aria-label={`Switch to ${tab.label}`}
                >
                  <Icon
                    size={20}
                    strokeWidth={1}
                    className={`transition-all duration-300 ${isActive ? 'text-stone-900' : 'text-stone-500'}`}
                  />
                  <span className={`text-xs font-light tracking-[0.2em] uppercase transition-all duration-300 ${isActive ? 'text-stone-900' : 'text-stone-500'}`}>
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

export default SselfieAppLayout;
export { SselfieAppLayout };
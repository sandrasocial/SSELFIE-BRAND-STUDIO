import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { SSELFIEChat } from '../components/SSELFIEChat';
import { StudioScreen } from '../components/StudioScreen';
import { ProfileScreen } from '../components/ProfileScreen';
import { AccountScreen } from '../components/AccountScreen';
import { useAuth } from '../hooks/use-auth';
import { ThemeToggle } from '../components/ThemeToggle';
import { Camera, Grid, User, Settings, MessageCircle, Bell, Battery, Signal, Wifi } from 'lucide-react';

// SSELFIE BRAND STUDIO - MOBILE-FIRST TAB NAVIGATION
// User Journey: Authentication → Training → App Studio (Tabs) → Advanced Features
// 
// Tab Structure (Mobile-First Design):
// 1. Studio Tab - Main creation interface
// 2. Maya Tab - AI styling assistant  
// 3. Gallery Tab - Photo collection (routes to full page)
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
    isRoute: true,
    route: '/sselfie-gallery'
  },
  {
    id: 'profile',
    label: 'Profile',
    icon: User,
    description: 'Your aesthetic feed',
    component: <ProfileScreen user={user || {}} />
  },
  {
    id: 'more',
    label: 'More',
    icon: Settings,
    description: 'Advanced tools & settings',
    component: <AccountScreen user={user || {}} />
  }
];

// Main MobileTabLayout Component - Editorial Luxury Redesign
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
    const tab = tabs.find(t => t.id === tabId);
    if (tab?.isRoute && tab.route) {
      // Navigate to the full page route
      setLocation(tab.route);
    } else {
      // Switch to the tab component
      setActiveTab(tabId);
    }
  };

  return (
    <div className="luxury-app-container">
      {/* Luxury Status Bar */}
      <div className="luxury-status-bar">
        <div className="luxury-status-time">
          {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
        <div className="luxury-status-indicators">
          <div className="luxury-status-indicator">
            <div className="w-1 h-4 bg-white rounded-full" />
            <div className="w-1 h-4 bg-white/60 rounded-full" />
            <div className="w-1 h-4 bg-white/30 rounded-full" />
          </div>
          
          {isAuthenticated && user && (
            <div className="luxury-status-indicator">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
              <span className="text-xs tracking-wide font-light">ONLINE</span>
            </div>
          )}
          
          <div className="luxury-status-indicator">
            <ThemeToggle />
          </div>
          
          <div className="luxury-status-indicator">
            <Bell size={14} strokeWidth={1.2} />
            {hasNotifications && (
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
            )}
          </div>
          
          <div className="luxury-status-indicator">
            <Battery size={14} strokeWidth={1.2} />
            <span className="text-xs">{Math.round(batteryLevel)}%</span>
          </div>
        </div>
      </div>

      {/* Editorial Header */}
      <div className="luxury-header-container">
        <div className="luxury-brand-mark">
          <span className="luxury-heading-2 text-center">
            SSELFIE
          </span>
        </div>
        <div className="luxury-text-caption text-zinc-600 font-serif">
          BRAND STUDIO
        </div>
      </div>

      {/* Main Content Area - Uses luxury system classes */}
      <main className="luxury-content luxury-tab-content" role="main" aria-label="Main content">
        <div className="luxury-fade-in">
          {currentTab?.component || (
            <div className="text-center py-12">
              <p className="luxury-text-caption">Content will load in new page</p>
            </div>
          )}
        </div>
      </main>

      {/* Luxury Floating Tab Bar */}
      <div className="luxury-floating-tabs">
        <div className="luxury-tab-container">
          <div className="luxury-tab-grid">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`luxury-tab-button ${isActive ? 'active' : ''}`}
                  title={tab.description}
                  aria-label={`Switch to ${tab.label}`}
                  aria-current={isActive ? 'page' : undefined}
                  aria-pressed={isActive}
                  role="tab"
                  tabIndex={isActive ? 0 : -1}
                >
                  <div className="luxury-tab-icon">
                    <Icon 
                      size={20} 
                      strokeWidth={1.2} 
                      className="transition-all duration-500" 
                    />
                  </div>
                  <span className="luxury-tab-label">
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
import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/use-auth.js';
import { Camera, Grid, User, Settings, MessageCircle, Bell, Battery, Wifi, Signal } from 'lucide-react';

// Import the new app_v2 screen components
import StudioScreen from './StudioScreen.js';
import MayaScreen from './MayaScreen.js';
import GalleryScreen from './GalleryScreen.js';
import ProfileScreen from './ProfileScreen.js';
import SettingsScreen from './SettingsScreen.js';

// SSELFIE BRAND STUDIO - PREMIUM UX LAYOUT
// Enhanced with luxury design system while preserving backend logic

// Typography System
export const Typography = {
  heading: {
    fontFamily: 'var(--font-luxury, "Times New Roman", serif)',
    fontWeight: 300,
    letterSpacing: {
      tight: '-0.02em',
      wide: '0.2em',
      wider: '0.4em'
    }
  },
  body: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Helvetica Neue", Arial, sans-serif',
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem'
    }
  }
};

// Premium animations
export const animations = {
  tabTransition: 'transition-all duration-300 ease-in-out',
  fadeIn: 'animate-fadeIn duration-500',
  slideUp: 'animate-slideUp duration-300',
  pulse: 'animate-pulse duration-2000'
};

// Premium Indicators Component
const PremiumIndicators: React.FC = () => (
  <div className="flex items-center gap-3">
    <div className="flex items-center gap-1">
      <div className="w-1 h-3 bg-stone-800 rounded-full" />
      <div className="w-1 h-3 bg-stone-400 rounded-full" />
      <div className="w-1 h-3 bg-stone-300 rounded-full" />
    </div>
    <div className="flex items-center gap-1">
      <Wifi size={12} className="text-stone-600" />
      <Signal size={12} className="text-stone-600" />
    </div>
  </div>
);

// Status Bar Component
const StatusBar: React.FC<{ currentTime: Date }> = ({ currentTime }) => {
  const { user, isAuthenticated } = useAuth();
  
  return (
    <div className="flex justify-between items-center px-4 sm:px-8 py-4 sm:py-6 pb-3 sm:pb-4">
      <div className="text-stone-900 font-light tracking-wide text-sm sm:text-base">
        {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </div>
      <div className="flex items-center gap-3">
        <PremiumIndicators />
        {isAuthenticated && user && (
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
            <span className="text-xs tracking-[0.3em] uppercase font-light text-stone-600">Online</span>
          </div>
        )}
      </div>
    </div>
  );
};

// Tab Navigation Component
interface TabBarProps {
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

const TabNavigation: React.FC<TabBarProps> = ({ activeTab, onTabChange }) => {
  const { user } = useAuth();
  const tabs = createTabs(user || {});
  
  return (
    <div className="flex justify-around">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex-1 flex flex-col items-center justify-center p-3 sm:p-4 rounded-xl sm:rounded-2xl ${animations.tabTransition} min-h-[56px] sm:min-h-[64px] ${
              isActive 
                ? 'bg-stone-200/70 transform scale-105' 
                : 'text-stone-500 hover:text-stone-900 hover:bg-stone-200/40 hover:scale-102'
            }`}
            style={{ 
              WebkitTapHighlightColor: 'transparent',
              touchAction: 'manipulation'
            }}
            title={tab.description}
            aria-label={`Switch to ${tab.label}`}
          >
            <Icon
              size={20}
              strokeWidth={1}
              className={`transition-all duration-300 mb-1 ${isActive ? 'text-stone-900' : 'text-stone-500'}`}
            />
            <span className={`text-xs tracking-wide uppercase font-light transition-all duration-300 ${isActive ? 'text-stone-900' : 'text-stone-500'}`}>
              {tab.label}
            </span>
          </button>
        );
      })}
    </div>
  );
};

// Premium Tab Bar Component
const PremiumTabBar: React.FC<TabBarProps> = ({ activeTab, onTabChange }) => (
  <div className="absolute bottom-4 sm:bottom-4 left-2 sm:left-3 right-2 sm:right-3">
    <div className="bg-stone-100/95 backdrop-blur-3xl rounded-2xl sm:rounded-3xl border border-stone-200/60 px-1 sm:px-2 py-1 sm:py-2 shadow-lg">
      <TabNavigation activeTab={activeTab} onTabChange={onTabChange} />
    </div>
  </div>
);

// Main Content Component
interface MainContentProps {
  activeTab: string;
}

const MainContent: React.FC<MainContentProps> = ({ activeTab }) => {
  const { user } = useAuth();
  const tabs = createTabs(user || {});
  const currentTab = tabs.find(tab => tab.id === activeTab);

  return (
    <div className="flex-1 px-4 sm:px-8 py-6 sm:py-8 pb-40 sm:pb-32 overflow-y-auto">
      {currentTab?.component || (
        <div className="text-center py-12">
          <p className="text-stone-500 text-sm">Tab content loading...</p>
        </div>
      )}
    </div>
  );
};

// Preserve existing tab creation logic
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

// Premium App Layout Component
const AppLayout: React.FC = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  
  // Preserve existing auth and state management
  const { user, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState('studio');

  // Preserve existing timer logic
  useEffect(() => {
    const clockTimer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(clockTimer);
  }, []);

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
  };

  return (
    <div className="h-screen bg-stone-50 relative overflow-hidden">
      {/* Enhanced gradient backdrop */}
      <div className="absolute inset-0 bg-gradient-to-br from-stone-50 via-stone-100/50 to-stone-50"></div>
      
      {/* Main container with premium styling */}
      <div className="relative h-full mx-1 sm:mx-2 pt-1 pb-36 sm:pb-28">
        <div className="h-full bg-stone-100/60 backdrop-blur-3xl rounded-[1.5rem] sm:rounded-[2.5rem] border border-stone-200/80 overflow-hidden shadow-lg">
          {/* Premium status bar */}
          <StatusBar currentTime={currentTime} />
          
          {/* Content area with preserved routing */}
          <MainContent activeTab={activeTab} />
        </div>
      </div>

      {/* Premium floating tab bar */}
      <PremiumTabBar activeTab={activeTab} onTabChange={handleTabChange} />
    </div>
  );
};

// Main SselfieAppLayout Component - preserved for compatibility
function SselfieAppLayout() {
  return <AppLayout />;
}

export default SselfieAppLayout;
export { SselfieAppLayout, AppLayout };
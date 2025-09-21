import React, { useState } from 'react';
import { SSELFIEChat } from './SSELFIEChat';
import { GalleryScreen } from './GalleryScreen';
import { StudioScreen } from './StudioScreen';
import { ProfileScreen } from './ProfileScreen';
import { AccountScreen } from './AccountScreen';
import { useAuth } from '../hooks/use-auth';
import { Camera, Grid, User, Settings, MessageCircle } from 'lucide-react';

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
    id: 'sselfie',
    label: 'SSELFIE',
    icon: MessageCircle,
    description: 'AI Photo Stylist',
    component: <SSELFIEChat />
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
    component: <ProfileScreen user={user || {}} />
  },
  {
    id: 'account',
    label: 'Account',
    icon: Settings,
    description: 'Settings & preferences',
    component: <AccountScreen user={user || {}} />
  }
];

// Main MobileTabLayout Component - Editorial Luxury Redesign
function MobileTabLayout() {
  const [activeTab, setActiveTab] = useState('studio');
  const { user } = useAuth();
  
  const tabs = createTabs(user || {});
  const currentTab = tabs.find(tab => tab.id === activeTab);

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
  };

  return (
    <div className="flex flex-col h-full bg-transparent">
      {/* Editorial Header */}
      <div className="luxury-header-container">
        <div className="luxury-brand-mark">
          <span className="luxury-heading-2 text-center">
            SSELFIE
          </span>
        </div>
        <div className="luxury-text-caption text-zinc-600 font-serif">
          SSELFIE
        </div>
      </div>

      {/* Main Content Area */}
      <main 
        className="flex-1 pb-24 overflow-y-auto overscroll-behavior-y-contain"
        style={{
          paddingLeft: 'env(safe-area-inset-left)',
          paddingRight: 'env(safe-area-inset-right)'
        }}
        role="main" 
        aria-label="Main content"
      >
        <div className="px-6 py-8 min-h-full">
          <div className="luxury-fade-in">
            {currentTab?.component}
          </div>
        </div>
      </main>

      {/* Luxury Floating Tab Bar */}
      <nav 
        role="navigation" 
        aria-label="Mobile navigation"
        className="fixed bottom-4 left-4 right-4 z-50"
        style={{
          paddingBottom: 'env(safe-area-inset-bottom)',
          paddingLeft: 'env(safe-area-inset-left)',
          paddingRight: 'env(safe-area-inset-right)'
        }}
      >
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
                  style={{ 
                    WebkitTapHighlightColor: 'transparent',
                    touchAction: 'manipulation'
                  }}
                  title={tab.description}
                  aria-label={`Switch to ${tab.label}`}
                  aria-current={isActive ? 'page' : undefined}
                  aria-pressed={isActive}
                  role="tab"
                  tabIndex={isActive ? 0 : -1}
                >
                  <div className={`luxury-tab-icon ${
                    isActive 
                      ? 'transform scale-105' 
                      : ''
                  }`}>
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
      </nav>
    </div>
  );
}

export default MobileTabLayout;
export { MobileTabLayout };
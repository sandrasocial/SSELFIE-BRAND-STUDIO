import React, { useState } from 'react';
import { StudioPage } from '../pages/StudioPage';
import SSELFIEGallery from '../pages/sselfie-gallery';
import { AppTopNav } from './AppTopNav';
import { Palette, Camera, User } from 'lucide-react';

// Editorial Tab Configuration
const tabs = [
  {
    id: 'studio',
    label: 'Studio',
    icon: Palette,
    component: StudioPage,
  },
  {
    id: 'gallery', 
    label: 'Gallery',
    icon: Camera,
    component: () => <SSELFIEGallery hideMemberNav />,
  },
  {
    id: 'account',
    label: 'Account', 
    icon: User,
    component: () => (
      <div className="p-editorial-md">
        <h2 className="editorial-heading-1 editorial-text-header mb-6">Account</h2>
        <p className="editorial-text-body">Account management coming soon...</p>
      </div>
    ),
  },
];

function MobileTabLayout() {
  const [activeTab, setActiveTab] = useState('studio');

  const renderActiveTab = () => {
    const activeTabConfig = tabs.find(tab => tab.id === activeTab);
    if (!activeTabConfig) return <StudioPage />;
    
    const Component = activeTabConfig.component;
    return <Component />;
  };

  return (
    <div className="min-h-screen flex flex-col overflow-x-hidden touch-manipulation">
      {/* Editorial Top Navigation */}
      <AppTopNav />
      
      {/* Main Content Area with Editorial Spacing */}
      <main 
        className="flex-1 pb-20 min-h-[calc(100vh-80px)]" 
        style={{
          paddingTop: 'calc(env(safe-area-inset-top) + 64px)',
          paddingLeft: 'env(safe-area-inset-left)',
          paddingRight: 'env(safe-area-inset-right)',
        }}
        role="main" 
        aria-label="Main content"
      >
        <div className="editorial-fade-in">
          {renderActiveTab()}
        </div>
      </main>
      {/* Editorial Floating Navigation */}
      <nav 
        role="navigation" 
        aria-label="Mobile navigation"
        className="editorial-floating bg-neutral-900/90 backdrop-blur-editorial border border-neutral-800/40 shadow-editorial-lg flex items-center justify-center z-50 h-20"
        style={{
          paddingBottom: 'env(safe-area-inset-bottom)',
          paddingLeft: 'env(safe-area-inset-left)',
          paddingRight: 'env(safe-area-inset-right)'
        }}
      >
        <div className="flex items-center justify-evenly w-full max-w-md mx-auto px-4">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                aria-label={`${tab.label} tab`}
                aria-pressed={isActive}
                role="tab"
                tabIndex={isActive ? 0 : -1}
                className={`
                  editorial-touch-target flex flex-col items-center justify-center
                  p-3 rounded-editorial-md transition-all duration-300 ease-sophisticated
                  min-h-[48px] min-w-[48px]
                  ${
                    isActive 
                      ? 'bg-neutral-800/60 text-neutral-200' 
                      : 'text-neutral-500 hover:bg-neutral-800/30 hover:text-neutral-400'
                  }
                `}
              >
                <Icon 
                  size={20} 
                  strokeWidth={1.5}
                  className="mb-1"
                />
                <span className="editorial-caption text-[10px] tracking-ultra-wide">
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

export { MobileTabLayout };
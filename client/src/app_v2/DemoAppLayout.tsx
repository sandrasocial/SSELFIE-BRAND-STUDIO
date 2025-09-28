import React, { useState, useEffect } from 'react';
import { Camera, Grid, User, Settings, MessageCircle, Wifi, Signal } from 'lucide-react';

// Demo screens for layout testing
const DemoStudioScreen = () => (
  <div className="p-6">
    <h2 className="text-2xl font-light text-stone-900 mb-4">Studio</h2>
    <p className="text-stone-600 mb-6">Create stunning AI-generated photos with SSELFIE.</p>
    <div className="grid grid-cols-2 gap-4">
      <div className="bg-stone-200/50 rounded-lg p-4 h-32 flex items-center justify-center">
        <span className="text-stone-500 text-sm">Portrait Mode</span>
      </div>
      <div className="bg-stone-200/50 rounded-lg p-4 h-32 flex items-center justify-center">
        <span className="text-stone-500 text-sm">Lifestyle Mode</span>
      </div>
    </div>
  </div>
);

const DemoMayaScreen = () => (
  <div className="p-6">
    <h2 className="text-2xl font-light text-stone-900 mb-4">Maya AI</h2>
    <p className="text-stone-600 mb-6">Your personal AI styling assistant.</p>
    <div className="bg-stone-200/30 rounded-lg p-4 mb-4">
      <p className="text-stone-700 text-sm mb-2"><strong>Maya:</strong> Hello! I'm here to help you create stunning photos. What style are you going for today?</p>
    </div>
    <div className="bg-stone-100 rounded-lg p-3">
      <input type="text" placeholder="Ask Maya anything..." className="w-full bg-transparent text-stone-700 text-sm focus:outline-none" />
    </div>
  </div>
);

const DemoGalleryScreen = () => (
  <div className="p-6">
    <h2 className="text-2xl font-light text-stone-900 mb-4">Gallery</h2>
    <p className="text-stone-600 mb-6">Your beautiful photo collection.</p>
    <div className="grid grid-cols-2 gap-3">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="bg-stone-200/50 rounded-lg aspect-square flex items-center justify-center">
          <span className="text-stone-400 text-xs">Photo {i}</span>
        </div>
      ))}
    </div>
  </div>
);

const DemoProfileScreen = () => (
  <div className="p-6">
    <h2 className="text-2xl font-light text-stone-900 mb-4">Profile</h2>
    <p className="text-stone-600 mb-6">Your personal brand story.</p>
    <div className="text-center mb-6">
      <div className="w-20 h-20 bg-stone-200/50 rounded-full mx-auto mb-4"></div>
      <h3 className="text-lg font-light text-stone-900">Demo User</h3>
      <p className="text-sm text-stone-500">Premium Member</p>
    </div>
  </div>
);

const DemoSettingsScreen = () => (
  <div className="p-6">
    <h2 className="text-2xl font-light text-stone-900 mb-4">Settings</h2>
    <p className="text-stone-600 mb-6">Customize your SSELFIE experience.</p>
    <div className="space-y-4">
      <div className="flex justify-between items-center p-3 bg-stone-100/50 rounded-lg">
        <span className="text-stone-700 text-sm">Notifications</span>
        <div className="w-12 h-6 bg-stone-300 rounded-full"></div>
      </div>
      <div className="flex justify-between items-center p-3 bg-stone-100/50 rounded-lg">
        <span className="text-stone-700 text-sm">High Quality Mode</span>
        <div className="w-12 h-6 bg-emerald-400 rounded-full"></div>
      </div>
    </div>
  </div>
);

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
const StatusBar: React.FC<{ currentTime: Date }> = ({ currentTime }) => (
  <div className="flex justify-between items-center px-4 sm:px-8 py-4 sm:py-6 pb-3 sm:pb-4">
    <div className="text-stone-900 font-light tracking-wide text-sm sm:text-base">
      {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
    </div>
    <div className="flex items-center gap-3">
      <PremiumIndicators />
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
        <span className="text-xs tracking-[0.3em] uppercase font-light text-stone-600">Online</span>
      </div>
    </div>
  </div>
);

// Tab Navigation Component
interface TabBarProps {
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

const TabNavigation: React.FC<TabBarProps> = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'studio', label: 'Studio', icon: Camera, component: <DemoStudioScreen /> },
    { id: 'maya', label: 'Maya', icon: MessageCircle, component: <DemoMayaScreen /> },
    { id: 'gallery', label: 'Gallery', icon: Grid, component: <DemoGalleryScreen /> },
    { id: 'profile', label: 'Profile', icon: User, component: <DemoProfileScreen /> },
    { id: 'more', label: 'More', icon: Settings, component: <DemoSettingsScreen /> }
  ];
  
  return (
    <div className="flex justify-around">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex-1 flex flex-col items-center justify-center p-3 sm:p-4 rounded-xl sm:rounded-2xl transition-all duration-300 ease-in-out min-h-[56px] sm:min-h-[64px] ${
              isActive 
                ? 'bg-stone-200/70 transform scale-105' 
                : 'text-stone-500 hover:text-stone-900 hover:bg-stone-200/40 hover:scale-102'
            }`}
            style={{ 
              WebkitTapHighlightColor: 'transparent',
              touchAction: 'manipulation'
            }}
            title={tab.label}
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
  const tabs = [
    { id: 'studio', component: <DemoStudioScreen /> },
    { id: 'maya', component: <DemoMayaScreen /> },
    { id: 'gallery', component: <DemoGalleryScreen /> },
    { id: 'profile', component: <DemoProfileScreen /> },
    { id: 'more', component: <DemoSettingsScreen /> }
  ];
  
  const currentTab = tabs.find(tab => tab.id === activeTab);

  return (
    <div className="flex-1 pb-40 sm:pb-32 overflow-y-auto">
      {currentTab?.component || (
        <div className="text-center py-12">
          <p className="text-stone-500 text-sm">Tab content loading...</p>
        </div>
      )}
    </div>
  );
};

// Demo App Layout Component - Shows full premium UX without auth
const DemoAppLayout: React.FC = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeTab, setActiveTab] = useState('studio');

  // Timer for status bar
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
          
          {/* Content area */}
          <MainContent activeTab={activeTab} />
        </div>
      </div>

      {/* Premium floating tab bar */}
      <PremiumTabBar activeTab={activeTab} onTabChange={handleTabChange} />
    </div>
  );
};

export default DemoAppLayout;
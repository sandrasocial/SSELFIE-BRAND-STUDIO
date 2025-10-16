import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/use-auth.js';
import { useLocation } from 'wouter';
import { Camera, Grid, User, Settings, MessageCircle } from 'lucide-react';

// Import screen components
import StudioScreen from './StudioScreen.js';
import MayaScreen from './MayaScreen.js';
import GalleryScreen from './GalleryScreen.js';
import ProfileScreen from './ProfileScreen.js';
import SettingsScreen from './SettingsScreen.js';

// Loading Screen Component
const LoadingScreen: React.FC = () => (
  <div className="h-screen bg-stone-50 flex items-center justify-center relative overflow-hidden">
    <div className="absolute inset-0 bg-gradient-to-br from-stone-50 via-stone-100 to-stone-50"></div>
    <div className="relative z-10 text-center px-8">
      <div className="w-16 h-16 border border-stone-300 rounded-full animate-spin mx-auto mb-12 flex items-center justify-center">
        <div className="w-2 h-2 bg-stone-600 rounded-full"></div>
      </div>
      <h1 className="text-stone-950 text-4xl font-serif font-extralight tracking-[0.4em] mb-4 leading-none">SSELFIE</h1>
      <p className="text-xs font-light tracking-[0.3em] uppercase text-stone-500">Creating Excellence</p>
    </div>
  </div>
);

// Premium Indicators Component
const PremiumIndicators: React.FC = () => (
  <div className="flex items-center gap-2">
    <div className="flex gap-1">
      <div className="w-6 h-2 sm:w-7 sm:h-2.5 bg-stone-900 rounded-full"></div>
      <div className="w-6 h-2 sm:w-7 sm:h-2.5 bg-stone-400 rounded-full"></div>
      <div className="w-6 h-2 sm:w-7 sm:h-2.5 bg-stone-300 rounded-full"></div>
    </div>
  </div>
);

// Status Bar Component
// @ts-ignore - FC type compatibility with JSX.Element
const StatusBar: React.FC<{ currentTime: Date }> = ({ currentTime }) => {
  return (
    <div className="flex justify-between items-center px-6 sm:px-8 py-5 sm:py-6">
      <div className="text-stone-900 font-light tracking-wide text-sm sm:text-base">
        {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </div>
      <div className="flex items-center space-x-1.5">
        <PremiumIndicators />
      </div>
    </div>
  );
};

// Tab Navigation Component
interface TabBarProps {
  activeTab: string;
  onTabChange?: (tabId: string) => void;
}

// @ts-ignore - FC type compatibility with JSX.Element
const TabBar: React.FC<TabBarProps> = ({ activeTab, onTabChange }) => {
  const [, setLocation] = useLocation();
  
  const tabs = [
    { id: 'studio', label: 'Studio', icon: Camera, path: '/app/studio' },
    { id: 'maya', label: 'Maya', icon: MessageCircle, path: '/app/maya' },
    { id: 'gallery', label: 'Gallery', icon: Grid, path: '/app/gallery' },
    { id: 'profile', label: 'Profile', icon: User, path: '/app/profile' },
    { id: 'more', label: 'More', icon: Settings, path: '/app/more' }
  ];

  const handleTabClick = (tab: typeof tabs[0]) => {
    // Use URL routing for navigation
    setLocation(tab.path);
    // Fallback to callback for backward compatibility
    if (onTabChange) {
      onTabChange(tab.id);
    }
  };
  
  return (
    <div className="absolute bottom-4 sm:bottom-5 left-3 sm:left-4 right-3 sm:right-4">
      <div className="bg-stone-100/90 backdrop-blur-xl rounded-2xl sm:rounded-3xl border border-stone-200/50 px-2 sm:px-3 py-2 sm:py-3 shadow-sm">
        <div className="flex justify-around items-center">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab)}
                className={`flex flex-col items-center space-y-1.5 sm:space-y-2 px-4 sm:px-6 py-3 sm:py-4 rounded-xl sm:rounded-2xl transition-all duration-300 ease-out min-w-[65px] sm:min-w-[75px] ${
                  isActive 
                    ? 'bg-stone-200/60 transform scale-[1.02]' 
                    : 'hover:bg-stone-200/30 hover:scale-[1.01]'
                }`}
              >
                <Icon 
                  size={18} 
                  strokeWidth={1.5}
                  className={`sm:w-5 sm:h-5 transition-all duration-300 ${
                    isActive ? 'text-stone-950' : 'text-stone-500'
                  }`}
                />
                <span className={`text-[10px] sm:text-xs font-light tracking-[0.15em] uppercase transition-all duration-300 ${
                  isActive ? 'text-stone-950' : 'text-stone-500'
                }`}>
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// Main Content Component
interface MainContentProps {
  activeTab: string;
  onTabChange: (tabId: string) => void;
  initialPrompt: string | null;
  onPromptUsed: () => void;
}

// @ts-ignore - FC type compatibility with JSX.Element
const MainContent: React.FC<MainContentProps> = ({ activeTab, onTabChange, initialPrompt, onPromptUsed }) => {
  const renderContent = () => {
    switch (activeTab) {
      case 'studio':
        return <StudioScreen onTabChange={onTabChange} />;
      case 'maya':
        return <MayaScreen initialPrompt={initialPrompt} onPromptUsed={onPromptUsed} />;
      case 'gallery':
        return <GalleryScreen />;
      case 'profile':
        return <ProfileScreen />;
      case 'more':
        return <SettingsScreen />;
      default:
        return <StudioScreen onTabChange={onTabChange} />;
    }
  };

  return (
    <div className="flex-1 px-6 sm:px-8 pb-6 sm:pb-8 pt-0 h-full overflow-y-auto">
      {renderContent()}
    </div>
  );
};

// Main App Layout Component
// @ts-ignore - FC type compatibility with JSX.Element
const SselfieAppLayout: React.FC = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeTab, setActiveTab] = useState('studio');
  const [isLoading, setIsLoading] = useState(true);
  const [initialPrompt, setInitialPrompt] = useState<string | null>(null);
  const { user, isLoading: authLoading } = useAuth();
  const [location] = useLocation();

  useEffect(() => {
    const clockTimer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(clockTimer);
  }, []);

  // Determine active tab from URL path
  useEffect(() => {
    const path = location;
    if (path.includes('/maya') || path.includes('/app/maya')) {
      setActiveTab('maya');
    } else if (path.includes('/app/gallery')) {
      setActiveTab('gallery');
    } else if (path.includes('/app/profile')) {
      setActiveTab('profile');
    } else if (path.includes('/app/more')) {
      setActiveTab('more');
    } else {
      setActiveTab('studio'); // Default to studio for /app and /app/studio
    }

    // Handle URL parameters for initial prompts
    const urlParams = new URL(window.location.href).searchParams;
    const promptParam = urlParams.get('prompt');
    
    if (promptParam) {
      setInitialPrompt(decodeURIComponent(promptParam));
      // Clear the URL parameters after capturing them
      const newUrl = window.location.pathname;
      window.history.replaceState({}, '', newUrl);
    }
  }, [location]);

  // Show loading screen while auth is loading or for minimum 1.5 seconds for smooth experience
  useEffect(() => {
    const minLoadTime = setTimeout(() => {
      if (!authLoading) {
        setIsLoading(false);
      }
    }, 1500);

    return () => clearTimeout(minLoadTime);
  }, [authLoading]);

  // Also hide loading when auth completes
  useEffect(() => {
    if (!authLoading && user) {
      setIsLoading(false);
    }
  }, [authLoading, user]);

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <div className="h-screen bg-stone-50 relative overflow-hidden" style={{ 
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
    }}>
      <div className="absolute inset-0 bg-gradient-to-br from-stone-50 via-stone-100/30 to-stone-50"></div>
      
      <div className="relative h-full mx-2 sm:mx-3 pt-2 pb-32 sm:pb-28">
        <div className="h-full bg-stone-100/40 backdrop-blur-xl rounded-3xl sm:rounded-[2rem] border border-stone-200/60 overflow-hidden shadow-sm">
          
          <StatusBar currentTime={currentTime} />

          <MainContent 
            activeTab={activeTab} 
            onTabChange={handleTabChange} 
            initialPrompt={initialPrompt}
            onPromptUsed={() => setInitialPrompt(null)}
          />
        </div>
      </div>

      <TabBar activeTab={activeTab} onTabChange={handleTabChange} />
    </div>
  );
};

export default SselfieAppLayout;
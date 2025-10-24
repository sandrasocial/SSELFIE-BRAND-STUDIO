import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/use-auth.js';
import { useLocation } from 'wouter';
import { Camera, Grid, User, Star, MessageCircle, Image } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '../../lib/api.js';

// Import screen components
import StudioScreen from '../brand-studio/components/StudioScreen.js';
import MayaScreen from '../maya-chat/components/MayaScreen.js';
import ProfileScreen from '../profile/components/ProfileScreen.js';
import LoadingScreen from '../../components/LoadingScreen.js';

// Lazy-loaded screens
const GalleryScreen = React.lazy(() => import('../gallery/components/EnhancedGalleryScreen.js'));
const AcademyScreen = React.lazy(() => import('../academy/components/AcademyScreen.js'));
const TrainingScreen = React.lazy(() => import('../training/components/TrainingScreen.js'));

// Status Bar Component with enhanced design  
// @ts-ignore - FC type compatibility with JSX.Element
const StatusBar: React.FC<{ currentTime: Date; hasTrainedModel: boolean; trainingStatus: string }> = ({ currentTime, hasTrainedModel, trainingStatus }) => {
  return (
    <div className="flex justify-between items-center px-4 sm:px-6 md:px-8 py-4 sm:py-5 md:py-6 bg-gradient-to-b from-white/40 to-transparent backdrop-blur-xl border-b border-white/20">
      <div className="flex items-center gap-2 sm:gap-3">
        <div className="flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 bg-black/80 backdrop-blur-xl rounded-full">
          <div className="text-white font-medium tracking-wide text-xs sm:text-sm">
            {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
      </div>
      <div className="flex items-center space-x-2 sm:space-x-3">
        <div
          className="px-3 sm:px-4 py-1.5 sm:py-2 text-[10px] sm:text-xs tracking-wide font-medium bg-white/60 backdrop-blur-xl rounded-full border border-white/40 shadow-lg shadow-stone-900/10"
          title={`Training Status: ${trainingStatus}`}
        >
          {hasTrainedModel ? 'Model Ready' : trainingStatus === 'training' ? 'Training...' : 'New User'}
        </div>
        <div className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 sm:py-2 bg-white/60 backdrop-blur-xl rounded-full border border-white/40">
          <div className="flex space-x-0.5 sm:space-x-1">
            <div className="w-0.5 sm:w-1 h-2 sm:h-3 bg-stone-900 rounded-full"></div>
            <div className="w-0.5 sm:w-1 h-2 sm:h-3 bg-stone-900 rounded-full"></div>
            <div className="w-0.5 sm:w-1 h-2 sm:h-3 bg-stone-900 rounded-full"></div>
            <div className="w-0.5 sm:w-1 h-2 sm:h-3 bg-stone-400 rounded-full"></div>
          </div>
          <div className="w-4 sm:w-5 h-4 sm:h-5 bg-stone-900 rounded-full flex items-center justify-center text-white text-[8px] sm:text-[10px] font-bold">
            95
          </div>
        </div>
      </div>
    </div>
  );
};

// Tab Navigation Component with enhanced design
interface TabBarProps {
  activeTab: string;
  onTabChange?: (tabId: string) => void;
}

// @ts-ignore - FC type compatibility with JSX.Element
const TabBar: React.FC<TabBarProps> = ({ activeTab, onTabChange }) => {
  const [, setLocation] = useLocation();

  const tabs = [
    { id: 'studio', label: 'Studio', icon: Camera, path: '/app/studio' },
    { id: 'training', label: 'Training', icon: Star, path: '/app/training' },
    { id: 'maya', label: 'Maya', icon: MessageCircle, path: '/app/maya' },
    { id: 'gallery', label: 'Gallery', icon: Image, path: '/app/gallery' },
    { id: 'academy', label: 'Academy', icon: Grid, path: '/app/academy' },
    { id: 'profile', label: 'Profile', icon: User, path: '/app/profile' }
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
    <div className="absolute bottom-3 sm:bottom-4 md:bottom-5 left-2 sm:left-3 md:left-4 right-2 sm:right-3 md:right-4 z-50">
      <div className="bg-white/20 backdrop-blur-3xl rounded-[1.75rem] sm:rounded-[2rem] md:rounded-[2.5rem] border border-white/40 px-1.5 sm:px-2 md:px-3 py-2.5 sm:py-3 md:py-4 shadow-2xl shadow-stone-900/20">
        <div className="flex justify-around items-center">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab)}
                className={`flex flex-col items-center space-y-1 px-1.5 sm:px-2.5 md:px-4 py-2 sm:py-2.5 md:py-3 rounded-[1rem] sm:rounded-[1.25rem] md:rounded-[1.5rem] transition-all duration-500 ease-out min-w-[52px] sm:min-w-[58px] md:min-w-[68px] relative ${
                  isActive
                    ? 'transform scale-105'
                    : 'hover:scale-[1.02] active:scale-95'
                }`}
              >
                {isActive && (
                  <div className="absolute inset-0 bg-gradient-to-b from-white/90 to-white/70 backdrop-blur-2xl rounded-[1rem] sm:rounded-[1.25rem] md:rounded-[1.5rem] shadow-xl shadow-stone-900/20 border border-white/60"></div>
                )}
                <div className={`relative z-10 w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 rounded-[0.875rem] sm:rounded-[1rem] md:rounded-[1.125rem] flex items-center justify-center transition-all duration-500 ${
                  isActive
                    ? 'bg-stone-950 shadow-lg shadow-stone-900/30'
                    : 'bg-white/40 backdrop-blur-xl'
                }`}>
                  <Icon
                    size={isActive ? 19 : 17}
                    strokeWidth={2}
                    className={`transition-all duration-500 ${
                      isActive ? 'text-white' : 'text-stone-600'
                    }`}
                  />
                </div>
                <span className={`relative z-10 text-[8px] sm:text-[9px] md:text-[10px] font-semibold tracking-wide transition-all duration-500 ${
                  isActive ? 'text-stone-900' : 'text-stone-500 opacity-70'
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
  hasTrainedModel: boolean;
}

// @ts-ignore - FC type compatibility with JSX.Element
const MainContent: React.FC<MainContentProps> = ({ activeTab, onTabChange, initialPrompt, onPromptUsed, hasTrainedModel }) => {
  const renderContent = () => {
    switch (activeTab) {
      case 'studio':
        return <StudioScreen onTabChange={onTabChange} hasTrainedModel={hasTrainedModel} />;
      case 'training':
        return (
          <React.Suspense fallback={<div className="text-center py-8">Loading...</div>}>
            <TrainingScreen setActiveTab={onTabChange} />
          </React.Suspense>
        );
      case 'maya':
        return <MayaScreen initialPrompt={initialPrompt} onPromptUsed={onPromptUsed} />;
      case 'gallery':
        return (
          <React.Suspense fallback={<div className="text-center py-8">Loading...</div>}>
            <GalleryScreen />
          </React.Suspense>
        );
      case 'academy':
        return (
          <React.Suspense fallback={<div className="text-center py-8">Loading...</div>}>
            <AcademyScreen />
          </React.Suspense>
        );
      case 'profile':
        return <ProfileScreen />;
      default:
        return <StudioScreen onTabChange={onTabChange} hasTrainedModel={hasTrainedModel} />;
    }
  };

  return (
    <div className="flex-1 px-4 sm:px-6 md:px-8 pb-4 sm:pb-6 md:pb-8 pt-0 h-full overflow-y-auto">
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
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [location] = useLocation();

  // Get real user model data
  const { data: userModel, isLoading: modelLoading } = useQuery({
    queryKey: ['/api/user-model'],
    enabled: !!user && isAuthenticated,
    retry: false,
    staleTime: 30 * 1000,
    queryFn: () => apiFetch('/user-model')
  });

  // Determine if user has a trained model based on real data
  const hasTrainedModel = userModel?.trainingStatus === 'completed';
  const trainingStatus = userModel?.trainingStatus || 'not_started';

  useEffect(() => {
    const clockTimer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(clockTimer);
  }, []);

  // Determine active tab from URL path
  useEffect(() => {
    const path = location;
    if (path.includes('/maya') || path.includes('/app/maya')) {
      setActiveTab('maya');
    } else if (path.includes('/app/training')) {
      setActiveTab('training');
    } else if (path.includes('/app/gallery')) {
      setActiveTab('gallery');
    } else if (path.includes('/app/academy')) {
      setActiveTab('academy');
    } else if (path.includes('/app/profile')) {
      setActiveTab('profile');
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
      if (!authLoading && !modelLoading) {
        setIsLoading(false);
      }
    }, 1500);

    return () => clearTimeout(minLoadTime);
  }, [authLoading, modelLoading]);

  // Also hide loading when auth completes and model data is available
  useEffect(() => {
    if (!authLoading && !modelLoading && user) {
      setIsLoading(false);
    }
  }, [authLoading, modelLoading, user]);

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <div className="h-screen bg-gradient-to-br from-stone-50 via-stone-100/50 to-stone-50 relative overflow-hidden" style={{
      fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
    }}>
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-stone-200/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-stone-300/20 rounded-full blur-3xl"></div>
      </div>

      <div className="relative h-full mx-1 sm:mx-2 md:mx-3 pt-1 sm:pt-2 pb-28 sm:pb-28">
        <div className="h-full bg-white/30 backdrop-blur-3xl rounded-[2rem] sm:rounded-[2.5rem] md:rounded-[3rem] border border-white/40 overflow-hidden shadow-2xl shadow-stone-900/10">

          <StatusBar currentTime={currentTime} hasTrainedModel={hasTrainedModel} trainingStatus={trainingStatus} />

          <MainContent
            activeTab={activeTab}
            onTabChange={handleTabChange}
            initialPrompt={initialPrompt}
            onPromptUsed={() => setInitialPrompt(null)}
            hasTrainedModel={hasTrainedModel}
          />
        </div>
      </div>

      <TabBar activeTab={activeTab} onTabChange={handleTabChange} />
    </div>
  );
};

export default SselfieAppLayout;
import React, { useState, useEffect } from 'react';
import { Camera, Star, MessageCircle, Image, Grid, User } from 'lucide-react';
import { useLocation } from 'wouter';
import { useAuth } from '../../hooks/use-auth.js';

// Shared UI
import LoadingScreen from '../../components/shared/LoadingScreen';
import HeaderBar from '../../components/shared/HeaderBar';

// Import Feature Screens
import StudioScreen from '../../features/brand-studio/components/StudioScreen';
import TrainingScreen from '../../features/training/components/TrainingScreen';
import MayaScreen from '../../features/maya-chat/components/MayaScreen';
import GalleryScreen from '../../features/gallery/components/TwoTabGalleryScreen.js';
import ProfileScreen from '../../features/profile/components/ProfileScreen';

import AcademyScreen from '../../features/academy/AcademyScreen';

const SselfieAppLayout = () => {
  const [location, setLocation] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState('studio');
  const [isLoading, setIsLoading] = useState(true);

  const [userType, setUserType] = useState<'member' | 'pro'>('member');

  // Track training completion acknowledgment
  const [hasTrainedModel, setHasTrainedModel] = useState(false);

  // Derive header user type from real user when available
  useEffect(() => {
    const derived: 'member' | 'pro' = (user?.plan === 'admin' || user?.monthlyGenerationLimit === -1) ? 'pro' : 'member';
    setUserType(derived);
  }, [user]);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1200);
    return () => clearTimeout(timer);
  }, []);

  const tabs = [
    { id: 'studio', label: 'Studio', icon: Camera },
    { id: 'training', label: 'Training', icon: Star },
    { id: 'maya', label: 'Maya', icon: MessageCircle },
    { id: 'gallery', label: 'Gallery', icon: Image },
    { id: 'academy', label: 'Academy', icon: Grid },
    { id: 'profile', label: 'Profile', icon: User },
  ];
  // Canonicalize /app to /app/studio once
  useEffect(() => {
    if (location === '/app' || location === '/app/') {
      setLocation('/app/studio', { replace: true });
    }
  }, [location]);


  useEffect(() => {
    // Sync active tab with URL (/app/:tab*)
    const path = location || '';
    if (!path.startsWith('/app')) return;
    const remainder = path.replace(/^\/app\/?/, '');
    const fromUrl = remainder.split('/')[0];
    if (fromUrl && fromUrl !== activeTab) setActiveTab(fromUrl);
    if (!fromUrl && activeTab !== 'studio') setActiveTab('studio');
  }, [location]);

  const handleTabChange = (id: string) => {
    if (id !== activeTab) setActiveTab(id);
    setLocation(`/app/${id}`);
  };

  // Compute displayed credits from real user values
  const used = user?.generationsUsedThisMonth ?? 0;
  const limit = user?.monthlyGenerationLimit ?? 100;
  const displayCredits: number | string = limit === -1 ? '∞' : Math.max(0, limit - used);

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <div className="h-screen bg-gradient-to-br from-stone-50 via-stone-100/50 to-stone-50 relative overflow-hidden">
      <div className="relative h-full mx-1 sm:mx-2 md:mx-3 pt-1 sm:pt-2 pb-28 sm:pb-28">
        <div className="h-full bg-white/30 backdrop-blur-3xl rounded-[2rem] sm:rounded-[2.5rem] md:rounded-[3rem] border border-white/40 overflow-hidden shadow-2xl shadow-stone-900/10">
          <HeaderBar
            credits={displayCredits}
            userType={userType}
            onToggleUserType={() => setUserType((prev) => (prev === 'member' ? 'pro' : 'member'))}
          />

          <div className="flex-1 px-6 sm:px-8 pb-6 sm:pb-8 pt-0 h-full overflow-y-auto">
            {activeTab === 'studio' && <StudioScreen hasTrainedModel={hasTrainedModel} onTabChange={handleTabChange} />}
            {activeTab === 'training' && <TrainingScreen user={user} setHasTrainedModel={setHasTrainedModel} setActiveTab={handleTabChange} />}
            {activeTab === 'maya' && <MayaScreen />}
            {activeTab === 'gallery' && <GalleryScreen />}
            {activeTab === 'academy' && <AcademyScreen />}
            {activeTab === 'profile' && <ProfileScreen />}
          </div>
        </div>
      </div>

      <div className="absolute bottom-4 sm:bottom-5 left-3 sm:left-4 right-3 sm:right-4">
        <div className="bg-white/20 backdrop-blur-3xl rounded-[2rem] sm:rounded-[2.5rem] border border-white/40 px-2 sm:px-3 py-3 sm:py-4 shadow-2xl shadow-stone-900/20">
          <div className="flex justify-around items-center">
            {tabs.map((tab) => {
              const Icon = tab.icon as any;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`flex flex-col items-center space-y-1.5 px-2.5 sm:px-4 py-2.5 sm:py-3 rounded-[1.25rem] sm:rounded-[1.5rem] transition-all duration-500 ease-out min-w-[58px] sm:min-w-[68px] relative ${isActive ? 'transform scale-105' : 'hover:scale-[1.02] active:scale-95'}`}
                >
                  {isActive && <div className="absolute inset-0 bg-gradient-to-b from-white/90 to-white/70 backdrop-blur-2xl rounded-[1.25rem] sm:rounded-[1.5rem] shadow-xl shadow-stone-900/20 border border-white/60"></div>}
                  <div className={`relative z-10 w-11 h-11 sm:w-12 sm:h-12 rounded-[1rem] sm:rounded-[1.125rem] flex items-center justify-center transition-all duration-500 ${isActive ? 'bg-stone-950 shadow-lg shadow-stone-900/30' : 'bg-white/40 backdrop-blur-xl'}`}>
                    <Icon size={isActive ? 20 : 18} strokeWidth={2} className={`transition-all duration-500 ${isActive ? 'text-white' : 'text-stone-600'}`} />
                  </div>
                  <span className={`relative z-10 text-[9px] sm:text-[10px] font-semibold tracking-wide transition-all duration-500 ${isActive ? 'text-stone-900' : 'text-stone-500 opacity-70'}`}>{tab.label}</span>
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


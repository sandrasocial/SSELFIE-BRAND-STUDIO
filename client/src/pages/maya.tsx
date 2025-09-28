import React, { useState, useEffect, lazy, Suspense } from 'react';
import { useAuth } from '../hooks/use-auth.js';
import { useLocation } from 'wouter';
import { useToast } from '../hooks/use-toast.js';
import { PageLoader } from '../components/PageLoader.js';

// Import types from unified definitions
import type { MayaChatMessage, ConceptCard } from '../types/maya.js';

const LazyMayaChat = lazy(() => import('../components/maya/MayaChat.js').then(module => ({ default: module.MayaChat })));
const LazyMemberNavigation = lazy(() => import('../components/member-navigation.js').then(module => ({ default: module.MemberNavigation })));

// Clean display formatter - strips emojis for professional appearance while preserving backend intelligence
const cleanDisplayTitle = (title: string): string => {
  return title.replace(/[✨💫🔥🌟💎🌅🏢💼🌊👑💃📸🎬♦️🚖]/g, '').trim();
};

export default function Maya() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [location, setLocation] = useLocation();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const { toast } = useToast();

  // Handle online/offline status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => {
      setIsOnline(false);
      toast({
        title: "Connection Lost",
        description: "Please check your internet connection. Maya requires an active connection.",
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [toast]);

  // Show loading state during authentication
  if (authLoading) {
    return <PageLoader />;
  }

  // User not authenticated - redirect to login
  if (!isAuthenticated || !user) {
    setLocation('/login');
    return null;
  }

  // Display connection warning if offline
  if (!isOnline) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white text-black">
        <div className="text-center px-4">
          <h3 className="text-lg font-medium mb-2">Connection Lost</h3>
          <p className="text-sm text-gray-500 mb-4">Please check your internet connection and try again.</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-black text-white rounded-lg text-sm hover:bg-gray-800 transition-colors"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Suspense fallback={<PageLoader />}>
        <LazyMemberNavigation />
        <main className="pt-24">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <Suspense fallback={<div className="h-[600px] flex items-center justify-center">
              <div className="text-center">
                <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-gray-500">Loading Maya's interface...</p>
              </div>
            </div>}>
              <LazyMayaChat />
            </Suspense>
          </div>
        </main>
      </Suspense>
    </div>
  );
}
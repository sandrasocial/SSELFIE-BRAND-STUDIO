import React, { useState, useEffect } from 'react';
import { MobileTabLayout } from '../components/MobileTabLayout';
import { useAuth } from '../hooks/use-auth';
import { Bell, Wifi, Battery, Signal } from 'lucide-react';

// Editorial Luxury AppLayout - Phone Container Design
export function AppLayout() {
  const [isLoading, setIsLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [batteryLevel, setBatteryLevel] = useState(85);
  const [hasNotifications, setHasNotifications] = useState(true);
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 2000);
    const clockTimer = setInterval(() => setCurrentTime(new Date()), 1000);
    
    // Simulate battery level changes
    const batteryTimer = setInterval(() => {
      setBatteryLevel(prev => Math.max(20, prev - Math.random() * 2));
    }, 30000);
    
    return () => {
      clearTimeout(timer);
      clearInterval(clockTimer);
      clearInterval(batteryTimer);
    };
  }, []);

  if (isLoading) {
    return (
      <div className="h-screen bg-black flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-black via-neutral-900 to-black"></div>
        <div className="relative z-10 text-center">
          <div className="w-20 h-20 border-2 border-neutral-300 border-t-transparent rounded-full animate-spin mx-auto mb-8"></div>
          <h2 className="text-neutral-200 text-3xl font-light tracking-widest mb-2">SSELFIE</h2>
          <p className="text-neutral-500 text-sm tracking-wide mb-4">LOADING EXPERIENCE</p>
          <div className="w-48 h-1 bg-neutral-800 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-neutral-300 to-neutral-500 rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-black relative overflow-hidden font-sans">
      {/* Subtle gradient backdrop */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-neutral-950 to-neutral-900"></div>
      
      {/* Main app container - Phone-like design */}
      <div className="relative h-full mx-3 pt-1 pb-28">
        <div className="h-full bg-neutral-950/80 backdrop-blur-2xl rounded-[2rem] shadow-2xl border border-neutral-800/30 overflow-hidden">
          
          {/* Enhanced Status Bar */}
          <div className="flex justify-between items-center px-8 py-6 pb-4">
            <div className="flex items-center gap-4">
              <div className="text-neutral-200 text-base font-light tracking-wide">
                {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
              {isAuthenticated && user && (
                <div className="flex items-center gap-2 px-3 py-1 bg-neutral-800/40 rounded-full border border-neutral-700/30">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-xs text-neutral-300 tracking-wide">ONLINE</span>
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-3">
              {/* Signal Strength */}
              <div className="flex items-center gap-1">
                <Signal size={14} className="text-neutral-400" strokeWidth={1.5} />
                <div className="flex space-x-1">
                  <div className="w-1 h-3 bg-neutral-400 rounded-full"></div>
                  <div className="w-1 h-3 bg-neutral-400 rounded-full"></div>
                  <div className="w-1 h-3 bg-neutral-400 rounded-full"></div>
                  <div className="w-1 h-3 bg-neutral-600 rounded-full"></div>
                </div>
              </div>
              
              {/* WiFi */}
              <Wifi size={14} className="text-neutral-400" strokeWidth={1.5} />
              
              {/* Notifications */}
              <div className="relative">
                <Bell size={14} className="text-neutral-400" strokeWidth={1.5} />
                {hasNotifications && (
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></div>
                )}
              </div>
              
              {/* Battery */}
              <div className="flex items-center gap-1">
                <Battery size={14} className="text-neutral-400" strokeWidth={1.5} />
                <span className="text-xs text-neutral-400 font-light">{Math.round(batteryLevel)}%</span>
              </div>
            </div>
          </div>

          {/* Content area with luxury spacing */}
          <div className="flex-1 px-8 pb-8">
            <MobileTabLayout />
          </div>
        </div>
      </div>

      {/* Floating minimal tab bar */}
      <div className="absolute bottom-6 left-4 right-4">
        <div className="bg-neutral-900/90 backdrop-blur-2xl rounded-2xl shadow-2xl border border-neutral-800/40 px-4 py-3">
          <div className="flex justify-around items-center">
            {/* Tab content will be handled by MobileTabLayout */}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AppLayout;

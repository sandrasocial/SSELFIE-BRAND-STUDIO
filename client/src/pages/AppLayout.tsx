import React, { useState, useEffect } from 'react';
import { MobileTabLayout } from '../components/MobileTabLayout';
import { useAuth } from '../hooks/use-auth';
import { ThemeToggle } from '../components/ThemeToggle';
import { Bell, Wifi, Battery, Signal } from 'lucide-react';

// Editorial Luxury AppLayout - Complete Redesign
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
        <div className="absolute inset-0 editorial-gradient-bg"></div>
        <div className="relative z-10 text-center">
          <div className="editorial-spinner w-20 h-20 mx-auto mb-8"></div>
          <h2 className="editorial-heading-1 text-neutral-200 tracking-widest mb-2">SSELFIE</h2>
          <p className="editorial-text-caption text-neutral-500 mb-4">LOADING EXPERIENCE</p>
          <div className="w-48 h-1 bg-neutral-800 rounded-full overflow-hidden">
            <div className="editorial-loading-bar"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-black relative overflow-hidden font-sans">
      {/* Editorial gradient backdrop */}
      <div className="absolute inset-0 editorial-gradient-bg"></div>
      
      {/* Editorial container - Phone-like design */}
      <div className="editorial-container">
        <div className="editorial-phone-container">
          
          {/* Editorial Status Bar */}
          <div className="editorial-status-bar">
            <div className="flex items-center gap-4">
              <div className="editorial-text-header text-neutral-200">
                {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
              {isAuthenticated && user && (
                <div className="flex items-center gap-2 px-3 py-1 editorial-badge">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-xs text-neutral-300 tracking-wide">ONLINE</span>
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-3">
              {/* Theme Toggle */}
              <ThemeToggle />
              
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

          {/* Editorial content area */}
          <div className="editorial-content">
            <MobileTabLayout />
          </div>
        </div>
      </div>
    </div>
  );
}

export default AppLayout;

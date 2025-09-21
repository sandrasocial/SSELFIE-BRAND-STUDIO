import React, { useState, useEffect } from 'react';
import MobileTabLayout from '../components/MobileTabLayout';
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
      <div className="h-screen bg-editorial-background flex items-center justify-center relative overflow-hidden">
        {/* Mobile-First Loading Screen */}
        <div className="absolute inset-0 editorial-gradient-bg"></div>
        <div className="relative z-10 text-center px-4">
          {/* Luxury Loading Animation */}
          <div className="w-16 h-16 mx-auto mb-6 relative">
            <div className="absolute inset-0 border-2 border-neutral-800 rounded-full"></div>
            <div className="absolute inset-0 border-t-2 border-neutral-300 rounded-full animate-editorial-spin"></div>
          </div>
          
          {/* Brand Identity */}
          <h1 className="editorial-heading-1 text-editorial-text-primary mb-2 tracking-widest">
            SSELFIE
          </h1>
          <p className="editorial-text-caption text-editorial-text-secondary uppercase tracking-wide mb-4">
            Brand Studio Loading
          </p>
          
          {/* Progress Bar */}
          <div className="w-48 h-1 bg-neutral-800 rounded-full overflow-hidden mx-auto">
            <div className="editorial-loading-bar"></div>
          </div>
        </div>
        
        {/* Mobile Status Bar Simulation */}
        <div className="fixed top-0 left-0 right-0 flex items-center justify-between px-4 py-2 bg-editorial-background/80 backdrop-blur-sm z-50">
          <div className="flex items-center gap-1">
            <span className="text-xs text-editorial-text-primary font-medium">
              {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Signal size={14} className="text-editorial-text-primary" />
            <Wifi size={14} className="text-editorial-text-primary" />
            <div className="flex items-center gap-1">
              <Battery size={14} className="text-editorial-text-primary" />
              <span className="text-xs text-editorial-text-primary">
                {Math.round(batteryLevel)}%
              </span>
            </div>
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

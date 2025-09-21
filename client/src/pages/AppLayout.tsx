import React, { useState, useEffect } from 'react';
import { MobileTabLayout } from '../components/MobileTabLayout';
import { useAuth } from '../hooks/use-auth';
import { ThemeToggle } from '../components/ThemeToggle';
import { Bell, Wifi, Battery, Signal } from 'lucide-react';
import '../styles/editorial-luxury.css';

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
    <div className="relative min-h-screen bg-editorial-black">
      {/* Enhanced Editorial gradient backdrop with luxury depth */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-editorial-black via-neutral-950 to-neutral-900"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/50 via-transparent to-transparent"></div>
      </div>
      
      {/* Luxury Editorial container with glass morphism and semantic spacing */}
      <div className="relative flex-1 p-3 pt-1 min-h-screen">
        <div className="min-h-screen editorial-glass rounded-4xl shadow-editorial-xl overflow-hidden">
          <div className="min-h-screen p-8 flex flex-col">
          
            {/* Enhanced Editorial Status Bar with Luxury Design */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800/20 bg-gradient-to-r from-transparent via-neutral-950/30 to-transparent mb-6">
              <div className="flex items-center gap-6">
                <div className="editorial-text-header text-neutral-200 text-lg font-light tracking-wide">
                  {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
                {isAuthenticated && user && (
                  <div className="flex items-center gap-3 px-4 py-2 bg-neutral-800/30 rounded-xl border border-neutral-700/20">
                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                    <span className="text-xs text-neutral-300 tracking-ultra-wide font-light">ONLINE</span>
                  </div>
                )}
              </div>
              
              <div className="flex items-center gap-4">
                {/* Theme Toggle */}
                <div className="p-2 rounded-lg bg-neutral-800/20 border border-neutral-700/20 hover:bg-neutral-800/30 transition-all duration-300">
                  <ThemeToggle />
                </div>
                
                {/* Signal Strength with Enhanced Design */}
                <div className="flex items-center gap-2 px-3 py-2 bg-neutral-800/20 rounded-lg">
                  <Signal size={14} className="text-neutral-400" strokeWidth={1.2} />
                  <div className="flex space-x-1">
                    <div className="w-1 h-4 bg-neutral-300 rounded-full"></div>
                    <div className="w-1 h-4 bg-neutral-300 rounded-full"></div>
                    <div className="w-1 h-4 bg-neutral-300 rounded-full"></div>
                    <div className="w-1 h-4 bg-neutral-600 rounded-full opacity-50"></div>
                  </div>
                </div>
                
                {/* WiFi with Premium Styling */}
                <div className="p-2 rounded-lg bg-neutral-800/20">
                  <Wifi size={14} className="text-neutral-400" strokeWidth={1.2} />
                </div>
                
                {/* Enhanced Notifications */}
                <div className="relative p-2 rounded-lg bg-neutral-800/20 hover:bg-neutral-800/30 transition-all duration-300">
                  <Bell size={14} className="text-neutral-400" strokeWidth={1.2} />
                  {hasNotifications && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-neutral-950 animate-pulse"></div>
                  )}
                </div>
                
                {/* Premium Battery Display */}
                <div className="flex items-center gap-2 px-3 py-2 bg-neutral-800/20 rounded-lg">
                  <Battery size={14} className="text-neutral-400" strokeWidth={1.2} />
                  <span className="text-xs text-neutral-400 font-light tracking-wide">{Math.round(batteryLevel)}%</span>
                </div>
              </div>
            </div>

            {/* Enhanced Editorial content area with perfect spacing */}
            <div className="flex-1 overflow-hidden">
              <MobileTabLayout />
            </div>
          </div>
        </div>
        
        {/* Minimal bottom gradient for visual depth */}
        <div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-t from-black/50 to-transparent pointer-events-none" />
      </div>
    </div>
  );
}

export default AppLayout;
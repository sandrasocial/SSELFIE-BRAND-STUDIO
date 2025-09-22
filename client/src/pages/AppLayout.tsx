import React, { useState, useEffect } from 'react';
import { MobileTabLayout } from '../components/MobileTabLayout';
import { useAuth } from '../hooks/use-auth';
import { ThemeToggle } from '../components/ThemeToggle';
import { Bell, Wifi, Battery, Signal } from 'lucide-react';
import '../styles/luxury-mobile.css';

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
      <div className="luxury-app-container">
        <div className="luxury-gradient-bg">
          <div className="luxury-content text-center">
            {/* Luxury Loading Animation */}
            <div className="w-16 h-16 mx-auto mb-6 relative">
              <div className="absolute inset-0 border-2 border-white/20 rounded-full"></div>
              <div className="absolute inset-0 border-t-2 border-white rounded-full animate-spin"></div>
            </div>
            
            {/* Brand Identity */}
            <h1 className="luxury-heading-1 text-center mb-4">SSELFIE</h1>
            <p className="luxury-text-caption text-center">BRAND STUDIO LOADING</p>
          </div>
        </div>
        
        {/* Mobile Status Bar Simulation */}
        <div className="luxury-status-bar fixed top-0 left-0 right-0 z-50">
          <div className="luxury-status-time">
            {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
          <div className="luxury-status-indicators">
            <Signal size={14} />
            <Wifi size={14} />
            <div className="flex items-center gap-1">
              <Battery size={14} />
              <span className="text-xs">{Math.round(batteryLevel)}%</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="luxury-app-container">
      {/* Sophisticated gradient backdrop */}
      <div className="luxury-gradient-bg" />
      
      {/* Render MobileTabLayout directly without wrapper to avoid double layout */}
      <MobileTabLayout />
    </div>
  );
}

export default AppLayout;
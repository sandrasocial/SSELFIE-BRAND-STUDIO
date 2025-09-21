import React, { useState, useEffect } from 'react';
import { Camera, Grid, User, MessageCircle, Star, Bell, Wifi, Battery, Signal } from 'lucide-react';
import { useAuth } from '../hooks/use-auth';
import { LuxuryStudioScreen } from './luxury/LuxuryStudioScreen';
import { LuxuryMayaScreen } from './luxury/LuxuryMayaScreen';
import { LuxuryGalleryScreen } from './luxury/LuxuryGalleryScreen';
import { LuxuryProfileScreen } from './luxury/LuxuryProfileScreen';
import '../styles/luxury-mobile.css';

// Tab Configuration
const LUXURY_TABS = [
  { id: 'studio', label: 'Studio', icon: Camera },
  { id: 'maya', label: 'Maya', icon: MessageCircle },
  { id: 'gallery', label: 'Gallery', icon: Grid },
  { id: 'profile', label: 'Profile', icon: User },
];

export function LuxuryMobileApp() {
  const [activeTab, setActiveTab] = useState('studio');
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
          <div className="luxury-loading-container">
            {/* Luxury Loading Animation */}
            <div className="w-16 h-16 mx-auto mb-6 relative">
              <div className="absolute inset-0 border-2 border-white/20 rounded-full"></div>
              <div className="absolute inset-0 border-t-2 border-white rounded-full animate-spin"></div>
            </div>
            
            {/* Brand Identity */}
            <h1 className="luxury-heading-2 text-center mb-4">SSELFIE</h1>
            <p className="luxury-text-caption text-center">LOADING EXPERIENCE</p>
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
      
      {/* Main app container with enhanced glass morphism */}
      <div className="luxury-mobile-wrapper">
        <div className="luxury-glass-container h-full overflow-hidden">
          
          {/* Editorial status bar */}
          <div className="luxury-status-bar">
            <div className="luxury-status-time">
              {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
            <div className="luxury-status-indicators">
              <div className="luxury-status-indicator">
                <div className="w-1 h-4 bg-white rounded-full" />
                <div className="w-1 h-4 bg-white/60 rounded-full" />
                <div className="w-1 h-4 bg-white/30 rounded-full" />
              </div>
            </div>
          </div>

          {/* Content area with editorial spacing */}
          <div className="luxury-content luxury-fade-in">
            {activeTab === 'studio' && <LuxuryStudioScreen user={user} />}
            {activeTab === 'maya' && <LuxuryMayaScreen />}
            {activeTab === 'gallery' && <LuxuryGalleryScreen />}
            {activeTab === 'profile' && <LuxuryProfileScreen user={user} />}
          </div>
        </div>
      </div>

      {/* Floating editorial tab bar */}
      <div className="luxury-floating-tabs">
        <div className="luxury-tab-container">
          <div className="luxury-tab-grid">
            {LUXURY_TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`luxury-tab-button ${isActive ? 'active' : ''}`}
                  aria-label={`Switch to ${tab.label}`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <Icon size={22} strokeWidth={1.2} className="luxury-tab-icon" />
                  <span className="luxury-tab-label">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default LuxuryMobileApp;
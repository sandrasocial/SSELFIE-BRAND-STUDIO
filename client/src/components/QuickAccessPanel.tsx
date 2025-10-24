import React from 'react';
import { Camera, MessageCircle, Grid, User } from './icons/index.js';

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  imageUrl?: string;
  tabId: string;
}

interface QuickAccessPanelProps {
  onTabChange?: (tabId: string) => void;
}

export default function QuickAccessPanel({ onTabChange }: QuickAccessPanelProps) {
  const quickActions: QuickAction[] = [
    {
      id: 'new-shoot',
      title: '1. Create Photos',
      description: 'Generate new images',
      icon: Camera,
      // Removed broken external image - using gradient fallback
      tabId: 'studio'
    },
    {
      id: 'chat-maya',
      title: '2. Chat with Maya',
      description: 'Get styling advice',
      icon: MessageCircle,
      // Removed broken external image - using gradient fallback
      tabId: 'maya'
    },
    {
      id: 'browse-gallery',
      title: '3. View Gallery',
      description: 'Browse your photos',
      icon: Grid,
      // Removed broken external image - using gradient fallback
      tabId: 'gallery'
    },
    {
      id: 'view-profile',
      title: '4. Your Profile',
      description: 'Account settings',
      icon: User,
      // Removed broken external image - using gradient fallback
      tabId: 'profile'
    }
  ];

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-serif font-extralight tracking-[0.2em] text-stone-950 uppercase mb-2">
          Quick Start Guide
        </h2>
        <p className="text-sm font-light text-stone-600">
          Follow these steps to create your first photos
        </p>
      </div>

      {/* Grid Layout - Optimized for mobile and desktop */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {quickActions.map((action, index) => {
          const Icon = action.icon;
          
          return (
            <button
              key={action.id}
              onClick={() => onTabChange?.(action.tabId)}
              className="group relative overflow-hidden rounded-xl sm:rounded-2xl border border-stone-200/40 hover:border-stone-300/60 transition-all duration-300 hover:scale-[1.02] hover:shadow-md focus:outline-none focus:ring-2 focus:ring-stone-600/40 focus:ring-offset-2"
              aria-label={`${action.title}: ${action.description}`}
            >
              {/* Enhanced Gradient Background with Icon */}
              <div className="aspect-[4/5] relative">
                {/* Elegant stone gradient background maintaining brand consistency */}
                <div className={`w-full h-full relative ${
                  action.id === 'new-shoot' ? 'bg-gradient-to-br from-stone-50 via-stone-100 to-stone-200' :
                  action.id === 'chat-maya' ? 'bg-gradient-to-br from-stone-100 via-stone-200 to-stone-300' :
                  action.id === 'browse-gallery' ? 'bg-gradient-to-br from-stone-50 via-stone-100 to-stone-200' :
                  'bg-gradient-to-br from-stone-100 via-stone-200 to-stone-300'
                }`}>
                  {/* Elegant dark overlay for text readability */}
                  <div className="absolute inset-0 bg-gradient-to-b from-stone-950/30 via-stone-950/50 to-stone-950/80"></div>
                  
                  {/* Centered Icon with luxury styling */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                      <Icon className="w-10 h-10 sm:w-12 sm:h-12 text-white/80" strokeWidth={1.5} />
                    </div>
                  </div>
                </div>
                
                {/* Prominent Number Badge - Enhanced Visibility */}
                <div className="absolute top-3 left-3 w-10 h-10 sm:w-12 sm:h-12 bg-stone-50 rounded-xl sm:rounded-2xl flex items-center justify-center border-2 border-stone-200/60 shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:shadow-xl">
                  <span className="text-base sm:text-lg font-serif font-extralight text-stone-950">
                    {index + 1}
                  </span>
                </div>
                
                {/* White Text Content with Enhanced Contrast */}
                <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-5">
                  <h3 className="text-sm sm:text-base font-serif font-extralight tracking-[0.12em] text-white uppercase mb-1.5 leading-tight drop-shadow-lg">
                    {action.title}
                  </h3>
                  <p className="text-xs sm:text-sm font-light text-stone-100 drop-shadow-md leading-relaxed">
                    {action.description}
                  </p>
                </div>

                {/* Hover State Indicator */}
                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="w-8 h-8 bg-stone-50/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                    <Icon className="w-4 h-4 text-stone-50" strokeWidth={1.5} />
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Optional: Progress Indicator */}
      <div className="flex items-center justify-center gap-2 pt-2">
        {quickActions.map((action, index) => (
          <div 
            key={action.id}
            className="w-2 h-2 rounded-full bg-stone-300/40 transition-colors"
            aria-label={`Step ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
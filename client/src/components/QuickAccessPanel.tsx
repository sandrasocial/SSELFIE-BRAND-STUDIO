import React, { useState } from 'react';
import { Camera, MessageCircle, Grid, User } from 'lucide-react';

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
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});

  const quickActions: QuickAction[] = [
    {
      id: 'new-shoot',
      title: '1. Create Photos',
      description: 'Generate new images',
      icon: Camera,
      imageUrl: 'https://i.postimg.cc/Y9xDCmzs/Lovephotography.jpg',
      tabId: 'studio'
    },
    {
      id: 'chat-maya',
      title: '2. Chat with Maya',
      description: 'Get styling advice',
      icon: MessageCircle,
      imageUrl: 'https://i.postimg.cc/mD464SCd/42.jpg',
      tabId: 'maya'
    },
    {
      id: 'browse-gallery',
      title: '3. View Gallery',
      description: 'Browse your photos',
      icon: Grid,
      imageUrl: 'https://i.postimg.cc/NMtPtxmS/45.jpg',
      tabId: 'gallery'
    },
    {
      id: 'view-profile',
      title: '4. Your Profile',
      description: 'Account settings',
      icon: User,
      imageUrl: 'https://i.postimg.cc/bJPFPRkM/47.jpg',
      tabId: 'profile'
    }
  ];

  const handleImageError = (actionId: string) => {
    setImageErrors(prev => ({ ...prev, [actionId]: true }));
  };

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
          const hasError = imageErrors[action.id];
          
          return (
            <button
              key={action.id}
              onClick={() => onTabChange?.(action.tabId)}
              className="group relative overflow-hidden rounded-xl sm:rounded-2xl border border-stone-200/40 hover:border-stone-300/60 transition-all duration-300 hover:scale-[1.02] hover:shadow-md focus:outline-none focus:ring-2 focus:ring-stone-600/40 focus:ring-offset-2"
              aria-label={`${action.title}: ${action.description}`}
            >
              {/* Background Image or Gradient Fallback */}
              <div className="aspect-[4/5] relative">
                {action.imageUrl && !hasError ? (
                  <>
                    <img 
                      src={action.imageUrl}
                      alt=""
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      onError={() => handleImageError(action.id)}
                      loading="lazy"
                    />
                    {/* Enhanced Dark Overlay for Text Readability */}
                    <div className="absolute inset-0 bg-gradient-to-b from-stone-950/40 via-stone-950/60 to-stone-950/90"></div>
                  </>
                ) : (
                  // Enhanced Gradient Fallback with Icon
                  <div className="w-full h-full bg-gradient-to-br from-stone-200 via-stone-300 to-stone-400 relative">
                    <div className="absolute inset-0 bg-gradient-to-b from-stone-950/40 via-stone-950/60 to-stone-950/90"></div>
                    {/* Centered Icon for Fallback */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-20">
                      <Icon className="w-16 h-16 sm:w-20 sm:h-20 text-stone-50" strokeWidth={1} />
                    </div>
                  </div>
                )}
                
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
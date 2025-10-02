import React from 'react';
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-serif font-extralight tracking-[0.2em] text-stone-950 uppercase mb-2">
          Quick Start Guide
        </h2>
        <p className="text-sm font-light text-stone-600">
          Follow these steps to create your first photos
        </p>
      </div>

      {/* Grid Layout - Better for numbered steps */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {quickActions.map((action, index) => {
          return (
            <button
              key={action.id}
              onClick={() => onTabChange?.(action.tabId)}
              className="group relative overflow-hidden rounded-2xl border border-stone-200/40 hover:border-stone-300/60 transition-all duration-200 hover:scale-[1.02]"
            >
              {/* Background Image or Gradient */}
              <div className="aspect-[4/5] relative">
                {action.imageUrl ? (
                  <>
                    <img 
                      src={action.imageUrl}
                      alt={action.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.parentElement?.classList.add('bg-gradient-to-br', 'from-stone-200', 'to-stone-300');
                      }}
                    />
                    {/* Strong Dark Overlay for Text Readability */}
                    <div className="absolute inset-0 bg-gradient-to-b from-stone-950/30 via-stone-950/50 to-stone-950/90"></div>
                  </>
                ) : (
                  // Fallback gradient if no image
                  <div className="w-full h-full bg-gradient-to-br from-stone-200 to-stone-300">
                    <div className="absolute inset-0 bg-gradient-to-b from-stone-950/30 via-stone-950/50 to-stone-950/90"></div>
                  </div>
                )}
                
                {/* Number Badge instead of Icon */}
                <div className="absolute top-3 left-3 w-8 h-8 bg-stone-50 rounded-xl flex items-center justify-center border border-stone-200/40 shadow-sm">
                  <span className="text-sm font-serif font-extralight text-stone-950">
                    {index + 1}
                  </span>
                </div>
                
                {/* White Text Content with Strong Contrast */}
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <h3 className="text-sm font-serif font-extralight tracking-[0.1em] text-white uppercase mb-1 leading-tight drop-shadow-sm">
                    {action.title}
                  </h3>
                  <p className="text-xs font-light text-stone-100 drop-shadow-sm">
                    {action.description}
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
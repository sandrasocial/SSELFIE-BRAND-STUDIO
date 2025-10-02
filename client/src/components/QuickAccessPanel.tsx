import React from 'react';
import { Camera, MessageCircle, Grid, User } from 'lucide-react';

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  imageUrl?: string;
  onClick: () => void;
}

export default function QuickAccessPanel() {
  const quickActions: QuickAction[] = [
    {
      id: 'new-shoot',
      title: 'New Photoshoot',
      description: 'Start creating',
      icon: Camera,
      imageUrl: 'https://i.postimg.cc/Y9xDCmzs/Lovephotography.jpg',
      onClick: () => window.location.href = '/studio'
    },
    {
      id: 'chat-maya',
      title: 'Chat with Maya',
      description: 'Get styling advice',
      icon: MessageCircle,
      imageUrl: 'https://i.postimg.cc/mD464SCd/42.jpg',
      onClick: () => window.location.href = '/maya'
    },
    {
      id: 'browse-gallery',
      title: 'Browse Gallery',
      description: 'View your photos',
      icon: Grid,
      imageUrl: 'https://i.postimg.cc/NMtPtxmS/45.jpg',
      onClick: () => window.location.href = '/sselfie-gallery'
    },
    {
      id: 'view-profile',
      title: 'View Profile',
      description: 'Manage account',
      icon: User,
      imageUrl: 'https://i.postimg.cc/bJPFPRkM/47.jpg',
      onClick: () => window.location.href = '/profile'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-serif font-extralight tracking-[0.2em] text-stone-950 uppercase mb-2">
          Quick Access
        </h2>
        <p className="text-sm font-light text-stone-600">
          Jump to your most-used features
        </p>
      </div>

      {/* Horizontal Scrolling Panel */}
      <div className="overflow-x-auto -mx-6 px-6 pb-2">
        <div className="flex gap-4 min-w-min">
          {quickActions.map((action) => {
            const Icon = action.icon;
            
            return (
              <button
                key={action.id}
                onClick={action.onClick}
                className="group relative overflow-hidden rounded-2xl border border-stone-200/40 hover:border-stone-300/60 transition-all duration-200 hover:scale-[1.02] flex-shrink-0"
                style={{ width: '160px' }}
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
                      {/* Gradient Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-stone-950/20 to-stone-950/80"></div>
                    </>
                  ) : (
                    // Fallback gradient if no image
                    <div className="w-full h-full bg-gradient-to-br from-stone-200 to-stone-300">
                      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-stone-950/20 to-stone-950/80"></div>
                    </div>
                  )}
                  
                  {/* Icon */}
                  <div className="absolute top-3 left-3 w-8 h-8 bg-stone-50/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-stone-50/30">
                    <Icon size={16} className="text-stone-50" strokeWidth={1.5} />
                  </div>
                  
                  {/* Text Content */}
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <h3 className="text-sm font-serif font-extralight tracking-[0.1em] text-stone-50 uppercase mb-1 leading-tight">
                      {action.title}
                    </h3>
                    <p className="text-xs font-light text-stone-200">
                      {action.description}
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Scroll Indicator (optional) */}
      <div className="flex items-center justify-center gap-2">
        {quickActions.map((_, index) => (
          <div 
            key={index} 
            className="w-1 h-1 rounded-full bg-stone-300"
          ></div>
        ))}
      </div>
    </div>
  );
}
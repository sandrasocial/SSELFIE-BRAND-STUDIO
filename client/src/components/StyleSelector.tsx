import React, { useState } from 'react';
import { Check } from 'lucide-react';

interface Style {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  prompt: string;
}

interface StyleSelectorProps {
  onStyleSelect?: (style: Style) => void;
  selectedStyleId?: string;
}

export function StyleSelector({ onStyleSelect, selectedStyleId }: StyleSelectorProps) {
  const [selectedStyle, setSelectedStyle] = useState<string | null>(selectedStyleId || null);

  const styles: Style[] = [
    {
      id: 'professional',
      title: 'Professional Headshot',
      description: 'Clean, business-ready portraits',
      imageUrl: 'https://i.postimg.cc/TPLcG2xr/out-0.png',
      prompt: 'professional corporate headshot, business attire, clean background, confident expression'
    },
    {
      id: 'editorial',
      title: 'Editorial Style',
      description: 'Magazine-quality fashion shots',
      imageUrl: 'https://i.postimg.cc/pdwJdNV3/out-0-6.png',
      prompt: 'editorial fashion portrait, dramatic lighting, artistic composition, high fashion'
    },
    {
      id: 'lifestyle',
      title: 'Lifestyle Portrait',
      description: 'Natural, authentic moments',
      imageUrl: 'https://i.postimg.cc/P5FMBpgX/out-0-1.png',
      prompt: 'lifestyle portrait, natural lighting, authentic expression, candid moment'
    },
    {
      id: 'creative',
      title: 'Creative Portrait',
      description: 'Artistic and unique angles',
      imageUrl: 'https://i.postimg.cc/nLY7W4ZM/sselfie-7.jpg',
      prompt: 'creative portrait, artistic lighting, unique composition, expressive'
    }
  ];

  const handleStyleClick = (style: Style) => {
    setSelectedStyle(style.id);
    if (onStyleSelect) {
      onStyleSelect(style);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl sm:text-3xl font-serif font-extralight tracking-[0.2em] text-stone-950 uppercase mb-2">
          Choose Your Style
        </h2>
        <p className="text-sm font-light text-stone-600">
          Select a photography style for your shoot
        </p>
      </div>

      {/* Style Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {styles.map((style) => {
          const isSelected = selectedStyle === style.id;
          
          return (
            <button
              key={style.id}
              onClick={() => handleStyleClick(style)}
              className={`group relative overflow-hidden rounded-2xl sm:rounded-3xl transition-all duration-300 ${
                isSelected 
                  ? 'ring-2 ring-stone-950 scale-[1.02]' 
                  : 'hover:scale-[1.02] ring-1 ring-stone-200/40'
              }`}
            >
              {/* Image Container */}
              <div className="aspect-[4/3] relative">
                {/* Style Image */}
                <img 
                  src={style.imageUrl}
                  alt={style.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  onError={(e) => {
                    // Fallback to gradient if image fails to load
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.parentElement?.classList.add('bg-gradient-to-br', 'from-stone-200', 'to-stone-300');
                  }}
                />
                
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-stone-950/20 to-transparent"></div>
                
                {/* Selection Indicator */}
                {isSelected && (
                  <div className="absolute top-3 right-3 w-8 h-8 bg-stone-50 rounded-full flex items-center justify-center shadow-lg">
                    <Check size={16} className="text-stone-950" strokeWidth={2.5} />
                  </div>
                )}
                
                {/* Content Overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-5">
                  <h3 className="text-sm sm:text-base font-serif font-extralight tracking-[0.1em] text-stone-50 uppercase mb-1 leading-tight">
                    {style.title}
                  </h3>
                  <p className="text-xs font-light text-stone-200 leading-relaxed">
                    {style.description}
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected Style Info */}
      {selectedStyle && (
        <div className="bg-stone-100/50 border border-stone-200/40 rounded-2xl p-5 sm:p-6">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-stone-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
              <Check size={18} className="text-stone-600" strokeWidth={1.5} />
            </div>
            <div>
              <h4 className="text-sm font-light text-stone-950 mb-1">
                Style Selected
              </h4>
              <p className="text-xs font-light text-stone-600 leading-relaxed">
                {styles.find(s => s.id === selectedStyle)?.title} - Ready to generate
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
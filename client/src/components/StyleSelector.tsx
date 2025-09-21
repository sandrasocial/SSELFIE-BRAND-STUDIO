import React from 'react';
import { brandStyleCollections, BrandStyleCollection } from '../data/brand-style-collections';
import { Check, Sparkles } from 'lucide-react';

interface StyleSelectorProps {
  onStyleSelect: (style: BrandStyleCollection) => void;
  selectedStyleId?: string;
}

export const StyleSelector: React.FC<StyleSelectorProps> = ({
  onStyleSelect,
  selectedStyleId
}) => {
  return (
    <div className="space-y-8">
      {/* Luxury Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="p-3 bg-neutral-800/40 rounded-editorial-xl border border-neutral-700/30">
            <Sparkles size={20} className="text-neutral-300" strokeWidth={1.5} />
          </div>
          <h2 className="text-2xl font-light text-neutral-200 tracking-wide">
            CHOOSE YOUR STYLE
          </h2>
        </div>
        <p className="text-neutral-400 text-sm tracking-wide max-w-md mx-auto">
          Select the aesthetic that best represents your vision
        </p>
      </div>

      {/* Luxury Style Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {brandStyleCollections.map((style) => (
          <div
            key={style.id}
            onClick={() => onStyleSelect(style)}
            className={`
              relative group cursor-pointer rounded-editorial-xl overflow-hidden
              transform transition-all duration-500 hover:scale-[1.02] hover:shadow-editorial-xl
              border border-neutral-700/20 bg-neutral-800/20 backdrop-blur-sm
              ${selectedStyleId === style.id 
                ? 'ring-2 ring-neutral-300 shadow-editorial-lg bg-neutral-800/40' 
                : 'hover:bg-neutral-800/30'
              }
            `}
          >
            {/* Style Image */}
            <div className="aspect-square relative overflow-hidden">
              <img
                src={style.heroImage}
                alt={style.name}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              
              {/* Sophisticated Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />
              
              {/* Selection Indicator */}
              {selectedStyleId === style.id && (
                <div className="absolute top-4 right-4 w-8 h-8 bg-neutral-200 rounded-full flex items-center justify-center shadow-lg">
                  <Check size={16} className="text-black" strokeWidth={2} />
                </div>
              )}
              
              {/* Style Name Overlay */}
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <h3 className="text-white text-lg font-light tracking-wide mb-1">
                  {style.name}
                </h3>
                <p className="text-neutral-300 text-xs tracking-wide">
                  {style.mood}
                </p>
              </div>
            </div>

            {/* Style Info - Minimal */}
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-light text-neutral-200 tracking-wide mb-2">
                    {style.name}
                  </h3>
                  <p className="text-sm text-neutral-400 leading-relaxed line-clamp-2">
                    {style.description}
                  </p>
                </div>
                
                {/* Target Audience */}
                <div className="space-y-2">
                  <span className="text-xs text-neutral-500 tracking-wide uppercase">Perfect For</span>
                  <p className="text-xs text-neutral-300 leading-relaxed">
                    {style.targetAudience}
                  </p>
                </div>
                
                {/* Color Palette - Simplified */}
                <div className="space-y-3">
                  <span className="text-xs text-neutral-500 tracking-wide uppercase">Color Palette</span>
                  <div className="flex space-x-3">
                    <div className="flex flex-col items-center space-y-1">
                      <div
                        className="w-6 h-6 rounded-full border border-neutral-600/30 shadow-sm"
                        style={{ backgroundColor: style.primaryColor }}
                      />
                      <span className="text-xs text-neutral-400">Primary</span>
                    </div>
                    <div className="flex flex-col items-center space-y-1">
                      <div
                        className="w-6 h-6 rounded-full border border-neutral-600/30 shadow-sm"
                        style={{ backgroundColor: style.secondaryColor }}
                      />
                      <span className="text-xs text-neutral-400">Secondary</span>
                    </div>
                    <div className="flex flex-col items-center space-y-1">
                      <div
                        className="w-6 h-6 rounded-full border border-neutral-600/30 shadow-sm"
                        style={{ backgroundColor: style.accentColor }}
                      />
                      <span className="text-xs text-neutral-400">Accent</span>
                    </div>
                  </div>
                </div>
                
                {/* Font */}
                <div className="space-y-2">
                  <span className="text-xs text-neutral-500 tracking-wide uppercase">Typography</span>
                  <p className="text-xs text-neutral-300 font-light" style={{ fontFamily: style.primaryFont }}>
                    {style.primaryFont}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StyleSelector;
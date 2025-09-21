import React from 'react';
import { Camera } from 'lucide-react';

interface LuxuryConceptCardProps {
  title: string;
  description: string;
  category?: string;
  isGenerating?: boolean;
  isGenerated?: boolean;
  generatedImages?: string[];
  onGenerate: () => void;
}

const LuxuryConceptCard: React.FC<LuxuryConceptCardProps> = ({ 
  title, 
  description, 
  category = 'Photo',
  isGenerating, 
  isGenerated,
  generatedImages = [],
  onGenerate 
}) => {
  return (
    <div className="bg-gradient-to-br from-zinc-800/20 to-zinc-900/20 rounded-2xl p-6 border border-zinc-700/20 transition-all duration-500 hover:border-zinc-600/30 hover:bg-gradient-to-br hover:from-zinc-800/30 hover:to-zinc-900/30">
      <div className="space-y-5">
        {/* Enhanced header with better hierarchy - Following Styleguide */}
        <div className="flex items-center justify-between">
          <div className="px-4 py-2 bg-zinc-700/30 rounded-full border border-zinc-600/20">
            <span className="text-sm text-zinc-300 tracking-[0.1em] uppercase font-light">{category}</span>
          </div>
          <div className="w-2 h-2 bg-zinc-500 rounded-full"></div>
        </div>
        
        {/* Improved content hierarchy - Following Styleguide */}
        <div className="space-y-4">
          <h4 className="text-xl font-serif font-extralight tracking-[0.1em] text-white uppercase leading-tight">{title}</h4>
          <p className="text-base text-zinc-300 leading-relaxed font-light">{description}</p>
        </div>
      </div>
      
      {/* Enhanced interaction states - Following Styleguide */}
      {!isGenerating && !isGenerated && (
        <div className="mt-8">
          <button 
            onClick={onGenerate}
            className="group relative w-full bg-white text-black px-8 py-5 rounded-2xl font-light tracking-[0.2em] uppercase text-sm transition-all duration-500 hover:scale-[1.02] active:scale-[0.98] overflow-hidden min-h-[56px]"
          >
            <div className="absolute inset-0 bg-black transform -translate-x-full group-hover:translate-x-0 transition-transform duration-500"></div>
            <div className="relative z-10 group-hover:text-white transition-colors duration-500 flex items-center justify-center gap-3">
              <Camera size={18} strokeWidth={1.2} />
              <span>Generate Photos</span>
            </div>
          </button>
        </div>
      )}

      {/* Enhanced loading state - Following Styleguide */}
      {isGenerating && (
        <div className="mt-8 flex flex-col items-center justify-center py-12 space-y-6">
          <div className="relative">
            <div className="w-12 h-12 border-2 border-white/20 rounded-full animate-spin"></div>
            <div className="absolute inset-0 w-12 h-12 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          </div>
          <div className="text-center space-y-3">
            <span className="text-lg text-zinc-200 tracking-[0.2em] uppercase font-light">Creating Magic</span>
            <div className="w-64 h-1 bg-zinc-800 rounded-full overflow-hidden">
              <div className="w-full h-full bg-gradient-to-r from-transparent via-white/50 to-transparent animate-pulse"></div>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced success state - Following Styleguide */}
      {isGenerated && generatedImages.length > 0 && (
        <div className="mt-8 space-y-6">
          <div className="p-5 bg-green-900/20 border border-green-500/30 rounded-2xl">
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 bg-green-500/30 rounded-full flex items-center justify-center">
                <span className="text-green-300 text-sm font-light">✓</span>
              </div>
              <div className="space-y-1">
                <h4 className="text-base font-light text-green-200">Photos Ready!</h4>
                <p className="text-sm text-green-300/80 font-light">Your vision came to life beautifully.</p>
              </div>
            </div>
          </div>
          
          {/* Enhanced photo grid - Following Styleguide */}
          <div className="grid grid-cols-2 gap-3">
            {generatedImages.map((imageUrl, i) => (
              <div key={i} className="aspect-square rounded-xl overflow-hidden">
                <img 
                  src={imageUrl} 
                  alt={`Generated ${title} ${i + 1}`} 
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300 cursor-pointer" 
                />
              </div>
            ))}
          </div>
          
          {/* Enhanced action buttons - Following Styleguide */}
          <div className="grid grid-cols-2 gap-3">
            <button className="px-5 py-3 bg-white text-black rounded-xl font-light tracking-[0.1em] uppercase text-sm transition-all duration-300 hover:bg-zinc-200 min-h-[48px]">
              Save All
            </button>
            <button className="px-5 py-3 bg-zinc-800/30 text-white border border-zinc-700/20 rounded-xl font-light tracking-[0.1em] uppercase text-sm transition-all duration-300 hover:bg-zinc-800/50 min-h-[48px]">
              Share
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LuxuryConceptCard;

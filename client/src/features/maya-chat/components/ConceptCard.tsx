import React from 'react';
import { Camera } from 'lucide-react';
import type { ConceptCard as ConceptCardType } from '../../../../../shared/types/concept-card.js';

export interface ConceptCardProps {
  card: ConceptCardType & {
    emoji?: string;
    creativeLook?: string;
    isGenerating?: boolean;
    hasGenerated?: boolean;
    isLoading?: boolean;
    generatedImages?: string[];
  };
  isSelected: boolean;
  isGenerating: boolean;
  isPolling: boolean;
  pollingStatus: { jobId?: string; pollCount?: number; duration?: number } | null;
  onGenerate: (cardId: string) => void;
  onHeart?: (imageUrl: string) => void;
  onView?: (imageUrl: string) => void;
}

const ConceptCard: React.FC<ConceptCardProps> = ({
  card,
  isSelected,
  isGenerating,
  isPolling,
  pollingStatus,
  onGenerate,
  onHeart,
  onView
}) => {
  const handleGenerate = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isGenerating && !isPolling) onGenerate(card.id);
  };

  const hasImages = !!card.generatedImages && card.generatedImages.length > 0;

  return (
    <div
      className={[
        'bg-white/50 backdrop-blur-2xl border border-white/70 rounded-[1.75rem] p-6 transition-all duration-300',
        'hover:bg-white/70 hover:border-white/90 hover:scale-[1.01] shadow-xl shadow-stone-900/10',
        isGenerating || isPolling ? 'opacity-70 cursor-wait' : 'cursor-pointer',
        isSelected ? 'ring-2 ring-stone-600/40' : '',
      ].join(' ')}
      onClick={handleGenerate}
    >
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div className="px-4 py-2 bg-stone-100 backdrop-blur-xl rounded-full border border-stone-200 shadow-inner">
            <span className="text-xs tracking-wider uppercase font-semibold text-stone-950">
              {String(card.creativeLook || card.title || 'Concept')}
            </span>
          </div>
          <div className="w-2 h-2 rounded-full bg-stone-950 shadow-lg shadow-stone-900/50"></div>
        </div>

        <div className="space-y-3">
          <h4 className="text-base font-bold text-stone-950 leading-tight">{String(card.title)}</h4>
          <p className="text-sm font-medium leading-relaxed text-stone-600">{String(card.description)}</p>
        </div>
      </div>

      {/* States */}
      {hasImages ? (
        <div className="mt-6 space-y-4">
          <div className="p-5 bg-stone-100 backdrop-blur-xl border border-stone-200 rounded-[1.25rem] shadow-xl shadow-stone-900/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-stone-950 rounded-xl flex items-center justify-center shadow-lg shadow-stone-900/30">
                <div className="w-2 h-2 bg-white rounded-full"></div>
              </div>
              <div className="space-y-1 flex-1 min-w-0">
                <h4 className="text-sm font-semibold text-stone-950">Photo Ready</h4>
                <p className="text-xs font-medium text-stone-600">Looking absolutely stunning</p>
              </div>
            </div>
          </div>
          <div
            className="aspect-video bg-white/40 backdrop-blur-2xl rounded-[1.5rem] border border-white/60 flex items-center justify-center hover:bg-white/60 transition-all duration-300 cursor-pointer group relative overflow-hidden shadow-xl shadow-stone-900/10"
            onClick={(e) => {
              e.stopPropagation();
              const url = card.generatedImages![0];
              if (onView) onView(url);
              else if (url) window.open(url, '_blank');
            }}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                const url = card.generatedImages![0];
                if (onView) onView(url);
                else if (url) window.open(url, '_blank');
              }
            }}
            aria-label="View full size image"
          >
            <img
              src={card.generatedImages![0]}
              alt={String(card.title)}
              className="w-full h-full object-cover"
              loading="lazy"
            />
            {!card.generatedImages![0] && (
              <Camera size={32} className="text-stone-500 group-hover:text-stone-700 group-hover:scale-110 transition-all duration-300" strokeWidth={2} />
            )}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <button
              className="px-5 py-4 bg-stone-950 text-white rounded-[1.25rem] font-semibold text-sm transition-all duration-300 hover:shadow-2xl hover:shadow-stone-900/40 hover:scale-[1.02] active:scale-[0.98] min-h-[52px]"
              onClick={(e) => {
                e.stopPropagation();
                const url = card.generatedImages![0];
                onHeart?.(url);
              }}
            >
              Save Photo
            </button>
            <button
              className="px-5 py-4 bg-white/50 backdrop-blur-2xl text-stone-950 border border-white/60 rounded-[1.25rem] font-semibold text-sm transition-all duration-300 hover:bg-white/70 hover:border-white/80 hover:scale-[1.02] active:scale-[0.98] min-h-[52px] shadow-lg shadow-stone-900/10"
              onClick={(e) => {
                e.stopPropagation();
                const url = card.generatedImages![0];
                onView?.(url);
              }}
            >
              Share
            </button>
          </div>
        </div>
      ) : isGenerating ? (
        <div className="mt-6 flex flex-col items-center justify-center py-8 space-y-4">
          <div className="relative w-10 h-10">
            <div className="absolute inset-0 rounded-full bg-stone-200/20 animate-ping"></div>
            <div className="relative w-10 h-10 rounded-full bg-stone-950 animate-spin border-4 border-transparent border-t-white shadow-lg"></div>
          </div>
          <div className="text-center space-y-2">
            <span className="text-sm tracking-wider uppercase font-semibold text-stone-700">Creating Magic</span>
            <div className="flex gap-1 justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-stone-950 animate-bounce"></div>
              <div className="w-1.5 h-1.5 rounded-full bg-stone-950 animate-bounce" style={{animationDelay: '0.1s'}}></div>
              <div className="w-1.5 h-1.5 rounded-full bg-stone-950 animate-bounce" style={{animationDelay: '0.2s'}}></div>
            </div>
          </div>
        </div>
      ) : isPolling ? (
        <div className="flex flex-col items-center justify-center py-6 sm:py-8 space-y-3 sm:space-y-4">
          <div className="relative w-8 h-8 sm:w-10 sm:h-10">
            <div className="absolute inset-0 rounded-full bg-stone-200/20 animate-ping"></div>
            <div className="relative w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-stone-950 animate-spin border-4 border-transparent border-t-white shadow-lg"></div>
          </div>
          <div className="text-center space-y-1.5 sm:space-y-2">
            <span className="text-xs sm:text-sm tracking-wider uppercase font-semibold text-stone-700">Creating Magic</span>
            <div className="flex gap-0.5 sm:gap-1 justify-center">
              <div className="w-1 sm:w-1.5 h-1 sm:h-1.5 rounded-full bg-stone-950 animate-bounce"></div>
              <div className="w-1 sm:w-1.5 h-1 sm:h-1.5 rounded-full bg-stone-950 animate-bounce" style={{animationDelay: '0.1s'}}></div>
              <div className="w-1 sm:w-1.5 h-1 sm:h-1.5 rounded-full bg-stone-950 animate-bounce" style={{animationDelay: '0.2s'}}></div>
            </div>
            <p className="text-[10px] sm:text-xs text-stone-500 mt-1">
              {pollingStatus ? `Poll ${pollingStatus.pollCount ?? 0}/40 • ${Math.floor((pollingStatus.duration ?? 0) / 1000)}s` : 'Processing…'}
            </p>
          </div>
        </div>
      ) : (
        <div className="mt-6">
          <button
            onClick={handleGenerate}
            className="group relative w-full bg-stone-950 text-white px-6 py-4 rounded-[1.25rem] font-semibold tracking-wide text-sm transition-all duration-300 hover:shadow-2xl hover:shadow-stone-900/40 hover:scale-[1.02] active:scale-[0.98] min-h-[52px] overflow-hidden"
          >
            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <span className="relative z-10">Create This Photo</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default ConceptCard;


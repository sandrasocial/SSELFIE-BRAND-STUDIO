import React from 'react';
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
      <div className="flex items-center justify-between mb-4">
        <div className="px-4 py-2 bg-stone-100 backdrop-blur-xl rounded-full border border-stone-200 shadow-inner">
          <span className="text-xs tracking-wider uppercase font-semibold text-stone-950">
            {String(card.creativeLook || (card as any).category || 'Concept')}
          </span>
        </div>
        {card.emoji && <span className="text-2xl">{String(card.emoji)}</span>}
      </div>

      <h4 className="text-base font-bold text-stone-950 leading-tight mb-1">{String(card.title)}</h4>
      <p className="text-sm font-medium text-stone-600 mb-4">{String(card.description)}</p>

      {/* States */}
      {hasImages ? (
        <div className="space-y-3 sm:space-y-4">
          <div className="bg-stone-100 backdrop-blur-xl border border-stone-200 rounded-lg sm:rounded-[1.25rem] p-3 sm:p-4 flex items-center gap-3">
            <span className="text-stone-600">✨</span>
            <div>
              <p className="text-xs font-semibold text-stone-800">Photo Ready</p>
              <p className="text-xs text-stone-600">Looking absolutely stunning</p>
            </div>
          </div>
          <div
            className="aspect-video w-full overflow-hidden rounded-xl sm:rounded-[1.5rem] border border-white/70 bg-white/40 cursor-zoom-in"
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
          </div>
          <div className="grid grid-cols-2 gap-2 sm:gap-3">
            <button
              className="w-full bg-stone-950 text-white px-6 py-3 sm:py-4 rounded-lg sm:rounded-[1.25rem] font-semibold min-h-[48px] sm:min-h-[52px] hover:shadow-2xl hover:shadow-stone-900/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
              onClick={(e) => {
                e.stopPropagation();
                const url = card.generatedImages![0];
                onHeart?.(url);
              }}
            >
              Save Photo
            </button>
            <button
              className="w-full bg-white/80 text-stone-950 px-6 py-3 sm:py-4 rounded-lg sm:rounded-[1.25rem] font-semibold border border-white/70 min-h-[48px] sm:min-h-[52px] hover:bg-white hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
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
        <div className="flex flex-col items-center justify-center py-6 sm:py-8 space-y-3 sm:space-y-4">
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-stone-200/20 animate-ping" />
            <div className="relative w-8 h-8 sm:w-10 sm:h-10 border-2 border-white/60 border-t-white rounded-full animate-spin" />
          </div>
          <div className="text-center">
            <p className="text-[11px] sm:text-xs uppercase tracking-widest font-semibold text-stone-800">Creating Magic</p>
            <div className="flex items-center justify-center gap-1 mt-1">
              <span className="w-1.5 h-1.5 rounded-full bg-stone-600 animate-bounce" />
              <span className="w-1.5 h-1.5 rounded-full bg-stone-600 animate-bounce" style={{ animationDelay: '0.1s' }} />
              <span className="w-1.5 h-1.5 rounded-full bg-stone-600 animate-bounce" style={{ animationDelay: '0.2s' }} />
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
        <button
          className="w-full bg-stone-950 text-white px-6 py-4 rounded-[1.25rem] font-semibold hover:shadow-2xl hover:shadow-stone-900/40 hover:scale-[1.02] transition-all duration-300"
          onClick={handleGenerate}
        >
          Create This Photo
        </button>
      )}
    </div>
  );
};

export default ConceptCard;


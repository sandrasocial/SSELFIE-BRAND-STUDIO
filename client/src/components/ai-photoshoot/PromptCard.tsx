import { KeyboardEvent } from 'react';
import { PhotoshootPrompt } from '@/types/photoshoot';
import { useToast } from '@/hooks/use-toast';

interface PromptCardProps {
  prompt: PhotoshootPrompt;
  collectionPreview: string;
  canGenerate: boolean;
  onGenerate: () => void;
}

export const PromptCard = memo<PromptCardProps>(({
  prompt,
  collectionPreview,
  canGenerate,
  onGenerate
}) => {
  const { toast } = useToast();

  const handleClick = () => {
    if (canGenerate) {
      onGenerate();
    } else {
      toast({
        title: "Training Required",
        description: "Please complete your AI model training first.",
        
      });
    }
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  };

  return (
    <div
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-label={`Generate ${prompt.name} style${!canGenerate ? ' (training required)' : ''}`}
      className={`relative group cursor-pointer transition-all duration-500 aspect-[3/4] overflow-hidden ${
        canGenerate 
          ? 'hover:scale-[1.03] shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:shadow-[0_20px_60px_rgb(0,0,0,0.25)] focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2' 
          : 'opacity-40 cursor-not-allowed shadow-[0_4px_15px_rgb(0,0,0,0.08)]'
      }`}
      style={{
        background: 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)',
        backdropFilter: 'blur(5px)',
        border: '1px solid rgba(0,0,0,0.05)'
      }}
    >
      {/* Collection preview image for consistency */}
      <img
        src={collectionPreview}
        alt={`${prompt.name} style preview`}
        className="w-full h-full object-cover"
        loading="lazy"
      />
      
      <div className={`absolute inset-0 bg-black transition-opacity duration-300 ${
        canGenerate ? 'bg-opacity-60 group-hover:bg-opacity-40' : 'bg-opacity-70'
      }`}>
        <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
          <div className="text-xs tracking-[0.2em] uppercase opacity-70 mb-1">
            {prompt.category}
          </div>
          <div className="font-serif text-sm font-light uppercase tracking-wide leading-tight">
            {prompt.name}
          </div>
        </div>
      </div>
      
      {/* Generate button overlay on hover */}
      {canGenerate && (
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button 
            className="px-4 py-2 text-xs uppercase tracking-wide bg-white text-black font-light hover:bg-black hover:text-white transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
            onClick={(e) => {
              e.stopPropagation();
              onGenerate();
            }}
            aria-label={`Generate ${prompt.name}`}
          >
            Generate
          </button>
        </div>
      )}
      
      {!canGenerate && (
        <div className="absolute top-2 right-2 text-xs bg-red-500 text-white px-2 py-1 uppercase tracking-wide">
          Training Required
        </div>
      )}
    </div>
  );
});

PromptCard.displayName = 'PromptCard';
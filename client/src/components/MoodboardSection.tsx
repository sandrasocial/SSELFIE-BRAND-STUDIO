import { FC } from 'react';
import { Plus } from 'lucide-react';

interface MoodboardSectionProps {
  title: string;
  images: string[];
  backgroundColor?: string;
  padding?: string;
  onAddImage?: () => void;
}

export const MoodboardSection: FC<MoodboardSectionProps> = ({
  title,
  images,
  onAddImage
}) => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl sm:text-2xl font-serif font-extralight tracking-[0.2em] text-stone-950 uppercase">
          {title}
        </h2>
        {onAddImage && (
          <button
            onClick={onAddImage}
            className="p-2 bg-stone-100/50 border border-stone-200/40 rounded-xl hover:bg-stone-100/70 hover:border-stone-300/50 transition-all duration-200"
            title="Add inspiration image"
          >
            <Plus size={16} className="text-stone-600" strokeWidth={1.5} />
          </button>
        )}
      </div>

      {/* Moodboard Grid */}
      {images.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
          {images.map((image, index) => (
            <div 
              key={index} 
              className="group relative aspect-[4/5] overflow-hidden rounded-2xl border border-stone-200/40 bg-stone-100/40 cursor-pointer hover:border-stone-300/60 transition-all duration-200"
            >
              <img 
                src={image} 
                alt={`${title} ${index + 1}`}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                onError={(e) => {
                  // Fallback if image fails to load
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.parentElement?.classList.add('bg-gradient-to-br', 'from-stone-200', 'to-stone-300');
                }}
              />
              
              {/* Hover Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-stone-950/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              {/* Image Number */}
              <div className="absolute bottom-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <span className="text-stone-50 text-xs tracking-[0.15em] uppercase font-light">
                  Ref {String(index + 1).padStart(2, '0')}
                </span>
              </div>
            </div>
          ))}

          {/* Add New Card */}
          {onAddImage && (
            <button
              onClick={onAddImage}
              className="aspect-[4/5] rounded-2xl border-2 border-dashed border-stone-300/60 bg-stone-100/30 hover:bg-stone-100/50 hover:border-stone-400/80 transition-all duration-200 flex flex-col items-center justify-center gap-3 group"
            >
              <div className="w-12 h-12 bg-stone-500/10 rounded-xl flex items-center justify-center border border-stone-400/20 group-hover:border-stone-400/40 transition-colors">
                <Plus size={20} className="text-stone-600" strokeWidth={1.5} />
              </div>
              <span className="text-xs tracking-[0.15em] uppercase font-light text-stone-600">
                Add Image
              </span>
            </button>
          )}
        </div>
      ) : (
        // Empty State
        <div className="text-center py-16">
          <div className="w-16 h-16 bg-stone-500/10 rounded-2xl flex items-center justify-center border border-stone-400/20 mx-auto mb-4">
            <Plus size={24} className="text-stone-600" strokeWidth={1.5} />
          </div>
          <h3 className="text-base font-serif font-extralight tracking-[0.15em] text-stone-950 uppercase mb-2">
            No Images Yet
          </h3>
          <p className="text-sm font-light text-stone-600 mb-6">
            Add inspiration images to build your moodboard
          </p>
          {onAddImage && (
            <button
              onClick={onAddImage}
              className="px-6 py-3 bg-stone-950 text-stone-50 rounded-2xl font-light tracking-[0.15em] uppercase text-sm transition-all duration-200 hover:bg-stone-800"
            >
              Add First Image
            </button>
          )}
        </div>
      )}
    </div>
  );
};

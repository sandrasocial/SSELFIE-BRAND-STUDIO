import React from 'react';
import { Heart, Download, Trash2, Eye, Check } from 'lucide-react';
import type { GalleryImage } from './ImageDetailModal.js';

export default function ImageCard({
  image,
  index,
  isFavorite,
  isSelected,
  viewMode,
  onOpen,
  onToggleFavorite,
  onToggleSelect,
  onDownload,
  onDelete,
}: {
  image: GalleryImage;
  index: number;
  isFavorite: boolean;
  isSelected: boolean;
  viewMode: 'grid' | 'masonry';
  onOpen: (img: GalleryImage) => void;
  onToggleFavorite: (id: string | number) => void;
  onToggleSelect: (id: string | number) => void;
  onDownload: (img: GalleryImage) => void;
  onDelete: (id: string | number) => void;
}) {
  const id = image.id;
  const src = image.imageUrl || image.url || '';
  return (
    <div className={`relative group cursor-pointer ${viewMode === 'masonry' ? 'mb-4 sm:mb-6 break-inside-avoid' : ''}`}> 
      <div className={`${viewMode === 'masonry' ? 'aspect-[4/5]' : 'aspect-square'} relative overflow-hidden rounded-2xl border-2 transition-all duration-300 ${
        isSelected ? 'border-stone-950 shadow-xl' : 'border-stone-200/60 hover:border-stone-300/80 hover:shadow-lg'
      }`}>
        <img src={src} alt={image.title || 'Gallery image'} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" onClick={() => onOpen(image)} />

        {isSelected && (
          <div className="absolute inset-0 bg-stone-950/20 backdrop-blur-sm flex items-center justify-center">
            <div className="w-10 h-10 bg-stone-50 rounded-full flex items-center justify-center shadow-xl">
              <Check size={18} className="text-stone-950" strokeWidth={2} />
            </div>
          </div>
        )}

        <div className="absolute inset-0 bg-stone-950/0 group-hover:bg-stone-950/20 transition-all duration-300" />

        <div className="absolute top-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleSelect(id);
            }}
            className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
              isSelected ? 'bg-stone-50 border-stone-50' : 'bg-stone-950/50 border-stone-50/50 hover:bg-stone-950/70'
            }`}
          >
            {isSelected && <Check size={14} className="text-stone-950" strokeWidth={2} />}
          </button>
        </div>

        {isFavorite && (
          <div className="absolute top-3 right-3">
            <div className="w-7 h-7 bg-red-500/90 rounded-full flex items-center justify-center backdrop-blur-sm">
              <Heart size={14} className="text-white fill-current" strokeWidth={1.5} />
            </div>
          </div>
        )}

        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-stone-950/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="flex justify-between items-center">
            <div className="space-y-1">
              <span className="text-stone-50 text-xs tracking-[0.15em] uppercase font-light">IMG_{String(index + 1).padStart(3, '0')}</span>
              {image.title && <p className="text-stone-200 text-xs truncate max-w-24 font-light">{image.title}</p>}
            </div>
            <div className="flex space-x-2">
              <button onClick={(e) => { e.stopPropagation(); onToggleFavorite(id); }} className="p-2 bg-stone-50/20 backdrop-blur-sm rounded-xl hover:bg-stone-50/30 transition-colors">
                <Heart size={14} className={`${isFavorite ? 'text-red-400 fill-current' : 'text-stone-50'}`} strokeWidth={1.5} />
              </button>
              <button onClick={(e) => { e.stopPropagation(); onOpen(image); }} className="p-2 bg-stone-50/20 backdrop-blur-sm rounded-xl hover:bg-stone-50/30 transition-colors">
                <Eye size={14} className="text-stone-50" strokeWidth={1.5} />
              </button>
              <button onClick={(e) => { e.stopPropagation(); onDownload(image); }} className="p-2 bg-stone-50/20 backdrop-blur-sm rounded-xl hover:bg-stone-50/30 transition-colors">
                <Download size={14} className="text-stone-50" strokeWidth={1.5} />
              </button>
              <button onClick={(e) => { e.stopPropagation(); onDelete(id); }} className="p-2 bg-red-500/20 backdrop-blur-sm rounded-xl hover:bg-red-500/30 transition-colors">
                <Trash2 size={14} className="text-red-400" strokeWidth={1.5} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


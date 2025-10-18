import React from 'react';
import { Camera, Heart, Download, Trash2, Plus, X } from 'lucide-react';

export interface GalleryImage {
  id: string | number;
  imageUrl?: string;
  url?: string;
  title?: string;
  source?: string;
}

export default function ImageDetailModal({
  selectedImage,
  onClose,
  onToggleFavorite,
  onDownload,
  onDelete,
  onPlaceBrandAsset,
  isFavorite
}: {
  selectedImage: GalleryImage;
  onClose: () => void;
  onToggleFavorite: () => void;
  onDownload: () => void;
  onDelete: () => void;
  onPlaceBrandAsset: () => void;
  isFavorite: boolean;
}) {
  return (
    <div className="fixed inset-0 bg-stone-950/95 backdrop-blur-sm z-50 flex items-center justify-center p-4 sm:p-8" onClick={onClose}>
      <div className="max-w-6xl max-h-[95vh] w-full flex flex-col bg-white rounded-3xl overflow-hidden shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-6 sm:p-8 border-b border-stone-200/40 bg-stone-50">
          <div className="flex items-center gap-4 sm:gap-6">
            <div className="p-3 bg-stone-100 rounded-2xl border border-stone-200/60">
              <Camera size={20} strokeWidth={1.5} className="text-stone-600" />
            </div>
            <div>
              <h3 className="text-lg font-serif font-extralight tracking-[0.2em] uppercase text-stone-950">Image Details</h3>
              <p className="text-xs tracking-[0.15em] uppercase text-stone-500 font-light">Professional Portrait</p>
            </div>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-stone-200/60 rounded-2xl transition-colors" aria-label="Close modal">
            <X size={20} className="text-stone-600" strokeWidth={1.5} />
          </button>
        </div>

        <div className="flex-1 flex items-center justify-center p-8 bg-stone-50">
          <img src={selectedImage.imageUrl || selectedImage.url || ''} alt={selectedImage.title || 'Gallery image'} className="max-w-full max-h-[60vh] object-contain rounded-2xl shadow-2xl" />
        </div>

        <div className="p-6 sm:p-8 border-t border-stone-200/40 bg-white">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <button onClick={onToggleFavorite} className="flex items-center justify-center gap-2 py-3 px-4 bg-stone-100 hover:bg-stone-200 rounded-2xl transition-colors text-xs tracking-[0.15em] uppercase font-light">
              <Heart size={16} className={isFavorite ? 'text-red-500 fill-current' : 'text-stone-600'} strokeWidth={1.5} />
              {isFavorite ? 'Unfavorite' : 'Favorite'}
            </button>
            {process.env.REACT_APP_BRAND_ASSETS_ENABLED === '1' && (
              <button onClick={onPlaceBrandAsset} className="flex items-center justify-center gap-2 py-3 px-4 bg-stone-100 hover:bg-stone-200 rounded-2xl transition-colors text-xs tracking-[0.15em] uppercase font-light text-stone-600">
                <Plus size={16} className="text-stone-600" strokeWidth={1.5} />
                Brand Asset
              </button>
            )}
            <button onClick={onDownload} className="flex items-center justify-center gap-2 py-3 px-4 bg-stone-100 hover:bg-stone-200 rounded-2xl transition-colors text-xs tracking-[0.15em] uppercase font-light text-stone-600">
              <Download size={16} className="text-stone-600" strokeWidth={1.5} />
              Download
            </button>
            <button onClick={onDelete} className="flex items-center justify-center gap-2 py-3 px-4 bg-red-50 hover:bg-red-100 rounded-2xl transition-colors text-xs tracking-[0.15em] uppercase font-light text-red-600">
              <Trash2 size={16} className="text-red-600" strokeWidth={1.5} />
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


// MayaGallery component for displaying saved images
import React, { useState } from 'react';
import type { ConceptCard } from '../../types/maya.js';

interface MayaGalleryProps {
  images: string[];
  onSave: (image: string) => Promise<void>;
}

export function MayaGallery({ images, onSave }: MayaGalleryProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [savingImages, setSavingImages] = useState<Set<string>>(new Set());

  const handleSaveImage = async (image: string) => {
    if (savingImages.has(image)) return;
    setSavingImages(new Set([...savingImages, image]));
    
    try {
      await onSave(image);
    } finally {
      setSavingImages(new Set([...savingImages].filter(img => img !== image)));
    }
  };

  return (
    <div className="mt-8">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {images.map((image, index) => (
          <div key={index} className="relative group">
            <img 
              src={image} 
              alt={`Generated concept ${index + 1}`}
              className="w-full h-48 object-cover cursor-pointer rounded-lg"
              onClick={() => setSelectedImage(image)}
            />
            <button
              onClick={() => handleSaveImage(image)}
              disabled={savingImages.has(image)}
              className="absolute right-2 bottom-2 p-2 bg-white/90 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
            >
              {savingImages.has(image) ? (
                <span className="loading loading-spinner loading-sm" />
              ) : (
                <span>💾</span>
              )}
            </button>
          </div>
        ))}
      </div>

      {/* Image Preview Modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
          onClick={() => setSelectedImage(null)}
        >
          <div 
            className="relative max-w-4xl mx-auto p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <img 
              src={selectedImage} 
              alt="Full size preview"
              className="max-h-[80vh] rounded-lg"
            />
            <button 
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center bg-white/10 hover:bg-white/20 text-white hover:text-white transition-colors"
              title="Close"
            >
              <span className="text-lg leading-none">×</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
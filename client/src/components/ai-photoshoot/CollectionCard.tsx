import React, { memo } from 'react';
import { PhotoshootCollection } from '@/types/photoshoot';

interface CollectionCardProps {
  collection: PhotoshootCollection;
  isSelected: boolean;
  onSelect: () => void;
}

export const CollectionCard = memo<CollectionCardProps>(({
  collection,
  isSelected,
  onSelect
}) => {
  return (
    <div
      onClick={onSelect}
      className={`relative group cursor-pointer transition-all duration-500 aspect-[3/4] overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.12)] ${
        isSelected 
          ? 'ring-2 ring-black transform scale-[1.02]' 
          : 'hover:scale-[1.03] hover:shadow-[0_20px_60px_rgb(0,0,0,0.25)]'
      }`}
      style={{
        background: 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)',
        backdropFilter: 'blur(10px)'
      }}
      role="button"
      tabIndex={0}
      aria-label={`Select ${collection.name} collection`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect();
        }
      }}
    >
      {/* LUXURY IMAGE CONTAINER */}
      <div className="relative w-full h-3/4 overflow-hidden">
        <img
          src={collection.preview}
          alt={`${collection.name} collection preview`}
          className="w-full h-full object-cover transition-all duration-700 group-hover:scale-105"
          style={{
            filter: 'contrast(1.1) saturate(1.05)',
          }}
          loading="lazy"
        />
        {/* LUXURY OVERLAY GRADIENT */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      </div>
      
      {/* LUXURY TYPOGRAPHY TREATMENT */}
      <div className="absolute bottom-0 left-0 right-0 p-6 bg-white/95 backdrop-blur-sm">
        <div className="text-center">
          <div className="font-serif text-sm font-light uppercase tracking-[0.3em] text-black mb-1">
            {collection.name}
          </div>
          {collection.subtitle && (
            <div className="text-xs tracking-[0.2em] opacity-70 font-light uppercase">
              {collection.subtitle}
            </div>
          )}
        </div>
      </div>
      
      <div className={`absolute inset-0 bg-black transition-opacity duration-300 ${
        isSelected ? 'bg-opacity-30' : 'bg-opacity-50 group-hover:bg-opacity-30'
      }`}>
        <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
          <div className="text-xs tracking-[0.2em] uppercase opacity-70 mb-1">
            {collection.prompts.length} Styles
          </div>
          <div className="font-serif text-lg font-light uppercase tracking-wide">
            {collection.name}
          </div>
          {collection.subtitle && (
            <div className="text-xs tracking-wide opacity-80 mt-1">
              {collection.subtitle}
            </div>
          )}
        </div>
      </div>
      
      {isSelected && (
        <div className="absolute top-4 right-4 w-3 h-3 bg-white rounded-full" aria-hidden="true"></div>
      )}
    </div>
  );
});

CollectionCard.displayName = 'CollectionCard';
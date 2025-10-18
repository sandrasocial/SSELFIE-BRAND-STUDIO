import React from 'react';
import ImageCard from './ImageCard.js';
import type { GalleryImage } from './ImageDetailModal.js';

export default function ImageGrid({
  images,
  favorites,
  selected,
  viewMode,
  onOpen,
  onToggleFavorite,
  onToggleSelect,
  onDownload,
  onDelete,
}: {
  images: GalleryImage[];
  favorites: number[];
  selected: Set<string | number>;
  viewMode: 'grid' | 'masonry';
  onOpen: (img: GalleryImage) => void;
  onToggleFavorite: (id: string | number) => void;
  onToggleSelect: (id: string | number) => void;
  onDownload: (img: GalleryImage) => void;
  onDelete: (id: string | number) => void;
}) {
  const gridClass = viewMode === 'masonry'
    ? 'columns-2 sm:columns-3 lg:columns-4 gap-4 sm:gap-6'
    : 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6';

  return (
    <div className={gridClass}>
      {images.map((img, idx) => {
        const id = img.id;
        const isFavorite = favorites.includes(typeof id === 'string' ? parseInt(id, 10) : id as number);
        const isSelected = selected.has(id);
        return (
          <ImageCard
            key={String(id)}
            image={img}
            index={idx}
            isFavorite={isFavorite}
            isSelected={isSelected}
            viewMode={viewMode}
            onOpen={onOpen}
            onToggleFavorite={onToggleFavorite}
            onToggleSelect={onToggleSelect}
            onDownload={onDownload}
            onDelete={onDelete}
          />
        );
      })}
    </div>
  );
}


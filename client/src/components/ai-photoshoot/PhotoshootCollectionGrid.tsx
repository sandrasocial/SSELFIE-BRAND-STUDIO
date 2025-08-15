import React, { memo } from 'react';
import { PhotoshootCollection } from './types/photoshoot';
import { CollectionCard } from './CollectionCard';

interface PhotoshootCollectionGridProps {
  collections: PhotoshootCollection[];
  selectedCollection: string | null;
  onSelectCollection: (collectionId: string) => void;
}

export const PhotoshootCollectionGrid = memo<PhotoshootCollectionGridProps>(({
  collections,
  selectedCollection,
  onSelectCollection
}) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
      {collections.map((collection) => (
        <CollectionCard
          key={collection.id}
          collection={collection}
          isSelected={selectedCollection === collection.id}
          onSelect={() => onSelectCollection(collection.id)}
        />
      ))}
    </div>
  );
});

PhotoshootCollectionGrid.displayName = 'PhotoshootCollectionGrid';
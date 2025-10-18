import React from 'react';
import { SortableContext, rectSortingStrategy } from '@dnd-kit/sortable';
import FeedCell from './FeedCell.js';
import type { GalleryImage } from './ImageDetailModal.js';

export default function FeedGrid({ slots, overId, onRemove }: { slots: (GalleryImage | null)[]; overId?: string | null; onRemove: (index: number) => void; }) {
  const ids = React.useMemo(() => slots.map((_, i) => `slot-${i}`), [slots.length]);
  return (
    <SortableContext items={ids} strategy={rectSortingStrategy}>
      <div className="grid grid-cols-3 gap-2 sm:gap-3 md:gap-4">
        {slots.map((img, i) => (
          <FeedCell key={i} id={`slot-${i}`} image={img} overId={overId} onRemove={() => onRemove(i)} />
        ))}
      </div>
    </SortableContext>
  );
}


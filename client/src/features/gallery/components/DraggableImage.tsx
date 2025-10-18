import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import type { GalleryImage } from './ImageDetailModal.js';

export default function DraggableImage({ image }: { image: GalleryImage }) {
  const id = `image-${image.id}`;
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id, data: { type: 'image', image } });
  const style: React.CSSProperties = transform ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` } : undefined;

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} className={`w-24 h-24 rounded-xl overflow-hidden border ${isDragging ? 'border-stone-950' : 'border-stone-200/60'} bg-white shadow-sm`}>
      <img src={image.imageUrl || image.url || ''} alt={image.title || 'Gallery image'} className="w-full h-full object-cover" />
    </div>
  );
}


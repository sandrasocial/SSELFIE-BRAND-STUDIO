import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { X } from 'lucide-react';
import type { GalleryImage } from './ImageDetailModal.js';

export default function FeedCell({ id, image, overId, onRemove }: { id: string; image: GalleryImage | null; overId?: string | null; onRemove: () => void; }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
  };
  const isOver = overId === id;

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}
      className={`relative aspect-square rounded-2xl border-2 overflow-hidden group transition-all ${
        isOver ? 'border-stone-950 scale-[1.03]' : 'border-stone-200/60'
      } ${isDragging ? 'opacity-70' : ''}`}
    >
      {image ? (
        <>
          <img src={image.imageUrl || image.url || ''} alt={image.title || 'Feed image'} className="w-full h-full object-cover" />
          <button onClick={(e) => { e.stopPropagation(); onRemove(); }} className="absolute top-2 right-2 p-2 rounded-xl bg-white/80 border border-stone-200/60 opacity-0 group-hover:opacity-100 transition-all">
            <X size={14} className="text-stone-950" />
          </button>
        </>
      ) : (
        <div className="w-full h-full bg-white/60 backdrop-blur-xl flex items-center justify-center text-stone-400 text-xs tracking-[0.2em] uppercase">Drop here</div>
      )}
    </div>
  );
}


import React, { useEffect, useMemo, useState } from 'react';
import { DndContext, DragOverlay, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '../../../lib/api.js';
import { useAuth } from '../../../hooks/use-auth.js';
import type { GalleryImage } from './ImageDetailModal.js';
import FeedHeader from './FeedHeader.js';
import FeedGrid from './FeedGrid.js';
import DraggableImage from './DraggableImage.js';

// Local type to avoid bundling cross-package types
type FeedLayoutSlot = { position: number; imageId: number | string | null };

export default function FeedDesignerTab({ images }: { images: GalleryImage[] }) {
  const [feedSlots, setFeedSlots] = useState<(GalleryImage | null)[]>(() => Array(9).fill(null));
  const [activeImage, setActiveImage] = useState<GalleryImage | null>(null);
  const [overId, setOverId] = useState<string | null>(null);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));
  const slotIds = useMemo(() => feedSlots.map((_, i) => `slot-${i}`), [feedSlots.length]);
  const { isAuthenticated } = useAuth();
  const qc = useQueryClient();

  function getSlotIndex(id: string): number | null {
    const m = id.match(/^slot\-(\d+)$/);
    return m ? parseInt(m[1], 10) : null;
  }

  // Load saved layout
  const { data: savedLayout } = useQuery({
    queryKey: ['/api/gallery/feed-layout'],
    enabled: isAuthenticated,
    refetchOnWindowFocus: false,
    queryFn: async () => apiFetch('/gallery/feed-layout')
  });

  useEffect(() => {
    if (!savedLayout?.layout) return;
    const restored = Array<GalleryImage | null>(9).fill(null);
    for (const slot of savedLayout.layout as FeedLayoutSlot[]) {
      const idx = typeof slot.position === 'number' ? slot.position : parseInt(String(slot.position), 10);
      if (idx >= 0 && idx < restored.length) {
        const match = images.find(img => String(img.id) === String(slot.imageId));
        if (match) restored[idx] = match;
      }
    }
    setFeedSlots(restored);
  }, [savedLayout, images]);

  const saveMutation = useMutation({
    mutationFn: async (layout: FeedLayoutSlot[]) => apiFetch('/gallery/feed-layout', { method: 'POST', json: { layout } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['/api/gallery/feed-layout'] })
  });

  const handleSave = () => {
    const layout: FeedLayoutSlot[] = feedSlots.map((img, position) => ({ position, imageId: img?.id ?? null }));
    saveMutation.mutate(layout);
  };

  const handleDragStart = (event: any) => {
    const { active } = event;
    if (active?.data?.current?.type === 'image') {
      setActiveImage(active.data.current.image as GalleryImage);
    } else if (typeof active?.id === 'string' && active.id.startsWith('slot-')) {
      const idx = getSlotIndex(active.id);
      if (idx !== null && feedSlots[idx]) setActiveImage(feedSlots[idx]);
    }
  };

  const handleDragOver = (event: any) => {
    const { over } = event;
    setOverId(over?.id ?? null);
  };

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    setOverId(null);

    if (!over) {
      setActiveImage(null);
      return;
    }

    const overIdx = typeof over.id === 'string' ? getSlotIndex(over.id) : null;
    if (overIdx === null) {
      setActiveImage(null);
      return;
    }

    // Drag from Gallery (image-*) into a slot
    if (typeof active.id === 'string' && active.id.startsWith('image-')) {
      const image: GalleryImage | undefined = active?.data?.current?.image;
      if (image) {
        setFeedSlots(prev => {
          const next = [...prev];
          next[overIdx] = image;
          return next;
        });
      }
      setActiveImage(null);
      return;
    }

    // Reordering between slots
    if (typeof active.id === 'string' && active.id.startsWith('slot-')) {
      const fromIdx = getSlotIndex(active.id);
      if (fromIdx !== null && fromIdx !== overIdx) {
        setFeedSlots(prev => {
          const next = [...prev];
          const tmp = next[fromIdx];
          next[fromIdx] = next[overIdx];
          next[overIdx] = tmp;
          return next;
        });
      }
      setActiveImage(null);
      return;
    }

    setActiveImage(null);
  };

  const removeAt = (index: number) => setFeedSlots(prev => { const next = [...prev]; next[index] = null; return next; });

  return (
    <div className="space-y-8 py-8 sm:py-12">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs tracking-[0.3em] uppercase text-stone-500 font-light mb-4">Instagram Planning</div>
          <h2 className="text-4xl sm:text-5xl font-serif font-extralight tracking-[0.25em] text-stone-950 uppercase">Feed Designer</h2>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={handleSave} disabled={saveMutation.isPending} className="px-5 py-2.5 bg-stone-950 text-white rounded-2xl hover:bg-stone-800 transition-all disabled:opacity-50">
            {saveMutation.isPending ? 'Saving…' : 'Save Layout'}
          </button>
          {saveMutation.isSuccess && !saveMutation.isPending && (
            <span className="text-xs tracking-[0.15em] uppercase text-stone-600">Saved</span>
          )}
          {saveMutation.isError && (
            <span className="text-xs tracking-[0.15em] uppercase text-red-600">Error</span>
          )}
        </div>
      </div>

      <FeedHeader />

      {/* Available Photos tray */}
      <div className="bg-white/60 backdrop-blur-2xl border border-stone-200/70 rounded-3xl p-4 sm:p-6">
        <div className="text-xs tracking-[0.2em] uppercase text-stone-500 font-light mb-3">Available Photos</div>
        <div className="flex gap-3 overflow-x-auto pb-1">
          {images.slice(0, 20).map((img) => (
            <DraggableImage key={String(img.id)} image={img} />
          ))}
        </div>
      </div>

      {/* DnD Context + Grid */}
      <DndContext sensors={sensors} onDragStart={handleDragStart} onDragOver={handleDragOver} onDragEnd={handleDragEnd}>
        <FeedGrid slots={feedSlots} overId={overId} onRemove={removeAt} />

        <DragOverlay>
          {activeImage ? (
            <div className="w-32 h-32 rounded-xl overflow-hidden border border-stone-200/60 shadow-2xl">
              <img src={activeImage.imageUrl || activeImage.url || ''} alt={activeImage.title || 'Drag preview'} className="w-full h-full object-cover" />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}

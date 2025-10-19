import React, { useState } from 'react';
import { useAuth } from '../../../hooks/use-auth.js';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '../../../lib/queryClient.js';
import { apiFetch } from '../../../lib/api.js';
import GalleryTab from './GalleryTab.js';
import ImageDetailModal, { type GalleryImage } from './ImageDetailModal.js';
import FeedDesignerTab from './FeedDesignerTab.js';

export default function GalleryScreen() {
  const { user, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState<'gallery' | 'feed'>('gallery');
  const [viewMode, setViewMode] = useState<'grid' | 'masonry'>('grid');
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);
  const qc = useQueryClient();

  const { data: aiImagesData } = useQuery({
    queryKey: ['/api/gallery-images'],
    enabled: isAuthenticated && !!user,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    queryFn: async () => {
      const data = await apiFetch('/gallery-images');
      return Array.isArray(data) ? data : (data?.images || []);
    }
  });
  const images: GalleryImage[] = Array.isArray(aiImagesData) ? aiImagesData : [];

  const { data: favoritesData } = useQuery({
    queryKey: ['/api/images/favorites'],
    enabled: isAuthenticated && !!user,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    queryFn: async () => apiFetch('/images/favorites'),
  });
  const favorites: number[] = Array.isArray((favoritesData as any)?.favorites) ? (favoritesData as any).favorites : [];

  const toggleFavoriteMutation = useMutation({
    mutationFn: async (imageId: number) => apiRequest(`/api/images/${imageId}/favorite`, 'POST'),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['/api/images/favorites'] })
  });
  const deleteImageMutation = useMutation({
    mutationFn: async (imageId: number) => apiRequest(`/api/ai-images/${imageId}`, 'DELETE'),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['/api/gallery-images'] });
      qc.invalidateQueries({ queryKey: ['/api/images/favorites'] });
      setSelectedImage(null);
    }
  });

  const toggleFavorite = (id: string | number) => {
    const numericId = typeof id === 'string' ? parseInt(id, 10) : id;
    toggleFavoriteMutation.mutate(numericId);
  };
  const deleteImage = (id: string | number) => {
    if (window.confirm('Are you sure you want to delete this photo?')) {
      const numericId = typeof id === 'string' ? parseInt(id, 10) : id;
      deleteImageMutation.mutate(numericId);
    }
  };

  const onOpenModal = (img: GalleryImage) => setSelectedImage(img);
  const onCloseModal = () => setSelectedImage(null);
  const onDownload = () => {
    if (!selectedImage) return;
    const link = document.createElement('a') as HTMLAnchorElement;
    link.href = selectedImage.imageUrl || selectedImage.url || '';
    link.download = selectedImage.title || 'sselfie-image';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="px-6 sm:px-8" style={{ paddingTop: '100px' }}>
      {/* Tabs */}
      <div className="mb-6">
        <div className="flex gap-6 border-b border-stone-200/70 bg-white/60 backdrop-blur-2xl rounded-t-2xl px-4 pt-4">
          <button onClick={() => setActiveTab('gallery')} className={`pb-3 text-sm tracking-[0.2em] uppercase font-light ${activeTab==='gallery'?'text-stone-950 border-b-2 border-stone-950':'text-stone-500 hover:text-stone-700'}`}>Gallery</button>
          <button onClick={() => setActiveTab('feed')} className={`pb-3 text-sm tracking-[0.2em] uppercase font-light ${activeTab==='feed'?'text-stone-950 border-b-2 border-stone-950':'text-stone-500 hover:text-stone-700'}`}>Feed Designer</button>
        </div>
      </div>

      {/* Tab content */}
      {activeTab === 'gallery' ? (
        <GalleryTab
          images={images}
          favorites={favorites}
          viewMode={viewMode}
          onChangeViewMode={setViewMode}
          onToggleFavorite={toggleFavorite}
          onDelete={deleteImage}
          onOpenModal={onOpenModal}
        />
      ) : (
        <FeedDesignerTab images={images} />
      )}

      {/* Modal */}
      {selectedImage && (
        <ImageDetailModal
          selectedImage={selectedImage}
          onClose={onCloseModal}
          onToggleFavorite={() => toggleFavorite(selectedImage.id)}
          onDownload={onDownload}
          onDelete={() => deleteImage(selectedImage.id)}
          onPlaceBrandAsset={() => { /* placeholder for brand asset placement */ }}
          isFavorite={favorites.includes(typeof selectedImage.id === 'string' ? parseInt(selectedImage.id, 10) : selectedImage.id)}
        />
      )}
    </div>
  );
}


import React, { useState } from 'react';
import { useAuth } from '../hooks/use-auth';
import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '../lib/api';
import { Camera, Search, MoreHorizontal, Heart, Eye, Download, Trash2 } from 'lucide-react';

// Gallery Image Interface
interface GalleryImage {
  id: string | number;
  imageUrl?: string;
  url?: string;
  title?: string;
  source?: string;
}

// Simple Gallery Screen matching demo aesthetic
export function GalleryScreen() {
  const { user, isAuthenticated } = useAuth();
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);

  // Fetch user's gallery images with proper error handling
  const { data: aiImagesData, isLoading, error } = useQuery<GalleryImage[]>({
    queryKey: ['/api/gallery-images'],
    enabled: isAuthenticated && !!user,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 1,
    queryFn: async () => {
      try {
        const data = await apiFetch('/gallery-images');
        return Array.isArray(data) ? data : (data?.images || []);
      } catch (error) {
        console.warn('Gallery API not available, showing empty state');
        return [];
      }
    }
  });

  // Fetch user's favorites with proper error handling
  const { data: favoritesData } = useQuery<{ favorites: number[] }>({
    queryKey: ['/api/images/favorites'],
    enabled: isAuthenticated && !!user,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 1,
    queryFn: async () => {
      try {
        const response = await fetch('/api/images/favorites', { credentials: 'include' });
        if (!response.ok) throw new Error('Favorites not available');
        return response.json();
      } catch (error) {
        console.warn('Favorites API not available');
        return { favorites: [] };
      }
    }
  });

  const aiImages = Array.isArray(aiImagesData) ? aiImagesData : [];
  const favorites: number[] = favoritesData?.favorites || [];

  const toggleFavorite = async (imageId: string | number) => {
    const numericId = typeof imageId === 'string' ? parseInt(imageId, 10) : imageId;
    try {
      await fetch(`/api/images/${numericId}/favorite`, {
        method: 'POST',
        credentials: 'include'
      });
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const downloadImage = (imageUrl: string, filename?: string) => {
    try {
      const link = document.createElement('a');
      link.href = imageUrl;
      link.download = filename || 'sselfie-image';
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error downloading image:', error);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="text-center py-20">
        <Camera size={48} className="text-neutral-600 mx-auto mb-4" strokeWidth={1.5} />
        <h2 className="text-xl font-light text-neutral-200 mb-2">Authentication Required</h2>
        <p className="text-neutral-400 text-sm">Please sign in to access your gallery.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Editorial gallery header - Following Styleguide */}
      <div className="flex justify-between items-start pt-4">
        <div className="space-y-3">
          <h2 className="text-3xl font-serif font-extralight tracking-[0.3em] text-white uppercase">Gallery</h2>
          <p className="text-zinc-500 text-sm tracking-[0.2em] uppercase font-light">Curated Collection</p>
        </div>
        <div className="flex space-x-3">
          <button className="p-3 bg-zinc-800/30 rounded-xl border border-zinc-700/20 hover:bg-zinc-700/50 transition-all duration-300 hover:scale-105">
            <Search size={18} className="text-zinc-400 hover:text-white transition-colors" strokeWidth={1.2} />
          </button>
          <button className="p-3 bg-zinc-800/30 rounded-xl border border-zinc-700/20 hover:bg-zinc-700/50 transition-all duration-300 hover:scale-105">
            <MoreHorizontal size={18} className="text-zinc-400 hover:text-white transition-colors" strokeWidth={1.2} />
          </button>
        </div>
      </div>

      {/* Gallery grid with editorial hover effects - Following Styleguide */}
      {isLoading ? (
        <div className="grid grid-cols-2 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="aspect-square bg-zinc-800/30 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : aiImages.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-16 h-16 bg-zinc-800/30 rounded-full mx-auto mb-6 flex items-center justify-center">
            <Camera size={24} className="text-zinc-500" />
          </div>
          <h3 className="text-lg font-serif font-extralight tracking-[0.2em] text-white uppercase mb-2">Your Gallery Awaits</h3>
          <p className="text-zinc-500 text-sm tracking-[0.1em] uppercase font-light mb-6">Start creating stunning photos with Maya to build your personal brand gallery</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {aiImages.map((image, index) => {
            const isFavorite = favorites.includes(typeof image.id === 'string' ? parseInt(image.id, 10) : image.id);
            
            return (
              <div key={image.id} className="relative group cursor-pointer overflow-hidden rounded-lg">
                <div className="aspect-square relative">
                  <img 
                    src={image.imageUrl || image.url || ''} 
                    alt={image.title || `Gallery ${index + 1}`}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    onClick={() => setSelectedImage(image)}
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-500"></div>
                  
                  {/* Sophisticated overlay - Following Styleguide */}
                  <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500">
                    <div className="flex justify-between items-center">
                      <span className="text-white text-xs tracking-[0.2em] uppercase font-light">IMG_{String(index + 1).padStart(3, '0')}</span>
                      <div className="flex space-x-2">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFavorite(image.id);
                          }}
                          className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-colors duration-300"
                        >
                          <Heart 
                            size={14} 
                            className={isFavorite ? 'text-red-400 fill-current' : 'text-white'} 
                            strokeWidth={1.2} 
                          />
                        </button>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedImage(image);
                          }}
                          className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-colors duration-300"
                        >
                          <Eye size={14} className="text-white" strokeWidth={1.2} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Editorial load more - Following Styleguide */}
      {aiImages.length > 0 && (
        <div className="text-center pt-8">
          <button className="text-zinc-400 text-xs tracking-[0.3em] uppercase hover:text-white transition-colors duration-300 font-light border-b border-zinc-700/20 hover:border-white/20 pb-1">
            Load More
          </button>
        </div>
      )}

      {/* Image Detail Modal - Following Styleguide */}
      {selectedImage && (
        <div 
          className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div 
            className="bg-neutral-950/95 backdrop-blur-2xl rounded-2xl border border-neutral-800/30 max-w-4xl max-h-[90vh] w-full flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-neutral-800/30">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-neutral-800/40 rounded-lg border border-neutral-700/30">
                  <Camera size={20} className="text-neutral-300" strokeWidth={1.5} />
                </div>
                <div>
                  <h3 className="text-xl font-light text-neutral-200 tracking-wide">Image Details</h3>
                  <p className="text-xs text-neutral-500 tracking-wide">Professional Portrait</p>
                </div>
              </div>
              
              <button
                onClick={() => setSelectedImage(null)}
                className="p-2 hover:bg-neutral-800/40 rounded-lg transition-colors"
                aria-label="Close modal"
              >
                <MoreHorizontal size={20} className="text-neutral-400" strokeWidth={1.5} />
              </button>
            </div>
            
            {/* Image */}
            <div className="flex-1 flex items-center justify-center p-8 bg-gradient-to-br from-neutral-900/50 to-neutral-800/30">
              <img 
                src={selectedImage.imageUrl || selectedImage.url || ''} 
                alt={selectedImage.title || 'Gallery image'} 
                className="max-w-full max-h-[60vh] object-contain rounded-lg shadow-2xl"
              />
            </div>
            
            {/* Actions */}
            <div className="p-6 border-t border-neutral-800/30 bg-gradient-to-r from-neutral-900/50 to-neutral-800/30">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <button 
                  onClick={() => {
                    toggleFavorite(selectedImage.id);
                  }}
                  className="flex items-center justify-center gap-2 py-3 px-4 bg-neutral-800/40 rounded-lg border border-neutral-700/30 hover:bg-neutral-800/60 transition-colors"
                >
                  <Heart size={16} className="text-neutral-400" strokeWidth={1.5} />
                  FAVORITE
                </button>
                
                <button 
                  onClick={() => {
                    const src = selectedImage.imageUrl || selectedImage.url || '';
                    downloadImage(src, selectedImage.title || 'sselfie-image');
                  }}
                  className="flex items-center justify-center gap-2 py-3 px-4 bg-neutral-800/40 rounded-lg border border-neutral-700/30 hover:bg-neutral-800/60 transition-colors"
                >
                  <Download size={16} className="text-neutral-400" strokeWidth={1.5} />
                  DOWNLOAD
                </button>
                
                <button 
                  onClick={() => {
                    if (window.confirm('Are you sure you want to delete this photo?')) {
                      // Handle delete
                      setSelectedImage(null);
                    }
                  }}
                  className="flex items-center justify-center gap-2 py-3 px-4 bg-red-900/20 rounded-lg border border-red-500/30 hover:bg-red-900/30 transition-colors"
                >
                  <Trash2 size={16} className="text-red-400" strokeWidth={1.5} />
                  DELETE
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
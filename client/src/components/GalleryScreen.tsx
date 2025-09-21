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

  // Fetch user's gallery images
  const { data: aiImagesData, isLoading } = useQuery<GalleryImage[]>({
    queryKey: ['/api/gallery-images'],
    enabled: isAuthenticated && !!user,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    queryFn: async () => {
      const data = await apiFetch('/gallery-images');
      return Array.isArray(data) ? data : (data?.images || []);
    }
  });

  // Fetch user's favorites
  const { data: favoritesData } = useQuery<{ favorites: number[] }>({
    queryKey: ['/api/images/favorites'],
    enabled: isAuthenticated && !!user,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
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
      {/* Gallery header matching demo */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-light text-neutral-200 tracking-wide">GALLERY</h2>
          <p className="text-neutral-500 text-sm tracking-wide mt-1">Curated Collection</p>
        </div>
        <div className="flex space-x-3">
          <button className="p-3 bg-neutral-800/40 rounded-lg border border-neutral-700/30">
            <Search size={18} className="text-neutral-400" strokeWidth={1.5} />
          </button>
          <button className="p-3 bg-neutral-800/40 rounded-lg border border-neutral-700/30">
            <MoreHorizontal size={18} className="text-neutral-400" strokeWidth={1.5} />
          </button>
        </div>
      </div>

      {/* Gallery grid - editorial layout matching demo */}
      <div className="grid grid-cols-2 gap-3">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="aspect-square bg-neutral-800/30 rounded-lg animate-pulse" />
          ))
        ) : aiImages.length === 0 ? (
          <div className="col-span-2 text-center py-16">
            <Camera size={48} className="text-neutral-600 mx-auto mb-4" strokeWidth={1.5} />
            <h3 className="text-lg font-light text-neutral-300 mb-2">NO PHOTOS YET</h3>
            <p className="text-neutral-500 text-sm mb-6">Start creating professional portraits with Maya</p>
          </div>
        ) : (
          aiImages.map((image, index) => {
            const isFavorite = favorites.includes(typeof image.id === 'string' ? parseInt(image.id, 10) : image.id);
            
            return (
              <div key={image.id} className="relative group cursor-pointer">
                <div className="aspect-square relative overflow-hidden rounded-lg">
                  <img 
                    src={image.imageUrl || image.url || ''} 
                    alt={image.title || `Gallery ${index + 1}`}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    onClick={() => setSelectedImage(image)}
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300"></div>
                  
                  {/* Minimal overlay matching demo */}
                  <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="flex justify-between items-center">
                      <span className="text-white text-xs tracking-wide">IMG_{String(index + 1).padStart(3, '0')}</span>
                      <div className="flex space-x-2">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFavorite(image.id);
                          }}
                          className="p-1.5 bg-white/20 backdrop-blur-sm rounded transition-colors hover:bg-white/30"
                        >
                          <Heart 
                            size={14} 
                            className={isFavorite ? 'text-red-400 fill-current' : 'text-white'} 
                            strokeWidth={1.5} 
                          />
                        </button>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedImage(image);
                          }}
                          className="p-1.5 bg-white/20 backdrop-blur-sm rounded transition-colors hover:bg-white/30"
                        >
                          <Eye size={14} className="text-white" strokeWidth={1.5} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Load more - minimal matching demo */}
      {aiImages.length > 0 && (
        <div className="text-center pt-4">
          <button className="text-neutral-400 text-sm tracking-wide hover:text-neutral-300 transition-colors">
            LOAD MORE
          </button>
        </div>
      )}

      {/* Simple Image Detail Modal */}
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
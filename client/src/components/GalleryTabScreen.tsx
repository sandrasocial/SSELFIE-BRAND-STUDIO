import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../hooks/use-auth.js';
import { useToast } from '../hooks/use-toast.js';
import { useLocation } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from './ui/button.js';
import { Card } from './ui/card.js';
import { Input } from './ui/input.js';
import { apiRequest } from '../lib/queryClient.js';
import ErrorBoundary from './ErrorBoundary.js';
import StoryStudioModal from './StoryStudioModal.js';
import VideoGenerateDialog from '../features/video/VideoGenerateDialog.js';
import BrandAssetPlacementModal from './BrandAssetPlacementModal.js';
import { 
  Search, 
  Heart, 
  Grid, 
  List,
  Plus,
  X,
  Eye,
  Play,
  Download,
  Trash2,
  Camera
} from 'lucide-react';

// GALLERY TAB SCREEN - Mobile-Optimized Version
// Preserves all logic from sselfie-gallery.tsx but optimized for tab experience
// Uses same backend API calls and functionality

interface GalleryImage {
  id: string | number;
  imageUrl?: string;
  url?: string;
  title?: string;
  prompt?: string;
  style?: string;
  createdAt?: string;
  source?: string;
}

function ImageDetailModal({ 
  selectedImage, 
  onClose, 
  onToggleFavorite, 
  onDownload, 
  onDelete, 
  onCreateVideo,
  onPlaceBrandAsset,
  isFavorite 
}: {
  selectedImage: GalleryImage;
  onClose: () => void;
  onToggleFavorite: () => void;
  onDownload: () => void;
  onDelete: () => void;
  onCreateVideo: () => void;
  onPlaceBrandAsset: () => void;
  isFavorite: boolean;
}) {
  return (
    <div 
      className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div 
        className="max-w-sm w-full flex flex-col bg-neutral-950/95 backdrop-blur-2xl rounded-xl border border-neutral-800/40"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-neutral-800/40">
          <h3 className="text-sm font-medium text-white tracking-wide">PHOTO OPTIONS</h3>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-neutral-800/40 rounded-lg transition-colors"
          >
            <X size={16} className="text-neutral-400" />
          </button>
        </div>

        {/* Image Preview */}
        <div className="p-4">
          <div className="aspect-square w-full bg-neutral-900 rounded-lg overflow-hidden mb-4">
            <img 
              src={selectedImage.imageUrl || selectedImage.url} 
              alt={selectedImage.title || 'Gallery image'}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <button 
              onClick={onToggleFavorite}
              className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg transition-all ${
                isFavorite 
                  ? 'bg-red-500/20 text-red-400 border border-red-500/30' 
                  : 'bg-neutral-800/40 text-neutral-300 border border-neutral-700/30 hover:bg-neutral-700/40'
              }`}
            >
              <Heart size={16} className={isFavorite ? 'fill-current' : ''} strokeWidth={1.5} />
              {isFavorite ? 'REMOVE FAVORITE' : 'ADD TO FAVORITES'}
            </button>

            <button 
              onClick={onCreateVideo}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-neutral-800/40 text-neutral-300 border border-neutral-700/30 hover:bg-neutral-700/40 rounded-lg transition-colors"
            >
              <Play size={16} className="text-neutral-400" strokeWidth={1.5} />
              CREATE VIDEO
            </button>

            {process.env.REACT_APP_BRAND_ASSETS_ENABLED === '1' && (
              <button 
                onClick={onPlaceBrandAsset}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-neutral-800/40 text-neutral-300 border border-neutral-700/30 hover:bg-neutral-700/40 rounded-lg transition-colors"
              >
                <Plus size={16} className="text-neutral-400" strokeWidth={1.5} />
                BRAND ASSET
              </button>
            )}
            
            <button 
              onClick={onDownload}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-neutral-800/40 text-neutral-300 border border-neutral-700/30 hover:bg-neutral-700/40 rounded-lg transition-colors"
            >
              <Download size={16} className="text-neutral-400" strokeWidth={1.5} />
              DOWNLOAD
            </button>
            
            <button 
              onClick={onDelete}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-red-900/20 text-red-400 border border-red-500/30 hover:bg-red-900/30 rounded-lg transition-colors"
            >
              <Trash2 size={16} className="text-red-400" strokeWidth={1.5} />
              DELETE
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function GalleryTabScreen() {
  const { user, isAuthenticated } = useAuth();
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [isVideoDialogOpen, setIsVideoDialogOpen] = useState(false);
  const [isBrandPlacementModalOpen, setIsBrandPlacementModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterBy, setFilterBy] = useState<'all' | 'favorites' | 'recent'>('all');
  const queryClient = useQueryClient();

  // Helper function for API calls
  const apiFetch = async (endpoint: string) => {
    const response = await apiRequest(endpoint);
    return response;
  };

  // Same API calls as original sselfie-gallery.tsx
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

  const aiImages = Array.isArray(aiImagesData) ? aiImagesData : [];

  const { data: favoritesData } = useQuery<{ favorites: number[] }>({
    queryKey: ['/api/images/favorites'],
    enabled: isAuthenticated && !!user,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const favorites: number[] = favoritesData?.favorites || [];

  // Filter images (same logic as original)
  const filteredImages = React.useMemo(() => {
    let filtered = aiImages;

    if (searchQuery) {
      filtered = filtered.filter(image => 
        (image.title || '').toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (filterBy === 'favorites') {
      filtered = filtered.filter(image => 
        favorites.includes(typeof image.id === 'string' ? parseInt(image.id, 10) : image.id)
      );
    } else if (filterBy === 'recent') {
      filtered = filtered.slice(0, 10);
    }

    return filtered.reverse(); // newest first
  }, [aiImages, searchQuery, filterBy, favorites]);

  // Same mutation functions as original
  const toggleFavoriteMutation = useMutation({
    mutationFn: async ({ imageId, isFavorite }: { imageId: number; isFavorite: boolean }) => {
      return apiRequest(isFavorite ? '/images/unfavorite' : '/images/favorite', 'POST', { imageId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/images/favorites'] });
    },
  });

  const deleteImageMutation = useMutation({
    mutationFn: async (imageId: string | number) => {
      return apiRequest(`/images/${imageId}`, 'DELETE');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/gallery-images'] });
      queryClient.invalidateQueries({ queryKey: ['/api/images/favorites'] });
    },
  });

  // Helper functions (same as original)
  const downloadImage = (imageUrl: string, filename: string) => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImageClick = (image: GalleryImage) => {
    setSelectedImage(image);
  };

  const handleCloseModal = () => {
    setSelectedImage(null);
  };

  const handleToggleFavorite = () => {
    if (!selectedImage) return;
    const imageId = typeof selectedImage.id === 'string' ? parseInt(selectedImage.id, 10) : selectedImage.id;
    const isFavorite = favorites.includes(imageId);
    toggleFavoriteMutation.mutate({ imageId, isFavorite });
  };

  const handleDownload = () => {
    if (!selectedImage) return;
    downloadImage(selectedImage.imageUrl || selectedImage.url || '', selectedImage.title || 'sselfie-image');
    setSelectedImage(null);
  };

  const handleDelete = () => {
    if (!selectedImage) return;
    if (window.confirm('Are you sure you want to delete this photo?')) {
      deleteImageMutation.mutate(selectedImage.id);
      setSelectedImage(null);
    }
  };

  const handleCreateVideo = () => {
    setIsVideoDialogOpen(true);
  };

  const handlePlaceBrandAsset = () => {
    setIsBrandPlacementModalOpen(true);
  };

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center">
        <div className="p-6 bg-neutral-800/40 rounded-xl border border-neutral-700/30 mb-6">
          <Camera size={48} className="text-neutral-400 mx-auto" strokeWidth={1.5} />
        </div>
        <h2 className="text-xl font-semibold text-white mb-2">Sign In Required</h2>
        <p className="text-neutral-400">Please sign in to view your gallery.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin w-8 h-8 border-4 border-white border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-black">
      {/* Mobile-Optimized Header */}
      <div className="flex-shrink-0 p-4 border-b border-neutral-800/40">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-white">Gallery</h2>
            <p className="text-xs text-neutral-400">{filteredImages.length} photos</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setFilterBy(filterBy === 'favorites' ? 'all' : 'favorites')}
              className={`p-2 rounded-lg transition-colors ${
                filterBy === 'favorites' 
                  ? 'bg-red-500/20 text-red-400' 
                  : 'bg-neutral-800/40 text-neutral-400 hover:bg-neutral-700/40'
              }`}
            >
              <Heart size={16} className={filterBy === 'favorites' ? 'fill-current' : ''} />
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            placeholder="Search photos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-neutral-900/60 border border-neutral-700/40 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:border-neutral-500"
          />
        </div>
      </div>

      {/* Gallery Grid */}
      <div className="flex-1 overflow-y-auto p-4">
        {filteredImages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="p-6 bg-neutral-800/40 rounded-xl border border-neutral-700/30 mb-4">
              <Grid size={48} className="text-neutral-400 mx-auto" strokeWidth={1.5} />
            </div>
            <h3 className="text-lg font-medium text-white mb-2">No Photos Yet</h3>
            <p className="text-neutral-400 mb-4">Start creating with SSELFIE Studio</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {filteredImages.map((image) => {
              const isFavorite = favorites.includes(typeof image.id === 'string' ? parseInt(image.id, 10) : image.id);
              
              return (
                <div 
                  key={image.id}
                  className="relative aspect-square bg-neutral-900 rounded-lg overflow-hidden cursor-pointer group"
                  onClick={() => handleImageClick(image)}
                >
                  <img 
                    src={image.imageUrl || image.url} 
                    alt={image.title || 'Gallery image'}
                    className="w-full h-full object-cover transition-transform group-hover:scale-105"
                    loading="lazy"
                  />
                  
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-200">
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Eye size={24} className="text-white" strokeWidth={1.5} />
                    </div>
                  </div>

                  {/* Favorite indicator */}
                  {isFavorite && (
                    <div className="absolute top-2 right-2">
                      <Heart size={16} className="text-red-400 fill-current" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modals (same as original) */}
      {selectedImage && !isVideoModalOpen && !isVideoDialogOpen && (
        <ImageDetailModal
          selectedImage={selectedImage}
          onClose={handleCloseModal}
          onToggleFavorite={handleToggleFavorite}
          onDownload={handleDownload}
          onDelete={handleDelete}
          onCreateVideo={handleCreateVideo}
          onPlaceBrandAsset={handlePlaceBrandAsset}
          isFavorite={favorites.includes(typeof selectedImage.id === 'string' ? parseInt(selectedImage.id, 10) : selectedImage.id)}
        />
      )}

      {isVideoModalOpen && selectedImage && (
        <StoryStudioModal
          imageId={selectedImage.id.toString()}
          imageUrl={selectedImage.imageUrl}
          imageSource={selectedImage.source}
          onClose={() => setIsVideoModalOpen(false)}
          onSuccess={() => {
            console.log('✅ Video generation started for image:', selectedImage.id);
            queryClient.invalidateQueries({ queryKey: ['/api/gallery-images'] });
          }}
        />
      )}

      {isVideoDialogOpen && selectedImage && (
        <VideoGenerateDialog
          isOpen={isVideoDialogOpen}
          onClose={() => {
            setIsVideoDialogOpen(false);
            setSelectedImage(null);
          }}
          imageId={selectedImage.id.toString()}
          imageUrl={selectedImage.imageUrl || selectedImage.url || ''}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ['/api/gallery-images'] });
          }}
        />
      )}

      {isBrandPlacementModalOpen && selectedImage && (
        <BrandAssetPlacementModal
          isOpen={isBrandPlacementModalOpen}
          onClose={() => {
            setIsBrandPlacementModalOpen(false);
            setSelectedImage(null);
          }}
          imageId={typeof selectedImage.id === 'string' ? parseInt(selectedImage.id, 10) : selectedImage.id}
          imageUrl={selectedImage.imageUrl || selectedImage.url || ''}
          imageTitle={selectedImage.title}
        />
      )}
    </div>
  );
}

export default function GalleryTabScreenWithErrorBoundary() {
  return (
    <ErrorBoundary>
      <GalleryTabScreen />
    </ErrorBoundary>
  );
}
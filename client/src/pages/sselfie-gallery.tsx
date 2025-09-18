import React, { useState } from 'react';
import { useAuth } from '../hooks/use-auth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MemberNavigation } from '../components/member-navigation';
import { apiRequest } from '../lib/queryClient';
import { apiFetch } from '../lib/api';
import ErrorBoundary from '../components/ErrorBoundary';
import StoryStudioModal from '../components/StoryStudioModal';
import ImageInpaint from '../features/editor/ImageInpaint';
import ImageVariationsModal from '../components/ImageVariationsModal';

// ImageDetailModal Component
interface GalleryImage {
  id: string | number;
  imageUrl?: string;
  url?: string;
  title?: string;
  source?: string;
}

function ImageDetailModal({ 
  selectedImage, 
  onClose, 
  onToggleFavorite, 
  onDownload, 
  onDelete, 
  onCreateVideo,
  onInpaint,
  onMoreLikeThis,
  isFavorite 
}: {
  selectedImage: GalleryImage;
  onClose: () => void;
  onToggleFavorite: () => void;
  onDownload: () => void;
  onDelete: () => void;
  onCreateVideo: () => void;
  onInpaint: () => void;
  onMoreLikeThis: () => void;
  isFavorite: boolean;
}) {
  const [showEditDropdown, setShowEditDropdown] = useState(false);
  
  // Check if INPAINT_ENABLED is available (we can assume it is for the UI)
  const inpaintEnabled = process.env.REACT_APP_INPAINT_ENABLED === '1' || true; // Default to enabled
  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-80 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white max-w-4xl max-h-[90vh] w-full flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-2xl text-gray-600 hover:text-gray-800 z-10"
          aria-label="Close modal"
        >
          ×
        </button>
        
        {/* Image */}
        <div className="flex-1 flex items-center justify-center p-4">
          <img 
            src={selectedImage.imageUrl || selectedImage.url || ''} 
            alt={selectedImage.title || 'Gallery image'} 
            className="max-w-full max-h-[70vh] object-contain"
          />
        </div>
        
        {/* Actions */}
        <div className="border-t border-gray-200 p-4">
          <div className="flex flex-wrap justify-center gap-6 text-xs uppercase tracking-wider">
            <button 
              onClick={onToggleFavorite}
              className="text-black hover:text-gray-600 transition-colors"
            >
              {isFavorite ? '♥ Unfavorite' : '♡ Favorite'}
            </button>
            
            {/* Edit Dropdown */}
            {inpaintEnabled && (
              <div className="relative">
                <button 
                  onClick={() => setShowEditDropdown(!showEditDropdown)}
                  className="text-black hover:text-gray-600 transition-colors"
                >
                  ✏️ Edit ▼
                </button>
                {showEditDropdown && (
                  <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-white border border-gray-200 rounded-md shadow-lg min-w-40 z-10">
                    <button
                      onClick={() => {
                        onInpaint();
                        setShowEditDropdown(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                    >
                      <span>🎨</span>
                      <span>Inpaint (beta)</span>
                    </button>
                  </div>
                )}
              </div>
            )}
            
            <button 
              onClick={onMoreLikeThis}
              className="text-black hover:text-gray-600 transition-colors"
            >
              ✨ More Like This
            </button>
            <button 
              onClick={onCreateVideo}
              className="text-black hover:text-gray-600 transition-colors"
            >
              Create Video Clip
            </button>
            <button 
              onClick={onDownload}
              className="text-black hover:text-gray-600 transition-colors"
            >
              Download
            </button>
            <button 
              onClick={onDelete}
              className="text-red-600 hover:text-red-800 transition-colors"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function SSELFIEGallery() {
  const { user, isAuthenticated } = useAuth();
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [isInpaintModalOpen, setIsInpaintModalOpen] = useState(false);
  const [inpaintImage, setInpaintImage] = useState<GalleryImage | null>(null);
  const [isVariationsModalOpen, setIsVariationsModalOpen] = useState(false);
  const [variationsImage, setVariationsImage] = useState<GalleryImage | null>(null);
  const queryClient = useQueryClient();

  // Fetch user's gallery images
  const { data: aiImagesData, isLoading } = useQuery<GalleryImage[]>({
    queryKey: ['/api/gallery-images'],
    enabled: isAuthenticated && !!user,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    queryFn: async () => {
      // Force correct API base and JSON handling
      const data = await apiFetch('/gallery-images');
      return Array.isArray(data) ? data : (data?.images || []);
    }
  });

  // Defensive check: ensure aiImages is always an array
  const aiImages = Array.isArray(aiImagesData) ? aiImagesData : [];

  // Fetch user's favorites
  const { data: favoritesData } = useQuery<{ favorites: number[] }>({
    queryKey: ['/api/images/favorites'],
    enabled: isAuthenticated && !!user,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const favorites: number[] = favoritesData?.favorites || [];

  // Toggle favorite mutation
  const toggleFavoriteMutation = useMutation({
    mutationFn: async (imageId: number) => {
      return await apiRequest(`/api/images/${imageId}/favorite`, 'POST');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/images/favorites'] });
    },
  });

  // Delete image mutation
  const deleteImageMutation = useMutation({
    mutationFn: async (imageId: number) => {
      return await apiRequest(`/api/ai-images/${imageId}`, 'DELETE');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/gallery-images'] });
      queryClient.invalidateQueries({ queryKey: ['/api/images/favorites'] });
      setSelectedImage(null); // Close modal after deletion
    }
  });

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
      // eslint-disable-next-line no-console
      console.error('Error downloading image:', error);
    }
  };

  const toggleFavorite = (imageId: string | number) => {
    const numericId = typeof imageId === 'string' ? parseInt(imageId, 10) : imageId;
    toggleFavoriteMutation.mutate(numericId);
  };

  const deleteImage = (imageId: string | number) => {
    if (window.confirm('Are you sure you want to delete this photo?')) {
      const numericId = typeof imageId === 'string' ? parseInt(imageId, 10) : imageId;
      deleteImageMutation.mutate(numericId);
    }
  };

  const handleOpenVideoModal = () => {
    setIsVideoModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedImage(null);
  };

  const handleDownload = () => {
    if (selectedImage) {
      const src = selectedImage.imageUrl || selectedImage.url || '';
      downloadImage(src, selectedImage.title || 'sselfie-image');
    }
  };

  const handleDelete = () => {
    if (selectedImage) {
      deleteImage(selectedImage.id);
    }
  };

  const handleToggleFavorite = () => {
    if (selectedImage) {
      toggleFavorite(selectedImage.id);
    }
  };

  const handleCreateVideo = () => {
    handleOpenVideoModal();
  };

  const handleOpenInpaint = () => {
    if (selectedImage) {
      setInpaintImage(selectedImage);
      setIsInpaintModalOpen(true);
      setSelectedImage(null); // Close the detail modal
    }
  };

  const handleCloseInpaint = () => {
    setIsInpaintModalOpen(false);
    setInpaintImage(null);
  };

  const handleInpaintComplete = (resultUrl: string) => {
    // Invalidate gallery images to refresh the gallery
    queryClient.invalidateQueries({ queryKey: ['/api/gallery-images'] });
    console.log('✅ Inpainting completed, result URL:', resultUrl);
  };

  const handleOpenVariations = () => {
    if (selectedImage) {
      setVariationsImage(selectedImage);
      setIsVariationsModalOpen(true);
      setSelectedImage(null); // Close the detail modal
    }
  };

  const handleCloseVariations = () => {
    setIsVariationsModalOpen(false);
    setVariationsImage(null);
  };

  const handleVariationsSaved = (count: number) => {
    // Invalidate gallery images to refresh the gallery
    queryClient.invalidateQueries({ queryKey: ['/api/gallery-images'] });
    console.log(`✅ ${count} variations saved to gallery`);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-white">
        <MemberNavigation />
        <div className="px-5 py-30 text-center">
          <h1 className="text-2xl font-light tracking-widest mb-4">Please Sign In</h1>
          <p className="text-gray-600">You need to be signed in to access your SSELFIE Gallery.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <MemberNavigation />
      
      {/* Simple Container with Clean Padding */}
      <div className="px-4 py-6">
        <h1 className="font-serif font-light tracking-widest text-center mb-6 text-2xl">
          GALLERY
        </h1>
        
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div 
                key={i} 
                className="aspect-square bg-gray-100 rounded-lg animate-pulse" 
              />
            ))}
          </div>
        ) : aiImages.length === 0 ? (
          <div className="text-center text-gray-500 text-lg mt-20">
            No photos yet.
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {aiImages.map((image) => (
              <div 
                key={image.id} 
                onClick={() => setSelectedImage(image)} 
                className="aspect-square cursor-pointer group"
              >
                <img 
                  src={image.imageUrl || image.url || ''} 
                  alt={image.title || 'Generated art'} 
                  className="w-full h-full object-cover rounded-lg transition-transform group-hover:scale-105"
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Image Detail Modal */}
      {selectedImage && !isVideoModalOpen && !isInpaintModalOpen && !isVariationsModalOpen && (
        <ImageDetailModal
          selectedImage={selectedImage}
          onClose={handleCloseModal}
          onToggleFavorite={handleToggleFavorite}
          onDownload={handleDownload}
          onDelete={handleDelete}
          onCreateVideo={handleCreateVideo}
          onInpaint={handleOpenInpaint}
          onMoreLikeThis={handleOpenVariations}
          isFavorite={favorites.includes(typeof selectedImage.id === 'string' ? parseInt(selectedImage.id, 10) : selectedImage.id)}
        />
      )}

      {/* Story Studio Modal */}
      {isVideoModalOpen && selectedImage && (
        <StoryStudioModal
          imageId={selectedImage.id.toString()}
          imageUrl={selectedImage.imageUrl}
          imageSource={selectedImage.source}
          onClose={() => setIsVideoModalOpen(false)}
          onSuccess={() => {
            // eslint-disable-next-line no-console
            console.log('✅ Video generation started for image:', selectedImage.id);
            queryClient.invalidateQueries({ queryKey: ['/api/gallery-images'] });
          }}
        />
      )}

      {/* Inpainting Modal */}
      {isInpaintModalOpen && inpaintImage && (
        <ImageInpaint
          imageUrl={inpaintImage.imageUrl || inpaintImage.url || ''}
          imageId={typeof inpaintImage.id === 'string' ? parseInt(inpaintImage.id, 10) : inpaintImage.id}
          onClose={handleCloseInpaint}
          onInpaintComplete={handleInpaintComplete}
        />
      )}

      {/* Variations Modal */}
      {isVariationsModalOpen && variationsImage && (
        <ImageVariationsModal
          originalImage={{
            id: variationsImage.id,
            imageUrl: variationsImage.imageUrl,
            url: variationsImage.url,
            title: variationsImage.title
          }}
          onClose={handleCloseVariations}
          onVariationsSaved={handleVariationsSaved}
        />
      )}
    </div>
  );
}

export default function SSELFIEGalleryWithErrorBoundary() {
  return (
    <ErrorBoundary>
      <SSELFIEGallery />
    </ErrorBoundary>
  );
}
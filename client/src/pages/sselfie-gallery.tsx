import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/use-auth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MemberNavigation } from '../components/member-navigation';
import { apiRequest } from '../lib/queryClient';
import { apiFetch } from '../lib/api';
import ErrorBoundary from '../components/ErrorBoundary';
import StoryStudioModal from '../components/StoryStudioModal';

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
  onUpscale,
  isFavorite,
  isUpscaleEnabled,
  isUpscaling,
  upscaleError 
}: {
  selectedImage: GalleryImage;
  onClose: () => void;
  onToggleFavorite: () => void;
  onDownload: () => void;
  onDelete: () => void;
  onCreateVideo: () => void;
  onUpscale: () => void;
  isFavorite: boolean;
  isUpscaleEnabled: boolean | null;
  isUpscaling: boolean;
  upscaleError: string | null;
}) {
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
            {/* HD Upscale Button - Only show if upscaling is enabled */}
            {isUpscaleEnabled && (
              <button 
                onClick={onUpscale}
                disabled={isUpscaling}
                className={`transition-colors ${
                  isUpscaling 
                    ? 'text-gray-400 cursor-not-allowed' 
                    : 'text-black hover:text-gray-600'
                }`}
              >
                {isUpscaling ? '⟳ Upscaling...' : '📐 HD'}
              </button>
            )}
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
          {/* Upscale Error Display */}
          {upscaleError && (
            <div className="mt-2 text-xs text-red-600 text-center">
              {upscaleError}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function SSELFIEGallery() {
  const { user, isAuthenticated } = useAuth();
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [upscalingImageId, setUpscalingImageId] = useState<string | null>(null);
  const [upscaleError, setUpscaleError] = useState<string | null>(null);
  const [isUpscaleEnabled, setIsUpscaleEnabled] = useState<boolean | null>(null);
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

  // HD Upscale image mutation
  const upscaleImageMutation = useMutation({
    mutationFn: async (imageId: string) => {
      const response = await apiFetch('/upscale', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ imageId, scale: 2 })
      });
      return response;
    },
    onMutate: (imageId) => {
      setUpscalingImageId(imageId);
      setUpscaleError(null);
    },
    onSuccess: (data, imageId) => {
      setUpscalingImageId(null);
      
      // Show success toast or update image URL to HD version
      if (data.url && selectedImage) {
        // Update the selected image to show the HD version
        setSelectedImage({
          ...selectedImage,
          url: data.url,
          imageUrl: data.url
        });
      }
    },
    onError: (error: any, imageId) => {
      setUpscalingImageId(null);
      const errorMessage = error?.message || error?.error || 'Failed to upscale image';
      setUpscaleError(errorMessage);
      console.error('Upscale error:', error);
    }
  });

  // Check if upscaling is enabled on mount
  useEffect(() => {
    const checkUpscaleEnabled = async () => {
      try {
        // Make a lightweight OPTIONS request or check without actually processing
        const response = await fetch('/api/upscale', {
          method: 'OPTIONS',
          headers: { 'Content-Type': 'application/json' }
        });
        
        // If the endpoint exists (even with 405 Method Not Allowed), upscaling may be available
        if (response.status === 405 || response.status === 200) {
          setIsUpscaleEnabled(true);
          return;
        }
        
        // Try a minimal POST request to check for configuration
        const testResponse = await apiFetch('/upscale', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageId: 'test' })
        });
        setIsUpscaleEnabled(true);
      } catch (error: any) {
        const errorText = JSON.stringify(error).toLowerCase();
        if (errorText.includes('not configured') || errorText.includes('upscaling not available')) {
          setIsUpscaleEnabled(false);
        } else if (error.status === 404) {
          // Endpoint doesn't exist
          setIsUpscaleEnabled(false);
        } else {
          // Other errors suggest the endpoint exists but failed for other reasons (like missing imageId)
          setIsUpscaleEnabled(true);
        }
      }
    };
    
    if (isAuthenticated) {
      checkUpscaleEnabled();
    }
  }, [isAuthenticated]);

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

  const handleUpscale = () => {
    if (selectedImage) {
      upscaleImageMutation.mutate(selectedImage.id.toString());
    }
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
      {selectedImage && !isVideoModalOpen && (
        <ImageDetailModal
          selectedImage={selectedImage}
          onClose={handleCloseModal}
          onToggleFavorite={handleToggleFavorite}
          onDownload={handleDownload}
          onDelete={handleDelete}
          onCreateVideo={handleCreateVideo}
          onUpscale={handleUpscale}
          isFavorite={favorites.includes(typeof selectedImage.id === 'string' ? parseInt(selectedImage.id, 10) : selectedImage.id)}
          isUpscaleEnabled={isUpscaleEnabled === true}
          isUpscaling={upscalingImageId === selectedImage.id.toString()}
          upscaleError={upscaleError}
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
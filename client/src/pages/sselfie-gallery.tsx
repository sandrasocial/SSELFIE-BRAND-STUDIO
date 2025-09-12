import React, { useState, useEffect } from 'react';
import StoryStudioModal from '../components/StoryStudioModal';
import { useAuth } from '../hooks/use-auth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MemberNavigation } from '../components/member-navigation';
import { SandraImages } from '../lib/sandra-images';
import { apiRequest } from '../lib/queryClient';
import ErrorBoundary from '../components/ErrorBoundary';
import { useMemoryCleanup } from '../hooks/useMemoryCleanup';
import { getOptimalStaleTime } from '../utils/performanceOptimizations';
import { performanceMonitor } from '../utils/performanceMonitor';

function SSELFIEGallery() {
  const { user, isAuthenticated } = useAuth();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [storyStudioImage, setStoryStudioImage] = useState<{ id: string, url: string } | null>(null);
  const [downloadingImages, setDownloadingImages] = useState(new Set<string>());
  const [isDownloadingAll, setIsDownloadingAll] = useState(false);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const queryClient = useQueryClient();

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const imagesPerPage = 20;

  // Performance optimizations
  const { addCleanup } = useMemoryCleanup();
  
  // Fetch user's deliberately saved gallery images with pagination
  const { data: aiImages = [], isLoading } = useQuery<any[]>({
    queryKey: ['/api/gallery-images', currentPage, imagesPerPage],
    enabled: isAuthenticated && !!user,
    staleTime: getOptimalStaleTime('gallery'), // Optimized cache timing
    gcTime: 5 * 60 * 1000, // 5 minutes garbage collection
    refetchOnWindowFocus: false, // Prevent unnecessary refetches
  });

  // Fetch user's favorites
  const { data: favoritesData } = useQuery<{ favorites: number[] }>({
    queryKey: ['/api/images/favorites'],
    enabled: isAuthenticated && !!user,
    staleTime: getOptimalStaleTime('static'), // Longer cache for favorites
    refetchOnWindowFocus: false, // Prevent unnecessary refetches
  });

  const favorites: number[] = favoritesData?.favorites || [];
  
  // Track gallery performance after data loads
  useEffect(() => {
    if (!isLoading && aiImages.length > 0) {
      const startTime = performance.now();
      
      // Track when images finish loading
      const loadTime = performance.now() - startTime;
      performanceMonitor.trackGalleryLoad(loadTime, aiImages.length);
    }
  }, [isLoading, aiImages.length]);

  // Toggle favorite mutation
  const toggleFavoriteMutation = useMutation({
    mutationFn: async (imageId: number) => {
      console.log('Making API request to toggle favorite for image:', imageId);
      const response = await apiRequest(`/api/images/${imageId}/favorite`, 'POST');
      console.log('Favorite toggle response:', response);
      return response;
    },
    onSuccess: (data) => {
      console.log('Favorite toggle success:', data);
      // Refresh favorites data
      queryClient.invalidateQueries({ queryKey: ['/api/images/favorites'] });
    },
    onError: (error) => {
      console.error('Favorite toggle error:', error);
    }
  });

  // Delete image mutation
  const deleteImageMutation = useMutation({
    mutationFn: async (imageId: number) => {
      return await apiRequest(`/api/ai-images/${imageId}`, 'DELETE');
    },
    onSuccess: () => {
      // Refresh gallery images data
      queryClient.invalidateQueries({ queryKey: ['/api/gallery-images'] });
      queryClient.invalidateQueries({ queryKey: ['/api/images/favorites'] });
    }
  });



  const downloadImage = async (imageUrl: string, filename: string) => {
    try {
      setDownloadingImages(prev => new Set([...prev, imageUrl]));
      
      // Skip broken or invalid URLs
      if (!imageUrl || !imageUrl.startsWith('http')) {
        console.log('Skipping invalid URL:', imageUrl);
        return;
      }
      
      // For S3 URLs, try to create a download link that works
      const link = document.createElement('a');
      link.href = imageUrl;
      link.download = filename;
      
      // Add proper attributes for CORS download
      link.setAttribute('crossorigin', 'anonymous');
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      
      // Temporarily add to DOM and trigger click
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      console.log(`Download initiated for: ${filename}`);
      
    } catch (error) {
      console.error('Error downloading image:', error);
      // Show user-friendly error message
      alert('Download failed. Please right-click the image and select "Save image as..." to download manually.');
    } finally {
      // Clear loading state after a short delay to show the loading animation briefly
      setTimeout(() => {
        setDownloadingImages(prev => {
          const newSet = new Set(prev);
          newSet.delete(imageUrl);
          return newSet;
        });
      }, 1000);
    }
  };

  const downloadAllImages = async () => {
    try {
      setIsDownloadingAll(true);
      const imagesToDownload = showFavoritesOnly ? 
        aiImages.filter(img => favorites.includes(img.id)) : 
        aiImages;
        
      for (let i = 0; i < imagesToDownload.length; i++) {
        const image = imagesToDownload[i];
        await downloadImage(image.imageUrl, `sselfie-${i + 1}.jpg`);
        // Small delay between downloads
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    } catch (error) {
      console.error('Error downloading all images:', error);
    } finally {
      setIsDownloadingAll(false);
    }
  };



  const toggleFavorite = (imageId: number) => {
    console.log('Heart clicked for image:', imageId);
    console.log('Current favorites:', favorites);
    console.log('Is currently favorite:', favorites.includes(imageId));
    toggleFavoriteMutation.mutate(imageId);
  };

  const deleteImage = (imageId: number) => {
    if (confirm('Are you sure you want to delete this photo? This action cannot be undone.')) {
      deleteImageMutation.mutate(imageId);
    }
  };

  // Minimalist: always show all images
  const filteredImages = aiImages;

  if (!isAuthenticated) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        background: '#ffffff',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        fontWeight: 300,
        color: '#0a0a0a'
      }}>
        <MemberNavigation />
        <div style={{
          maxWidth: '1400px',
          margin: '0 auto',
          padding: '120px 40px',
          textAlign: 'center'
        }}>
          <h1 style={{
            fontFamily: 'Times New Roman, serif',
            fontSize: 'clamp(3rem, 6vw, 6rem)',
            fontWeight: 200,
            letterSpacing: '-0.01em',
            textTransform: 'uppercase',
            marginBottom: '24px',
            lineHeight: 1
          }}>
            Please Sign In
          </h1>
          <p style={{
            fontSize: '16px',
            lineHeight: 1.6,
            fontWeight: 300,
            maxWidth: '600px',
            margin: '0 auto 40px auto',
            color: '#666666'
          }}>
            You need to be signed in to access your SSELFIE Gallery.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white touch-manipulation" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', fontWeight: 300, color: '#0a0a0a' }}>
      <MemberNavigation />
      {/* Minimalist Gallery Grid */}
      <div style={{
        maxWidth: 900,
        margin: '0 auto',
        padding: '32px 8px 64px 8px',
      }}>
        {isLoading ? (
          <div style={{ display: 'flex', gap: 24 }}>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} style={{ flex: 1, aspectRatio: '3/4', background: '#f0f0f0', borderRadius: 8 }} />
            ))}
          </div>
        ) : filteredImages.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#888', fontSize: 20, marginTop: 80 }}>No photos yet.</div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 16,
          }}>
            {filteredImages.map((image, idx) => (
              <div
                key={image.id}
                style={{
                  background: '#f5f5f5',
                  borderRadius: 8,
                  overflow: 'hidden',
                  aspectRatio: '3/4',
                  cursor: 'pointer',
                  marginBottom: 0
                }}
                onClick={() => setSelectedImage(image.imageUrl)}
              >
                <img
                  src={image.imageUrl}
                  alt={`SSELFIE ${idx + 1}`}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Minimalist Image Detail Modal */}
      {selectedImage && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.96)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          padding: '0 16px'
        }}>
          <div style={{
            width: '100%',
            maxWidth: 420,
            margin: '0 auto',
            background: 'transparent',
            borderRadius: 12,
            boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: 0,
          }}>
            <img
              src={selectedImage}
              alt="Selected SSELFIE"
              style={{ width: '100%', height: 'auto', objectFit: 'contain', borderRadius: 10, marginBottom: 24, background: '#f5f5f5' }}
            />
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <a
                href="#"
                style={{ color: '#0a0a0a', fontSize: 15, textDecoration: 'underline', fontWeight: 500, background: 'none', border: 'none', cursor: 'pointer' }}
                onClick={e => {
                  e.preventDefault();
                  const img = filteredImages.find(img => img.imageUrl === selectedImage);
                  if (img) toggleFavorite(img.id);
                }}
              >
                {(() => {
                  const img = filteredImages.find(img => img.imageUrl === selectedImage);
                  return img && favorites.includes(img.id) ? '♥ Unfavorite' : '♡ Favorite';
                })()}
              </a>
              <a
                href="#"
                style={{ color: '#0a0a0a', fontSize: 15, textDecoration: 'underline', fontWeight: 500, background: 'none', border: 'none', cursor: 'pointer' }}
                onClick={e => {
                  e.preventDefault();
                  const img = filteredImages.find(img => img.imageUrl === selectedImage);
                  if (img) {
                    setSelectedImage(null);
                    setTimeout(() => {
                      setStoryStudioImage({ id: String(img.id), url: img.imageUrl });
                    }, 200);
                  }
                }}
              >
                Create Video Clip
              </a>
              <a
                href="#"
                style={{ color: '#0a0a0a', fontSize: 15, textDecoration: 'underline', fontWeight: 500, background: 'none', border: 'none', cursor: 'pointer' }}
                onClick={e => {
                  e.preventDefault();
                  downloadImage(selectedImage, 'sselfie.jpg');
                }}
              >
                Download
              </a>
              <a
                href="#"
                style={{ color: '#ff4444', fontSize: 15, textDecoration: 'underline', fontWeight: 500, background: 'none', border: 'none', cursor: 'pointer' }}
                onClick={e => {
                  e.preventDefault();
                  const img = filteredImages.find(img => img.imageUrl === selectedImage);
                  if (img) deleteImage(img.id);
                  setSelectedImage(null);
                }}
              >
                Delete
              </a>
              <a
                href="#"
                style={{ color: '#888', fontSize: 15, textDecoration: 'underline', fontWeight: 400, background: 'none', border: 'none', cursor: 'pointer' }}
                onClick={e => {
                  e.preventDefault();
                  setSelectedImage(null);
                }}
              >
                Close
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );

        {/* Image Lightbox */}
        {selectedImage && (
          <div 
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0, 0, 0, 0.96)',
              zIndex: 1000,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'column',
              padding: '0 16px'
            }}
          >
            <div style={{
              width: '100%',
              maxWidth: '420px',
              margin: '0 auto',
              background: 'transparent',
              borderRadius: '12px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              padding: '0',
            }}>
              <img 
                src={selectedImage}
                alt="Selected SSELFIE"
                style={{
                  width: '100%',
                  height: 'auto',
                  objectFit: 'contain',
                  borderRadius: '10px',
                  marginBottom: '24px',
                  background: '#f5f5f5'
                }}
              />
              <div style={{
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '12px'
              }}>
                <a
                  href="#"
                  style={{
                    color: '#0a0a0a',
                    fontSize: '15px',
                    textDecoration: 'underline',
                    fontWeight: 500,
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                  onClick={e => {
                    e.preventDefault();
                    // Find image object by URL
                    const img = filteredImages.find(img => img.imageUrl === selectedImage);
                    if (img) toggleFavorite(img.id);
                  }}
                >
                  {(() => {
                    const img = filteredImages.find(img => img.imageUrl === selectedImage);
                    return img && favorites.includes(img.id) ? '♥ Unfavorite' : '♡ Favorite';
                  })()}
                </a>
                <a
                  href="#"
                  style={{
                    color: '#0a0a0a',
                    fontSize: '15px',
                    textDecoration: 'underline',
                    fontWeight: 500,
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                  onClick={e => {
                    e.preventDefault();
                    // Find image object by URL
                    const img = filteredImages.find(img => img.imageUrl === selectedImage);
                    if (img) {
                      setSelectedImage(null);
                      setTimeout(() => {
                        setStoryStudioImage({ id: String(img.id), url: img.imageUrl });
                      }, 200); // Small delay for modal transition
                    }
                  }}
                >
                  Create Video
                </a>
                <a
                  href="#"
                  style={{
                    color: '#0a0a0a',
                    fontSize: '15px',
                    textDecoration: 'underline',
                    fontWeight: 500,
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                  onClick={e => {
                    e.preventDefault();
                    downloadImage(selectedImage, 'sselfie.jpg');
                  }}
                >
                  Download
                </a>
                <a
                  href="#"
                  style={{
                    color: '#ff4444',
                    fontSize: '15px',
                    textDecoration: 'underline',
                    fontWeight: 500,
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                  onClick={e => {
                    e.preventDefault();
                    const img = filteredImages.find(img => img.imageUrl === selectedImage);
                    if (img) deleteImage(img.id);
                    setSelectedImage(null);
                  }}
                >
                  Delete
                </a>
                <a
                  href="#"
                  style={{
                    color: '#888',
                    fontSize: '15px',
                    textDecoration: 'underline',
                    fontWeight: 400,
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                  onClick={e => {
                    e.preventDefault();
                    setSelectedImage(null);
                  }}
                >
                  Close
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Story Studio Modal */}
        {storyStudioImage && (
          <StoryStudioModal
            imageId={storyStudioImage.id}
            imageUrl={storyStudioImage.url}
            onClose={() => setStoryStudioImage(null)}
            onSuccess={() => {
              setStoryStudioImage(null);
              queryClient.invalidateQueries({ queryKey: ['/api/gallery-images'] });
            }}
          />
        )}

        {/* CSS Animations */}
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          
          @keyframes shimmer {
            0% { background-position: -200% 0; }
            100% { background-position: 200% 0; }
          }
        `}</style>

        {/* Minimalist gallery: editorial quote and navigation removed */}
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
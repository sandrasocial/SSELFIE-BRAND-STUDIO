import React, { useState } from 'react';
import { useAuth } from '../hooks/use-auth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MemberNavigation } from '../components/member-navigation';
import { apiRequest } from '../lib/queryClient';
import ErrorBoundary from '../components/ErrorBoundary';

function SSELFIEGallery() {
  const { user, isAuthenticated } = useAuth();
  const [selectedImage, setSelectedImage] = useState<any | null>(null);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const queryClient = useQueryClient();

  // Fetch user's gallery images
  const { data: aiImages = [], isLoading } = useQuery<any[]>({
    queryKey: ['/api/gallery-images'],
    enabled: isAuthenticated && !!user,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

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
    }
  });

  const downloadImage = (imageUrl: string, filename: string) => {
    try {
      const link = document.createElement('a');
      link.href = imageUrl;
      link.download = filename;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error downloading image:', error);
    }
  };

  const toggleFavorite = (imageId: number) => {
    toggleFavoriteMutation.mutate(imageId);
  };

  const deleteImage = (imageId: number) => {
    if (confirm('Are you sure you want to delete this photo?')) {
      deleteImageMutation.mutate(imageId);
    }
  };

  const handleOpenVideoModal = () => {
    setIsVideoModalOpen(true);
  };

  if (!isAuthenticated) {
    return (
      <div style={{ minHeight: '100vh', background: '#ffffff' }}>
        <MemberNavigation />
        <div style={{ padding: '120px 40px', textAlign: 'center' }}>
          <h1>Please Sign In</h1>
          <p>You need to be signed in to access your SSELFIE Gallery.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <MemberNavigation />
      
      <div style={{ padding: '20px' }}>
        <h1 style={{ fontFamily: "'Times New Roman', serif", fontWeight: 200, letterSpacing: '0.2em', textAlign: 'center', marginBottom: '20px' }}>GALLERY</h1>
        
        {isLoading ? (
          <div style={{ display: 'flex', gap: 24 }}>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} style={{ flex: 1, aspectRatio: '3/4', background: '#f0f0f0', borderRadius: 8 }} />
            ))}
          </div>
        ) : aiImages.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#888', fontSize: 20, marginTop: 80 }}>
            No photos yet.
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
            gap: '16px'
          }}>
            {aiImages.map((image) => (
              <div 
                key={image.id} 
                onClick={() => setSelectedImage(image)} 
                style={{ aspectRatio: '1 / 1.25', cursor: 'pointer' }}
              >
                <img 
                  src={image.imageUrl} 
                  alt="Generated art" 
                  style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 8 }} 
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Image Detail Modal */}
      {selectedImage && !isVideoModalOpen && (
        <div 
          onClick={() => setSelectedImage(null)} 
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <div 
            onClick={(e) => e.stopPropagation()} 
            style={{ background: 'white', padding: '20px', maxWidth: '90vw', maxHeight: '90vh', display: 'flex', flexDirection: 'column', gap: '20px' }}
          >
            <img 
              src={selectedImage.imageUrl} 
              alt="Selected" 
              style={{ maxWidth: '100%', maxHeight: '70vh', objectFit: 'contain' }} 
            />
            <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', textTransform: 'uppercase', letterSpacing: '0.2em', fontSize: '11px' }}>
              <button 
                onClick={() => {
                  const img = aiImages.find(img => img.id === selectedImage.id);
                  if (img) toggleFavorite(img.id);
                }}
                style={{background: 'none', border: 'none', cursor: 'pointer'}}
              >
                {(() => {
                  const img = aiImages.find(img => img.id === selectedImage.id);
                  return img && favorites.includes(img.id) ? '♥ Unfavorite' : '♡ Favorite';
                })()}
              </button>
              <button 
                onClick={handleOpenVideoModal} 
                style={{background: 'none', border: 'none', cursor: 'pointer'}}
              >
                Create Video Clip
              </button>
              <a 
                href={selectedImage.imageUrl} 
                download 
                style={{color: 'black', textDecoration: 'none'}}
              >
                Download
              </a>
              <button 
                onClick={() => deleteImage(selectedImage.id)} 
                style={{background: 'none', border: 'none', cursor: 'pointer', color: 'red'}}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Story Studio Modal */}
      {isVideoModalOpen && (
        <div 
          onClick={() => setIsVideoModalOpen(false)} 
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <div 
            onClick={(e) => e.stopPropagation()} 
            style={{ background: 'white', padding: '20px', textAlign: 'center', borderRadius: '8px', maxWidth: '500px' }}
          >
            <h2 style={{ fontFamily: "'Times New Roman', serif", fontWeight: 200, letterSpacing: '0.2em', marginBottom: '20px' }}>CREATE VIDEO</h2>
            <img 
              src={selectedImage?.imageUrl} 
              style={{width: '200px', margin: '16px auto', borderRadius: '8px'}} 
              alt="Selected for video"
            />
            <p style={{ marginBottom: '20px', fontSize: '14px', color: '#666' }}>
              Video generation will be connected here. This will integrate with your Story Studio service.
            </p>
            <button 
              onClick={() => setIsVideoModalOpen(false)}
              style={{ 
                background: '#000', 
                color: '#fff', 
                padding: '12px 24px', 
                border: 'none', 
                borderRadius: '24px',
                cursor: 'pointer',
                textTransform: 'uppercase',
                letterSpacing: '0.3em',
                fontSize: '11px'
              }}
            >
              Close
            </button>
          </div>
        </div>
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

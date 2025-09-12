import React, { useState } from 'react';
import { useAuth } from '../hooks/use-auth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MemberNavigation } from '../components/member-navigation';
import { apiRequest } from '../lib/queryClient';
import ErrorBoundary from '../components/ErrorBoundary';

function SSELFIEGallery() {
  const { user, isAuthenticated } = useAuth();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
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
      
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '32px 8px 64px 8px' }}>
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
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {aiImages.map((image, idx) => (
              <div
                key={image.id}
                style={{
                  background: '#f5f5f5',
                  borderRadius: 8,
                  overflow: 'hidden',
                  aspectRatio: '3/4',
                  cursor: 'pointer',
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
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}>
            <img
              src={selectedImage}
              alt="Selected SSELFIE"
              style={{ 
                width: '100%', 
                height: 'auto', 
                objectFit: 'contain', 
                borderRadius: 10, 
                marginBottom: 24, 
                background: '#f5f5f5' 
              }}
            />
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
              <button
                style={{ 
                  color: '#fff', 
                  fontSize: 15, 
                  cursor: 'pointer',
                  background: 'none',
                  border: 'none'
                }}
                onClick={() => {
                  const img = aiImages.find(img => img.imageUrl === selectedImage);
                  if (img) toggleFavorite(img.id);
                }}
              >
                {(() => {
                  const img = aiImages.find(img => img.imageUrl === selectedImage);
                  return img && favorites.includes(img.id) ? '♥ Unfavorite' : '♡ Favorite';
                })()}
              </button>
              <button
                style={{ color: '#fff', fontSize: 15, cursor: 'pointer', background: 'none', border: 'none' }}
                onClick={() => downloadImage(selectedImage, 'sselfie.jpg')}
              >
                Download
              </button>
              <button
                style={{ color: '#ff4444', fontSize: 15, cursor: 'pointer', background: 'none', border: 'none' }}
                onClick={() => {
                  const img = aiImages.find(img => img.imageUrl === selectedImage);
                  if (img) deleteImage(img.id);
                  setSelectedImage(null);
                }}
              >
                Delete
              </button>
              <button
                style={{ color: '#888', fontSize: 15, cursor: 'pointer', background: 'none', border: 'none' }}
                onClick={() => setSelectedImage(null)}
              >
                Close
              </button>
            </div>
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

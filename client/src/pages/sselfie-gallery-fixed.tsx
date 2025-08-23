import React, { useState, useMemo } from 'react';
import { useAuth } from '../hooks/use-auth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '../lib/queryClient';

export default function SSELFIEGallery() {
  const { user, isAuthenticated } = useAuth();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const queryClient = useQueryClient();

  // Fetch user's gallery images
  const { data: aiImages = [], isLoading } = useQuery({
    queryKey: ['/api/gallery-images'],
    enabled: isAuthenticated
  });

  // Fetch user's favorites
  const { data: favoritesData } = useQuery({
    queryKey: ['/api/images/favorites'],
    enabled: isAuthenticated
  });

  const favorites = favoritesData?.favorites || [];

  // Filter images
  const filteredImages = useMemo(() => {
    let filtered = [...aiImages];
    
    if (showFavoritesOnly) {
      filtered = filtered.filter(img => favorites.includes(img.id));
    }
    
    if (searchQuery) {
      filtered = filtered.filter(img => 
        img.prompt?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    return filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [aiImages, showFavoritesOnly, favorites, searchQuery]);

  // Toggle favorite mutation
  const toggleFavoriteMutation = useMutation({
    mutationFn: async (imageId: number) => {
      return await apiRequest('POST', `/api/images/${imageId}/favorite`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/images/favorites'] });
    }
  });

  // Delete image mutation
  const deleteImageMutation = useMutation({
    mutationFn: async (imageId: number) => {
      console.log('🗑️ Deleting image:', imageId);
      const response = await apiRequest('DELETE', `/api/ai-images/${imageId}`);
      console.log('✅ Delete response:', response);
      return response;
    },
    onSuccess: (data) => {
      console.log('✅ Image deleted successfully:', data);
      queryClient.invalidateQueries({ queryKey: ['/api/gallery-images'] });
      queryClient.invalidateQueries({ queryKey: ['/api/images/favorites'] });
    },
    onError: (error) => {
      console.error('❌ Delete error:', error);
      alert('Failed to delete image. Please try again.');
    }
  });

  const toggleFavorite = (imageId: number) => {
    toggleFavoriteMutation.mutate(imageId);
  };

  const deleteImage = (imageId: number) => {
    if (confirm('Are you sure you want to delete this photo? This action cannot be undone.')) {
      deleteImageMutation.mutate(imageId);
    }
  };

  const downloadImage = async (imageUrl: string, filename: string) => {
    try {
      if (!imageUrl || !imageUrl.startsWith('http')) {
        console.log('Skipping invalid URL:', imageUrl);
        return;
      }
      
      const response = await fetch(imageUrl);
      if (!response.ok) {
        console.log('Failed to download image:', response.status, imageUrl);
        return;
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading image:', error);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <h1 className="text-2xl font-light mb-4">Access Your Gallery</h1>
          <p className="text-gray-600 mb-8">Please log in to view your SSELFIE collection</p>
          <a
            href="/login"
            className="inline-block px-8 py-3 bg-black text-white text-sm uppercase tracking-wider hover:bg-gray-800 transition-colors"
          >
            Sign In
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h1 className="text-5xl md:text-7xl font-light mb-8 tracking-tight">
            Your Collection
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-12">
            Professional AI photography that captures your authentic brand story
          </p>
          
          {/* Search */}
          <div className="max-w-md mx-auto mb-8">
            <input
              type="text"
              placeholder="Search your collection..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-none text-center text-sm uppercase tracking-wider focus:outline-none focus:border-black"
            />
          </div>
          
          {/* Filter Buttons */}
          <div className="flex justify-center gap-4 mb-12">
            <button
              onClick={() => setShowFavoritesOnly(false)}
              className={`px-8 py-3 text-xs uppercase tracking-wider border transition-all ${
                !showFavoritesOnly 
                  ? 'bg-black text-white border-black' 
                  : 'bg-white text-gray-600 border-gray-200 hover:border-black'
              }`}
            >
              All Photos ({aiImages.length})
            </button>
            <button
              onClick={() => setShowFavoritesOnly(true)}
              className={`px-8 py-3 text-xs uppercase tracking-wider border transition-all ${
                showFavoritesOnly 
                  ? 'bg-black text-white border-black' 
                  : 'bg-white text-gray-600 border-gray-200 hover:border-black'
              }`}
            >
              ♥ Favorites ({favorites.length})
            </button>
          </div>
        </div>
      </section>

      {/* Gallery Grid */}
      {isLoading ? (
        <section className="py-20 bg-gray-50">
          <div className="max-w-6xl mx-auto px-6 text-center">
            <div className="text-gray-600">Loading your gallery...</div>
          </div>
        </section>
      ) : aiImages.length === 0 ? (
        <section className="py-20 bg-gray-50">
          <div className="max-w-6xl mx-auto px-6 text-center">
            <h2 className="text-4xl font-light mb-8">Your Gallery Awaits</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-12">
              This is where your professional brand photos will live. Ready to create your first collection?
            </p>
            <a
              href="/sandra-photoshoot"
              className="inline-block px-8 py-3 bg-black text-white text-sm uppercase tracking-wider hover:bg-gray-800 transition-colors"
            >
              Start Your First Photoshoot
            </a>
          </div>
        </section>
      ) : (
        <section className="py-0 pb-20 bg-white">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredImages.map((image, index) => (
                <div
                  key={image.id}
                  className="relative group bg-gray-100 aspect-[3/4] overflow-hidden cursor-pointer"
                  onClick={() => setSelectedImage(image.imageUrl)}
                >
                  <img
                    src={image.imageUrl}
                    alt={`SSELFIE ${index + 1}`}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  
                  {/* Overlay with Actions */}
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-end">
                    <div className="w-full p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="flex justify-between items-center">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFavorite(image.id);
                          }}
                          className="text-white hover:text-red-400 transition-colors"
                          title="Toggle Favorite"
                        >
                          {favorites.includes(image.id) ? '❤️' : '🤍'}
                        </button>
                        
                        <div className="flex gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              downloadImage(image.imageUrl, `sselfie-${index + 1}.jpg`);
                            }}
                            className="px-3 py-1 bg-black bg-opacity-70 text-white text-xs uppercase tracking-wider hover:bg-opacity-90 transition-all"
                            title="Download"
                          >
                            Download
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteImage(image.id);
                            }}
                            className="px-3 py-1 bg-red-600 bg-opacity-70 text-white text-xs uppercase tracking-wider hover:bg-opacity-90 transition-all"
                            title="Delete"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Image Modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-4xl max-h-full">
            <img
              src={selectedImage}
              alt="Full size"
              className="max-w-full max-h-full object-contain"
            />
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 text-white text-2xl hover:text-gray-300 transition-colors"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Navigation to other sections */}
      <section className="py-16 bg-gray-50 text-center">
        <a
          href="/studio"
          className="inline-block px-8 py-3 text-black text-sm uppercase tracking-wider border border-black hover:bg-black hover:text-white transition-all"
        >
          Back to STUDIO
        </a>
      </section>
    </div>
  );
}
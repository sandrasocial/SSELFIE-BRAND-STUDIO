import React, { useState } from 'react';
import { useAuth } from '../../../hooks/use-auth.js';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '../../../lib/queryClient.js';
import { apiFetch } from '../../../lib/api.js';
import ErrorBoundary from '../../../components/ErrorBoundary.js';
import StoryStudioModal from '../../../components/StoryStudioModal.js';
import BrandAssetPlacementModal from '../../../components/BrandAssetPlacementModal.js';
import { Camera, Grid, Search, Heart, Download, Trash2, Plus, Filter, X, SortAsc, SortDesc } from 'lucide-react';

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
  onPlaceBrandAsset,
  isFavorite
}: {
  selectedImage: GalleryImage;
  onClose: () => void;
  onToggleFavorite: () => void;
  onDownload: () => void;
  onDelete: () => void;
  onPlaceBrandAsset: () => void;
  isFavorite: boolean;
}) {
  return (
    <div
      className="fixed inset-0 bg-stone-950/95 backdrop-blur-sm z-50 flex items-center justify-center p-4 sm:p-8"
      onClick={onClose}
    >
      <div
        className="max-w-6xl max-h-[95vh] w-full flex flex-col bg-white rounded-3xl overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 sm:p-8 border-b border-stone-200/40 bg-stone-50">
          <div className="flex items-center gap-4 sm:gap-6">
            <div className="p-3 bg-stone-100 rounded-2xl border border-stone-200/60">
              <Camera size={20} strokeWidth={1.5} className="text-stone-600" />
            </div>
            <div>
              <h3 className="text-lg font-serif font-extralight tracking-[0.2em] uppercase text-stone-950">Image Details</h3>
              <p className="text-xs tracking-[0.15em] uppercase text-stone-500 font-light">Professional Portrait</p>
            </div>
          </div>

        <button
          onClick={onClose}
            className="p-3 hover:bg-stone-200/60 rounded-2xl transition-colors"
          aria-label="Close modal"
        >
            <X size={20} className="text-stone-600" strokeWidth={1.5} />
        </button>
        </div>

        {/* Image */}
        <div className="flex-1 flex items-center justify-center p-8 bg-stone-50 overflow-auto">
          <img
            src={selectedImage.imageUrl || selectedImage.url || ''}
            alt={selectedImage.title || 'Gallery image'}
            className="max-w-full max-h-[70vh] object-contain rounded-2xl shadow-2xl"
          />
        </div>

        {/* Actions */}
        <div className="p-6 sm:p-8 border-t border-stone-200/40 bg-white">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <button
              onClick={onToggleFavorite}
              className="flex items-center justify-center gap-2 py-3 px-4 bg-stone-100 hover:bg-stone-200 rounded-2xl transition-colors text-xs tracking-[0.15em] uppercase font-light"
            >
              <Heart size={16} className={isFavorite ? 'text-red-500 fill-current' : 'text-stone-600'} strokeWidth={1.5} />
              {isFavorite ? 'Unfavorite' : 'Favorite'}
            </button>

            {/* P3-C: Brand Asset Placement Feature */}
            {process.env.REACT_APP_BRAND_ASSETS_ENABLED === '1' && (
              <button
                onClick={onPlaceBrandAsset}
                className="flex items-center justify-center gap-2 py-3 px-4 bg-stone-100 hover:bg-stone-200 rounded-2xl transition-colors text-xs tracking-[0.15em] uppercase font-light text-stone-600"
              >
                <Plus size={16} className="text-stone-600" strokeWidth={1.5} />
                Brand Asset
              </button>
            )}

            <button
              onClick={onDownload}
              className="flex items-center justify-center gap-2 py-3 px-4 bg-stone-100 hover:bg-stone-200 rounded-2xl transition-colors text-xs tracking-[0.15em] uppercase font-light text-stone-600"
            >
              <Download size={16} className="text-stone-600" strokeWidth={1.5} />
              Download
            </button>

            <button
              onClick={onDelete}
              className="flex items-center justify-center gap-2 py-3 px-4 bg-red-50 hover:bg-red-100 rounded-2xl transition-colors text-xs tracking-[0.15em] uppercase font-light text-red-600"
            >
              <Trash2 size={16} className="text-red-600" strokeWidth={1.5} />
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// @ts-ignore - FC type compatibility with JSX.Element
const GalleryScreen: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);
  const [isBrandPlacementModalOpen, setIsBrandPlacementModalOpen] = useState(false);
  const [selectedImages, setSelectedImages] = useState<Set<string | number>>(new Set());
  const [viewMode, setViewMode] = useState<'grid' | 'masonry'>('grid');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'favorites'>('newest');
  const [filterBy, setFilterBy] = useState<'all' | 'favorites' | 'recent'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const queryClient = useQueryClient();

  // Fetch user's gallery images
  const { data: aiImagesData, isLoading } = useQuery({
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
  const { data: favoritesData } = useQuery({
    queryKey: ['/api/images/favorites'],
    enabled: isAuthenticated && !!user,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const favorites: number[] = favoritesData?.favorites || [];

  // Filter and sort images
  const filteredImages = React.useMemo(() => {
    let filtered = aiImages;

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(image =>
        (image.title || '').toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply category filter
    if (filterBy === 'favorites') {
      filtered = filtered.filter(image =>
        favorites.includes(typeof image.id === 'string' ? parseInt(image.id, 10) : image.id)
      );
    } else if (filterBy === 'recent') {
      // Filter for images created in last 7 days (mock implementation)
      filtered = filtered.slice(0, 10);
    }

    // Apply sorting
    if (sortBy === 'newest') {
      filtered = [...filtered].reverse();
    } else if (sortBy === 'oldest') {
      filtered = [...filtered];
    } else if (sortBy === 'favorites') {
      filtered = filtered.sort((a, b) => {
        const bIsFavorite = favorites.includes(typeof b.id === 'string' ? parseInt(b.id, 10) : b.id);
        const aIsFavorite = favorites.includes(typeof a.id === 'string' ? parseInt(a.id, 10) : a.id);
        return bIsFavorite ? 1 : -1;
      });
    }

    return filtered;
  }, [aiImages, searchQuery, filterBy, sortBy, favorites]);

  // Gallery statistics
  const galleryStats = React.useMemo(() => ({
    total: aiImages.length,
    favorites: favorites.length,
    recent: Math.min(aiImages.length, 10),
    selected: selectedImages.size
  }), [aiImages.length, favorites.length, selectedImages.size]);

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
      const link = document.createElement('a') as HTMLAnchorElement;
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

  const handlePlaceBrandAsset = () => {
    // Keep the selected image but close the detail modal and open brand placement modal
    setIsBrandPlacementModalOpen(true);
  };

  // Keep old handlers for compatibility
  const handleDownloadOld = async (image: GalleryImage) => {
    const src = image.imageUrl || image.url || '';
    downloadImage(src, image.title || 'sselfie-image');
  };

  const handleShare = async (image: GalleryImage) => {
    const src = image.imageUrl || image.url || '';
    if (navigator.share) {
      try {
        await navigator.share({
          title: image.title || 'SSELFIE Image',
          url: src,
        });
      } catch (error) {
        // Fallback to clipboard
        await navigator.clipboard.writeText(src);
      }
    } else {
      await navigator.clipboard.writeText(src);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-8 pb-4 pt-4 sm:pt-6">
        <div className="text-center">
          <div className="w-16 h-16 border border-stone-300 rounded-full animate-spin mx-auto mb-8 flex items-center justify-center">
            <div className="w-2 h-2 bg-stone-600 rounded-full"></div>
          </div>
          <h1 className="text-stone-950 text-4xl font-serif font-extralight tracking-[0.4em] mb-4 leading-none">SSELFIE</h1>
          <p className="text-xs font-light tracking-[0.3em] uppercase text-stone-500">Loading Gallery</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="space-y-8 pb-4 pt-4 sm:pt-6">
        <div className="text-center">
          <Grid className="h-16 w-16 text-stone-400 mx-auto mb-6" strokeWidth={1} />
          <h2 className="text-2xl font-serif font-extralight tracking-[0.3em] text-stone-950 uppercase mb-2">Authentication Required</h2>
          <p className="text-stone-600 font-light">Please sign in to view your gallery</p>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
    <div className="space-y-8 pb-4">
      {/* Gallery header */}
      <div className="flex justify-between items-start pt-4">
        <div className="space-y-4 flex-1 min-w-0">
          <h2 className="text-3xl sm:text-5xl font-serif font-extralight tracking-[0.3em] text-stone-950 uppercase leading-none">Gallery</h2>
          <p className="text-xs tracking-[0.2em] uppercase font-light text-stone-500">
            {galleryStats.total} Photos • {galleryStats.favorites} Favorites
            {galleryStats.selected > 0 && ` • ${galleryStats.selected} Selected`}
          </p>
        </div>
        <div className="flex space-x-3 ml-6 flex-shrink-0">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`p-4 rounded-2xl border transition-all duration-200 hover:scale-[1.02] ${
              showFilters
                ? 'bg-stone-200/70 border-stone-300/60'
                : 'bg-stone-100/50 border-stone-200/40 hover:bg-stone-100/70'
            }`}
          >
            <Filter size={18} strokeWidth={1.5} className="text-stone-600" />
          </button>
          <button
            onClick={() => setViewMode(viewMode === 'grid' ? 'masonry' : 'grid')}
            className="p-4 bg-stone-100/50 rounded-2xl border border-stone-200/40 hover:bg-stone-100/70 hover:border-stone-300/50 transition-all duration-200 hover:scale-[1.02]"
          >
            <Grid size={18} className="text-stone-600 hover:text-stone-800 transition-colors" strokeWidth={1.5} />
          </button>
        </div>
      </div>

      {/* Enhanced Search and Filter */}
      {showFilters && (
        <div className="p-6 sm:p-8 bg-stone-100/40 border border-stone-200/50 rounded-2xl sm:rounded-3xl space-y-6">
          <div className="flex items-center gap-4 sm:gap-6">
            <div className="p-3 bg-stone-100 rounded-2xl border border-stone-200/60">
              <Search size={20} strokeWidth={1.5} className="text-stone-600" />
            </div>
            <div>
              <h3 className="text-lg font-serif font-extralight tracking-[0.15em] uppercase text-stone-950">Search & Filter</h3>
              <p className="text-xs tracking-[0.1em] uppercase text-stone-500 font-light">Find Your Perfect Shot</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search Input */}
            <div className="relative lg:col-span-2">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-stone-400" strokeWidth={1.5} />
              <input
                type="text"
                placeholder="Search photos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 pr-4 py-4 border border-stone-200/60 rounded-2xl focus:outline-none focus:ring-2 focus:ring-stone-600/40 focus:border-stone-600/60 bg-white/60 w-full font-light text-sm"
              />
            </div>

            {/* Filter Dropdown */}
            <div>
              <select
                value={filterBy}
                onChange={(e) => setFilterBy(e.target.value as any)}
                className="px-4 py-4 border border-stone-200/60 rounded-2xl focus:outline-none focus:ring-2 focus:ring-stone-600/40 focus:border-stone-600/60 bg-white/60 font-light text-sm w-full"
              >
                <option value="all">All Photos</option>
                <option value="favorites">Favorites</option>
                <option value="recent">Recent</option>
              </select>
            </div>

            {/* Sort Dropdown */}
            <div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-4 py-4 border border-stone-200/60 rounded-2xl focus:outline-none focus:ring-2 focus:ring-stone-600/40 focus:border-stone-600/60 bg-white/60 font-light text-sm w-full"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="favorites">Favorites First</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Gallery Grid */}
      {filteredImages.length === 0 ? (
        <div className="text-center py-16">
          <Grid className="h-16 w-16 text-stone-300 mx-auto mb-4" strokeWidth={1} />
          <h3 className="text-lg font-serif font-extralight text-stone-900 mb-2 tracking-[0.15em] uppercase">
            {searchQuery || filterBy !== 'all' ? 'No matching images' : 'No images yet'}
          </h3>
          <p className="text-stone-600 font-light mb-6">
            {searchQuery || filterBy !== 'all'
              ? 'Try adjusting your search or filter'
              : 'Start generating images to build your gallery'
            }
          </p>
          {!searchQuery && filterBy === 'all' && (
            <button
              onClick={() => window.location.href = '/studio'}
              className="px-6 py-3 bg-stone-950 text-stone-50 rounded-2xl font-light tracking-[0.15em] uppercase text-sm transition-all duration-200 hover:bg-stone-800 inline-flex items-center gap-2"
            >
              Generate Your First Image
            </button>
          )}
        </div>
      ) : (
        <div className={viewMode === 'masonry' ? 'columns-2 sm:columns-3 lg:columns-4 gap-4 sm:gap-6' : 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6'}>
          {filteredImages.map((image: any) => {
            const isFavorite = favorites.includes(typeof image.id === 'string' ? parseInt(image.id, 10) : image.id);
            const imageId = typeof image.id === 'string' ? image.id : image.id.toString();
            const isSelected = selectedImages.has(image.id);

            return (
              <div
                key={imageId}
                className={`relative group cursor-pointer overflow-hidden rounded-2xl sm:rounded-3xl ${viewMode === 'masonry' ? 'mb-4 sm:mb-6 break-inside-avoid' : 'aspect-square'} ${isSelected ? 'ring-4 ring-stone-600/40' : ''}`}
                onClick={() => setSelectedImage(image)}
              >
                <div className={viewMode === 'masonry' ? 'relative' : 'aspect-square relative'}>
                  <img
                    src={image.imageUrl || image.url || ''}
                    alt={image.title || 'Gallery image'}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />

                  {/* Heart favorite indicator */}
                  <div className="absolute top-3 right-3">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(image.id);
                      }}
                      className={`p-2 rounded-xl backdrop-blur-sm transition-all duration-200 ${
                        isFavorite
                          ? 'bg-red-500/90 hover:bg-red-600/90'
                          : 'bg-stone-950/60 hover:bg-stone-950/80'
                      }`}
                    >
                      <Heart
                        size={14}
                        className={isFavorite ? 'text-stone-50 fill-current' : 'text-stone-50'}
                        strokeWidth={1.5}
                      />
                    </button>
                  </div>

                  <div className="absolute inset-0 bg-stone-950/0 group-hover:bg-stone-950/30 transition-all duration-300"></div>

                  <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 bg-gradient-to-t from-stone-950/80 via-stone-950/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300">
                    <div className="flex justify-between items-end">
                      <div className="space-y-2 flex-1 min-w-0">
                        <span className="text-stone-50 text-xs tracking-[0.15em] uppercase font-light block truncate">
                          {image.title || 'Untitled'}
                        </span>
                        <div className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-stone-50 rounded-full"></div>
                          <span className="text-xs font-light text-stone-200">Ready</span>
                        </div>
                      </div>
                      <div className="flex space-x-2 ml-4 flex-shrink-0">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDownloadOld(image);
                          }}
                          className="w-9 h-9 bg-stone-50/20 backdrop-blur-sm rounded-xl flex items-center justify-center hover:bg-stone-50/30 transition-colors duration-200"
                        >
                          <Download size={14} className="text-stone-50" strokeWidth={1.5} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteImage(image.id);
                          }}
                          className="w-9 h-9 bg-red-500/20 backdrop-blur-sm rounded-xl flex items-center justify-center hover:bg-red-500/30 transition-colors duration-200"
                        >
                          <Trash2 size={14} className="text-red-400" strokeWidth={1.5} />
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

      {/* Load more */}
      {filteredImages.length > 12 && (
        <div className="text-center pt-6">
          <button className="text-sm tracking-[0.2em] uppercase font-light border-b pb-2 flex items-center gap-2 mx-auto transition-colors duration-200 text-stone-600 border-stone-300/40 hover:text-stone-800 hover:border-stone-400/60">
            <Plus size={14} />
            See More Photos ({filteredImages.length - 12} remaining)
          </button>
        </div>
      )}

      {/* Enhanced Image Detail Modal */}
      {selectedImage && (
        <ImageDetailModal
          selectedImage={selectedImage}
          onClose={handleCloseModal}
          onToggleFavorite={handleToggleFavorite}
          onDownload={handleDownload}
          onDelete={handleDelete}
          onPlaceBrandAsset={handlePlaceBrandAsset}
          isFavorite={favorites.includes(typeof selectedImage.id === 'string' ? parseInt(selectedImage.id, 10) : selectedImage.id)}
        />
      )}

      {/* Brand Asset Placement Modal */}
      {isBrandPlacementModalOpen && selectedImage && (
        <BrandAssetPlacementModal
          isOpen={isBrandPlacementModalOpen}
          onClose={() => {
            setIsBrandPlacementModalOpen(false);
            setSelectedImage(null);
          }}
          imageId={typeof selectedImage.id === 'string' ? parseInt(selectedImage.id) : selectedImage.id}
          imageUrl={selectedImage.imageUrl || selectedImage.url || ''}
          imageTitle={selectedImage.title || 'Gallery Image'}
        />
      )}
    </div>
    </ErrorBoundary>
  );
};

export default GalleryScreen;

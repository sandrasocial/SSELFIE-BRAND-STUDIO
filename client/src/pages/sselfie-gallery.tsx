import React, { useState } from 'react';
import { useAuth } from '../hooks/use-auth.js';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MemberNavigation } from '../components/member-navigation.js';
import { apiRequest } from '../lib/queryClient.js';
import { apiFetch } from '../lib/api.js';
import ErrorBoundary from '../components/ErrorBoundary.js';
import BrandAssetPlacementModal from '../components/BrandAssetPlacementModal.js';
import { Camera, Grid, Search, Heart, Download, Trash2, Plus, Filter, Calendar, Star, Eye, X, Check, SortAsc, SortDesc } from 'lucide-react';

import GalleryScreen from '../features/gallery/components/TwoTabGalleryScreen.js';

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
        <div className="flex-1 flex items-center justify-center p-8 bg-stone-50">
          <img
            src={selectedImage.imageUrl || selectedImage.url || ''}
            alt={selectedImage.title || 'Gallery image'}
            className="max-w-full max-h-[60vh] object-contain rounded-2xl shadow-2xl"
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

function SSELFIEGallery({ hideMemberNav = false }: { hideMemberNav?: boolean }) {
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

  // Bulk selection functions
  const toggleImageSelection = (imageId: string | number) => {
    setSelectedImages(prev => {
      const newSet = new Set(prev);
      if (newSet.has(imageId)) {
        newSet.delete(imageId);
      } else {
        newSet.add(imageId);
      }
      return newSet;
    });
  };


  const clearSelection = () => {
    setSelectedImages(new Set());
  };

  const handleBulkDownload = () => {
    selectedImages.forEach(imageId => {
      const image = filteredImages.find(img => img.id === imageId);
      if (image) {
        downloadImage(image.imageUrl || image.url || '', image.title || 'sselfie-image');
      }
    });
  };

  const handleBulkDelete = () => {
    if (window.confirm(`Are you sure you want to delete ${selectedImages.size} photos?`)) {
      selectedImages.forEach(imageId => {
        deleteImage(imageId);
      });
      clearSelection();
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-stone-50">
        {!hideMemberNav && <MemberNavigation />}
        <div className="flex items-center justify-center min-h-screen p-6" style={{ paddingTop: '120px' }}>
          <div className="text-center max-w-md mx-auto">
            <div className="p-8 bg-white rounded-3xl border border-stone-200/60 mb-8 inline-block shadow-lg">
              <Camera size={48} className="text-stone-600 mx-auto" strokeWidth={1.5} />
            </div>
            <h1 className="text-3xl font-serif font-extralight tracking-[0.25em] uppercase text-stone-950 mb-6">Authentication Required</h1>
            <p className="text-stone-600 leading-relaxed font-light">Please sign in to access your professional gallery.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50">
      {!hideMemberNav && <MemberNavigation />}

      {/* Gallery Container */}
      <div className="px-6 sm:px-8" style={{ paddingTop: '100px' }}>
        {/* Gallery Header */}
        <div className="space-y-8 py-8 sm:py-12">
          {/* Main Header */}
          <div className="flex justify-between items-start">
            <div className="space-y-6">
              <div>
                <div className="text-xs tracking-[0.3em] uppercase text-stone-500 font-light mb-4">
                  Professional Collection
                </div>
                <h2 className="text-4xl sm:text-5xl font-serif font-extralight tracking-[0.25em] text-stone-950 uppercase">Gallery</h2>
              </div>

              {/* Gallery Stats */}
              <div className="flex items-center gap-8">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-stone-600 rounded-full"></div>
                  <span className="text-xs text-stone-600 tracking-[0.2em] uppercase font-light">
                    {galleryStats.total} Photos
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <Star size={12} className="text-stone-600" strokeWidth={1.5} />
                  <span className="text-xs text-stone-600 tracking-[0.2em] uppercase font-light">
                    {galleryStats.favorites} Favorites
                  </span>
                </div>
                {selectedImages.size > 0 && (
                  <div className="flex items-center gap-3">
                    <Check size={12} className="text-stone-950" strokeWidth={1.5} />
                    <span className="text-xs text-stone-950 tracking-[0.2em] uppercase font-light">
                      {selectedImages.size} Selected
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-4">
              {/* Search */}
              <div className="relative">
                <Search size={16} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-stone-500" strokeWidth={1.5} />
                <input
                  type="text"
                  placeholder="Search photos..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 pr-4 py-3 bg-white border border-stone-200/60 rounded-2xl text-stone-950 text-sm placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-stone-600/40 focus:border-stone-600/60 w-64 font-light"
                />
              </div>

              {/* Filter Toggle */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`p-3 rounded-2xl border transition-all duration-200 ${
                  showFilters
                    ? 'bg-stone-950 border-stone-950 text-stone-50'
                    : 'bg-white border-stone-200/60 hover:border-stone-300 text-stone-600'
                }`}
              >
                <Filter size={16} className={showFilters ? 'text-stone-50' : 'text-stone-600'} strokeWidth={1.5} />
              </button>

              {/* View Mode */}
              <div className="flex bg-white rounded-2xl border border-stone-200/60 p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-xl transition-all duration-200 ${
                    viewMode === 'grid' ? 'bg-stone-100 text-stone-950' : 'hover:bg-stone-50 text-stone-600'
                  }`}
                >
                  <Grid size={16} strokeWidth={1.5} />
                </button>
                <button
                  onClick={() => setViewMode('masonry')}
                  className={`p-2 rounded-xl transition-all duration-200 ${
                    viewMode === 'masonry' ? 'bg-stone-100 text-stone-950' : 'hover:bg-stone-50 text-stone-600'
                  }`}
                >
                  <Eye size={16} strokeWidth={1.5} />
                </button>
              </div>
            </div>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className="bg-white backdrop-blur-sm rounded-3xl border border-stone-200/60 p-6 sm:p-8 shadow-lg">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Sort By */}
                <div className="space-y-4">
                  <label className="text-xs text-stone-500 tracking-[0.2em] uppercase font-light">Sort By</label>
                  <div className="flex flex-col space-y-3">
                    {[
                      { value: 'newest', label: 'Newest First', icon: SortDesc },
                      { value: 'oldest', label: 'Oldest First', icon: SortAsc },
                      { value: 'favorites', label: 'Favorites First', icon: Star }
                    ].map((option) => {
                      const Icon = option.icon;
                      return (
                        <button
                          key={option.value}
                          onClick={() => setSortBy(option.value as 'newest' | 'oldest' | 'favorites')}
                          className={`flex items-center gap-4 p-4 rounded-2xl transition-all duration-200 text-left ${
                            sortBy === option.value
                              ? 'bg-stone-100 border border-stone-200/60 text-stone-950'
                              : 'hover:bg-stone-50 text-stone-600'
                          }`}
                        >
                          <Icon size={16} className={sortBy === option.value ? 'text-stone-950' : 'text-stone-500'} strokeWidth={1.5} />
                          <span className="text-sm font-light">{option.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Filter By */}
                <div className="space-y-4">
                  <label className="text-xs text-stone-500 tracking-[0.2em] uppercase font-light">Filter By</label>
                  <div className="flex flex-col space-y-3">
                    {[
                      { value: 'all', label: 'All Photos', icon: Grid },
                      { value: 'favorites', label: 'Favorites Only', icon: Star },
                      { value: 'recent', label: 'Recent (7 days)', icon: Calendar }
                    ].map((option) => {
                      const Icon = option.icon;
                      return (
                        <button
                          key={option.value}
                          onClick={() => setFilterBy(option.value as 'all' | 'favorites' | 'recent')}
                          className={`flex items-center gap-4 p-4 rounded-2xl transition-all duration-200 text-left ${
                            filterBy === option.value
                              ? 'bg-stone-100 border border-stone-200/60 text-stone-950'
                              : 'hover:bg-stone-50 text-stone-600'
                          }`}
                        >
                          <Icon size={16} className={filterBy === option.value ? 'text-stone-950' : 'text-stone-500'} strokeWidth={1.5} />
                          <span className="text-sm font-light">{option.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Bulk Actions */}
                {selectedImages.size > 0 && (
                  <div className="space-y-4">
                    <label className="text-xs text-stone-500 tracking-[0.2em] uppercase font-light">Bulk Actions</label>
                    <div className="flex flex-col space-y-3">
                      <button
                        onClick={handleBulkDownload}
                        className="flex items-center gap-4 p-4 rounded-2xl hover:bg-stone-50 transition-all duration-200 text-left text-stone-600"
                      >
                        <Download size={16} className="text-stone-500" strokeWidth={1.5} />
                        <span className="text-sm font-light">Download Selected</span>
                      </button>
                      <button
                        onClick={handleBulkDelete}
                        className="flex items-center gap-4 p-4 rounded-2xl hover:bg-red-50 transition-all duration-200 text-left text-red-600"
                      >
                        <Trash2 size={16} className="text-red-500" strokeWidth={1.5} />
                        <span className="text-sm font-light">Delete Selected</span>
                      </button>
                      <button
                        onClick={clearSelection}
                        className="flex items-center gap-4 p-4 rounded-2xl hover:bg-stone-50 transition-all duration-200 text-left text-stone-600"
                      >
                        <X size={16} className="text-stone-500" strokeWidth={1.5} />
                        <span className="text-sm font-light">Clear Selection</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Gallery Grid */}
        <div className={`mt-12 ${viewMode === 'masonry' ? 'columns-2 sm:columns-3 gap-4 sm:gap-6' : 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6'}`}>
        {isLoading ? (
            Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className={`${viewMode === 'masonry' ? 'break-inside-avoid mb-4' : ''} aspect-square bg-stone-200 rounded-2xl animate-pulse`}
              />
            ))
          ) : filteredImages.length === 0 ? (
            <div className="col-span-full text-center py-24">
              <div className="p-8 bg-white rounded-3xl border border-stone-200/60 mb-8 inline-block shadow-lg">
                <Camera size={48} className="text-stone-600" strokeWidth={1.5} />
          </div>
              <h3 className="text-2xl font-serif font-extralight tracking-[0.2em] uppercase text-stone-950 mb-4">
                {searchQuery ? 'No Results Found' : 'No Photos Yet'}
              </h3>
              <p className="text-stone-600 leading-relaxed font-light mb-8 max-w-md mx-auto">
                {searchQuery
                  ? `No photos match "${searchQuery}"`
                  : 'Start creating professional portraits with Maya'
                }
              </p>
              <button
                onClick={() => searchQuery ? setSearchQuery('') : window.location.href = '/app'}
                className="bg-stone-950 text-stone-50 px-8 py-4 text-xs tracking-[0.15em] uppercase font-light rounded-2xl hover:bg-stone-800 transition-colors flex items-center gap-3 mx-auto"
              >
                <Plus size={16} strokeWidth={1.5} />
                {searchQuery ? 'Clear Search' : 'Create First Photo'}
              </button>
          </div>
        ) : (
            filteredImages.map((image, index) => {
              const isSelected = selectedImages.has(image.id);
              const isFavorite = favorites.includes(typeof image.id === 'string' ? parseInt(image.id, 10) : image.id);

              return (
              <div
                key={image.id}
                  className={`${viewMode === 'masonry' ? 'break-inside-avoid mb-4 sm:mb-6' : ''} relative group cursor-pointer`}
              >
                  <div className={`${viewMode === 'masonry' ? 'aspect-[4/5]' : 'aspect-square'} relative overflow-hidden rounded-2xl border-2 transition-all duration-300 ${
                    isSelected
                      ? 'border-stone-950 shadow-xl'
                      : 'border-stone-200/60 hover:border-stone-300/80 hover:shadow-lg'
                  }`}>
                <img
                  src={image.imageUrl || image.url || ''}
                  alt={image.title || 'Generated art'}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      onClick={() => setSelectedImage(image)}
                    />

                    {/* Selection Overlay */}
                    {isSelected && (
                      <div className="absolute inset-0 bg-stone-950/20 backdrop-blur-sm flex items-center justify-center">
                        <div className="w-10 h-10 bg-stone-50 rounded-full flex items-center justify-center shadow-xl">
                          <Check size={18} className="text-stone-950" strokeWidth={2} />
                        </div>
                      </div>
                    )}

                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-stone-950/0 group-hover:bg-stone-950/20 transition-all duration-300"></div>

                    {/* Selection Checkbox */}
                    <div className="absolute top-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleImageSelection(image.id);
                        }}
                        className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                          isSelected
                            ? 'bg-stone-50 border-stone-50'
                            : 'bg-stone-950/50 border-stone-50/50 hover:bg-stone-950/70'
                        }`}
                      >
                        {isSelected && <Check size={14} className="text-stone-950" strokeWidth={2} />}
                      </button>
                    </div>

                    {/* Favorite Indicator */}
                    {isFavorite && (
                      <div className="absolute top-3 right-3">
                        <div className="w-7 h-7 bg-red-500/90 rounded-full flex items-center justify-center backdrop-blur-sm">
                          <Heart size={14} className="text-white fill-current" strokeWidth={1.5} />
                        </div>
                      </div>
                    )}

                    {/* Action Overlay */}
                    <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-stone-950/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="flex justify-between items-center">
                        <div className="space-y-1">
                          <span className="text-stone-50 text-xs tracking-[0.15em] uppercase font-light">
                            IMG_{String(index + 1).padStart(3, '0')}
                          </span>
                          {image.title && (
                            <p className="text-stone-200 text-xs truncate max-w-24 font-light">
                              {image.title}
                            </p>
                          )}
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleFavorite(image.id);
                            }}
                            className="p-2 bg-stone-50/20 backdrop-blur-sm rounded-xl hover:bg-stone-50/30 transition-colors"
                          >
                            <Heart
                              size={14}
                              className={`${isFavorite ? 'text-red-400 fill-current' : 'text-stone-50'}`}
                              strokeWidth={1.5}
                            />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedImage(image);
                            }}
                            className="p-2 bg-stone-50/20 backdrop-blur-sm rounded-xl hover:bg-stone-50/30 transition-colors"
                          >
                            <Eye size={14} className="text-stone-50" strokeWidth={1.5} />
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

        {/* Load more */}
        {filteredImages.length > 0 && (
          <div className="text-center pt-12">
            <button className="text-stone-600 text-sm tracking-[0.15em] uppercase font-light hover:text-stone-950 transition-colors px-8 py-4 rounded-2xl hover:bg-stone-100">
              Load More Photos
            </button>
          </div>
        )}

        {/* Floating Bulk Actions Bar */}
        {selectedImages.size > 0 && (
          <div className="fixed bottom-24 left-1/2 transform -translate-x-1/2 z-40">
            <div className="bg-stone-50/95 backdrop-blur-2xl rounded-3xl border border-stone-200/60 px-8 py-6 shadow-2xl">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-3">
                  <Check size={16} className="text-stone-950" strokeWidth={1.5} />
                  <span className="text-sm text-stone-950 font-light tracking-[0.1em] uppercase">
                    {selectedImages.size} Selected
                  </span>
                </div>

                <div className="w-px h-6 bg-stone-200"></div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={handleBulkDownload}
                    className="flex items-center gap-2 px-6 py-3 bg-stone-100 rounded-2xl hover:bg-stone-200 transition-colors"
                  >
                    <Download size={14} className="text-stone-600" strokeWidth={1.5} />
                    <span className="text-xs text-stone-600 tracking-[0.1em] uppercase font-light">Download</span>
                  </button>

                  <button
                    onClick={handleBulkDelete}
                    className="flex items-center gap-2 px-6 py-3 bg-red-50 rounded-2xl hover:bg-red-100 transition-colors"
                  >
                    <Trash2 size={14} className="text-red-600" strokeWidth={1.5} />
                    <span className="text-xs text-red-600 tracking-[0.1em] uppercase font-light">Delete</span>
                  </button>

                  <button
                    onClick={clearSelection}
                    className="flex items-center gap-2 px-6 py-3 bg-stone-100 rounded-2xl hover:bg-stone-200 transition-colors"
                  >
                    <X size={14} className="text-stone-600" strokeWidth={1.5} />
                    <span className="text-xs text-stone-600 tracking-[0.1em] uppercase font-light">Clear</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Image Detail Modal */}
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

      {/* P3-C: Brand Asset Placement Modal */}
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

export default function SSELFIEGalleryWithErrorBoundary(props: { hideMemberNav?: boolean }) {
  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-stone-50">
        {!props?.hideMemberNav && <MemberNavigation />}
        <GalleryScreen />
      </div>
    </ErrorBoundary>
  );
}
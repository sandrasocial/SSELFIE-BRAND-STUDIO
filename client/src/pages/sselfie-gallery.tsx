import React, { useState } from 'react';
import { useAuth } from '../hooks/use-auth.js';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MemberNavigation } from '../components/member-navigation.js';
import { apiRequest } from '../lib/queryClient.js';
import { apiFetch } from '../lib/api.js';
import ErrorBoundary from '../components/ErrorBoundary.js';
import StoryStudioModal from '../components/StoryStudioModal.js';
import BrandAssetPlacementModal from '../components/BrandAssetPlacementModal.js';
import { VideoGenerateDialog } from '../features/video/index.js';
import { Camera, Grid, Search, MoreHorizontal, Heart, Download, Trash2, Play, Plus, Filter, Calendar, Star, Eye, X, Check, SortAsc, SortDesc } from 'lucide-react';

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
        className="editorial-modal max-w-6xl max-h-[95vh] w-full flex flex-col bg-stone-950/95 backdrop-blur-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-stone-800/30">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-stone-800/40 rounded-editorial-md border border-stone-700/30">
              <Camera size={20} strokeWidth={1.2} className="text-stone-400" />
            </div>
            <div>
              <h3 className="editorial-heading-2 text-stone-200" style={{fontFamily: 'Times New Roman, serif'}}>IMAGE DETAILS</h3>
              <p className="editorial-text-caption text-neutral-500">Professional Portrait</p>
            </div>
          </div>
          
        <button
          onClick={onClose}
            className="p-2 hover:bg-neutral-800/40 rounded-editorial-md transition-colors"
          aria-label="Close modal"
        >
            <MoreHorizontal size={20} className="text-neutral-400" strokeWidth={1.5} />
        </button>
        </div>
        
        {/* Image */}
        <div className="flex-1 flex items-center justify-center p-8 bg-gradient-to-br from-stone-900/50 to-stone-800/30">
          <img 
            src={selectedImage.imageUrl || selectedImage.url || ''} 
            alt={selectedImage.title || 'Gallery image'} 
            className="max-w-full max-h-[60vh] object-contain rounded-editorial-lg shadow-editorial-xl"
          />
        </div>
        
        {/* Actions */}
        <div className="p-6 border-t border-stone-800/30 bg-gradient-to-r from-stone-900/50 to-stone-800/30">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <button 
              onClick={onToggleFavorite}
              className="editorial-button-secondary flex items-center justify-center gap-2 py-3"
            >
              <Heart size={16} className={isFavorite ? 'text-red-400 fill-current' : 'text-neutral-400'} strokeWidth={1.5} />
              {isFavorite ? 'UNFAVORITE' : 'FAVORITE'}
            </button>
            
            <button 
              onClick={onCreateVideo}
              className="editorial-button-secondary flex items-center justify-center gap-2 py-3"
            >
              <Play size={16} className="text-neutral-400" strokeWidth={1.5} />
              MAKE VIDEO
            </button>
            
            {/* P3-C: Brand Asset Placement Feature */}
            {process.env.REACT_APP_BRAND_ASSETS_ENABLED === '1' && (
              <button 
                onClick={onPlaceBrandAsset}
                className="editorial-button-secondary flex items-center justify-center gap-2 py-3"
              >
                <Plus size={16} className="text-neutral-400" strokeWidth={1.5} />
                BRAND ASSET
              </button>
            )}
            
            <button 
              onClick={onDownload}
              className="editorial-button-secondary flex items-center justify-center gap-2 py-3"
            >
              <Download size={16} className="text-neutral-400" strokeWidth={1.5} />
              DOWNLOAD
            </button>
            
            <button 
              onClick={onDelete}
              className="editorial-button-secondary flex items-center justify-center gap-2 py-3 text-red-400 hover:text-red-300 hover:bg-red-900/20"
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

function SSELFIEGallery({ hideMemberNav = false }: { hideMemberNav?: boolean }) {
  const { user, isAuthenticated } = useAuth();
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [isVideoDialogOpen, setIsVideoDialogOpen] = useState(false);
  const [isBrandPlacementModalOpen, setIsBrandPlacementModalOpen] = useState(false);
  const [selectedImages, setSelectedImages] = useState<Set<string | number>>(new Set());
  const [viewMode, setViewMode] = useState<'grid' | 'masonry'>('grid');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'favorites'>('newest');
  const [filterBy, setFilterBy] = useState<'all' | 'favorites' | 'recent'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
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

  const handleOpenVideoDialog = () => {
    setIsVideoDialogOpen(true);
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
    handleOpenVideoDialog();
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
      <div className="min-h-screen bg-black">
        {!hideMemberNav && <MemberNavigation />}
        <div className="flex items-center justify-center min-h-screen p-6">
          <div className="text-center">
            <div className="p-6 bg-neutral-800/40 rounded-editorial-xl border border-neutral-700/30 mb-6 inline-block">
              <Camera size={48} className="text-neutral-400 mx-auto" strokeWidth={1.5} />
            </div>
            <h1 className="editorial-heading-1 text-neutral-200 mb-4">AUTHENTICATION REQUIRED</h1>
            <p className="editorial-text-body text-neutral-400">Please sign in to access your luxury gallery.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Luxury Background with Parallax Effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-stone-950 to-stone-900">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-15"
          style={{
            backgroundImage: 'url(/flatlay-luxury-planning.jpg)',
            backgroundAttachment: 'fixed',
            backgroundPosition: 'center center'
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-black/85 via-stone-950/70 to-black/85" />
      </div>
      
      {!hideMemberNav && <MemberNavigation />}
      
      {/* Luxury Gallery Container */}
      <div className="relative z-10 p-6">
        {/* Enhanced Gallery Header */}
        <div className="space-y-6">
          {/* Main Header */}
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <h2 className="editorial-heading-1 text-stone-200" style={{fontFamily: 'Times New Roman, serif', letterSpacing: '0.3em'}}>GALLERY</h2>
              <p className="editorial-text-caption text-neutral-500">Curated Collection</p>
              
              {/* Gallery Stats */}
              <div className="flex items-center gap-6 pt-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-neutral-400 rounded-full"></div>
                  <span className="text-xs text-neutral-400 tracking-wide">
                    {galleryStats.total} PHOTOS
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Star size={12} className="text-neutral-400" strokeWidth={1.5} />
                  <span className="text-xs text-neutral-400 tracking-wide">
                    {galleryStats.favorites} FAVORITES
                  </span>
                </div>
                {selectedImages.size > 0 && (
                  <div className="flex items-center gap-2">
                    <Check size={12} className="text-neutral-300" strokeWidth={1.5} />
                    <span className="text-xs text-neutral-300 tracking-wide">
                      {selectedImages.size} SELECTED
                    </span>
                  </div>
                )}
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              {/* Search */}
              <div className="relative">
                <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400" strokeWidth={1.5} />
                <input
                  type="text"
                  placeholder="Search photos..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 bg-stone-800/40 border border-stone-700/30 rounded-lg text-stone-200 text-sm placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-stone-600/50 w-48"
                />
              </div>
              
              {/* Filter Toggle */}
              <button 
                onClick={() => setShowFilters(!showFilters)}
                className={`p-3 rounded-lg border transition-all duration-200 ${
                  showFilters 
                    ? 'bg-neutral-700/40 border-neutral-600/50' 
                    : 'bg-stone-800/40 border-stone-700/30 hover:bg-stone-700/40'
                }`}
              >
                <Filter size={18} className="text-neutral-400" strokeWidth={1.5} />
              </button>
              
              {/* View Mode */}
              <div className="flex bg-neutral-800/40 rounded-lg border border-neutral-700/30 p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-md transition-all duration-200 ${
                    viewMode === 'grid' ? 'bg-neutral-700/60' : 'hover:bg-neutral-700/40'
                  }`}
                >
                  <Grid size={16} className="text-neutral-400" strokeWidth={1.5} />
                </button>
                <button
                  onClick={() => setViewMode('masonry')}
                  className={`p-2 rounded-md transition-all duration-200 ${
                    viewMode === 'masonry' ? 'bg-neutral-700/60' : 'hover:bg-neutral-700/40'
                  }`}
                >
                  <Eye size={16} className="text-neutral-400" strokeWidth={1.5} />
                </button>
              </div>
            </div>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className="bg-neutral-800/20 backdrop-blur-sm rounded-editorial-lg border border-neutral-700/30 p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Sort By */}
                <div className="space-y-3">
                  <label className="text-xs text-neutral-400 tracking-wide uppercase">Sort By</label>
                  <div className="flex flex-col space-y-2">
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
                          className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-200 ${
                            sortBy === option.value
                              ? 'bg-neutral-700/40 border border-neutral-600/50'
                              : 'hover:bg-neutral-700/20'
                          }`}
                        >
                          <Icon size={16} className="text-neutral-400" strokeWidth={1.5} />
                          <span className="text-sm text-neutral-300">{option.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Filter By */}
                <div className="space-y-3">
                  <label className="text-xs text-neutral-400 tracking-wide uppercase">Filter By</label>
                  <div className="flex flex-col space-y-2">
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
                          className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-200 ${
                            filterBy === option.value
                              ? 'bg-neutral-700/40 border border-neutral-600/50'
                              : 'hover:bg-neutral-700/20'
                          }`}
                        >
                          <Icon size={16} className="text-neutral-400" strokeWidth={1.5} />
                          <span className="text-sm text-neutral-300">{option.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Bulk Actions */}
                {selectedImages.size > 0 && (
                  <div className="space-y-3">
                    <label className="text-xs text-neutral-400 tracking-wide uppercase">Bulk Actions</label>
                    <div className="flex flex-col space-y-2">
                      <button
                        onClick={handleBulkDownload}
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-neutral-700/20 transition-all duration-200"
                      >
                        <Download size={16} className="text-neutral-400" strokeWidth={1.5} />
                        <span className="text-sm text-neutral-300">Download Selected</span>
                      </button>
                      <button
                        onClick={handleBulkDelete}
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-red-900/20 transition-all duration-200"
                      >
                        <Trash2 size={16} className="text-red-400" strokeWidth={1.5} />
                        <span className="text-sm text-red-300">Delete Selected</span>
                      </button>
                      <button
                        onClick={clearSelection}
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-neutral-700/20 transition-all duration-200"
                      >
                        <X size={16} className="text-neutral-400" strokeWidth={1.5} />
                        <span className="text-sm text-neutral-300">Clear Selection</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        
        {/* Enhanced Gallery Grid */}
        <div className={`mt-8 ${viewMode === 'masonry' ? 'columns-2 gap-3' : 'grid grid-cols-2 gap-3'}`}>
        {isLoading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div 
                key={i} 
                className={`${viewMode === 'masonry' ? 'break-inside-avoid mb-3' : ''} aspect-square bg-neutral-800/30 rounded-editorial-lg animate-pulse border border-neutral-700/20`} 
              />
            ))
          ) : filteredImages.length === 0 ? (
            <div className="col-span-2 text-center py-20">
              <div className="p-8 bg-neutral-800/20 rounded-editorial-xl border border-neutral-700/20 mb-6 inline-block">
                <Camera size={48} className="text-neutral-600" strokeWidth={1.5} />
          </div>
              <h3 className="editorial-heading-2 text-neutral-300 mb-2">
                {searchQuery ? 'NO RESULTS FOUND' : 'NO PHOTOS YET'}
              </h3>
              <p className="editorial-text-body text-neutral-500 mb-6">
                {searchQuery 
                  ? `No photos match "${searchQuery}"` 
                  : 'Start creating professional portraits with Maya'
                }
              </p>
              <button className="editorial-button">
                <Plus className="mr-2 inline" size={18} strokeWidth={1.5} />
                {searchQuery ? 'CLEAR SEARCH' : 'CREATE FIRST PHOTO'}
              </button>
          </div>
        ) : (
            filteredImages.map((image, index) => {
              const isSelected = selectedImages.has(image.id);
              const isFavorite = favorites.includes(typeof image.id === 'string' ? parseInt(image.id, 10) : image.id);
              
              return (
              <div 
                key={image.id} 
                  className={`${viewMode === 'masonry' ? 'break-inside-avoid mb-3' : ''} relative group cursor-pointer`}
              >
                  <div className={`${viewMode === 'masonry' ? 'aspect-[4/5]' : 'aspect-square'} relative overflow-hidden rounded-editorial-lg border-2 transition-all duration-300 ${
                    isSelected 
                      ? 'border-neutral-300 shadow-editorial-lg' 
                      : 'border-neutral-700/20 hover:border-neutral-600/40'
                  }`}>
                <img 
                  src={image.imageUrl || image.url || ''} 
                  alt={image.title || 'Generated art'} 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      onClick={() => setSelectedImage(image)}
                    />
                    
                    {/* Selection Overlay */}
                    {isSelected && (
                      <div className="absolute inset-0 bg-neutral-300/20 backdrop-blur-sm flex items-center justify-center">
                        <div className="w-8 h-8 bg-neutral-200 rounded-full flex items-center justify-center shadow-lg">
                          <Check size={16} className="text-black" strokeWidth={2} />
                        </div>
                      </div>
                    )}
                    
                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300"></div>
                    
                    {/* Selection Checkbox */}
                    <div className="absolute top-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleImageSelection(image.id);
                        }}
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                          isSelected
                            ? 'bg-neutral-200 border-neutral-200'
                            : 'bg-black/50 border-white/50 hover:bg-black/70'
                        }`}
                      >
                        {isSelected && <Check size={12} className="text-black" strokeWidth={2} />}
                      </button>
                    </div>
                    
                    {/* Favorite Indicator */}
                    {isFavorite && (
                      <div className="absolute top-3 right-3">
                        <div className="w-6 h-6 bg-red-500/90 rounded-full flex items-center justify-center backdrop-blur-sm">
                          <Heart size={12} className="text-white fill-current" strokeWidth={1.5} />
                        </div>
                      </div>
                    )}
                    
                    {/* Action Overlay */}
                    <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="flex justify-between items-center">
                        <div className="space-y-1">
                          <span className="text-white text-xs tracking-wide font-light">
                            IMG_{String(index + 1).padStart(3, '0')}
                          </span>
                          {image.title && (
                            <p className="text-white/80 text-xs truncate max-w-24">
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
                            className="p-1.5 bg-white/20 backdrop-blur-sm rounded-editorial-md hover:bg-white/30 transition-colors"
                          >
                            <Heart 
                              size={14} 
                              className={`${isFavorite ? 'text-red-400 fill-current' : 'text-white'}`} 
                              strokeWidth={1.5} 
                            />
                          </button>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedImage(image);
                            }}
                            className="p-1.5 bg-white/20 backdrop-blur-sm rounded-editorial-md hover:bg-white/30 transition-colors"
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

        {/* Load more - enhanced */}
        {filteredImages.length > 0 && (
          <div className="text-center pt-8">
            <button className="text-neutral-400 text-sm tracking-wide hover:text-neutral-300 transition-colors px-6 py-3 rounded-editorial-lg hover:bg-neutral-800/20">
              LOAD MORE
            </button>
          </div>
        )}

        {/* Floating Bulk Actions Bar */}
        {selectedImages.size > 0 && (
          <div className="fixed bottom-24 left-1/2 transform -translate-x-1/2 z-40">
            <div className="bg-neutral-900/95 backdrop-blur-2xl rounded-editorial-xl border border-neutral-700/30 px-6 py-4 shadow-editorial-xl">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Check size={16} className="text-neutral-300" strokeWidth={1.5} />
                  <span className="text-sm text-neutral-300 font-light">
                    {selectedImages.size} SELECTED
                  </span>
                </div>
                
                <div className="w-px h-6 bg-neutral-700/50"></div>
                
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleBulkDownload}
                    className="flex items-center gap-2 px-4 py-2 bg-neutral-800/40 rounded-editorial-md hover:bg-neutral-700/40 transition-colors"
                  >
                    <Download size={14} className="text-neutral-400" strokeWidth={1.5} />
                    <span className="text-xs text-neutral-300 tracking-wide">DOWNLOAD</span>
                  </button>
                  
                  <button
                    onClick={handleBulkDelete}
                    className="flex items-center gap-2 px-4 py-2 bg-red-900/20 rounded-editorial-md hover:bg-red-900/30 transition-colors"
                  >
                    <Trash2 size={14} className="text-red-400" strokeWidth={1.5} />
                    <span className="text-xs text-red-300 tracking-wide">DELETE</span>
                  </button>
                  
                  <button
                    onClick={clearSelection}
                    className="flex items-center gap-2 px-4 py-2 bg-neutral-800/40 rounded-editorial-md hover:bg-neutral-700/40 transition-colors"
                  >
                    <X size={14} className="text-neutral-400" strokeWidth={1.5} />
                    <span className="text-xs text-neutral-300 tracking-wide">CLEAR</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Image Detail Modal */}
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

      {/* VideoGenerateDialog */}
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
            // Video generation completed
            queryClient.invalidateQueries({ queryKey: ['/api/gallery-images'] });
          }}
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
      <SSELFIEGallery hideMemberNav={props?.hideMemberNav} />
    </ErrorBoundary>
  );
}
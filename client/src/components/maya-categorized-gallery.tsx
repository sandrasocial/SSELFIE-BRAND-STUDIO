import React, { useState } from 'react';
import { useAuth } from '../hooks/use-auth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '../lib/queryClient';

interface ImageData {
  id: number;
  imageUrl: string;
  category?: string;
  prompt?: string;
  createdAt: string;
}

interface CategoryCardProps {
  category: string;
  imageCount: number;
  recentImage?: string;
  onClick: () => void;
  isActive: boolean;
}

const CategoryCard: React.FC<CategoryCardProps> = ({ 
  category, 
  imageCount, 
  recentImage, 
  onClick, 
  isActive 
}) => (
  <div 
    onClick={onClick}
    className={`relative bg-white rounded-lg overflow-hidden cursor-pointer transition-all duration-300 
      ${isActive ? 'ring-2 ring-black' : 'hover:shadow-lg'}`}
  >
    <div 
      className="h-32 bg-cover bg-center relative"
      style={{
        backgroundImage: recentImage 
          ? `linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.5)), url('${recentImage}')`
          : `linear-gradient(135deg, #000000, #333333)`,
        backgroundPosition: '50% 30%'
      }}
    >
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div 
          className="text-white text-center text-sm font-light tracking-[0.3em] uppercase opacity-95 mb-2"
          style={{ fontFamily: 'Times New Roman, serif' }}
        >
          {category}
        </div>
        <div className="text-white/70 text-xs tracking-[0.2em]">
          {imageCount} {imageCount === 1 ? 'IMAGE' : 'IMAGES'}
        </div>
      </div>
    </div>
  </div>
);

interface ImageCardProps {
  image: ImageData;
  onImageClick: (image: ImageData) => void;
  favorites: number[];
  downloadingImages: Set<string>;
  onToggleFavorite: (imageId: number) => void;
  onDownloadImage: (imageUrl: string, filename: string) => void;
  onDeleteImage: (imageId: number) => void;
  index: number;
  isToggling: boolean;
  isDeleting: boolean;
}

const ImageCard: React.FC<ImageCardProps> = ({ 
  image, 
  onImageClick, 
  favorites, 
  downloadingImages, 
  onToggleFavorite, 
  onDownloadImage, 
  onDeleteImage, 
  index,
  isToggling,
  isDeleting 
}) => (
  <div
    style={{
      position: 'relative',
      overflow: 'hidden',
      background: '#f5f5f5',
      aspectRatio: '3/4',
      cursor: 'pointer'
    }}
    onClick={() => onImageClick(image)}
  >
    <img 
      src={image.imageUrl}
      alt={`Maya Generated ${index + 1}`}
      style={{
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        transition: 'transform 1000ms cubic-bezier(0.4, 0, 0.2, 1)'
      }}
      onMouseEnter={(e) => {
        (e.target as HTMLImageElement).style.transform = 'scale(1.05)';
      }}
      onMouseLeave={(e) => {
        (e.target as HTMLImageElement).style.transform = 'scale(1)';
      }}
    />
    
    {/* Favorite Heart Button */}
    <button
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onToggleFavorite(image.id);
      }}
      onMouseDown={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
      disabled={isToggling}
      className="touch-manipulation"
      style={{
        position: 'absolute',
        top: 'clamp(12px, 3vw, 16px)',
        right: 'clamp(12px, 3vw, 16px)',
        background: 'rgba(0, 0, 0, 0.6)',
        border: 'none',
        color: favorites.includes(image.id) ? '#ff4444' : '#ffffff',
        fontSize: 'clamp(18px, 4vw, 20px)',
        padding: 'clamp(10px, 2.5vw, 12px)',
        cursor: isToggling ? 'wait' : 'pointer',
        borderRadius: '50%',
        transition: 'all 300ms ease',
        backdropFilter: 'blur(10px)',
        zIndex: 10,
        minWidth: '44px',
        minHeight: '44px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
      onMouseEnter={(e) => {
        if (!isToggling) {
          (e.target as HTMLButtonElement).style.background = 'rgba(0, 0, 0, 0.8)';
          (e.target as HTMLButtonElement).style.transform = 'scale(1.1)';
        }
      }}
      onMouseLeave={(e) => {
        if (!isToggling) {
          (e.target as HTMLButtonElement).style.background = 'rgba(0, 0, 0, 0.6)';
          (e.target as HTMLButtonElement).style.transform = 'scale(1)';
        }
      }}
    >
      {isToggling ? (
        <div style={{
          width: '16px',
          height: '16px',
          border: '2px solid rgba(255, 255, 255, 0.3)',
          borderTop: '2px solid #ffffff',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
      ) : (
        favorites.includes(image.id) ? '♥' : '♡'
      )}
    </button>
    
    {/* Hover Overlay with Actions */}
    <div style={{
      position: 'absolute',
      inset: 0,
      background: 'linear-gradient(to bottom, transparent 50%, rgba(10, 10, 10, 0.9) 100%)',
      opacity: 0,
      transition: 'opacity 500ms ease',
      display: 'flex',
      alignItems: 'flex-end',
      padding: '30px'
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.opacity = '1';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.opacity = '0';
    }}>
      <div style={{ width: '100%' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <h4 style={{
              color: '#ffffff',
              fontSize: '11px',
              fontWeight: 400,
              letterSpacing: '0.3em',
              textTransform: 'uppercase',
              marginBottom: '4px'
            }}>
              MAYA {index + 1}
            </h4>
            <p style={{
              color: 'rgba(255, 255, 255, 0.8)',
              fontSize: '12px',
              margin: 0
            }}>
              {image.prompt ? image.prompt.substring(0, 40) + '...' : 'AI Generated Photo'}
            </p>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            {/* Download Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDownloadImage(image.imageUrl, `maya-${index + 1}.jpg`);
              }}
              disabled={downloadingImages.has(image.imageUrl)}
              className="touch-manipulation"
              style={{
                background: 'rgba(255, 255, 255, 0.2)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                color: '#ffffff',
                padding: '6px 10px',
                fontSize: '9px',
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                cursor: downloadingImages.has(image.imageUrl) ? 'wait' : 'pointer',
                transition: 'all 300ms ease',
                minWidth: '60px',
                minHeight: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px'
              }}
              onMouseEnter={(e) => {
                if (!downloadingImages.has(image.imageUrl)) {
                  (e.target as HTMLButtonElement).style.background = '#ffffff';
                  (e.target as HTMLButtonElement).style.color = '#0a0a0a';
                }
              }}
              onMouseLeave={(e) => {
                if (!downloadingImages.has(image.imageUrl)) {
                  (e.target as HTMLButtonElement).style.background = 'rgba(255, 255, 255, 0.2)';
                  (e.target as HTMLButtonElement).style.color = '#ffffff';
                }
              }}
            >
              {downloadingImages.has(image.imageUrl) ? 'DOWNLOADING...' : 'DOWNLOAD'}
            </button>
            
            {/* Delete Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (window.confirm('Are you sure you want to delete this image?')) {
                  onDeleteImage(image.id);
                }
              }}
              disabled={isDeleting}
              className="touch-manipulation"
              style={{
                background: 'rgba(220, 38, 38, 0.8)',
                border: '1px solid rgba(220, 38, 38, 0.5)',
                color: '#ffffff',
                padding: '6px 10px',
                fontSize: '9px',
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                cursor: isDeleting ? 'wait' : 'pointer',
                transition: 'all 300ms ease',
                minWidth: '55px',
                minHeight: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              onMouseEnter={(e) => {
                if (!isDeleting) {
                  (e.target as HTMLButtonElement).style.background = 'rgba(220, 38, 38, 1)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isDeleting) {
                  (e.target as HTMLButtonElement).style.background = 'rgba(220, 38, 38, 0.8)';
                }
              }}
            >
              {isDeleting ? 'DELETING...' : 'DELETE'}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export function MayaCategorizedGallery() {
  const { user, isAuthenticated } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedImage, setSelectedImage] = useState<ImageData | null>(null);
  const [downloadingImages, setDownloadingImages] = useState(new Set<string>());
  const queryClient = useQueryClient();

  // Fetch Maya-generated images
  const { data: mayaImages = [], isLoading } = useQuery<ImageData[]>({
    queryKey: ['/api/maya/generated-images'],
    enabled: isAuthenticated && !!user,
    staleTime: 30000, // 30 seconds
  });

  // Fetch user's favorites
  const { data: favoritesData } = useQuery<{ favorites: number[] }>({
    queryKey: ['/api/images/favorites'],
    enabled: isAuthenticated && !!user,
    staleTime: 30000,
  });

  const favorites: number[] = favoritesData?.favorites || [];

  // Toggle favorite mutation
  const toggleFavoriteMutation = useMutation({
    mutationFn: async (imageId: number) => {
      const response = await apiRequest(`/api/images/${imageId}/favorite`, 'POST');
      return response;
    },
    onSuccess: () => {
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
      queryClient.invalidateQueries({ queryKey: ['/api/maya/generated-images'] });
      queryClient.invalidateQueries({ queryKey: ['/api/images/favorites'] });
    }
  });

  // Download image function
  const downloadImage = async (imageUrl: string, filename: string) => {
    try {
      setDownloadingImages(prev => new Set([...prev, imageUrl]));
      
      if (!imageUrl || !imageUrl.startsWith('http')) {
        console.log('Skipping invalid URL:', imageUrl);
        return;
      }
      
      const link = document.createElement('a');
      link.href = imageUrl;
      link.download = filename;
      link.setAttribute('crossorigin', 'anonymous');
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      console.log(`Download initiated for: ${filename}`);
      
    } catch (error) {
      console.error('Error downloading image:', error);
      alert('Download failed. Please right-click the image and select "Save image as..." to download manually.');
    } finally {
      setTimeout(() => {
        setDownloadingImages(prev => {
          const newSet = new Set(prev);
          newSet.delete(imageUrl);
          return newSet;
        });
      }, 1000);
    }
  };

  // Categorize images
  const categories = ['Business', 'Fashion', 'Lifestyle', 'Travel'];
  
  const categorizedImages = categories.reduce((acc, category) => {
    acc[category] = mayaImages.filter(img => 
      img.category?.toLowerCase() === category.toLowerCase() ||
      img.prompt?.toLowerCase().includes(category.toLowerCase())
    );
    return acc;
  }, {} as Record<string, ImageData[]>);

  // Get recent image for each category (for card backgrounds)
  const getRecentImageForCategory = (category: string) => {
    const categoryImages = categorizedImages[category];
    return categoryImages.length > 0 ? categoryImages[0].imageUrl : undefined;
  };

  // Get images to display
  const imagesToDisplay = selectedCategory === 'all' 
    ? mayaImages 
    : categorizedImages[selectedCategory] || [];

  const handleImageClick = (image: ImageData) => {
    setSelectedImage(image);
  };

  const closeModal = () => {
    setSelectedImage(null);
  };

  const toggleFavorite = (imageId: number) => {
    toggleFavoriteMutation.mutate(imageId);
  };

  const deleteImage = (imageId: number) => {
    deleteImageMutation.mutate(imageId);
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="bg-gray-50 border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-8 py-12">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="eyebrow text-gray-500 mb-4">
            Maya • Generated Portfolio
          </div>
          <h2 
            className="text-3xl font-light uppercase tracking-[0.2em] text-black mb-6"
            style={{ fontFamily: 'Times New Roman, serif' }}
          >
            Your Personal Brand Gallery
          </h2>
          <div className="w-32 h-px bg-black mx-auto"></div>
        </div>

        {/* Category Navigation Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
          {categories.map((category) => (
            <CategoryCard
              key={category}
              category={category}
              imageCount={categorizedImages[category]?.length || 0}
              recentImage={getRecentImageForCategory(category)}
              onClick={() => setSelectedCategory(category)}
              isActive={selectedCategory === category}
            />
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center mb-8">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-8 py-3 border transition-all duration-300 ${
              selectedCategory === 'all' 
                ? 'bg-black text-white border-black' 
                : 'bg-white text-black border-gray-300 hover:border-black'
            }`}
          >
            <div className="text-xs font-normal uppercase tracking-[0.3em]">
              View All ({mayaImages.length})
            </div>
          </button>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center items-center h-64">
            <div className="flex space-x-2">
              <div className="w-3 h-3 bg-black rounded-full animate-bounce"></div>
              <div className="w-3 h-3 bg-black rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
              <div className="w-3 h-3 bg-black rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></div>
            </div>
          </div>
        )}

        {/* Images Grid */}
        {!isLoading && imagesToDisplay.length > 0 && (
          <>
            {selectedCategory !== 'all' && (
              <div className="mb-6">
                <h3 
                  className="text-xl font-light uppercase tracking-[0.2em] text-black"
                  style={{ fontFamily: 'Times New Roman, serif' }}
                >
                  {selectedCategory} • {imagesToDisplay.length} {imagesToDisplay.length === 1 ? 'Image' : 'Images'}
                </h3>
              </div>
            )}
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(clamp(250px, 40vw, 300px), 1fr))',
              gap: 'clamp(16px, 4vw, 30px)',
              padding: '0 20px'
            }}>
              {imagesToDisplay.map((image, index) => (
                <ImageCard
                  key={image.id}
                  image={image}
                  onImageClick={handleImageClick}
                  favorites={favorites}
                  downloadingImages={downloadingImages}
                  onToggleFavorite={toggleFavorite}
                  onDownloadImage={downloadImage}
                  onDeleteImage={deleteImage}
                  index={index}
                  isToggling={toggleFavoriteMutation.isPending}
                  isDeleting={deleteImageMutation.isPending}
                />
              ))}
            </div>
          </>
        )}

        {/* Empty State */}
        {!isLoading && imagesToDisplay.length === 0 && (
          <div className="text-center py-16">
            <div className="text-gray-400 mb-4">
              {selectedCategory === 'all' 
                ? 'No images generated yet' 
                : `No ${selectedCategory.toLowerCase()} images yet`}
            </div>
            <div className="text-sm text-gray-500">
              Start a conversation with Maya to create your first personalized images
            </div>
          </div>
        )}
      </div>

      {/* Image Modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-8"
          onClick={closeModal}
        >
          <div className="relative max-w-4xl max-h-full">
            <img 
              src={selectedImage.imageUrl} 
              alt={`Generated image ${selectedImage.id}`}
              className="max-w-full max-h-full object-contain"
              onClick={(e) => e.stopPropagation()}
            />
            <button 
              onClick={closeModal}
              className="absolute top-4 right-4 text-white text-2xl w-8 h-8 flex items-center justify-center hover:bg-white/20 rounded-full transition-colors"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
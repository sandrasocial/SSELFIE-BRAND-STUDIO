import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../hooks/use-auth';

interface ImageData {
  id: number;
  imageUrl: string;
  prompt: string;
  category?: string;
  createdAt: string;
  isFavorite?: boolean;
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
}

const ImageCard: React.FC<ImageCardProps> = ({ image, onImageClick }) => {
  return (
    <div 
      className="relative bg-white border border-gray-200 overflow-hidden cursor-pointer group transition-all duration-300 hover:shadow-lg"
      onClick={() => onImageClick(image)}
    >
      <div className="relative w-full h-64" style={{ aspectRatio: '1/1' }}>
        <img 
          src={image.imageUrl} 
          alt={`Generated image ${image.id}`}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: 'block'
          }}
          loading="lazy"
          onLoad={() => {
            console.log('✅ Maya gallery image loaded:', image.imageUrl.substring(0, 80) + '...');
          }}
          onError={(e) => {
            console.log('❌ Maya gallery image error:', image.imageUrl.substring(0, 80) + '...');
            (e.target as HTMLImageElement).style.backgroundColor = 'red';
            (e.target as HTMLImageElement).style.opacity = '0.5';
          }}
        />
      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300" />
      
      {/* Image info overlay */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-all duration-300">
        <div className="text-white text-xs font-light tracking-[0.1em]">
          {new Date(image.createdAt).toLocaleDateString()}
        </div>
      </div>
    </div>
  </div>
);};

export function MayaCategorizedGallery() {
  const { user, isAuthenticated } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedImage, setSelectedImage] = useState<ImageData | null>(null);

  // Fetch Maya-generated images
  const { data: mayaImages = [], isLoading } = useQuery<ImageData[]>({
    queryKey: ['/api/maya/generated-images'],
    enabled: isAuthenticated && !!user,
    staleTime: 30000, // 30 seconds
  });

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
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {imagesToDisplay.map((image) => (
                <ImageCard
                  key={image.id}
                  image={image}
                  onImageClick={handleImageClick}
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
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card } from '../ui/card';
import { ScrollArea } from '../ui/scroll-area';
import { Check, Image, Sparkles } from 'lucide-react';
import { cleanedFlatlayCollections } from '../../data/cleaned-flatlay-collections';

interface RealImageSelectionProps {
  onSelectionComplete: (selected: {
    aiPhotos: any[];
    flatlayImages: string[];
  }) => void;
}

export const RealImageSelection: React.FC<RealImageSelectionProps> = ({ 
  onSelectionComplete 
}) => {
  const [selectedAIPhotos, setSelectedAIPhotos] = useState<any[]>([]);
  const [selectedFlatlayImages, setSelectedFlatlayImages] = useState<string[]>([]);

  // Fetch user's actual AI-generated photos from the same endpoint used in sselfie-gallery
  const { data: aiImages = [], isLoading: loadingAI } = useQuery<any[]>({
    queryKey: ['/api/gallery-images'],
    retry: false,
  });

  // Fetch user's favorites for UI indication
  const { data: favoritesData } = useQuery<{ favorites: number[] }>({
    queryKey: ['/api/images/favorites'],
    retry: false,
  });

  const favorites = favoritesData?.favorites || [];

  const handleAIPhotoSelect = (photo: any) => {
    setSelectedAIPhotos(prev => {
      if (prev.find(p => p.id === photo.id)) {
        return prev.filter(p => p.id !== photo.id);
      } else if (prev.length < 8) { // Max 8 photos for website
        return [...prev, photo];
      }
      return prev;
    });
  };

  const handleFlatlaySelect = (imageUrl: string) => {
    setSelectedFlatlayImages(prev => {
      if (prev.includes(imageUrl)) {
        return prev.filter(url => url !== imageUrl);
      } else if (prev.length < 5) { // Max 5 flatlay images
        return [...prev, imageUrl];
      }
      return prev;
    });
  };

  const handleContinue = () => {
    onSelectionComplete({
      aiPhotos: selectedAIPhotos,
      flatlayImages: selectedFlatlayImages
    });
  };

  const totalSelected = selectedAIPhotos.length + selectedFlatlayImages.length;

  if (loadingAI) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-black border-t-transparent rounded-full mb-4 mx-auto" />
          <p className="system-text">Loading your gallery...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-12 p-6 bg-pure-white">
      <div>
        <h2 className="editorial-headline mb-2">Choose Photos That Show the Real You</h2>
        <p className="system-text text-soft-gray mb-8">
          Pick images that capture your authentic style and personality. These will become the foundation of your personal brand website.
        </p>
      </div>

      <ScrollArea className="h-[800px] pr-6">
        <div className="space-y-12">
          {/* Your AI Photos Section */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <Sparkles className="w-6 h-6 text-luxury-black" />
              <div>
                <h3 className="editorial-subheadline">Your AI-Generated Photos</h3>
                <p className="system-text text-soft-gray">Professional photos of you, styled to perfection</p>
              </div>
            </div>
            
            {Array.isArray(aiImages) && aiImages.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {aiImages.map((photo: any) => (
                  <Card 
                    key={photo.id} 
                    className={`aspect-[3/4] cursor-pointer transition-all duration-300 relative overflow-hidden ${
                      selectedAIPhotos.find(p => p.id === photo.id) 
                        ? 'border-luxury-black shadow-lg ring-2 ring-luxury-black' 
                        : 'border-accent-line hover:border-soft-gray hover:shadow-md'
                    }`}
                    onClick={() => handleAIPhotoSelect(photo)}
                  >
                    <img 
                      src={photo.imageUrl} 
                      alt={`Your styled photo ${photo.id}`} 
                      className="w-full h-full object-cover"
                    />
                    {selectedAIPhotos.find(p => p.id === photo.id) && (
                      <div className="absolute top-2 right-2 w-6 h-6 bg-luxury-black rounded-full flex items-center justify-center">
                        <Check className="w-4 h-4 text-pure-white" />
                      </div>
                    )}
                    {favorites.includes(photo.id) && (
                      <div className="absolute top-2 left-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                        <span className="text-pure-white text-xs">★</span>
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-accent-bg rounded-lg">
                <Image className="w-12 h-12 text-soft-gray mx-auto mb-4" />
                <p className="system-text text-soft-gray mb-4">
                  No AI photos found. Create your first professional photos to get started.
                </p>
                <a 
                  href="/maya" 
                  className="inline-block px-6 py-3 bg-luxury-black text-pure-white hover:bg-soft-gray transition-colors"
                >
                  Start AI Photoshoot
                </a>
              </div>
            )}
            
            <div className="text-center">
              <p className="eyebrow-text text-soft-gray">
Selected: {selectedAIPhotos.length} of 8 AI photos
              </p>
            </div>
          </div>

          {/* Flatlay Library Section */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <Image className="w-6 h-6 text-luxury-black" />
              <div>
                <h3 className="editorial-subheadline">Luxury Lifestyle Assets</h3>
                <p className="system-text text-soft-gray">Curated luxury pieces that complement your aesthetic</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {cleanedFlatlayCollections.flatMap(collection => collection.images).map((image: any) => (
                <Card 
                  key={image.id} 
                  className={`aspect-[3/4] cursor-pointer transition-all duration-300 relative overflow-hidden ${
                    selectedFlatlayImages.includes(image.url) 
                      ? 'border-luxury-black shadow-lg ring-2 ring-luxury-black' 
                      : 'border-accent-line hover:border-soft-gray hover:shadow-md'
                  }`}
                  onClick={() => handleFlatlaySelect(image.url)}
                >
                  <img 
                    src={image.url} 
                    alt={image.title || `Luxury asset ${image.id}`} 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      console.warn('Failed to load flatlay image:', image.url);
                      (e.target as HTMLElement).style.opacity = '0.3';
                      (e.target as HTMLElement).style.filter = 'grayscale(100%)';
                    }}
                  />
                  {selectedFlatlayImages.includes(image.url) && (
                    <div className="absolute top-2 right-2 w-6 h-6 bg-luxury-black rounded-full flex items-center justify-center">
                      <Check className="w-4 h-4 text-pure-white" />
                    </div>
                  )}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                    <p className="text-pure-white text-xs font-medium">
                      {image.title || image.category}
                    </p>
                  </div>
                </Card>
              ))}
            </div>
            
            <div className="text-center">
              <p className="eyebrow-text text-soft-gray">
                Selected: {selectedFlatlayImages.length} of 5 lifestyle assets
              </p>
            </div>
          </div>
        </div>
      </ScrollArea>

      {/* Selection Summary & Continue */}
      <div className="mt-8 pt-6 border-t border-accent-line">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h4 className="eyebrow-text mb-2">Total Selection</h4>
            <p className="system-text text-soft-gray">
              {totalSelected} images selected for your website
            </p>
          </div>
          
          {totalSelected > 0 && (
            <button 
              onClick={handleContinue}
              className="px-8 py-3 bg-luxury-black text-pure-white hover:bg-soft-gray transition-colors eyebrow-text"
            >
              Continue with {totalSelected} Photos
            </button>
          )}
        </div>
        
        {totalSelected === 0 && (
          <div className="text-center py-6 bg-accent-bg rounded-lg">
            <p className="system-text text-soft-gray">
              Select at least one image to continue building your website
            </p>
          </div>
        )}

        {/* Quick Preview of Selected Images */}
        {totalSelected > 0 && (
          <div className="mt-6">
            <h5 className="eyebrow-text mb-3">Selected Images Preview</h5>
            <div className="grid grid-cols-6 md:grid-cols-8 gap-2">
              {selectedAIPhotos.map((photo, index) => (
                <img 
                  key={`ai-${photo.id}`}
                  src={photo.imageUrl}
                  alt={`Selected AI photo ${index + 1}`}
                  className="aspect-square object-cover rounded border border-accent-line"
                />
              ))}
              {selectedFlatlayImages.map((image, index) => (
                <img 
                  key={`flatlay-${index}`}
                  src={image}
                  alt={`Selected flatlay ${index + 1}`}
                  className="aspect-square object-cover rounded border border-accent-line"
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RealImageSelection;
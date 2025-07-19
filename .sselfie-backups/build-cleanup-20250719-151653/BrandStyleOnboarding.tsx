import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Check, Image as ImageIcon, Palette, Type } from 'lucide-react';
import { cleanedFlatlayCollections as brandStyleCollections } from '@/data/cleaned-flatlay-collections';

interface BrandStyleOnboardingProps {
  onComplete: (styleData: any) => void;
}

export function BrandStyleOnboarding({ onComplete }: BrandStyleOnboardingProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [selectedFlatlayImages, setSelectedFlatlayImages] = useState<string[]>([]);
  const [selectedCollection, setSelectedCollection] = useState<any>(null);
  const [selectedFont, setSelectedFont] = useState<string>('');
  const [selectedColorPalette, setSelectedColorPalette] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [visibleImages, setVisibleImages] = useState<{ [key: string]: number }>({});

  // Initialize visible images count for all collections
  useEffect(() => {
    const initialCounts: { [key: string]: number } = {};
    brandStyleCollections.forEach(collection => {
      initialCounts[collection.id] = 4; // Show 4 images initially
    });
    setVisibleImages(initialCounts);
  }, []);

  // Get user gallery images
  const { data: userGallery } = useQuery({
    queryKey: ['/api/user-gallery', user?.id],
    enabled: !!user?.id,
  });



  const handleImageSelect = (imageUrl: string) => {
    if (selectedImages.includes(imageUrl)) {
      setSelectedImages(selectedImages.filter(img => img !== imageUrl));
    } else if (selectedImages.length < 15) {
      setSelectedImages([...selectedImages, imageUrl]);
    }
  };

  const handleCollectionSelect = (collection: any) => {
    console.log('🎨 Collection selected:', collection.name, 'ID:', collection.id);
    console.log('🖼️ Collection has', collection.images?.length, 'images');
    setSelectedCollection(collection);
    setSelectedFont('Times New Roman'); // Set default font
    setSelectedColorPalette(collection.id);
    setSelectedFlatlayImages([]); // Reset flatlay selection when collection changes
  };

  const handleFlatlayImageSelect = (imageUrl: string) => {
    console.log('🎯 handleFlatlayImageSelect called with:', imageUrl);
    console.log('📋 Current selectedFlatlayImages:', selectedFlatlayImages);
    
    if (selectedFlatlayImages.includes(imageUrl)) {
      const newSelection = selectedFlatlayImages.filter(img => img !== imageUrl);
      setSelectedFlatlayImages(newSelection);
      console.log('➖ Removed image, new selection:', newSelection);
    } else if (selectedFlatlayImages.length < 5) {
      const newSelection = [...selectedFlatlayImages, imageUrl];
      setSelectedFlatlayImages(newSelection);
      console.log('➕ Added image, new selection:', newSelection);
    } else {
      console.log('⚠️ Cannot add more - already at limit of 5 images');
    }
  };

  const getVisibleImagesCount = (collectionId: string) => {
    return visibleImages[collectionId] || 4; // Default show 4 images
  };

  const handleLoadMoreImages = (collectionId: string) => {
    const currentCount = getVisibleImagesCount(collectionId);
    setVisibleImages(prev => ({
      ...prev,
      [collectionId]: currentCount + 4
    }));
  };

  const handleComplete = async () => {
    if (!selectedImages.length || !selectedFlatlayImages.length || !selectedFont || !selectedColorPalette) {
      return;
    }

    const styleData = {
      selectedImages,
      selectedFlatlayImages,
      selectedCollection,
      selectedFont,
      selectedColorPalette,
      collectionDetails: brandStyleCollections.find(c => c.id === selectedColorPalette)
    };

    setIsLoading(true);
    try {
      // Save style preferences to database
      await apiRequest('POST', '/api/build/style-preferences', {
        userId: user?.id,
        styleData
      });
      
      onComplete(styleData);
    } catch (error) {
      console.error('Error saving style preferences:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="text-center py-12 border-b border-gray-200">
        <h1 className="text-4xl font-serif text-black mb-4" style={{ fontFamily: 'Times New Roman, serif' }}>
          Choose Your Brand Style
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
          Hey beautiful! Let's choose the images and style that truly represent you. Victoria will use these to create something amazing that feels completely, authentically YOU.
        </p>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Step 1: Select Images from Gallery */}
        <div className="mb-12">
          <div className="flex items-center mb-6">
            <div className="w-8 h-8 bg-black text-white rounded-full flex items-center justify-center text-sm font-medium mr-4">
              1
            </div>
            <h2 className="text-2xl font-serif" style={{ fontFamily: 'Times New Roman, serif' }}>
              Select Your Gallery Images
            </h2>
          </div>
          <p className="text-gray-600 mb-6 ml-12">
            Pick 10-15 of your favorite images - the ones that make you feel powerful and confident. Victoria will use these to create stunning hero sections, beautiful cards, and elegant dividers throughout your website. Think of the images that tell your story best.
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 ml-12">
            {userGallery?.userSelfies?.map((selfie: any) => (
              <div
                key={selfie.id}
                className={`relative cursor-pointer transition-all ${
                  selectedImages.includes(selfie.url) 
                    ? 'ring-4 ring-black ring-opacity-50' 
                    : 'hover:opacity-80'
                }`}
                onClick={() => handleImageSelect(selfie.url)}
              >
                <img
                  src={selfie.url}
                  alt="Gallery image"
                  className="w-full h-48 object-cover rounded-lg"
                />
                {selectedImages.includes(selfie.url) && (
                  <div className="absolute top-2 right-2 w-6 h-6 bg-black rounded-full flex items-center justify-center">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>
            ))}
          </div>
          <p className="text-sm text-gray-500 mt-4 ml-12">
            Selected: {selectedImages.length}/15 images
          </p>
        </div>

        {/* Step 2: Choose Style Collection */}
        <div className="mb-12">
          <div className="flex items-center mb-6">
            <div className="w-8 h-8 bg-black text-white rounded-full flex items-center justify-center text-sm font-medium mr-4">
              2
            </div>
            <h2 className="text-2xl font-serif" style={{ fontFamily: 'Times New Roman, serif' }}>
              Choose Your Style Direction
            </h2>
          </div>
          <p className="text-gray-600 mb-6 ml-12">
            Choose the style collection that feels most "you" - this will set your fonts and color palette. Each collection has its own unique personality, just like you do!
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 ml-12">
            {brandStyleCollections.map((collection) => (
              <Card
                key={collection.id}
                className={`cursor-pointer transition-all ${
                  selectedColorPalette === collection.id
                    ? 'ring-4 ring-black ring-opacity-50'
                    : 'hover:shadow-lg'
                }`}
                onClick={() => handleCollectionSelect(collection)}
              >
                <div className="p-0">
                  <img
                    src={collection.backgroundImage}
                    alt={collection.name}
                    className="w-full h-48 object-cover rounded-t-lg"
                  />
                  <div className="p-4">
                    <h3 className="text-lg font-serif mb-2" style={{ fontFamily: 'Times New Roman, serif' }}>
                      {collection.name}
                    </h3>
                    
                    {/* Collection Description */}
                    <div className="mb-3">
                      <p className="text-xs text-gray-500 mb-1">{collection.description}</p>
                    </div>

                    {/* Color Palette */}
                    <div className="mb-3">
                      <p className="text-xs text-gray-500 mb-2">Color Palette</p>
                      <div className="flex space-x-2">
                        {collection.colors?.slice(0, 5).map((color, index) => (
                          <div
                            key={index}
                            className="w-4 h-4 rounded-full border border-gray-200"
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Font Styles */}
                    <div className="mb-3">
                      <p className="text-xs text-gray-500 mb-2">Typography</p>
                      <div className="space-y-1">
                        {collection.fonts?.slice(0, 2).map((font, index) => (
                          <p
                            key={index}
                            className="text-sm"
                            style={{ fontFamily: font }}
                          >
                            {font}
                          </p>
                        ))}
                      </div>
                    </div>

                    {selectedColorPalette === collection.id && (
                      <div className="mt-3 flex items-center text-black">
                        <Check className="w-4 h-4 mr-1" />
                        <span className="text-sm font-medium">Selected</span>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Collapsible Image Dropdown */}
                {selectedColorPalette === collection.id && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-b-lg border-t">
                    <p className="text-sm font-medium mb-3 text-gray-700">
                      Choose 5 flatlay images from {collection.name}:
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                      {collection.images?.slice(0, getVisibleImagesCount(collection.id)).map((image: any, index: number) => (
                        <div
                          key={index}
                          className={`relative cursor-pointer transition-all ${
                            selectedFlatlayImages.includes(image.url) 
                              ? 'ring-2 ring-black ring-opacity-60' 
                              : 'hover:opacity-80'
                          }`}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            console.log('🖱️ Image clicked:', image.url);
                            handleFlatlayImageSelect(image.url);
                          }}
                        >
                          <img
                            src={image.url}
                            alt={image.title || `${collection.name} flatlay`}
                            className="w-full h-24 object-cover rounded-md"
                            onError={(e) => {
                              console.error('Image failed to load:', image.url);
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                          {selectedFlatlayImages.includes(image.url) && (
                            <div className="absolute top-1 right-1 w-5 h-5 bg-black rounded-full flex items-center justify-center">
                              <Check className="w-3 h-3 text-white" />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                    
                    {collection.images && collection.images.length > getVisibleImagesCount(collection.id) && (
                      <button
                        className="mt-3 text-sm text-gray-600 hover:text-black transition-colors"
                        onClick={() => handleLoadMoreImages(collection.id)}
                      >
                        Load more images... ({collection.images.length - getVisibleImagesCount(collection.id)} remaining)
                      </button>
                    )}
                    
                    <div className="mt-3 text-xs text-gray-500">
                      {selectedFlatlayImages.length}/5 images selected
                    </div>
                  </div>
                )}
              </Card>
            ))}
          </div>
        </div>



        {/* Continue Button */}
        <div className="text-center">
          <Button
            onClick={handleComplete}
            disabled={!selectedImages.length || !selectedFlatlayImages.length || !selectedFont || !selectedColorPalette || isLoading}
            className="px-12 py-4 bg-black text-white hover:bg-gray-800 text-lg font-medium tracking-wide"
          >
            {isLoading ? 'Saving...' : 'Start Building with Victoria'}
          </Button>
          
          {(!selectedImages.length || !selectedFlatlayImages.length || !selectedFont || !selectedColorPalette) && (
            <p className="text-sm text-gray-500 mt-4">
              Please select gallery images, flatlay images, and a style collection to continue
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
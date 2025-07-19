import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, Image, Palette, Plus } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/use-auth';

interface GalleryTabsProps {
  onImageSelect?: (imageUrl: string) => void;
  selectedImages?: string[];
  className?: string;
}

export function GalleryTabs({ onImageSelect, selectedImages = [], className = '' }: GalleryTabsProps) {
  const { user } = useAuth();
  const [uploadingImage, setUploadingImage] = useState(false);

  // Fetch user's AI generated images
  const { data: userGallery } = useQuery({
    queryKey: ['/api/user-gallery'],
    enabled: !!user,
  });

  // Fetch flatlay collections
  const { data: flatlayCollections } = useQuery({
    queryKey: ['/api/flatlay-collections'],
    enabled: !!user,
  });

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch('/api/upload-image', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        onImageSelect?.(data.imageUrl);
      }
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setUploadingImage(false);
    }
  };

  const isImageSelected = (imageUrl: string) => {
    return selectedImages.includes(imageUrl);
  };

  const handleImageClick = (imageUrl: string) => {
    onImageSelect?.(imageUrl);
  };

  return (
    <div className={`bg-white border-l border-gray-200 ${className}`}>
      <div className="p-4 border-b border-gray-200">
        <h3 className="font-serif text-lg text-black mb-2">Photo Library</h3>
        <p className="text-sm text-gray-600">Select images for your website</p>
      </div>

      <Tabs defaultValue="ai-images" className="h-full">
        <TabsList className="grid w-full grid-cols-3 px-4 py-2">
          <TabsTrigger value="ai-images" className="text-xs">
            <Image className="w-4 h-4 mr-1" />
            AI Images
          </TabsTrigger>
          <TabsTrigger value="flatlays" className="text-xs">
            <Palette className="w-4 h-4 mr-1" />
            Style Library
          </TabsTrigger>
          <TabsTrigger value="upload" className="text-xs">
            <Upload className="w-4 h-4 mr-1" />
            Upload
          </TabsTrigger>
        </TabsList>

        <TabsContent value="ai-images" className="p-4 space-y-4 max-h-96 overflow-y-auto">
          <div className="grid grid-cols-2 gap-3">
            {userGallery?.userSelfies?.map((image: any) => (
              <div
                key={image.id}
                className={`relative cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${
                  isImageSelected(image.url) 
                    ? 'border-black shadow-lg' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => handleImageClick(image.url)}
              >
                <img
                  src={image.url}
                  alt={`AI Generated ${image.id}`}
                  className="w-full h-24 object-cover"
                />
                {isImageSelected(image.url) && (
                  <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center">
                    <div className="w-6 h-6 bg-black rounded-full flex items-center justify-center">
                      <span className="text-white text-xs">✓</span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
          
          {(!userGallery?.userSelfies || userGallery.userSelfies.length === 0) && (
            <div className="text-center py-8">
              <Image className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-sm text-gray-500">No AI images yet</p>
              <p className="text-xs text-gray-400">Generate some images first</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="flatlays" className="p-4 space-y-4 max-h-96 overflow-y-auto">
          <div className="space-y-4">
            {flatlayCollections?.collections?.map((collection: any) => (
              <div key={collection.id} className="space-y-2">
                <h4 className="text-sm font-medium text-gray-700">{collection.name}</h4>
                <div className="grid grid-cols-3 gap-2">
                  {collection.images?.slice(0, 6).map((image: any, index: number) => (
                    <div
                      key={index}
                      className={`relative cursor-pointer rounded overflow-hidden border-2 transition-all ${
                        isImageSelected(image.url) 
                          ? 'border-black shadow-lg' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => handleImageClick(image.url)}
                    >
                      <img
                        src={image.url}
                        alt={`${collection.name} ${index + 1}`}
                        className="w-full h-16 object-cover"
                      />
                      {isImageSelected(image.url) && (
                        <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center">
                          <div className="w-4 h-4 bg-black rounded-full flex items-center justify-center">
                            <span className="text-white text-xs">✓</span>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="upload" className="p-4 space-y-4">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
              id="image-upload"
              disabled={uploadingImage}
            />
            <label
              htmlFor="image-upload"
              className={`cursor-pointer ${uploadingImage ? 'opacity-50' : ''}`}
            >
              <Plus className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-sm text-gray-600 mb-2">
                {uploadingImage ? 'Uploading...' : 'Upload your own photos'}
              </p>
              <p className="text-xs text-gray-400">
                Click to browse or drag and drop
              </p>
            </label>
          </div>

          <div className="text-center">
            <p className="text-xs text-gray-500">
              Supported formats: JPG, PNG, WebP
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
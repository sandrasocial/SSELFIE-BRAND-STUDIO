// Maya STYLE Interface - Image Gallery Component
// August 10, 2025 - Redesign Implementation

import React, { useState } from 'react';
import { Heart, Download, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useMayaState, useMayaActions } from '@/hooks/maya/useMayaState';
import { useMayaContent } from '@/hooks/maya/useMayaContent';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import { cn } from '@/lib/utils';

interface MayaImageGalleryProps {
  className?: string;
}

export function MayaImageGallery({ className }: MayaImageGalleryProps) {
  const { state } = useMayaState();
  const actions = useMayaActions();
  const content = useMayaContent();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [selectedImages, setSelectedImages] = useState<Set<string>>(new Set());

  if (state.phase !== 'VIEWING' || state.generation.imageUrls.length === 0) {
    return null;
  }

  const handleImageSelect = (imageUrl: string) => {
    actions.selectImage(imageUrl);
  };

  const handleHeartClick = async (imageUrl: string, event: React.MouseEvent) => {
    event.stopPropagation();
    
    if (state.gallery.savedImages.has(imageUrl) || state.gallery.savingImages.has(imageUrl)) {
      return;
    }

    actions.saveToGallery(imageUrl);

    try {
      const response = await fetch('/api/save-preview-to-gallery', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          trackerId: state.generation.trackerId,
          selectedImageUrls: [imageUrl]
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save image');
      }

      actions.gallerySaveComplete(imageUrl);
      
      // Refresh gallery data
      queryClient.invalidateQueries({ queryKey: ['/api/gallery-images'] });
      queryClient.invalidateQueries({ queryKey: ['/api/ai-images'] });

      toast({
        title: "Saved to Gallery",
        description: content.getSaveToGalleryMessage(),
      });

    } catch (error) {
      console.error('Error saving to gallery:', error);
      // Remove from saving state on error
      actions.gallerySaveComplete(imageUrl);
      
      toast({
        title: "Save Failed",
        description: "Couldn't save this image. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleBatchSave = async () => {
    if (selectedImages.size === 0) return;

    const imagesToSave = Array.from(selectedImages);
    
    // Add all to saving state
    imagesToSave.forEach(url => actions.saveToGallery(url));

    try {
      const response = await fetch('/api/save-preview-to-gallery', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          trackerId: state.generation.trackerId,
          selectedImageUrls: imagesToSave
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save images');
      }

      // Mark all as saved
      imagesToSave.forEach(url => actions.gallerySaveComplete(url));
      setSelectedImages(new Set());
      
      // Refresh gallery data
      queryClient.invalidateQueries({ queryKey: ['/api/gallery-images'] });
      queryClient.invalidateQueries({ queryKey: ['/api/ai-images'] });

      toast({
        title: "Gallery Updated",
        description: `Saved ${imagesToSave.length} stunning images to your collection!`,
      });

    } catch (error) {
      console.error('Error batch saving:', error);
      // Remove from saving state on error
      imagesToSave.forEach(url => actions.gallerySaveComplete(url));
      
      toast({
        title: "Save Failed",
        description: "Couldn't save images. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleNewGeneration = () => {
    actions.resetGeneration();
    setSelectedImages(new Set());
  };

  return (
    <div className={cn("p-6", className)}>
      
      {/* Header */}
      <div className="text-center mb-6">
        <h3 className="font-serif text-xl font-medium text-black mb-2">
          Your Editorial Collection
        </h3>
        <p className="text-sm text-gray-600 font-light">
          Select your favorites to save to your permanent gallery
        </p>
      </div>

      {/* Image Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
        {state.generation.imageUrls.map((imageUrl, index) => {
          const isSelected = state.gallery.selectedImage === imageUrl;
          const isSaved = state.gallery.savedImages.has(imageUrl);
          const isSaving = state.gallery.savingImages.has(imageUrl);
          const isInBatchSelection = selectedImages.has(imageUrl);

          return (
            <div
              key={index}
              className={cn(
                "relative aspect-square rounded-lg overflow-hidden bg-gray-100 cursor-pointer transition-all duration-300",
                isSelected && "ring-2 ring-amber-400 ring-offset-2",
                isInBatchSelection && "ring-2 ring-blue-400 ring-offset-2"
              )}
              onClick={() => handleImageSelect(imageUrl)}
            >
              <img
                src={imageUrl}
                alt={`Generated look ${index + 1}`}
                className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                loading="lazy"
              />

              {/* Overlay Controls */}
              <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center opacity-0 hover:opacity-100">
                <Button
                  size="sm"
                  variant="secondary"
                  className="bg-white bg-opacity-90 hover:bg-opacity-100"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleImageSelect(imageUrl);
                  }}
                >
                  <Eye className="w-4 h-4" />
                </Button>
              </div>

              {/* Heart Button */}
              <button
                className={cn(
                  "absolute top-2 right-2 p-2 rounded-full transition-all duration-300",
                  isSaved 
                    ? "bg-red-500 text-white" 
                    : "bg-white bg-opacity-70 hover:bg-opacity-90 text-gray-600 hover:text-red-500"
                )}
                onClick={(e) => handleHeartClick(imageUrl, e)}
                disabled={isSaving || isSaved}
              >
                <Heart 
                  className={cn(
                    "w-4 h-4 transition-all duration-300",
                    isSaved && "fill-current",
                    isSaving && "animate-pulse"
                  )} 
                />
              </button>

              {/* Batch Selection */}
              <button
                className={cn(
                  "absolute top-2 left-2 w-6 h-6 rounded-full border-2 transition-all duration-300",
                  isInBatchSelection 
                    ? "bg-blue-500 border-blue-500 text-white" 
                    : "bg-white bg-opacity-70 border-gray-300 hover:border-blue-400"
                )}
                onClick={(e) => {
                  e.stopPropagation();
                  const newSelection = new Set(selectedImages);
                  if (isInBatchSelection) {
                    newSelection.delete(imageUrl);
                  } else {
                    newSelection.add(imageUrl);
                  }
                  setSelectedImages(newSelection);
                }}
              >
                {isInBatchSelection && (
                  <svg className="w-3 h-3 mx-auto" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </button>

              {/* Image Number */}
              <div className="absolute bottom-2 left-2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded">
                {index + 1}
              </div>
            </div>
          );
        })}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        
        {/* Batch Save Button */}
        {selectedImages.size > 0 && (
          <Button
            onClick={handleBatchSave}
            className="bg-amber-500 hover:bg-amber-600 text-white"
          >
            <Heart className="w-4 h-4 mr-2" />
            Save {selectedImages.size} Selected
          </Button>
        )}

        {/* Create New Look Button */}
        <Button
          onClick={handleNewGeneration}
          variant="outline"
          className="border-black text-black hover:bg-black hover:text-white"
        >
          ✨ Create Another Look
        </Button>

        {/* Continue to BUILD Button */}
        <Button
          onClick={() => {
            // This will navigate to the next step
            window.location.href = '/victoria';
          }}
          className="bg-black hover:bg-gray-800 text-white"
        >
          Continue to BUILD →
        </Button>
      </div>

      {/* Selected Image Modal */}
      {state.gallery.selectedImage && (
        <ImageModal
          imageUrl={state.gallery.selectedImage}
          onClose={() => actions.selectImage(null)}
          onSave={(imageUrl) => handleHeartClick(imageUrl, {} as React.MouseEvent)}
          isSaved={state.gallery.savedImages.has(state.gallery.selectedImage)}
          isSaving={state.gallery.savingImages.has(state.gallery.selectedImage)}
        />
      )}
    </div>
  );
}

// Image Modal Component
interface ImageModalProps {
  imageUrl: string;
  onClose: () => void;
  onSave: (imageUrl: string) => void;
  isSaved: boolean;
  isSaving: boolean;
}

function ImageModal({ imageUrl, onClose, onSave, isSaved, isSaving }: ImageModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 z-50 flex items-center justify-center p-4">
      <div className="relative max-w-4xl max-h-[90vh] w-full">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 bg-white bg-opacity-20 hover:bg-opacity-30 text-white p-2 rounded-full transition-all duration-300"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Image */}
        <img
          src={imageUrl}
          alt="Full size preview"
          className="w-full h-full object-contain rounded-lg"
        />

        {/* Action Buttons */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-3">
          <Button
            onClick={() => onSave(imageUrl)}
            disabled={isSaving || isSaved}
            className={cn(
              "bg-white bg-opacity-90 hover:bg-opacity-100 text-black",
              isSaved && "bg-red-500 text-white"
            )}
          >
            <Heart className={cn("w-4 h-4 mr-2", isSaved && "fill-current")} />
            {isSaved ? 'Saved' : isSaving ? 'Saving...' : 'Save to Gallery'}
          </Button>
          
          <Button
            onClick={() => {
              const link = document.createElement('a');
              link.href = imageUrl;
              link.download = `maya-style-${Date.now()}.jpg`;
              link.click();
            }}
            className="bg-white bg-opacity-90 hover:bg-opacity-100 text-black"
          >
            <Download className="w-4 h-4 mr-2" />
            Download
          </Button>
        </div>
      </div>
    </div>
  );
}
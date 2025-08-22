import React from 'react';
import { Button } from '../ui/button';

interface PhotoGenerationProps {
  generatedImages: string[];
  isGenerating: boolean;
  generationProgress: number;
  onSaveImage: (imageUrl: string) => void;
  savingImages: Set<string>;
  savedImages: Set<string>;
}

export function PhotoGeneration({
  generatedImages,
  isGenerating,
  generationProgress,
  onSaveImage,
  savingImages,
  savedImages,
}: PhotoGenerationProps) {
  return (
    <div className="p-4">
      {isGenerating && (
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-300">Generating your photos...</span>
            <span className="text-sm text-purple-400">{generationProgress}%</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${generationProgress}%` }}
            />
          </div>
        </div>
      )}

      {generatedImages.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {generatedImages.map((imageUrl, index) => (
            <div key={index} className="relative group">
              <img
                src={imageUrl}
                alt={`Generated photo ${index + 1}`}
                className="w-full h-48 object-cover rounded-lg shadow-lg transition-transform duration-200 group-hover:scale-[1.02]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-lg">
                <div className="absolute bottom-2 left-2 right-2 flex justify-center">
                  <Button
                    onClick={() => onSaveImage(imageUrl)}
                    disabled={savedImages.has(imageUrl) || savingImages.has(imageUrl)}
                    className="w-full bg-white/90 hover:bg-white text-gray-900 text-sm py-1 px-3 rounded-full transition-all duration-200"
                  >
                    {savedImages.has(imageUrl)
                      ? '✓ Saved'
                      : savingImages.has(imageUrl)
                      ? 'Saving...'
                      : 'Save Photo'}
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
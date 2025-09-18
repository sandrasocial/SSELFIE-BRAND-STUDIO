/**
 * Image Variations Modal
 * Shows generated variations with compare mode and save options
 */

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '../lib/api';

interface ImageVariationsModalProps {
  originalImage: {
    id: string | number;
    imageUrl?: string;
    url?: string;
    title?: string;
  };
  onClose: () => void;
  onVariationsSaved?: (count: number) => void;
}

interface VariationProgress {
  predictionId: string;
  variantIds: number[];
  status: 'processing' | 'completed' | 'failed';
  variations?: Array<{
    id: number;
    imageUrl: string;
    prompt: string;
    selected?: boolean;
  }>;
  error?: string;
}

export default function ImageVariationsModal({
  originalImage,
  onClose,
  onVariationsSaved
}: ImageVariationsModalProps) {
  const queryClient = useQueryClient();
  const [variationProgress, setVariationProgress] = useState<VariationProgress | null>(null);
  const [compareMode, setCompareMode] = useState(false);
  const [selectedVariations, setSelectedVariations] = useState<Set<number>>(new Set());
  const [isGenerating, setIsGenerating] = useState(false);

  // Generate variations mutation
  const generateVariationsMutation = useMutation({
    mutationFn: async (data: { count: number; imageType: string }) => {
      return await apiFetch(`/images/${originalImage.id}/variations`, {
        method: 'POST',
        body: JSON.stringify({
          count: data.count,
          imageType: data.imageType
        })
      });
    },
    onSuccess: (data) => {
      setVariationProgress({
        predictionId: data.predictionId,
        variantIds: data.variantIds,
        status: 'processing'
      });
      setIsGenerating(false);
    },
    onError: (error) => {
      console.error('Error generating variations:', error);
      setIsGenerating(false);
    }
  });

  // Poll for variation status
  const { data: statusData } = useQuery({
    queryKey: ['/api/images/variations/status', variationProgress?.predictionId, variationProgress?.variantIds],
    queryFn: async () => {
      if (!variationProgress) return null;
      const variantIdsQuery = variationProgress.variantIds.join(',');
      return await apiFetch(
        `/images/${originalImage.id}/variations/status/${variationProgress.predictionId}?variantIds=${variantIdsQuery}`
      );
    },
    enabled: !!variationProgress && variationProgress.status === 'processing',
    refetchInterval: 3000,
  });

  // Save variation mutation
  const saveVariationMutation = useMutation({
    mutationFn: async (variantId: number) => {
      return await apiFetch(`/images/${variantId}/save-variation`, {
        method: 'POST'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/gallery-images'] });
    }
  });

  // Update variation progress based on status
  useEffect(() => {
    if (statusData && variationProgress) {
      if (statusData.status === 'completed' && statusData.imageUrls) {
        // Map the image URLs to variations with variant IDs
        const variations = statusData.imageUrls.map((imageUrl: string, index: number) => ({
          id: variationProgress.variantIds[index],
          imageUrl,
          prompt: 'Generated variation', // Could be improved to show actual prompt
          selected: false
        }));

        setVariationProgress({
          ...variationProgress,
          status: 'completed',
          variations
        });
      } else if (statusData.status === 'failed') {
        setVariationProgress({
          ...variationProgress,
          status: 'failed',
          error: statusData.error
        });
      }
    }
  }, [statusData, variationProgress]);

  // Start generating variations
  const handleGenerateVariations = (count: number = 3) => {
    setIsGenerating(true);
    // Assume ai_image type for now - could be improved to detect type
    generateVariationsMutation.mutate({ count, imageType: 'ai_image' });
  };

  // Toggle variation selection
  const toggleVariationSelection = (variantId: number) => {
    const newSelected = new Set(selectedVariations);
    if (newSelected.has(variantId)) {
      newSelected.delete(variantId);
    } else {
      newSelected.add(variantId);
    }
    setSelectedVariations(newSelected);
  };

  // Save selected variations
  const handleSaveSelected = async () => {
    let savedCount = 0;
    for (const variantId of selectedVariations) {
      try {
        await saveVariationMutation.mutateAsync(variantId);
        savedCount++;
      } catch (error) {
        console.error('Failed to save variation:', variantId, error);
      }
    }
    
    onVariationsSaved?.(savedCount);
    if (savedCount > 0) {
      onClose();
    }
  };

  const originalImageUrl = originalImage.imageUrl || originalImage.url || '';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 z-50 flex items-center justify-center p-4">
      <div className="bg-white max-w-7xl max-h-[95vh] w-full flex flex-col rounded-lg overflow-hidden">
        
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-semibold">More Like This</h2>
          <div className="flex items-center space-x-4">
            {variationProgress?.status === 'completed' && (
              <button
                onClick={() => setCompareMode(!compareMode)}
                className={`px-4 py-2 rounded-md text-sm ${
                  compareMode 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-200 text-gray-700'
                }`}
              >
                {compareMode ? '📋 List View' : '🔍 Compare Mode'}
              </button>
            )}
            <button
              onClick={onClose}
              className="text-2xl text-gray-600 hover:text-gray-800"
              aria-label="Close modal"
            >
              ×
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-4">
          
          {/* No variations started */}
          {!variationProgress && (
            <div className="text-center py-12">
              <div className="mb-6">
                <img 
                  src={originalImageUrl} 
                  alt="Original" 
                  className="mx-auto max-w-xs max-h-60 object-contain rounded-lg"
                />
                <p className="mt-4 text-gray-600">Generate variations of this image</p>
              </div>
              
              <div className="space-y-3">
                <button
                  onClick={() => handleGenerateVariations(3)}
                  disabled={isGenerating}
                  className="w-48 py-3 px-4 bg-blue-500 text-white rounded-md disabled:opacity-50 hover:bg-blue-600 block mx-auto"
                >
                  {isGenerating ? 'Starting...' : '✨ Generate 3 Variations'}
                </button>
                <button
                  onClick={() => handleGenerateVariations(4)}
                  disabled={isGenerating}
                  className="w-48 py-2 px-4 bg-gray-200 text-gray-700 rounded-md disabled:opacity-50 hover:bg-gray-300 block mx-auto"
                >
                  Generate 4 Variations
                </button>
              </div>
            </div>
          )}

          {/* Processing */}
          {variationProgress?.status === 'processing' && (
            <div className="text-center py-12">
              <div className="inline-flex items-center space-x-2 mb-4">
                <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-lg text-gray-600">Generating variations...</span>
              </div>
              <p className="text-sm text-gray-500">This usually takes 1-2 minutes</p>
              
              <div className="mt-6">
                <img 
                  src={originalImageUrl} 
                  alt="Original" 
                  className="mx-auto max-w-xs max-h-48 object-contain rounded-lg opacity-50"
                />
              </div>
            </div>
          )}

          {/* Failed */}
          {variationProgress?.status === 'failed' && (
            <div className="text-center py-12">
              <div className="text-red-600 mb-4">
                ❌ Failed to generate variations
              </div>
              {variationProgress.error && (
                <p className="text-sm text-gray-600 mb-4">{variationProgress.error}</p>
              )}
              <button
                onClick={() => handleGenerateVariations(3)}
                className="py-2 px-4 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                Try Again
              </button>
            </div>
          )}

          {/* Completed - Show variations */}
          {variationProgress?.status === 'completed' && variationProgress.variations && (
            <div>
              
              {/* Compare Mode */}
              {compareMode ? (
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Original Image */}
                  <div className="text-center">
                    <div className="relative">
                      <img 
                        src={originalImageUrl} 
                        alt="Original" 
                        className="w-full h-64 object-cover rounded-lg border-4 border-gray-300"
                      />
                      <div className="absolute top-2 left-2 bg-gray-800 text-white text-xs px-2 py-1 rounded">
                        Original
                      </div>
                    </div>
                  </div>

                  {/* Variations */}
                  {variationProgress.variations.map((variation, index) => (
                    <div key={variation.id} className="text-center">
                      <div className="relative">
                        <img 
                          src={variation.imageUrl} 
                          alt={`Variation ${index + 1}`} 
                          className={`w-full h-64 object-cover rounded-lg cursor-pointer border-4 transition-all ${
                            selectedVariations.has(variation.id)
                              ? 'border-blue-500'
                              : 'border-gray-300 hover:border-gray-400'
                          }`}
                          onClick={() => toggleVariationSelection(variation.id)}
                        />
                        <div className="absolute top-2 left-2 bg-gray-800 text-white text-xs px-2 py-1 rounded">
                          Variation {index + 1}
                        </div>
                        {selectedVariations.has(variation.id) && (
                          <div className="absolute top-2 right-2 bg-blue-500 text-white text-xs px-2 py-1 rounded">
                            ✓ Selected
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                /* List Mode */
                <div className="space-y-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-medium">Generated Variations ({variationProgress.variations.length})</h3>
                    <div className="text-sm text-gray-600">
                      Click images to select for saving
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {variationProgress.variations.map((variation, index) => (
                      <div key={variation.id} className="text-center">
                        <div className="relative">
                          <img 
                            src={variation.imageUrl} 
                            alt={`Variation ${index + 1}`} 
                            className={`w-full h-48 object-cover rounded-lg cursor-pointer border-2 transition-all ${
                              selectedVariations.has(variation.id)
                                ? 'border-blue-500 ring-2 ring-blue-200'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                            onClick={() => toggleVariationSelection(variation.id)}
                          />
                          {selectedVariations.has(variation.id) && (
                            <div className="absolute top-2 right-2 bg-blue-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm">
                              ✓
                            </div>
                          )}
                        </div>
                        <p className="mt-2 text-sm text-gray-600">Variation {index + 1}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        {variationProgress?.status === 'completed' && (
          <div className="border-t p-4">
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-600">
                {selectedVariations.size > 0 
                  ? `${selectedVariations.size} variation${selectedVariations.size === 1 ? '' : 's'} selected`
                  : 'Select variations to save to your gallery'
                }
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={onClose}
                  className="py-2 px-4 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                >
                  Cancel
                </button>
                {selectedVariations.size > 0 && (
                  <button
                    onClick={handleSaveSelected}
                    disabled={saveVariationMutation.isPending}
                    className="py-2 px-6 bg-blue-500 text-white rounded-md disabled:opacity-50 hover:bg-blue-600"
                  >
                    {saveVariationMutation.isPending 
                      ? 'Saving...' 
                      : `Save ${selectedVariations.size} to Gallery`
                    }
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
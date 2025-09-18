/**
 * BRAND ASSET PLACEMENT MODAL - P3-C Feature
 * 
 * Modal for placing brand assets into images with overlay/inpaint options
 * Supports position adjustment and preview
 */

import React, { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import BrandKit from '../features/brand/BrandKit';

interface BrandAsset {
  id: number;
  userId: string;
  kind: 'logo' | 'product';
  url: string;
  filename: string;
  fileSize?: number;
  meta?: any;
  createdAt: string;
}

interface BrandAssetPlacementModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageId: number;
  imageUrl: string;
  imageTitle?: string;
}

const BrandAssetPlacementModal: React.FC<BrandAssetPlacementModalProps> = ({
  isOpen,
  onClose,
  imageId,
  imageUrl,
  imageTitle
}) => {
  const queryClient = useQueryClient();
  const [selectedAsset, setSelectedAsset] = useState<BrandAsset | null>(null);
  const [placementMode, setPlacementMode] = useState<'overlay' | 'inpaint'>('overlay');
  const [position, setPosition] = useState({ x: 20, y: 20, width: 100, height: 100 });
  const [scale, setScale] = useState(1.0);
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setSelectedAsset(null);
      setIsPreviewMode(false);
      setPosition({ x: 20, y: 20, width: 100, height: 100 });
      setScale(1.0);
    }
  }, [isOpen]);

  // Place asset mutation
  const placementMutation = useMutation({
    mutationFn: async (placementData: {
      imageId: number;
      assetId: number;
      mode: 'overlay' | 'inpaint';
      position?: any;
      scale?: number;
    }) => {
      const response = await fetch('/api/brand-assets/place', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(placementData),
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Placement failed');
      }

      return response.json();
    },
    onSuccess: (data) => {
      console.log('Placement successful:', data);
      // Invalidate gallery queries to refresh the UI
      queryClient.invalidateQueries({ queryKey: ['/api/gallery-images'] });
      onClose();
      
      if (data.variant.processingStatus === 'completed') {
        alert('Brand asset placed successfully!');
      } else {
        alert(`Placement started! ${data.message || 'Processing in background.'}`);
      }
    },
    onError: (error: Error) => {
      console.error('Placement error:', error);
      alert(`Placement failed: ${error.message}`);
    },
  });

  const handlePlaceAsset = () => {
    if (!selectedAsset) {
      alert('Please select a brand asset first');
      return;
    }

    const placementData = {
      imageId,
      assetId: selectedAsset.id,
      mode: placementMode,
      position: placementMode === 'overlay' ? position : undefined,
      scale,
    };

    placementMutation.mutate(placementData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Place Brand Asset
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>

          {/* Image Preview */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">Target Image</h3>
            <div className="relative inline-block border border-gray-200">
              <img
                src={imageUrl}
                alt={imageTitle || 'Target image'}
                className="max-w-full max-h-64 object-contain"
              />
              {isPreviewMode && selectedAsset && placementMode === 'overlay' && (
                <div
                  className="absolute border-2 border-blue-500 bg-blue-100 bg-opacity-50"
                  style={{
                    left: `${position.x}px`,
                    top: `${position.y}px`,
                    width: `${position.width * scale}px`,
                    height: `${position.height * scale}px`,
                  }}
                >
                  <img
                    src={selectedAsset.url}
                    alt={selectedAsset.filename}
                    className="w-full h-full object-contain opacity-80"
                  />
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Asset Selection */}
            <div>
              <h3 className="text-lg font-semibold mb-4">
                Select Brand Asset
                {selectedAsset && (
                  <span className="ml-2 text-sm text-gray-600 font-normal">
                    Selected: {selectedAsset.filename}
                  </span>
                )}
              </h3>
              <div className="max-h-96 overflow-auto border border-gray-200 rounded">
                <BrandKit 
                  onAssetSelect={setSelectedAsset}
                  selectedAssetId={selectedAsset?.id}
                />
              </div>
            </div>

            {/* Placement Options */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Placement Options</h3>
              
              {/* Mode Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Placement Mode
                </label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="mode"
                      value="overlay"
                      checked={placementMode === 'overlay'}
                      onChange={(e) => setPlacementMode(e.target.value as 'overlay')}
                      className="mr-2"
                    />
                    <span className="text-sm">
                      <strong>Overlay</strong> - Fast, simple positioning (preview available)
                    </span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="mode"
                      value="inpaint"
                      checked={placementMode === 'inpaint'}
                      onChange={(e) => setPlacementMode(e.target.value as 'inpaint')}
                      className="mr-2"
                    />
                    <span className="text-sm">
                      <strong>Inpaint</strong> - Realistic blending, takes 2-5 minutes
                    </span>
                  </label>
                </div>
              </div>

              {/* Scale Control */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Size Scale: {scale.toFixed(1)}x
                </label>
                <input
                  type="range"
                  min="0.1"
                  max="2.0"
                  step="0.1"
                  value={scale}
                  onChange={(e) => setScale(parseFloat(e.target.value))}
                  className="w-full"
                />
              </div>

              {/* Position Controls (Overlay Mode Only) */}
              {placementMode === 'overlay' && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Position
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">X Position</label>
                      <input
                        type="number"
                        value={position.x}
                        onChange={(e) => setPosition(prev => ({ ...prev, x: parseInt(e.target.value) || 0 }))}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Y Position</label>
                      <input
                        type="number"
                        value={position.y}
                        onChange={(e) => setPosition(prev => ({ ...prev, y: parseInt(e.target.value) || 0 }))}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Width</label>
                      <input
                        type="number"
                        value={position.width}
                        onChange={(e) => setPosition(prev => ({ ...prev, width: parseInt(e.target.value) || 0 }))}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Height</label>
                      <input
                        type="number"
                        value={position.height}
                        onChange={(e) => setPosition(prev => ({ ...prev, height: parseInt(e.target.value) || 0 }))}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                      />
                    </div>
                  </div>
                  
                  {selectedAsset && (
                    <button
                      onClick={() => setIsPreviewMode(!isPreviewMode)}
                      className="mt-2 px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 transition-colors"
                    >
                      {isPreviewMode ? 'Hide Preview' : 'Show Preview'}
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-4 mt-6 pt-6 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handlePlaceAsset}
              disabled={!selectedAsset || placementMutation.isPending}
              className="px-6 py-2 bg-black text-white hover:bg-gray-800 disabled:bg-gray-400 transition-colors"
            >
              {placementMutation.isPending 
                ? 'Placing...' 
                : `Place ${selectedAsset ? selectedAsset.kind : 'Asset'}`
              }
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BrandAssetPlacementModal;

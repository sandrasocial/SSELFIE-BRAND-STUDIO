/**
 * BRAND KIT COMPONENT - P3-C Feature
 * 
 * Manages brand assets (logos, product shots) with upload and management functionality
 * Integrates with S3 upload service and provides UI for asset organization
 */

import React, { useState, useRef } from 'react';
import { useAuth } from '../../hooks/use-auth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '../../lib/api';

// Brand Asset type
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

interface BrandKitProps {
  onAssetSelect?: (asset: BrandAsset) => void;
  selectedAssetId?: number;
}

const BrandKit: React.FC<BrandKitProps> = ({ onAssetSelect, selectedAssetId }) => {
  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingKind, setUploadingKind] = useState<'logo' | 'product' | null>(null);
  const [dragOver, setDragOver] = useState(false);

  // Fetch brand assets
  const { data: assets = [], isLoading, error } = useQuery<BrandAsset[]>({
    queryKey: ['/api/brand-assets'],
    enabled: isAuthenticated && !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Upload mutation
  const uploadMutation = useMutation({
    mutationFn: async ({ file, kind }: { file: File; kind: 'logo' | 'product' }) => {
      const formData = new FormData();
      formData.append('asset', file);
      formData.append('kind', kind);

      const response = await fetch('/api/brand-assets', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Upload failed');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/brand-assets'] });
      setUploadingKind(null);
    },
    onError: (error) => {
      console.error('Upload error:', error);
      setUploadingKind(null);
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (assetId: number) => {
      const response = await fetch(`/api/brand-assets/${assetId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Delete failed');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/brand-assets'] });
    },
  });

  const handleFileSelect = (file: File, kind: 'logo' | 'product') => {
    if (file.size > 10 * 1024 * 1024) {
      alert('File size must be less than 10MB');
      return;
    }

    if (!file.type.startsWith('image/')) {
      alert('Only image files are allowed');
      return;
    }

    setUploadingKind(kind);
    uploadMutation.mutate({ file, kind });
  };

  const handleUploadClick = (kind: 'logo' | 'product') => {
    setUploadingKind(kind);
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && uploadingKind) {
      handleFileSelect(file, uploadingKind);
    }
  };

  const handleDrop = (event: React.DragEvent, kind: 'logo' | 'product') => {
    event.preventDefault();
    setDragOver(false);
    
    const file = event.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file, kind);
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (event: React.DragEvent) => {
    event.preventDefault();
    setDragOver(false);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (!isAuthenticated) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-500">Please sign in to manage your brand assets.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center">
        <p className="text-red-500">Error loading brand assets. Please try again.</p>
      </div>
    );
  }

  const logoAssets = assets.filter(asset => asset.kind === 'logo');
  const productAssets = assets.filter(asset => asset.kind === 'product');

  return (
    <div className="brand-kit p-6 bg-white">
      <h2 className="text-2xl font-bold mb-6 text-gray-900">Brand Kit</h2>
      
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileInputChange}
        className="hidden"
      />

      {/* Logos Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Logos</h3>
          <button
            onClick={() => handleUploadClick('logo')}
            disabled={uploadMutation.isPending && uploadingKind === 'logo'}
            className="px-4 py-2 bg-black text-white hover:bg-gray-800 disabled:bg-gray-400 transition-colors text-sm"
          >
            {uploadMutation.isPending && uploadingKind === 'logo' ? 'Uploading...' : 'Upload Logo'}
          </button>
        </div>

        <div
          className={`grid grid-cols-2 md:grid-cols-4 gap-4 min-h-[120px] p-4 border-2 border-dashed ${
            dragOver ? 'border-black bg-gray-50' : 'border-gray-300'
          } transition-colors`}
          onDrop={(e) => handleDrop(e, 'logo')}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          {logoAssets.length === 0 ? (
            <div className="col-span-full flex flex-col items-center justify-center text-gray-500 py-8">
              <svg className="w-12 h-12 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <p>Drag & drop logo files here or click Upload Logo</p>
              <p className="text-sm mt-1">PNG, JPG up to 10MB</p>
            </div>
          ) : (
            logoAssets.map((asset) => (
              <div
                key={asset.id}
                className={`relative group cursor-pointer border-2 transition-all ${
                  selectedAssetId === asset.id 
                    ? 'border-black shadow-lg' 
                    : 'border-gray-200 hover:border-gray-400'
                }`}
                onClick={() => onAssetSelect?.(asset)}
              >
                <div className="aspect-square bg-gray-50 flex items-center justify-center overflow-hidden">
                  <img
                    src={asset.url}
                    alt={asset.filename}
                    className="max-w-full max-h-full object-contain"
                  />
                </div>
                <div className="p-2 bg-white">
                  <p className="text-xs text-gray-600 truncate">{asset.filename}</p>
                  {asset.fileSize && (
                    <p className="text-xs text-gray-500">{formatFileSize(asset.fileSize)}</p>
                  )}
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm('Delete this logo?')) {
                      deleteMutation.mutate(asset.id);
                    }
                  }}
                  className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Product Shots Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Product Shots</h3>
          <button
            onClick={() => handleUploadClick('product')}
            disabled={uploadMutation.isPending && uploadingKind === 'product'}
            className="px-4 py-2 bg-black text-white hover:bg-gray-800 disabled:bg-gray-400 transition-colors text-sm"
          >
            {uploadMutation.isPending && uploadingKind === 'product' ? 'Uploading...' : 'Upload Product'}
          </button>
        </div>

        <div
          className={`grid grid-cols-2 md:grid-cols-4 gap-4 min-h-[120px] p-4 border-2 border-dashed ${
            dragOver ? 'border-black bg-gray-50' : 'border-gray-300'
          } transition-colors`}
          onDrop={(e) => handleDrop(e, 'product')}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          {productAssets.length === 0 ? (
            <div className="col-span-full flex flex-col items-center justify-center text-gray-500 py-8">
              <svg className="w-12 h-12 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <p>Drag & drop product images here or click Upload Product</p>
              <p className="text-sm mt-1">PNG, JPG up to 10MB</p>
            </div>
          ) : (
            productAssets.map((asset) => (
              <div
                key={asset.id}
                className={`relative group cursor-pointer border-2 transition-all ${
                  selectedAssetId === asset.id 
                    ? 'border-black shadow-lg' 
                    : 'border-gray-200 hover:border-gray-400'
                }`}
                onClick={() => onAssetSelect?.(asset)}
              >
                <div className="aspect-square bg-gray-50 flex items-center justify-center overflow-hidden">
                  <img
                    src={asset.url}
                    alt={asset.filename}
                    className="max-w-full max-h-full object-contain"
                  />
                </div>
                <div className="p-2 bg-white">
                  <p className="text-xs text-gray-600 truncate">{asset.filename}</p>
                  {asset.fileSize && (
                    <p className="text-xs text-gray-500">{formatFileSize(asset.fileSize)}</p>
                  )}
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm('Delete this product shot?')) {
                      deleteMutation.mutate(asset.id);
                    }
                  }}
                  className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {uploadMutation.error && (
        <div className="mt-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded">
          Error: {uploadMutation.error.message}
        </div>
      )}

      {deleteMutation.error && (
        <div className="mt-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded">
          Error: {deleteMutation.error.message}
        </div>
      )}
    </div>
  );
};

export default BrandKit;
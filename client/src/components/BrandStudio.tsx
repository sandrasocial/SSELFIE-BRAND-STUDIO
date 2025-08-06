/**
 * SSELFIE Studio Brand Studio Component
 * Luxury React architecture with performance optimization
 * 
 * This component showcases our premium frontend patterns:
 * - Clean TypeScript interfaces with detailed props
 * - Elegant state management with proper loading states
 * - Luxury styling with Times New Roman typography
 * - Performance-optimized rendering with React.memo
 * - Beautiful error handling and user feedback
 */

import React, { useState, useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Luxury type definitions - clear, comprehensive, elegant
interface BrandData {
  id: string;
  name: string;
  style: 'luxury' | 'editorial' | 'minimalist' | 'bold';
  colors: string[];
  personality: {
    tone: string;
    values: string[];
    targetAudience: string;
  };
  assets: {
    logo: string;
    colorPalette: string[];
    typography: string;
    guidelines: string;
  };
  status: 'creating' | 'ready' | 'error';
  created: string;
}

interface BrandStudioProps {
  userId: string;
  onBrandCreated?: (brand: BrandData) => void;
  className?: string;
}

interface CreateBrandForm {
  name: string;
  style: BrandData['style'];
  colors: string[];
  tone: string;
  values: string[];
  targetAudience: string;
}

// Luxury API service integration
const brandAPI = {
  async createBrand(data: Omit<CreateBrandForm, 'colors'> & { colors: string[] }): Promise<BrandData> {
    const response = await fetch('/api/brand/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...data,
        personality: {
          tone: data.tone,
          values: data.values,
          targetAudience: data.targetAudience
        }
      })
    });
    
    const result = await response.json();
    if (!result.success) throw new Error(result.message);
    return result.data;
  },

  async getBrands(userId: string): Promise<BrandData[]> {
    const response = await fetch(`/api/brand/list/${userId}`);
    const result = await response.json();
    if (!result.success) throw new Error(result.message);
    return result.data;
  }
};

export const BrandStudio: React.FC<BrandStudioProps> = React.memo(({ 
  userId, 
  onBrandCreated, 
  className = '' 
}) => {
  const [formData, setFormData] = useState<CreateBrandForm>({
    name: '',
    style: 'luxury',
    colors: ['#000000'],
    tone: '',
    values: [],
    targetAudience: ''
  });

  const queryClient = useQueryClient();

  // Elegant data fetching with React Query
  const { 
    data: brands = [], 
    isLoading: brandsLoading, 
    error: brandsError 
  } = useQuery({
    queryKey: ['brands', userId],
    queryFn: () => brandAPI.getBrands(userId),
    staleTime: 5 * 60 * 1000, // 5 minutes cache
  });

  // Luxury brand creation with optimistic updates
  const createBrandMutation = useMutation({
    mutationFn: brandAPI.createBrand,
    onSuccess: (newBrand) => {
      // Optimistic update to cache
      queryClient.setQueryData(['brands', userId], (old: BrandData[] = []) => [
        ...old,
        newBrand
      ]);
      
      // Reset form with elegant transition
      setFormData({
        name: '',
        style: 'luxury',
        colors: ['#000000'],
        tone: '',
        values: [],
        targetAudience: ''
      });
      
      onBrandCreated?.(newBrand);
    },
    onError: (error) => {
      console.error('Brand creation failed:', error);
    }
  });

  // Performance-optimized form handlers
  const updateFormField = useCallback(<K extends keyof CreateBrandForm>(
    field: K,
    value: CreateBrandForm[K]
  ) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name && formData.tone && formData.targetAudience) {
      createBrandMutation.mutate(formData);
    }
  }, [formData, createBrandMutation]);

  // Memoized style options for performance
  const styleOptions = useMemo(() => [
    { value: 'luxury', label: 'Luxury', description: 'Timeless elegance with premium aesthetics' },
    { value: 'editorial', label: 'Editorial', description: 'Clean, magazine-style sophistication' },
    { value: 'minimalist', label: 'Minimalist', description: 'Less is more, maximum impact' },
    { value: 'bold', label: 'Bold', description: 'Confident and attention-grabbing' }
  ] as const, []);

  // Luxury loading state
  if (brandsLoading) {
    return (
      <div className={`bg-white min-h-screen flex items-center justify-center ${className}`}>
        <div className="text-center space-y-6">
          <div className="animate-spin w-8 h-8 border-2 border-black border-t-transparent rounded-full mx-auto"></div>
          <p className="font-serif text-lg text-gray-600 tracking-wide">
            Preparing your brand studio...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-gradient-to-br from-gray-50 to-white min-h-screen ${className}`}>
      {/* Luxury Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <h1 className="font-serif text-4xl font-light tracking-wide text-black">
            Brand Studio
          </h1>
          <p className="mt-2 text-gray-600 text-lg">
            Create your luxury personal brand with AI-powered precision
          </p>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          
          {/* Brand Creation Form - Left Side */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="font-serif text-2xl font-light mb-8 text-black">
              Create New Brand
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Brand Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Brand Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => updateFormField('name', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-200 font-serif"
                  placeholder="Enter your brand name..."
                  required
                />
              </div>

              {/* Style Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-4">
                  Brand Style
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {styleOptions.map((option) => (
                    <label
                      key={option.value}
                      className={`
                        relative border-2 rounded-lg p-4 cursor-pointer transition-all duration-200
                        ${formData.style === option.value 
                          ? 'border-black bg-gray-50' 
                          : 'border-gray-200 hover:border-gray-300'
                        }
                      `}
                    >
                      <input
                        type="radio"
                        value={option.value}
                        checked={formData.style === option.value}
                        onChange={(e) => updateFormField('style', e.target.value as BrandData['style'])}
                        className="sr-only"
                      />
                      <div className="font-serif text-lg font-medium text-black">
                        {option.label}
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        {option.description}
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Target Audience */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Target Audience
                </label>
                <textarea
                  value={formData.targetAudience}
                  onChange={(e) => updateFormField('targetAudience', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-200 font-serif resize-none"
                  rows={3}
                  placeholder="Describe your ideal audience..."
                  required
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={createBrandMutation.isPending}
                className={`
                  w-full py-4 px-6 rounded-lg font-serif text-lg font-medium transition-all duration-200
                  ${createBrandMutation.isPending
                    ? 'bg-gray-400 text-white cursor-not-allowed'
                    : 'bg-black text-white hover:bg-gray-800 active:bg-gray-900'
                  }
                `}
              >
                {createBrandMutation.isPending ? (
                  <span className="flex items-center justify-center space-x-2">
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                    <span>Creating your brand...</span>
                  </span>
                ) : (
                  'Create Brand'
                )}
              </button>
            </form>
          </div>

          {/* Existing Brands - Right Side */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="font-serif text-2xl font-light mb-8 text-black">
              Your Brands ({brands.length})
            </h2>
            
            {brands.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 text-6xl mb-4">✨</div>
                <p className="text-gray-600 font-serif text-lg">
                  No brands created yet. Create your first luxury brand!
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {brands.map((brand) => (
                  <div
                    key={brand.id}
                    className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow duration-200"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-serif text-xl font-medium text-black">
                        {brand.name}
                      </h3>
                      <span className={`
                        px-3 py-1 rounded-full text-sm font-medium
                        ${brand.status === 'ready' 
                          ? 'bg-green-100 text-green-800' 
                          : brand.status === 'creating'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                        }
                      `}>
                        {brand.status}
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <span className="capitalize">{brand.style}</span>
                      <span>•</span>
                      <span>{brand.personality.targetAudience}</span>
                    </div>
                    
                    <div className="flex space-x-2 mt-4">
                      {brand.colors.slice(0, 4).map((color, index) => (
                        <div
                          key={index}
                          className="w-6 h-6 rounded-full border border-gray-300"
                          style={{ backgroundColor: color }}
                          title={color}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});

BrandStudio.displayName = 'BrandStudio';

export default BrandStudio;
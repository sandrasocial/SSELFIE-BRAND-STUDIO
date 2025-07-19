// Clean flatlay library with ONLY local images that work
import React, { useState } from 'react';
import { Check } from 'lucide-react';

// Import from our clean collection file
import { cleanedFlatlayCollections as flatlayCollections } from '@/data/cleaned-flatlay-collections';

export default function FlatlayLibraryClean() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedImages, setSelectedImages] = useState<string[]>([]);

  const categories = ['all', ...flatlayCollections.map(collection => collection.id)];

  const filteredImages = selectedCategory === 'all' 
    ? flatlayCollections.flatMap(collection => collection.images)
    : flatlayCollections.find(collection => collection.id === selectedCategory)?.images || [];

  const handleImageSelect = (imageUrl: string) => {
    setSelectedImages(prev => 
      prev.includes(imageUrl) 
        ? prev.filter(url => url !== imageUrl)
        : [...prev, imageUrl]
    );
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-4xl font-serif mb-8" style={{ fontFamily: 'Times New Roman, serif' }}>
          Flatlay Library
        </h1>
        
        {/* Category Filter */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium ${
                  selectedCategory === category
                    ? 'bg-black text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category === 'all' ? 'All' : category.split('-').map(word => 
                  word.charAt(0).toUpperCase() + word.slice(1)
                ).join(' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Image Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filteredImages.map((image) => (
            <div
              key={image.id}
              className={`relative cursor-pointer group ${
                selectedImages.includes(image.url) 
                  ? 'ring-2 ring-black ring-opacity-60' 
                  : 'hover:opacity-80'
              }`}
              onClick={() => handleImageSelect(image.url)}
            >
              <img
                src={image.url}
                alt={image.title}
                className="w-full h-48 object-cover rounded-lg"
                onError={(e) => {
                  console.error('Image failed to load:', image.url);
                  e.currentTarget.style.display = 'none';
                }}
              />
              {selectedImages.includes(image.url) && (
                <div className="absolute top-2 right-2 w-6 h-6 bg-black rounded-full flex items-center justify-center">
                  <Check className="w-4 h-4 text-white" />
                </div>
              )}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent rounded-b-lg p-2">
                <p className="text-white text-xs font-medium">{image.title}</p>
                <p className="text-white/80 text-xs">{image.category}</p>
              </div>
            </div>
          ))}
        </div>

        {selectedImages.length > 0 && (
          <div className="fixed bottom-6 right-6 bg-black text-white px-4 py-2 rounded-full">
            {selectedImages.length} selected
          </div>
        )}
      </div>
    </div>
  );
}
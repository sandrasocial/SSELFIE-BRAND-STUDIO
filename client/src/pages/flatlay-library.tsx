// Clean flatlay library with ONLY local images that work
import React, { useState } from 'react';
import { Check, X, ZoomIn, Download } from 'lucide-react';

// Import from our clean collection file
import { cleanedFlatlayCollections as flatlayCollections } from '../data/cleaned-flatlay-collections';

export default function FlatlayLibraryClean() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [previewImage, setPreviewImage] = useState<FlatlayImage | null>(null);
  const [showPreview, setShowPreview] = useState(false);

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
      {/* Luxury Editorial Hero Section */}
      <div className="relative h-screen bg-gradient-to-b from-black via-gray-900 to-black overflow-hidden">
        <div className="absolute inset-0 bg-black/40 z-10"></div>
        
        {/* Hero Background with First Available Image */}
        {filteredImages.length > 0 && (
          <img
            src={filteredImages[0].url}
            alt="Hero flatlay"
            className="absolute inset-0 w-full h-full object-cover opacity-60"
          />
        )}
        
        {/* Editorial Content Overlay */}
        <div className="relative z-20 h-full flex items-center justify-center">
          <div className="text-center text-white max-w-4xl px-8">
            <h1 
              className="text-7xl md:text-9xl font-normal mb-8 tracking-tight leading-none"
              style={{ fontFamily: 'Times New Roman, serif' }}
            >
              FLATLAY
            </h1>
            <h2 
              className="text-2xl md:text-4xl font-light mb-12 tracking-wider opacity-90"
              style={{ fontFamily: 'Times New Roman, serif' }}
            >
              EDITORIAL LIBRARY
            </h2>
            <div className="w-24 h-px bg-white mx-auto mb-12"></div>
            <p className="text-lg md:text-xl font-light max-w-2xl mx-auto leading-relaxed opacity-80">
              Curated collection of luxury flatlay compositions.<br />
              Transform your vision into editorial perfection.
            </p>
          </div>
        </div>
        
        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20">
          <div className="w-px h-16 bg-white/40 mx-auto mb-4"></div>
          <p className="text-white/60 text-xs tracking-widest uppercase">Scroll</p>
        </div>
      </div>
      
      {/* Main Content Section */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        {/* Editorial Section Header */}
        <div className="text-center mb-16">
          <h3 
            className="text-5xl md:text-6xl mb-6 text-black"
            style={{ fontFamily: 'Times New Roman, serif' }}
          >
            Collections
          </h3>
          <div className="w-16 h-px bg-black mx-auto mb-8"></div>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto leading-relaxed">
            Each flatlay tells a story of transformation and style
          </p>
        </div>
        
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
              onClick={(e) => {
                if (e.shiftKey) {
                  handleImageSelect(image.url);
                } else {
                  setPreviewImage(image);
                  setShowPreview(true);
                }
              }}
            >
              <div className="group-hover:opacity-100 opacity-0 absolute top-2 left-2 z-20 transition-opacity">
                <button 
                  className="p-2 bg-black/70 rounded-full hover:bg-black"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleImageSelect(image.url);
                  }}
                >
                  <Check className={`w-4 h-4 ${selectedImages.includes(image.url) ? 'text-white' : 'text-gray-300'}`} />
                </button>
              </div>
              <img
                src={image.url}
                alt={image.title}
                className="w-full h-48 object-cover rounded-lg transition-transform duration-200 group-hover:scale-[1.02]"
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

      {/* Preview Modal */}
      {showPreview && previewImage && (
        <div className="fixed inset-0 bg-black bg-opacity-80 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden relative">
            <button 
              onClick={() => setShowPreview(false)}
              className="absolute top-4 right-4 p-2 bg-black/10 hover:bg-black/20 rounded-full"
            >
              <X className="w-6 h-6" />
            </button>
            
            <div className="p-6">
              <div className="flex items-start space-x-6">
                <div className="flex-1">
                  <img
                    src={previewImage.url}
                    alt={previewImage.title}
                    className="w-full h-auto rounded-lg shadow-lg"
                  />
                </div>
                <div className="w-72 space-y-4">
                  <h3 className="text-2xl font-medium">{previewImage.title}</h3>
                  <p className="text-gray-600">{previewImage.description}</p>
                  
                  <div className="space-y-2">
                    <button 
                      onClick={() => handleImageSelect(previewImage.url)}
                      className="w-full flex items-center justify-center space-x-2 bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800"
                    >
                      <Check className="w-5 h-5" />
                      <span>{selectedImages.includes(previewImage.url) ? 'Selected' : 'Select Template'}</span>
                    </button>
                    
                    <button className="w-full flex items-center justify-center space-x-2 border border-gray-200 px-4 py-2 rounded-lg hover:bg-gray-50">
                      <ZoomIn className="w-5 h-5" />
                      <span>Full Preview</span>
                    </button>
                  </div>

                  <div className="pt-4 border-t">
                    <h4 className="font-medium mb-2">Template Details</h4>
                    <dl className="space-y-1 text-sm">
                      <dt className="text-gray-500">Category</dt>
                      <dd className="font-medium">{previewImage.category}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Selection Indicator */}
      {selectedImages.length > 0 && (
        <div className="fixed bottom-6 right-6 bg-black text-white px-6 py-3 rounded-full shadow-lg flex items-center space-x-4">
          <span>{selectedImages.length} selected</span>
          <button className="bg-white/10 p-2 rounded-full hover:bg-white/20">
            <Download className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
}
import React, { useState } from 'react';
import { Heart, Download, X, Save, Sparkles } from 'lucide-react';

interface GeneratedImagePreviewProps {
  imageUrls: string[];
  isLoading: boolean;
  concept?: any;
  onSave?: (imageUrls: string[]) => void;
}

const skeletons = Array.from({ length: 2 });

const GeneratedImagePreview: React.FC<GeneratedImagePreviewProps> = ({ 
  imageUrls, 
  isLoading, 
  concept,
  onSave 
}) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [savedImages, setSavedImages] = useState<Set<string>>(new Set());
  
  const downloadImage = (imageUrl: string, filename: string) => {
    try {
      const link = document.createElement('a');
      link.href = imageUrl;
      link.download = filename;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error downloading image:', error);
    }
  };

  const handleSaveImage = async (imageUrl: string) => {
    try {
      console.log('🔄 Attempting to save image:', imageUrl);
      console.log('🔄 Concept data:', concept);
      
      const response = await fetch('/api/save-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageUrl,
          source: 'maya_generation',
          prompt: concept?.fluxPrompt || concept?.title || 'Maya AI Generation'
        }),
        credentials: 'include'
      });

      console.log('📊 Save response status:', response.status);
      
      if (response.ok) {
        const result = await response.json();
        console.log('✅ Save response:', result);
        setSavedImages(prev => new Set([...prev, imageUrl]));
        console.log('✅ Image saved to gallery successfully');
        
        // Show success feedback
        alert('Image saved to gallery!');
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('❌ Failed to save image:', response.status, errorData);
        alert(`Failed to save image: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('❌ Error saving image:', error);
      alert(`Error saving image: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleSaveAll = async () => {
    console.log('🔄 Attempting to save all images:', imageUrls);
    
    try {
      // Save each image individually 
      for (const imageUrl of imageUrls) {
        await handleSaveImage(imageUrl);
      }
      
      // Also call the onSave callback if provided
      if (onSave && imageUrls.length > 0) {
        onSave(imageUrls);
      }
      
      console.log('✅ All images saved successfully');
    } catch (error) {
      console.error('❌ Error saving all images:', error);
      alert(`Error saving images: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  return (
    <>
      <div className="mt-6">
        {isLoading ? (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-neutral-800/40 rounded-editorial-md border border-neutral-700/30">
                <Sparkles size={16} className="text-neutral-400" strokeWidth={1.5} />
              </div>
              <p className="text-neutral-400 text-sm tracking-wide uppercase">
                Generating your vision...
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {skeletons.map((_, i) => (
                <div 
                  key={i} 
                  className="aspect-square bg-neutral-800/30 rounded-editorial-lg border border-neutral-700/20 animate-pulse"
                />
              ))}
            </div>
          </div>
        ) : imageUrls.length > 0 ? (
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-neutral-800/40 rounded-editorial-md border border-neutral-700/30">
                  <Sparkles size={16} className="text-neutral-300" strokeWidth={1.5} />
                </div>
                <p className="text-neutral-300 text-sm tracking-wide uppercase">
                  Generated Images
                </p>
              </div>
              <button
                onClick={handleSaveAll}
                className="text-neutral-400 text-xs tracking-wide uppercase hover:text-neutral-300 transition-colors flex items-center gap-2"
              >
                <Save size={14} strokeWidth={1.5} />
                Save All
              </button>
            </div>
            
            {/* Image Grid */}
            <div className="grid grid-cols-2 gap-4">
              {imageUrls.map((url, index) => (
                <div key={index} className="group relative cursor-pointer">
                  <div className="aspect-square relative overflow-hidden rounded-editorial-lg border border-neutral-700/20 bg-neutral-800/20">
                    <img
                      src={url}
                      alt={`Generated ${index + 1}`}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      onClick={() => setSelectedImage(url)}
                    />
                    
                    {/* Sophisticated Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    
                    {/* Action Buttons */}
                    <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSaveImage(url);
                        }}
                        className={`p-2 rounded-full backdrop-blur-sm transition-all duration-200 ${
                          savedImages.has(url) 
                            ? 'bg-red-500/90 text-white' 
                            : 'bg-white/20 text-white hover:bg-white/30'
                        }`}
                        title={savedImages.has(url) ? 'Saved to gallery' : 'Save to gallery'}
                      >
                        <Heart 
                          size={14} 
                          strokeWidth={1.5} 
                          className={savedImages.has(url) ? 'fill-current' : ''}
                        />
                      </button>
                    </div>
                    
                    {/* Image Number */}
                    <div className="absolute bottom-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <span className="text-white text-xs tracking-wide font-light">
                        IMG_{String(index + 1).padStart(2, '0')}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>

      {/* Luxury Full-screen preview modal */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="editorial-modal max-w-4xl w-full max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-neutral-800/30">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-neutral-800/40 rounded-editorial-md border border-neutral-700/30">
                  <Sparkles size={16} className="text-neutral-300" strokeWidth={1.5} />
                </div>
                <h3 className="text-lg font-light text-neutral-200 tracking-wide">IMAGE PREVIEW</h3>
              </div>
              <button
                onClick={() => setSelectedImage(null)}
                className="p-2 hover:bg-neutral-800/40 rounded-editorial-md transition-colors"
              >
                <X size={20} className="text-neutral-400" strokeWidth={1.5} />
              </button>
            </div>
            
            {/* Image */}
            <div className="flex-1 flex items-center justify-center p-8 bg-gradient-to-br from-neutral-900/50 to-neutral-800/30">
              <img
                src={selectedImage}
                alt="Full preview"
                className="max-w-full max-h-[60vh] object-contain rounded-editorial-lg shadow-editorial-xl"
              />
            </div>
            
            {/* Actions */}
            <div className="p-6 border-t border-neutral-800/30 bg-gradient-to-r from-neutral-900/50 to-neutral-800/30">
              <div className="flex items-center justify-center gap-4">
                <button
                  onClick={() => handleSaveImage(selectedImage)}
                  className={`editorial-button-secondary flex items-center gap-2 px-6 py-3 ${
                    savedImages.has(selectedImage) 
                      ? 'bg-red-900/20 text-red-300 border-red-800/30' 
                      : ''
                  }`}
                >
                  <Heart 
                    size={16} 
                    strokeWidth={1.5} 
                    className={savedImages.has(selectedImage) ? 'fill-current' : ''}
                  />
                  {savedImages.has(selectedImage) ? 'SAVED' : 'SAVE TO GALLERY'}
                </button>
                
                <button
                  onClick={() => downloadImage(selectedImage, `maya-generation-${Date.now()}.png`)}
                  className="editorial-button-secondary flex items-center gap-2 px-6 py-3"
                >
                  <Download size={16} strokeWidth={1.5} />
                  DOWNLOAD
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default GeneratedImagePreview;

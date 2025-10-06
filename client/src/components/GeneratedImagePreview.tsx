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

      
      if (response.ok) {
        const result = await response.json();
        setSavedImages(prev => new Set([...prev, imageUrl]));
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('❌ Failed to save image:', response.status, errorData);
      }
    } catch (error) {
      console.error('❌ Error saving image:', error);
    }
  };

  const handleSaveAll = async () => {
    
    try {
      for (const imageUrl of imageUrls) {
        await handleSaveImage(imageUrl);
      }
      
      if (onSave && imageUrls.length > 0) {
        onSave(imageUrls);
      }
      
    } catch (error) {
      console.error('❌ Error saving all images:', error);
    }
  };

  return (
    <>
      <div className="mt-6">
        {isLoading ? (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-stone-500/10 rounded-xl border border-stone-400/20">
                <Sparkles size={16} className="text-stone-600" strokeWidth={1.5} />
              </div>
              <p className="text-stone-600 text-xs tracking-[0.15em] uppercase font-light">
                Generating your vision...
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {skeletons.map((_, i) => (
                <div 
                  key={i} 
                  className="aspect-square bg-stone-200/40 rounded-2xl border border-stone-300/30 animate-pulse"
                />
              ))}
            </div>
          </div>
        ) : imageUrls.length > 0 ? (
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-stone-500/10 rounded-xl border border-stone-400/20">
                  <Sparkles size={16} className="text-stone-600" strokeWidth={1.5} />
                </div>
                <p className="text-stone-950 text-xs tracking-[0.15em] uppercase font-light">
                  Generated Images
                </p>
              </div>
              <button
                onClick={handleSaveAll}
                className="text-stone-600 text-xs tracking-[0.15em] uppercase font-light hover:text-stone-950 transition-colors flex items-center gap-2"
              >
                <Save size={14} strokeWidth={1.5} />
                Save All
              </button>
            </div>
            
            {/* Image Grid */}
            <div className="grid grid-cols-2 gap-4">
              {imageUrls.map((url, index) => (
                <div key={index} className="group relative cursor-pointer">
                  <div className="aspect-square relative overflow-hidden rounded-2xl border border-stone-200/40 bg-stone-100/40">
                    <img
                      src={url}
                      alt={`Generated ${index + 1}`}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      onClick={() => setSelectedImage(url)}
                    />
                    
                    {/* Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-stone-950/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    
                    {/* Action Button */}
                    <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSaveImage(url);
                        }}
                        className={`p-2 rounded-xl backdrop-blur-sm transition-all duration-200 ${
                          savedImages.has(url) 
                            ? 'bg-stone-900/90 text-stone-50' 
                            : 'bg-stone-50/20 text-stone-50 hover:bg-stone-50/30'
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
                      <span className="text-stone-50 text-xs tracking-[0.15em] uppercase font-light">
                        Image {String(index + 1).padStart(2, '0')}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>

      {/* Full-screen preview modal */}
      {selectedImage && (
        <div className="fixed inset-0 bg-stone-950/95 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-stone-100/95 backdrop-blur-xl rounded-3xl border border-stone-200/60 max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-stone-200/40">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-stone-500/10 rounded-xl border border-stone-400/20">
                  <Sparkles size={16} className="text-stone-600" strokeWidth={1.5} />
                </div>
                <h3 className="text-base font-serif font-extralight text-stone-950 tracking-[0.15em] uppercase">Image Preview</h3>
              </div>
              <button
                onClick={() => setSelectedImage(null)}
                className="p-2 hover:bg-stone-200/50 rounded-xl transition-colors"
              >
                <X size={20} className="text-stone-600" strokeWidth={1.5} />
              </button>
            </div>
            
            {/* Image */}
            <div className="flex-1 flex items-center justify-center p-8 bg-stone-50/50 overflow-auto">
              <img
                src={selectedImage}
                alt="Full preview"
                className="max-w-full max-h-[60vh] object-contain rounded-2xl shadow-lg"
              />
            </div>
            
            {/* Actions */}
            <div className="p-6 border-t border-stone-200/40 bg-stone-100/60">
              <div className="flex items-center justify-center gap-4">
                <button
                  onClick={() => handleSaveImage(selectedImage)}
                  className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-light tracking-[0.1em] uppercase text-sm transition-all duration-200 ${
                    savedImages.has(selectedImage)
                      ? 'bg-stone-900 text-stone-50'
                      : 'bg-stone-100/50 text-stone-950 border border-stone-200/40 hover:bg-stone-100/70'
                  }`}
                >
                  <Heart 
                    size={16} 
                    strokeWidth={1.5} 
                    className={savedImages.has(selectedImage) ? 'fill-current' : ''}
                  />
                  {savedImages.has(selectedImage) ? 'Saved' : 'Save to Gallery'}
                </button>
                
                <button
                  onClick={() => downloadImage(selectedImage, `sselfie-generation-${Date.now()}.png`)}
                  className="flex items-center gap-2 px-6 py-3 bg-stone-100/50 text-stone-950 border border-stone-200/40 rounded-2xl hover:bg-stone-100/70 transition-colors font-light tracking-[0.1em] uppercase text-sm"
                >
                  <Download size={16} strokeWidth={1.5} />
                  Download
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

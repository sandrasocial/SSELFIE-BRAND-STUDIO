import React, { useState } from 'react';
import { Heart, Download, X, Sparkles, CheckCircle, AlertCircle } from 'lucide-react';

interface ConceptData {
  fluxPrompt?: string;
  title?: string;
  description?: string;
}

interface GeneratedImagePreviewProps {
  imageUrls: string[];
  isLoading: boolean;
  concept?: ConceptData;
  onSave?: (imageUrls: string[]) => void;
}

const GeneratedImagePreview: React.FC<GeneratedImagePreviewProps> = ({ 
  imageUrls, 
  isLoading, 
  concept,
  onSave 
}) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [savedImages, setSavedImages] = useState<Set<string>>(new Set());
  const [savingImages, setSavingImages] = useState<Set<string>>(new Set());
  const [saveErrors, setSaveErrors] = useState<Set<string>>(new Set());
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());
  
  const downloadImage = (imageUrl: string, filename: string) => {
    try {
      const link = document.createElement('a') as HTMLAnchorElement;
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
    // Add to saving state
    setSavingImages(prev => new Set([...prev, imageUrl]));
    setSaveErrors(prev => {
      const next = new Set(prev);
      next.delete(imageUrl);
      return next;
    });

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
        setSavedImages(prev => new Set([...prev, imageUrl]));
        setSaveErrors(prev => {
          const next = new Set(prev);
          next.delete(imageUrl);
          return next;
        });
      } else {
        setSaveErrors(prev => new Set([...prev, imageUrl]));
      }
    } catch (error) {
      console.error('❌ Error saving image:', error);
      setSaveErrors(prev => new Set([...prev, imageUrl]));
    } finally {
      setSavingImages(prev => {
        const next = new Set(prev);
        next.delete(imageUrl);
        return next;
      });
    }
  };

  const handleSaveAll = async () => {
    for (const imageUrl of imageUrls) {
      if (!savedImages.has(imageUrl) && !savingImages.has(imageUrl)) {
        await handleSaveImage(imageUrl);
      }
    }
    
    if (onSave && imageUrls.length > 0) {
      onSave(imageUrls);
    }
  };

  const handleImageLoad = (imageUrl: string) => {
    setLoadedImages(prev => new Set([...prev, imageUrl]));
  };

  // Skeleton loader component
  const ImageSkeleton = () => (
    <div className="relative overflow-hidden rounded-xl sm:rounded-2xl bg-stone-200/40 border border-stone-300/30">
      <div className="aspect-square flex items-center justify-center">
        <div className="w-12 h-12 border-2 border-stone-300 border-t-stone-600 rounded-full animate-spin"></div>
      </div>
      {/* Shimmer effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-stone-100/50 to-transparent animate-shimmer"></div>
    </div>
  );

  return (
    <>
      <div className="mt-6">
        {isLoading ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-stone-600 animate-pulse" strokeWidth={1.5} />
                <span className="text-sm tracking-[0.15em] uppercase font-light text-stone-600">
                  Creating Magic
                </span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <ImageSkeleton />
              <ImageSkeleton />
            </div>
          </div>
        ) : imageUrls.length > 0 ? (
          <div className="space-y-4 sm:space-y-6">
            {/* Header with Save All */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-stone-600" strokeWidth={1.5} />
                <span className="text-sm sm:text-base tracking-[0.15em] uppercase font-light text-stone-600">
                  {imageUrls.length} {imageUrls.length === 1 ? 'Image' : 'Images'} Ready
                </span>
              </div>
              
              {/* Save All Button - Proper Touch Target */}
              <button
                onClick={handleSaveAll}
                disabled={savedImages.size === imageUrls.length}
                className="flex items-center gap-2 px-4 py-3 bg-stone-950 text-stone-50 rounded-xl font-light tracking-[0.15em] uppercase text-xs sm:text-sm transition-all duration-200 hover:bg-stone-800 disabled:opacity-50 disabled:cursor-not-allowed min-h-[48px]"
              >
                <Heart size={16} strokeWidth={1.5} />
                <span className="hidden sm:inline">Save All</span>
                <span className="sm:hidden">Save</span>
              </button>
            </div>

            {/* Images Grid */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              {imageUrls.map((url, index) => {
                const isSaved = savedImages.has(url);
                const isSaving = savingImages.has(url);
                const hasError = saveErrors.has(url);
                const isLoaded = loadedImages.has(url);

                return (
                  <div 
                    key={index} 
                    className="relative group cursor-pointer overflow-hidden rounded-xl sm:rounded-2xl border border-stone-200/40 hover:border-stone-300/60 transition-all duration-300 hover:shadow-lg"
                    onClick={() => setSelectedImage(url)}
                  >
                    <div className="aspect-square relative bg-stone-100">
                      {/* Image */}
                      <img 
                        src={url} 
                        alt={`Generated ${index + 1}`}
                        className={`w-full h-full object-cover transition-all duration-500 ${
                          isLoaded ? 'opacity-100 group-hover:scale-110' : 'opacity-0'
                        }`}
                        onLoad={() => handleImageLoad(url)}
                        loading="lazy"
                      />
                      
                      {/* Loading State */}
                      {!isLoaded && (
                        <div className="absolute inset-0 flex items-center justify-center bg-stone-200/40">
                          <div className="w-8 h-8 border-2 border-stone-300 border-t-stone-600 rounded-full animate-spin"></div>
                        </div>
                      )}
                      
                      {/* Dark Overlay on Hover */}
                      <div className="absolute inset-0 bg-stone-900/0 group-hover:bg-stone-900/40 transition-all duration-500"></div>
                      
                      {/* Action Buttons - FIXED TOUCH TARGETS */}
                      <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        {/* Save Button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSaveImage(url);
                          }}
                          disabled={isSaving}
                          className={`flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-xl backdrop-blur-sm transition-all duration-200 hover:scale-110 min-h-[48px] min-w-[48px] ${
                            isSaved 
                              ? 'bg-stone-900/90 text-stone-50' 
                              : 'bg-stone-50/20 text-stone-50 hover:bg-stone-50/30'
                          }`}
                          title={isSaved ? 'Saved to gallery' : isSaving ? 'Saving...' : 'Save to gallery'}
                          aria-label={isSaved ? 'Saved to gallery' : 'Save to gallery'}
                        >
                          {isSaving ? (
                            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                          ) : isSaved ? (
                            <CheckCircle size={18} strokeWidth={1.5} className="fill-current" />
                          ) : hasError ? (
                            <AlertCircle size={18} strokeWidth={1.5} />
                          ) : (
                            <Heart size={18} strokeWidth={1.5} />
                          )}
                        </button>
                        
                        {/* Download Button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            downloadImage(url, `sselfie-generation-${Date.now()}-${index + 1}.png`);
                          }}
                          className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-stone-50/20 backdrop-blur-sm rounded-xl text-stone-50 hover:bg-stone-50/30 transition-all duration-200 hover:scale-110 min-h-[48px] min-w-[48px]"
                          title="Download image"
                          aria-label="Download image"
                        >
                          <Download size={18} strokeWidth={1.5} />
                        </button>
                      </div>
                      
                      {/* Image Number */}
                      <div className="absolute bottom-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <span className="text-stone-50 text-xs tracking-[0.15em] uppercase font-light drop-shadow-lg">
                          Image {String(index + 1).padStart(2, '0')}
                        </span>
                      </div>

                      {/* Save Status Badge */}
                      {(isSaved || hasError) && (
                        <div className="absolute top-3 left-3">
                          <div className={`flex items-center gap-1.5 px-2 py-1 rounded-lg backdrop-blur-sm ${
                            isSaved ? 'bg-stone-900/80 text-stone-50' : 'bg-red-600/80 text-white'
                          }`}>
                            {isSaved ? (
                              <CheckCircle size={12} strokeWidth={2} />
                            ) : (
                              <AlertCircle size={12} strokeWidth={2} />
                            )}
                            <span className="text-[10px] tracking-wider uppercase font-light">
                              {isSaved ? 'Saved' : 'Failed'}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : null}
      </div>

      {/* Full-screen preview modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 bg-stone-950/95 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="bg-stone-100/95 backdrop-blur-xl rounded-2xl sm:rounded-3xl border border-stone-200/60 max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-5 sm:p-6 border-b border-stone-200/40">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-stone-500/10 rounded-xl border border-stone-400/20">
                  <Sparkles size={16} className="text-stone-600" strokeWidth={1.5} />
                </div>
                <h3 className="text-base font-serif font-extralight text-stone-950 tracking-[0.15em] uppercase">
                  Image Preview
                </h3>
              </div>
              <button
                onClick={() => setSelectedImage(null)}
                className="p-3 hover:bg-stone-200/50 rounded-xl transition-colors min-h-[48px] min-w-[48px] flex items-center justify-center"
                aria-label="Close preview"
              >
                <X size={20} className="text-stone-600" strokeWidth={1.5} />
              </button>
            </div>
            
            {/* Image */}
            <div 
              className="flex-1 flex items-center justify-center p-6 sm:p-8 bg-stone-50/50 overflow-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={selectedImage}
                alt="Full preview"
                className="max-w-full max-h-[60vh] object-contain rounded-xl sm:rounded-2xl shadow-lg"
              />
            </div>
            
            {/* Actions - FIXED TOUCH TARGETS */}
            <div className="p-5 sm:p-6 border-t border-stone-200/40 bg-stone-100/60">
              <div className="flex items-center justify-center gap-3 sm:gap-4">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSaveImage(selectedImage);
                  }}
                  disabled={savingImages.has(selectedImage)}
                  className={`flex items-center gap-2 px-5 sm:px-6 py-3 sm:py-4 rounded-xl sm:rounded-2xl font-light tracking-[0.1em] uppercase text-sm transition-all duration-200 hover:scale-[1.02] min-h-[56px] ${
                    savedImages.has(selectedImage)
                      ? 'bg-stone-900 text-stone-50'
                      : 'bg-stone-100/50 text-stone-950 border border-stone-200/40 hover:bg-stone-100/70'
                  }`}
                >
                  {savingImages.has(selectedImage) ? (
                    <>
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                      <span>Saving...</span>
                    </>
                  ) : savedImages.has(selectedImage) ? (
                    <>
                      <CheckCircle size={16} strokeWidth={1.5} />
                      <span>Saved</span>
                    </>
                  ) : (
                    <>
                      <Heart size={16} strokeWidth={1.5} />
                      <span>Save to Gallery</span>
                    </>
                  )}
                </button>
                
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    downloadImage(selectedImage, `sselfie-generation-${Date.now()}.png`);
                  }}
                  className="flex items-center gap-2 px-5 sm:px-6 py-3 sm:py-4 bg-stone-100/50 text-stone-950 border border-stone-200/40 rounded-xl sm:rounded-2xl hover:bg-stone-100/70 transition-colors font-light tracking-[0.1em] uppercase text-sm min-h-[56px]"
                >
                  <Download size={16} strokeWidth={1.5} />
                  <span>Download</span>
                </button>
              </div>

              {/* Error Message */}
              {saveErrors.has(selectedImage) && (
                <div className="mt-4 flex items-center justify-center gap-2 text-red-600">
                  <AlertCircle size={14} strokeWidth={1.5} />
                  <span className="text-xs font-light">Failed to save. Please try again.</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
      `}</style>
    </>
  );
};

export default GeneratedImagePreview;
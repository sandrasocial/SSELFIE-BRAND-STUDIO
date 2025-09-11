import React, { useState } from 'react';

interface CanvasPanelProps {
  mode: 'photo' | 'story';
  children?: React.ReactNode;
  className?: string;
  onItemSelect?: (item: any) => void;
  selectedItem?: any;
}

export const CanvasPanel: React.FC<CanvasPanelProps> = ({
  mode,
  children,
  className = '',
  onItemSelect,
  selectedItem
}) => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Responsive monitoring
  React.useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Mobile: Full-screen main view
  if (isMobile) {
    return (
      <div className={`mobile-canvas flex-1 overflow-y-auto ${className}`}>
        <div className="p-4">
          {/* Mobile Header */}
          <div className="text-center mb-8">
            <div className="luxury-eyebrow">Maya's Brand Studio</div>
            <h1 className="section-title text-2xl">
              {mode === 'photo' ? 'Photo Studio' : 'Story Studio'}
            </h1>
            <p className="body-elegant text-sm">
              {mode === 'photo' 
                ? 'Create professional photos with Maya\'s expertise'
                : 'Craft compelling video stories for your brand'
              }
            </p>
          </div>

          {/* Mobile Content */}
          <div className="space-y-6">
            {children}
          </div>
        </div>
      </div>
    );
  }

  // Desktop: Center panel with content
  return (
    <div className={`desktop-panel ${className}`}>
      <div className="p-6 border-b border-gray-100">
        <h3 className="spaced-title text-sm">
          {mode === 'photo' ? 'Photo Canvas' : 'Story Canvas'}
        </h3>
        <p className="text-xs text-gray-500 tracking-wider uppercase">
          Your Creative Workspace
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {children}
      </div>
    </div>
  );
};

// Concept Card Component for Photo Studio - Updated to use extended Maya ConceptCard type
interface ConceptCardProps {
  card: {
    id: string;
    title: string;
    description: string;
    fluxPrompt?: string; // Maya's embedded FLUX-optimized prompt
    emoji?: string; // Maya's styling emoji (🎯✨💼🌟💫🏆📸🎬)
    creativeLook?: string; // One of Maya's 12 Creative Looks
    creativeLookDescription?: string; // Brief description of the Creative Look
    generatedImages?: string[];
    isGenerating?: boolean;
    hasGenerated?: boolean;
  };
  isExpanded?: boolean;
  onToggleExpand?: () => void;
  onGenerate?: () => void;
  onSelect?: () => void;
  onSaveToGallery?: (imageUrl: string) => void;
  onCreateVideo?: () => void;
  isSelected?: boolean;
  showVideoButton?: boolean;
}

export const ConceptCard: React.FC<ConceptCardProps> = ({
  card,
  isExpanded = false,
  onToggleExpand,
  onGenerate,
  onSelect,
  onSaveToGallery,
  onCreateVideo,
  isSelected = false,
  showVideoButton = false
}) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const cleanDisplayTitle = (title: string): string => {
    return title.replace(/[^a-zA-Z0-9\s\-_]/g, '').trim();
  };

  return (
    <>
      <div 
        className={`border border-gray-200 bg-white transition-all duration-300 ${
          isSelected ? 'ring-2 ring-black' : 'hover:border-gray-300'
        }`}
        onClick={onSelect}
      >
        <div className="px-8 py-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              {/* Maya's Creative Look and Emoji Display */}
              {(card.emoji || card.creativeLook) && (
                <div className="flex items-center gap-2 mb-2">
                  {card.emoji && (
                    <span className="text-lg" title="Maya's styling approach">
                      {card.emoji}
                    </span>
                  )}
                  {card.creativeLook && (
                    <span 
                      className="text-xs tracking-wider uppercase text-gray-500 px-2 py-1 border border-gray-200 rounded"
                      style={{ letterSpacing: '0.15em' }}
                      title={card.creativeLookDescription || `Maya's ${card.creativeLook} creative direction`}
                    >
                      {card.creativeLook}
                    </span>
                  )}
                </div>
              )}
              
              <h4 
                className="text-base tracking-wider uppercase text-black cursor-pointer"
                style={{ 
                  fontFamily: 'Times New Roman, serif', 
                  fontWeight: 200, 
                  letterSpacing: '0.2em' 
                }}
              >
                {cleanDisplayTitle(card.title)}
              </h4>
            </div>
          </div>

          <p 
            className="text-gray-600 mb-6 leading-relaxed"
            style={{ fontFamily: 'Helvetica Neue', fontWeight: 300, lineHeight: 1.7 }}
          >
            {isExpanded || card.description.length <= 150 
              ? card.description
              : `${card.description.substring(0, 150)}...`
            }
          </p>

          <div className="flex items-center justify-between flex-wrap gap-3">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleExpand?.();
              }}
              className="text-xs tracking-wider uppercase text-gray-600 hover:text-black transition-colors border-b border-transparent hover:border-black pb-1"
              style={{ letterSpacing: '0.2em' }}
            >
              {isExpanded ? 'Show Less' : 'View Details'}
            </button>
            
            <div className="flex gap-3">
              {showVideoButton && card.hasGenerated && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onCreateVideo?.();
                  }}
                  className="luxury-btn secondary text-xs"
                >
                  Create Video
                </button>
              )}
              
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onGenerate?.();
                }}
                disabled={card.isGenerating}
                className="luxury-btn text-xs"
              >
                {card.isGenerating ? 'Creating...' : 'Generate Photos'}
              </button>
            </div>
          </div>

          {/* Loading State */}
          {card.isGenerating && (
            <div className="mt-6 pt-6 border-t border-gray-100">
              <div className="flex items-center text-xs text-gray-500 tracking-wider uppercase" style={{ letterSpacing: '0.2em' }}>
                <div className="flex space-x-2 mr-4">
                  <div className="w-1 h-1 bg-gray-400 rounded-full animate-pulse"></div>
                  <div className="w-1 h-1 bg-gray-400 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                  <div className="w-1 h-1 bg-gray-400 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
                </div>
                Creating your professional photos...
              </div>
            </div>
          )}

          {/* Image Gallery */}
          {card.generatedImages && card.generatedImages.length > 0 && (
            <div className="mt-8 pt-8 border-t border-gray-100">
              <p 
                className="text-xs text-gray-400 tracking-wider uppercase mb-6"
                style={{ letterSpacing: '0.2em' }}
              >
                Your Professional Photos
              </p>
              <div className="grid grid-cols-2 gap-4">
                {card.generatedImages.map((imageUrl, imgIndex) => {
                  const proxyUrl = `/api/proxy-image?url=${encodeURIComponent(imageUrl)}`;
                  return (
                    <div key={imgIndex} className="relative group">
                      <img 
                        src={proxyUrl}
                        alt={`Generated ${cleanDisplayTitle(card.title)} ${imgIndex + 1}`}
                        className="w-full h-48 object-cover cursor-pointer hover:opacity-95 transition-opacity filter grayscale-[10%]"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedImage(proxyUrl);
                        }}
                        onError={(e) => {
                          console.error('Image proxy failed:', proxyUrl);
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                        }}
                      />
                      <button
                        className="absolute top-3 right-3 w-8 h-8 bg-white/90 hover:bg-white flex items-center justify-center text-black hover:text-gray-800 opacity-0 group-hover:opacity-100 transition-all"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSaveToGallery?.(imageUrl);
                        }}
                        title="Save to gallery"
                      >
                        <span className="text-sm">♡</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Image Modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-95 flex items-center justify-center z-50 p-8"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-full max-h-full">
            <img 
              src={selectedImage}
              alt="Full size view"
              className="max-w-full max-h-full object-contain"
              onClick={(e) => e.stopPropagation()}
            />
            <button 
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center bg-white/10 hover:bg-white/20 text-white hover:text-white transition-colors"
              title="Close"
            >
              <span className="text-lg leading-none">×</span>
            </button>
          </div>
        </div>
      )}
    </>
  );
};

// Scene Card Component for Story Studio
interface SceneCardProps {
  scene: {
    id: string;
    scene: number;
    prompt: string;
  };
  onUpdatePrompt?: (prompt: string) => void;
  onAddImage?: (file: File) => void;
  onSelect?: () => void;
  isSelected?: boolean;
  hasImage?: boolean;
  imageName?: string;
}

export const SceneCard: React.FC<SceneCardProps> = ({
  scene,
  onUpdatePrompt,
  onAddImage,
  onSelect,
  isSelected = false,
  hasImage = false,
  imageName = ''
}) => {
  const [fileName, setFileName] = useState(imageName || '');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      onAddImage?.(file);
    }
  };

  return (
    <div 
      className={`scene-card border border-gray-200 bg-white transition-all duration-300 ${
        isSelected ? 'ring-2 ring-black' : 'hover:border-gray-300'
      }`}
      onClick={onSelect}
    >
      <div className="p-6">
        <h4 className="spaced-title text-sm mb-4">SCENE {scene.scene}</h4>
        
        <div className="mb-4">
          <textarea
            className="form-input text-sm"
            rows={3}
            value={scene.prompt}
            onChange={(e) => {
              e.stopPropagation();
              onUpdatePrompt?.(e.target.value);
            }}
            onClick={(e) => e.stopPropagation()}
            placeholder="Describe this scene in detail..."
          />
        </div>
        
        <div>
          <input
            id={`file-input-${scene.scene}`}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
            onClick={(e) => e.stopPropagation()}
          />
          <label 
            htmlFor={`file-input-${scene.scene}`} 
            className="luxury-btn secondary text-xs w-full text-center block cursor-pointer"
            onClick={(e) => e.stopPropagation()}
          >
            {fileName || 'Add Inspiration Image (Optional)'}
          </label>
        </div>
      </div>
    </div>
  );
};
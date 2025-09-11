import React, { useState } from 'react';
import { Camera, Video, Sparkles } from 'lucide-react';

// Flatlay image collection for luxury visual backgrounds
const FLATLAY_IMAGES = [
  'https://i.postimg.cc/VLCFmXVr/1.png',
  'https://i.postimg.cc/WpDyqFyj/10.png', 
  'https://i.postimg.cc/SRz1B39j/100.png',
  'https://i.postimg.cc/bJ5FFpsK/101.png',
  'https://i.postimg.cc/F15CNpbp/102.png',
  'https://i.postimg.cc/pVh2VdY5/103.png',
  'https://i.postimg.cc/tRK9sH2S/104.png',
  'https://i.postimg.cc/2Smmx7pn/105.png',
  'https://i.postimg.cc/YqQMgyPp/106.png',
  'https://i.postimg.cc/Bng37Psk/107.png',
  'https://i.postimg.cc/zf2r8myk/108.png',
  'https://i.postimg.cc/4dKT38tR/109.png',
  'https://i.postimg.cc/dQzx2QMC/11.png',
  'https://i.postimg.cc/4drRHzb7/110.png',
  'https://i.postimg.cc/ryrkXPMS/111.png',
  'https://i.postimg.cc/PrnktQ50/112.png',
  'https://i.postimg.cc/3JjQW0yN/113.png',
  'https://i.postimg.cc/wj68NxJV/114.png'
];

export type ConceptCard = {
  id: string;
  title: string;
  description: string;
  emoji?: string;
  creativeLook?: string;
  creativeLookDescription?: string;
  fluxPrompt?: string;
  imageUrl?: string;
  generatedImages?: string[];
  isGenerating?: boolean;
  category?: string;
  type?: 'portrait' | 'flatlay' | 'lifestyle'; // 80/20 rule categorization
};

interface LuxuryConceptCardProps {
  concept: ConceptCard;
  isSelected?: boolean;
  onClick?: () => void;
  onGenerate?: () => void;
}

const LuxuryConceptCard: React.FC<LuxuryConceptCardProps> = ({ 
  concept, 
  isSelected = false, 
  onClick,
  onGenerate 
}) => {
  // Select a flatlay background based on concept ID for consistency
  const flatlayImage = FLATLAY_IMAGES[parseInt(concept.id.slice(-1)) % FLATLAY_IMAGES.length] || FLATLAY_IMAGES[0];

  return (
    <div 
      className={`luxury-concept-card group cursor-pointer transition-all duration-300 transform hover:scale-[1.02] hover:shadow-2xl ${
        isSelected ? 'ring-2 ring-black shadow-2xl' : 'shadow-lg hover:shadow-xl'
      }`}
      onClick={onClick}
      style={{
        backgroundImage: `linear-gradient(135deg, rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.1)), url(${flatlayImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      {/* Content overlay */}
      <div className="relative p-6 bg-gradient-to-t from-black/80 via-black/20 to-transparent min-h-[280px] flex flex-col justify-end">
        
        {/* Type indicator */}
        <div className="absolute top-4 right-4">
          <div className="bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full">
            <span className="text-xs font-medium text-gray-800 tracking-wider uppercase">
              {concept.type === 'portrait' ? 'Portrait' : concept.type === 'flatlay' ? 'Flatlay' : 'Lifestyle'}
            </span>
          </div>
        </div>

        {/* Creative Look Tag */}
        {concept.creativeLook && (
          <div className="mb-3">
            <div className="inline-flex items-center bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
              <Sparkles className="w-3 h-3 mr-2 text-white" />
              <span className="text-xs text-white font-medium tracking-wide">
                {concept.creativeLook}
              </span>
            </div>
          </div>
        )}

        {/* Main content */}
        <div className="text-white">
          <h3 className="text-lg font-bold mb-2 leading-tight">
            {concept.emoji && <span className="mr-2">{concept.emoji}</span>}
            {concept.title}
          </h3>
          
          <p className="text-sm text-white/90 mb-4 leading-relaxed">
            {concept.description}
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex gap-2 mt-auto">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onGenerate?.();
            }}
            className="flex-1 bg-white/90 backdrop-blur-sm text-gray-900 px-4 py-2 rounded-lg font-medium text-sm hover:bg-white transition-all duration-200 flex items-center justify-center gap-2"
          >
            <Camera className="w-4 h-4" />
            Generate Photos
          </button>
          
          {concept.type === 'portrait' && (
            <button
              onClick={(e) => e.stopPropagation()}
              className="bg-black/50 backdrop-blur-sm text-white px-3 py-2 rounded-lg hover:bg-black/70 transition-all duration-200"
            >
              <Video className="w-4 h-4" />
            </button>
          )}
        </div>
        
        {/* Generated images preview */}
        {concept.generatedImages?.length > 0 && (
          <div className="mt-4 flex gap-1 overflow-x-auto">
            {concept.generatedImages.slice(0, 4).map((img, idx) => (
              <img 
                key={idx}
                src={img}
                alt={`Generated ${idx + 1}`}
                className="w-12 h-12 object-cover rounded border-2 border-white/50"
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

interface CanvasPanelProps {
  mode: 'photo' | 'story';
  conceptCards?: ConceptCard[];
  selectedConceptId?: string | null;
  onConceptSelect?: (id: string) => void;
  onConceptGenerate?: (concept: ConceptCard) => void;
  children?: React.ReactNode;
  className?: string;
  onItemSelect?: (item: any) => void;
  selectedItem?: any;
}

export const CanvasPanel: React.FC<CanvasPanelProps> = ({
  mode,
  conceptCards = [],
  selectedConceptId,
  onConceptSelect,
  onConceptGenerate,
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

  // Desktop: Center panel with luxury concept card grid
  return (
    <div className={`desktop-panel ${className}`}>
      <div className="p-6 border-b border-gray-100">
        <h3 className="spaced-title text-sm">
          {mode === 'photo' ? 'Creative Lookbook' : 'Story Canvas'}
        </h3>
        <p className="text-xs text-gray-500 tracking-wider uppercase">
          Maya's Concept Gallery
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {conceptCards.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div 
              className="w-full max-w-md h-64 rounded-xl mb-6 flex items-center justify-center"
              style={{
                backgroundImage: `linear-gradient(135deg, rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.2)), url(${FLATLAY_IMAGES[0]})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}
            >
              <div className="text-white text-center">
                <Sparkles className="w-12 h-12 mx-auto mb-4 opacity-80" />
                <h3 className="text-xl font-bold mb-2">Ready to Create</h3>
                <p className="text-sm opacity-90">Ask Maya for photo concepts and watch them come to life</p>
              </div>
            </div>
            <p className="text-gray-600 text-sm">
              Start a conversation with Maya to see your concept cards appear here
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {conceptCards.map((concept) => (
              <LuxuryConceptCard
                key={concept.id}
                concept={concept}
                isSelected={selectedConceptId === concept.id}
                onClick={() => onConceptSelect?.(concept.id)}
                onGenerate={() => onConceptGenerate?.(concept)}
              />
            ))}
          </div>
        )}

        {children}
      </div>
    </div>
  );
};

export { LuxuryConceptCard, ConceptCard };

// Legacy Concept Card Component (kept for backward compatibility)
interface LegacyConceptCardProps {
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

const LegacyConceptCard: React.FC<LegacyConceptCardProps> = ({
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
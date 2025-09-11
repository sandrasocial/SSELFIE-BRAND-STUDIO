import React, { useState } from 'react';
import { Camera, Video, Sparkles, Heart, Download, Play } from 'lucide-react';

// Luxury flatlay images for concept card backgrounds
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

interface ConceptCard {
  id: string;
  title: string;
  description: string;
  fluxPrompt?: string;
  emoji?: string;
  creativeLook?: string;
  type?: 'portrait' | 'flatlay' | 'lifestyle';
  generatedImages?: string[];
  isGenerating?: boolean;
}

interface LuxuryConceptCardProps {
  concept: ConceptCard;
  isSelected?: boolean;
  onClick?: () => void;
  onGenerate?: () => void;
  onCreateVideo?: () => void;
}

const LuxuryConceptCard: React.FC<LuxuryConceptCardProps> = ({ 
  concept, 
  isSelected = false, 
  onClick,
  onGenerate,
  onCreateVideo
}) => {
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // Select background image based on concept ID for consistency
  const backgroundImage = FLATLAY_IMAGES[
    parseInt(concept.id.replace(/\D/g, '') || '0') % FLATLAY_IMAGES.length
  ];

  const handleImageClick = (imageUrl: string) => {
    setSelectedImage(imageUrl);
    setImageModalOpen(true);
  };

  return (
    <>
      <div 
        className={`concept-card rounded-lg overflow-hidden cursor-pointer transition-all duration-300 transform hover:scale-[1.02] ${
          isSelected ? 'ring-2 ring-white shadow-2xl scale-[1.02]' : 'hover:shadow-xl'
        }`}
        onClick={onClick}
        style={{
          backgroundImage: `linear-gradient(135deg, rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.4)), url(${backgroundImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          minHeight: '320px'
        }}
      >
        <div className="p-6 h-full flex flex-col justify-between">

          {/* Header */}
          <div>
            {/* Type Badge */}
            <div className="flex justify-between items-start mb-4">
              {concept.type && (
                <div className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
                  <span 
                    className="text-xs text-white font-medium"
                    style={{ 
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                      fontWeight: 300
                    }}
                  >
                    {concept.type}
                  </span>
                </div>
              )}

              {concept.creativeLook && (
                <div className="bg-black/30 backdrop-blur-sm px-2 py-1 rounded">
                  <span className="text-xs text-white/90" style={{ fontWeight: 300 }}>
                    {concept.creativeLook}
                  </span>
                </div>
              )}
            </div>

            {/* Title and Description */}
            <div className="text-white mb-6">
              <h3 
                className="text-xl mb-3 leading-tight"
                style={{ 
                  fontFamily: 'Times New Roman, serif',
                  fontWeight: 300,
                  letterSpacing: '0.05em'
                }}
              >
                {concept.emoji && <span className="mr-3">{concept.emoji}</span>}
                {concept.title}
              </h3>

              <p 
                className="text-white/90 leading-relaxed text-sm"
                style={{ fontWeight: 300, lineHeight: 1.6 }}
              >
                {concept.description}
              </p>
            </div>
          </div>

          {/* Generated Images Gallery */}
          {concept.generatedImages && concept.generatedImages.length > 0 && (
            <div className="mb-6">
              <div className="grid grid-cols-4 gap-2">
                {concept.generatedImages.slice(0, 4).map((img, idx) => (
                  <img 
                    key={idx}
                    src={img}
                    alt={`Generated ${idx + 1}`}
                    className="w-full h-16 object-cover rounded cursor-pointer hover:opacity-80 transition-opacity border border-white/20"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleImageClick(img);
                    }}
                  />
                ))}
              </div>
              {concept.generatedImages.length > 4 && (
                <p 
                  className="text-xs text-white/70 mt-2"
                  style={{ fontWeight: 300 }}
                >
                  +{concept.generatedImages.length - 4} more photos
                </p>
              )}
            </div>
          )}

          {/* Loading State */}
          {concept.isGenerating && (
            <div className="mb-6">
              <div className="bg-white/10 backdrop-blur-sm p-4 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
                  </div>
                  <span 
                    className="text-white text-xs"
                    style={{ 
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                      fontWeight: 300
                    }}
                  >
                    Creating your photos...
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onGenerate?.();
              }}
              disabled={concept.isGenerating}
              className="flex-1 bg-white/90 backdrop-blur-sm text-gray-900 px-4 py-3 rounded-lg font-medium hover:bg-white transition-all duration-200 flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              <Camera className="w-4 h-4" />
              <span 
                className="text-sm"
                style={{ 
                  letterSpacing: '0.05em',
                  fontWeight: 400
                }}
              >
                {concept.isGenerating ? 'Creating...' : 'Generate Photos'}
              </span>
            </button>

            {(concept.generatedImages?.length > 0 || concept.type === 'portrait') && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onCreateVideo?.();
                }}
                className="bg-black/50 backdrop-blur-sm text-white px-4 py-3 rounded-lg hover:bg-black/70 transition-all duration-200 flex items-center space-x-2"
              >
                <Video className="w-4 h-4" />
                <span className="text-sm sr-only">Create Video</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Image Modal */}
      {imageModalOpen && selectedImage && (
        <div 
          className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4"
          onClick={() => setImageModalOpen(false)}
        >
          <div className="relative max-w-full max-h-full">
            <img 
              src={selectedImage}
              alt="Full size view"
              className="max-w-full max-h-full object-contain"
              onClick={(e) => e.stopPropagation()}
            />
            <button 
              onClick={() => setImageModalOpen(false)}
              className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center bg-black/50 backdrop-blur-sm hover:bg-black/70 text-white transition-colors rounded-full"
            >
              <span className="text-lg leading-none">×</span>
            </button>

            {/* Download Button */}
            <a
              href={selectedImage}
              download
              className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm text-gray-900 px-4 py-2 rounded-lg hover:bg-white transition-colors flex items-center space-x-2"
              onClick={(e) => e.stopPropagation()}
            >
              <Download className="w-4 h-4" />
              <span className="text-sm font-medium">Download</span>
            </a>
          </div>
        </div>
      )}
    </>
  );
};

interface CanvasPanelProps {
  mode: 'photo' | 'story';
  conceptCards?: ConceptCard[];
  selectedConceptId?: string | null;
  onConceptSelect?: (id: string) => void;
  onConceptGenerate?: (concept: ConceptCard) => void;
  className?: string;
  children?: React.ReactNode;
}

export const CanvasPanel: React.FC<CanvasPanelProps> = ({
  mode,
  conceptCards = [],
  selectedConceptId,
  onConceptSelect,
  onConceptGenerate,
  className = '',
  children
}) => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

  // Responsive monitoring
  React.useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleCreateVideo = (concept: ConceptCard) => {
    // This would trigger the handoff to Story Studio
    // Implementation depends on parent component's state management
    console.log('Create video for concept:', concept.title);
  };

  return (
    <div className={`flex flex-col h-full ${className}`}>
      <div className="flex-1 overflow-y-auto p-6">

        {/* Empty State */}
        {conceptCards.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div 
              className="w-32 h-32 rounded-xl mb-6 flex items-center justify-center"
              style={{
                backgroundImage: `linear-gradient(135deg, rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.3)), url(${FLATLAY_IMAGES[0]})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}
            >
              <div className="text-white text-center">
                <Sparkles className="w-8 h-8 mx-auto mb-2 opacity-80" />
                <h3 
                  className="text-lg font-light"
                  style={{ 
                    fontFamily: 'Times New Roman, serif',
                    letterSpacing: '0.1em'
                  }}
                >
                  Ready to Create
                </h3>
              </div>
            </div>
            <p 
              className="text-gray-600 max-w-md leading-relaxed"
              style={{ fontWeight: 300 }}
            >
              Start a conversation with Maya to see beautiful concept cards appear here. 
              Each card becomes a gateway to professional photos tailored to your brand.
            </p>
            {children}
          </div>
        ) : (
          /* Concept Cards Grid */
          <div className="space-y-8">
            <div className="text-center mb-8">
              <h2 
                className="text-2xl mb-2"
                style={{ 
                  fontFamily: 'Times New Roman, serif',
                  fontWeight: 300,
                  letterSpacing: '0.1em'
                }}
              >
                Your Creative Concepts
              </h2>
              <p 
                className="text-gray-600"
                style={{ fontWeight: 300 }}
              >
                Maya's curated photo concepts, ready to bring your vision to life
              </p>
            </div>

            <div className={`grid gap-6 ${
              isMobile 
                ? 'grid-cols-1' 
                : 'grid-cols-1 lg:grid-cols-2 xl:grid-cols-2'
            }`}>
              {conceptCards.map((concept) => (
                <LuxuryConceptCard
                  key={concept.id}
                  concept={concept}
                  isSelected={selectedConceptId === concept.id}
                  onClick={() => onConceptSelect?.(concept.id)}
                  onGenerate={() => onConceptGenerate?.(concept)}
                  onCreateVideo={() => handleCreateVideo(concept)}
                />
              ))}
            </div>

            {children}
          </div>
        )}
      </div>
    </div>
  );
};
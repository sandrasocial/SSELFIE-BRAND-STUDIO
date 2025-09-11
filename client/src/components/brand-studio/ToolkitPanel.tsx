import React, { useState } from 'react';
import { Camera, Video, Heart, Download, Sparkles, ArrowRight, RefreshCw, FolderOpen } from 'lucide-react';

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

interface ToolkitPanelProps {
  mode: 'photo' | 'story';
  selectedItem?: ConceptCard | any;
  onItemAction?: (action: string, data?: any) => void;
  className?: string;
  children?: React.ReactNode;
}

export const ToolkitPanel: React.FC<ToolkitPanelProps> = ({
  mode,
  selectedItem,
  onItemAction,
  className = '',
  children
}) => {
  const [activeGalleryTab, setActiveGalleryTab] = useState<'recent' | 'favorites'>('recent');

  const handleAction = (action: string, data?: any) => {
    onItemAction?.(action, data);
  };

  // Mock gallery data - replace with real data
  const recentImages = [
    'https://picsum.photos/100/120?random=1',
    'https://picsum.photos/100/120?random=2',
    'https://picsum.photos/100/120?random=3',
    'https://picsum.photos/100/120?random=4'
  ];

  const renderPhotoActions = () => {
    if (!selectedItem) {
      return (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-6 h-6 text-gray-400" />
          </div>
          <h4 
            className="text-sm mb-2"
            style={{ 
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              fontWeight: 300,
              fontFamily: 'Times New Roman, serif'
            }}
          >
            No Concept Selected
          </h4>
          <p 
            className="text-gray-500 text-sm leading-relaxed"
            style={{ fontWeight: 300 }}
          >
            Select a concept card from your canvas to see available actions and begin creating.
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-6">

        {/* Selected Concept Details */}
        <div className="border-b border-gray-200 pb-6">
          <div className="flex items-start space-x-3 mb-4">
            {selectedItem.emoji && (
              <span className="text-2xl">{selectedItem.emoji}</span>
            )}
            <div className="flex-1">
              <h4 
                className="text-base mb-2"
                style={{ 
                  fontFamily: 'Times New Roman, serif',
                  fontWeight: 300,
                  letterSpacing: '0.05em'
                }}
              >
                {selectedItem.title}
              </h4>
              {selectedItem.creativeLook && (
                <span 
                  className="inline-block bg-gray-100 px-2 py-1 rounded text-xs text-gray-600 mb-3"
                  style={{ 
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    fontWeight: 300
                  }}
                >
                  {selectedItem.creativeLook}
                </span>
              )}
            </div>
          </div>
          <p 
            className="text-gray-600 text-sm leading-relaxed"
            style={{ fontWeight: 300 }}
          >
            {selectedItem.description}
          </p>
        </div>

        {/* Primary Actions */}
        <div className="space-y-3">
          <h5 
            className="text-xs text-gray-500 mb-4"
            style={{ 
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              fontWeight: 300
            }}
          >
            Create & Generate
          </h5>

          <button
            onClick={() => handleAction('generate')}
            disabled={selectedItem.isGenerating}
            className="w-full bg-black text-white px-4 py-3 rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            <Camera className="w-4 h-4" />
            <span 
              className="text-sm"
              style={{ 
                letterSpacing: '0.1em',
                fontWeight: 400
              }}
            >
              {selectedItem.isGenerating ? 'Creating Photos...' : 'Generate Photos'}
            </span>
          </button>

          {selectedItem.generatedImages?.length > 0 && (
            <>
              <button
                onClick={() => handleAction('variations')}
                className="w-full bg-gray-100 text-gray-800 px-4 py-3 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center space-x-2"
              >
                <RefreshCw className="w-4 h-4" />
                <span 
                  className="text-sm"
                  style={{ 
                    letterSpacing: '0.1em',
                    fontWeight: 400
                  }}
                >
                  Generate Variations
                </span>
              </button>

              <button
                onClick={() => handleAction('create-video')}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-3 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-colors flex items-center justify-center space-x-2"
              >
                <Video className="w-4 h-4" />
                <span 
                  className="text-sm"
                  style={{ 
                    letterSpacing: '0.1em',
                    fontWeight: 400
                  }}
                >
                  Create Video Story
                </span>
              </button>
            </>
          )}
        </div>

        {/* Gallery Actions */}
        {selectedItem.generatedImages?.length > 0 && (
          <div className="space-y-3 pt-6 border-t border-gray-200">
            <h5 
              className="text-xs text-gray-500 mb-4"
              style={{ 
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                fontWeight: 300
              }}
            >
              Save & Organize
            </h5>

            <button
              onClick={() => handleAction('save-gallery')}
              className="w-full bg-gray-100 text-gray-800 px-4 py-3 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center space-x-2"
            >
              <Heart className="w-4 h-4" />
              <span 
                className="text-sm"
                style={{ 
                  letterSpacing: '0.1em',
                  fontWeight: 400
                }}
              >
                Save to Gallery
              </span>
            </button>

            <button
              onClick={() => handleAction('download-all')}
              className="w-full bg-gray-100 text-gray-800 px-4 py-3 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center space-x-2"
            >
              <Download className="w-4 h-4" />
              <span 
                className="text-sm"
                style={{ 
                  letterSpacing: '0.1em',
                  fontWeight: 400
                }}
              >
                Download All
              </span>
            </button>
          </div>
        )}

        {/* Generated Images Preview */}
        {selectedItem.generatedImages?.length > 0 && (
          <div className="pt-6 border-t border-gray-200">
            <h5 
              className="text-xs text-gray-500 mb-4"
              style={{ 
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                fontWeight: 300
              }}
            >
              Generated Photos ({selectedItem.generatedImages.length})
            </h5>
            <div className="grid grid-cols-2 gap-2">
              {selectedItem.generatedImages.slice(0, 4).map((img: string, idx: number) => (
                <img 
                  key={idx}
                  src={img}
                  alt={`Generated ${idx + 1}`}
                  className="w-full h-20 object-cover rounded cursor-pointer hover:opacity-80 transition-opacity border border-gray-200"
                />
              ))}
            </div>
            {selectedItem.generatedImages.length > 4 && (
              <p 
                className="text-xs text-gray-500 mt-2 text-center"
                style={{ fontWeight: 300 }}
              >
                +{selectedItem.generatedImages.length - 4} more photos
              </p>
            )}
          </div>
        )}

        {/* Loading State */}
        {selectedItem.isGenerating && (
          <div className="pt-6 border-t border-gray-200">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="flex space-x-2">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
                </div>
                <span 
                  className="text-xs text-gray-600"
                  style={{ 
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    fontWeight: 300
                  }}
                >
                  Creating your professional photos...
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderStoryActions = () => {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Video className="w-6 h-6 text-gray-400" />
          </div>
          <h4 
            className="text-sm mb-2"
            style={{ 
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              fontWeight: 300,
              fontFamily: 'Times New Roman, serif'
            }}
          >
            Video Creation Tools
          </h4>
          <p 
            className="text-gray-500 text-sm leading-relaxed mb-6"
            style={{ fontWeight: 300 }}
          >
            Configure your video settings and start creating compelling stories.
          </p>
        </div>

        <div className="space-y-4">
          <h5 
            className="text-xs text-gray-500 mb-4"
            style={{ 
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              fontWeight: 300
            }}
          >
            Video Format
          </h5>

          <div className="space-y-2">
            <button
              onClick={() => handleAction('format', '9:16')}
              className="w-full bg-gray-100 text-gray-800 px-4 py-3 rounded-lg hover:bg-gray-200 transition-colors text-left"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div 
                    className="font-medium text-sm"
                    style={{ letterSpacing: '0.05em' }}
                  >
                    Social Media (Portrait)
                  </div>
                  <div 
                    className="text-xs text-gray-500"
                    style={{ fontWeight: 300 }}
                  >
                    Perfect for Instagram, TikTok, Stories
                  </div>
                </div>
                <div className="text-xs text-gray-400">9:16</div>
              </div>
            </button>

            <button
              onClick={() => handleAction('format', '16:9')}
              className="w-full bg-gray-100 text-gray-800 px-4 py-3 rounded-lg hover:bg-gray-200 transition-colors text-left"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div 
                    className="font-medium text-sm"
                    style={{ letterSpacing: '0.05em' }}
                  >
                    Website (Landscape)
                  </div>
                  <div 
                    className="text-xs text-gray-500"
                    style={{ fontWeight: 300 }}
                  >
                    Great for YouTube, websites, presentations
                  </div>
                </div>
                <div className="text-xs text-gray-400">16:9</div>
              </div>
            </button>
          </div>

          <div className="pt-4 border-t border-gray-200">
            <button
              onClick={() => handleAction('generate-story')}
              className="w-full bg-black text-white px-4 py-3 rounded-lg hover:bg-gray-800 transition-colors flex items-center justify-center space-x-2"
            >
              <Video className="w-4 h-4" />
              <span 
                className="text-sm"
                style={{ 
                  letterSpacing: '0.1em',
                  fontWeight: 400
                }}
              >
                Bring My Story to Life
              </span>
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={`flex flex-col h-full ${className}`}>
      <div className="flex-1 overflow-y-auto">

        {/* Content Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <div className="flex">
            <button
              onClick={() => setActiveGalleryTab('recent')}
              className={`px-4 py-3 text-xs transition-colors ${
                activeGalleryTab === 'recent'
                  ? 'border-b-2 border-black text-black'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              style={{ 
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                fontWeight: 300
              }}
            >
              Actions
            </button>
            <button
              onClick={() => setActiveGalleryTab('favorites')}
              className={`px-4 py-3 text-xs transition-colors ${
                activeGalleryTab === 'favorites'
                  ? 'border-b-2 border-black text-black'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              style={{ 
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                fontWeight: 300
              }}
            >
              Gallery
            </button>
          </div>
        </div>

        <div className="px-6">
          {activeGalleryTab === 'recent' ? (
            mode === 'photo' ? renderPhotoActions() : renderStoryActions()
          ) : (
            /* Gallery Tab */
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FolderOpen className="w-6 h-6 text-gray-400" />
                </div>
                <h4 
                  className="text-sm mb-2"
                  style={{ 
                    letterSpacing: '0.2em',
                    textTransform: 'uppercase',
                    fontWeight: 300,
                    fontFamily: 'Times New Roman, serif'
                  }}
                >
                  Your Gallery
                </h4>
                <p 
                  className="text-gray-500 text-sm leading-relaxed mb-6"
                  style={{ fontWeight: 300 }}
                >
                  Your most recent professional photos and videos, safely stored and ready to use.
                </p>
              </div>

              {/* Recent Images Grid */}
              <div>
                <h5 
                  className="text-xs text-gray-500 mb-3"
                  style={{ 
                    letterSpacing: '0.2em',
                    textTransform: 'uppercase',
                    fontWeight: 300
                  }}
                >
                  Recent Photos
                </h5>
                <div className="grid grid-cols-2 gap-2">
                  {recentImages.map((img, idx) => (
                    <img 
                      key={idx}
                      src={img}
                      alt={`Recent ${idx + 1}`}
                      className="w-full h-20 object-cover rounded cursor-pointer hover:opacity-80 transition-opacity border border-gray-200"
                    />
                  ))}
                </div>
              </div>

              <button
                onClick={() => handleAction('view-full-gallery')}
                className="w-full bg-gray-100 text-gray-800 px-4 py-3 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center space-x-2"
              >
                <ArrowRight className="w-4 h-4" />
                <span 
                  className="text-sm"
                  style={{ 
                    letterSpacing: '0.1em',
                    fontWeight: 400
                  }}
                >
                  View Full Gallery
                </span>
              </button>
            </div>
          )}
        </div>

        {children}
      </div>
    </div>
  );
};
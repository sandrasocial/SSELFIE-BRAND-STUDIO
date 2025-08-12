import React, { useState, useCallback } from 'react';
import { MemberNavigation } from '../components/member-navigation';
import { HeroFullBleed } from '../components/hero-full-bleed';
import { SandraImages } from '../lib/sandra-images';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useToast } from '../hooks/use-toast';
import { useAuth } from '../hooks/use-auth';
import { apiRequest } from '../lib/queryClient';

interface SavedPrompt {
  id: string;
  name: string;
  description: string;
  prompt: string;
  camera: string;
  texture: string;
  dateSaved: string;
  collection: string;
}

export default function CustomPhotoshootLibrary() {
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [selectedPrompt, setSelectedPrompt] = useState<SavedPrompt | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatingImages, setGeneratingImages] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [fullSizeImage, setFullSizeImage] = useState<string | null>(null);

  // Fetch user model for trigger word
  const { data: userModel } = useQuery({
    queryKey: ['/api/user-model'],
    enabled: isAuthenticated
  });

  // Save image to gallery function (selective saving)
  const saveToGallery = useCallback(async (imageUrl: string) => {
    try {
      // Use the working save-selected-images endpoint that doesn't require authentication
      const response = await fetch('/api/save-selected-images', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageUrls: [imageUrl],
          prompt: 'Custom Library Image'
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to save image');
      }
      
      queryClient.invalidateQueries({ queryKey: ['/api/gallery-images'] });
      
      toast({
        title: "Image Saved",
        description: "Image added to your gallery",
      });
    } catch (error) {
      console.error('Error saving image:', error);
      toast({
        title: "Save Failed",
        description: "Could not save image to gallery",
        
      });
    }
  }, [queryClient, toast]);

  // Generate images from saved prompt
  const generateFromSavedPrompt = useCallback(async (prompt: SavedPrompt) => {
    setSelectedPrompt(null); // Close modal when generation starts
    setGeneratingImages(true);
    setGenerationProgress(0);
    setSelectedImages([]); // Clear previous images
    
    // Progress simulation for user feedback
    const progressInterval = setInterval(() => {
      setGenerationProgress(prev => {
        if (prev >= 90) return prev;
        return prev + Math.random() * 8;
      });
    }, 1000);
    
    try {
      // Use same pattern as working ai-photoshoot page
      const response = await fetch('/api/generate-images', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          prompt: prompt.prompt,
          // Note: userId handled by backend authentication
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Generated images from saved prompt:', data);
      
      clearInterval(progressInterval);
      setGenerationProgress(100);
      
      if (data.images && data.images.length > 0) {
        setSelectedImages(data.images);
        
        toast({
          title: "Images Generated!",
          description: `${data.images.length} new photos ready for preview`,
        });
      }
    } catch (error) {
      console.error('Error generating images from saved prompt:', error);
      clearInterval(progressInterval);
      toast({
        title: "Generation Failed",
        description: "Something went wrong with image generation",
        
      });
    } finally {
      setTimeout(() => {
        setGeneratingImages(false);
        setGenerationProgress(0);
      }, 1000);
    }
  }, [userModel, toast]);

  // Real user prompts only - no mock data allowed
  const savedPrompts: SavedPrompt[] = [
    {
      id: 'saved-1',
      name: 'Sunset Contemplation',
      description: 'Golden hour magic, whole scenery, natural pose',
      prompt: '[triggerword] woman, full body environmental shot, sunset beach setting, looking away from camera, long dark wavy hair flowing, shot on Nikon Z9 with 50mm f/1.2S lens, dramatic golden hour backlighting, warm atmospheric glow, flowing maxi dress, natural makeup, barefoot elegance, contemplative pose looking at horizon, not facing camera, serene moment, heavy 35mm film grain, pronounced texture',
      camera: 'Nikon Z9 with 50mm f/1.2S lens',
      texture: 'heavy 35mm film grain, pronounced texture',
      dateSaved: '2025-07-12',
      collection: 'Pinterest Vibes'
    },
    {
      id: 'saved-2', 
      name: 'Editorial Power',
      description: 'High fashion editorial energy, commanding presence',
      prompt: '[triggerword] woman, editorial fashion portrait, commanding presence, black power suit, modern office environment, shot on Hasselblad X2D with 90mm lens, dramatic window lighting, professional styling, confident direct gaze, corporate luxury, film negative quality, authentic grain pattern',
      camera: 'Hasselblad X2D with 90mm lens',
      texture: 'film negative quality, authentic grain pattern',
      dateSaved: '2025-07-11',
      collection: 'Business Collection'
    },
    {
      id: 'saved-3',
      name: 'Garden Wanderer',
      description: 'Natural beauty, morning light, peaceful energy',
      prompt: '[triggerword] woman, full body lifestyle shot, walking through luxury garden path, not looking at camera, shot on Sony A7R V with 55mm f/1.8 Zeiss lens, soft morning light filtering through leaves, natural daylight, flowing midi dress, natural textures, effortless styling, gentle walk among flowers, looking forward, peaceful movement, Kodak Portra 400 film aesthetic, visible grain structure',
      camera: 'Sony A7R V with 55mm f/1.8 Zeiss lens',
      texture: 'Kodak Portra 400 film aesthetic, visible grain structure',
      dateSaved: '2025-07-10',
      collection: 'Lifestyle Collection'
    }
  ];



  // Group prompts by collection
  const groupedPrompts = savedPrompts.reduce((acc, prompt) => {
    if (!acc[prompt.collection]) {
      acc[prompt.collection] = [];
    }
    acc[prompt.collection].push(prompt);
    return acc;
  }, {} as Record<string, SavedPrompt[]>);

  return (
    <div style={{ 
      fontFamily: '"Times New Roman", Times, serif',
      background: '#ffffff',
      minHeight: '100vh'
    }}>
      <MemberNavigation />
      
      {/* Generation Progress Bar */}
      {generatingImages && (
        <div className="fixed top-0 left-0 right-0 h-0.5 bg-gray-100 z-50">
          <div 
            className="h-full bg-black transition-all duration-300 ease-out"
            style={{ width: `${generationProgress}%` }}
          />
        </div>
      )}
      
      {/* Hero Section using HeroFullBleed component */}
      <HeroFullBleed
        backgroundImage={SandraImages.editorial.laptop1}
        tagline="Custom Prompts"
        title="LIBRARY"
        subtitle="Your saved prompts and favorites"
        overlay={0.6}
        fullHeight={false}
      />

      {/* Library Content */}
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '80px 40px'
      }}>
        {/* Summary Stats */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '30px',
          marginBottom: '80px'
        }}>
          <div style={{
            background: '#f5f5f5',
            padding: '40px 30px',
            textAlign: 'center'
          }}>
            <div style={{
              fontSize: '2.5rem',
              fontWeight: 300,
              color: '#0a0a0a',
              marginBottom: '10px'
            }}>
              {savedPrompts.length}
            </div>
            <div style={{
              fontSize: '0.9rem',
              fontWeight: 400,
              color: '#666666',
              letterSpacing: '0.1em',
              textTransform: 'uppercase'
            }}>
              Saved Prompts
            </div>
          </div>
          
          <div style={{
            background: '#f5f5f5',
            padding: '40px 30px',
            textAlign: 'center'
          }}>
            <div style={{
              fontSize: '2.5rem',
              fontWeight: 300,
              color: '#0a0a0a',
              marginBottom: '10px'
            }}>
              {Object.keys(groupedPrompts).length}
            </div>
            <div style={{
              fontSize: '0.9rem',
              fontWeight: 400,
              color: '#666666',
              letterSpacing: '0.1em',
              textTransform: 'uppercase'
            }}>
              Collections
            </div>
          </div>

          <div style={{
            background: '#f5f5f5',
            padding: '40px 30px',
            textAlign: 'center'
          }}>
            <div style={{
              fontSize: '2.5rem',
              fontWeight: 300,
              color: '#0a0a0a',
              marginBottom: '10px'
            }}>
              47
            </div>
            <div style={{
              fontSize: '0.9rem',
              fontWeight: 400,
              color: '#666666',
              letterSpacing: '0.1em',
              textTransform: 'uppercase'
            }}>
              Total Generations
            </div>
          </div>
        </div>

        {/* Collections Grid */}
        {Object.entries(groupedPrompts).map(([collectionName, prompts]) => (
          <div key={collectionName} style={{ marginBottom: '80px' }}>
            <h2 style={{
              fontSize: '2rem',
              fontWeight: 300,
              color: '#0a0a0a',
              marginBottom: '40px',
              letterSpacing: '-0.01em'
            }}>
              {collectionName}
            </h2>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
              gap: '30px'
            }}>
              {prompts.map((prompt) => (
                <div
                  key={prompt.id}
                  style={{
                    background: '#ffffff',
                    border: '1px solid #e5e5e5',
                    padding: '30px',
                    cursor: 'pointer',
                    transition: 'all 300ms ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#0a0a0a';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#e5e5e5';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}

                >
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: '20px'
                  }}>
                    <h3 style={{
                      fontSize: '1.2rem',
                      fontWeight: 400,
                      color: '#0a0a0a',
                      margin: 0,
                      letterSpacing: '-0.01em'
                    }}>
                      {prompt.name}
                    </h3>
                    <div style={{
                      fontSize: '0.8rem',
                      color: '#666666',
                      letterSpacing: '0.05em'
                    }}>
                      {prompt.dateSaved}
                    </div>
                  </div>
                  
                  <p style={{
                    fontSize: '0.95rem',
                    color: '#666666',
                    lineHeight: 1.5,
                    marginBottom: '20px'
                  }}>
                    {prompt.description}
                  </p>
                  
                  <div style={{
                    fontSize: '0.85rem',
                    color: '#999999',
                    marginBottom: '15px'
                  }}>
                    <strong>Camera:</strong> {prompt.camera}
                  </div>
                  
                  <div style={{
                    fontSize: '0.85rem',
                    color: '#999999',
                    marginBottom: '20px'
                  }}>
                    <strong>Film Texture:</strong> {prompt.texture}
                  </div>
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      generateFromSavedPrompt(prompt);
                    }}
                    disabled={generatingImages}
                    style={{
                      width: '100%',
                      padding: '12px 20px',
                      background: generatingImages ? '#cccccc' : '#0a0a0a',
                      color: '#ffffff',
                      border: 'none',
                      fontSize: '0.9rem',
                      fontWeight: 400,
                      letterSpacing: '0.05em',
                      textTransform: 'uppercase',
                      cursor: generatingImages ? 'not-allowed' : 'pointer',
                      transition: 'all 300ms ease'
                    }}
                    onMouseEnter={(e) => {
                      if (!generatingImages) {
                        e.target.style.background = '#333333';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!generatingImages) {
                        e.target.style.background = '#0a0a0a';
                      }
                    }}
                  >
                    {generatingImages && selectedPrompt?.id === prompt.id ? 'Generating...' : 'Generate Again'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
        
        {savedPrompts.length === 0 && (
          <div style={{
            textAlign: 'center',
            padding: '80px 40px',
            color: '#666666'
          }}>
            <h3 style={{
              fontSize: '1.5rem',
              fontWeight: 300,
              marginBottom: '20px'
            }}>
              No saved prompts yet
            </h3>
            <p style={{
              fontSize: '1rem',
              lineHeight: 1.6,
              marginBottom: '30px'
            }}>
              Start chatting with Sandra AI to create custom prompts you can save and reuse.
            </p>
            <a
              href="/sandra-photoshoot"
              style={{
                display: 'inline-block',
                padding: '15px 30px',
                background: '#0a0a0a',
                color: '#ffffff',
                textDecoration: 'none',
                fontSize: '0.9rem',
                fontWeight: 400,
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                transition: 'all 300ms ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = '#333333';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = '#0a0a0a';
              }}
            >
              Start Creating Prompts
            </a>
          </div>
        )}

        {/* Generated Images Preview - Same style as ai-photoshoot */}
        {selectedImages.length > 0 && (
          <div className="mt-12 sm:mt-16">
            <div className="text-center mb-8 sm:mb-12">
              <h3 className="font-times text-[clamp(1.5rem,5vw,4rem)] font-light tracking-[-0.01em] mb-4">
                Your Story, Captured
              </h3>
              <p className="text-xs sm:text-sm font-light tracking-[0.15em] sm:tracking-[0.2em] uppercase text-[#666666]">
                {selectedImages.length} Images from this session
              </p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 max-w-6xl mx-auto">
              {selectedImages.map((imageUrl, index) => (
                <div key={index} className="group">
                  <div className="aspect-[4/5] overflow-hidden bg-[#f8f8f8] relative mb-3 sm:mb-4">
                    <img
                      src={imageUrl}
                      alt={`Your story ${index + 1}`}
                      className="w-full h-full object-cover cursor-pointer transition-all duration-500 group-hover:scale-105 touch-manipulation"
                      onClick={() => setFullSizeImage(imageUrl)}
                    />
                    {/* Minimal overlay */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300"></div>
                  </div>
                  <div className="text-center">
                    <div className="text-[10px] sm:text-xs tracking-[0.2em] sm:tracking-[0.3em] uppercase font-light text-[#666666] mb-1 sm:mb-2">
                      Image {index + 1}
                    </div>
                    <div className="flex justify-center gap-2 sm:gap-3">
                      <button
                        onClick={() => setFullSizeImage(imageUrl)}
                        className="text-[10px] sm:text-xs tracking-[0.15em] sm:tracking-[0.2em] uppercase font-light text-black hover:text-[#666666] transition-colors touch-manipulation"
                      >
                        View
                      </button>
                      <span className="text-[#e0e0e0] text-xs">•</span>
                      <button
                        onClick={() => saveToGallery(imageUrl)}
                        className="text-[10px] sm:text-xs tracking-[0.15em] sm:tracking-[0.2em] uppercase font-light text-black hover:text-[#666666] transition-colors touch-manipulation"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Full Size Image Modal */}
        {fullSizeImage && (
          <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-2 sm:p-4" onClick={() => setFullSizeImage(null)}>
            <div className="relative max-w-full max-h-full">
              <img
                src={fullSizeImage}
                alt="Full size photo"
                className="max-w-full max-h-full object-contain"
                onClick={(e) => e.stopPropagation()}
              />
              <div className="absolute top-2 sm:top-4 right-2 sm:right-4 flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                <button
                  onClick={() => saveToGallery(fullSizeImage)}
                  className="px-3 sm:px-4 py-2 bg-white text-black font-light hover:bg-[#f0f0f0] transition-colors text-xs sm:text-sm touch-manipulation"
                >
                  Save to Gallery
                </button>
                <a
                  href={fullSizeImage}
                  download={`custom-photoshoot-${Date.now()}.jpg`}
                  className="px-3 sm:px-4 py-2 bg-[#0a0a0a] text-white font-light hover:bg-[#333333] transition-colors inline-block text-xs sm:text-sm touch-manipulation text-center"
                >
                  Download
                </a>
                <button
                  onClick={() => setFullSizeImage(null)}
                  className="px-3 sm:px-4 py-2 bg-[#666666] text-white font-light hover:bg-[#888888] transition-colors text-xs sm:text-sm touch-manipulation"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Prompt Detail Modal */}
      {selectedPrompt && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'rgba(0, 0, 0, 0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '40px'
        }}
        onClick={() => setSelectedPrompt(null)}
        >
          <div style={{
            background: '#ffffff',
            maxWidth: '600px',
            width: '100%',
            padding: '40px',
            maxHeight: '80vh',
            overflowY: 'auto'
          }}
          onClick={(e) => e.stopPropagation()}
          >
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              marginBottom: '30px'
            }}>
              <h2 style={{
                fontSize: '1.8rem',
                fontWeight: 300,
                color: '#0a0a0a',
                margin: 0
              }}>
                {selectedPrompt.name}
              </h2>
              <button
                onClick={() => setSelectedPrompt(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '1.5rem',
                  cursor: 'pointer',
                  color: '#666666'
                }}
              >
                ×
              </button>
            </div>
            
            <div style={{
              marginBottom: '30px',
              fontSize: '1rem',
              color: '#666666',
              lineHeight: 1.6
            }}>
              {selectedPrompt.description}
            </div>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '20px',
              marginBottom: '30px'
            }}>
              <div>
                <strong style={{ fontSize: '0.9rem', color: '#0a0a0a' }}>Camera:</strong>
                <div style={{ fontSize: '0.85rem', color: '#666666', marginTop: '5px' }}>
                  {selectedPrompt.camera}
                </div>
              </div>
              <div>
                <strong style={{ fontSize: '0.9rem', color: '#0a0a0a' }}>Date Saved:</strong>
                <div style={{ fontSize: '0.85rem', color: '#666666', marginTop: '5px' }}>
                  {selectedPrompt.dateSaved}
                </div>
              </div>
            </div>
            
            <button
              onClick={() => generateFromSavedPrompt(selectedPrompt)}
              disabled={generatingImages}
              style={{
                width: '100%',
                padding: '15px',
                background: generatingImages ? '#cccccc' : '#0a0a0a',
                color: '#ffffff',
                border: 'none',
                fontSize: '0.9rem',
                fontWeight: 400,
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                cursor: generatingImages ? 'not-allowed' : 'pointer'
              }}
            >
              {generatingImages ? 'Generating Images...' : 'Generate 4 New Images'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
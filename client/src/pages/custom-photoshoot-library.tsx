import React, { useState } from 'react';
import { Navigation } from '@/components/navigation';
import { HeroFullBleed } from '@/components/hero-full-bleed';
import { SandraImages } from '@/lib/sandra-images';
import { useQuery } from '@tanstack/react-query';

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
  const [selectedPrompt, setSelectedPrompt] = useState<SavedPrompt | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Mock data for saved prompts - this will be replaced with real data
  const savedPrompts: SavedPrompt[] = [
    {
      id: 'saved-1',
      name: 'Sunset Contemplation',
      description: 'Golden hour magic, whole scenery, natural pose',
      prompt: 'usersandra_test_user_2025 woman, full body environmental shot, sunset beach setting, looking away from camera, long dark wavy hair flowing, shot on Nikon Z9 with 50mm f/1.2S lens, dramatic golden hour backlighting, warm atmospheric glow, flowing maxi dress, natural makeup, barefoot elegance, contemplative pose looking at horizon, not facing camera, serene moment, heavy 35mm film grain, pronounced texture',
      camera: 'Nikon Z9 with 50mm f/1.2S lens',
      texture: 'heavy 35mm film grain, pronounced texture',
      dateSaved: '2025-07-12',
      collection: 'Pinterest Vibes'
    },
    {
      id: 'saved-2', 
      name: 'Editorial Power',
      description: 'High fashion editorial energy, commanding presence',
      prompt: 'usersandra_test_user_2025 woman, editorial fashion portrait, commanding presence, black power suit, modern office environment, shot on Hasselblad X2D with 90mm lens, dramatic window lighting, professional styling, confident direct gaze, corporate luxury, film negative quality, authentic grain pattern',
      camera: 'Hasselblad X2D with 90mm lens',
      texture: 'film negative quality, authentic grain pattern',
      dateSaved: '2025-07-11',
      collection: 'Business Collection'
    },
    {
      id: 'saved-3',
      name: 'Garden Wanderer',
      description: 'Natural beauty, morning light, peaceful energy',
      prompt: 'usersandra_test_user_2025 woman, full body lifestyle shot, walking through luxury garden path, not looking at camera, shot on Sony A7R V with 55mm f/1.8 Zeiss lens, soft morning light filtering through leaves, natural daylight, flowing midi dress, natural textures, effortless styling, gentle walk among flowers, looking forward, peaceful movement, Kodak Portra 400 film aesthetic, visible grain structure',
      camera: 'Sony A7R V with 55mm f/1.8 Zeiss lens',
      texture: 'Kodak Portra 400 film aesthetic, visible grain structure',
      dateSaved: '2025-07-10',
      collection: 'Lifestyle Collection'
    }
  ];

  const generateFromPrompt = async (prompt: SavedPrompt) => {
    setIsGenerating(true);
    try {
      const response = await fetch('/api/generate-images', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: prompt.prompt,
          numImages: 4
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Generated images from saved prompt:', data);
      
      // Redirect to gallery to view new images
      window.location.href = '/sselfie-gallery';
      
    } catch (error) {
      console.error('Error generating from prompt:', error);
    } finally {
      setIsGenerating(false);
    }
  };

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
      <Navigation />
      
      {/* Hero Section using HeroFullBleed component */}
      <HeroFullBleed
        backgroundImage={SandraImages.editorial.laptop1}
        tagline="Your Personal Archive"
        title={
          <>
            YOUR CUSTOM<br />
            PHOTOSHOOT LIBRARY
          </>
        }
        subtitle="All your saved prompts in one place. Generate again, refine, or create new variations."
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
                  onClick={() => setSelectedPrompt(prompt)}
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
                      generateFromPrompt(prompt);
                    }}
                    disabled={isGenerating}
                    style={{
                      width: '100%',
                      padding: '12px 20px',
                      background: isGenerating ? '#cccccc' : '#0a0a0a',
                      color: '#ffffff',
                      border: 'none',
                      fontSize: '0.9rem',
                      fontWeight: 400,
                      letterSpacing: '0.05em',
                      textTransform: 'uppercase',
                      cursor: isGenerating ? 'not-allowed' : 'pointer',
                      transition: 'all 300ms ease'
                    }}
                    onMouseEnter={(e) => {
                      if (!isGenerating) {
                        e.target.style.background = '#333333';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isGenerating) {
                        e.target.style.background = '#0a0a0a';
                      }
                    }}
                  >
                    {isGenerating ? 'Generating...' : 'Generate Again'}
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
              background: '#f5f5f5',
              padding: '20px',
              marginBottom: '30px',
              fontSize: '0.9rem',
              color: '#333333',
              lineHeight: 1.5,
              fontFamily: 'monospace'
            }}>
              {selectedPrompt.prompt}
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
              onClick={() => generateFromPrompt(selectedPrompt)}
              disabled={isGenerating}
              style={{
                width: '100%',
                padding: '15px',
                background: isGenerating ? '#cccccc' : '#0a0a0a',
                color: '#ffffff',
                border: 'none',
                fontSize: '0.9rem',
                fontWeight: 400,
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                cursor: isGenerating ? 'not-allowed' : 'pointer'
              }}
            >
              {isGenerating ? 'Generating Images...' : 'Generate 4 New Images'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
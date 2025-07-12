import React, { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Navigation } from '@/components/navigation';
import { PaymentVerification } from '@/components/payment-verification';
import { HeroFullBleed } from '@/components/hero-full-bleed';
import { SandraImages } from '@/lib/sandra-images';
import { apiRequest } from '@/lib/queryClient';

export default function SSELFIEGallery() {
  const { user, isAuthenticated } = useAuth();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const queryClient = useQueryClient();

  // Fetch user's AI images
  const { data: aiImages = [], isLoading } = useQuery({
    queryKey: ['/api/ai-images'],
    enabled: isAuthenticated
  });

  // Fetch user's favorites
  const { data: favoritesData } = useQuery({
    queryKey: ['/api/images/favorites'],
    enabled: isAuthenticated
  });

  const favorites = favoritesData?.favorites || [];

  // Toggle favorite mutation
  const toggleFavoriteMutation = useMutation({
    mutationFn: async (imageId: number) => {
      console.log('Making API request to toggle favorite for image:', imageId);
      const response = await apiRequest('POST', `/api/images/${imageId}/favorite`);
      console.log('Favorite toggle response:', response);
      return response;
    },
    onSuccess: (data) => {
      console.log('Favorite toggle success:', data);
      // Refresh favorites data
      queryClient.invalidateQueries({ queryKey: ['/api/images/favorites'] });
    },
    onError: (error) => {
      console.error('Favorite toggle error:', error);
    }
  });

  // Delete image mutation
  const deleteImageMutation = useMutation({
    mutationFn: async (imageId: number) => {
      return await apiRequest('DELETE', `/api/ai-images/${imageId}`);
    },
    onSuccess: () => {
      // Refresh AI images data
      queryClient.invalidateQueries({ queryKey: ['/api/ai-images'] });
      queryClient.invalidateQueries({ queryKey: ['/api/images/favorites'] });
    }
  });

  const downloadImage = async (imageUrl: string, filename: string) => {
    try {
      // Skip broken or invalid URLs
      if (!imageUrl || !imageUrl.startsWith('http')) {
        console.log('Skipping invalid URL:', imageUrl);
        return;
      }
      
      const response = await fetch(imageUrl);
      if (!response.ok) {
        console.log('Failed to download image:', response.status, imageUrl);
        return;
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading image:', error);
    }
  };

  const downloadAllImages = async () => {
    const imagesToDownload = showFavoritesOnly ? 
      aiImages.filter(img => favorites.includes(img.id)) : 
      aiImages;
      
    for (let i = 0; i < imagesToDownload.length; i++) {
      const image = imagesToDownload[i];
      await downloadImage(image.imageUrl, `sselfie-${i + 1}.jpg`);
      // Small delay between downloads
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  };

  // Migration to permanent storage
  const migrateMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest('POST', '/api/migrate-images-to-s3');
    },
    onSuccess: () => {
      // Refresh images after migration
      queryClient.invalidateQueries({ queryKey: ['/api/ai-images'] });
    }
  });

  const toggleFavorite = (imageId: number) => {
    console.log('Heart clicked for image:', imageId);
    console.log('Current favorites:', favorites);
    console.log('Is currently favorite:', favorites.includes(imageId));
    toggleFavoriteMutation.mutate(imageId);
  };

  const deleteImage = (imageId: number) => {
    if (confirm('Are you sure you want to delete this photo? This action cannot be undone.')) {
      deleteImageMutation.mutate(imageId);
    }
  };

  const filteredImages = showFavoritesOnly ? 
    aiImages.filter(img => favorites.includes(img.id)) : 
    aiImages;

  if (!isAuthenticated) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        background: '#ffffff',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        fontWeight: 300,
        color: '#0a0a0a'
      }}>
        <Navigation />
        <div style={{
          maxWidth: '1400px',
          margin: '0 auto',
          padding: '120px 40px',
          textAlign: 'center'
        }}>
          <h1 style={{
            fontFamily: 'Times New Roman, serif',
            fontSize: 'clamp(3rem, 6vw, 6rem)',
            fontWeight: 200,
            letterSpacing: '-0.01em',
            textTransform: 'uppercase',
            marginBottom: '24px',
            lineHeight: 1
          }}>
            Please Sign In
          </h1>
          <p style={{
            fontSize: '16px',
            lineHeight: 1.6,
            fontWeight: 300,
            maxWidth: '600px',
            margin: '0 auto 40px auto',
            color: '#666666'
          }}>
            You need to be signed in to access your SSELFIE Gallery.
          </p>
        </div>
      </div>
    );
  }

  return (
    <PaymentVerification>
      <div className="min-h-screen bg-white touch-manipulation" style={{ 
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        fontWeight: 300,
        color: '#0a0a0a'
      }}>
        <Navigation />
        
        {/* Full Bleed Hero Section */}
        <HeroFullBleed
          backgroundImage="https://i.postimg.cc/sgmtqFrQ/out-0-1.webp"
          title="SSELFIE GALLERY"
          subtitle="Your Professional Photo Library"
          tagline="This is where your mess becomes your message"
          alignment="center"
          overlay={0.4}
        />
        
        {/* Gallery Statistics & Controls Section */}
        <section style={{
          padding: '80px 0 60px 0',
          background: '#ffffff'
        }}>
          <div style={{
            maxWidth: '1400px',
            margin: '0 auto',
            padding: '0 6vw'
          }}>
            <div style={{
              textAlign: 'center',
              marginBottom: '60px'
            }}>
              <p style={{
                fontSize: '20px',
                lineHeight: 1.5,
                fontWeight: 300,
                maxWidth: '700px',
                margin: '0 auto 40px auto',
                color: '#666666'
              }}>
                Every photo here is you, just elevated. Download what serves your brand, delete what doesn't. 
                This is your professional arsenal ready for anything.
              </p>
            </div>
            
            {/* Gallery Stats - Centered Layout */}
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '80px',
              alignItems: 'center',
              marginBottom: '60px',
              flexWrap: 'wrap'
            }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  fontFamily: 'Times New Roman, serif',
                  fontSize: '64px',
                  fontWeight: 200,
                  lineHeight: 1,
                  marginBottom: '8px'
                }}>
                  {aiImages.length}
                </div>
                <div style={{
                  fontSize: '11px',
                  letterSpacing: '0.3em',
                  textTransform: 'uppercase',
                  color: '#666666'
                }}>
                  Professional Photos
                </div>
              </div>
              
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  fontFamily: 'Times New Roman, serif',
                  fontSize: '64px',
                  fontWeight: 200,
                  lineHeight: 1,
                  marginBottom: '8px'
                }}>
                  {favorites.length}
                </div>
                <div style={{
                  fontSize: '11px',
                  letterSpacing: '0.3em',
                  textTransform: 'uppercase',
                  color: '#666666'
                }}>
                  Favorites Saved
                </div>
              </div>
              
              {aiImages.length > 0 && (
                <button
                  onClick={downloadAllImages}
                  style={{
                    padding: '16px 32px',
                    fontSize: '11px',
                    fontWeight: 400,
                    letterSpacing: '0.3em',
                    textTransform: 'uppercase',
                    textDecoration: 'none',
                    border: '1px solid #0a0a0a',
                    color: '#0a0a0a',
                    background: 'transparent',
                    transition: 'all 300ms ease',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = '#0a0a0a';
                    e.target.style.color = '#ffffff';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = 'transparent';
                    e.target.style.color = '#0a0a0a';
                  }}
                >
                  Download All Photos
                </button>
              )}
              
              {aiImages.length > 0 && (
                <button
                  onClick={() => migrateMutation.mutate()}
                  disabled={migrateMutation.isPending}
                  style={{
                    padding: '16px 32px',
                    fontSize: '11px',
                    fontWeight: 400,
                    letterSpacing: '0.3em',
                    textTransform: 'uppercase',
                    textDecoration: 'none',
                    border: '1px solid #0a0a0a',
                    color: '#0a0a0a',
                    background: migrateMutation.isPending ? '#f5f5f5' : 'transparent',
                    transition: 'all 300ms ease',
                    cursor: migrateMutation.isPending ? 'not-allowed' : 'pointer',
                    opacity: migrateMutation.isPending ? 0.5 : 1
                  }}
                  onMouseEnter={(e) => {
                    if (!migrateMutation.isPending) {
                      e.target.style.background = '#0a0a0a';
                      e.target.style.color = '#ffffff';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!migrateMutation.isPending) {
                      e.target.style.background = 'transparent';
                      e.target.style.color = '#0a0a0a';
                    }
                  }}
                >
                  {migrateMutation.isPending ? 'Fixing Images...' : 'Fix Broken Images'}
                </button>
              )}
            </div>

            {/* Filter Controls - Centered */}
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '20px',
              alignItems: 'center',
              marginBottom: '60px',
              flexWrap: 'wrap'
            }}>
              <button
                onClick={() => setShowFavoritesOnly(false)}
                style={{
                  padding: '16px 32px',
                  fontSize: '11px',
                  fontWeight: 400,
                  letterSpacing: '0.3em',
                  textTransform: 'uppercase',
                  border: showFavoritesOnly ? '1px solid #cccccc' : '1px solid #0a0a0a',
                  color: showFavoritesOnly ? '#666666' : '#ffffff',
                  background: showFavoritesOnly ? 'transparent' : '#0a0a0a',
                  cursor: 'pointer',
                  transition: 'all 300ms ease'
                }}
              >
                All Photos ({aiImages.length})
              </button>
              
              <button
                onClick={() => setShowFavoritesOnly(true)}
                style={{
                  padding: '16px 32px',
                  fontSize: '11px',
                  fontWeight: 400,
                  letterSpacing: '0.3em',
                  textTransform: 'uppercase',
                  border: showFavoritesOnly ? '1px solid #0a0a0a' : '1px solid #cccccc',
                  color: showFavoritesOnly ? '#ffffff' : '#666666',
                  background: showFavoritesOnly ? '#0a0a0a' : 'transparent',
                  cursor: 'pointer',
                  transition: 'all 300ms ease'
                }}
              >
                ♥ Favorites ({favorites.length})
              </button>
            </div>
          </div>
        </section>

        {/* Gallery Grid Section */}
        {isLoading ? (
          <section style={{ padding: '80px 0', background: '#f5f5f5' }}>
            <div style={{
              maxWidth: '1400px',
              margin: '0 auto',
              padding: '0 6vw',
              textAlign: 'center'
            }}>
              <div style={{
                fontSize: '16px',
                color: '#666666',
                fontWeight: 300
              }}>
                Loading your gallery...
              </div>
            </div>
          </section>
        ) : aiImages.length === 0 ? (
          <section style={{ padding: '80px 0', background: '#f5f5f5' }}>
            <div style={{
              maxWidth: '1400px',
              margin: '0 auto',
              padding: '0 6vw',
              textAlign: 'center'
            }}>
              <h2 style={{
                fontFamily: 'Times New Roman, serif',
                fontSize: 'clamp(2rem, 4vw, 4rem)',
                fontWeight: 200,
                letterSpacing: '-0.01em',
                textTransform: 'uppercase',
                marginBottom: '32px',
                lineHeight: 1
              }}>
                Your Gallery Awaits
              </h2>
              <p style={{
                fontSize: '20px',
                lineHeight: 1.6,
                fontWeight: 300,
                maxWidth: '600px',
                margin: '0 auto 48px auto',
                color: '#666666'
              }}>
                This is where your professional brand photos will live. Ready to see what happens when AI meets your selfies? 
                Spoiler: it's magic.
              </p>
              <a
                href="/sandra-photoshoot"
                style={{
                  display: 'inline-block',
                  padding: '20px 40px',
                  fontSize: '11px',
                  fontWeight: 400,
                  letterSpacing: '0.3em',
                  textTransform: 'uppercase',
                  textDecoration: 'none',
                  border: '1px solid #0a0a0a',
                  color: '#ffffff',
                  background: '#0a0a0a',
                  transition: 'all 300ms ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = 'transparent';
                  e.target.style.color = '#0a0a0a';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = '#0a0a0a';
                  e.target.style.color = '#ffffff';
                }}
              >
                Start Your First Photoshoot
              </a>
            </div>
          </section>
        ) : (
          <section style={{ 
            padding: '0 0 100px 0',
            background: '#ffffff'
          }}>
            <div style={{
              maxWidth: '1400px',
              margin: '0 auto',
              padding: '0 6vw'
            }}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: '30px'
              }}>
                {filteredImages.map((image, index) => (
                  <div
                    key={image.id}
                    style={{
                      position: 'relative',
                      overflow: 'hidden',
                      background: '#f5f5f5',
                      aspectRatio: '3/4',
                      cursor: 'pointer'
                    }}
                    onClick={() => setSelectedImage(image.imageUrl)}
                  >
                    <img 
                      src={image.imageUrl}
                      alt={`SSELFIE ${index + 1}`}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        transition: 'transform 1000ms cubic-bezier(0.4, 0, 0.2, 1)'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.transform = 'scale(1.05)';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.transform = 'scale(1)';
                      }}
                    />
                    
                    {/* Favorite Heart Button */}
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        console.log('Heart button clicked, preventing modal');
                        toggleFavorite(image.id);
                      }}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                      }}
                      style={{
                        position: 'absolute',
                        top: '16px',
                        right: '16px',
                        background: 'rgba(0, 0, 0, 0.6)',
                        border: 'none',
                        color: favorites.includes(image.id) ? '#ff4444' : '#ffffff',
                        fontSize: '20px',
                        padding: '8px 10px',
                        cursor: 'pointer',
                        borderRadius: '50%',
                        transition: 'all 300ms ease',
                        backdropFilter: 'blur(10px)',
                        zIndex: 10
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.background = 'rgba(0, 0, 0, 0.8)';
                        e.target.style.transform = 'scale(1.1)';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.background = 'rgba(0, 0, 0, 0.6)';
                        e.target.style.transform = 'scale(1)';
                      }}
                    >
                      {favorites.includes(image.id) ? '♥' : '♡'}
                    </button>
                    
                    <div style={{
                      position: 'absolute',
                      inset: 0,
                      background: 'linear-gradient(to bottom, transparent 50%, rgba(10, 10, 10, 0.9) 100%)',
                      opacity: 0,
                      transition: 'opacity 500ms ease',
                      display: 'flex',
                      alignItems: 'flex-end',
                      padding: '30px'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.opacity = 1;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.opacity = 0;
                    }}>
                      <div style={{ width: '100%' }}>
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}>
                          <div>
                            <h4 style={{
                              color: '#ffffff',
                              fontSize: '11px',
                              fontWeight: 400,
                              letterSpacing: '0.3em',
                              textTransform: 'uppercase',
                              marginBottom: '4px'
                            }}>
                              SSELFIE {index + 1}
                            </h4>
                            <p style={{
                              color: 'rgba(255, 255, 255, 0.8)',
                              fontSize: '12px',
                              margin: 0
                            }}>
                              {image.prompt ? image.prompt.substring(0, 40) + '...' : 'Professional brand photo'}
                            </p>
                          </div>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                downloadImage(image.imageUrl, `sselfie-${index + 1}.jpg`);
                              }}
                              style={{
                                background: 'rgba(255, 255, 255, 0.2)',
                                border: '1px solid rgba(255, 255, 255, 0.3)',
                                color: '#ffffff',
                                padding: '8px 12px',
                                fontSize: '10px',
                                letterSpacing: '0.2em',
                                textTransform: 'uppercase',
                                cursor: 'pointer',
                                transition: 'all 300ms ease'
                              }}
                              onMouseEnter={(e) => {
                                e.target.style.background = '#ffffff';
                                e.target.style.color = '#0a0a0a';
                              }}
                              onMouseLeave={(e) => {
                                e.target.style.background = 'rgba(255, 255, 255, 0.2)';
                                e.target.style.color = '#ffffff';
                              }}
                            >
                              Download
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteImage(image.id);
                              }}
                              style={{
                                background: 'rgba(255, 68, 68, 0.2)',
                                border: '1px solid rgba(255, 68, 68, 0.4)',
                                color: '#ff4444',
                                padding: '8px 12px',
                                fontSize: '10px',
                                letterSpacing: '0.2em',
                                textTransform: 'uppercase',
                                cursor: 'pointer',
                                transition: 'all 300ms ease'
                              }}
                              onMouseEnter={(e) => {
                                e.target.style.background = '#ff4444';
                                e.target.style.color = '#ffffff';
                              }}
                              onMouseLeave={(e) => {
                                e.target.style.background = 'rgba(255, 68, 68, 0.2)';
                                e.target.style.color = '#ff4444';
                              }}
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Image Lightbox */}
        {selectedImage && (
          <div 
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0, 0, 0, 0.9)',
              zIndex: 1000,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '40px'
            }}
            onClick={() => setSelectedImage(null)}
          >
            <div style={{
              position: 'relative',
              maxWidth: '90vw',
              maxHeight: '90vh'
            }}>
              <img 
                src={selectedImage}
                alt="Selected SSELFIE"
                style={{
                  width: '100%',
                  height: 'auto',
                  objectFit: 'contain'
                }}
              />
              <button
                onClick={() => setSelectedImage(null)}
                style={{
                  position: 'absolute',
                  top: '-40px',
                  right: '0',
                  background: 'transparent',
                  border: 'none',
                  color: '#ffffff',
                  fontSize: '24px',
                  cursor: 'pointer',
                  padding: '8px'
                }}
              >
                ×
              </button>
            </div>
          </div>
        )}

        {/* Editorial Quote Section - Only show if user has images */}
        {aiImages.length > 0 && (
          <section style={{
            padding: '100px 0',
            background: '#f5f5f5'
          }}>
            <div style={{
              maxWidth: '800px',
              margin: '0 auto',
              padding: '0 6vw',
              textAlign: 'center'
            }}>
              <blockquote style={{
                fontFamily: 'Times New Roman, serif',
                fontSize: 'clamp(1.5rem, 3vw, 2.5rem)',
                fontWeight: 200,
                lineHeight: 1.4,
                marginBottom: '40px',
                fontStyle: 'italic',
                color: '#0a0a0a'
              }}>
                "Every photo in your gallery tells a story. Some whisper confidence, others shout CEO energy. 
                Your job? Choose the ones that match where you're going, not where you've been."
              </blockquote>
              <cite style={{
                fontSize: '11px',
                letterSpacing: '0.3em',
                textTransform: 'uppercase',
                color: '#666666',
                fontStyle: 'normal'
              }}>
                Sandra's Gallery Philosophy
              </cite>
            </div>
          </section>
        )}
        
        {/* Navigation Back to Studio */}
        <section style={{ padding: '60px 0', background: '#ffffff', textAlign: 'center' }}>
          <div style={{
            maxWidth: '1400px',
            margin: '0 auto',
            padding: '0 6vw'
          }}>
            <a
              href="/workspace"
              style={{
                display: 'inline-block',
                padding: '20px 40px',
                fontSize: '11px',
                fontWeight: 400,
                letterSpacing: '0.3em',
                textTransform: 'uppercase',
                textDecoration: 'none',
                border: '1px solid #0a0a0a',
                color: '#0a0a0a',
                background: 'transparent',
                transition: 'all 300ms ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = '#0a0a0a';
                e.target.style.color = '#ffffff';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'transparent';
                e.target.style.color = '#0a0a0a';
              }}
            >
              Back to STUDIO
            </a>
          </div>
        </section>
      </div>
    </PaymentVerification>
  );
}
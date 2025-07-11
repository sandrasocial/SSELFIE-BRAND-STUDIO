import React, { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Navigation } from '@/components/navigation';
import { PaymentVerification } from '@/components/payment-verification';
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
      return await apiRequest('POST', `/api/images/${imageId}/favorite`);
    },
    onSuccess: () => {
      // Refresh favorites data
      queryClient.invalidateQueries({ queryKey: ['/api/images/favorites'] });
    }
  });

  const downloadImage = async (imageUrl: string, filename: string) => {
    try {
      const response = await fetch(imageUrl);
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

  const toggleFavorite = (imageId: number) => {
    toggleFavoriteMutation.mutate(imageId);
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
      <div style={{ 
        minHeight: '100vh', 
        background: '#ffffff',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        fontWeight: 300,
        color: '#0a0a0a'
      }}>
        <Navigation />
        
        {/* Hero Section */}
        <section style={{
          padding: '120px 0 80px 0'
        }}>
          <div style={{
            maxWidth: '1400px',
            margin: '0 auto',
            padding: '0 40px'
          }}>
            <div style={{
              fontSize: '11px',
              fontWeight: 400,
              letterSpacing: '0.4em',
              textTransform: 'uppercase',
              color: '#666666',
              marginBottom: '24px'
            }}>
              YOUR PROFESSIONAL PHOTOS
            </div>
            <h1 style={{
              fontFamily: 'Times New Roman, serif',
              fontSize: 'clamp(4rem, 8vw, 8rem)',
              fontWeight: 200,
              letterSpacing: '-0.01em',
              textTransform: 'uppercase',
              marginBottom: '32px',
              lineHeight: 1
            }}>
              SSELFIE GALLERY
            </h1>
            <p style={{
              fontSize: '20px',
              lineHeight: 1.5,
              fontWeight: 300,
              maxWidth: '600px',
              marginBottom: '40px'
            }}>
              Your professional brand photos, ready to download and use across all your marketing.
            </p>
            
            {/* Gallery Stats */}
            <div style={{
              display: 'flex',
              gap: '60px',
              alignItems: 'center',
              marginBottom: '80px'
            }}>
              <div>
                <div style={{
                  fontFamily: 'Times New Roman, serif',
                  fontSize: '48px',
                  fontWeight: 200,
                  lineHeight: 1
                }}>
                  {aiImages.length}
                </div>
                <div style={{
                  fontSize: '11px',
                  letterSpacing: '0.3em',
                  textTransform: 'uppercase',
                  color: '#666666',
                  marginTop: '8px'
                }}>
                  Photos Generated
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
            </div>

            {/* Filter Controls */}
            <div style={{
              display: 'flex',
              gap: '20px',
              alignItems: 'center',
              marginBottom: '60px'
            }}>
              <button
                onClick={() => setShowFavoritesOnly(false)}
                style={{
                  padding: '12px 24px',
                  fontSize: '11px',
                  fontWeight: 400,
                  letterSpacing: '0.3em',
                  textTransform: 'uppercase',
                  border: showFavoritesOnly ? '1px solid #cccccc' : '1px solid #0a0a0a',
                  color: showFavoritesOnly ? '#666666' : '#0a0a0a',
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
                  padding: '12px 24px',
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

        {/* Gallery Grid */}
        {isLoading ? (
          <section style={{ padding: '80px 0' }}>
            <div style={{
              maxWidth: '1400px',
              margin: '0 auto',
              padding: '0 40px',
              textAlign: 'center'
            }}>
              <div style={{
                fontSize: '16px',
                color: '#666666'
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
              padding: '0 40px',
              textAlign: 'center'
            }}>
              <h2 style={{
                fontFamily: 'Times New Roman, serif',
                fontSize: 'clamp(2rem, 4vw, 4rem)',
                fontWeight: 200,
                letterSpacing: '-0.01em',
                textTransform: 'uppercase',
                marginBottom: '24px',
                lineHeight: 1
              }}>
                No Photos Yet
              </h2>
              <p style={{
                fontSize: '18px',
                lineHeight: 1.6,
                fontWeight: 300,
                maxWidth: '500px',
                margin: '0 auto 40px auto',
                color: '#666666'
              }}>
                Generate your first SSELFIE photos to start building your professional image library.
              </p>
              <a
                href="/sandra-photoshoot"
                style={{
                  display: 'inline-block',
                  padding: '16px 32px',
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
                Start AI Photoshoot
              </a>
            </div>
          </section>
        ) : (
          <section style={{ padding: '80px 0' }}>
            <div style={{
              maxWidth: '1400px',
              margin: '0 auto',
              padding: '0 40px'
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
                        e.stopPropagation();
                        toggleFavorite(image.id);
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
                        backdropFilter: 'blur(10px)'
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

        {/* Navigation Back to Studio */}
        <section style={{ padding: '80px 0', background: '#f5f5f5', textAlign: 'center' }}>
          <div style={{
            maxWidth: '1400px',
            margin: '0 auto',
            padding: '0 40px'
          }}>
            <a
              href="/workspace"
              style={{
                display: 'inline-block',
                padding: '16px 32px',
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
              Back to Studio
            </a>
          </div>
        </section>
      </div>
    </PaymentVerification>
  );
}
import React, { useState } from 'react';
import { useAuth } from '../hooks/use-auth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MemberNavigation } from '../components/member-navigation';
// Removed PaymentVerification - free users should access gallery
import { HeroFullBleed } from '../components/hero-full-bleed';
import { SandraImages } from '../lib/sandra-images';
import { apiRequest } from '../lib/queryClient';
import ErrorBoundary from '../components/ErrorBoundary';
import { useMemoryCleanup } from '../hooks/useMemoryCleanup';
import { getOptimalStaleTime } from '../utils/performanceOptimizations';

function SSELFIEGallery() {
  const { user, isAuthenticated } = useAuth();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [downloadingImages, setDownloadingImages] = useState(new Set<string>());
  const [isDownloadingAll, setIsDownloadingAll] = useState(false);
  const queryClient = useQueryClient();

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const imagesPerPage = 20;

  // Performance optimizations
  const { addCleanup } = useMemoryCleanup();

  // Fetch user's deliberately saved gallery images with pagination
  const { data: aiImages = [], isLoading } = useQuery<any[]>({
    queryKey: ['/api/gallery-images', currentPage, imagesPerPage],
    enabled: isAuthenticated && !!user,
    staleTime: getOptimalStaleTime('gallery'), // Optimized cache timing
    gcTime: 5 * 60 * 1000, // 5 minutes garbage collection
    refetchOnWindowFocus: false, // Prevent unnecessary refetches
  });

  // Fetch user's favorites
  const { data: favoritesData } = useQuery<{ favorites: number[] }>({
    queryKey: ['/api/images/favorites'],
    enabled: isAuthenticated && !!user,
    staleTime: getOptimalStaleTime('static'), // Longer cache for favorites
    refetchOnWindowFocus: false, // Prevent unnecessary refetches
  });

  const favorites: number[] = favoritesData?.favorites || [];

  // Toggle favorite mutation
  const toggleFavoriteMutation = useMutation({
    mutationFn: async (imageId: number) => {
      console.log('Making API request to toggle favorite for image:', imageId);
      const response = await apiRequest(`/api/images/${imageId}/favorite`, 'POST');
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
      return await apiRequest(`/api/ai-images/${imageId}`, 'DELETE');
    },
    onSuccess: () => {
      // Refresh gallery images data
      queryClient.invalidateQueries({ queryKey: ['/api/gallery-images'] });
      queryClient.invalidateQueries({ queryKey: ['/api/images/favorites'] });
    }
  });



  const downloadImage = async (imageUrl: string, filename: string) => {
    try {
      setDownloadingImages(prev => new Set([...prev, imageUrl]));
      
      // Skip broken or invalid URLs
      if (!imageUrl || !imageUrl.startsWith('http')) {
        console.log('Skipping invalid URL:', imageUrl);
        return;
      }
      
      // For S3 URLs, try to create a download link that works
      const link = document.createElement('a');
      link.href = imageUrl;
      link.download = filename;
      
      // Add proper attributes for CORS download
      link.setAttribute('crossorigin', 'anonymous');
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      
      // Temporarily add to DOM and trigger click
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      console.log(`Download initiated for: ${filename}`);
      
    } catch (error) {
      console.error('Error downloading image:', error);
      // Show user-friendly error message
      alert('Download failed. Please right-click the image and select "Save image as..." to download manually.');
    } finally {
      // Clear loading state after a short delay to show the loading animation briefly
      setTimeout(() => {
        setDownloadingImages(prev => {
          const newSet = new Set(prev);
          newSet.delete(imageUrl);
          return newSet;
        });
      }, 1000);
    }
  };

  const downloadAllImages = async () => {
    try {
      setIsDownloadingAll(true);
      const imagesToDownload = showFavoritesOnly ? 
        aiImages.filter(img => favorites.includes(img.id)) : 
        aiImages;
        
      for (let i = 0; i < imagesToDownload.length; i++) {
        const image = imagesToDownload[i];
        await downloadImage(image.imageUrl, `sselfie-${i + 1}.jpg`);
        // Small delay between downloads
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    } catch (error) {
      console.error('Error downloading all images:', error);
    } finally {
      setIsDownloadingAll(false);
    }
  };



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
        <MemberNavigation />
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
      <div className="min-h-screen bg-white touch-manipulation" style={{ 
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        fontWeight: 300,
        color: '#0a0a0a'
      }}>
        <MemberNavigation />
        
        {/* Full Bleed Hero Section */}
        <HeroFullBleed
          backgroundImage="https://i.postimg.cc/76vVdbWY/out-0-7.png"
          title="SSELFIE"
          subtitle="GALLERY"
          tagline="Your professional photo library"
          alignment="center"
          overlay={0.4}
        />
        
        {/* Gallery Statistics & Controls Section - Mobile Optimized */}
        <section style={{
          padding: 'clamp(40px, 8vw, 80px) 0 clamp(30px, 6vw, 60px) 0',
          background: '#ffffff'
        }}>
          <div style={{
            maxWidth: '1400px',
            margin: '0 auto',
            padding: '0 clamp(20px, 6vw, 6vw)'
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
            
            {/* Gallery Stats - Centered Layout - Mobile Responsive */}
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              gap: 'clamp(40px, 10vw, 80px)',
              alignItems: 'center',
              marginBottom: 'clamp(30px, 8vw, 60px)',
              flexWrap: 'wrap',
              padding: '0 20px'
            }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  fontFamily: 'Times New Roman, serif',
                  fontSize: 'clamp(32px, 12vw, 64px)',
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
                  fontSize: 'clamp(32px, 12vw, 64px)',
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
                  disabled={isDownloadingAll}
                  className="touch-manipulation"
                  style={{
                    padding: 'clamp(14px, 3vw, 16px) clamp(24px, 6vw, 32px)',
                    fontSize: 'clamp(10px, 2.5vw, 11px)',
                    fontWeight: 400,
                    letterSpacing: '0.3em',
                    textTransform: 'uppercase',
                    textDecoration: 'none',
                    border: '1px solid #0a0a0a',
                    color: '#0a0a0a',
                    background: 'transparent',
                    transition: 'all 300ms ease',
                    cursor: isDownloadingAll ? 'wait' : 'pointer',
                    minWidth: 'clamp(180px, 30vw, 200px)',
                    minHeight: '44px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    opacity: isDownloadingAll ? 0.7 : 1
                  }}
                  onMouseEnter={(e) => {
                    if (!isDownloadingAll) {
                      (e.target as HTMLButtonElement).style.background = '#0a0a0a';
                      (e.target as HTMLButtonElement).style.color = '#ffffff';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isDownloadingAll) {
                      (e.target as HTMLButtonElement).style.background = 'transparent';
                      (e.target as HTMLButtonElement).style.color = '#0a0a0a';
                    }
                  }}
                >
                  {isDownloadingAll ? (
                    <>
                      <div style={{
                        width: '16px',
                        height: '16px',
                        border: '2px solid rgba(10, 10, 10, 0.3)',
                        borderTop: '2px solid #0a0a0a',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite'
                      }} />
                      <span>Downloading Photos...</span>
                    </>
                  ) : (
                    'Download All Photos'
                  )}
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
                  (e.target as HTMLAnchorElement).style.background = 'transparent';
                  (e.target as HTMLAnchorElement).style.color = '#0a0a0a';
                }}
                onMouseLeave={(e) => {
                  (e.target as HTMLAnchorElement).style.background = '#0a0a0a';
                  (e.target as HTMLAnchorElement).style.color = '#ffffff';
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
              {isLoading ? (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(clamp(250px, 40vw, 300px), 1fr))',
                  gap: 'clamp(16px, 4vw, 30px)',
                  padding: '0 20px'
                }}>
                  {Array.from({ length: 6 }).map((_, index) => (
                    <div
                      key={index}
                      style={{
                        aspectRatio: '3/4',
                        background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
                        backgroundSize: '200% 100%',
                        animation: 'shimmer 2s infinite',
                        borderRadius: '4px'
                      }}
                    />
                  ))}
                </div>
              ) : (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(clamp(250px, 40vw, 300px), 1fr))',
                  gap: 'clamp(16px, 4vw, 30px)',
                  padding: '0 20px'
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
                        (e.target as HTMLImageElement).style.transform = 'scale(1.05)';
                      }}
                      onMouseLeave={(e) => {
                        (e.target as HTMLImageElement).style.transform = 'scale(1)';
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
                      disabled={toggleFavoriteMutation.isPending}
                      className="touch-manipulation"
                      style={{
                        position: 'absolute',
                        top: 'clamp(12px, 3vw, 16px)',
                        right: 'clamp(12px, 3vw, 16px)',
                        background: 'rgba(0, 0, 0, 0.6)',
                        border: 'none',
                        color: favorites.includes(image.id) ? '#ff4444' : '#ffffff',
                        fontSize: 'clamp(18px, 4vw, 20px)',
                        padding: 'clamp(10px, 2.5vw, 12px)',
                        cursor: toggleFavoriteMutation.isPending ? 'wait' : 'pointer',
                        borderRadius: '50%',
                        transition: 'all 300ms ease',
                        backdropFilter: 'blur(10px)',
                        zIndex: 10,
                        minWidth: '44px',
                        minHeight: '44px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                      onMouseEnter={(e) => {
                        if (!toggleFavoriteMutation.isPending) {
                          (e.target as HTMLButtonElement).style.background = 'rgba(0, 0, 0, 0.8)';
                          (e.target as HTMLButtonElement).style.transform = 'scale(1.1)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!toggleFavoriteMutation.isPending) {
                          (e.target as HTMLButtonElement).style.background = 'rgba(0, 0, 0, 0.6)';
                          (e.target as HTMLButtonElement).style.transform = 'scale(1)';
                        }
                      }}
                    >
                      {toggleFavoriteMutation.isPending ? (
                        <div style={{
                          width: '16px',
                          height: '16px',
                          border: '2px solid rgba(255, 255, 255, 0.3)',
                          borderTop: '2px solid #ffffff',
                          borderRadius: '50%',
                          animation: 'spin 1s linear infinite'
                        }} />
                      ) : (
                        favorites.includes(image.id) ? '♥' : '♡'
                      )}
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
                      e.currentTarget.style.opacity = '1';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.opacity = '0';
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
                              disabled={downloadingImages.has(image.imageUrl)}
                              className="touch-manipulation"
                              style={{
                                background: 'rgba(255, 255, 255, 0.2)',
                                border: '1px solid rgba(255, 255, 255, 0.3)',
                                color: '#ffffff',
                                padding: 'clamp(8px, 2vw, 10px) clamp(10px, 3vw, 12px)',
                                fontSize: 'clamp(9px, 2vw, 10px)',
                                letterSpacing: '0.2em',
                                textTransform: 'uppercase',
                                cursor: downloadingImages.has(image.imageUrl) ? 'wait' : 'pointer',
                                transition: 'all 300ms ease',
                                minWidth: 'clamp(70px, 15vw, 80px)',
                                minHeight: '44px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '4px'
                              }}
                              onMouseEnter={(e) => {
                                if (!downloadingImages.has(image.imageUrl)) {
                                  (e.target as HTMLButtonElement).style.background = '#ffffff';
                                  (e.target as HTMLButtonElement).style.color = '#0a0a0a';
                                }
                              }}
                              onMouseLeave={(e) => {
                                if (!downloadingImages.has(image.imageUrl)) {
                                  (e.target as HTMLButtonElement).style.background = 'rgba(255, 255, 255, 0.2)';
                                  (e.target as HTMLButtonElement).style.color = '#ffffff';
                                }
                              }}
                            >
                              {downloadingImages.has(image.imageUrl) ? (
                                <>
                                  <div style={{
                                    width: '12px',
                                    height: '12px',
                                    border: '2px solid rgba(255, 255, 255, 0.3)',
                                    borderTop: '2px solid #ffffff',
                                    borderRadius: '50%',
                                    animation: 'spin 1s linear infinite'
                                  }} />
                                  <span>...</span>
                                </>
                              ) : (
                                'Download'
                              )}
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteImage(image.id);
                              }}
                              className="touch-manipulation"
                              style={{
                                background: 'rgba(255, 68, 68, 0.2)',
                                border: '1px solid rgba(255, 68, 68, 0.4)',
                                color: '#ff4444',
                                padding: 'clamp(8px, 2vw, 10px) clamp(10px, 3vw, 12px)',
                                fontSize: 'clamp(9px, 2vw, 10px)',
                                letterSpacing: '0.2em',
                                textTransform: 'uppercase',
                                cursor: 'pointer',
                                transition: 'all 300ms ease',
                                minHeight: '44px',
                                minWidth: 'clamp(60px, 12vw, 70px)'
                              }}
                              onMouseEnter={(e) => {
                                (e.target as HTMLButtonElement).style.background = '#ff4444';
                                (e.target as HTMLButtonElement).style.color = '#ffffff';
                              }}
                              onMouseLeave={(e) => {
                                (e.target as HTMLButtonElement).style.background = 'rgba(255, 68, 68, 0.2)';
                                (e.target as HTMLButtonElement).style.color = '#ff4444';
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
              )}
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

        {/* CSS Animations */}
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          
          @keyframes shimmer {
            0% { background-position: -200% 0; }
            100% { background-position: 200% 0; }
          }
        `}</style>

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
                (e.target as HTMLAnchorElement).style.background = '#0a0a0a';
                (e.target as HTMLAnchorElement).style.color = '#ffffff';
              }}
              onMouseLeave={(e) => {
                (e.target as HTMLAnchorElement).style.background = 'transparent';
                (e.target as HTMLAnchorElement).style.color = '#0a0a0a';
              }}
            >
              Back to STUDIO
            </a>
          </div>
        </section>
      </div>
  );
}

export default function SSELFIEGalleryWithErrorBoundary() {
  return (
    <ErrorBoundary>
      <SSELFIEGallery />
    </ErrorBoundary>
  );
}
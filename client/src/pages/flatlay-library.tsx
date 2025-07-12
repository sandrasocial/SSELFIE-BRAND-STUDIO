import { useState, useCallback } from 'react';
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { HeroFullBleed } from '@/components/HeroFullBleed';
import { Navigation } from '@/components/navigation';

interface FlatlayImage {
  id: string;
  url: string;
  title: string;
  category: string;
  description: string;
}

interface FlatlayCollection {
  id: string;
  name: string;
  description: string;
  aesthetic: string;
  images: FlatlayImage[];
}

// Flatlay Collections Data Structure
const flatlayCollections: FlatlayCollection[] = [
  {
    id: 'luxury-minimal',
    name: 'Luxury Minimal',
    description: 'Clean white backgrounds, designer accessories, minimal styling',
    aesthetic: 'Clean sophistication with generous white space',
    images: [
      // Images will be added here - placeholder structure
      {
        id: 'lm-1',
        url: '/api/placeholder/400/500',
        title: 'Designer Accessories',
        category: 'Luxury Minimal',
        description: 'Clean white background with luxury accessories'
      }
    ]
  },
  {
    id: 'editorial-magazine',
    name: 'Editorial Magazine',
    description: 'Dark moody flatlays, fashion magazines, coffee aesthetic',
    aesthetic: 'Magazine-worthy editorial sophistication',
    images: [
      {
        id: 'em-1',
        url: '/api/placeholder/400/500',
        title: 'Magazine Mood',
        category: 'Editorial Magazine',
        description: 'Dark moody flatlay with fashion magazines'
      }
    ]
  },
  {
    id: 'european-luxury',
    name: 'European Luxury',
    description: 'Parisian cafe tables, designer bags, sophisticated lifestyle',
    aesthetic: 'Effortless European sophistication',
    images: [
      {
        id: 'el-1',
        url: '/api/placeholder/400/500',
        title: 'Parisian Lifestyle',
        category: 'European Luxury',
        description: 'Sophisticated cafe table setup'
      }
    ]
  },
  {
    id: 'wellness-mindset',
    name: 'Wellness & Mindset',
    description: 'Natural textures, crystals, journals, self-care items',
    aesthetic: 'Healing and mindful living',
    images: [
      {
        id: 'wm-1',
        url: '/api/placeholder/400/500',
        title: 'Self-Care Ritual',
        category: 'Wellness & Mindset',
        description: 'Natural textures and mindful items'
      }
    ]
  },
  {
    id: 'business-professional',
    name: 'Business Professional',
    description: 'Laptop flatlays, planning materials, office aesthetics',
    aesthetic: 'Professional productivity with style',
    images: [
      {
        id: 'bp-1',
        url: '/api/placeholder/400/500',
        title: 'Business Setup',
        category: 'Business Professional',
        description: 'Stylish productivity flatlay'
      }
    ]
  },
  {
    id: 'pink-girly',
    name: 'Pink & Girly',
    description: 'Soft feminine flatlays, beauty products, flowers',
    aesthetic: 'Feminine and romantic styling',
    images: [
      {
        id: 'pg-1',
        url: '/api/placeholder/400/500',
        title: 'Feminine Beauty',
        category: 'Pink & Girly',
        description: 'Soft pink feminine flatlay'
      }
    ]
  }
];

export default function FlatlayLibrary() {
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [selectedCollection, setSelectedCollection] = useState<FlatlayCollection>(flatlayCollections[0]);
  const [fullSizeImage, setFullSizeImage] = useState<string | null>(null);
  const [favoriteImages, setFavoriteImages] = useState<Set<string>>(new Set());

  // Save flatlay to gallery
  const saveToGallery = useCallback(async (imageUrl: string, imageTitle: string) => {
    try {
      const response = await fetch('/api/save-selected-images', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageUrls: [imageUrl],
          prompt: `Flatlay: ${imageTitle}`
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to save image');
      }
      
      queryClient.invalidateQueries({ queryKey: ['/api/ai-images'] });
      
      toast({
        title: "Flatlay Saved",
        description: "Added to your gallery successfully",
      });
    } catch (error) {
      console.error('Error saving flatlay:', error);
      toast({
        title: "Save Failed",
        description: "Could not save flatlay to gallery",
        variant: "destructive",
      });
    }
  }, [queryClient, toast]);

  // Toggle favorite
  const toggleFavorite = (imageId: string) => {
    setFavoriteImages(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(imageId)) {
        newFavorites.delete(imageId);
      } else {
        newFavorites.add(imageId);
      }
      return newFavorites;
    });
  };

  return (
    <div style={{ minHeight: '100vh', background: '#ffffff' }}>
      <Navigation />
      
      {/* Hero Section */}
      <HeroFullBleed
        title="FLATLAYS"
        tagline="Brand Library"
        description="CURATED LIFESTYLE IMAGES THAT MATCH YOUR AESTHETIC. BECAUSE YOUR BRAND NEEDS MORE THAN JUST SELFIES."
        backgroundImage="https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=1200&h=800&fit=crop"
      />

      {/* Collection Selector */}
      <div style={{
        background: '#f5f5f5',
        padding: '80px 0'
      }}>
        <div style={{
          maxWidth: '1400px',
          margin: '0 auto',
          padding: '0 40px'
        }}>
          <div style={{
            textAlign: 'center',
            marginBottom: '60px'
          }}>
            <h2 style={{
              fontFamily: 'Times New Roman, serif',
              fontSize: 'clamp(2rem, 4vw, 3rem)',
              fontWeight: 200,
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: '#0a0a0a',
              marginBottom: '20px'
            }}>
              CHOOSE YOUR VIBE
            </h2>
            <p style={{
              fontSize: '16px',
              color: '#666666',
              maxWidth: '600px',
              margin: '0 auto',
              lineHeight: 1.6
            }}>
              Six curated collections of professional flatlays. Pick the aesthetic that matches your brand and save your favorites.
            </p>
          </div>

          {/* Collection Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '30px',
            marginBottom: '80px'
          }}>
            {flatlayCollections.map((collection) => (
              <div
                key={collection.id}
                onClick={() => setSelectedCollection(collection)}
                style={{
                  background: selectedCollection.id === collection.id ? '#0a0a0a' : '#ffffff',
                  color: selectedCollection.id === collection.id ? '#ffffff' : '#0a0a0a',
                  border: '1px solid #e5e5e5',
                  padding: '40px',
                  cursor: 'pointer',
                  transition: 'all 300ms ease',
                  textAlign: 'center'
                }}
              >
                <h3 style={{
                  fontFamily: 'Times New Roman, serif',
                  fontSize: '1.5rem',
                  fontWeight: 200,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  marginBottom: '15px'
                }}>
                  {collection.name}
                </h3>
                <p style={{
                  fontSize: '14px',
                  opacity: 0.8,
                  marginBottom: '15px',
                  lineHeight: 1.5
                }}>
                  {collection.description}
                </p>
                <div style={{
                  fontSize: '12px',
                  opacity: 0.6,
                  fontStyle: 'italic'
                }}>
                  {collection.aesthetic}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Selected Collection Images */}
      <div style={{
        background: '#ffffff',
        padding: '80px 0'
      }}>
        <div style={{
          maxWidth: '1400px',
          margin: '0 auto',
          padding: '0 40px'
        }}>
          <div style={{
            textAlign: 'center',
            marginBottom: '60px'
          }}>
            <h2 style={{
              fontFamily: 'Times New Roman, serif',
              fontSize: 'clamp(1.5rem, 3vw, 2rem)',
              fontWeight: 200,
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: '#0a0a0a',
              marginBottom: '15px'
            }}>
              {selectedCollection.name}
            </h2>
            <p style={{
              fontSize: '16px',
              color: '#666666',
              marginBottom: '30px'
            }}>
              {selectedCollection.description}
            </p>
            <div style={{
              background: '#f5f5f5',
              padding: '20px',
              fontSize: '14px',
              color: '#0a0a0a',
              textAlign: 'center',
              border: '1px solid #e5e5e5'
            }}>
              📦 <strong>Upload Location:</strong> Create folder: <code>/public/flatlays/{selectedCollection.id}/</code>
              <br />
              Add your flatlay images here and update the collection data below
            </div>
          </div>

          {/* Image Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '20px'
          }}>
            {selectedCollection.images.map((image) => (
              <div
                key={image.id}
                style={{
                  position: 'relative',
                  background: '#f5f5f5',
                  aspectRatio: '4/5',
                  overflow: 'hidden',
                  border: '1px solid #e5e5e5'
                }}
              >
                <img
                  src={image.url}
                  alt={image.title}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    cursor: 'pointer',
                    transition: 'transform 300ms ease'
                  }}
                  onClick={() => setFullSizeImage(image.url)}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                />
                
                {/* Image Actions */}
                <div style={{
                  position: 'absolute',
                  top: '15px',
                  right: '15px',
                  display: 'flex',
                  gap: '10px'
                }}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(image.id);
                    }}
                    style={{
                      background: favoriteImages.has(image.id) ? '#0a0a0a' : 'rgba(255, 255, 255, 0.9)',
                      color: favoriteImages.has(image.id) ? '#ffffff' : '#0a0a0a',
                      border: 'none',
                      width: '32px',
                      height: '32px',
                      borderRadius: '0',
                      cursor: 'pointer',
                      fontSize: '14px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    ♡
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      saveToGallery(image.url, image.title);
                    }}
                    style={{
                      background: 'rgba(10, 10, 10, 0.9)',
                      color: '#ffffff',
                      border: 'none',
                      padding: '8px 12px',
                      fontSize: '10px',
                      fontWeight: 400,
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                      cursor: 'pointer'
                    }}
                  >
                    Save
                  </button>
                </div>

                {/* Image Info */}
                <div style={{
                  position: 'absolute',
                  bottom: '0',
                  left: '0',
                  right: '0',
                  background: 'linear-gradient(transparent, rgba(10, 10, 10, 0.8))',
                  padding: '20px 15px 15px',
                  color: '#ffffff'
                }}>
                  <h4 style={{
                    fontSize: '12px',
                    fontWeight: 400,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    marginBottom: '5px'
                  }}>
                    {image.title}
                  </h4>
                  <p style={{
                    fontSize: '11px',
                    opacity: 0.8,
                    lineHeight: 1.4
                  }}>
                    {image.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Collection Stats */}
          <div style={{
            textAlign: 'center',
            marginTop: '60px',
            padding: '40px',
            background: '#f5f5f5',
            border: '1px solid #e5e5e5'
          }}>
            <p style={{
              fontSize: '14px',
              color: '#666666',
              marginBottom: '10px'
            }}>
              {selectedCollection.images.length} Professional Flatlays Available
            </p>
            <p style={{
              fontSize: '12px',
              color: '#0a0a0a',
              fontWeight: 400,
              letterSpacing: '0.1em',
              textTransform: 'uppercase'
            }}>
              Click images to preview • Save favorites to your gallery
            </p>
          </div>
        </div>
      </div>

      {/* Full Size Image Modal */}
      {fullSizeImage && (
        <div style={{
          position: 'fixed',
          inset: '0',
          background: 'rgba(10, 10, 10, 0.95)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px'
        }}>
          <div style={{
            position: 'relative',
            maxWidth: '90vw',
            maxHeight: '90vh'
          }}>
            <img
              src={fullSizeImage}
              alt="Full size flatlay"
              style={{
                maxWidth: '100%',
                maxHeight: '100%',
                objectFit: 'contain'
              }}
            />
            <button
              onClick={() => setFullSizeImage(null)}
              style={{
                position: 'absolute',
                top: '-40px',
                right: '0',
                background: 'none',
                border: 'none',
                color: '#ffffff',
                fontSize: '24px',
                cursor: 'pointer',
                width: '40px',
                height: '40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
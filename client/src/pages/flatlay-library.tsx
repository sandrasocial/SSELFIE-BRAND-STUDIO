import { useState, useCallback } from 'react';
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { HeroFullBleed } from '@/components/HeroFullBleed';
import { Navigation } from '@/components/navigation';
import { SandraImages } from '@/lib/sandra-images';

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
  backgroundImage: string;
  images: FlatlayImage[];
}

// Flatlay Collections Data Structure
const flatlayCollections: FlatlayCollection[] = [
  {
    id: 'luxury-minimal',
    name: 'Luxury Minimal',
    description: 'Clean white backgrounds, designer accessories, minimal styling',
    aesthetic: 'Clean sophistication with generous white space',
    backgroundImage: 'https://i.postimg.cc/1tfNMJvk/file-16.png',
    images: [
      {
        id: 'lm-1',
        url: 'https://i.postimg.cc/1tfNMJvk/file-16.png',
        title: 'Clean Workspace',
        category: 'Luxury Minimal',
        description: 'Clean sophisticated lifestyle flatlay'
      },
      {
        id: 'lm-2',
        url: 'https://i.postimg.cc/6qZ4xTJz/file-19.png',
        title: 'Minimal Setup',
        category: 'Luxury Minimal',
        description: 'Clean sophisticated lifestyle flatlay'
      },
      {
        id: 'lm-3',
        url: 'https://i.postimg.cc/4NzH8K1x/file-20.png',
        title: 'Beauty Minimal',
        category: 'Luxury Minimal',
        description: 'Clean sophisticated lifestyle flatlay'
      },
      {
        id: 'lm-4',
        url: 'https://i.postimg.cc/V5ysqFhW/file-21.png',
        title: 'Planning Flatlay',
        category: 'Luxury Minimal',
        description: 'Clean sophisticated lifestyle flatlay'
      },
      {
        id: 'lm-5',
        url: 'https://i.postimg.cc/yY9cwp7B/file-22.png',
        title: 'Executive Setup',
        category: 'Luxury Minimal',
        description: 'Clean sophisticated lifestyle flatlay'
      },
      {
        id: 'lm-6',
        url: 'https://i.postimg.cc/bvFZG1q3/file-23.png',
        title: 'Content Creation',
        category: 'Luxury Minimal',
        description: 'Clean sophisticated lifestyle flatlay'
      },
      {
        id: 'lm-7',
        url: 'https://i.postimg.cc/C1Bzbd1Y/file-24.png',
        title: 'Laptop Workspace',
        category: 'Luxury Minimal',
        description: 'Clean sophisticated lifestyle flatlay'
      },
      {
        id: 'lm-8',
        url: 'https://i.postimg.cc/Y95jRkGF/file-25.png',
        title: 'Minimal Luxury',
        category: 'Luxury Minimal',
        description: 'Clean sophisticated lifestyle flatlay'
      },
      {
        id: 'lm-9',
        url: 'https://i.postimg.cc/sgr7yP2W/file-26.png',
        title: 'Designer Accessories',
        category: 'Luxury Minimal',
        description: 'Clean sophisticated lifestyle flatlay'
      },
      {
        id: 'lm-10',
        url: 'https://i.postimg.cc/5t9zQxLN/file-27.png',
        title: 'Elegant Minimal',
        category: 'Luxury Minimal',
        description: 'Clean sophisticated lifestyle flatlay'
      },
      {
        id: 'lm-11',
        url: 'https://i.postimg.cc/3wLvgPFj/file-28.png',
        title: 'White Space',
        category: 'Luxury Minimal',
        description: 'Clean sophisticated lifestyle flatlay'
      },
      {
        id: 'lm-12',
        url: 'https://i.postimg.cc/x13Hdkk4/file-31.png',
        title: 'Clean Lines',
        category: 'Luxury Minimal',
        description: 'Clean sophisticated lifestyle flatlay'
      },
      {
        id: 'lm-13',
        url: 'https://i.postimg.cc/HWFbv1DB/file-32.png',
        title: 'Minimal Beauty',
        category: 'Luxury Minimal',
        description: 'Clean sophisticated lifestyle flatlay'
      },
      {
        id: 'lm-14',
        url: 'https://i.postimg.cc/PfCmMrcC/file-33.png',
        title: 'Luxury Essentials',
        category: 'Luxury Minimal',
        description: 'Clean sophisticated lifestyle flatlay'
      },
      {
        id: 'lm-15',
        url: 'https://i.postimg.cc/kMRbbY68/file-44.png',
        title: 'Professional Setup',
        category: 'Luxury Minimal',
        description: 'Clean sophisticated lifestyle flatlay'
      },
      {
        id: 'lm-16',
        url: 'https://i.postimg.cc/kXrtFNKH/file-45.png',
        title: 'Organized Minimal',
        category: 'Luxury Minimal',
        description: 'Clean sophisticated lifestyle flatlay'
      },
      {
        id: 'lm-17',
        url: 'https://i.postimg.cc/Z54BXTfF/file-46.png',
        title: 'Aesthetic Order',
        category: 'Luxury Minimal',
        description: 'Clean sophisticated lifestyle flatlay'
      },
      {
        id: 'lm-18',
        url: 'https://i.postimg.cc/htszBH6F/file-47.png',
        title: 'Executive Minimal',
        category: 'Luxury Minimal',
        description: 'Clean sophisticated lifestyle flatlay'
      },
      {
        id: 'lm-19',
        url: 'https://i.postimg.cc/0NN62V1z/file-48.png',
        title: 'Sophisticated Clean',
        category: 'Luxury Minimal',
        description: 'Clean sophisticated lifestyle flatlay'
      }
    ]
  },
  {
    id: 'editorial-magazine',
    name: 'Editorial Magazine',
    description: 'Dark moody flatlays, fashion magazines, coffee aesthetic',
    aesthetic: 'Magazine-worthy editorial sophistication',
    backgroundImage: 'https://i.postimg.cc/02VLGyr8/1.png',
    images: [
      {
        id: 'em-1',
        url: 'https://i.postimg.cc/02VLGyr8/1.png',
        title: 'Editorial Workspace',
        category: 'Editorial Magazine',
        description: 'Dark moody editorial flatlay'
      },
      {
        id: 'em-2',
        url: 'https://i.postimg.cc/xjR7Y1vK/10.png',
        title: 'Magazine Style',
        category: 'Editorial Magazine',
        description: 'Magazine-worthy editorial moment'
      },
      {
        id: 'em-3',
        url: 'https://i.postimg.cc/hPtYGRsN/11.png',
        title: 'Creative Process',
        category: 'Editorial Magazine',
        description: 'Dark sophisticated planning setup'
      },
      {
        id: 'em-4',
        url: 'https://i.postimg.cc/qMD5hDZq/12.png',
        title: 'Editorial Planning',
        category: 'Editorial Magazine',
        description: 'Magazine editorial aesthetic'
      },
      {
        id: 'em-5',
        url: 'https://i.postimg.cc/bwGFQ0KT/13.png',
        title: 'Dark Mood',
        category: 'Editorial Magazine',
        description: 'Moody editorial flatlay'
      },
      {
        id: 'em-6',
        url: 'https://i.postimg.cc/8zqXwJGV/14.png',
        title: 'Magazine Layout',
        category: 'Editorial Magazine',
        description: 'Professional editorial setup'
      },
      {
        id: 'em-7',
        url: 'https://i.postimg.cc/s276LjfG/15.png',
        title: 'Fashion Editorial',
        category: 'Editorial Magazine',
        description: 'Fashion magazine aesthetic'
      },
      {
        id: 'em-8',
        url: 'https://i.postimg.cc/tTbSQK7S/16.png',
        title: 'Editorial Coffee',
        category: 'Editorial Magazine',
        description: 'Coffee shop editorial vibe'
      },
      {
        id: 'em-9',
        url: 'https://i.postimg.cc/63hH9Mv9/17.png',
        title: 'Magazine Spread',
        category: 'Editorial Magazine',
        description: 'Magazine spread layout'
      },
      {
        id: 'em-10',
        url: 'https://i.postimg.cc/j2dMCyHy/18.png',
        title: 'Dark Editorial',
        category: 'Editorial Magazine',
        description: 'Dark moody editorial style'
      },
      {
        id: 'em-11',
        url: 'https://i.postimg.cc/WzWXZt8C/19.png',
        title: 'Editorial Styling',
        category: 'Editorial Magazine',
        description: 'Professional editorial styling'
      },
      {
        id: 'em-12',
        url: 'https://i.postimg.cc/K8VwVpnw/2.png',
        title: 'Magazine Aesthetic',
        category: 'Editorial Magazine',
        description: 'Clean magazine aesthetic'
      },
      {
        id: 'em-13',
        url: 'https://i.postimg.cc/xjtshFQ5/20.png',
        title: 'Editorial Mood',
        category: 'Editorial Magazine',
        description: 'Sophisticated editorial mood'
      },
      {
        id: 'em-14',
        url: 'https://i.postimg.cc/7YRKYGfT/21.png',
        title: 'Fashion Magazine',
        category: 'Editorial Magazine',
        description: 'Fashion magazine style'
      },
      {
        id: 'em-15',
        url: 'https://i.postimg.cc/Dy0CTdyT/22.png',
        title: 'Editorial Layout',
        category: 'Editorial Magazine',
        description: 'Professional editorial layout'
      },
      {
        id: 'em-16',
        url: 'https://i.postimg.cc/qvCjtJ3D/23.png',
        title: 'Magazine Setup',
        category: 'Editorial Magazine',
        description: 'Magazine-worthy setup'
      },
      {
        id: 'em-17',
        url: 'https://i.postimg.cc/bvcLk70y/24.png',
        title: 'Editorial Style',
        category: 'Editorial Magazine',
        description: 'Editorial magazine style'
      },
      {
        id: 'em-18',
        url: 'https://i.postimg.cc/zfC7jxpn/25.png',
        title: 'Dark Magazine',
        category: 'Editorial Magazine',
        description: 'Dark magazine aesthetic'
      }
    ]
  },
  {
    id: 'european-luxury',
    name: 'European Luxury',
    description: 'Parisian cafe tables, designer bags, sophisticated lifestyle',
    aesthetic: 'Effortless European sophistication',
    backgroundImage: SandraImages.editorial.laptop2,
    images: [
      {
        id: 'el-1',
        url: SandraImages.editorial.laptop2,
        title: 'Parisian Lifestyle',
        category: 'European Luxury',
        description: 'Sophisticated cafe table setup'
      },
      {
        id: 'el-2',
        url: SandraImages.flatlays.workspace2,
        title: 'European Workspace',
        category: 'European Luxury',
        description: 'Effortless luxury lifestyle'
      },
      {
        id: 'el-3',
        url: SandraImages.editorial.phone1,
        title: 'Content Creation',
        category: 'European Luxury',
        description: 'Sophisticated content lifestyle'
      }
    ]
  },
  {
    id: 'wellness-mindset',
    name: 'Wellness & Mindset',
    description: 'Natural textures, crystals, journals, self-care items',
    aesthetic: 'Healing and mindful living',
    backgroundImage: SandraImages.editorial.thinking,
    images: [
      {
        id: 'wm-1',
        url: SandraImages.editorial.thinking,
        title: 'Self-Care Ritual',
        category: 'Wellness & Mindset',
        description: 'Natural textures and mindful items'
      },
      {
        id: 'wm-2',
        url: SandraImages.flatlays.beauty,
        title: 'Wellness Beauty',
        category: 'Wellness & Mindset',
        description: 'Mindful beauty routine setup'
      },
      {
        id: 'wm-3',
        url: SandraImages.journey.building,
        title: 'Growth Journey',
        category: 'Wellness & Mindset',
        description: 'Personal development aesthetic'
      }
    ]
  },
  {
    id: 'business-professional',
    name: 'Business Professional',
    description: 'Laptop flatlays, planning materials, office aesthetics',
    aesthetic: 'Professional productivity with style',
    backgroundImage: SandraImages.flatlays.workspace1,
    images: [
      {
        id: 'bp-1',
        url: SandraImages.flatlays.workspace1,
        title: 'Business Setup',
        category: 'Business Professional',
        description: 'Stylish productivity flatlay'
      },
      {
        id: 'bp-2',
        url: SandraImages.flatlays.planning,
        title: 'Strategic Planning',
        category: 'Business Professional',
        description: 'Professional planning materials'
      },
      {
        id: 'bp-3',
        url: SandraImages.editorial.laptop1,
        title: 'Executive Workspace',
        category: 'Business Professional',
        description: 'Professional laptop workspace'
      }
    ]
  },
  {
    id: 'pink-girly',
    name: 'Pink & Girly',
    description: 'Soft feminine flatlays, beauty products, flowers',
    aesthetic: 'Feminine and romantic styling',
    backgroundImage: SandraImages.flatlays.beauty,
    images: [
      {
        id: 'pg-1',
        url: SandraImages.flatlays.beauty,
        title: 'Feminine Beauty',
        category: 'Pink & Girly',
        description: 'Soft pink feminine flatlay'
      },
      {
        id: 'pg-2',
        url: SandraImages.editorial.laughing,
        title: 'Joy & Confidence',
        category: 'Pink & Girly',
        description: 'Feminine confidence energy'
      },
      {
        id: 'pg-3',
        url: SandraImages.editorial.mirror,
        title: 'Beauty Transformation',
        category: 'Pink & Girly',
        description: 'Feminine transformation moment'
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
        backgroundImage={SandraImages.flatlays.workspace1}
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

          {/* Collection Grid - Image Buttons with Text Overlay */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '30px',
            marginBottom: '80px'
          }}>
            {flatlayCollections.map((collection) => (
              <button
                key={collection.id}
                onClick={() => setSelectedCollection(collection)}
                style={{
                  position: 'relative',
                  height: '280px',
                  border: selectedCollection.id === collection.id ? '3px solid #0a0a0a' : '1px solid #e5e5e5',
                  cursor: 'pointer',
                  transition: 'all 300ms ease',
                  background: 'transparent',
                  padding: '0',
                  overflow: 'hidden'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.02)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              >
                {/* Background Image */}
                <div style={{
                  position: 'absolute',
                  top: '0',
                  left: '0',
                  width: '100%',
                  height: '100%',
                  backgroundImage: `url(${collection.backgroundImage})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  filter: selectedCollection.id === collection.id ? 'brightness(1)' : 'brightness(0.75)'
                }} />
                
                {/* Text Overlay */}
                <div style={{
                  position: 'absolute',
                  bottom: '0',
                  left: '0',
                  right: '0',
                  background: 'linear-gradient(transparent, rgba(0,0,0,0.85))',
                  padding: '50px 30px 25px',
                  color: '#ffffff',
                  textAlign: 'center'
                }}>
                  <h3 style={{
                    fontFamily: 'Times New Roman, serif',
                    fontSize: '1.5rem',
                    fontWeight: 200,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    marginBottom: '12px',
                    color: '#ffffff'
                  }}>
                    {collection.name}
                  </h3>
                  <p style={{
                    fontSize: '14px',
                    opacity: 0.9,
                    marginBottom: '8px',
                    lineHeight: 1.4,
                    color: '#ffffff'
                  }}>
                    {collection.description}
                  </p>
                  <div style={{
                    fontSize: '12px',
                    opacity: 0.7,
                    fontStyle: 'italic',
                    color: '#ffffff'
                  }}>
                    {collection.aesthetic}
                  </div>
                </div>
                
                {/* Selection Indicator */}
                {selectedCollection.id === collection.id && (
                  <div style={{
                    position: 'absolute',
                    top: '15px',
                    right: '15px',
                    background: '#ffffff',
                    color: '#0a0a0a',
                    padding: '5px 12px',
                    fontSize: '12px',
                    fontWeight: 600,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase'
                  }}>
                    SELECTED
                  </div>
                )}
              </button>
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
              <strong>Upload Location:</strong> Create folder: <code>/public/flatlays/{selectedCollection.id}/</code>
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
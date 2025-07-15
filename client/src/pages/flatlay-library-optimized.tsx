import { useState, useCallback } from 'react';
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { HeroFullBleed } from '@/components/HeroFullBleed';
import { MemberNavigation } from '@/components/member-navigation';
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

// Streamlined Flatlay Collections Data Structure
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
        url: 'https://i.postimg.cc/kXrtFNKH/file-45.png',
        title: 'Planning Flatlay',
        category: 'Luxury Minimal',
        description: 'Clean sophisticated lifestyle flatlay'
      },
      {
        id: 'lm-5',
        url: 'https://i.postimg.cc/htszBH6F/file-47.png',
        title: 'Executive Setup',
        category: 'Luxury Minimal',
        description: 'Clean sophisticated lifestyle flatlay'
      }
    ]
  },
  {
    id: 'editorial-magazine',
    name: 'Editorial Magazine',
    description: 'High-fashion editorial styling with designer elements',
    aesthetic: 'Sophisticated editorial photography with designer accessories',
    backgroundImage: 'https://i.postimg.cc/8CPpLQW8/Editorial-Magazine1.png',
    images: [
      {
        id: 'em-1',
        url: 'https://i.postimg.cc/8CPpLQW8/Editorial-Magazine1.png',
        title: 'Editorial Magazine 1',
        category: 'Editorial Magazine',
        description: 'High-fashion editorial flatlay'
      },
      {
        id: 'em-2',
        url: 'https://i.postimg.cc/DyGdCKFW/Editorial-Magazine2.png',
        title: 'Editorial Magazine 2',
        category: 'Editorial Magazine',
        description: 'High-fashion editorial flatlay'
      },
      {
        id: 'em-3',
        url: 'https://i.postimg.cc/ncNhp0ML/Editorial-Magazine3.png',
        title: 'Editorial Magazine 3',
        category: 'Editorial Magazine',
        description: 'High-fashion editorial flatlay'
      },
      {
        id: 'em-4',
        url: 'https://i.postimg.cc/G2M7MBq5/Editorial-Magazine4.png',
        title: 'Editorial Magazine 4',
        category: 'Editorial Magazine',
        description: 'High-fashion editorial flatlay'
      },
      {
        id: 'em-5',
        url: 'https://i.postimg.cc/wTtq8LxP/Editorial-Magazine5.png',
        title: 'Editorial Magazine 5',
        category: 'Editorial Magazine',
        description: 'High-fashion editorial flatlay'
      }
    ]
  },
  {
    id: 'pink-girly',
    name: 'Pink & Girly',
    description: 'Feminine pink aesthetics with romantic elements',
    aesthetic: 'Romantic femininity with soft pink tones and delicate styling',
    backgroundImage: 'https://i.postimg.cc/G2k5wV0P/Pink-Girly1.png',
    images: [
      {
        id: 'pg-1',
        url: 'https://i.postimg.cc/G2k5wV0P/Pink-Girly1.png',
        title: 'Pink & Girly 1',
        category: 'Pink & Girly',
        description: 'Feminine pink aesthetic flatlay'
      },
      {
        id: 'pg-2',
        url: 'https://i.postimg.cc/g0RqcNTC/Pink-Girly2.png',
        title: 'Pink & Girly 2',
        category: 'Pink & Girly',
        description: 'Feminine pink aesthetic flatlay'
      },
      {
        id: 'pg-3',
        url: 'https://i.postimg.cc/DyNV4YyG/Pink-Girly3.png',
        title: 'Pink & Girly 3',
        category: 'Pink & Girly',
        description: 'Feminine pink aesthetic flatlay'
      },
      {
        id: 'pg-4',
        url: 'https://i.postimg.cc/zBzCMPqm/Pink-Girly4.png',
        title: 'Pink & Girly 4',
        category: 'Pink & Girly',
        description: 'Feminine pink aesthetic flatlay'
      },
      {
        id: 'pg-5',
        url: 'https://i.postimg.cc/7Z0XhWKw/Pink-Girly5.png',
        title: 'Pink & Girly 5',
        category: 'Pink & Girly',
        description: 'Feminine pink aesthetic flatlay'
      }
    ]
  },
  {
    id: 'cream-aesthetic',
    name: 'Cream Aesthetic',
    description: 'Neutral tones and minimalist elegance',
    aesthetic: 'Soft neutral palette with elegant minimalist styling',
    backgroundImage: 'https://i.postimg.cc/SxPGYKSF/Cream-Aesthetic1.png',
    images: [
      {
        id: 'ca-1',
        url: 'https://i.postimg.cc/SxPGYKSF/Cream-Aesthetic1.png',
        title: 'Cream Aesthetic 1',
        category: 'Cream Aesthetic',
        description: 'Neutral cream aesthetic flatlay'
      },
      {
        id: 'ca-2',
        url: 'https://i.postimg.cc/WbBrByG8/Cream-Aesthetic2.png',
        title: 'Cream Aesthetic 2',
        category: 'Cream Aesthetic',
        description: 'Neutral cream aesthetic flatlay'
      },
      {
        id: 'ca-3',
        url: 'https://i.postimg.cc/XYSZs25T/Cream-Aesthetic3.png',
        title: 'Cream Aesthetic 3',
        category: 'Cream Aesthetic',
        description: 'Neutral cream aesthetic flatlay'
      },
      {
        id: 'ca-4',
        url: 'https://i.postimg.cc/9fhzFz0b/Cream-Aesthetic4.png',
        title: 'Cream Aesthetic 4',
        category: 'Cream Aesthetic',
        description: 'Neutral cream aesthetic flatlay'
      },
      {
        id: 'ca-5',
        url: 'https://i.postimg.cc/y8w3G5bj/Cream-Aesthetic5.png',
        title: 'Cream Aesthetic 5',
        category: 'Cream Aesthetic',
        description: 'Neutral cream aesthetic flatlay'
      }
    ]
  },
  {
    id: 'fitness-health',
    name: 'Fitness & Health',
    description: 'Active lifestyle and wellness focused imagery',
    aesthetic: 'Energetic health and fitness lifestyle aesthetics',
    backgroundImage: 'https://i.postimg.cc/6qp9dq4Z/Fitness-Aesthetic1.png',
    images: [
      {
        id: 'fh-1',
        url: 'https://i.postimg.cc/6qp9dq4Z/Fitness-Aesthetic1.png',
        title: 'Fitness & Health 1',
        category: 'Fitness & Health',
        description: 'Fitness & Health aesthetic flatlay'
      },
      {
        id: 'fh-2',
        url: 'https://i.postimg.cc/Y9XdK0L4/Fitness-Aesthetic2.png',
        title: 'Fitness & Health 2',
        category: 'Fitness & Health',
        description: 'Fitness & Health aesthetic flatlay'
      },
      {
        id: 'fh-3',
        url: 'https://i.postimg.cc/j2wNQdpP/Fitness-Aesthetic3.png',
        title: 'Fitness & Health 3',
        category: 'Fitness & Health',
        description: 'Fitness & Health aesthetic flatlay'
      },
      {
        id: 'fh-4',
        url: 'https://i.postimg.cc/CLB4zSFD/Fitness-Aesthetic4.png',
        title: 'Fitness & Health 4',
        category: 'Fitness & Health',
        description: 'Fitness & Health aesthetic flatlay'
      },
      {
        id: 'fh-5',
        url: 'https://i.postimg.cc/Qxjghn3X/Fitness-Aesthetic5.png',
        title: 'Fitness & Health 5',
        category: 'Fitness & Health',
        description: 'Fitness & Health aesthetic flatlay'
      }
    ]
  }
];

export default function FlatlayLibrary() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedCollectionId, setSelectedCollectionId] = useState('luxury-minimal');
  const [fullSizeImage, setFullSizeImage] = useState<string | null>(null);

  const selectedCollection = flatlayCollections.find(c => c.id === selectedCollectionId) || flatlayCollections[0];

  const saveToGallery = useCallback(async (imageUrl: string, imageTitle: string) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to save images to your gallery.",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch('/api/save-to-gallery', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          imageUrl,
          imageTitle,
          imageDescription: `${imageTitle} from ${selectedCollection.name} collection`,
          category: selectedCollection.name,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save image');
      }

      toast({
        title: "Image Saved",
        description: `${imageTitle} has been saved to your gallery.`,
      });

      // Invalidate gallery queries to refresh the data
      queryClient.invalidateQueries({ queryKey: ['/api/ai-images'] });
    } catch (error) {
      console.error('Error saving image to gallery:', error);
      toast({
        title: "Save Failed",
        description: "There was an error saving the image. Please try again.",
        variant: "destructive",
      });
    }
  }, [user, selectedCollection.name, toast, queryClient]);

  return (
    <div className="min-h-screen bg-white">
      <MemberNavigation />
      
      {/* Hero Section */}
      <HeroFullBleed
        imageUrl={selectedCollection.backgroundImage}
        title="Flatlay Library"
        subtitle="Curated lifestyle collections for your brand"
        className="h-[50vh]"
      />

      {/* Collections Navigation */}
      <div className="py-16 px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-serif text-3xl font-light tracking-wide mb-4">
              Choose Your Aesthetic
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Select from our curated collections of professional flatlays to complement your AI selfies.
            </p>
          </div>

          {/* Collection Selector */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-16">
            {flatlayCollections.map((collection) => (
              <button
                key={collection.id}
                onClick={() => setSelectedCollectionId(collection.id)}
                className={`relative overflow-hidden aspect-square group ${
                  selectedCollectionId === collection.id 
                    ? 'ring-2 ring-black' 
                    : 'hover:ring-1 hover:ring-gray-300'
                }`}
              >
                <img
                  src={collection.backgroundImage}
                  alt={collection.name}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black bg-opacity-40 flex items-end p-4">
                  <div className="text-white">
                    <div className="text-sm font-medium">{collection.name}</div>
                    <div className="text-xs opacity-75">{collection.images.length} images</div>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Selected Collection Info */}
          <div className="text-center mb-12">
            <h3 className="font-serif text-2xl font-light mb-2">{selectedCollection.name}</h3>
            <p className="text-gray-600 mb-2">{selectedCollection.description}</p>
            <p className="text-sm text-gray-500 italic">{selectedCollection.aesthetic}</p>
          </div>

          {/* Images Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {selectedCollection.images.map((image) => (
              <div key={image.id} className="group cursor-pointer">
                <div className="relative overflow-hidden aspect-square bg-gray-100">
                  <img
                    src={image.url}
                    alt={image.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    onClick={() => setFullSizeImage(image.url)}
                  />
                  
                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-300 flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          saveToGallery(image.url, image.title);
                        }}
                        className="bg-white text-black px-4 py-2 text-sm font-medium hover:bg-gray-100 transition-colors"
                      >
                        Save to Gallery
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-black">{image.title}</h4>
                  <p className="text-xs text-gray-500 mt-1">{image.description}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Collection Stats */}
          <div className="text-center py-8 border-t border-gray-100 mt-16">
            <p className="text-sm text-gray-500">
              {selectedCollection.images.length} professional flatlays in {selectedCollection.name} collection
            </p>
          </div>
        </div>
      </div>

      {/* Full Size Image Modal */}
      {fullSizeImage && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4"
          onClick={() => setFullSizeImage(null)}
        >
          <div className="relative max-w-4xl max-h-full">
            <img 
              src={fullSizeImage}
              alt="Full size flatlay"
              className="max-w-full max-h-full object-contain"
              onClick={(e) => e.stopPropagation()}
            />
            <button 
              onClick={() => setFullSizeImage(null)}
              className="absolute top-4 right-4 bg-black text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-gray-700 transition-colors"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
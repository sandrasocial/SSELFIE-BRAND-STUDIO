import { useState, useCallback, useMemo } from 'react';
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { HeroFullBleed } from '@/components/HeroFullBleed';
import MemberNavigation from '@/components/member-navigation';
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

// Simplified test collections
const testCollections: FlatlayCollection[] = [
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
        description: 'Luxury Minimal flatlay'
      }
    ]
  }
];

export default function FlatlayLibraryTest() {
  const { isAuthenticated, user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [selectedCollection, setSelectedCollection] = useState<FlatlayCollection>(testCollections[0]);
  const [fullSizeImage, setFullSizeImage] = useState<string | null>(null);

  // Fetch user subscription to check plan
  const { data: subscription } = useQuery({
    queryKey: ['/api/subscription'],
    enabled: isAuthenticated
  });

  const isPremiumUser = subscription?.plan === 'sselfie-studio' || user?.plan === 'admin' || user?.email === 'ssa@ssasocial.com';

  // Save flatlay to gallery
  const saveToGallery = useCallback(async (imageUrl: string, imageTitle: string) => {
    try {
      const response = await fetch('/api/save-selected-images', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
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

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-serif text-black mb-4">Please Log In</h1>
          <p className="text-gray-600">You need to be logged in to access the flatlay library.</p>
        </div>
      </div>
    );
  }

  if (!isPremiumUser) {
    return (
      <div className="min-h-screen bg-white">
        <MemberNavigation />
        
        <div className="min-h-screen flex items-center justify-center px-4">
          <div className="text-center max-w-md">
            <div className="mb-8">
              <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                <span className="text-2xl">🔒</span>
              </div>
              <h1 className="text-2xl font-serif text-black mb-4">Premium Feature</h1>
              <p className="text-gray-600 mb-6">
                Flatlay collections are available for SSELFIE Studio subscribers. 
                Upgrade to access 900+ professional styled flatlays.
              </p>
            </div>
            
            <div className="space-y-4">
              <a
                href="/pricing"
                className="block w-full bg-black text-white py-3 px-6 text-sm uppercase tracking-wider hover:bg-gray-800 transition-colors"
              >
                Upgrade to Studio - $47/month
              </a>
              <a
                href="/workspace"
                className="block w-full border border-gray-300 text-black py-3 px-6 text-sm uppercase tracking-wider hover:bg-gray-50 transition-colors"
              >
                Back to Workspace
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <MemberNavigation />
      
      {/* Hero Section */}
      <HeroFullBleed
        backgroundImage={SandraImages.hero.flatlays}
        title="Flatlay Library"
        subtitle="Professional styled photography to complement your AI portraits"
        height="50vh"
        overlay="rgba(0,0,0,0.3)"
        textColor="white"
      />

      {/* Test Collection Display */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-serif font-light text-black mb-6">
            Test Collections (Working)
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
            This is a simplified test version with minimal data to ensure it loads properly.
          </p>
        </div>

        {/* Collection Navigation */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {testCollections.map((collection) => (
            <div
              key={collection.id}
              onClick={() => setSelectedCollection(collection)}
              className={`cursor-pointer group transition-all duration-300 ${
                selectedCollection.id === collection.id
                  ? 'ring-2 ring-black'
                  : 'hover:ring-1 hover:ring-gray-300'
              }`}
            >
              <div className="aspect-square bg-gray-100 overflow-hidden">
                <img
                  src={collection.backgroundImage}
                  alt={collection.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <div className="p-6 bg-white">
                <h3 className="font-serif text-xl text-black mb-2">{collection.name}</h3>
                <p className="text-sm text-gray-600 mb-3">{collection.description}</p>
                <p className="text-xs text-gray-500 italic">{collection.aesthetic}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Selected Collection Images */}
        <div className="mb-12">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-serif font-light text-black mb-3">
              {selectedCollection.name}
            </h3>
            <p className="text-gray-600">{selectedCollection.description}</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {selectedCollection.images.map((image) => (
              <div
                key={image.id}
                className="group relative aspect-square bg-gray-100 overflow-hidden cursor-pointer"
                onClick={() => setFullSizeImage(image.url)}
              >
                <img
                  src={image.url}
                  alt={image.title}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-300 flex items-end p-4">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        saveToGallery(image.url, image.title);
                      }}
                      className="bg-white text-black px-3 py-1 text-xs font-medium hover:bg-gray-100 transition-colors"
                    >
                      Save to Gallery
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Collection Stats */}
        <div className="text-center py-8 border-t border-gray-100">
          <p className="text-sm text-gray-500">
            {selectedCollection.images.length} test images in {selectedCollection.name} collection
          </p>
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
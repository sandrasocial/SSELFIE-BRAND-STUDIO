import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useLocation } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface UserSelfie {
  id: number;
  url: string;
  style: string;
  createdAt: string;
  isSelected: boolean;
}

interface FlatlayCollection {
  name: string;
  images: string[];
}

interface UserGallery {
  userSelfies: UserSelfie[];
  flatlayCollections: FlatlayCollection[];
  totalSelfies: number;
  totalFlatlays: number;
}

export default function PhotoSelection() {
  const [location, setLocation] = useLocation();
  const [selectedSelfies, setSelectedSelfies] = useState<number[]>([]);
  const [selectedFlatlayCollection, setSelectedFlatlayCollection] = useState<string>('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch user's photo gallery
  const { data: userGallery, isLoading } = useQuery<UserGallery>({
    queryKey: ['/api/user-gallery'],
    retry: false,
  });

  // Save photo selections mutation
  const saveSelectionsMutation = useMutation({
    mutationFn: async (selections: { selfieIds: number[], flatlayCollection: string }) => {
      return apiRequest('POST', '/api/save-photo-selections', selections);
    },
    onSuccess: () => {
      toast({
        title: "Photo Selection Saved",
        description: "Your favorite photos have been saved for template customization.",
      });
      // Redirect to brand onboarding after photo selection
      setLocation('/brand-onboarding');
    },
    onError: (error) => {
      toast({
        title: "Save Failed",
        description: "Failed to save photo selections. Please try again.",
        
      });
    },
  });

  const handleSelfieToggle = (selfieId: number) => {
    setSelectedSelfies(prev => {
      if (prev.includes(selfieId)) {
        return prev.filter(id => id !== selfieId);
      } else if (prev.length < 5) { // Max 5 selfies for landing page
        return [...prev, selfieId];
      } else {
        toast({
          title: "Selection Limit",
          description: "Please select maximum 5 selfies for your landing page.",
          
        });
        return prev;
      }
    });
  };

  const handleSaveSelections = () => {
    if (selectedSelfies.length === 0) {
      toast({
        title: "No Photos Selected",
        description: "Please select at least 1 selfie for your landing page.",
        
      });
      return;
    }

    saveSelectionsMutation.mutate({
      selfieIds: selectedSelfies,
      flatlayCollection: selectedFlatlayCollection || 'Luxury Minimal'
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center" style={{ fontFamily: 'Times New Roman, serif' }}>
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Loading your photo gallery...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: 'Times New Roman, serif' }}>
      {/* Header */}
      <div className="bg-gray-50 border-b border-gray-200 px-8 py-6">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-light text-black mb-2">Select Your Favorite Photos</h1>
          <p className="text-gray-600 font-light">
            Choose your best selfies and flatlay style for your personalized landing page template
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-8 py-8">
        {/* Your AI Selfies Section */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-light text-black">Your AI Selfies</h2>
            <div className="text-sm text-gray-500">
              {selectedSelfies.length} of 5 selected
            </div>
          </div>

          {userGallery?.userSelfies && userGallery.userSelfies.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {userGallery.userSelfies.slice(0, 20).map((selfie) => (
                <div
                  key={selfie.id}
                  className={`relative cursor-pointer transition-all duration-200 ${
                    selectedSelfies.includes(selfie.id)
                      ? 'ring-4 ring-black ring-offset-2'
                      : 'hover:ring-2 hover:ring-gray-300 hover:ring-offset-2'
                  }`}
                  onClick={() => handleSelfieToggle(selfie.id)}
                >
                  <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                    <img
                      src={selfie.url}
                      alt={`Selfie ${selfie.id}`}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                  {selectedSelfies.includes(selfie.id) && (
                    <div className="absolute top-2 right-2 w-6 h-6 bg-black rounded-full flex items-center justify-center">
                      <span className="text-white text-xs">✓</span>
                    </div>
                  )}
                  <div className="absolute bottom-2 left-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                    {selfie.style}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <p className="text-gray-500 mb-4">No AI selfies found</p>
              <Link href="/maya" className="text-black hover:underline">
                Generate your first AI selfies with Maya →
              </Link>
            </div>
          )}
        </div>

        {/* Flatlay Collections Section */}
        <div className="mb-12">
          <h2 className="text-2xl font-light text-black mb-6">Choose Flatlay Style</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {userGallery?.flatlayCollections?.map((collection) => (
              <div
                key={collection.name}
                className={`cursor-pointer transition-all duration-200 ${
                  selectedFlatlayCollection === collection.name
                    ? 'ring-4 ring-black ring-offset-2'
                    : 'hover:ring-2 hover:ring-gray-300 hover:ring-offset-2'
                }`}
                onClick={() => setSelectedFlatlayCollection(collection.name)}
              >
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-light text-black mb-3">{collection.name}</h3>
                  <div className="grid grid-cols-3 gap-2">
                    {collection.images.slice(0, 3).map((image, index) => (
                      <div key={index} className="aspect-square bg-gray-100 rounded overflow-hidden">
                        <img
                          src={image}
                          alt={`${collection.name} ${index + 1}`}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      </div>
                    ))}
                  </div>
                  {selectedFlatlayCollection === collection.name && (
                    <div className="mt-3 text-center">
                      <span className="text-sm text-black">Selected ✓</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between border-t border-gray-200 pt-8">
          <Link
            href="/workspace"
            className="text-gray-600 hover:text-black transition-colors"
          >
            ← Back to Workspace
          </Link>
          
          <button
            onClick={handleSaveSelections}
            disabled={selectedSelfies.length === 0 || saveSelectionsMutation.isPending}
            className="bg-black text-white px-8 py-3 rounded hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saveSelectionsMutation.isPending ? 'Saving...' : 'Continue to Brand Story'}
          </button>
        </div>
      </div>
    </div>
  );
}
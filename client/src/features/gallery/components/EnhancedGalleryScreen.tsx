import React, { useState } from 'react';
import { Heart, Grid, Camera, Share2, MoreHorizontal, MessageCircle } from 'lucide-react';
import { useAuth } from '../../../hooks/use-auth.js';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '../../../lib/api.js';
import { apiRequest } from '../../../lib/queryClient.js';

interface GalleryImage {
  id: string | number;
  url?: string;
  imageUrl?: string;
  title?: string;
  category?: string;
}

const EnhancedGalleryScreen: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const [galleryView, setGalleryView] = useState<'instagram' | 'all'>('instagram');
  const [favorites, setFavorites] = useState<Set<string | number>>(new Set());
  const qc = useQueryClient();

  const { data: aiImagesData } = useQuery({
    queryKey: ['/api/gallery-images'],
    enabled: isAuthenticated && !!user,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    queryFn: async () => {
      const data = await apiFetch('/gallery-images');
      return Array.isArray(data) ? data : (data?.images || []);
    }
  });
  const allImages: GalleryImage[] = Array.isArray(aiImagesData) ? aiImagesData : [];

  const { data: favoritesData } = useQuery({
    queryKey: ['/api/images/favorites'],
    enabled: isAuthenticated && !!user,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
  const favoritesArray: number[] = Array.isArray((favoritesData as any)?.favorites) ? (favoritesData as any).favorites : [];

  const toggleFavoriteMutation = useMutation({
    mutationFn: async (imageId: number) => apiRequest(`/api/images/${imageId}/favorite`, 'POST'),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['/api/images/favorites'] })
  });

  const toggleFavorite = (imageId: string | number) => {
    const numericId = typeof imageId === 'string' ? parseInt(imageId, 10) : imageId;
    const newFavorites = new Set(favorites);
    if (newFavorites.has(imageId)) {
      newFavorites.delete(imageId);
    } else {
      newFavorites.add(imageId);
    }
    setFavorites(newFavorites);
    toggleFavoriteMutation.mutate(numericId);
  };

  const favoritedImages = allImages.filter(img => favoritesArray.includes(typeof img.id === 'string' ? parseInt(img.id, 10) : img.id));

  if (galleryView === 'instagram') {
    return (
      <div className="space-y-6 pb-4">
        <div className="pt-4">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl sm:text-3xl font-serif font-extralight tracking-[0.3em] text-stone-950 uppercase">
              Gallery
            </h1>
            <button
              onClick={() => setGalleryView('all')}
              className="px-4 py-2 text-xs tracking-[0.15em] uppercase font-light bg-stone-100/50 border border-stone-200/40 rounded-xl hover:bg-stone-100/70 transition-all duration-200"
            >
              All Images
            </button>
          </div>
        </div>

        <div className="bg-stone-100/40 rounded-3xl p-6 sm:p-8 border border-stone-200/40">
          <div className="flex items-center gap-6 mb-6">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden border-2 border-stone-300/60 flex-shrink-0">
              <img
                src={user?.profileImageUrl || 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face'}
                alt={user?.displayName || 'User'}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1">
              <h2 className="text-lg sm:text-xl font-light tracking-wide text-stone-950 mb-2">{user?.displayName || 'Your Name'}</h2>
              <p className="text-xs font-light text-stone-600">Your curated AI photo collection</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-6 mb-6 pb-6 border-b border-stone-200/40">
            <div className="text-center">
              <div className="text-xl sm:text-2xl font-light text-stone-950 mb-1">{favoritedImages.length}</div>
              <div className="text-xs tracking-[0.1em] uppercase font-light text-stone-500">Posts</div>
            </div>
            <div className="text-center">
              <div className="text-xl sm:text-2xl font-light text-stone-950 mb-1">3.2k</div>
              <div className="text-xs tracking-[0.1em] uppercase font-light text-stone-500">Followers</div>
            </div>
            <div className="text-center">
              <div className="text-xl sm:text-2xl font-light text-stone-950 mb-1">428</div>
              <div className="text-xs tracking-[0.1em] uppercase font-light text-stone-500">Following</div>
            </div>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2">
            {['All', 'Close-Up', 'Half Body', 'Full Scenery', 'Flatlay'].map((category) => (
              <button
                key={category}
                className="px-4 py-2 text-xs tracking-[0.1em] uppercase font-light bg-stone-50 border border-stone-200/40 rounded-full hover:bg-stone-100 transition-all duration-200 whitespace-nowrap flex-shrink-0"
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {favoritedImages.length > 0 ? (
          <div className="grid grid-cols-3 gap-1">
            {favoritedImages.map((image) => (
              <div key={image.id} className="aspect-square relative group overflow-hidden bg-stone-200/30">
                <img
                  src={image.imageUrl || image.url || ''}
                  alt={`Gallery ${image.id}`}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-stone-950/0 group-hover:bg-stone-950/30 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <div className="flex items-center gap-4 text-stone-50">
                    <div className="flex items-center gap-1">
                      <Heart size={16} fill="currentColor" strokeWidth={1.5} />
                      <span className="text-sm font-light">{Math.floor(Math.random() * 500)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MessageCircle size={16} strokeWidth={1.5} />
                      <span className="text-sm font-light">{Math.floor(Math.random() * 50)}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-stone-100/40 rounded-3xl p-12 text-center border border-stone-200/40">
            <Heart size={48} className="mx-auto mb-6 text-stone-400" strokeWidth={1.5} />
            <h3 className="text-xl font-serif font-extralight tracking-[0.15em] text-stone-950 uppercase mb-3">
              No Favorites Yet
            </h3>
            <p className="text-sm font-light text-stone-600 mb-6">
              Heart your favorite images in the All Images view to build your Instagram feed
            </p>
            <button
              onClick={() => setGalleryView('all')}
              className="px-8 py-3 bg-stone-950 text-stone-50 rounded-2xl font-light tracking-[0.15em] uppercase text-sm transition-all duration-200 hover:bg-stone-800"
            >
              Browse All Images
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-4">
      <div className="pt-4">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl sm:text-3xl font-serif font-extralight tracking-[0.3em] text-stone-950 uppercase">
            All Images
          </h1>
          <button
            onClick={() => setGalleryView('instagram')}
            className="px-4 py-2 text-xs tracking-[0.15em] uppercase font-light bg-stone-100/50 border border-stone-200/40 rounded-xl hover:bg-stone-100/70 transition-all duration-200"
          >
            Instagram Feed
          </button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total', value: allImages.length, icon: Grid },
          { label: 'Favorited', value: favoritesArray.length, icon: Heart },
          { label: 'Close-Up', value: allImages.filter(i => i.category === 'close-up').length, icon: Camera },
          { label: 'Scenery', value: allImages.filter(i => i.category === 'full-scenery').length, icon: Camera }
        ].map((stat, i) => (
          <div key={i} className="group bg-white/50 backdrop-blur-2xl border border-white/60 rounded-[1.5rem] p-4 text-center shadow-xl shadow-stone-900/10 hover:shadow-2xl hover:shadow-stone-900/20 hover:scale-105 transition-all duration-300">
            <div className="w-11 h-11 bg-stone-950 rounded-[1rem] flex items-center justify-center mx-auto mb-3 shadow-lg group-hover:scale-110 transition-transform duration-300">
              <stat.icon size={18} className="text-white" strokeWidth={2.5} />
            </div>
            <div className="text-2xl font-bold text-stone-950 mb-1">{stat.value}</div>
            <div className="text-[10px] tracking-wider uppercase font-semibold text-stone-500">{stat.label}</div>
          </div>
        ))}
      </div>

      {['close-up', 'half-body', 'full-scenery', 'flatlay'].map((category) => {
        const categoryImages = allImages.filter(img => img.category === category);
        if (categoryImages.length === 0) return null;

        return (
          <div key={category} className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-serif font-extralight tracking-[0.15em] text-stone-950 uppercase">
                {category.replace('-', ' ')}
              </h3>
              <span className="text-xs tracking-[0.1em] uppercase font-light text-stone-500">
                {categoryImages.length} images
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {categoryImages.map((image) => {
                const numericId = typeof image.id === 'string' ? parseInt(image.id, 10) : image.id;
                const isFavorited = favoritesArray.includes(numericId);

                return (
                  <div key={image.id} className="relative group">
                    <div className="aspect-square overflow-hidden rounded-2xl border border-stone-200/40 bg-stone-200/30">
                      <img
                        src={image.imageUrl || image.url || ''}
                        alt={`${category} ${image.id}`}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>

                    <button
                      onClick={() => toggleFavorite(image.id)}
                      className={`absolute top-3 right-3 p-2.5 rounded-full backdrop-blur-xl transition-all duration-200 shadow-lg ${
                        isFavorited
                          ? 'bg-stone-950/80 text-stone-50'
                          : 'bg-white/70 text-stone-950 hover:bg-white/90 border border-white/80'
                      }`}
                    >
                      <Heart
                        size={18}
                        strokeWidth={1.8}
                        fill={isFavorited ? 'currentColor' : 'none'}
                        className="transition-all duration-200"
                      />
                    </button>

                    <div className="absolute bottom-3 left-3 px-3 py-1.5 bg-white/70 backdrop-blur-xl rounded-full border border-white/80 shadow-lg shadow-stone-900/10">
                      <span className="text-xs tracking-[0.1em] uppercase font-light text-stone-950">
                        {category.replace('-', ' ')}
                      </span>
                    </div>

                    <div className="absolute inset-0 bg-stone-950/0 group-hover:bg-stone-950/40 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100 rounded-2xl">
                      <div className="flex items-center gap-3">
                        <button className="p-3 bg-white/90 backdrop-blur-xl rounded-full hover:bg-white transition-colors shadow-lg border border-white">
                          <Share2 size={18} strokeWidth={1.8} className="text-stone-950" />
                        </button>
                        <button className="p-3 bg-white/90 backdrop-blur-xl rounded-full hover:bg-white transition-colors shadow-lg border border-white">
                          <MoreHorizontal size={18} strokeWidth={1.8} className="text-stone-950" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default EnhancedGalleryScreen;

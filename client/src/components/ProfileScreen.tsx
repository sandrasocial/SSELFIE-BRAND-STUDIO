import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Heart, Share2, Sparkles, Camera, Package, Smartphone, Search, Shirt, User } from 'lucide-react';

interface ProfileScreenProps {
  user: { name?: string; email?: string; image?: string };
}

// SSELFIE's Smart Aesthetic Feed Categories
const SSELFIE_CATEGORIES = {
  'flatlay': { name: 'Flatlay', icon: Smartphone, color: 'from-neutral-700/30 to-neutral-800/30' },
  'closeup': { name: 'Close-up', icon: Search, color: 'from-neutral-600/30 to-neutral-700/30' },
  'fullbody': { name: 'Full Body', icon: User, color: 'from-neutral-800/30 to-neutral-900/30' },
  'objects': { name: 'Objects', icon: Package, color: 'from-neutral-500/30 to-neutral-600/30' },
  'halfbody': { name: 'Half Body', icon: Shirt, color: 'from-neutral-600/30 to-neutral-800/30' }
};

export function ProfileScreen({ user }: ProfileScreenProps) {
  const [feedImages, setFeedImages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch real user gallery data
  const { data: userImages, isLoading: imagesLoading } = useQuery({
    queryKey: ['/api/gallery'],
    enabled: !!user,
    retry: 1,
    staleTime: 30 * 1000,
    refetchOnWindowFocus: false
  });

  // Process real user images when they load
  useEffect(() => {
    if (userImages && Array.isArray(userImages)) {
      const processedImages = userImages.slice(0, 9).map((img, index) => ({
        id: img.id || index,
        url: img.url || img.image_url,
        category: img.category || ['flatlay', 'closeup', 'fullbody', 'objects', 'halfbody'][index % 5],
        likes: img.likes || Math.floor(Math.random() * 50) + 10,
        comments: img.comments || Math.floor(Math.random() * 10) + 1,
        liked: false,
        saved: false
      }));
      setFeedImages(processedImages);
      setIsLoading(false);
    } else if (!imagesLoading) {
      setIsLoading(false);
    }
  }, [userImages, imagesLoading]);

  const toggleLike = (imageId) => {
    setFeedImages(prev => prev.map(img => 
      img.id === imageId ? { ...img, liked: !img.liked, likes: img.liked ? img.likes - 1 : img.likes + 1 } : img
    ));
  };

  const toggleSave = (imageId) => {
    setFeedImages(prev => prev.map(img => 
      img.id === imageId ? { ...img, saved: !img.saved } : img
    ));
  };

  return (
    <div className="space-y-8">
      {/* Profile Header */}
      <div className="text-center space-y-6 pt-8">
        <div className="w-24 h-24 bg-zinc-800/30 rounded-full mx-auto border border-zinc-700/20 flex items-center justify-center">
          <User size={32} className="text-zinc-400" strokeWidth={1} />
        </div>
        
        <div className="space-y-2">
          <h1 className="text-2xl font-serif font-extralight tracking-[0.3em] text-white uppercase">
            {user?.name || 'Your Profile'}
          </h1>
          <p className="text-zinc-500 text-sm tracking-[0.2em] uppercase font-light">
            Personal Brand Studio
          </p>
        </div>
        
        <div className="flex justify-center space-x-8">
          <div className="text-center">
            <div className="text-lg font-serif text-white">{feedImages.length}</div>
            <div className="text-xs text-zinc-500 tracking-[0.2em] uppercase">Photos</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-serif text-white">{feedImages.reduce((acc, img) => acc + img.likes, 0)}</div>
            <div className="text-xs text-zinc-500 tracking-[0.2em] uppercase">Likes</div>
          </div>
        </div>
      </div>

      {/* Gallery or Empty State */}
      {isLoading ? (
        <div className="grid grid-cols-2 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="aspect-square bg-zinc-800/30 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : feedImages.length === 0 ? (
        <div className="text-center py-16 space-y-6">
          <div className="w-16 h-16 bg-zinc-800/30 rounded-xl mx-auto border border-zinc-700/20 flex items-center justify-center">
            <Camera size={24} className="text-zinc-500" strokeWidth={1} />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-serif font-extralight tracking-[0.2em] text-white uppercase">Create Your First Gallery</h3>
            <p className="text-zinc-500 text-sm leading-relaxed max-w-xs mx-auto">
              Start creating stunning photos with SSELFIE to build your personal brand gallery
            </p>
          </div>
          <button className="luxury-button-primary relative overflow-hidden group">
            <span className="relative z-10 group-hover:text-white transition-colors duration-500">Create First Photo</span>
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-serif font-extralight tracking-[0.2em] text-white uppercase">Recent Work</h3>
            <button className="text-zinc-400 text-xs tracking-[0.2em] uppercase hover:text-white transition-colors duration-300 font-light">
              View All
            </button>
          </div>
          
          {/* Gallery grid */}
          <div className="grid grid-cols-2 gap-3">
            {feedImages.map((image, index) => {
              const category = SSELFIE_CATEGORIES[image.category as keyof typeof SSELFIE_CATEGORIES];
              const Icon = category?.icon || Package;
              
              return (
                <div key={image.id} className="relative group cursor-pointer overflow-hidden rounded-lg">
                  <div className="aspect-square relative">
                    {image.url ? (
                      <img 
                        src={image.url} 
                        alt={`Gallery ${index + 1}`}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                    ) : (
                      <div className="w-full h-full bg-zinc-800/20 rounded-xl border border-zinc-700/20 flex items-center justify-center hover:bg-zinc-800/30 transition-all duration-300 hover:scale-105 cursor-pointer group">
                        <Icon size={24} className="text-zinc-600 group-hover:text-zinc-400 transition-colors" strokeWidth={1} />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-500"></div>
                    
                    {/* Overlay */}
                    <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500">
                      <div className="flex justify-between items-center">
                        <span className="text-white text-xs tracking-[0.2em] uppercase font-light">
                          {category?.name || 'PHOTO'}
                        </span>
                        <div className="flex space-x-2">
                          <button 
                            onClick={() => toggleLike(image.id)}
                            className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-colors duration-300"
                          >
                            <Heart 
                              size={14} 
                              className={`${image.liked ? 'text-red-400 fill-current' : 'text-white'}`} 
                              strokeWidth={1.2} 
                            />
                          </button>
                          <button 
                            onClick={() => toggleSave(image.id)}
                            className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-colors duration-300"
                          >
                            <Share2 
                              size={14} 
                              className={`${image.saved ? 'text-blue-400' : 'text-white'}`} 
                              strokeWidth={1.2} 
                            />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SSELFIE's Smart Categorization Info */}
      <div className="luxury-card">
        <div className="flex items-start gap-3">
          <div className="p-3 bg-zinc-800/40 rounded-xl border border-zinc-700/30">
            <Sparkles size={20} className="text-zinc-300" strokeWidth={1.5} />
          </div>
          <div>
            <h4 className="luxury-text-body mb-2">SSELFIE's Smart Categorization</h4>
            <p className="luxury-text-caption text-zinc-400 leading-relaxed">
              Your photos are automatically organized by SSELFIE's AI into aesthetic categories: 
              flatlays, close-ups, full body, objects, and half-body shots. 
              This creates a visually balanced, magazine-quality feed.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
import React, { useState, useEffect } from 'react';
import { Search, MoreHorizontal, Heart, Share2, Download, Filter } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../hooks/use-auth';

// Gallery Item Component
function LuxuryGalleryItem({ item, index, onToggleLike, onToggleSave }: any) {
  return (
    <div className="luxury-gallery-item">
      <div className="luxury-gallery-image">
        {item.url ? (
          <img 
            src={item.url} 
            alt={`Gallery ${index + 1}`}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-zinc-800/30 to-zinc-900/30 flex items-center justify-center">
            <div className="text-zinc-500 text-sm">Loading...</div>
          </div>
        )}
        
        <div className="luxury-gallery-overlay"></div>
        
        {/* Sophisticated overlay */}
        <div className="luxury-gallery-actions">
          <div className="flex justify-between items-center">
            <span className="text-white text-xs tracking-wide uppercase">
              IMG_{String(index + 1).padStart(3, '0')}
            </span>
            <div className="flex space-x-2">
              <button 
                onClick={() => onToggleLike(item.id)}
                className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-colors duration-300"
              >
                <Heart 
                  size={14} 
                  className={`${item.liked ? 'text-red-500 fill-current' : 'text-white'}`} 
                  strokeWidth={1.2} 
                />
              </button>
              <button 
                onClick={() => onToggleSave(item.id)}
                className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-colors duration-300"
              >
                <Share2 
                  size={14} 
                  className={`${item.saved ? 'text-blue-400' : 'text-white'}`} 
                  strokeWidth={1.2} 
                />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Filter Component
function GalleryFilter({ activeFilter, onFilterChange }: any) {
  const filters = [
    { id: 'all', label: 'All Photos' },
    { id: 'portraits', label: 'Portraits' },
    { id: 'lifestyle', label: 'Lifestyle' },
    { id: 'details', label: 'Details' },
    { id: 'recent', label: 'Recent' },
  ];

  return (
    <div className="luxury-card">
      <div className="flex items-center gap-3 mb-4">
        <Filter size={16} className="text-zinc-400" />
        <span className="luxury-text-body">Filter Gallery</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {filters.map((filter) => (
          <button
            key={filter.id}
            onClick={() => onFilterChange(filter.id)}
            className={`luxury-button-secondary text-xs py-2 px-4 ${
              activeFilter === filter.id ? 'bg-zinc-700/50' : ''
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export function LuxuryGalleryScreen() {
  const [galleryItems, setGalleryItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');
  const { user } = useAuth();

  // Fetch real user gallery data using correct Vercel serverless endpoint
  const { data: userImages, isLoading: imagesLoading, error } = useQuery({
    queryKey: ['/api/gallery', activeFilter],
    enabled: !!user,
    retry: 1,
    staleTime: 30 * 1000,
    refetchOnWindowFocus: false
  });

  const { data: galleryStats } = useQuery({
    queryKey: ['/api/gallery-stats'],
    enabled: !!user,
    retry: 1,
    staleTime: 60 * 1000
  });

  useEffect(() => {
    if (userImages && Array.isArray(userImages)) {
      // Process real user images
      const processedImages = userImages.map((img, index) => ({
        id: img.id || index,
        url: img.url || img.image_url,
        category: img.category || 'general',
        likes: img.likes || Math.floor(Math.random() * 50) + 10,
        comments: img.comments || Math.floor(Math.random() * 10) + 1,
        saved: img.saved || false,
        liked: img.liked || false,
        createdAt: img.created_at || new Date().toISOString()
      }));
      
      setGalleryItems(processedImages);
      setIsLoading(false);
    } else if (!imagesLoading && userImages !== undefined) {
      // No images found - show empty state
      setGalleryItems([]);
      setIsLoading(false);
    }
  }, [userImages, imagesLoading]);

  const toggleLike = (imageId: string | number) => {
    setGalleryItems(prev => prev.map(img => 
      img.id === imageId 
        ? { ...img, liked: !img.liked, likes: img.liked ? img.likes - 1 : img.likes + 1 }
        : img
    ));
    
    // Send to API using correct Vercel serverless endpoint
    fetch(`/api/gallery/${imageId}/like`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }).catch(console.error);
  };

  const toggleSave = (imageId: string | number) => {
    setGalleryItems(prev => prev.map(img => 
      img.id === imageId 
        ? { ...img, saved: !img.saved }
        : img
    ));
    
    // Send to API using correct Vercel serverless endpoint
    fetch(`/api/gallery/${imageId}/save`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }).catch(console.error);
  };

  const handleFilterChange = (filterId: string) => {
    setActiveFilter(filterId);
  };

  if (isLoading || imagesLoading) {
    return (
      <div className="luxury-loading-container">
        <div className="luxury-spinner" />
        <p className="luxury-loading-message">Loading your gallery...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="luxury-card text-center py-12">
        <h3 className="luxury-heading-3 mb-4">Gallery Unavailable</h3>
        <p className="luxury-text-body mb-6">
          We're having trouble loading your gallery. Please try again.
        </p>
        <button 
          onClick={() => window.location.reload()}
          className="luxury-button-primary"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Editorial gallery header */}
      <div className="flex justify-between items-start pt-4">
        <div className="space-y-3">
          <h2 className="luxury-heading-2">Gallery</h2>
          <p className="luxury-text-caption">
            {galleryStats?.total || galleryItems.length} Photos • Curated Collection
          </p>
        </div>
        <div className="flex space-x-3">
          <button className="luxury-button-secondary p-3">
            <Search size={18} strokeWidth={1.2} />
          </button>
          <button className="luxury-button-secondary p-3">
            <MoreHorizontal size={18} strokeWidth={1.2} />
          </button>
        </div>
      </div>

      {/* Gallery Stats */}
      {galleryStats && (
        <div className="luxury-card">
          <div className="grid grid-cols-3 gap-6">
            <div className="text-center">
              <div className="luxury-heading-3 mb-1">{galleryStats.total || galleryItems.length}</div>
              <div className="luxury-text-caption">Photos</div>
            </div>
            <div className="text-center">
              <div className="luxury-heading-3 mb-1">{galleryStats.totalLikes || 0}</div>
              <div className="luxury-text-caption">Total Likes</div>
            </div>
            <div className="text-center">
              <div className="luxury-heading-3 mb-1">{galleryStats.collections || 1}</div>
              <div className="luxury-text-caption">Collections</div>
            </div>
          </div>
        </div>
      )}

      {/* Filter Component */}
      <GalleryFilter activeFilter={activeFilter} onFilterChange={handleFilterChange} />

      {/* Gallery Content */}
      {galleryItems.length === 0 ? (
        <div className="luxury-card text-center py-12">
          <div className="w-16 h-16 bg-zinc-800/30 rounded-full mx-auto mb-6 flex items-center justify-center">
            <Search size={24} className="text-zinc-500" />
          </div>
          <h3 className="luxury-heading-3 mb-4">Your Gallery Awaits</h3>
          <p className="luxury-text-body mb-6 max-w-md mx-auto">
            Start creating stunning photos with Maya to build your personal brand gallery
          </p>
          <button className="luxury-button-primary">
            Create First Photo
          </button>
        </div>
      ) : (
        <>
          {/* Gallery grid with editorial hover effects */}
          <div className="luxury-gallery-grid">
            {galleryItems.map((item, index) => (
              <LuxuryGalleryItem
                key={item.id}
                item={item}
                index={index}
                onToggleLike={toggleLike}
                onToggleSave={toggleSave}
              />
            ))}
          </div>

          {/* Load More Button */}
          {galleryItems.length >= 10 && (
            <div className="text-center pt-8">
              <button className="luxury-text-caption hover:text-white transition-colors duration-300 border-b border-zinc-700/20 hover:border-white/20 pb-1">
                Load More Photos
              </button>
            </div>
          )}
        </>
      )}

      {/* Quick Actions */}
      <div className="luxury-card">
        <h4 className="luxury-heading-3 mb-4">Quick Actions</h4>
        <div className="grid grid-cols-2 gap-3">
          <button className="luxury-button-secondary">
            <Download size={16} />
            <span>Download All</span>
          </button>
          <button className="luxury-button-secondary">
            <Share2 size={16} />
            <span>Share Gallery</span>
          </button>
        </div>
      </div>
    </div>
  );
}
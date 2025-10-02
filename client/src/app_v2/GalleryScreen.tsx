import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../hooks/use-auth.js';
import { apiFetch } from '../lib/api.js';
import VideoGenerateDialog from '../features/video/VideoGenerateDialog.js';
import { 
  Grid, 
  Search, 
  Download, 
  Share2, 
  Play, 
  MoreHorizontal,
  Eye,
  X,
  AlertCircle,
  RefreshCw,
  Heart,
  Plus
} from 'lucide-react';

interface GalleryImage {
  id: string;
  userId: string;
  type: 'ai_generated' | 'generated';
  title: string;
  description: string;
  imageUrl: string;
  createdAt: string;
  tags: string[];
}

const GalleryScreen: React.FC = () => {
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTag, setFilterTag] = useState<string>('all');
  const [showVideoDialog, setShowVideoDialog] = useState(false);
  const [videoImageId, setVideoImageId] = useState<string>('');
  const [videoImageUrl, setVideoImageUrl] = useState<string>('');

  // Fetch gallery images
  const { data: images = [], isLoading: imagesLoading, error, refetch } = useQuery<GalleryImage[]>({
    queryKey: ['/api/gallery-images'],
    enabled: !!user && isAuthenticated,
    retry: false,
    staleTime: 60 * 1000,
    queryFn: () => apiFetch('/gallery-images')
  });

  const handleDownload = async (image: GalleryImage) => {
    try {
      const response = await fetch(image.imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `sselfie-${image.id}.jpg`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  const handleShare = async (image: GalleryImage) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: image.title,
          text: image.description,
          url: image.imageUrl,
        });
      } catch (error) {
        // Fallback to clipboard
        handleCopyLink(image);
      }
    } else {
      handleCopyLink(image);
    }
  };

  const handleCopyLink = async (image: GalleryImage) => {
    try {
      await navigator.clipboard.writeText(image.imageUrl);
      // You could add a toast notification here
    } catch (error) {
      console.error('Copy to clipboard failed:', error);
    }
  };

  const handleCreateVideo = (image: GalleryImage) => {
    setVideoImageId(image.id);
    setVideoImageUrl(image.imageUrl);
    setShowVideoDialog(true);
  };

  // Filter images based on search and tag
  const filteredImages = images.filter(image => {
    const matchesSearch = image.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         image.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTag = filterTag === 'all' || image.tags.includes(filterTag);
    return matchesSearch && matchesTag;
  });

  // Get unique tags for filter
  const uniqueTags = ['all', ...Array.from(new Set(images.flatMap(img => img.tags)))];

  if (authLoading || imagesLoading) {
    return (
      <div className="space-y-8 pb-4 pt-4 sm:pt-6">
        <div className="text-center">
          <div className="w-16 h-16 border border-stone-300 rounded-full animate-spin mx-auto mb-8 flex items-center justify-center">
            <div className="w-2 h-2 bg-stone-600 rounded-full"></div>
          </div>
          <h1 className="text-stone-950 text-4xl font-serif font-extralight tracking-[0.4em] mb-4 leading-none">SSELFIE</h1>
          <p className="text-xs font-light tracking-[0.3em] uppercase text-stone-500">Loading Gallery</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="space-y-8 pb-4 pt-4 sm:pt-6">
        <div className="text-center">
          <Grid className="h-16 w-16 text-stone-400 mx-auto mb-6" strokeWidth={1} />
          <h2 className="text-2xl font-serif font-extralight tracking-[0.3em] text-stone-950 uppercase mb-2">Authentication Required</h2>
          <p className="text-stone-600 font-light">Please sign in to view your gallery</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-8 pb-4 pt-4 sm:pt-6">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-6" strokeWidth={1} />
          <h2 className="text-2xl font-serif font-extralight tracking-[0.3em] text-stone-950 uppercase mb-2">Unable to Load Gallery</h2>
          <p className="text-stone-600 mb-4 font-light">We're having trouble loading your images.</p>
          <button 
            onClick={() => refetch()}
            className="px-6 py-3 bg-stone-950 text-stone-50 rounded-2xl font-light tracking-[0.15em] uppercase text-sm transition-all duration-200 hover:bg-stone-800 inline-flex items-center gap-2"
          >
            <RefreshCw size={16} strokeWidth={1.5} />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-4">
      {/* Gallery header */}
      <div className="flex justify-between items-start pt-4">
        <div className="space-y-4 flex-1 min-w-0">
          <h2 className="text-3xl sm:text-5xl font-serif font-extralight tracking-[0.3em] text-stone-950 uppercase leading-none">Gallery</h2>
          <p className="text-xs tracking-[0.2em] uppercase font-light text-stone-500">Your Beautiful Photos</p>
        </div>
        <div className="flex space-x-3 ml-6 flex-shrink-0">
          <button className="p-4 bg-stone-100/50 rounded-2xl border border-stone-200/40 transition-all duration-200 hover:scale-[1.02] hover:bg-stone-100/70">
            <Search size={18} strokeWidth={1.5} className="text-stone-600" />
          </button>
          <button className="p-4 bg-stone-100/50 rounded-2xl border border-stone-200/40 hover:bg-stone-100/70 hover:border-stone-300/50 transition-all duration-200 hover:scale-[1.02]">
            <MoreHorizontal size={18} className="text-stone-600 hover:text-stone-800 transition-colors" strokeWidth={1.5} />
          </button>
        </div>
      </div>

      {/* Search and Filter */}
      {images.length > 0 && (
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-stone-400" strokeWidth={1.5} />
            <input
              type="text"
              placeholder="Search your images..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-3 border border-stone-200/60 rounded-2xl focus:outline-none focus:ring-2 focus:ring-stone-600/40 focus:border-stone-600/60 bg-stone-100/40 w-full font-light text-sm"
            />
          </div>
          <div>
            <select
              value={filterTag}
              onChange={(e) => setFilterTag(e.target.value)}
              className="px-4 py-3 border border-stone-200/60 rounded-2xl focus:outline-none focus:ring-2 focus:ring-stone-600/40 focus:border-stone-600/60 bg-stone-100/40 font-light text-sm min-w-[150px]"
            >
              {uniqueTags.map(tag => (
                <option key={tag} value={tag}>
                  {tag === 'all' ? 'All Images' : tag.charAt(0).toUpperCase() + tag.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Gallery Grid */}
      {filteredImages.length === 0 ? (
        <div className="text-center py-16">
          <Grid className="h-16 w-16 text-stone-300 mx-auto mb-4" strokeWidth={1} />
          <h3 className="text-lg font-serif font-extralight text-stone-900 mb-2 tracking-[0.15em] uppercase">
            {searchQuery || filterTag !== 'all' ? 'No matching images' : 'No images yet'}
          </h3>
          <p className="text-stone-600 font-light mb-6">
            {searchQuery || filterTag !== 'all' 
              ? 'Try adjusting your search or filter'
              : 'Start generating images to build your gallery'
            }
          </p>
          {!searchQuery && filterTag === 'all' && (
            <button
              onClick={() => window.location.href = '/ai-generator'}
              className="px-6 py-3 bg-stone-950 text-stone-50 rounded-2xl font-light tracking-[0.15em] uppercase text-sm transition-all duration-200 hover:bg-stone-800 inline-flex items-center gap-2"
            >
              Generate Your First Image
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:gap-6">
          {filteredImages.map((image) => (
            <div
              key={image.id}
              className="relative group cursor-pointer overflow-hidden rounded-2xl sm:rounded-3xl"
            >
              <div className="aspect-square relative">
                <img 
                  src={image.imageUrl} 
                  alt={image.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-stone-950/0 group-hover:bg-stone-950/30 transition-all duration-300"></div>
                
                <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 bg-gradient-to-t from-stone-950/80 via-stone-950/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300">
                  <div className="flex justify-between items-end">
                    <div className="space-y-2 flex-1 min-w-0">
                      <span className="text-stone-50 text-xs tracking-[0.15em] uppercase font-light block truncate">{image.title}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-stone-50 rounded-full"></div>
                        <span className="text-xs font-light text-stone-200">Ready</span>
                      </div>
                    </div>
                    <div className="flex space-x-2 ml-4 flex-shrink-0">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDownload(image);
                        }}
                        className="w-9 h-9 bg-stone-50/20 backdrop-blur-sm rounded-xl flex items-center justify-center hover:bg-stone-50/30 transition-colors duration-200"
                      >
                        <Download size={14} className="text-stone-50" strokeWidth={1.5} />
                      </button>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleShare(image);
                        }}
                        className="w-9 h-9 bg-stone-50/20 backdrop-blur-sm rounded-xl flex items-center justify-center hover:bg-stone-50/30 transition-colors duration-200"
                      >
                        <Share2 size={14} className="text-stone-50" strokeWidth={1.5} />
                      </button>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedImage(image);
                        }}
                        className="w-9 h-9 bg-stone-50/20 backdrop-blur-sm rounded-xl flex items-center justify-center hover:bg-stone-50/30 transition-colors duration-200"
                      >
                        <Eye size={14} className="text-stone-50" strokeWidth={1.5} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Load more */}
      {filteredImages.length > 0 && (
        <div className="text-center pt-6">
          <button className="text-sm tracking-[0.2em] uppercase font-light border-b pb-2 flex items-center gap-2 mx-auto transition-colors duration-200 text-stone-600 border-stone-300/40 hover:text-stone-800 hover:border-stone-400/60">
            <Plus size={14} />
            See More Photos
          </button>
        </div>
      )}

      {/* Image Detail Modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div 
            className="max-w-4xl max-h-[95vh] w-full flex flex-col bg-stone-100/95 backdrop-blur-xl rounded-3xl overflow-hidden border border-stone-200/60"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-stone-200/40">
              <div>
                <h3 className="text-lg font-serif font-extralight tracking-[0.15em] text-stone-950 uppercase">{selectedImage.title}</h3>
                <p className="text-sm text-stone-600 font-light">
                  {new Date(selectedImage.createdAt).toLocaleDateString()}
                </p>
              </div>
              <button
                onClick={() => setSelectedImage(null)}
                className="p-2 hover:bg-stone-200/50 rounded-xl transition-colors"
              >
                <X className="h-5 w-5 text-stone-600" strokeWidth={1.5} />
              </button>
            </div>
            
            {/* Modal Image */}
            <div className="flex-1 flex items-center justify-center p-8 bg-stone-50/50">
              <img 
                src={selectedImage.imageUrl} 
                alt={selectedImage.title} 
                className="max-w-full max-h-[60vh] object-contain rounded-2xl shadow-lg"
              />
            </div>
            
            {/* Modal Actions */}
            <div className="p-6 border-t border-stone-200/40 bg-stone-100/60">
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => handleDownload(selectedImage)}
                  className="flex items-center gap-2 px-6 py-3 bg-stone-950 text-stone-50 rounded-2xl hover:bg-stone-800 transition-colors font-light tracking-[0.1em] uppercase text-sm"
                >
                  <Download size={16} strokeWidth={1.5} />
                  Download
                </button>
                <button 
                  onClick={() => handleShare(selectedImage)}
                  className="flex items-center gap-2 px-6 py-3 text-stone-700 bg-stone-100/50 border border-stone-200/40 rounded-2xl hover:bg-stone-100/70 transition-colors font-light tracking-[0.1em] uppercase text-sm"
                >
                  <Share2 size={16} strokeWidth={1.5} />
                  Share
                </button>
                <button 
                  onClick={() => {
                    handleCreateVideo(selectedImage);
                    setSelectedImage(null);
                  }}
                  className="flex items-center gap-2 px-6 py-3 text-stone-700 bg-stone-100/50 border border-stone-200/40 rounded-2xl hover:bg-stone-100/70 transition-colors font-light tracking-[0.1em] uppercase text-sm"
                >
                  <Play size={16} strokeWidth={1.5} />
                  Create Video
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Video Generation Dialog */}
      <VideoGenerateDialog
        isOpen={showVideoDialog}
        onClose={() => {
          setShowVideoDialog(false);
          setVideoImageId('');
          setVideoImageUrl('');
        }}
        imageId={videoImageId}
        imageUrl={videoImageUrl}
        onSuccess={() => {
          setShowVideoDialog(false);
        }}
      />
    </div>
  );
};

export default GalleryScreen;
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../hooks/use-auth';
import { apiFetch } from '../lib/api';
import VideoGenerateDialog from '../features/video/VideoGenerateDialog';
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
  RefreshCw
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
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 border border-stone-300 rounded-full animate-spin mx-auto mb-8 flex items-center justify-center">
            <div className="w-3 h-3 bg-stone-600 rounded-full animate-pulse"></div>
          </div>
          <h1 className="text-stone-900 text-4xl font-serif font-thin tracking-[0.5em] mb-6 leading-none">SSELFIE</h1>
          <p className="text-xs font-light tracking-[0.4em] uppercase text-stone-500 opacity-70">Loading Gallery</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="text-center">
          <Grid className="h-16 w-16 text-stone-400 mx-auto mb-6" strokeWidth={1} />
          <h2 className="text-2xl font-serif font-thin text-stone-900 mb-2 tracking-[0.3em] uppercase">Authentication Required</h2>
          <p className="text-stone-600 font-light">Please sign in to view your gallery</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-6">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-6" strokeWidth={1} />
          <h2 className="text-2xl font-serif font-thin text-stone-900 mb-2 tracking-[0.3em] uppercase">Unable to Load Gallery</h2>
          <p className="text-stone-600 mb-4 font-light">We're having trouble loading your images.</p>
          <button 
            onClick={() => refetch()}
            className="btn-primary mx-auto"
          >
            <RefreshCw className="h-4 w-4 mr-2" strokeWidth={1} />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Gallery header */}
      <div className="flex justify-between items-start pt-8 pb-4 px-6">
        <div className="space-y-3 flex-1 min-w-0">
          <h2 className="text-4xl font-serif font-thin tracking-[0.4em] text-stone-900 uppercase leading-tight">Gallery</h2>
          <p className="text-xs tracking-[0.2em] uppercase font-light text-stone-500">Your Beautiful Photos</p>
        </div>
        <div className="flex space-x-3 ml-4">
            <button className="p-4 bg-stone-200/40 rounded-2xl border border-stone-300/50 transition-all duration-300 hover:scale-105">
              <Search size={16} strokeWidth={1.5} className="text-stone-600" />
            </button>
            <button className="p-4 bg-stone-200/40 rounded-2xl border border-stone-300/50 hover:bg-stone-200/60 hover:border-stone-400/60 transition-all duration-300 hover:scale-105">
              <MoreHorizontal size={16} className="text-stone-600 hover:text-stone-800 transition-colors" strokeWidth={1.5} />
            </button>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="mt-6 flex flex-col sm:flex-row gap-4 max-w-6xl mx-auto px-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-stone-400" strokeWidth={1.5} />
          <input
            type="text"
            placeholder="Search your images..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 py-2 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-900/20 focus:border-stone-900 bg-white w-full"
          />
        </div>
        <div>
          <select
            value={filterTag}
            onChange={(e) => setFilterTag(e.target.value)}
            className="px-3 py-2 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-900/20 focus:border-stone-900 bg-white"
          >
            {uniqueTags.map(tag => (
              <option key={tag} value={tag}>
                {tag === 'all' ? 'All Images' : tag.charAt(0).toUpperCase() + tag.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Gallery Grid */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        {filteredImages.length === 0 ? (
          <div className="text-center py-16">
            <Grid className="h-16 w-16 text-stone-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-stone-900 mb-2">
              {searchQuery || filterTag !== 'all' ? 'No matching images' : 'No images yet'}
            </h3>
            <p className="text-stone-600 mb-6">
              {searchQuery || filterTag !== 'all' 
                ? 'Try adjusting your search or filter'
                : 'Start generating images to build your gallery'
              }
            </p>
            {!searchQuery && filterTag === 'all' && (
              <button
                onClick={() => window.location.href = '/ai-generator'}
                className="px-6 py-3 bg-stone-900 text-white rounded-lg hover:bg-stone-800 transition-colors"
              >
                Generate Your First Image
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredImages.map((image) => (
              <div
                key={image.id}
                className="group relative bg-white rounded-lg overflow-hidden border border-stone-200 hover:shadow-lg transition-all duration-200"
              >
                {/* Image */}
                <div className="aspect-square relative overflow-hidden">
                  <img
                    src={image.imageUrl}
                    alt={image.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                  />
                  {/* Overlay on hover */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                    <button
                      onClick={() => setSelectedImage(image)}
                      className="px-4 py-2 bg-white text-stone-900 rounded-lg hover:bg-stone-100 transition-colors flex items-center gap-2"
                    >
                      <Eye className="h-4 w-4" />
                      View
                    </button>
                  </div>
                </div>
                
                {/* Image Info */}
                <div className="p-4">
                  <h3 className="font-medium text-stone-900 mb-1 truncate">{image.title}</h3>
                  <p className="text-sm text-stone-600 mb-3 line-clamp-2">{image.description}</p>
                  
                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleDownload(image)}
                      className="flex items-center gap-1 px-2 py-1 text-xs text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded transition-colors"
                      title="Download"
                    >
                      <Download className="h-3 w-3" />
                    </button>
                    <button
                      onClick={() => handleShare(image)}
                      className="flex items-center gap-1 px-2 py-1 text-xs text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded transition-colors"
                      title="Share"
                    >
                      <Share2 className="h-3 w-3" />
                    </button>
                    <button
                      onClick={() => handleCreateVideo(image)}
                      className="flex items-center gap-1 px-2 py-1 text-xs text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded transition-colors"
                      title="Create Video"
                    >
                      <Play className="h-3 w-3" />
                    </button>
                  </div>
                  
                  {/* Tags */}
                  <div className="flex flex-wrap gap-1 mt-2">
                    {image.tags.slice(0, 2).map(tag => (
                      <span
                        key={tag}
                        className="px-2 py-1 text-xs bg-stone-100 text-stone-600 rounded"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Image Detail Modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div 
            className="max-w-4xl max-h-[95vh] w-full flex flex-col bg-white rounded-lg overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-stone-200">
              <div>
                <h3 className="text-lg font-medium text-stone-900">{selectedImage.title}</h3>
                <p className="text-sm text-stone-600">
                  {new Date(selectedImage.createdAt).toLocaleDateString()}
                </p>
              </div>
              <button
                onClick={() => setSelectedImage(null)}
                className="p-2 hover:bg-stone-100 rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-stone-600" />
              </button>
            </div>
            
            {/* Modal Image */}
            <div className="flex-1 flex items-center justify-center p-8 bg-stone-50">
              <img 
                src={selectedImage.imageUrl} 
                alt={selectedImage.title} 
                className="max-w-full max-h-[60vh] object-contain rounded-lg shadow-lg"
              />
            </div>
            
            {/* Modal Actions */}
            <div className="p-6 border-t border-stone-200 bg-stone-50">
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => handleDownload(selectedImage)}
                  className="flex items-center gap-2 px-4 py-2 bg-stone-900 text-white rounded-lg hover:bg-stone-800 transition-colors"
                >
                  <Download className="h-4 w-4" />
                  Download
                </button>
                <button 
                  onClick={() => handleShare(selectedImage)}
                  className="flex items-center gap-2 px-4 py-2 text-stone-700 bg-white border border-stone-200 rounded-lg hover:bg-stone-50 transition-colors"
                >
                  <Share2 className="h-4 w-4" />
                  Share
                </button>
                <button 
                  onClick={() => {
                    handleCreateVideo(selectedImage);
                    setSelectedImage(null);
                  }}
                  className="flex items-center gap-2 px-4 py-2 text-stone-700 bg-white border border-stone-200 rounded-lg hover:bg-stone-50 transition-colors"
                >
                  <Play className="h-4 w-4" />
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
          // Optionally refresh gallery or show success message
        }}
      />
    </div>
  );
};

export default GalleryScreen;
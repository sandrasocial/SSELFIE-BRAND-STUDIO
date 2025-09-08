/**
 * PHASE 3C & 3D: Feed Design Page
 * Complete user experience flow for creating branded social media posts
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/use-auth';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { CanvasPreview } from './CanvasPreview';
import { Loader2, Image, Instagram, Linkedin, Facebook, Twitter, Sparkles, Zap } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useToast } from '../../hooks/use-toast';

interface UserImage {
  id: string;
  imageUrl: string;
  isGenerated: boolean;
  createdAt: string;
}

interface BrandedPost {
  id: string;
  originalImageUrl: string;
  processedImageUrl: string;
  textOverlay: string;
  socialPlatform: string;
  createdAt: string;
}

export function FeedDesignPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  
  // State management
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [selectedPlatform, setSelectedPlatform] = useState<string>('instagram');
  const [selectedMessageType, setSelectedMessageType] = useState<string>('motivational');
  const [selectedTemplate, setSelectedTemplate] = useState<string>('estetica-luxury');
  const [showPreview, setShowPreview] = useState(false);
  const [createdPosts, setCreatedPosts] = useState<BrandedPost[]>([]);
  const [isCreatingBatch, setIsCreatingBatch] = useState(false);

  // Fetch user's images from gallery
  const { data: userImages, isLoading: imagesLoading } = useQuery({
    queryKey: ['/api/images', user?.id],
    enabled: !!user?.id,
    staleTime: 30000,
  });

  // Fetch user's branded posts
  const { data: brandedPosts, refetch: refetchPosts } = useQuery({
    queryKey: ['/api/branded-posts', user?.id],
    enabled: !!user?.id,
    staleTime: 10000,
  });

  useEffect(() => {
    if (brandedPosts?.posts) {
      setCreatedPosts(brandedPosts.posts);
    }
  }, [brandedPosts]);

  // Platform configurations
  const platforms = [
    { id: 'instagram', name: 'Instagram', icon: Instagram, color: 'text-pink-600' },
    { id: 'linkedin', name: 'LinkedIn', icon: Linkedin, color: 'text-blue-600' },
    { id: 'facebook', name: 'Facebook', icon: Facebook, color: 'text-blue-700' },
    { id: 'twitter', name: 'Twitter', icon: Twitter, color: 'text-sky-500' }
  ];

  // Visual templates for luxury branding
  const visualTemplates = [
    { 
      id: 'estetica-luxury', 
      name: 'Estética Luxury', 
      description: 'Sophisticated black/brown/beige with serif elegance',
      businessAlignment: 'Beauty, luxury services, premium consulting',
      preview: '#1C1C1C, #8B4513, #D4A574'
    },
    { 
      id: 'nature-luxo', 
      name: 'Nature Luxo', 
      description: 'Organic forest green/cream with natural typography',
      businessAlignment: 'Wellness, organic products, sustainability',
      preview: '#2F4F2F, #F5E6D3, #8FBC8F'
    },
    { 
      id: 'dark-luxury', 
      name: 'Dark Luxury', 
      description: 'Modern charcoal/silver sophistication',
      businessAlignment: 'Tech, modern business, architecture',
      preview: '#2C2C2C, #A9A9A9, #C0C0C0'
    },
    { 
      id: 'red-luxury', 
      name: 'Red Luxury', 
      description: 'Bold deep red/white elegance',
      businessAlignment: 'Fashion, beauty, luxury goods',
      preview: '#8B0000, #FFFFFF, #DC143C'
    },
    { 
      id: 'white-gold', 
      name: 'White Gold', 
      description: 'Minimal cream/gold luxury',
      businessAlignment: 'Luxury services, wedding, premium consulting',
      preview: '#FFFFFF, #FFD700, #F5F5DC'
    },
    { 
      id: 'rose-luxo', 
      name: 'Rose Luxo', 
      description: 'Romantic blush/cream sophistication',
      businessAlignment: 'Beauty, wellness, feminine brands',
      preview: '#DDA0DD, #F5F5DC, #E6E6FA'
    }
  ];

  const messageTypes = [
    { id: 'motivational', name: 'Motivational', description: 'Inspiring and empowering content', emoji: '🚀' },
    { id: 'business', name: 'Business', description: 'Professional and authoritative', emoji: '💼' },
    { id: 'lifestyle', name: 'Lifestyle', description: 'Authentic and personal', emoji: '✨' },
    { id: 'educational', name: 'Educational', description: 'Thought leadership content', emoji: '📚' },
    { id: 'behind_scenes', name: 'Behind the Scenes', description: 'Personal connection moments', emoji: '🎬' }
  ];

  // Handle image selection
  const handleImageSelect = (imageUrl: string) => {
    setSelectedImage(imageUrl);
    setShowPreview(true);
  };

  // Handle branded post creation
  const handleBrandedPostCreate = (brandedPostUrl: string) => {
    toast({
      title: "Branded Post Created! 🎉",
      description: "Your professional branded post is ready to share",
    });
    
    // Refresh the branded posts list
    refetchPosts();
  };

  // Create batch branded posts
  const handleBatchCreate = async () => {
    if (!user?.id || !userImages?.images) return;
    
    setIsCreatingBatch(true);
    
    try {
      const imageUrls = userImages.images
        .filter((img: UserImage) => img.isGenerated)
        .slice(0, 5)
        .map((img: UserImage) => img.imageUrl);
      
      const response = await fetch('/api/maya/batch-create-branded-posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          imageUrls,
          messageType: selectedMessageType,
          platform: selectedPlatform,
          visualTemplate: selectedTemplate
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        toast({
          title: `Created ${data.stats.successCount} Branded Posts! 🎨`,
          description: `Average quality score: ${data.stats.averageQualityScore}/1.0`,
        });
        refetchPosts();
      }
      
    } catch (error) {
      console.error('Batch creation error:', error);
      toast({
        title: "Batch Creation Failed",
        description: "Please try again or create posts individually",
        variant: "destructive"
      });
    } finally {
      setIsCreatingBatch(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Please sign in to access the Feed Designer.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Feed Designer
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Transform your gallery images into branded social media posts with Maya's AI intelligence
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Image Selection & Controls */}
          <div className="lg:col-span-2 space-y-6">
            {/* Visual Template Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-purple-600" />
                  Visual Brand Template
                </CardTitle>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Choose your luxury aesthetic for consistent branded posts
                </p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {visualTemplates.map((template) => (
                    <div
                      key={template.id}
                      onClick={() => setSelectedTemplate(template.id)}
                      className={cn(
                        "p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md",
                        selectedTemplate === template.id
                          ? "border-purple-500 bg-purple-50 dark:bg-purple-900/20"
                          : "border-gray-200 dark:border-gray-700 hover:border-gray-300"
                      )}
                    >
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-4 h-4 rounded-full border"
                            style={{ backgroundColor: template.preview.split(',')[0] }}
                          />
                          <div 
                            className="w-4 h-4 rounded-full border"
                            style={{ backgroundColor: template.preview.split(',')[1] }}
                          />
                          <div 
                            className="w-4 h-4 rounded-full border"
                            style={{ backgroundColor: template.preview.split(',')[2] }}
                          />
                        </div>
                        <h3 className="font-semibold text-sm">{template.name}</h3>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          {template.description}
                        </p>
                        <Badge variant="secondary" className="text-xs">
                          {template.businessAlignment.split(',')[0]}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Platform & Message Type Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  Content Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Platform Selection */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Platform</label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {platforms.map((platform) => {
                      const Icon = platform.icon;
                      return (
                        <Button
                          key={platform.id}
                          variant={selectedPlatform === platform.id ? 'default' : 'outline'}
                          onClick={() => setSelectedPlatform(platform.id)}
                          className="justify-start"
                        >
                          <Icon className={cn("h-4 w-4 mr-2", platform.color)} />
                          {platform.name}
                        </Button>
                      );
                    })}
                  </div>
                </div>

                {/* Message Type Selection */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Message Type</label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    {messageTypes.slice(0, 3).map((type) => (
                      <Button
                        key={type.id}
                        variant={selectedMessageType === type.id ? 'default' : 'outline'}
                        onClick={() => setSelectedMessageType(type.id)}
                        className="justify-start text-left"
                      >
                        <span className="mr-2">{type.emoji}</span>
                        <div>
                          <div className="font-medium">{type.name}</div>
                          <div className="text-xs opacity-70">{type.description}</div>
                        </div>
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Batch Action */}
                <div className="pt-4 border-t">
                  <Button
                    onClick={handleBatchCreate}
                    disabled={isCreatingBatch || !userImages?.images?.length}
                    className="w-full"
                    size="lg"
                  >
                    {isCreatingBatch ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Zap className="h-4 w-4 mr-2" />
                    )}
                    Create 5 Branded Posts Automatically
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Image Gallery */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Image className="h-5 w-5 text-primary" />
                  Your Gallery
                  {userImages?.images?.length && (
                    <Badge variant="secondary">{userImages.images.length} images</Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {imagesLoading ? (
                  <div className="flex items-center justify-center h-48">
                    <Loader2 className="h-8 w-8 animate-spin" />
                  </div>
                ) : userImages?.images?.length ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {userImages.images.map((image: UserImage) => (
                      <button
                        key={image.id}
                        onClick={() => handleImageSelect(image.imageUrl)}
                        className={cn(
                          "relative aspect-square rounded-lg overflow-hidden border-2 transition-all hover:scale-105",
                          selectedImage === image.imageUrl 
                            ? "border-primary ring-2 ring-primary/20" 
                            : "border-transparent hover:border-primary/50"
                        )}
                      >
                        <img
                          src={image.imageUrl}
                          alt="Gallery image"
                          className="w-full h-full object-cover"
                        />
                        {image.isGenerated && (
                          <Badge className="absolute top-2 left-2 text-xs">
                            AI Generated
                          </Badge>
                        )}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Image className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No images found. Generate some images first!</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Created Posts Gallery */}
            {createdPosts.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-primary" />
                    Your Branded Posts
                    <Badge variant="secondary">{createdPosts.length} posts</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {createdPosts.slice(0, 6).map((post) => (
                      <div key={post.id} className="relative group">
                        <img
                          src={post.processedImageUrl}
                          alt="Branded post"
                          className="w-full aspect-square object-cover rounded-lg"
                        />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                          <div className="text-center text-white p-2">
                            <p className="font-medium text-sm mb-1">{post.textOverlay}</p>
                            <Badge variant="secondary" className="text-xs">
                              {post.socialPlatform}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column: Canvas Preview */}
          <div className="lg:col-span-1">
            {showPreview && selectedImage && user?.id ? (
              <CanvasPreview
                imageUrl={selectedImage}
                userId={user.id}
                userBrandContext={{
                  profession: user.profession,
                  brandStyle: user.brandStyle,
                  photoGoals: user.photoGoals,
                  industry: user.profession,
                  visualTemplate: selectedTemplate
                }}
                onBrandedPostCreate={handleBrandedPostCreate}
                className="sticky top-8"
              />
            ) : (
              <Card className="sticky top-8">
                <CardContent className="flex items-center justify-center min-h-[400px]">
                  <div className="text-center text-gray-500">
                    <Image className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Select an image to start creating your branded post</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
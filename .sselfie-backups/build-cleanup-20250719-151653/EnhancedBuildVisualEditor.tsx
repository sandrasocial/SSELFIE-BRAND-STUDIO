import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { useQuery } from '@tanstack/react-query';
import { Send, Globe, Monitor, Smartphone, Image, Palette, Upload, Plus } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Based on OptimizedVisualEditor but simplified for users
interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface EnhancedBuildVisualEditorProps {
  className?: string;
}

export function EnhancedBuildVisualEditor({ className = '' }: EnhancedBuildVisualEditorProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // State management following OptimizedVisualEditor pattern
  const [messageInput, setMessageInput] = useState('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [uploadingImage, setUploadingImage] = useState(false);
  
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Fetch onboarding data for auto-generated website
  const { data: onboardingData } = useQuery({
    queryKey: ['/api/onboarding-data'],
    enabled: !!user,
  });

  // Fetch user's gallery and flatlay collections
  const { data: userGallery } = useQuery({
    queryKey: ['/api/user-gallery'],
    enabled: !!user,
  });

  const { data: flatlayCollections } = useQuery({
    queryKey: ['/api/flatlay-collections'],
    enabled: !!user,
  });

  // Auto-scroll chat to bottom when new messages are added
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatMessages]);

  // Initialize with welcome message from Victoria
  useEffect(() => {
    if (chatMessages.length === 0 && onboardingData) {
      const welcomeMessage: ChatMessage = {
        role: 'assistant',
        content: `Hi beautiful! I'm Victoria, your personal website designer. I can see you've completed your onboarding - now let's build your stunning website! 

I've already created a beautiful foundation based on your story. Take a look at the preview on the right. We can customize everything - colors, content, images, and make it truly YOU.

What would you like to work on first? Your homepage hero section, adding your services, or maybe selecting some gorgeous photos from your gallery?`,
        timestamp: new Date()
      };
      setChatMessages([welcomeMessage]);
    }
  }, [onboardingData, chatMessages.length]);

  const sendMessage = async () => {
    if (!messageInput.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: messageInput,
      timestamp: new Date()
    };

    setChatMessages(prev => [...prev, userMessage]);
    setMessageInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/victoria-website-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: messageInput,
          onboardingData,
          conversationHistory: chatMessages,
          userId: user?.id,
          selectedImages: selectedImages
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const data = await response.json();
      
      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: data.response,
        timestamp: new Date()
      };

      setChatMessages(prev => [...prev, assistantMessage]);

      // Update website preview if Victoria made changes
      if (data.websiteUpdate && iframeRef.current) {
        // Refresh iframe or update content
        iframeRef.current.contentWindow?.location.reload();
      }

    } catch (error) {
      console.error('Victoria chat error:', error);
      toast({
        title: "Chat Error",
        description: "Victoria couldn't respond right now. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleImageSelect = (imageUrl: string) => {
    setSelectedImages(prev => {
      if (prev.includes(imageUrl)) {
        return prev.filter(img => img !== imageUrl);
      } else {
        return [...prev, imageUrl];
      }
    });
    
    // Send message to Victoria about the selected image
    const imageMessage = `I've selected this image for my website: ${imageUrl}`;
    setMessageInput(imageMessage);
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch('/api/upload-image', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        handleImageSelect(data.imageUrl);
        toast({
          title: "Image Uploaded",
          description: "Your image has been uploaded successfully!",
        });
      }
    } catch (error) {
      console.error('Upload failed:', error);
      toast({
        title: "Upload Failed",
        description: "Could not upload image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploadingImage(false);
    }
  };

  // Generate website HTML based on onboarding data (same as LivePreview)
  const generateWebsiteHTML = () => {
    const brandName = onboardingData?.personalBrandName || 'Your Brand';
    const businessType = onboardingData?.businessType || 'Business';
    const targetAudience = onboardingData?.targetAudience || 'clients';
    const userStory = onboardingData?.userStory || 'Your story here';
    const colorScheme = onboardingData?.selectedFlatlay || 'luxury-minimal';
    
    const colorSchemes = {
      'luxury-minimal': { bg: '#f8f7f4', text: '#2c2c2c', accent: '#d4c5b0' },
      'editorial-magazine': { bg: '#ffffff', text: '#000000', accent: '#f5f5f5' },
      'european-luxury': { bg: '#f5f5f5', text: '#1a1a1a', accent: '#e8e8e8' },
      'business-professional': { bg: '#ffffff', text: '#2d3748', accent: '#4a5568' },
      'pink-girly': { bg: '#fdf7f7', text: '#6b4e4e', accent: '#f7c6c7' },
      'wellness-mindset': { bg: '#f7f9f7', text: '#2d4a3d', accent: '#a8c9a8' }
    };
    
    const colors = colorSchemes[colorScheme as keyof typeof colorSchemes] || colorSchemes['luxury-minimal'];
    
    return `<!DOCTYPE html><html><head><title>${brandName}</title><style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:'Times New Roman',serif;line-height:1.6;color:${colors.text};background:${colors.bg}}.container{max-width:1200px;margin:0 auto;padding:0 20px}nav{padding:20px 0;border-bottom:1px solid ${colors.accent}}nav .container{display:flex;justify-content:space-between;align-items:center}.logo{font-size:24px;font-weight:bold}.hero{padding:80px 0;text-align:center}.hero h1{font-size:48px;margin-bottom:20px}.hero p{font-size:18px;margin-bottom:30px;max-width:600px;margin-left:auto;margin-right:auto}.cta-button{display:inline-block;padding:15px 30px;background:${colors.text};color:${colors.bg};text-decoration:none;text-transform:uppercase;letter-spacing:1px}</style></head><body><nav><div class="container"><div class="logo">${brandName}</div></div></nav><section class="hero"><div class="container"><h1>${brandName}</h1><p>Transforming ${targetAudience} through ${businessType.toLowerCase()} that creates real, lasting change</p><a href="#contact" class="cta-button">Work With Me</a></div></section></body></html>`;
  };

  return (
    <div className={`h-screen bg-white flex ${className}`}>
      {/* Left Panel - Victoria Chat */}
      <div className="w-1/3 border-r border-gray-200 flex flex-col">
        {/* Chat Header */}
        <div className="p-6 border-b border-gray-200 bg-white">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-black to-gray-700 rounded-full flex items-center justify-center text-white font-bold text-lg">
              V
            </div>
            <div>
              <h3 className="text-xl font-light text-black" style={{ fontFamily: 'Times New Roman, serif' }}>
                Victoria
              </h3>
              <p className="text-sm text-gray-500">Your Website Design Consultant</p>
            </div>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4" ref={chatContainerRef}>
          {chatMessages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] p-4 rounded-lg ${
                  message.role === 'user'
                    ? 'bg-black text-white'
                    : 'bg-gray-50 text-black border border-gray-200'
                }`}
              >
                <p className="text-sm leading-relaxed whitespace-pre-wrap">
                  {message.content}
                </p>
                <p className="text-xs opacity-60 mt-2">
                  {new Date(message.timestamp).toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg max-w-[80%]">
                <div className="flex items-center space-x-2">
                  <div className="animate-spin w-4 h-4 border-2 border-black border-t-transparent rounded-full"></div>
                  <p className="text-sm text-gray-600">Victoria is designing...</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Chat Input */}
        <div className="p-6 border-t border-gray-200 bg-white">
          <div className="flex space-x-3">
            <Input
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Tell Victoria about your website..."
              className="flex-1 border-gray-300 focus:border-black focus:ring-0"
              disabled={isLoading}
            />
            <Button
              onClick={sendMessage}
              disabled={isLoading || !messageInput.trim()}
              className="px-6 bg-black hover:bg-gray-800 text-white"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Center Panel - Live Website Preview */}
      <div className="w-1/3 border-r border-gray-200 flex flex-col">
        {/* Preview Controls */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
          <div className="flex items-center space-x-4">
            <h3 className="font-serif text-lg text-black">Live Preview</h3>
            <div className="flex items-center space-x-2">
              <Button
                variant={previewMode === 'desktop' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setPreviewMode('desktop')}
                className="h-8"
              >
                <Monitor className="w-4 h-4" />
              </Button>
              <Button
                variant={previewMode === 'mobile' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setPreviewMode('mobile')}
                className="h-8"
              >
                <Smartphone className="w-4 h-4" />
              </Button>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Globe className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-500">
              {onboardingData?.personalBrandName?.toLowerCase().replace(/\s+/g, '') || 'yoursite'}.sselfie.ai
            </span>
          </div>
        </div>

        {/* Preview Iframe */}
        <div className="flex-1 bg-gray-100 p-4">
          <div 
            className={`mx-auto bg-white shadow-lg transition-all duration-300 ${
              previewMode === 'mobile' 
                ? 'max-w-sm' 
                : 'w-full'
            }`}
            style={{ 
              height: previewMode === 'mobile' ? '600px' : '100%',
              minHeight: '500px'
            }}
          >
            <iframe
              ref={iframeRef}
              src={`data:text/html,${encodeURIComponent(generateWebsiteHTML())}`}
              className="w-full h-full border-0"
              title="Website Preview"
            />
          </div>
        </div>
      </div>

      {/* Right Panel - Gallery & Photo Management */}
      <div className="w-1/3 bg-white flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h3 className="font-serif text-lg text-black mb-2">Photo Library</h3>
          <p className="text-sm text-gray-600">Select images for your website</p>
        </div>

        <Tabs defaultValue="ai-images" className="flex-1 flex flex-col">
          <TabsList className="grid w-full grid-cols-3 px-4 py-2">
            <TabsTrigger value="ai-images" className="text-xs">
              <Image className="w-4 h-4 mr-1" />
              AI Images
            </TabsTrigger>
            <TabsTrigger value="flatlays" className="text-xs">
              <Palette className="w-4 h-4 mr-1" />
              Style Library
            </TabsTrigger>
            <TabsTrigger value="upload" className="text-xs">
              <Upload className="w-4 h-4 mr-1" />
              Upload
            </TabsTrigger>
          </TabsList>

          <TabsContent value="ai-images" className="p-4 space-y-4 flex-1 overflow-y-auto">
            <div className="grid grid-cols-2 gap-3">
              {userGallery?.userSelfies?.map((image: any) => (
                <div
                  key={image.id}
                  className={`relative cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${
                    selectedImages.includes(image.url) 
                      ? 'border-black shadow-lg' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => handleImageSelect(image.url)}
                >
                  <img
                    src={image.url}
                    alt={`AI Generated ${image.id}`}
                    className="w-full h-24 object-cover"
                  />
                  {selectedImages.includes(image.url) && (
                    <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center">
                      <div className="w-6 h-6 bg-black rounded-full flex items-center justify-center">
                        <span className="text-white text-xs">✓</span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            {(!userGallery?.userSelfies || userGallery.userSelfies.length === 0) && (
              <div className="text-center py-8">
                <Image className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-sm text-gray-500">No AI images yet</p>
                <p className="text-xs text-gray-400">Generate some images first</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="flatlays" className="p-4 space-y-4 flex-1 overflow-y-auto">
            <div className="space-y-4">
              {flatlayCollections?.collections?.map((collection: any) => (
                <div key={collection.id} className="space-y-2">
                  <h4 className="text-sm font-medium text-gray-700">{collection.name}</h4>
                  <div className="grid grid-cols-3 gap-2">
                    {collection.images?.slice(0, 6).map((image: any, index: number) => (
                      <div
                        key={index}
                        className={`relative cursor-pointer rounded overflow-hidden border-2 transition-all ${
                          selectedImages.includes(image.url) 
                            ? 'border-black shadow-lg' 
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => handleImageSelect(image.url)}
                      >
                        <img
                          src={image.url}
                          alt={`${collection.name} ${index + 1}`}
                          className="w-full h-16 object-cover"
                        />
                        {selectedImages.includes(image.url) && (
                          <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center">
                            <div className="w-4 h-4 bg-black rounded-full flex items-center justify-center">
                              <span className="text-white text-xs">✓</span>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="upload" className="p-4 space-y-4 flex-1">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                id="image-upload"
                disabled={uploadingImage}
              />
              <label
                htmlFor="image-upload"
                className={`cursor-pointer ${uploadingImage ? 'opacity-50' : ''}`}
              >
                <Plus className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-sm text-gray-600 mb-2">
                  {uploadingImage ? 'Uploading...' : 'Upload your own photos'}
                </p>
                <p className="text-xs text-gray-400">
                  Click to browse or drag and drop
                </p>
              </label>
            </div>

            <div className="text-center">
              <p className="text-xs text-gray-500">
                Supported formats: JPG, PNG, WebP
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
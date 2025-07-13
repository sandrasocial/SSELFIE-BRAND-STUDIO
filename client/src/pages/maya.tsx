import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useLocation } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { apiRequest } from '@/lib/queryClient';

interface ChatMessage {
  role: 'user' | 'maya';
  content: string;
  timestamp: string;
  imagePreview?: string[];
  canGenerate?: boolean;
  generatedPrompt?: string;
}

export default function Maya() {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [savedImages, setSavedImages] = useState<Set<string>>(new Set());
  const [savingImages, setSavingImages] = useState<Set<string>>(new Set());
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [currentImageId, setCurrentImageId] = useState<number | null>(null);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to chat with Maya AI",
        variant: "destructive",
      });
      setLocation('/pricing');
      return;
    }
  }, [user, isLoading, setLocation, toast]);

  // Initialize with Maya's welcome message
  useEffect(() => {
    if (user && messages.length === 0) {
      setMessages([{
        role: 'maya',
        content: `Hey ${user.firstName || 'gorgeous'}! I'm Maya, your personal celebrity stylist, photographer, and makeup artist. I work with A-list celebrities and high-end fashion brands to create magazine-worthy content.\n\nI'm here to help you look absolutely stunning and bring out your best features. Let's talk about your vision - what kind of energy are you going for? Editorial sophistication? Natural lifestyle beauty? Red carpet glamour?\n\nDescribe the mood, the story you want to tell, or even just how you want to feel in the photos. I'll ask the right questions to understand your vision perfectly, then create those exact photos for you! ✨`,
        timestamp: new Date().toISOString()
      }]);
    }
  }, [user, messages.length]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: input,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    try {
      const response = await fetch('/api/maya-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: input,
          chatHistory: messages
        }),
      });

      const data = await response.json();

      const mayaMessage: ChatMessage = {
        role: 'maya',
        content: data.message || "I'm having a creative moment! Try asking me again about your photo vision.",
        canGenerate: data.canGenerate || false,
        generatedPrompt: data.generatedPrompt || undefined,
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, mayaMessage]);
    } catch (error) {
      console.error('Maya chat error:', error);
      toast({
        title: "Connection Error",
        description: "Maya is having trouble connecting. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsTyping(false);
    }
  };

  // Poll for image completion
  const pollForImages = async (imageId: number) => {
    const maxAttempts = 40; // 2 minutes total (3 second intervals)
    let attempts = 0;
    
    const poll = async () => {
      try {
        attempts++;
        setGenerationProgress(Math.min(90, (attempts / maxAttempts) * 90));
        
        const response = await fetch('/api/ai-images');
        if (!response.ok) throw new Error('Failed to fetch images');
        
        const images = await response.json();
        const currentImage = images.find((img: any) => img.id === imageId);
        
        if (currentImage && currentImage.imageUrl && currentImage.imageUrl !== 'processing') {
          // Image generation completed
          console.log('Maya: Image generation completed!', currentImage);
          console.log('Maya: imageUrl value:', currentImage.imageUrl);
          
          setGenerationProgress(100);
          setIsGenerating(false);
          
          if (currentImage.imageUrl.startsWith('http') || currentImage.imageUrl.startsWith('[')) {
            // Parse the image URLs (should be array of 3 URLs)
            let imageUrls: string[] = [];
            try {
              // Try to parse as JSON array first
              const parsed = JSON.parse(currentImage.imageUrl);
              console.log('Maya: Parsed imageUrl:', parsed);
              if (Array.isArray(parsed)) {
                imageUrls = parsed;
                console.log('Maya: Found array with', imageUrls.length, 'images');
              } else {
                imageUrls = [currentImage.imageUrl];
                console.log('Maya: Single URL fallback');
              }
            } catch (error) {
              // If not JSON, treat as single URL
              console.log('Maya: JSON parse failed, using single URL:', error);
              imageUrls = [currentImage.imageUrl];
            }
            
            setGeneratedImages(imageUrls);
            
            // Add image preview to the last Maya message
            setMessages(prev => {
              const newMessages = [...prev];
              const lastMayaIndex = newMessages.map(m => m.role).lastIndexOf('maya');
              if (lastMayaIndex >= 0) {
                newMessages[lastMayaIndex] = {
                  ...newMessages[lastMayaIndex],
                  imagePreview: imageUrls
                };
              }
              return newMessages;
            });
            
            toast({
              title: "Photos Ready!",
              description: "Maya created 3 stunning photos. Choose your favorites to save!",
            });
          } else {
            // Generation failed
            toast({
              title: "Generation Failed",
              description: "Maya couldn't complete the photos. Try again!",
              variant: "destructive",
            });
          }
          return;
        }
        
        // Continue polling
        if (attempts < maxAttempts) {
          setTimeout(poll, 3000);
        } else {
          setIsGenerating(false);
          toast({
            title: "Generation Timeout", 
            description: "Photos are taking longer than expected. Check gallery later!",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error('Polling error:', error);
        if (attempts < maxAttempts) {
          setTimeout(poll, 3000);
        } else {
          setIsGenerating(false);
        }
      }
    };
    
    poll();
  };

  // Generate images based on Maya's prompt
  const generateImages = async (prompt: string) => {
    setIsGenerating(true);
    setGeneratedImages([]);
    setGenerationProgress(0);
    setCurrentImageId(null);
    
    try {
      const response = await fetch('/api/maya-generate-images', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ customPrompt: prompt }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate images');
      }

      const data = await response.json();
      
      if (data.success && data.imageId) {
        setCurrentImageId(data.imageId);
        
        // Start polling for completion
        pollForImages(data.imageId);
        
        toast({
          title: "Generation Started",
          description: "Maya is creating your photos... This takes about 30 seconds.",
        });
      }
    } catch (error) {
      console.error('Error generating images:', error);
      toast({
        title: "Generation Failed",
        description: "Maya couldn't generate images right now. Try again!",
        variant: "destructive",
      });
      setIsGenerating(false);
    }
  };

  // Save image to gallery
  const saveToGallery = async (imageUrl: string, index: number) => {
    if (savedImages.has(imageUrl) || savingImages.has(imageUrl)) return;
    
    setSavingImages(prev => new Set([...prev, imageUrl]));
    
    try {
      await apiRequest('POST', '/api/save-to-gallery', {
        imageUrl,
        prompt: `Maya AI Photoshoot - Image ${index + 1}`,
        style: 'Maya AI',
        subcategory: 'AI Photography'
      });
      
      setSavedImages(prev => new Set([...prev, imageUrl]));
      // Refresh gallery to show newly saved image
      queryClient.invalidateQueries({ queryKey: ['/api/gallery-images'] });
      
      toast({
        title: "Saved to Gallery",
        description: "Image saved to your gallery and Maya dashboard",
      });
    } catch (error) {
      console.error('Error saving to gallery:', error);
      toast({
        title: "Save Failed",
        description: "Could not save image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSavingImages(prev => {
        const newSet = new Set(prev);
        newSet.delete(imageUrl);
        return newSet;
      });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border border-black border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Maya AI...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to login
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="border-b border-gray-200 p-4 sm:p-6">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-serif font-light text-black">
              Maya AI
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Your personal AI photographer & stylist
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => setLocation('/workspace')}
            className="text-sm"
          >
            ← Back to Studio
          </Button>
        </div>
      </header>

      {/* Chat Container */}
      <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full">
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {messages.map((message, index) => (
            <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-2xl ${message.role === 'user' ? 'bg-black text-white' : 'bg-gray-50 text-black'} p-4 sm:p-6`}>
                <div className="whitespace-pre-wrap text-sm sm:text-base leading-relaxed">
                  {message.content}
                </div>
                
                {/* Generate Images Button */}
                {message.role === 'maya' && message.canGenerate && message.generatedPrompt && !message.imagePreview && (
                  <div className="mt-4">
                    <Button
                      onClick={() => generateImages(message.generatedPrompt!)}
                      disabled={isGenerating}
                      className="bg-black text-white hover:bg-gray-800 text-sm"
                    >
                      {isGenerating ? 'Generating...' : 'Generate These Photos ✨'}
                    </Button>
                    
                    {/* Progress Bar */}
                    {isGenerating && (
                      <div className="mt-4">
                        <div className="flex items-center justify-between text-xs mb-2">
                          <span className="text-gray-600">Maya is creating your photos...</span>
                          <span className="text-gray-600">{Math.round(generationProgress)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 h-2">
                          <div 
                            className="h-2 bg-black transition-all duration-300 ease-out"
                            style={{ width: `${generationProgress}%` }}
                          ></div>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                          ⏱️ Estimated time: 35-50 seconds • Creating your professional photos
                        </p>
                      </div>
                    )}
                  </div>
                )}
                
                {/* Image Preview Grid */}
                {message.role === 'maya' && message.imagePreview && (
                  <div className="mt-6">
                    <h4 className="text-sm font-medium mb-3 text-black">Your Maya AI Photos</h4>
                    <div className="grid grid-cols-3 gap-4">
                      {message.imagePreview.map((imageUrl, imgIndex) => (
                        <div key={imgIndex} className="relative group">
                          <img 
                            src={imageUrl}
                            alt={`Maya generated image ${imgIndex + 1}`}
                            className="w-full h-32 object-cover border border-gray-200 cursor-pointer hover:opacity-90 transition-opacity"
                            onClick={() => setSelectedImage(imageUrl)}
                          />
                          
                          {/* Save Button */}
                          <button
                            onClick={() => saveToGallery(imageUrl, imgIndex)}
                            disabled={savingImages.has(imageUrl)}
                            className="absolute top-2 right-2 bg-black/70 hover:bg-black text-white text-xs px-2 py-1 rounded transition-all"
                          >
                            {savingImages.has(imageUrl) ? '⟳' : (savedImages.has(imageUrl) ? '♥ Saved' : '♡ Save')}
                          </button>
                          
                          {/* Saved Indicator */}
                          {savedImages.has(imageUrl) && (
                            <div className="absolute bottom-2 left-2 bg-black text-white text-xs px-2 py-1 rounded">
                              In Gallery
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className={`text-xs mt-3 ${message.role === 'user' ? 'text-white/60' : 'text-gray-500'}`}>
                  {message.role === 'user' ? 'You' : 'Maya'} • {new Date(message.timestamp).toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-gray-50 text-black p-4 sm:p-6 max-w-2xl">
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
                <div className="text-xs mt-3 text-gray-500">Maya is typing...</div>
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="border-t border-gray-200 p-4 sm:p-6">
          <div className="flex gap-3">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Tell Maya what kind of photos you want to create..."
              className="flex-1 min-h-[60px] resize-none border-gray-300 focus:border-black focus:ring-black"
              disabled={isTyping}
            />
            <Button
              onClick={sendMessage}
              disabled={!input.trim() || isTyping}
              className="bg-black text-white hover:bg-gray-800 px-6"
            >
              Send
            </Button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Press Enter to send, Shift+Enter for new line
          </p>
        </div>
      </div>

      {/* Full-size Image Modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-4xl max-h-full">
            <img 
              src={selectedImage}
              alt="Full size view"
              className="max-w-full max-h-full object-contain"
              onClick={(e) => e.stopPropagation()}
            />
            <button 
              onClick={() => setSelectedImage(null)}
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
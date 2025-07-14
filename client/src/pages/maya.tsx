import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useLocation } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient, useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { apiRequest } from '@/lib/queryClient';
import UsageTracker from '@/components/UsageTracker';

interface ChatMessage {
  role: 'user' | 'maya';
  content: string;
  timestamp: string;
  imagePreview?: string[];
  canGenerate?: boolean;
  generatedPrompt?: string;
}

interface MayaChat {
  id: number;
  userId: string;
  chatTitle: string;
  chatSummary?: string;
  createdAt: string;
  updatedAt: string;
}

// Chat History Links Component - integrated into Maya Dashboard
function ChatHistoryLinks({ onChatSelect }: { onChatSelect: (chatId: number) => void }) {
  const { data: chats } = useQuery({
    queryKey: ['/api/maya-chats'],
    retry: false,
  });

  if (!chats || chats.length === 0) {
    return (
      <div className="text-xs text-gray-400">No previous sessions</div>
    );
  }

  return (
    <div className="space-y-3">
      {chats.slice(0, 5).map((chat: MayaChat) => (
        <div 
          key={chat.id} 
          className="text-xs text-gray-600 hover:text-black cursor-pointer transition-colors leading-relaxed"
          onClick={() => onChatSelect(chat.id)}
        >
          {chat.chatTitle}
        </div>
      ))}
      {chats.length > 5 && (
        <div className="text-xs text-gray-400 pt-2 border-t border-gray-100">
          {chats.length - 5} more sessions
        </div>
      )}
    </div>
  );
}

export default function Maya() {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Get chat ID from URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const chatIdFromUrl = urlParams.get('chat');
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
  const [currentChatId, setCurrentChatId] = useState<number | null>(null);


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

  // Load specific chat or initialize with welcome message
  useEffect(() => {
    if (user && messages.length === 0) {
      if (chatIdFromUrl) {
        // Load specific chat from URL parameter
        loadChatHistory(parseInt(chatIdFromUrl));
      } else {
        // Initialize with Maya's welcome message
        setMessages([{
          role: 'maya',
          content: `Hey ${user.firstName || 'gorgeous'}! I'm Maya, your personal celebrity stylist, photographer, and makeup artist. I work with A-list celebrities and high-end fashion brands to create magazine-worthy content.\n\nI'm here to help you look absolutely stunning and bring out your best features. Let's talk about your vision - what kind of energy are you going for? Editorial sophistication? Natural lifestyle beauty? Red carpet glamour?\n\nDescribe the mood, the story you want to tell, or even just how you want to feel in the photos. I'll ask the right questions to understand your vision perfectly, then create those exact photos for you.`,
          timestamp: new Date().toISOString()
        }]);
      }
    }
  }, [user, messages.length, chatIdFromUrl]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const messageContent = input.trim();
    const userMessage: ChatMessage = {
      role: 'user',
      content: messageContent,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    try {
      // Create chat if this is the first user message (messages.length === 1 means only Maya's welcome)
      if (!currentChatId && messages.length === 1) {
        const chatTitle = messageContent.slice(0, 50) + (messageContent.length > 50 ? '...' : '');
        const chatResponse = await fetch('/api/maya-chats', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            chatTitle,
            chatSummary: messageContent.slice(0, 100)
          })
        });
        
        if (chatResponse.ok) {
          const chat = await chatResponse.json();
          setCurrentChatId(chat.id);
          // Invalidate chat history to refresh sidebar immediately
          queryClient.invalidateQueries({ queryKey: ['/api/maya-chats'] });
        }
      }

      const response = await fetch('/api/maya-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: messageContent,
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

      // Save both messages to database if we have a chat ID
      if (currentChatId) {
        try {
          await fetch(`/api/maya-chats/${currentChatId}/messages`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              role: 'user',
              content: userMessage.content
            })
          });

          await fetch(`/api/maya-chats/${currentChatId}/messages`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              role: 'maya',
              content: mayaMessage.content,
              generatedPrompt: mayaMessage.generatedPrompt
            })
          });

          // Invalidate chat history to refresh sidebar
          queryClient.invalidateQueries({ queryKey: ['/api/maya-chats'] });
        } catch (saveError) {
          console.error('Error saving messages to history:', saveError);
          // Don't show error to user - just log it
        }
      }
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

      const data = await response.json();

      // Handle usage limit errors with upgrade prompts
      if (!response.ok) {
        if (response.status === 403 && data.upgrade) {
          toast({
            title: "Usage Limit Reached",
            description: data.reason || "You've reached your free limit. Upgrade to continue!",
            variant: "destructive",
          });
          // Show upgrade modal or redirect to pricing
          window.location.href = '/pricing';
          return;
        }
        throw new Error(data.error || 'Failed to generate images');
      }
      
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
        description: error instanceof Error ? error.message : "Maya couldn't generate images right now. Try again!",
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

  const loadChatHistory = async (chatId: number) => {
    try {
      const messagesResponse = await fetch(`/api/maya-chats/${chatId}/messages`);
      if (messagesResponse.ok) {
        const dbMessages = await messagesResponse.json();
        const formattedMessages: ChatMessage[] = dbMessages.map((msg: any) => ({
          role: msg.role,
          content: msg.content,
          timestamp: msg.createdAt,
          generatedPrompt: msg.generatedPrompt,
          canGenerate: !!msg.generatedPrompt
        }));
        setMessages(formattedMessages);
        setCurrentChatId(chatId);
      }
    } catch (error) {
      console.error('Error loading chat history:', error);
      toast({
        title: "Error",
        description: "Could not load chat history",
        variant: "destructive",
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
    <div className="min-h-screen bg-white">
      {/* Hero Section - Maya Introduction */}
      <section className="relative py-16 sm:py-20 px-4 sm:px-6 md:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Hero Content */}
            <div className="order-2 lg:order-1">
              <div className="text-[10px] sm:text-xs font-normal tracking-[0.3em] sm:tracking-[0.4em] uppercase text-[#666666] mb-8">
                Your Personal Photographer
              </div>
              
              <h1 className="font-times text-[clamp(3rem,8vw,6rem)] leading-[0.9] font-extralight tracking-[-0.02em] text-black mb-8">
                MAYA
              </h1>
              
              <p className="text-lg sm:text-xl font-light leading-relaxed text-[#666666] mb-12 max-w-xl">
                Meet Maya, your personal celebrity photographer. She creates magazine-quality photos 
                that make you look absolutely stunning. Just tell her your vision and watch the magic happen.
              </p>

              <div className="space-y-6 mb-12">
                <div className="flex items-center space-x-4">
                  <div className="w-2 h-2 bg-black"></div>
                  <span className="text-sm tracking-[0.1em] uppercase text-[#666666]">Professional Camera Specs</span>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-2 h-2 bg-black"></div>
                  <span className="text-sm tracking-[0.1em] uppercase text-[#666666]">Editorial Film Texture</span>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-2 h-2 bg-black"></div>
                  <span className="text-sm tracking-[0.1em] uppercase text-[#666666]">Celebrity Styling Tips</span>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <UsageTracker />
                <Button
                  variant="outline"
                  onClick={() => setLocation('/workspace')}
                  className="text-sm"
                >
                  ← Back to Studio
                </Button>
              </div>
            </div>
            
            {/* Hero Image - Maya Examples */}
            <div className="order-1 lg:order-2">
              <div className="aspect-[4/5] bg-[#f5f5f5] overflow-hidden">
                <img 
                  src="https://i.postimg.cc/g0qMhY8L/6-jpg.jpg"
                  alt="Maya AI Photography Example"
                  className="w-full h-full object-cover object-center"
                  loading="eager"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Examples Section */}
      <section className="py-16 px-4 sm:px-6 md:px-8 bg-[#f5f5f5]">
        <div className="max-w-7xl mx-auto">
          <h2 className="font-times text-[clamp(2rem,6vw,4rem)] leading-[0.9] font-extralight tracking-[-0.02em] text-black text-center mb-16">
            WHAT MAYA CREATES FOR YOU
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="aspect-[3/4] bg-white overflow-hidden mb-6">
                <img 
                  src="https://i.postimg.cc/0NzwbRgP/4-jpg.jpg"
                  alt="Editorial Portrait Example"
                  className="w-full h-full object-cover object-center"
                />
              </div>
              <h3 className="font-times text-xl font-light text-black mb-2">Editorial Portraits</h3>
              <p className="text-sm text-[#666666]">Magazine-worthy shots with professional lighting</p>
            </div>
            
            <div className="text-center">
              <div className="aspect-[3/4] bg-white overflow-hidden mb-6">
                <img 
                  src="https://i.postimg.cc/KYq8Twzr/2-jpg.jpg"
                  alt="Lifestyle Photography Example"
                  className="w-full h-full object-cover object-center"
                />
              </div>
              <h3 className="font-times text-xl font-light text-black mb-2">Lifestyle Moments</h3>
              <p className="text-sm text-[#666666]">Natural, authentic photos for your brand</p>
            </div>
            
            <div className="text-center">
              <div className="aspect-[3/4] bg-white overflow-hidden mb-6">
                <img 
                  src="https://i.postimg.cc/DzrLpMN4/1-jpg.jpg"
                  alt="Business Professional Example"
                  className="w-full h-full object-cover object-center"
                />
              </div>
              <h3 className="font-times text-xl font-light text-black mb-2">Business Professional</h3>
              <p className="text-sm text-[#666666]">Confident, polished looks for your business</p>
            </div>
          </div>
        </div>
      </section>

      {/* Chat Section */}
      <section className="py-16 px-4 sm:px-6 md:px-8 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-times text-[clamp(2rem,6vw,3rem)] leading-[0.9] font-extralight tracking-[-0.02em] text-black mb-6">
              CHAT WITH MAYA
            </h2>
            <p className="text-lg font-light text-[#666666] max-w-2xl mx-auto">
              Tell Maya what you're dreaming of. She'll ask the right questions and create those exact photos for you.
            </p>
          </div>

          {/* Chat Interface */}
          <div className="bg-[#f5f5f5] border border-gray-200">
            {/* Chat Header */}
            <div className="border-b border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-times text-xl font-light text-black">Your Photoshoot Session</h3>
                  <p className="text-sm text-[#666666] mt-1">Maya is ready to create amazing photos with you</p>
                </div>
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setMessages([{
                        role: 'maya',
                        content: `Hey ${user?.firstName || 'gorgeous'}! Ready for another amazing photoshoot? What's the vision this time?`,
                        timestamp: new Date().toISOString()
                      }]);
                      setCurrentChatId(null);
                      window.history.replaceState({}, '', '/maya');
                    }}
                    className="text-sm"
                  >
                    New Session
                  </Button>
                </div>
              </div>
            </div>

            {/* Messages Area */}
            <div className="h-96 overflow-y-auto p-6 space-y-6">
              {messages.map((message, index) => (
                <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-2xl ${message.role === 'user' ? 'bg-black text-white' : 'bg-white text-black border border-gray-200'} p-4 sm:p-6`}>
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
                          {isGenerating ? 'Creating Your Photos...' : 'Create These Photos'}
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
                              ✨ Estimated time: 35-50 seconds • Creating your professional photos
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                    
                    {/* Image Preview Grid */}
                    {message.role === 'maya' && message.imagePreview && (
                      <div className="mt-6">
                        <h4 className="text-sm font-medium mb-3 text-black">Your Maya Photos</h4>
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
                  <div className="bg-white text-black border border-gray-200 p-4 sm:p-6 max-w-2xl">
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
            <div className="border-t border-gray-200 p-6">
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
            </div>
          </div>
        </div>
      </section>

      {/* Previous Sessions Section */}
      <section className="py-16 px-4 sm:px-6 md:px-8 bg-[#f5f5f5]">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-times text-[clamp(1.5rem,4vw,2rem)] leading-[0.9] font-extralight tracking-[-0.02em] text-black text-center mb-12">
            YOUR PHOTO SESSIONS
          </h2>
          
          <div className="bg-white border border-gray-200 p-8">
            <ChatHistoryLinks onChatSelect={(chatId) => {
              loadChatHistory(chatId);
              window.history.replaceState({}, '', `/maya?chat=${chatId}`);
            }} />
          </div>
        </div>
      </section>

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
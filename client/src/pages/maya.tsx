import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useLocation } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient, useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { apiRequest } from '@/lib/queryClient';
import { SandraImages } from '@/lib/sandra-images';
import { EditorialImageBreak } from '@/components/EditorialImageBreak';
import { MemberNavigation } from '@/components/member-navigation';

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
  const [currentTrackerId, setCurrentTrackerId] = useState<number | null>(null);
  const [currentChatId, setCurrentChatId] = useState<number | null>(null);


  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to chat with Maya AI",
        variant: "destructive",
      });
      setLocation('/login');
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
      let chatIdForSaving = currentChatId;
      if (!currentChatId && messages.length === 1) {
        const chatTitle = messageContent.slice(0, 50) + (messageContent.length > 50 ? '...' : '');
        const chatResponse = await fetch('/api/maya-chats', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ 
            chatTitle,
            chatSummary: messageContent.slice(0, 100)
          })
        });
        
        if (chatResponse.ok) {
          const chat = await chatResponse.json();
          chatIdForSaving = chat.id;
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
        credentials: 'include',
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
      if (chatIdForSaving) {
        try {
          await fetch(`/api/maya-chats/${chatIdForSaving}/messages`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({
              role: 'user',
              content: userMessage.content
            })
          });

          await fetch(`/api/maya-chats/${chatIdForSaving}/messages`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
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
      // Remove toast - Maya explains everything in chat
    } finally {
      setIsTyping(false);
    }
  };

  // 🔑 NEW: Poll tracker for image completion (using new tracker system)
  const pollForTrackerCompletion = async (trackerId: number) => {
    const maxAttempts = 40; // 2 minutes total (3 second intervals)
    let attempts = 0;
    
    const poll = async () => {
      try {
        attempts++;
        setGenerationProgress(Math.min(90, (attempts / maxAttempts) * 90));
        
        const response = await fetch(`/api/generation-tracker/${trackerId}`, {
          credentials: 'include'
        });
        if (!response.ok) throw new Error('Failed to fetch tracker status');
        
        const tracker = await response.json();
        
        if (tracker.status === 'completed' && tracker.imageUrls && tracker.imageUrls.length > 0) {
          // Image generation completed
          console.log('Maya: Tracker generation completed!', tracker);
          
          setGenerationProgress(100);
          setIsGenerating(false);
          setGeneratedImages(tracker.imageUrls);
          
          // Add image preview to the last Maya message
          setMessages(prev => {
            const newMessages = [...prev];
            const lastMayaIndex = newMessages.map(m => m.role).lastIndexOf('maya');
            if (lastMayaIndex >= 0) {
              newMessages[lastMayaIndex] = {
                ...newMessages[lastMayaIndex],
                imagePreview: tracker.imageUrls
              };
            }
            return newMessages;
          });
          
          // Remove toast - Maya explains everything in chat
          return;
        }
        
        if (tracker.status === 'failed') {
          setIsGenerating(false);
          // Remove toast - Maya explains everything in chat
          return;
        }
        
        // Continue polling
        if (attempts < maxAttempts) {
          setTimeout(poll, 3000);
        } else {
          setIsGenerating(false);
          // Remove toast - Maya explains everything in chat
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

  // 🔑 NEW: Generate images using tracker system (preview-first workflow)
  const generateImages = async (prompt: string) => {
    console.log('🎨 Maya: Starting image generation:', { prompt, user });
    setIsGenerating(true);
    setGeneratedImages([]);
    setGenerationProgress(0);
    setCurrentTrackerId(null);
    
    try {
      console.log('🔐 Maya: Making authenticated request to /api/maya-generate-images');
      const response = await fetch('/api/maya-generate-images', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Ensure authentication cookies are sent
        body: JSON.stringify({ customPrompt: prompt }),
      });

      const data = await response.json();
      console.log('📡 Maya: Server response:', { status: response.status, ok: response.ok, data });

      // Handle usage limit errors with upgrade prompts
      if (!response.ok) {
        console.error('Maya generation error:', {
          status: response.status,
          statusText: response.statusText,
          data
        });
        
        if (response.status === 401) {
          toast({
            title: "Authentication Required",
            description: "Please log in to use Maya AI image generation.",
            variant: "destructive",
          });
          setTimeout(() => {
            window.location.href = '/login';
          }, 1500);
          return;
        }
        
        if (response.status === 403 && data.upgrade) {
          // Remove toast - Maya explains everything in chat
          window.location.href = '/pricing';
          return;
        }
        
        // Check if it's a model validation error
        if (data.requiresTraining) {
          toast({
            title: "AI Model Required",
            description: data.error || "Please complete your AI model training first.",
            variant: "destructive",
          });
          setTimeout(() => {
            setLocation(data.redirectTo || '/simple-training');
          }, 1500);
          return;
        }
        
        throw new Error(data.error || 'Failed to generate images');
      }
      
      if (data.success && data.trackerId) {
        console.log('✅ Maya: Generation started successfully, tracking ID:', data.trackerId);
        setCurrentTrackerId(data.trackerId);
        
        // Start polling tracker for completion
        pollForTrackerCompletion(data.trackerId);
        
        toast({
          title: "Maya is creating your photos",
          description: "Your images are generating - watch the preview appear below!",
        });
      }
    } catch (error) {
      console.error('Error generating images:', error);
      // Remove toast - Maya explains everything in chat
      setIsGenerating(false);
    }
  };

  // 🔑 NEW: Save selected preview images to permanent gallery
  const saveSelectedToGallery = async (selectedUrls: string[]) => {
    if (!currentTrackerId || selectedUrls.length === 0) return;
    
    try {
      const response = await fetch('/api/save-preview-to-gallery', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          trackerId: currentTrackerId,
          selectedImageUrls: selectedUrls
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save images');
      }
      
      // Mark images as saved
      selectedUrls.forEach(url => {
        setSavedImages(prev => new Set([...prev, url]));
      });
      
      // Refresh gallery to show newly saved images
      queryClient.invalidateQueries({ queryKey: ['/api/gallery-images'] });
      
      // Remove toast - Maya explains everything in chat
    } catch (error) {
      console.error('Error saving to gallery:', error);
      // Remove toast - Maya explains everything in chat
    }
  };

  // Save single image to gallery with heart click
  const saveToGallery = async (imageUrl: string) => {
    if (savedImages.has(imageUrl) || savingImages.has(imageUrl)) return;
    
    setSavingImages(prev => new Set([...prev, imageUrl]));
    
    try {
      // First try the tracker-based save if we have a tracker ID
      if (currentTrackerId) {
        await saveSelectedToGallery([imageUrl]);
      } else {
        // Fallback to direct save-to-gallery API for images without tracker
        const response = await fetch('/api/save-to-gallery', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            imageUrl: imageUrl,
            prompt: 'Maya AI Generated Image',
            style: 'maya-ai'
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to save image');
        }
        
        // Mark image as saved
        setSavedImages(prev => new Set([...prev, imageUrl]));
        
        // Refresh gallery to show newly saved images
        queryClient.invalidateQueries({ queryKey: ['/api/gallery-images'] });
        
        toast({
          title: "Image Saved",
          description: "Image permanently added to your gallery",
        });
      }
    } catch (error) {
      console.error('Error saving to gallery:', error);
      toast({
        title: "Save Failed",
        description: error instanceof Error ? error.message : "Could not save image to gallery",
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
      console.log('Loading chat history for chatId:', chatId);
      const messagesResponse = await fetch(`/api/maya-chats/${chatId}/messages`, {
        credentials: 'include'
      });
      
      if (messagesResponse.ok) {
        const dbMessages = await messagesResponse.json();
        console.log('Loaded messages from database:', dbMessages);
        
        // If no messages found, start with Maya's welcome
        if (!dbMessages || dbMessages.length === 0) {
          setMessages([{
            role: 'maya',
            content: `Hey ${user?.firstName || 'gorgeous'}! Welcome back to our conversation. What new vision are we creating today?`,
            timestamp: new Date().toISOString()
          }]);
        } else {
          const formattedMessages: ChatMessage[] = dbMessages.map((msg: any) => ({
            role: msg.role,
            content: msg.content,
            timestamp: msg.createdAt,
            generatedPrompt: msg.generatedPrompt,
            canGenerate: !!msg.generatedPrompt && !msg.imagePreview,
            imagePreview: msg.imagePreview ? (() => {
              try {
                const parsed = JSON.parse(msg.imagePreview);
                // Filter out invalid URLs like "Converting to permanent storage..."
                if (Array.isArray(parsed)) {
                  return parsed.filter(url => 
                    typeof url === 'string' && 
                    (url.startsWith('http') || url.startsWith('https'))
                  );
                }
                return undefined;
              } catch (e) {
                console.warn('Failed to parse image preview:', e);
                return undefined;
              }
            })() : undefined
          }));
          setMessages(formattedMessages);
        }
        setCurrentChatId(chatId);
        
        // Clear any generated images from previous session
        setGeneratedImages([]);
        setCurrentTrackerId(null);
      } else {
        console.error('Failed to load messages:', messagesResponse.status);
        // Fallback to new conversation
        setMessages([{
          role: 'maya',
          content: `Hey ${user?.firstName || 'gorgeous'}! I'm Maya. Let's create something amazing together!`,
          timestamp: new Date().toISOString()
        }]);
        setCurrentChatId(chatId);
      }
    } catch (error) {
      console.error('Error loading chat history:', error);
      // Fallback to new conversation
      setMessages([{
        role: 'maya',
        content: `Hey ${user?.firstName || 'gorgeous'}! I'm Maya. Let's create something amazing together!`,
        timestamp: new Date().toISOString()
      }]);
      setCurrentChatId(chatId);
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
      <MemberNavigation />
      
      {/* Editorial Hero Section */}
      <EditorialImageBreak 
        imageUrl={SandraImages.editorial.thinking}
        alt="Maya - Your Personal Celebrity Photographer"
        height="45vh"
        overlay={true}
        overlayContent={
          <div className="max-w-3xl mx-auto text-center px-6">
            <div className="text-[10px] sm:text-xs font-normal tracking-[0.4em] uppercase text-white/80 mb-4">
              Meet Maya
            </div>
            <h1 className="font-times text-[clamp(3rem,7vw,5rem)] leading-[0.8] font-extralight tracking-[0.1em] text-white mb-2">
              BRAND
            </h1>
            <h2 className="font-times text-[clamp(1.2rem,3vw,2rem)] leading-[1] font-extralight tracking-[0.05em] text-white/90">
              PHOTOSHOOT
            </h2>
          </div>
        }
      />

      {/* Main Chat Interface */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 md:px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Chat Area - Main Column */}
            <div className="lg:col-span-2">
              <div className="bg-[#f5f5f5] min-h-[500px] flex flex-col">
                {/* Chat Header */}
                <div className="border-b border-gray-200 p-6 bg-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-times text-xl font-light text-black">Chat with Maya</h3>
                      <p className="text-sm text-[#666666] mt-1">Your photoshoot session</p>
                    </div>
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

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                  {/* Welcome Message */}
                  {messages.length <= 1 && (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-white mx-auto mb-6 overflow-hidden border border-gray-200">
                        <img 
                          src={SandraImages.editorial.thinking}
                          alt="Maya"
                          className="w-full h-full object-cover object-center top"
                        />
                      </div>
                      <h4 className="font-times text-xl font-light text-black mb-4">
                        Hey {user?.firstName || 'gorgeous'}!
                      </h4>
                      <p className="text-sm text-[#666666] mb-6 max-w-md mx-auto leading-relaxed">
                        I'm Maya, your personal celebrity photographer. Tell me what kind of photos you want to create and I'll help you plan the perfect shoot.
                      </p>
                      <div className="space-y-2 text-xs text-[#666666] max-w-sm mx-auto">
                        <div>"I want editorial portraits like Vogue"</div>
                        <div>"Create lifestyle photos for my business"</div>
                        <div>"I need professional headshots"</div>
                      </div>
                    </div>
                  )}

                  {/* Chat Messages */}
                  {messages.length > 1 && messages.map((message, index) => (
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
                                  Estimated time: 35-50 seconds • Creating your professional photos
                                </p>
                              </div>
                            )}
                          </div>
                        )}
                        
                        {/* 🔑 NEW: Enhanced Image Preview Grid with Heart-Save */}
                        {message.role === 'maya' && message.imagePreview && (
                          <div className="mt-6">
                            <div className="flex items-center justify-between mb-4">
                              <h4 className="text-sm font-medium text-black">Your Maya Photos</h4>
                              <p className="text-xs text-gray-500">Click to view full size • Heart to save permanently</p>
                            </div>
                            <div className="grid grid-cols-3 gap-3">
                              {message.imagePreview.map((imageUrl, imgIndex) => (
                                <div key={imgIndex} className="relative group">
                                  <div className="relative overflow-hidden border border-gray-200 hover:border-gray-300 transition-colors">
                                    <img 
                                      src={imageUrl}
                                      alt={`Maya generated image ${imgIndex + 1}`}
                                      className="w-full h-32 object-cover cursor-pointer hover:scale-105 transition-transform duration-200"
                                      onClick={() => setSelectedImage(imageUrl)}
                                    />
                                    
                                    {/* Minimalistic Heart Save Button */}
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        saveToGallery(imageUrl);
                                      }}
                                      disabled={savingImages.has(imageUrl)}
                                      className="absolute top-2 right-2 w-8 h-8 flex items-center justify-center bg-white/90 hover:bg-white border border-gray-200 hover:border-gray-300 rounded-full transition-all shadow-sm"
                                      title={savedImages.has(imageUrl) ? 'Saved to gallery' : 'Save to gallery'}
                                    >
                                      {savingImages.has(imageUrl) ? (
                                        <div className="w-3 h-3 border border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                                      ) : savedImages.has(imageUrl) ? (
                                        <span className="text-red-500 text-sm">♥</span>
                                      ) : (
                                        <span className="text-gray-400 hover:text-red-500 text-sm transition-colors">♡</span>
                                      )}
                                    </button>
                                    
                                    {/* Subtle Saved Indicator */}
                                    {savedImages.has(imageUrl) && (
                                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                                        <div className="text-white text-xs font-medium">
                                          ✓ Saved
                                        </div>
                                      </div>
                                    )}
                                    
                                    {/* Hover overlay */}
                                    <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors pointer-events-none"></div>
                                  </div>
                                </div>
                              ))}
                            </div>
                            
                            {/* Preview Status Message */}
                            <div className="mt-3 text-xs text-gray-500 bg-gray-50 p-3 rounded border">
                              <strong>Preview Mode:</strong> These are temporary preview images. Click the heart (♡) to save your favorites permanently to your gallery.
                            </div>
                          </div>
                        )}
                        
                        <div className={`text-xs mt-3 ${message.role === 'user' ? 'text-white/60' : 'text-gray-500'}`}>
                          {message.role === 'user' ? 'You' : 'Maya'} • {new Date(message.timestamp).toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {/* Typing Indicator */}
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
                <div className="border-t border-gray-200 p-6 bg-white">
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
            </div>

            {/* Sidebar - Previous Sessions */}
            <div className="lg:col-span-1">
              <div className="bg-[#f5f5f5] p-6 min-h-[500px]">
                <h3 className="font-times text-lg font-light text-black mb-6">Previous Sessions</h3>
                <ChatHistoryLinks onChatSelect={(chatId) => {
                  loadChatHistory(chatId);
                  window.history.replaceState({}, '', `/maya?chat=${chatId}`);
                }} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 🔑 ENHANCED: Full-size Image Modal with Heart-Save */}
      {selectedImage && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-5xl max-h-full">
            <img 
              src={selectedImage}
              alt="Full size view"
              className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
            
            {/* Modal Controls */}
            <div className="absolute top-4 right-4 flex gap-2">
              {/* Heart Save Button in Modal */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  saveToGallery(selectedImage);
                }}
                disabled={savingImages.has(selectedImage)}
                className="w-10 h-10 flex items-center justify-center bg-white/90 hover:bg-white border border-gray-200 hover:border-gray-300 rounded-full transition-all shadow-lg"
                title={savedImages.has(selectedImage) ? 'Saved to gallery' : 'Save to gallery'}
              >
                {savingImages.has(selectedImage) ? (
                  <div className="w-4 h-4 border border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                ) : savedImages.has(selectedImage) ? (
                  <span className="text-red-500 text-lg">♥</span>
                ) : (
                  <span className="text-gray-400 hover:text-red-500 text-lg transition-colors">♡</span>
                )}
              </button>
              
              {/* Close Button */}
              <button 
                onClick={() => setSelectedImage(null)}
                className="w-10 h-10 flex items-center justify-center bg-white/90 hover:bg-white text-gray-700 hover:text-black rounded-full transition-all shadow-lg"
                title="Close"
              >
                <span className="text-xl leading-none">×</span>
              </button>
            </div>
            
            {/* Image Info */}
            <div className="absolute bottom-4 left-4 bg-black/60 text-white px-4 py-2 rounded-lg backdrop-blur-sm">
              <div className="text-sm font-medium">Maya AI Generated Photo</div>
              <div className="text-xs text-white/80">Click heart to save permanently</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
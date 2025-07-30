import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth';
import { apiRequest } from '@/lib/queryClient';
import { Heart, Send, Loader2 } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { SandraImages } from '@/data/sandra-images';

interface MayaChatMessage {
  id: number;
  role: 'user' | 'maya';
  content: string;
  timestamp: string;
  imagePreview?: string[];
  isGenerating?: boolean;
}

export function MayaChatInterface() {
  const { user } = useAuth();
  const [message, setMessage] = useState('');
  const [chatMessages, setChatMessages] = useState<MayaChatMessage[]>([]);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [savedImages, setSavedImages] = useState<Set<string>>(new Set());
  const [savingImages, setSavingImages] = useState<Set<string>>(new Set());
  const queryClient = useQueryClient();

  // Load chat history
  useEffect(() => {
    const loadChatHistory = async () => {
      try {
        const response = await fetch('/api/maya-chat-messages', {
          credentials: 'include'
        });
        
        if (response.ok) {
          const dbMessages = await response.json();
          if (dbMessages && dbMessages.length > 0) {
            const formattedMessages = dbMessages.map((msg: any) => ({
              id: msg.id,
              role: msg.role,
              content: msg.content,
              timestamp: msg.createdAt,
              imagePreview: msg.imagePreview ? JSON.parse(msg.imagePreview) : undefined
            }));
            setChatMessages(formattedMessages);
          }
        }
      } catch (error) {
        console.error('❌ Maya: Error loading chat history:', error);
      }
    };

    loadChatHistory();
  }, []);

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (prompt: string) => {
      setIsGenerating(true);
      setGenerationProgress(0);
      
      const data = await apiRequest('/api/maya-generate-images', 'POST', {
        customPrompt: prompt
      });

      return data;
    },
    onSuccess: (data) => {
      if (data.success && data.images) {
        const mayaResponse: MayaChatMessage = {
          id: Date.now(),
          role: 'maya',
          content: data.message || 'Here are your stunning new photos! ✨',
          timestamp: new Date().toISOString(),
          imagePreview: data.images
        };
        
        setChatMessages(prev => [...prev, mayaResponse]);
      }
      
      setIsGenerating(false);
      setGenerationProgress(0);
    },
    onError: (error) => {
      console.error('Maya generation error:', error);
      setIsGenerating(false);
      setGenerationProgress(0);
    }
  });

  // Heart image mutation
  const heartImageMutation = useMutation({
    mutationFn: async (imageUrl: string) => {
      setSavingImages(prev => new Set(Array.from(prev).concat([imageUrl])));
      return await apiRequest('/api/heart-image-to-gallery', 'POST', {
        imageUrl,
        prompt: 'Maya AI Photography',
        style: 'Editorial'
      });
    },
    onSuccess: (data, imageUrl) => {
      setSavedImages(prev => new Set(Array.from(prev).concat([imageUrl])));
      setSavingImages(prev => {
        const newSet = new Set(Array.from(prev));
        newSet.delete(imageUrl);
        return newSet;
      });
      queryClient.invalidateQueries({ queryKey: ['/api/ai-images'] });
    },
    onError: (error, imageUrl) => {
      setSavingImages(prev => {
        const newSet = new Set(prev);
        newSet.delete(imageUrl);
        return newSet;
      });
    }
  });

  const handleSendMessage = () => {
    if (!message.trim()) return;

    const userMessage: MayaChatMessage = {
      id: Date.now() - 1,
      role: 'user',
      content: message,
      timestamp: new Date().toISOString()
    };

    setChatMessages(prev => [...prev, userMessage]);
    sendMessageMutation.mutate(message);
    setMessage('');
  };

  const handleHeartImage = (imageUrl: string) => {
    heartImageMutation.mutate(imageUrl);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Editorial Hero Section */}
      <div className="relative h-[45vh] bg-black overflow-hidden">
        <img 
          src={SandraImages.editorial.thinking}
          alt="Maya - Your Personal Celebrity Photographer"
          className="w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
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
        </div>
      </div>

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
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setChatMessages([]);
                        }}
                        className="text-sm"
                      >
                        New Session
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                  {/* Welcome Message */}
                  {chatMessages.length === 0 && (
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
                  {chatMessages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-2xl ${msg.role === 'user' ? 'bg-black text-white' : 'bg-white text-black border border-gray-200'} p-4 sm:p-6`}>
                        <div className="whitespace-pre-wrap text-sm sm:text-base leading-relaxed">
                          {msg.content}
                        </div>

                        {/* Generation Status */}
                        {isGenerating && msg.role === 'maya' && chatMessages.indexOf(msg) === chatMessages.length - 1 && (
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

                        {/* Image Preview Grid */}
                        {msg.imagePreview && Array.isArray(msg.imagePreview) && (
                          <div className="mt-6">
                            <div className="flex items-center justify-between mb-4">
                              <h4 className="text-sm font-medium text-black">Your Maya Photos</h4>
                              <p className="text-xs text-gray-500">Click to view • Heart to save</p>
                            </div>
                            <div className="grid grid-cols-3 gap-3">
                              {msg.imagePreview.map((imageUrl: string, index: number) => (
                                <div key={index} className="relative group">
                                  <div className="relative overflow-hidden border border-gray-200 hover:border-gray-300 transition-colors">
                                    <img 
                                      src={imageUrl}
                                      alt={`Maya generated image ${index + 1}`}
                                      className="w-full h-32 object-cover cursor-pointer hover:scale-105 transition-transform duration-200"
                                      onClick={() => window.open(imageUrl, '_blank')}
                                    />
                                    
                                    {/* Heart Save Button */}
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleHeartImage(imageUrl);
                                      }}
                                      disabled={savingImages.has(imageUrl)}
                                      className="absolute top-2 right-2 w-8 h-8 flex items-center justify-center bg-white/90 hover:bg-white border border-gray-200 hover:border-gray-300 transition-all shadow-sm"
                                    >
                                      {savingImages.has(imageUrl) ? (
                                        <Loader2 className="w-4 h-4 animate-spin text-gray-600" />
                                      ) : savedImages.has(imageUrl) ? (
                                        <Heart className="w-4 h-4 text-black fill-current" />
                                      ) : (
                                        <Heart className="w-4 h-4 text-gray-600 hover:text-black transition-colors" />
                                      )}
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Message Input */}
                <div className="border-t border-gray-200 p-6 bg-white">
                  <div className="flex gap-3">
                    <Input
                      type="text"
                      placeholder="Tell Maya what photos you want to create..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                      disabled={isGenerating}
                      className="flex-1"
                    />
                    <Button
                      onClick={handleSendMessage}
                      disabled={!message.trim() || isGenerating}
                      className="bg-black text-white hover:bg-gray-800"
                    >
                      {isGenerating ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Send className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-[#f5f5f5] p-6">
                <h4 className="font-times text-lg font-light text-black mb-4">Photo Styles</h4>
                <div className="space-y-3 text-sm text-[#666666]">
                  <div>"Editorial magazine style"</div>
                  <div>"Professional headshots"</div>
                  <div>"Lifestyle business photos"</div>
                  <div>"Creative artistic portraits"</div>
                  <div>"Brand photography"</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
import React, { useState, useEffect, useRef, KeyboardEvent } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useLocation } from 'wouter';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { MemberNavigation } from '../components/member-navigation';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { ChevronDown, Plus, Save, Sparkles } from 'lucide-react';

interface ChatMessage {
  id?: number;
  role: 'user' | 'maya';
  content: string;
  timestamp: string;
  imagePreview?: string[];
  canGenerate?: boolean;
  generatedPrompt?: string;
  category?: string;
}

interface MayaChat {
  id: number;
  userId: string;
  chatTitle: string;
  chatSummary?: string;
  category?: string;
  createdAt: string;
  updatedAt: string;
}

interface StyleCategory {
  id: string;
  name: string;
  description: string;
  prompt: string;
  image: string;
}

// Maya's Style Categories - Luxury Fashion Intelligence
const MAYA_STYLE_CATEGORIES: StyleCategory[] = [
  {
    id: 'future-ceo',
    name: 'Future CEO',
    description: 'Powerful, professional, ready to run the world',
    prompt: 'Future CEO - Powerful, professional, ready to run the world',
    image: 'https://images.unsplash.com/photo-1594736797933-d0400a01d4b1?w=400&h=300&fit=crop'
  },
  {
    id: 'off-duty-model',
    name: 'Off-Duty Model',
    description: 'Effortlessly stunning, casual but elevated',
    prompt: 'Off-Duty Model - Effortlessly stunning, casual but elevated',
    image: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&h=300&fit=crop'
  },
  {
    id: 'social-queen',
    name: 'Social Queen',
    description: 'Instagram-ready, social media perfection',
    prompt: 'Social Queen - Instagram-ready, social media perfection',
    image: 'https://images.unsplash.com/photo-1494790108755-2616c2495026?w=400&h=300&fit=crop'
  },
  {
    id: 'date-night-goddess',
    name: 'Date Night Goddess',
    description: 'Romantic, magnetic, unforgettable',
    prompt: 'Date Night Goddess - Romantic, magnetic, unforgettable',
    image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=400&h=300&fit=crop'
  },
  {
    id: 'everyday-icon',
    name: 'Everyday Icon',
    description: 'Polished daily life, elevated routine moments',
    prompt: 'Everyday Icon - Polished daily life, elevated routine moments',
    image: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=400&h=300&fit=crop'
  },
  {
    id: 'power-player',
    name: 'Power Player',
    description: 'Authority, influence, making things happen',
    prompt: 'Power Player - Authority, influence, making things happen',
    image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=300&fit=crop'
  }
];

export default function Maya() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Core chat state
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [currentChatId, setCurrentChatId] = useState<number | null>(null);

  // UI state
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [savingImages, setSavingImages] = useState(new Set<string>());
  const [savedImages, setSavedImages] = useState(new Set<string>());
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Get current chat ID from URL
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const chatIdFromUrl = urlParams.get('chat');
      if (chatIdFromUrl) {
        const parsedChatId = parseInt(chatIdFromUrl);
        if (!isNaN(parsedChatId)) {
          setCurrentChatId(parsedChatId);
          loadChatHistory(parsedChatId);
        }
      }
    }
  }, []);

  // Auto-scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Authentication check
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      setLocation('/');
    }
  }, [isAuthenticated, authLoading, setLocation]);

  // Enhanced Chat History with Categories
  const ChatHistoryLinks = ({ onChatSelect }: { onChatSelect: (chatId: number) => void }) => {
    const { data: chats, isLoading } = useQuery<MayaChat[]>({
      queryKey: ['/api/maya-chats'],
      enabled: !!user,
      staleTime: 30000,
    });

    if (isLoading) {
      return (
        <div className="session-item">
          <div className="session-title">Loading sessions...</div>
        </div>
      );
    }

    if (!chats || chats.length === 0) {
      return (
        <div className="session-item">
          <div className="session-preview">No previous sessions</div>
        </div>
      );
    }

    // Group chats by category
    const chatsByCategory = chats.reduce((acc, chat) => {
      const category = chat.category || 'General Sessions';
      if (!acc[category]) acc[category] = [];
      acc[category].push(chat);
      return acc;
    }, {} as Record<string, MayaChat[]>);

    const toggleCategory = (category: string) => {
      const newExpanded = new Set(expandedCategories);
      if (newExpanded.has(category)) {
        newExpanded.delete(category);
      } else {
        newExpanded.add(category);
      }
      setExpandedCategories(newExpanded);
    };

    return (
      <>
        {Object.entries(chatsByCategory).map(([category, categoryChats]) => (
          <div key={category} className="category-section">
            <div 
              className="category-header"
              onClick={() => toggleCategory(category)}
            >
              <span className="category-name">{category}</span>
              <ChevronDown 
                className={`category-chevron ${expandedCategories.has(category) ? 'expanded' : ''}`}
                size={16}
              />
            </div>
            {expandedCategories.has(category) && (
              <div className="category-sessions">
                {categoryChats.slice(0, 5).map((chat) => (
                  <div key={chat.id} className="session-item" onClick={() => onChatSelect(chat.id)}>
                    <div className="session-title">{chat.chatTitle}</div>
                    <div className="session-preview">
                      {chat.chatSummary || 'Personal brand styling session'}
                    </div>
                  </div>
                ))}
                {categoryChats.length > 5 && (
                  <div className="more-sessions">{categoryChats.length - 5} more sessions</div>
                )}
              </div>
            )}
          </div>
        ))}
      </>
    );
  };

  const loadChatHistory = async (chatId: number) => {
    try {
      const response = await apiRequest(`/api/maya-chats/${chatId}/messages`);
      if (response && Array.isArray(response)) {
        setMessages(response);
        setCurrentChatId(chatId);
      }
    } catch (error) {
      console.error('Error loading chat history:', error);
      toast({
        title: "Error",
        description: "Failed to load chat history"
      });
    }
  };

  const startNewSession = () => {
    setMessages([]);
    setCurrentChatId(null);
    window.history.replaceState({}, '', '/maya');
  };

  const sendMessage = async () => {
    if (!input.trim() || isTyping) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: input.trim(),
      timestamp: new Date().toISOString(),
      category: selectedCategory || undefined
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    try {
      const response = await apiRequest('/api/member-maya-chat', 'POST', {
        message: userMessage.content,
        chatId: currentChatId,
        category: selectedCategory
      });

      if (response) {
        const mayaMessage: ChatMessage = {
          role: 'maya',
          content: response.response,
          timestamp: new Date().toISOString(),
          canGenerate: response.canGenerate,
          generatedPrompt: response.generatedPrompt,
          category: selectedCategory || undefined
        };

        setMessages(prev => [...prev, mayaMessage]);

        if (response.chatId && !currentChatId) {
          setCurrentChatId(response.chatId);
          window.history.replaceState({}, '', `/maya?chat=${response.chatId}`);
        }

        queryClient.invalidateQueries({ queryKey: ['/api/maya-chats'] });
      }
    } catch (error) {
      console.error('Chat error:', error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again."
      });
    } finally {
      setIsTyping(false);
    }
  };

  const generateImages = async (prompt: string) => {
    if (isGenerating) return;

    setIsGenerating(true);
    setGenerationProgress(0);

    try {
      const response = await apiRequest('/api/generate-maya', 'POST', {
        prompt,
        chatId: currentChatId
      });

      if (response?.predictionId) {
        // Start polling for completion
        const pollForImages = async (): Promise<void> => {
          try {
            const pollResponse = await apiRequest(`/api/maya-generation-status/${response.predictionId}`);
            
            if (pollResponse?.status === 'succeeded' && pollResponse.images) {
              // Update the last message with generated images
              setMessages(prev => {
                const updatedMessages = [...prev];
                const lastMayaIndex = updatedMessages.findLastIndex(msg => msg.role === 'maya');
                if (lastMayaIndex !== -1) {
                  updatedMessages[lastMayaIndex] = {
                    ...updatedMessages[lastMayaIndex],
                    imagePreview: pollResponse.images
                  };
                }
                return updatedMessages;
              });
              
              setIsGenerating(false);
              setGenerationProgress(100);
              
              queryClient.invalidateQueries({ queryKey: ['/api/maya-chats'] });
            } else if (pollResponse?.status === 'failed') {
              throw new Error('Generation failed');
            } else {
              // Still processing, update progress
              const progress = Math.min(90, generationProgress + 10);
              setGenerationProgress(progress);
              setTimeout(pollForImages, 2000);
            }
          } catch (pollError) {
            console.error('Polling error:', pollError);
            setIsGenerating(false);
            throw pollError;
          }
        };

        setTimeout(pollForImages, 2000);

      } else {
        throw new Error('Failed to start generation');
      }

    } catch (error) {
      console.error('Generation error:', error);
      toast({
        title: "Generation Error",
        description: "Failed to generate images. Please try again."
      });
      setIsGenerating(false);
      setGenerationProgress(0);
    }
  };

  const saveToGallery = async (imageUrl: string) => {
    if (savingImages.has(imageUrl) || savedImages.has(imageUrl)) return;

    setSavingImages(prev => new Set(prev).add(imageUrl));

    try {
      await apiRequest('/api/save-image', 'POST', {
        imageUrl,
        source: 'maya-chat'
      });

      setSavedImages(prev => new Set(prev).add(imageUrl));
      toast({
        title: "Saved!",
        description: "Image added to your gallery"
      });
    } catch (error) {
      console.error('Save error:', error);
      toast({
        title: "Error",
        description: "Failed to save image"
      });
    } finally {
      setSavingImages(prev => {
        const newSet = new Set(prev);
        newSet.delete(imageUrl);
        return newSet;
      });
    }
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const scrollToChat = () => {
    const chatContainer = document.querySelector('.main-container');
    chatContainer?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleStyleSelect = (style: string) => {
    const styleCategory = MAYA_STYLE_CATEGORIES.find(cat => cat.id === style);
    const message = styleCategory ? styleCategory.prompt : 'I want to explore this style';
    
    setInput(message);
    setSelectedCategory(style);
    
    // Auto-send the message after a brief delay for visual feedback
    setTimeout(() => {
      sendMessage();
    }, 300);
  };

  const createMoreOfThisStyle = async (imageUrl: string, originalPrompt?: string) => {
    if (!originalPrompt) {
      toast({
        title: "Error",
        description: "No style information available for this image"
      });
      return;
    }

    // Create a message asking Maya to create more of this style
    const message = `Create more images like this style: ${originalPrompt}`;
    setInput(message);
    
    // Auto-send the message
    setTimeout(() => {
      sendMessage();
    }, 300);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-black border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <>
      <MemberNavigation transparent={true} />
      
      {/* Maya Chat Interface - Editorial Design System */}
      <div className="min-h-screen bg-white">
        {/* Hero Section with Maya's Style Categories */}
        <section className="hero relative h-screen bg-black text-white overflow-hidden flex items-center justify-center">
          <div 
            className="absolute inset-0 opacity-40"
            style={{
              backgroundImage: 'url(https://images.unsplash.com/photo-1580489944761-15a19d654956?w=1200&h=800&fit=crop&crop=face)',
              backgroundSize: 'cover',
              backgroundPosition: 'center 20%'
            }}
          />
          <div className="relative z-10 text-center max-w-4xl px-10">
            <div className="text-xs tracking-widest uppercase text-white/70 mb-8 font-light">
              Sandra's AI Bestie for Personal Branding
            </div>
            <h1 style={{fontFamily: 'Times New Roman, serif'}} className="text-8xl md:text-9xl lg:text-[12rem] leading-none font-extralight tracking-wide uppercase mb-5">
              MAYA
            </h1>
            <h2 style={{fontFamily: 'Times New Roman, serif'}} className="text-2xl md:text-4xl leading-none font-extralight tracking-widest uppercase opacity-80 mb-16">
              Luxury Styling Intelligence
            </h2>
            <p className="text-base tracking-wider uppercase opacity-80 font-light max-w-2xl mx-auto">
              Transform your personal brand with professional photos powered by Sandra's 120K-follower journey
            </p>
            <button 
              onClick={scrollToChat}
              className="mt-12 inline-block px-8 py-4 text-xs tracking-widest uppercase border border-white text-white bg-transparent hover:bg-white hover:text-black transition-all duration-300"
            >
              Start Your Style Journey
            </button>
          </div>
        </section>

        {/* Style Categories Section */}
        <section className="py-32 bg-[#f5f5f5]">
          <div className="max-w-7xl mx-auto px-10">
            <div className="text-center mb-24">
              <div className="text-xs tracking-widest uppercase text-gray-600 mb-6">
                Maya's Luxury Style Categories
              </div>
              <h2 style={{fontFamily: 'Times New Roman, serif'}} className="text-6xl md:text-8xl font-extralight uppercase tracking-wide text-black">
                Your Style
              </h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {MAYA_STYLE_CATEGORIES.map((category) => (
                <div 
                  key={category.id}
                  className="group relative bg-white hover:bg-black transition-all duration-500 cursor-pointer"
                  onClick={() => handleStyleSelect(category.id)}
                >
                  <div className="aspect-[4/5] relative overflow-hidden">
                    <img 
                      src={category.image} 
                      alt={category.name}
                      className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="absolute bottom-0 left-0 right-0 p-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                      <h4 className="text-xs tracking-widest uppercase mb-2">{category.name}</h4>
                      <p className="text-sm text-white/80">{category.description}</p>
                    </div>
                  </div>
                  <div className="p-8 group-hover:text-white transition-colors duration-500">
                    <h3 className="text-xs tracking-widest uppercase mb-3">{category.name}</h3>
                    <p className="text-sm text-gray-600 group-hover:text-white/80 transition-colors duration-500">
                      {category.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Main Chat Interface */}
        <section className="main-container py-20">
          <div className="max-w-7xl mx-auto px-10">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
              
              {/* Chat History Sidebar */}
              <div className="lg:col-span-1">
                <div className="bg-[#f5f5f5] p-8">
                  <div className="flex items-center justify-between mb-8">
                    <h3 className="text-xs tracking-widest uppercase">Style Sessions</h3>
                    <button 
                      onClick={startNewSession}
                      className="p-2 hover:bg-black hover:text-white transition-colors duration-300"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    <ChatHistoryLinks onChatSelect={loadChatHistory} />
                  </div>
                </div>
              </div>

              {/* Chat Messages */}
              <div className="lg:col-span-3">
                <div className="min-h-[600px] max-h-[800px] overflow-y-auto mb-8 space-y-8">
                  {messages.length === 0 ? (
                    <div className="text-center py-20">
                      <Sparkles className="mx-auto mb-6" size={48} />
                      <h3 style={{fontFamily: 'Times New Roman, serif'}} className="text-3xl font-extralight uppercase tracking-wide mb-4">
                        Start Your Conversation
                      </h3>
                      <p className="text-gray-600 max-w-md mx-auto">
                        Ask Maya about any style, get professional photos, or explore luxury fashion intelligence
                      </p>
                    </div>
                  ) : (
                    messages.map((message, index) => (
                      <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-2xl ${message.role === 'user' ? 'bg-black text-white' : 'bg-[#f5f5f5]'} p-8`}>
                          <div className="text-xs tracking-widest uppercase mb-4 opacity-60">
                            {message.role === 'user' ? 'You' : 'Maya'} • {formatTimestamp(message.timestamp)}
                          </div>
                          <div className="whitespace-pre-wrap">{message.content}</div>
                          
                          {/* Image Preview with Save & Create More Actions */}
                          {message.imagePreview && message.imagePreview.length > 0 && (
                            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                              {message.imagePreview.map((imageUrl, imgIndex) => (
                                <div key={imgIndex} className="relative group">
                                  <img 
                                    src={imageUrl} 
                                    alt="Generated style"
                                    className="w-full aspect-[4/5] object-cover cursor-pointer"
                                    onClick={() => setSelectedImage(imageUrl)}
                                  />
                                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-4">
                                    <button
                                      onClick={() => saveToGallery(imageUrl)}
                                      disabled={savingImages.has(imageUrl) || savedImages.has(imageUrl)}
                                      className="p-3 bg-white text-black hover:bg-gray-100 transition-colors duration-300"
                                    >
                                      <Save size={16} />
                                    </button>
                                    <button
                                      onClick={() => createMoreOfThisStyle(imageUrl, message.generatedPrompt)}
                                      className="p-3 bg-white text-black hover:bg-gray-100 transition-colors duration-300"
                                    >
                                      <Sparkles size={16} />
                                    </button>
                                  </div>
                                  {savedImages.has(imageUrl) && (
                                    <div className="absolute top-4 right-4 bg-green-500 text-white p-2 rounded-full">
                                      <Save size={16} />
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Generate Images Button */}
                          {message.canGenerate && message.generatedPrompt && (
                            <button
                              onClick={() => generateImages(message.generatedPrompt!)}
                              disabled={isGenerating}
                              className="mt-6 w-full bg-black text-white py-4 px-6 text-xs tracking-widest uppercase hover:bg-gray-800 transition-colors duration-300 disabled:opacity-50"
                            >
                              {isGenerating ? `Generating... ${generationProgress}%` : 'Generate Images'}
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="border border-gray-200 p-6">
                  <Textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyPress}
                    placeholder="Ask Maya about your style, request specific looks, or get luxury fashion advice..."
                    className="min-h-[120px] border-none resize-none focus:ring-0 text-base bg-transparent"
                    disabled={isTyping || isGenerating}
                  />
                  <div className="flex justify-between items-center mt-4">
                    <div className="text-xs text-gray-500 tracking-wider uppercase">
                      {isTyping ? 'Maya is styling...' : 'Ready for your style request'}
                    </div>
                    <Button
                      onClick={sendMessage}
                      disabled={!input.trim() || isTyping}
                      className="bg-black text-white px-8 py-3 text-xs tracking-widest uppercase hover:bg-gray-800 disabled:opacity-50"
                    >
                      Send
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Image Modal */}
        {selectedImage && (
          <div 
            className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-8"
            onClick={() => setSelectedImage(null)}
          >
            <img 
              src={selectedImage} 
              alt="Generated style"
              className="max-w-full max-h-full object-contain"
            />
          </div>
        )}
      </div>

      {/* Enhanced Chat Category Styles */}
      <style dangerouslySetInnerHTML={{ __html: `
        .category-section {
          margin-bottom: 1rem;
        }
        
        .category-header {
          cursor: pointer;
          padding: 0.75rem;
          background: #fafafa;
          border: 1px solid #e5e5e5;
          display: flex;
          align-items: center;
          justify-content: space-between;
          transition: all 0.2s ease;
        }
        
        .category-header:hover {
          background: #f0f0f0;
        }
        
        .category-name {
          font-size: 0.75rem;
          font-weight: 500;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          flex: 1;
        }
        
        .category-chevron {
          transition: transform 0.2s ease;
        }
        
        .category-chevron.expanded {
          transform: rotate(180deg);
        }
        
        .category-sessions {
          border-left: 1px solid #e5e5e5;
          border-right: 1px solid #e5e5e5;
          border-bottom: 1px solid #e5e5e5;
        }
        
        .session-item {
          padding: 0.75rem 1rem;
          border-bottom: 1px solid #f0f0f0;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .session-item:hover {
          background: #fafafa;
        }
        
        .session-title {
          font-size: 0.875rem;
          font-weight: 500;
          margin-bottom: 0.25rem;
          line-height: 1.4;
        }
        
        .session-preview {
          font-size: 0.75rem;
          color: #666;
          line-height: 1.3;
        }
        
        .more-sessions {
          padding: 0.75rem 1rem;
          font-size: 0.75rem;
          color: #666;
          text-align: center;
          background: #fafafa;
        }
      `}}
      />
    </>
  );
}
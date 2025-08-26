import { KeyboardEvent, useState, useEffect, useRef } from 'react';
import { useAuth } from '../hooks/use-auth';
import { useLocation } from 'wouter';
import { useToast } from '../hooks/use-toast';
import { useQueryClient, useQuery } from '@tanstack/react-query';
import { Button } from '../components/ui/button';
import { Textarea } from '../components/ui/textarea';
import { apiRequest } from '../lib/queryClient';
import { MemberNavigation } from '../components/member-navigation';
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
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    try {
      const response = await apiRequest('/api/member-maya-chat', 'POST', {
        message: input.trim(),
        chatId: currentChatId,
        chatHistory: messages.map(msg => ({
          role: msg.role,
          content: msg.content
        }))
      });

      if (response.chatId && !currentChatId) {
        setCurrentChatId(response.chatId);
        window.history.replaceState({}, '', `/maya?chat=${response.chatId}`);
      }

      const mayaMessage: ChatMessage = {
        role: 'maya',
        content: response.message,
        timestamp: new Date().toISOString(),
        canGenerate: response.canGenerate,
        generatedPrompt: response.generatedPrompt,
      };

      setMessages(prev => [...prev, mayaMessage]);

      // Invalidate chat list to refresh with new/updated chat
      queryClient.invalidateQueries({ queryKey: ['/api/maya-chats'] });

    } catch (error) {
      console.error('Error sending message:', error);
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
      const response = await apiRequest('/api/maya-generate-images', 'POST', {
        prompt,
        chatId: currentChatId
      });

      if (response.predictionId) {
        // Poll for completion
        const pollForImages = async () => {
          try {
            const statusResponse = await apiRequest(`/api/check-generation/${response.predictionId}`);

            if (statusResponse.status === 'completed' && statusResponse.imageUrls) {
              // Find the last Maya message and update it with images
              setMessages(prev => {
                const newMessages = [...prev];
                for (let i = newMessages.length - 1; i >= 0; i--) {
                  if (newMessages[i].role === 'maya' && newMessages[i].canGenerate) {
                    newMessages[i] = {
                      ...newMessages[i],
                      imagePreview: statusResponse.imageUrls,
                      canGenerate: false
                    };
                    break;
                  }
                }
                return newMessages;
              });
              setIsGenerating(false);
              setGenerationProgress(100);
            } else if (statusResponse.status === 'failed') {
              throw new Error(statusResponse.error || 'Generation failed');
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

      {/* Editorial Category Styles */}
      <style dangerouslySetInnerHTML={{ __html: `
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        :root {
          --black: #0a0a0a;
          --white: #ffffff;
          --editorial-gray: #f5f5f5;
          --mid-gray: #fafafa;
          --soft-gray: #666666;
          --accent-line: #e5e5e5;
        }

        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          font-weight: 300;
          color: var(--black);
          background: var(--white);
          line-height: 1.6;
          letter-spacing: -0.01em;
        }

        /* Hero Section - Keep existing image hero */
        .hero {
          height: 100vh;
          background: var(--black);
          color: var(--white);
          position: relative;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .hero-bg {
          position: absolute;
          inset: 0;
          opacity: 0.4;
        }

        .hero-bg img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center 20%;
        }

        /* Hero Content - Only text changes */
        .hero-content {
          position: relative;
          z-index: 2;
          text-align: center;
          max-width: 800px;
          padding: 0 40px;
        }

        .hero-eyebrow {
          font-size: 11px;
          letter-spacing: 0.4em;
          text-transform: uppercase;
          color: rgba(255, 255, 255, 0.7);
          margin-bottom: 30px;
          font-weight: 300;
        }

        .hero-title {
          font-family: 'Times New Roman', serif;
          font-size: clamp(3rem, 8vw, 6rem);
          line-height: 0.9;
          font-weight: 200;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          margin-bottom: 20px;
          color: var(--white);
        }

        .hero-subtitle {
          font-family: 'Times New Roman', serif;
          font-size: clamp(1rem, 3vw, 2rem);
          font-style: italic;
          letter-spacing: 0.05em;
          opacity: 0.9;
          margin-bottom: 40px;
        }

        .hero-cta {
          display: inline-block;
          padding: 16px 32px;
          font-size: 11px;
          font-weight: 400;
          letter-spacing: 0.3em;
          text-transform: uppercase;
          text-decoration: none;
          border: 1px solid var(--white);
          color: var(--white);
          background: transparent;
          transition: all 300ms ease;
          cursor: pointer;
        }

        .hero-cta:hover {
          background: var(--white);
          color: var(--black);
        }

        /* Main Layout */
        .main-container {
          display: flex;
          min-height: 100vh;
          max-width: 1400px;
          margin: 0 auto;
        }

        /* Left Sidebar */
        .sidebar {
          width: 300px;
          background: var(--editorial-gray);
          border-right: 1px solid var(--accent-line);
          padding: 40px 0;
          overflow-y: auto;
        }

        .sidebar-section {
          padding: 0 30px;
          margin-bottom: 40px;
        }

        .sidebar-title {
          font-size: 11px;
          font-weight: 400;
          letter-spacing: 0.3em;
          text-transform: uppercase;
          color: var(--soft-gray);
          margin-bottom: 20px;
        }

        .new-session-btn {
          width: 100%;
          padding: 16px 0;
          background: var(--black);
          color: var(--white);
          border: none;
          font-size: 11px;
          font-weight: 400;
          letter-spacing: 0.3em;
          text-transform: uppercase;
          cursor: pointer;
          transition: all 300ms ease;
          margin-bottom: 30px;
        }

        .new-session-btn:hover {
          background: var(--soft-gray);
        }

        .session-item {
          padding: 12px 0;
          border-bottom: 1px solid var(--accent-line);
          cursor: pointer;
          transition: all 200ms ease;
        }

        .session-item:hover {
          background: rgba(10, 10, 10, 0.05);
        }

        .session-title {
          font-size: 14px;
          font-weight: 400;
          margin-bottom: 4px;
          line-height: 1.4;
        }

        .session-preview {
          font-size: 12px;
          color: var(--soft-gray);
          line-height: 1.3;
        }

        .more-sessions {
          color: var(--soft-gray);
          font-size: 12px;
          text-align: center;
          padding: 20px 0;
        }

        /* Chat Area */
        .chat-area {
          flex: 1;
          display: flex;
          flex-direction: column;
          background: var(--white);
        }

        /* Chat Header */
        .chat-header {
          padding: 30px 40px;
          border-bottom: 1px solid var(--accent-line);
          background: var(--white);
        }

        .chat-title {
          font-family: 'Times New Roman', serif;
          font-size: 24px;
          font-weight: 200;
          margin-bottom: 8px;
        }

        .chat-subtitle {
          font-size: 14px;
          color: var(--soft-gray);
        }

        /* Messages Container */
        .messages-container {
          flex: 1;
          overflow-y: auto;
          padding: 40px;
        }

        /* Welcome State */
        .welcome-state {
          text-align: center;
          max-width: 600px;
          margin: 60px auto;
        }

        .maya-avatar {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          margin: 0 auto 30px;
          overflow: hidden;
          border: 2px solid var(--accent-line);
        }

        .maya-avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .welcome-eyebrow {
          font-size: 11px;
          font-weight: 400;
          letter-spacing: 0.4em;
          text-transform: uppercase;
          color: var(--soft-gray);
          margin-bottom: 20px;
        }

        .welcome-title {
          font-family: 'Times New Roman', serif;
          font-size: clamp(2rem, 4vw, 3rem);
          font-weight: 200;
          letter-spacing: -0.01em;
          line-height: 1;
          text-transform: uppercase;
          margin-bottom: 20px;
        }

        .welcome-description {
          font-size: 16px;
          line-height: 1.6;
          margin-bottom: 40px;
          color: var(--soft-gray);
        }

        /* Style Quick-Select */
        .style-quickselect {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 15px;
          margin-bottom: 40px;
        }

        .style-option {
          aspect-ratio: 1;
          background: var(--editorial-gray);
          border: 1px solid var(--accent-line);
          cursor: pointer;
          transition: all 300ms ease;
          position: relative;
          overflow: hidden;
        }

        .style-option:hover {
          transform: scale(1.05);
          border-color: var(--black);
        }

        .style-preview {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 10px;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: var(--soft-gray);
        }

        .style-label {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          background: linear-gradient(transparent, rgba(10, 10, 10, 0.8));
          color: var(--white);
          padding: 15px 10px 10px;
          font-size: 10px;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          text-align: center;
          transform: translateY(100%);
          transition: transform 300ms ease;
        }

        .style-option:hover .style-label {
          transform: translateY(0);
        }

        /* Messages */
        .message {
          margin-bottom: 30px;
          max-width: 700px;
        }

        .message.maya {
          margin-right: auto;
        }

        .message.user {
          margin-left: auto;
          text-align: right;
        }

        .message-header {
          display: flex;
          align-items: center;
          margin-bottom: 12px;
          gap: 12px;
        }

        .message.user .message-header {
          justify-content: flex-end;
        }

        .message-avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: var(--editorial-gray);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 10px;
          color: var(--soft-gray);
          overflow: hidden;
        }

        .message-avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .message.user .message-avatar {
          background: var(--black);
          color: var(--white);
        }

        .message-sender {
          font-size: 11px;
          font-weight: 400;
          letter-spacing: 0.3em;
          text-transform: uppercase;
          color: var(--soft-gray);
        }

        .message-time {
          font-size: 10px;
          color: var(--soft-gray);
          opacity: 0.6;
        }

        .message-content {
          background: var(--editorial-gray);
          padding: 24px;
          border-radius: 0;
          position: relative;
        }

        .message.user .message-content {
          background: var(--black);
          color: var(--white);
        }

        .message-text {
          font-size: 15px;
          line-height: 1.6;
        }

        .message-text strong {
          font-weight: 400;
        }

        /* Typing Indicator */
        .typing-indicator {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 30px;
        }

        .typing-dots {
          display: flex;
          gap: 4px;
        }

        .typing-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: var(--soft-gray);
          animation: typing 1.4s infinite;
        }

        .typing-dot:nth-child(2) { animation-delay: 0.2s; }
        .typing-dot:nth-child(3) { animation-delay: 0.4s; }

        @keyframes typing {
          0%, 60%, 100% { opacity: 0.3; }
          30% { opacity: 1; }
        }

        .typing-text {
          font-size: 12px;
          color: var(--soft-gray);
        }

        /* Input Area */
        .input-area {
          padding: 30px 40px;
          border-top: 1px solid var(--accent-line);
          background: var(--white);
        }

        .input-container {
          display: flex;
          gap: 15px;
          align-items: flex-end;
        }

        .input-field {
          flex: 1;
          border: 1px solid var(--accent-line);
          background: var(--white);
          padding: 16px 20px;
          font-size: 14px;
          line-height: 1.4;
          font-family: inherit;
          resize: none;
          min-height: 24px;
          max-height: 120px;
        }

        .input-field:focus {
          outline: none;
          border-color: var(--black);
        }

        .input-field::placeholder {
          color: var(--soft-gray);
          text-transform: uppercase;
          font-size: 11px;
          letter-spacing: 0.3em;
        }

        .send-btn {
          padding: 16px 24px;
          background: var(--black);
          color: var(--white);
          border: none;
          font-size: 11px;
          font-weight: 400;
          letter-spacing: 0.3em;
          text-transform: uppercase;
          cursor: pointer;
          transition: all 300ms ease;
        }

        .send-btn:hover {
          background: var(--soft-gray);
        }

        .send-btn:disabled {
          background: var(--accent-line);
          cursor: not-allowed;
        }

        /* Image Grid */
        .image-grid {
          margin-top: 16px;
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
        }

        .image-item {
          position: relative;
          group: hover;
          cursor: pointer;
        }

        .image-item img {
          width: 100%;
          height: 192px;
          object-fit: cover;
          border-radius: 4px;
          transition: transform 200ms ease;
        }

        .image-item:hover img {
          transform: scale(1.05);
        }

        .save-btn {
          position: absolute;
          top: 8px;
          right: 8px;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(255, 255, 255, 0.9);
          border: 1px solid #e5e5e5;
          border-radius: 50%;
          transition: all 200ms ease;
          opacity: 0;
          backdrop-filter: blur(8px);
        }

        .image-item:hover .save-btn {
          opacity: 1;
        }

        .save-btn:hover {
          background: white;
          border-color: #ccc;
        }

        .save-btn:disabled .spinner {
          width: 12px;
          height: 12px;
          border: 1px solid #999;
          border-top-color: transparent;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .generate-btn {
          margin-top: 16px;
          padding-top: 16px;
          border-top: 1px solid #ccc;
        }

        .generate-btn button {
          padding: 12px 24px;
          background: var(--black);
          color: var(--white);
          border: none;
          font-size: 11px;
          font-weight: 400;
          letter-spacing: 0.3em;
          text-transform: uppercase;
          cursor: pointer;
          transition: all 300ms ease;
        }

        .generate-btn button:hover {
          background: var(--soft-gray);
        }

        .generate-btn button:disabled {
          background: #999;
          cursor: not-allowed;
        }

        /* Responsive */
        @media (max-width: 768px) {
          .main-container {
            flex-direction: column;
            height: auto;
          }

          .sidebar {
            width: 100%;
            height: auto;
            order: 2;
          }

          .chat-area {
            order: 1;
            min-height: 70vh;
          }

          .messages-container,
          .input-area,
          .chat-header {
            padding: 20px;
          }

          .style-quickselect {
            grid-template-columns: repeat(2, 1fr);
          }

          .hero {
            margin-top: 0;
          }
        }
      ` }} />

      {/* Hero Section - Keep existing image hero, only text changes */}
      <section className="hero">
        <div className="hero-bg">
          <img src="https://i.postimg.cc/mkqSzq3M/out-1-20.png" alt="Maya - Your Personal Brand Stylist" />
        </div>

        <div className="hero-content">
          <div className="hero-eyebrow">Professional photos, no photographer needed</div>
          <h1 className="hero-title">Maya</h1>
          <p className="hero-subtitle">Your Personal Brand Stylist</p>
          <button className="hero-cta" onClick={scrollToChat}>Start Creating</button>
        </div>
      </section>

      <div className="main-container">
        {/* Sidebar */}
        <aside className="sidebar">
          <div className="sidebar-section">
            <button className="new-session-btn" onClick={startNewSession}>New Session</button>
          </div>

          <div className="sidebar-section">
            <div className="sidebar-title">Previous Sessions</div>
            <ChatHistoryLinks onChatSelect={(chatId) => {
              loadChatHistory(chatId);
              window.history.replaceState({}, '', `/maya?chat=${chatId}`);
            }} />
          </div>
        </aside>

        {/* Main Chat Area */}
        <main className="chat-area">
          {/* Chat Header */}
          <div className="chat-header">
            <h1 className="chat-title">Maya Studio</h1>
            <p className="chat-subtitle">Create photos that build your brand</p>
          </div>

          {/* Messages Container */}
          <div className="messages-container">
            {messages.length === 0 ? (
              /* Welcome State */
              <div className="welcome-state">
                <div className="maya-avatar">
                  <img src="https://i.postimg.cc/mkqSzq3M/out-1-20.png" alt="Maya - Your Personal Brand Stylist" />
                </div>
                <div className="welcome-eyebrow">Personal Brand Photos</div>
                <h2 className="welcome-title">Ready to look incredible in every photo?</h2>
                <p className="welcome-description">I'm Maya, your personal brand stylist. I've got Sandra's styling expertise from fashion week to building her empire. I'll help you create photos that show your power and build your brand. What should we create?</p>

                {/* Style Quick-Select with SSELFIE categories */}
                <div className="style-quickselect">
                  <div className="style-option" onClick={() => handleStyleSelect('future-ceo')}>
                    <div className="style-preview">Future CEO</div>
                    <div className="style-label">Professional Power</div>
                  </div>
                  <div className="style-option" onClick={() => handleStyleSelect('off-duty-model')}>
                    <div className="style-preview">Off-Duty Model</div>
                    <div className="style-label">Effortless Cool</div>
                  </div>
                  <div className="style-option" onClick={() => handleStyleSelect('social-queen')}>
                    <div className="style-preview">Social Queen</div>
                    <div className="style-label">Content Ready</div>
                  </div>
                  <div className="style-option" onClick={() => handleStyleSelect('date-night-goddess')}>
                    <div className="style-preview">Date Night Goddess</div>
                    <div className="style-label">Magnetic Energy</div>
                  </div>
                  <div className="style-option" onClick={() => handleStyleSelect('everyday-icon')}>
                    <div className="style-preview">Everyday Icon</div>
                    <div className="style-label">Polished Daily</div>
                  </div>
                  <div className="style-option" onClick={() => handleStyleSelect('power-player')}>
                    <div className="style-preview">Power Player</div>
                    <div className="style-label">Authority Energy</div>
                  </div>
                </div>
              </div>
            ) : (
              /* Messages */
              <div>
                {messages.map((message, index) => (
                  <div key={index} className={`message ${message.role}`}>
                    <div className="message-header">
                      {message.role === 'maya' && (
                        <>
                          <div className="message-avatar">
                            <img src="https://i.postimg.cc/mkqSzq3M/out-1-20.png" alt="Maya" />
                          </div>
                          <div className="message-sender">Maya</div>
                        </>
                      )}
                      <div className="message-time">{formatTimestamp(message.timestamp)}</div>
                      {message.role === 'user' && (
                        <>
                          <div className="message-sender">{user?.firstName || 'You'}</div>
                          <div className="message-avatar">{user?.firstName?.[0] || 'U'}</div>
                        </>
                      )}
                    </div>
                    <div className="message-content">
                      <div className="message-text">
                        {message.content.split('\n').map((line, lineIndex) => (
                          <span key={lineIndex}>
                            {line}
                            {lineIndex < message.content.split('\n').length - 1 && <br />}
                          </span>
                        ))}
                      </div>

                      {/* Image previews */}
                      {message.imagePreview && message.imagePreview.length > 0 && (
                        <div className="image-grid">
                          {message.imagePreview.map((imageUrl, imgIndex) => (
                            <div key={imgIndex} className="image-item">
                              <img
                                src={imageUrl}
                                alt={`Generated image ${imgIndex + 1}`}
                                onClick={() => setSelectedImage(imageUrl)}
                              />

                              {/* Heart save button */}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  saveToGallery(imageUrl);
                                }}
                                disabled={savingImages.has(imageUrl)}
                                className="save-btn"
                                title={savedImages.has(imageUrl) ? 'Saved to gallery' : 'Save to gallery'}
                              >
                                {savingImages.has(imageUrl) ? (
                                  <div className="spinner"></div>
                                ) : savedImages.has(imageUrl) ? (
                                  <span style={{ color: '#ef4444', fontSize: '14px' }}>♥</span>
                                ) : (
                                  <span style={{ color: '#999', fontSize: '14px' }}>♡</span>
                                )}
                              </button>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Generation button */}
                      {message.canGenerate && message.generatedPrompt && (
                        <div className="generate-btn">
                          <button
                            onClick={() => generateImages(message.generatedPrompt!)}
                            disabled={isGenerating}
                          >
                            {isGenerating ? `Creating... ${generationProgress}%` : 'Create Photos'}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {/* Typing indicator */}
                {isTyping && (
                  <div className="typing-indicator">
                    <div className="message-avatar">
                      <img src="https://i.postimg.cc/mkqSzq3M/out-1-20.png" alt="Maya" />
                    </div>
                    <div className="typing-dots">
                      <div className="typing-dot"></div>
                      <div className="typing-dot"></div>
                      <div className="typing-dot"></div>
                    </div>
                    <div className="typing-text">Maya is styling your look...</div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="input-area">
            <div className="input-container">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyPress}
                className="input-field"
                placeholder="Tell Maya what kind of photos you want to create..."
                rows={1}
                disabled={isTyping}
                style={{
                  minHeight: '24px',
                  maxHeight: '120px',
                  height: 'auto'
                }}
                onInput={(e) => {
                  const target = e.target as HTMLTextAreaElement;
                  target.style.height = 'auto';
                  target.style.height = Math.min(target.scrollHeight, 120) + 'px';
                }}
              />
              <button
                onClick={sendMessage}
                disabled={!input.trim() || isTyping}
                className="send-btn"
              >
                Send
              </button>
            </div>
          </div>
        </main>
      </div>

      {/* Full-size Image Modal */}
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
              <div className="text-sm font-medium">Maya Personal Brand Photo</div>
              <div className="text-xs text-white/80">Save to use for your content and brand</div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
import React, { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../hooks/use-auth.js';
import { useMayaGeneration } from '../hooks/useMayaGeneration.js';
import { useMayaPersistence } from '../hooks/useMayaPersistence.js';
import { useToast } from '../hooks/use-toast.js';
import { MemberNavigation } from '../components/member-navigation.js';
import { MayaUploadComponent } from '../components/maya/MayaUploadComponent.js';
import { MayaExamplesGallery } from '../components/maya/MayaExamplesGallery.js';
import { useLocation } from 'wouter';
import { Sparkles, Send, X, Heart, Download, ChevronDown, ChevronUp, RefreshCw } from 'lucide-react';

// Preserve all interfaces
interface ChatMessage {
  id: string;
  type: 'user' | 'maya' | 'upload' | 'examples';
  content: string;
  timestamp: string;
  conceptCards?: ConceptCard[];
  isStreaming?: boolean;
  showUpload?: boolean;
  showExamples?: boolean;
}

interface ConversationData {
  messages: ChatMessage[];
  [key: string]: unknown;
}

interface ConceptCard {
  id: string;
  title: string;
  description: string;
  fluxPrompt?: string;
  fullPrompt?: string;
  category?: string;
  imageUrl?: string;
  generatedImages?: string[];
  isGenerating?: boolean;
  isLoading?: boolean;
  hasGenerated?: boolean;
}

// Clean display formatter - strips emojis
const cleanDisplayTitle = (title: string): string => {
  return title.replace(/[✨💫🔥🌟💎🌅🏢💼🌊👑💃📸🎬♦️🚖]/g, '').trim();
};

export default function Maya() {
  // Preserve all hooks and state
  const { user } = useAuth();
  const [location, setLocation] = useLocation();
  const [message, setMessage] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());
  const [isNearBottom, setIsNearBottom] = useState(true);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);
  const [hasStartedChat, setHasStartedChat] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Preserve persistence system
  const {
    messages,
    setMessages,
    addMessage,
    updateMessage,
    updateConceptCard,
    clearConversation,
    getConversationStats,
    isLoading: isPersistenceLoading,
    sessionId
  } = useMayaPersistence(user?.id);

  // Preserve Maya generation hook
  const { generateFromSpecificConcept } = useMayaGeneration(messages, setMessages, null, setIsTyping, toast);

  // Preserve all useEffect hooks
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Preserve auto-scroll system
  const checkIfNearBottom = () => {
    if (!chatContainerRef.current) return false;
    const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
    const threshold = 100;
    return scrollHeight - scrollTop - clientHeight < threshold;
  };

  const handleScroll = () => {
    const nearBottom = checkIfNearBottom();
    setIsNearBottom(nearBottom);
    setShouldAutoScroll(nearBottom);
  };

  const smartScrollToBottom = (delay = 0, force = false) => {
    if (!force && !shouldAutoScroll) return;
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ 
        behavior: 'smooth',
        block: 'end'
      });
    }, delay);
  };

  const scrollToNewContent = (elementId?: string) => {
    if (!shouldAutoScroll) return;
    if (elementId) {
      const element = document.getElementById(elementId);
      if (element) {
        element.scrollIntoView({ 
          behavior: 'smooth',
          block: 'center'
        });
        return;
      }
    }
    smartScrollToBottom(300);
  };

  const closeSidebar = () => setIsSidebarOpen(false);

  // Preserve image modal
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // Preserve gallery functions
  const handleAutoSaveToGallery = async (imageUrl: string, conceptTitle: string) => {
    try {
      console.log('Auto-saving to gallery:', conceptTitle);
      const response = await fetch('/api/ai-images', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageUrl,
          prompt: conceptTitle,
          category: detectCategory(conceptTitle),
          isAutoSaved: true
        })
      });
      if (response.ok) {
        console.log('Auto-saved to gallery successfully');
      }
    } catch (error) {
      console.error('Auto-save failed:', error);
    }
  };

  const handleSaveToGallery = async (imageUrl: string, conceptTitle: string) => {
    try {
      console.log('Manual save to gallery:', conceptTitle);
      toast({ title: "Saving to Gallery", description: "Adding image to your personal collection..." });
      const response = await fetch('/api/ai-images', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageUrl,
          prompt: conceptTitle,
          category: detectCategory(conceptTitle),
          isFavorite: true
        })
      });
      if (response.ok) {
        toast({ title: "Saved!", description: "Image added to your gallery" });
      }
    } catch (error) {
      console.error('Save failed:', error);
      toast({ title: "Save Failed", description: "Please try again" });
    }
  };

  const detectCategory = (title: string): string => {
    const text = title.toLowerCase();
    if (text.includes('business') || text.includes('professional') || text.includes('corporate') || text.includes('executive')) return 'Business';
    if (text.includes('fashion') || text.includes('style') || text.includes('elegant') || text.includes('luxe')) return 'Fashion';
    if (text.includes('travel') || text.includes('destination') || text.includes('adventure') || text.includes('vacation')) return 'Travel';
    return 'Lifestyle';
  };

  // Preserve database sync
  const { data: conversationData } = useQuery({
    queryKey: ['/api/maya/conversation'],
    enabled: !!user?.id && !isPersistenceLoading
  });

  useEffect(() => {
    if (conversationData && (conversationData as ConversationData).messages && messages.length === 0) {
      console.log('Syncing database conversation with persistent storage');
      setMessages(() => (conversationData as ConversationData).messages.slice(-20));
      setHasStartedChat(true);
    }
  }, [conversationData, messages.length, setMessages]);

  useEffect(() => {
    if (messages.length === 0 && !conversationData) {
      setHasStartedChat(false);
    }
  }, [messages.length, conversationData]);

  // Preserve handoff context
  useEffect(() => {
    const handoffContext = localStorage.getItem('maya-handoff-context');
    if (handoffContext && user) {
      try {
        const context = JSON.parse(handoffContext);
        console.log('🔄 ENHANCED HANDOFF: Received authenticated context from workspace:', context.message);
        if (context.userProfile?.userId === user.id) {
          const userName = context.userProfile?.name || 'there';
          addMessage({
            type: 'maya',
            content: `Welcome to my creation studio, ${userName}! I received your request from the workspace: "${context.message}". With your professional background in ${context.businessContext?.industry || 'your field'}, let me create photo concepts that perfectly showcase your expertise...`,
            timestamp: new Date().toISOString()
          });
          setTimeout(() => {
            setMessage(context.message);
            sendMessage.mutate(context.message);
          }, 1000);
          console.log('✅ HANDOFF: User authentication verified, enhanced context applied');
        }
        localStorage.removeItem('maya-handoff-context');
        setHasStartedChat(true);
      } catch (error) {
        console.error('Failed to process enhanced handoff context:', error);
      }
    }
  }, [user]);

  // Preserve auto-scroll effects
  useEffect(() => {
    const chatContainer = chatContainerRef.current;
    if (!chatContainer) return;
    chatContainer.addEventListener('scroll', handleScroll);
    return () => chatContainer.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.type === 'user') {
        smartScrollToBottom(100, true);
      }
      else if (lastMessage.type === 'maya' && !isTyping) {
        smartScrollToBottom(500);
      }
    }
  }, [messages.length, isTyping, shouldAutoScroll]);

  useEffect(() => {
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.conceptCards && lastMessage.conceptCards.length > 0) {
        scrollToNewContent();
      }
    }
  }, [messages.map(m => m.conceptCards?.length).join(',')]);

  useEffect(() => {
    if (isTyping) {
      smartScrollToBottom(200);
    }
  }, [isTyping]);

  // Preserve card expansion toggle
  const toggleCardExpansion = (cardId: string) => {
    setExpandedCards(prev => {
      const newSet = new Set(prev);
      if (newSet.has(cardId)) {
        newSet.delete(cardId);
      } else {
        newSet.add(cardId);
      }
      return newSet;
    });
  };

  // Preserve generation handler
  const handleGenerateImage = async (card: ConceptCard) => {
    if (generateFromSpecificConcept) {
      await generateFromSpecificConcept(card.title, card.id);
    } else {
      console.error('Maya generation system not available');
    }
  };

  // Preserve new session handler
  const handleNewSession = () => {
    const stats = getConversationStats();
    if (stats.totalMessages > 0) {
      if (confirm(`Start a new styling session? This will clear your current conversation (${stats.totalMessages} messages, ${stats.conceptCards} concept cards, ${stats.images} images) but Maya will remember your style preferences.`)) {
        clearConversation();
        toast({ title: "New Session Started", description: "Fresh conversation started! Maya still remembers your style preferences." });
      }
    } else {
      clearConversation();
      toast({ title: "New Session", description: "Ready for a fresh styling conversation!" });
    }
  };

  // Preserve message mutation
  const sendMessage = useMutation({
    mutationFn: async (messageContent: string) => {
      const { apiFetch } = await import('../lib/api.js');
      return apiFetch('/maya/chat', {
        method: 'POST',
        json: {
          message: messageContent,
          context: 'styling'
        }
      });
    },
    onSuccess: (data) => {
      if (data.content || data.message) {
        addMessage({
          type: 'maya',
          content: data.response || data.content || data.message || '',
          timestamp: new Date().toISOString(),
          conceptCards: data.conceptCards || [],
          quickButtons: data.quickButtons || []
        });
      }
      setIsTyping(false);
    },
    onError: () => {
      setIsTyping(false);
      toast({ title: "Connection Error", description: "Failed to send message. Please try again." });
    }
  });

  const handleSendMessage = () => {
    if (!message.trim() || isTyping) return;
    addMessage({
      type: 'user', 
      content: message.trim(),
      timestamp: new Date().toISOString()
    });
    setIsTyping(true);
    sendMessage.mutate(message.trim());
    setMessage('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const startSimpleConversation = () => {
    setHasStartedChat(true);
    addMessage({
      type: 'maya',
      content: "I'm Maya, your photo creation specialist. Describe the professional photos you need and I'll create custom concepts with instant generation. What type of images are you looking to create?",
      timestamp: new Date().toISOString()
    });
  };

  return (
    <>
      <MemberNavigation darkText={true} />
      
      {/* Connection Status */}
      {!isOnline && (
        <div className="fixed top-20 left-0 right-0 bg-red-500 text-white text-center py-2 z-50">
          <div className="text-xs tracking-[0.3em] uppercase font-light">
            Offline • Check your connection
          </div>
        </div>
      )}
      
      <div className="min-h-screen bg-stone-50">
        {/* Header */}
        <div className="border-b border-stone-200/40 bg-white" style={{ paddingTop: '80px' }}>
          <div className="max-w-4xl mx-auto px-6 sm:px-8 py-8 sm:py-12">
            <div className="text-center space-y-8">
              {/* Title */}
              <div>
                <div className="text-xs tracking-[0.3em] uppercase text-stone-500 font-light mb-6">
                  Personal Brand Strategist
                </div>
                <h1 className="text-4xl sm:text-5xl font-serif font-extralight tracking-[0.25em] text-stone-950 uppercase leading-none mb-8">
                  MAYA
                </h1>
              </div>
              
              {/* Maya Profile */}
              <div>
                <div className="relative w-24 h-24 sm:w-32 sm:h-32 mx-auto mb-6 overflow-hidden rounded-full border-2 border-stone-200/60">
                  <img
                    src="https://i.postimg.cc/fTtCnzZv/out-1-22.png"
                    alt="Maya"
                    className="w-full h-full object-cover transition-all duration-500 grayscale-[20%] hover:grayscale-0"
                  />
                </div>
                <p className="text-xs tracking-[0.2em] uppercase text-stone-500 font-light">
                  Your AI Strategist
                </p>
              </div>
              
              {/* Actions */}
              <div className="flex items-center justify-center space-x-6 sm:space-x-8">
                <button
                  onClick={handleNewSession}
                  className="text-xs uppercase tracking-[0.2em] font-light text-stone-600 hover:text-stone-950 transition-colors duration-300 border-b border-transparent hover:border-stone-950 pb-1"
                >
                  New Session
                </button>
                <div className="w-px h-4 bg-stone-200"></div>
                <button
                  onClick={() => setLocation('/sselfie-gallery')}
                  className="text-xs uppercase tracking-[0.2em] font-light text-stone-600 hover:text-stone-950 transition-colors duration-300 border-b border-transparent hover:border-stone-950 pb-1"
                >
                  Gallery
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Chat Container */}
        <div 
          className="flex-1 max-w-4xl mx-auto px-6 sm:px-8 py-12 sm:py-16 overflow-y-auto"
          ref={chatContainerRef}
          style={{ minHeight: 'calc(100vh - 400px)' }}
        >
          {/* Welcome State */}
          {messages.length === 0 && (
            <div className="text-center py-16 sm:py-24">
              <div className="max-w-2xl mx-auto space-y-12">
                <h2 className="text-2xl sm:text-3xl font-serif font-extralight tracking-[0.2em] text-stone-950 uppercase leading-tight">
                  Create Your
                  <br />
                  Professional Photos
                </h2>
                <p className="text-stone-600 leading-relaxed font-light">
                  Describe the professional photos you need and I'll create custom concepts with instant generation.
                </p>

                {/* Quick Start Suggestions */}
                <div className="space-y-3 max-w-md mx-auto">
                  {[
                    "Corporate headshots with confidence",
                    "Creative lifestyle content", 
                    "Professional portraits that convert"
                  ].map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => setMessage(suggestion)}
                      className="w-full text-left px-6 py-4 border border-stone-200/60 rounded-2xl hover:border-stone-300/80 hover:bg-stone-100/40 transition-all duration-200 group"
                    >
                      <span className="text-sm font-light text-stone-700 group-hover:text-stone-950 transition-colors">
                        {suggestion}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Messages */}
          <div className="space-y-8 sm:space-y-12">
            {messages.map((msg) => (
              <div key={msg.id} className="animate-fadeIn">
                {msg.type === 'user' ? (
                  // User Message
                  <div className="flex justify-end">
                    <div className="max-w-2xl">
                      <div className="bg-stone-950 text-stone-50 px-6 sm:px-8 py-4 sm:py-6 rounded-3xl mb-2">
                        <p className="text-sm font-light leading-relaxed">{msg.content}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-xs text-stone-400 tracking-[0.2em] uppercase font-light">
                          You
                        </span>
                      </div>
                    </div>
                  </div>
                ) : msg.type === 'upload' ? (
                  // Upload Message
                  <div className="flex justify-start">
                    <div className="max-w-2xl w-full">
                      <div className="mb-4">
                        <span className="text-xs text-stone-400 tracking-[0.2em] uppercase font-light">
                          Maya
                        </span>
                      </div>
                      <div className="bg-stone-100/60 border border-stone-200/40 rounded-3xl px-6 sm:px-8 py-6 sm:py-8 mb-6">
                        <p className="text-stone-950 font-light leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                      </div>
                      {msg.showUpload && (
                        <div className="border-t border-stone-200/40 pt-8">
                          <MayaUploadComponent
                            onUploadComplete={(success) => {
                              if (success) {
                                console.log('Training initiated successfully');
                              }
                            }}
                            onTrainingStart={() => {
                              console.log('Training started');
                            }}
                            className="luxury-upload"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                ) : msg.type === 'examples' ? (
                  // Examples Message
                  <div className="flex justify-start">
                    <div className="max-w-2xl w-full">
                      <div className="mb-4">
                        <span className="text-xs text-stone-400 tracking-[0.2em] uppercase font-light">
                          Maya
                        </span>
                      </div>
                      <div className="bg-stone-100/60 border border-stone-200/40 rounded-3xl px-6 sm:px-8 py-6 sm:py-8 mb-6">
                        <p className="text-stone-950 font-light leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                      </div>
                      {msg.showExamples && (
                        <div className="border-t border-stone-200/40 pt-8">
                          <MayaExamplesGallery className="luxury-examples" />
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  // Maya Response with Concept Cards
                  <div className="flex justify-start">
                    <div className="max-w-2xl w-full">
                      <div className="mb-4">
                        <span className="text-xs text-stone-400 tracking-[0.2em] uppercase font-light">
                          Maya
                        </span>
                      </div>

                      <div className="bg-stone-100/60 border border-stone-200/40 rounded-3xl px-6 sm:px-8 py-6 sm:py-8">
                        <p className="text-stone-950 font-light leading-relaxed whitespace-pre-wrap">{msg.content}</p>

                        {/* Concept Cards */}
                        {msg.conceptCards && msg.conceptCards.length > 0 && (
                          <div className="mt-8 space-y-6">
                            <div className="h-px bg-stone-200/40 my-6"></div>
                            <h3 className="text-base sm:text-lg font-serif font-extralight tracking-[0.2em] uppercase text-stone-950 mb-6">
                              Photo Concepts
                            </h3>

                            {msg.conceptCards.map((card, index) => {
                              const isExpanded = expandedCards.has(card.id);

                              return (
                                <div key={card.id} className="border border-stone-200/40 bg-white rounded-2xl overflow-hidden">
                                  <div className="px-6 sm:px-8 py-6">
                                    <div className="flex items-start justify-between mb-4">
                                      <h4 className="text-base font-serif font-extralight tracking-[0.15em] uppercase text-stone-950 flex-1">
                                        {cleanDisplayTitle(card.title)}
                                      </h4>
                                      <span className="text-xs text-stone-400 tracking-[0.2em] uppercase font-light ml-6">
                                        #{(index + 1).toString().padStart(2, '0')}
                                      </span>
                                    </div>

                                    <p className="text-stone-600 font-light leading-relaxed mb-6">
                                      {card.description}
                                    </p>

                                    <div className="flex items-center justify-between">
                                      <button
                                        onClick={() => toggleCardExpansion(card.id)}
                                        className="text-xs tracking-[0.15em] uppercase font-light text-stone-600 hover:text-stone-950 transition-colors border-b border-transparent hover:border-stone-950 pb-1 flex items-center gap-2"
                                      >
                                        {isExpanded ? (
                                          <>
                                            <ChevronUp size={12} strokeWidth={1.5} />
                                            Show Less
                                          </>
                                        ) : (
                                          <>
                                            <ChevronDown size={12} strokeWidth={1.5} />
                                            View Details
                                          </>
                                        )}
                                      </button>
                                      <button
                                        onClick={() => handleGenerateImage(card)}
                                        disabled={card.isGenerating}
                                        className="bg-stone-950 text-stone-50 px-6 py-3 text-xs tracking-[0.15em] uppercase font-light rounded-2xl hover:bg-stone-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                      >
                                        {card.isGenerating ? (
                                          <>
                                            <RefreshCw size={12} className="animate-spin" strokeWidth={1.5} />
                                            Creating...
                                          </>
                                        ) : (
                                          <>
                                            <Sparkles size={12} strokeWidth={1.5} />
                                            Generate Photos
                                          </>
                                        )}
                                      </button>
                                    </div>

                                    {/* Loading State */}
                                    {card.isGenerating && (
                                      <div className="mt-6 pt-6 border-t border-stone-200/40">
                                        <div className="flex items-center text-xs text-stone-500 tracking-[0.2em] uppercase font-light">
                                          <div className="flex space-x-2 mr-4">
                                            <div className="w-1 h-1 bg-stone-600 rounded-full animate-pulse"></div>
                                            <div className="w-1 h-1 bg-stone-600 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                                            <div className="w-1 h-1 bg-stone-600 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
                                          </div>
                                          Creating your professional photos...
                                        </div>
                                      </div>
                                    )}

                                    {/* Generated Images */}
                                    {card.generatedImages && card.generatedImages.length > 0 && (
                                      <div className="mt-8 pt-8 border-t border-stone-200/40">
                                        <p className="text-xs text-stone-400 tracking-[0.2em] uppercase font-light mb-6">
                                          Your Professional Photos
                                        </p>
                                        <div className="grid grid-cols-2 gap-3 sm:gap-4">
                                          {card.generatedImages.map((imageUrl, imgIndex) => {
                                            const proxyUrl = `/api/proxy-image?url=${encodeURIComponent(imageUrl)}`;
                                            return (
                                              <div key={imgIndex} className="relative group aspect-square">
                                                <img 
                                                  src={proxyUrl}
                                                  alt={`Generated ${cleanDisplayTitle(card.title)} ${imgIndex + 1}`}
                                                  className="w-full h-full object-cover cursor-pointer hover:opacity-95 transition-opacity rounded-2xl"
                                                  onClick={() => setSelectedImage(proxyUrl)}
                                                  onLoad={() => handleAutoSaveToGallery(imageUrl, card.title)}
                                                  onError={(e) => {
                                                    const target = e.target as HTMLImageElement;
                                                    target.style.display = 'none';
                                                  }}
                                                />
                                                <button
                                                  className="absolute top-3 right-3 w-9 h-9 bg-stone-50/90 hover:bg-stone-50 rounded-xl flex items-center justify-center text-stone-900 opacity-0 group-hover:opacity-100 transition-all"
                                                  onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleSaveToGallery(imageUrl, card.title);
                                                  }}
                                                  title="Save to gallery"
                                                >
                                                  <Heart size={14} strokeWidth={1.5} />
                                                </button>
                                              </div>
                                            );
                                          })}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex justify-start">
                <div className="max-w-2xl">
                  <div className="mb-4">
                    <span className="text-xs text-stone-400 tracking-[0.2em] uppercase font-light">
                      Maya
                    </span>
                  </div>
                  <div className="bg-stone-100/60 border border-stone-200/40 rounded-3xl px-6 sm:px-8 py-6 flex items-center">
                    <div className="flex space-x-2">
                      <div className="w-2 h-2 bg-stone-600 rounded-full animate-pulse"></div>
                      <div className="w-2 h-2 bg-stone-600 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                      <div className="w-2 h-2 bg-stone-600 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
                    </div>
                    <span className="ml-4 text-xs text-stone-500 tracking-[0.2em] uppercase font-light">
                      Thinking...
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="border-t border-stone-200/40 bg-white sticky bottom-0">
          <div className="max-w-4xl mx-auto px-4 sm:px-8 py-4 sm:py-8">
            <div className="flex items-end space-x-3 sm:space-x-6">
              <div className="flex-1">
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Describe the photos you need for your business..."
                  className="w-full resize-none border border-stone-200/60 rounded-2xl focus:border-stone-600/60 focus:outline-none focus:ring-2 focus:ring-stone-600/40 px-4 sm:px-6 py-3 sm:py-4 bg-stone-100/40 transition-colors font-light text-stone-950 placeholder-stone-500"
                  rows={1}
                  disabled={isTyping}
                  style={{ 
                    minHeight: '52px', 
                    maxHeight: '120px',
                    lineHeight: 1.6,
                    fontSize: '16px'
                  }}
                />
              </div>
              <button
                onClick={handleSendMessage}
                disabled={!message.trim() || isTyping}
                className="bg-stone-950 text-stone-50 px-4 sm:px-8 py-3 sm:py-4 text-xs uppercase tracking-[0.2em] font-light rounded-2xl hover:bg-stone-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                style={{ minHeight: '52px', minWidth: '80px' }}
              >
                {isTyping ? (
                  'Sending...'
                ) : (
                  <>
                    <Send size={14} strokeWidth={1.5} />
                    Send
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Image Modal */}
        {selectedImage && (
          <div 
            className="fixed inset-0 bg-stone-950/95 backdrop-blur-sm flex items-center justify-center z-50 p-4 sm:p-8"
            onClick={() => setSelectedImage(null)}
          >
            <div className="relative max-w-full max-h-full">
              <img 
                src={selectedImage}
                alt="Full size view"
                className="max-w-full max-h-full object-contain rounded-2xl"
                onClick={(e) => e.stopPropagation()}
              />
              <button 
                onClick={() => setSelectedImage(null)}
                className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center bg-stone-50/20 backdrop-blur-sm hover:bg-stone-50/30 rounded-xl text-stone-50 transition-colors"
                title="Close"
              >
                <X size={20} strokeWidth={1.5} />
              </button>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .animate-fadeIn {
          animation: fadeIn 0.6s ease-out;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </>
  );
}
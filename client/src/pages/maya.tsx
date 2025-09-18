import React, { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../hooks/use-auth';
import { useMayaGeneration } from '../hooks/useMayaGeneration';
import { useMayaPersistence } from '../hooks/useMayaPersistence';
import { useToast } from '../hooks/use-toast';
import { MemberNavigation } from '../components/member-navigation';
import { MayaUploadComponent } from '../components/maya/MayaUploadComponent';
import { MayaExamplesGallery } from '../components/maya/MayaExamplesGallery';
import { useLocation } from 'wouter';

// Maya luxury workspace - aligned with SSELFIE brand guidelines

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

// Clean display formatter - strips emojis for professional appearance while preserving backend intelligence
const cleanDisplayTitle = (title: string): string => {
  // Remove Maya's styling emojis but keep the concept name for clean display
  return title.replace(/[✨💫🔥🌟💎🌅🏢💼🌊👑💃📸🎬♦️🚖]/g, '').trim();
};

export default function Maya() {
  const { user } = useAuth();
  const [location, setLocation] = useLocation();
  
  // REDIRECT TO NEW BRAND STUDIO - The old Maya is deprecated
  useEffect(() => {
    console.log('🔄 REDIRECTING: Old Maya → New Brand Studio');
    setLocation('/brand-studio');
  }, [setLocation]);
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

  // Enhanced persistence system
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

  // Initialize Maya generation hook with persistent messages
  const { generateFromSpecificConcept } = useMayaGeneration(messages, setMessages, null, setIsTyping, toast);

  // Connection status monitoring
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

  // Smart auto-scroll system
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

  // Image modal functionality
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // Auto-save and gallery functionality
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

  // Auto-categorize based on concept title
  const detectCategory = (title: string): string => {
    const text = title.toLowerCase();
    if (text.includes('business') || text.includes('professional') || text.includes('corporate') || text.includes('executive')) return 'Business';
    if (text.includes('fashion') || text.includes('style') || text.includes('elegant') || text.includes('luxe')) return 'Fashion';
    if (text.includes('travel') || text.includes('destination') || text.includes('adventure') || text.includes('vacation')) return 'Travel';
    return 'Lifestyle';
  };

  // Enhanced loading with database sync
  const { data: conversationData } = useQuery({
    queryKey: ['/api/maya/conversation'],
    enabled: !!user?.id && !isPersistenceLoading
  });

  // Sync database conversation with localStorage
  useEffect(() => {
    if (conversationData && (conversationData as any).messages && messages.length === 0) {
      console.log('Syncing database conversation with persistent storage');
      setMessages(() => (conversationData as any).messages.slice(-20));
      setHasStartedChat(true);
    }
  }, [conversationData, messages.length, setMessages]);

  // Initialize chat state for new users
  useEffect(() => {
    if (messages.length === 0 && !conversationData) {
      setHasStartedChat(false);
    }
  }, [messages.length, conversationData]);

  // ENHANCED SEAMLESS HANDOFF: Handle workspace-to-Maya transitions with user context
  useEffect(() => {
    const handoffContext = localStorage.getItem('maya-handoff-context');
    if (handoffContext && user) {
      try {
        const context = JSON.parse(handoffContext);
        console.log('🔄 ENHANCED HANDOFF: Received authenticated context from workspace:', context.message);
        console.log('👤 User Profile:', context.userProfile);
        console.log('🏢 Business Context:', context.businessContext);
        
        // Verify user authentication matches
        if (context.userProfile?.userId === user.id) {
          // Add personalized welcome transition message
          const userName = context.userProfile?.name || 'there';
          addMessage({
            type: 'maya',
            content: `Welcome to my creation studio, ${userName}! I received your request from the workspace: "${context.message}". With your professional background in ${context.businessContext?.industry || 'your field'}, let me create photo concepts that perfectly showcase your expertise...`,
            timestamp: new Date().toISOString()
          });
          
          // Auto-start conversation with enhanced context after brief delay
          setTimeout(() => {
            setMessage(context.message);
            sendMessage.mutate(context.message);
          }, 1000);
          
          console.log('✅ HANDOFF: User authentication verified, enhanced context applied');
        } else {
          console.warn('⚠️ HANDOFF: User authentication mismatch, proceeding with standard flow');
        }
        
        // Clear handoff context after use
        localStorage.removeItem('maya-handoff-context');
        setHasStartedChat(true);
        
      } catch (error) {
        console.error('Failed to process enhanced handoff context:', error);
      }
    }
  }, [user]);

  // Smart auto-scroll effects
  useEffect(() => {
    const chatContainer = chatContainerRef.current;
    if (!chatContainer) return;

    chatContainer.addEventListener('scroll', handleScroll);
    return () => chatContainer.removeEventListener('scroll', handleScroll);
  }, []);

  // Auto-scroll when new messages arrive
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

  // Auto-scroll when concept cards are generated
  useEffect(() => {
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.conceptCards && lastMessage.conceptCards.length > 0) {
        scrollToNewContent();
      }
    }
  }, [messages.map(m => m.conceptCards?.length).join(',')]);

  // Auto-scroll when typing indicator changes
  useEffect(() => {
    if (isTyping) {
      smartScrollToBottom(200);
    }
  }, [isTyping]);

  // Toggle concept card expansion
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

  // Generate image from concept card using Maya's generation system
  const handleGenerateImage = async (card: ConceptCard) => {
    if (generateFromSpecificConcept) {
      await generateFromSpecificConcept(card.title, card.id);
    } else {
      console.error('Maya generation system not available');
    }
  };

  // New Session Management
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

  // Send message to Maya with enhanced persistence
  const sendMessage = useMutation({
    mutationFn: async (messageContent: string) => {
      const { apiFetch } = await import('../lib/api');
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
      
      {/* Connection Status Indicator */}
      {!isOnline && (
        <div className="fixed top-20 left-0 right-0 bg-red-500 text-white text-center py-2 z-50">
          <div className="text-xs tracking-widest uppercase" style={{ fontFamily: 'Helvetica Neue', fontWeight: 300 }}>
            Offline • Check your connection
          </div>
        </div>
      )}
      
      <div className="min-h-screen bg-white">
        {/* Luxury Editorial Header */}
        <div className="border-b border-gray-100" style={{ paddingTop: '80px' }}>
          <div className="max-w-4xl mx-auto px-8 py-12">
            <div className="text-center">
              <div 
                className="text-xs tracking-widest uppercase text-gray-400 mb-8"
                style={{ fontFamily: 'Helvetica Neue', fontWeight: 300, letterSpacing: '0.3em' }}
              >
                Personal Brand Strategist
              </div>
              <h1 
                className="text-4xl md:text-5xl text-black mb-8"
                style={{ 
                  fontFamily: 'Times New Roman, serif', 
                  fontWeight: 200, 
                  letterSpacing: '0.25em',
                  lineHeight: 1.1
                }}
              >
                MAYA
              </h1>
              
              {/* Maya Profile Image - Editorial Style */}
              <div className="mb-8">
                <div className="relative w-32 h-32 mx-auto mb-6 overflow-hidden rounded-full">
                  <img
                    src="https://sselfie-training-zips.s3.eu-north-1.amazonaws.com/generated-images/undefined/undefined_1756382691095.png"
                    alt="Maya - Personal Brand Strategist"
                    className="w-full h-full object-cover object-center filter grayscale-[10%] hover:grayscale-0 transition-all duration-500"
                  />
                  <div className="absolute inset-0 bg-black/10 hover:bg-transparent transition-all duration-500"></div>
                </div>
                <p 
                  className="text-xs tracking-widest uppercase text-gray-500 text-center"
                  style={{ fontFamily: 'Helvetica Neue', fontWeight: 300, letterSpacing: '0.2em' }}
                >
                  Your AI Strategist
                </p>
              </div>
              
              <div className="flex items-center justify-center space-x-8">
                <button
                  onClick={handleNewSession}
                  className="text-xs uppercase tracking-[0.3em] font-light text-gray-600 hover:text-black transition-colors duration-300 border-b border-transparent hover:border-black pb-1"
                  style={{ fontFamily: 'Helvetica Neue' }}
                >
                  New Session
                </button>
                <div className="w-px h-4 bg-gray-200"></div>
                <button
                  onClick={() => setLocation('/sselfie-gallery')}
                  className="text-xs uppercase tracking-[0.3em] font-light text-gray-600 hover:text-black transition-colors duration-300 border-b border-transparent hover:border-black pb-1"
                  style={{ fontFamily: 'Helvetica Neue' }}
                >
                  Gallery
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Editorial Chat Interface */}
        <div 
          className="flex-1 max-w-4xl mx-auto px-8 py-16 overflow-y-auto"
          ref={chatContainerRef}
          style={{ minHeight: 'calc(100vh - 300px)' }}
        >
          {/* Luxury Welcome State */}
          {messages.length === 0 && (
            <div className="text-center py-24">
              <div className="max-w-2xl mx-auto">
                <h2 
                  className="text-2xl md:text-3xl text-black mb-8"
                  style={{ 
                    fontFamily: 'Times New Roman, serif', 
                    fontWeight: 200, 
                    letterSpacing: '0.2em',
                    lineHeight: 1.2
                  }}
                >
                  CREATE YOUR
                  <br />
                  PROFESSIONAL PHOTOS
                </h2>
                <p 
                  className="text-gray-600 mb-16 leading-relaxed max-w-xl mx-auto"
                  style={{ fontFamily: 'Helvetica Neue', fontWeight: 300, lineHeight: 1.8 }}
                >
                  Describe the professional photos you need and I'll create custom concepts with instant generation.
                </p>

                {/* Creation-Focused Quick Start Options */}
                <div className="space-y-3 max-w-md mx-auto">
                  {[
                    "Corporate headshots with confidence",
                    "Creative lifestyle content", 
                    "Professional portraits that convert"
                  ].map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => setMessage(suggestion)}
                      className="w-full text-left px-6 py-4 border border-gray-200 hover:border-black hover:bg-gray-50 transition-all duration-300 group"
                      style={{ fontFamily: 'Helvetica Neue', fontWeight: 300 }}
                    >
                      <span className="text-sm text-gray-700 group-hover:text-black transition-colors">
                        {suggestion}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Luxury Chat Messages */}
          <div className="space-y-12">
            {messages.map((msg) => (
              <div key={msg.id} className="fade-in">
                {msg.type === 'user' ? (
                  // User Message - Editorial Style
                  <div className="flex justify-end">
                    <div className="max-w-2xl">
                      <div 
                        className="bg-black text-white px-8 py-6 mb-2"
                        style={{ fontFamily: 'Helvetica Neue', fontWeight: 300, lineHeight: 1.6 }}
                      >
                        <p className="text-sm">{msg.content}</p>
                      </div>
                      <div className="text-right">
                        <span 
                          className="text-xs text-gray-400 tracking-wider uppercase"
                          style={{ letterSpacing: '0.2em' }}
                        >
                          You
                        </span>
                      </div>
                    </div>
                  </div>
                ) : msg.type === 'upload' ? (
                  // Upload Message - Luxury Editorial
                  <div className="flex justify-start">
                    <div className="max-w-2xl">
                      <div className="mb-4">
                        <span 
                          className="text-xs text-gray-400 tracking-wider uppercase"
                          style={{ letterSpacing: '0.2em' }}
                        >
                          Maya
                        </span>
                      </div>
                      <div 
                        className="bg-gray-50 border border-gray-100 px-8 py-8 mb-6"
                        style={{ fontFamily: 'Helvetica Neue', fontWeight: 300, lineHeight: 1.7 }}
                      >
                        <p className="text-gray-800 whitespace-pre-wrap">{msg.content}</p>
                      </div>
                      {msg.showUpload && (
                        <div className="border-t border-gray-100 pt-8">
                          <MayaUploadComponent
                            onUploadComplete={(success) => {
                              if (success) {
                                console.log('Training initiated successfully');
                              } else {
                                console.log('Training initiation failed');
                              }
                            }}
                            onTrainingStart={() => {
                              console.log('Training started, beginning onboarding');
                            }}
                            className="luxury-upload"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                ) : msg.type === 'examples' ? (
                  // Examples Message - Editorial Layout
                  <div className="flex justify-start">
                    <div className="max-w-2xl">
                      <div className="mb-4">
                        <span 
                          className="text-xs text-gray-400 tracking-wider uppercase"
                          style={{ letterSpacing: '0.2em' }}
                        >
                          Maya
                        </span>
                      </div>
                      <div 
                        className="bg-gray-50 border border-gray-100 px-8 py-8 mb-6"
                        style={{ fontFamily: 'Helvetica Neue', fontWeight: 300, lineHeight: 1.7 }}
                      >
                        <p className="text-gray-800 whitespace-pre-wrap">{msg.content}</p>
                      </div>
                      {msg.showExamples && (
                        <div className="border-t border-gray-100 pt-8">
                          <MayaExamplesGallery className="luxury-examples" />
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  // Maya Creation Response - Concept & Generation Focused
                  <div className="flex justify-start">
                    <div className="max-w-2xl">
                      <div className="mb-4">
                        <span 
                          className="text-xs text-gray-400 tracking-wider uppercase"
                          style={{ letterSpacing: '0.2em' }}
                        >
                          Maya
                        </span>
                      </div>

                      <div 
                        className="bg-gray-50 border border-gray-100 px-8 py-8"
                        style={{ fontFamily: 'Helvetica Neue', fontWeight: 300, lineHeight: 1.7 }}
                      >
                        <p className="text-gray-800 whitespace-pre-wrap">{msg.content}</p>

                        {/* Luxury Concept Cards */}
                        {msg.conceptCards && msg.conceptCards.length > 0 && (
                          <div className="mt-12 space-y-8">
                            <div className="h-px bg-gray-200 my-8"></div>
                            <h3 
                              className="text-lg tracking-widest uppercase text-black mb-8"
                              style={{ 
                                fontFamily: 'Times New Roman, serif', 
                                fontWeight: 200, 
                                letterSpacing: '0.3em' 
                              }}
                            >
                              Photo Concepts
                            </h3>

                            {msg.conceptCards.map((card, index) => {
                              const isExpanded = expandedCards.has(card.id);

                              return (
                                <div key={card.id} className="border border-gray-200 bg-white">
                                  <div className="px-8 py-6">
                                    <div className="flex items-start justify-between mb-4">
                                      <h4 
                                        className="text-base tracking-wider uppercase text-black flex-1"
                                        style={{ 
                                          fontFamily: 'Times New Roman, serif', 
                                          fontWeight: 200, 
                                          letterSpacing: '0.2em' 
                                        }}
                                      >
                                        {cleanDisplayTitle(card.title)}
                                      </h4>
                                      <span 
                                        className="text-xs text-gray-400 tracking-wider ml-6"
                                        style={{ letterSpacing: '0.2em' }}
                                      >
                                        #{(index + 1).toString().padStart(2, '0')}
                                      </span>
                                    </div>

                                    {!isExpanded && (
                                      <p 
                                        className="text-gray-600 mb-6 leading-relaxed"
                                        style={{ fontFamily: 'Helvetica Neue', fontWeight: 300, lineHeight: 1.7 }}
                                      >
                                        {card.description}
                                      </p>
                                    )}

                                    {isExpanded && (
                                      <p 
                                        className="text-gray-600 mb-6 leading-relaxed"
                                        style={{ fontFamily: 'Helvetica Neue', fontWeight: 300, lineHeight: 1.7 }}
                                      >
                                        {card.description}
                                      </p>
                                    )}

                                    <div className="flex items-center justify-between">
                                      <button
                                        onClick={() => toggleCardExpansion(card.id)}
                                        className="text-xs tracking-wider uppercase text-gray-600 hover:text-black transition-colors border-b border-transparent hover:border-black pb-1"
                                        style={{ letterSpacing: '0.2em' }}
                                      >
                                        {isExpanded ? 'Show Less' : 'View Details'}
                                      </button>
                                      <button
                                        onClick={() => handleGenerateImage(card)}
                                        disabled={card.isGenerating}
                                        className="bg-black text-white px-6 py-2 text-xs tracking-wider uppercase hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        style={{ letterSpacing: '0.2em' }}
                                      >
                                        {card.isGenerating ? 'Creating...' : 'Generate Photos'}
                                      </button>
                                    </div>

                                    {/* Elegant Loading State */}
                                    {card.isGenerating && (
                                      <div className="mt-6 pt-6 border-t border-gray-100">
                                        <div className="flex items-center text-xs text-gray-500 tracking-wider uppercase" style={{ letterSpacing: '0.2em' }}>
                                          <div className="flex space-x-2 mr-4">
                                            <div className="w-1 h-1 bg-gray-400 rounded-full animate-pulse"></div>
                                            <div className="w-1 h-1 bg-gray-400 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                                            <div className="w-1 h-1 bg-gray-400 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
                                          </div>
                                          Creating your professional photos...
                                        </div>
                                      </div>
                                    )}

                                    {/* Editorial Image Gallery */}
                                    {card.generatedImages && card.generatedImages.length > 0 && (
                                      <div className="mt-8 pt-8 border-t border-gray-100">
                                        <p 
                                          className="text-xs text-gray-400 tracking-wider uppercase mb-6"
                                          style={{ letterSpacing: '0.2em' }}
                                        >
                                          Your Professional Photos
                                        </p>
                                        <div className="grid grid-cols-2 gap-4">
                                          {card.generatedImages.map((imageUrl, imgIndex) => {
                                            const proxyUrl = `/api/proxy-image?url=${encodeURIComponent(imageUrl)}`;
                                            return (
                                              <div key={imgIndex} className="relative group">
                                                <img 
                                                  src={proxyUrl}
                                                  alt={`Generated ${cleanDisplayTitle(card.title)} ${imgIndex + 1}`}
                                                  className="w-full h-48 object-cover cursor-pointer hover:opacity-95 transition-opacity filter grayscale-[10%]"
                                                  onClick={() => setSelectedImage?.(proxyUrl)}
                                                  onLoad={() => {
                                                    console.log('Image loaded via proxy:', proxyUrl);
                                                    handleAutoSaveToGallery(imageUrl, card.title);
                                                  }}
                                                  onError={(e) => {
                                                    console.error('Image proxy failed:', proxyUrl);
                                                    const target = e.target as HTMLImageElement;
                                                    target.style.display = 'none';
                                                  }}
                                                />
                                                <button
                                                  className="absolute top-3 right-3 w-8 h-8 bg-white/90 hover:bg-white flex items-center justify-center text-black hover:text-gray-800 opacity-0 group-hover:opacity-100 transition-all"
                                                  onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleSaveToGallery(imageUrl, card.title);
                                                  }}
                                                  title="Save to gallery"
                                                >
                                                  <span className="text-sm">♡</span>
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

            {/* Luxury Typing Indicator */}
            {isTyping && (
              <div className="flex justify-start">
                <div className="max-w-2xl">
                  <div className="mb-4">
                    <span 
                      className="text-xs text-gray-400 tracking-wider uppercase"
                      style={{ letterSpacing: '0.2em' }}
                    >
                      Maya
                    </span>
                  </div>
                  <div className="bg-gray-50 border border-gray-100 px-8 py-6 flex items-center">
                    <div className="flex space-x-2">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
                    </div>
                    <span 
                      className="ml-4 text-xs text-gray-500 tracking-wider uppercase"
                      style={{ letterSpacing: '0.2em' }}
                    >
                      Thinking...
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div ref={messagesEndRef} />
        </div>

        {/* Luxury Editorial Input - Mobile Optimized */}
        <div className="border-t border-gray-100 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-8 py-4 sm:py-8">
            <div className="flex items-end space-x-3 sm:space-x-6">
              <div className="flex-1">
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Describe the photos you need for your business..."
                  className="w-full resize-none border border-gray-200 focus:border-black focus:outline-none px-4 sm:px-6 py-3 sm:py-4 bg-white transition-colors"
                  rows={1}
                  disabled={isTyping}
                  style={{ 
                    fontFamily: 'Helvetica Neue', 
                    fontWeight: 300, 
                    minHeight: '52px', 
                    maxHeight: '120px',
                    lineHeight: 1.6,
                    fontSize: '16px' // Prevents zoom on iOS
                  }}
                  aria-label="Type your message to Maya"
                  role="textbox"
                  aria-multiline="true"
                />
              </div>
              <button
                onClick={handleSendMessage}
                disabled={!message.trim() || isTyping}
                className="bg-black text-white px-4 sm:px-8 py-3 sm:py-4 text-xs uppercase tracking-[0.3em] font-light hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
                style={{ minHeight: '52px', minWidth: '80px' }}
                aria-label={isTyping ? 'Sending message...' : 'Send message'}
              >
                {isTyping ? 'Sending...' : 'Send'}
              </button>
            </div>
          </div>
        </div>

        {/* Luxury Image Modal */}
        {selectedImage && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-95 flex items-center justify-center z-50 p-8"
            onClick={() => setSelectedImage(null)}
          >
            <div className="relative max-w-full max-h-full">
              <img 
                src={selectedImage}
                alt="Full size view"
                className="max-w-full max-h-full object-contain"
                onClick={(e) => e.stopPropagation()}
              />
              <button 
                onClick={() => setSelectedImage(null)}
                className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center bg-white/10 hover:bg-white/20 text-white hover:text-white transition-colors"
                title="Close"
              >
                <span className="text-lg leading-none">×</span>
              </button>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .fade-in {
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

        @media (max-width: 768px) {
          .max-w-4xl {
            max-width: 100%;
          }
        }
      `}</style>
    </>
  );
}
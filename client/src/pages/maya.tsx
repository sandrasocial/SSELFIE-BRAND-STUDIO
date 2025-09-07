import React, { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../hooks/use-auth';
import { useMayaGeneration } from '../hooks/useMayaGeneration';
import { useMayaPersistence } from '../hooks/useMayaPersistence';
import { useToast } from '../hooks/use-toast';
import { MayaCategorizedGallery } from '../components/maya-categorized-gallery';
import { MemberNavigation } from '../components/member-navigation';
import { MayaUploadComponent } from '../components/maya/MayaUploadComponent';
import { MayaExamplesGallery } from '../components/maya/MayaExamplesGallery';
import { useLocation } from 'wouter';

// Maya simplified workspace page

interface ChatMessage {
  id: string;
  type: 'user' | 'maya' | 'onboarding' | 'upload' | 'examples';
  content: string;
  timestamp: string;
  conceptCards?: ConceptCard[];
  isStreaming?: boolean;
  onboardingData?: OnboardingData;
  showUpload?: boolean;
  showExamples?: boolean;
}

interface OnboardingData {
  step: number;
  totalSteps: number;
  question: string;
  fieldName: string;
  options?: string[];
  explanation?: string;
  isOnboardingComplete: boolean;
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
  const [message, setMessage] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());
  const [isNearBottom, setIsNearBottom] = useState(true);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);
  const [isOnboarding, setIsOnboarding] = useState(false);
  const [currentOnboardingData, setCurrentOnboardingData] = useState<OnboardingData | null>(null);
  // Simple mobile chat state
  const [hasStartedChat, setHasStartedChat] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  // PHASE 2.1: Enhanced persistence system
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
  
  // Smart auto-scroll system
  const checkIfNearBottom = () => {
    if (!chatContainerRef.current) return false;
    const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
    const threshold = 100; // pixels from bottom
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

  // Close sidebar when clicking outside on mobile
  const closeSidebar = () => setIsSidebarOpen(false);
  
  // Image modal functionality
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  
  // Auto-save and gallery functionality
  const handleAutoSaveToGallery = async (imageUrl: string, conceptTitle: string) => {
    try {
      console.log('🎯 Auto-saving to gallery:', conceptTitle);
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
        console.log('✅ Auto-saved to gallery successfully');
      }
    } catch (error) {
      console.error('❌ Auto-save failed:', error);
    }
  };
  
  const handleSaveToGallery = async (imageUrl: string, conceptTitle: string) => {
    try {
      console.log('💾 Manual save to gallery:', conceptTitle);
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
      console.error('❌ Save failed:', error);
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

  // PHASE 2.1: Enhanced loading with database sync (Phase 2.2 pending)
  const { data: conversationData } = useQuery({
    queryKey: ['/api/maya/conversation'],
    enabled: !!user?.id && !isPersistenceLoading
  });

  // PHASE 2.1: Sync database conversation with localStorage (Phase 2.2 will enhance this)
  useEffect(() => {
    if (conversationData && (conversationData as any).messages && messages.length === 0) {
      console.log('🔄 PHASE 2.1: Syncing database conversation with persistent storage');
      setMessages(() => (conversationData as any).messages.slice(-20)); // Keep last 20
      setShowWelcomeScreen(false);
      setIsFirstVisit(false);
    }
  }, [conversationData, messages.length, setMessages]);

  // Initialize welcome experience for new users
  useEffect(() => {
    if (messages.length === 0 && !conversationData) {
      setShowWelcomeScreen(true);
      setIsFirstVisit(true);
    }
  }, [messages.length, conversationData]);

  // Smart auto-scroll effects
  useEffect(() => {
    const chatContainer = chatContainerRef.current;
    if (!chatContainer) return;

    chatContainer.addEventListener('scroll', handleScroll);
    return () => chatContainer.removeEventListener('scroll', handleScroll);
  }, []);

  // Auto-scroll when new messages arrive (only if user is near bottom)
  useEffect(() => {
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      
      // Always scroll for user messages (they just sent it)
      if (lastMessage.type === 'user') {
        smartScrollToBottom(100, true);
      }
      // Smart scroll for Maya messages (only if near bottom)  
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
      // Use Maya's intelligent generation system
      await generateFromSpecificConcept(card.title, card.id);
    } else {
      console.error('Maya generation system not available');
    }
  };

  // PHASE 3: New Session Management
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
      const response = await fetch('/api/maya/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: messageContent })
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      return response.json();
    },
    onSuccess: (data) => {
      // PHASE 7: Handle onboarding responses
      if (data.type === 'onboarding' || data.type === 'onboarding_complete') {
        setIsOnboarding(data.type === 'onboarding');
        setCurrentOnboardingData(data);
        
        // Add onboarding message to chat
        addMessage({
          type: 'onboarding',
          content: data.question || data.message || '',
          timestamp: new Date().toISOString(),
          onboardingData: data
        });
      } else {
        // PHASE 2.1: Add Maya's response with enhanced persistence
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

    // PHASE 2.1: Add user message with enhanced persistence
    addMessage({
      type: 'user', 
      content: message.trim(),
      timestamp: new Date().toISOString()
    });

    setIsTyping(true);
    
    // Send to Maya
    sendMessage.mutate(message.trim());
    setMessage('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // LUXURY ONBOARDING: Enhanced response handler with smooth transitions
  const handleOnboardingResponse = async (fieldName: string, answer: string) => {
    // Add user response to chat immediately
    addMessage({
      type: 'user',
      content: answer,
      timestamp: new Date().toISOString()
    });

    setIsTyping(true);

    try {
      const response = await fetch('/api/maya/onboarding-response', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fieldName, answer })
      });

      if (!response.ok) {
        throw new Error('Failed to submit onboarding response');
      }

      const data = await response.json();
      setIsTyping(false);
      
      // Handle onboarding completion with luxury experience
      if (data.type === 'complete' || data.isOnboardingComplete) {
        setIsOnboarding(false);
        setCurrentOnboardingData(null);
        
        // Add Maya's welcoming completion message
        setTimeout(() => {
          addMessage({
            type: 'maya',
            content: data.message || "Perfect! I now understand your style and goals. Let's create some amazing photos that represent the real you. What kind of images are you thinking about?",
            timestamp: new Date().toISOString()
          });
        }, 1000);
        
      } else if (data.type === 'onboarding') {
        setCurrentOnboardingData(data);
        
        // Add next question with smooth transition
        setTimeout(() => {
          addMessage({
            type: 'onboarding',
            content: data.question,
            timestamp: new Date().toISOString(),
            onboardingData: data
          });
        }, 1500);
      }
    } catch (error) {
      setIsTyping(false);
      console.error('❌ LUXURY ONBOARDING ERROR:', error);
      toast({ 
        title: "Connection Error", 
        description: "Unable to process your response. Please check your connection and try again.",
        variant: "destructive"
      });
    }
  };

  // Start luxury onboarding conversation
  const startOnboarding = async () => {
    setShowWelcomeScreen(false);
    setIsOnboarding(true);
    
    try {
      const response = await fetch('/api/maya/start-onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user?.id })
      });
      
      const data = await response.json();
      
      if (data.type === 'onboarding') {
        setCurrentOnboardingData(data);
        
        addMessage({
          type: 'maya',
          content: data.introduction || "I'm Maya, your personal brand strategist. I'll help you create photos that tell your unique story and grow your brand. Let me ask you a few quick questions so I can style you perfectly.",
          timestamp: new Date().toISOString()
        });
        
        // Add first question
        setTimeout(() => {
          addMessage({
            type: 'onboarding',
            content: data.question,
            timestamp: new Date().toISOString(),
            onboardingData: data
          });
        }, 1500);
      }
    } catch (error) {
      console.error('Failed to start onboarding:', error);
      setShowWelcomeScreen(false);
      setIsOnboarding(false);
    }
  };

  // Skip to conversation
  const skipToConversation = () => {
    setShowWelcomeScreen(false);
    setIsFirstVisit(false);
    
    addMessage({
      type: 'maya',
      content: "I'm Maya, your personal brand strategist. I help you create photo concepts that tell your unique story and grow your brand. What kind of photos are you looking to create today?",
      timestamp: new Date().toISOString()
    });
  };

  // Quick action buttons
  const quickActions = [
    "Help me create business headshots",
    "I need lifestyle content for Instagram", 
    "Create professional photos for LinkedIn",
    "Show me editorial styling options",
    "Design travel content concepts"
  ];

  return (
    <>
      <MemberNavigation />
      <div className="min-h-screen bg-gray-50 pt-20">
        {/* Simple Mobile Header */}
        <div className="bg-white border-b border-gray-200 px-4 py-3">
          <div className="flex items-center justify-between max-w-4xl mx-auto">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                <span className="text-white text-lg font-medium">M</span>
              </div>
              <div>
                <h1 className="font-semibold text-gray-900">Maya</h1>
                <p className="text-sm text-gray-500">Personal Brand Stylist</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={handleNewSession}
                className="text-gray-500 hover:text-gray-700 transition-colors"
                title="New chat"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>
              <button
                onClick={() => setLocation('/workspace')}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>


        {/* Clean Mobile Chat Interface */}
        <div className="flex-1 max-w-4xl mx-auto px-4 py-4" ref={chatContainerRef}>
          {/* Welcome Message for Empty Chat */}
          {messages.length === 0 && (
            <div className="text-center py-12">
              <div className="text-2xl mb-4">👋</div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Hi! I'm Maya
              </h2>
              <p className="text-gray-600 mb-8">
                I'll help you create amazing photos for your business. What kind of photos do you need?
              </p>
              
              {/* Quick Start Suggestions */}
              <div className="space-y-2 max-w-md mx-auto">
                {[
                  "Professional headshots for LinkedIn",
                  "Instagram content for my business",
                  "Website photos that convert"
                ].map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => setMessage(suggestion)}
                    className="w-full text-left p-3 rounded-lg bg-white border border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-colors text-sm"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Chat Messages */}
          <div className="space-y-4">
            {messages.map((msg) => (
              <div key={msg.id} className="animate-fadeIn">
                {msg.type === 'user' ? (
                  // User Message - Simple Chat Bubble
                  <div className="flex justify-end">
                    <div className="max-w-xs sm:max-w-md bg-blue-500 text-white px-4 py-2 rounded-lg rounded-br-sm">
                      <p className="text-sm">{msg.content}</p>
                    </div>
                  </div>
                ) : msg.type === 'upload' ? (
                  // Upload Message - Clean Chat Style
                  <div className="flex justify-start">
                    <div className="max-w-xs sm:max-w-md">
                      <div className="flex items-center mb-2">
                        <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mr-2">
                          <span className="text-white text-xs font-medium">M</span>
                        </div>
                        <span className="text-xs text-gray-500">Maya</span>
                      </div>
                      <div className="bg-white border border-gray-200 rounded-lg rounded-tl-sm p-3 mb-3">
                        <p className="text-sm text-gray-800 whitespace-pre-wrap">{msg.content}</p>
                      </div>
                      {msg.showUpload && (
                        <MayaUploadComponent
                          onUploadComplete={(success) => {
                            if (success) {
                              console.log('✅ Maya: Training initiated successfully');
                            } else {
                              console.log('❌ Maya: Training initiation failed');
                            }
                          }}
                          onTrainingStart={() => {
                            console.log('🎯 Maya: Training started, beginning onboarding');
                          }}
                          className="mt-2"
                        />
                      )}
                    </div>
                  </div>
                ) : msg.type === 'examples' ? (
                  // Examples Message - Clean Chat Style
                  <div className="flex justify-start">
                    <div className="max-w-xs sm:max-w-md">
                      <div className="flex items-center mb-2">
                        <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mr-2">
                          <span className="text-white text-xs font-medium">M</span>
                        </div>
                        <span className="text-xs text-gray-500">Maya</span>
                      </div>
                      <div className="bg-white border border-gray-200 rounded-lg rounded-tl-sm p-3 mb-3">
                        <p className="text-sm text-gray-800 whitespace-pre-wrap">{msg.content}</p>
                      </div>
                      {msg.showExamples && (
                        <MayaExamplesGallery className="mt-2" />
                      )}
                    </div>
                  </div>
                ) : msg.type === 'onboarding' ? (
                  // Simple Onboarding Chat Style
                  <div className="flex justify-start">
                    <div className="max-w-xs sm:max-w-md">
                      <div className="flex items-center mb-2">
                        <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mr-2">
                          <span className="text-white text-xs font-medium">M</span>
                        </div>
                        <span className="text-xs text-gray-500">Maya • Step {msg.onboardingData?.step}/{msg.onboardingData?.totalSteps}</span>
                      </div>
                      
                      <div className="bg-white border border-gray-200 rounded-lg rounded-tl-sm p-3 mb-3">
                        <p className="text-sm text-gray-800 mb-3">{msg.content}</p>
                        
                        {msg.onboardingData?.explanation && (
                          <p className="text-xs text-gray-600 mb-3 italic">{msg.onboardingData.explanation}</p>
                        )}
                        
                        {msg.onboardingData?.options ? (
                          <div className="space-y-2">
                            {msg.onboardingData.options.map((option) => (
                              <button
                                key={option}
                                onClick={() => handleOnboardingResponse(msg.onboardingData!.fieldName, option)}
                                className="w-full text-left p-2 text-sm bg-gray-50 hover:bg-blue-50 border border-gray-200 hover:border-blue-300 rounded transition-colors"
                              >
                                {option.charAt(0).toUpperCase() + option.slice(1)}
                              </button>
                            ))}
                          </div>
                        ) : (
                          <input
                            type="text"
                            placeholder="Type your answer..."
                            className="w-full p-2 text-sm border border-gray-200 rounded focus:border-blue-500 focus:outline-none"
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                const target = e.target as HTMLInputElement;
                                if (target.value.trim()) {
                                  handleOnboardingResponse(msg.onboardingData!.fieldName, target.value.trim());
                                  target.value = '';
                                }
                              }
                            }}
                          />
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  // Maya Message - Simple Chat Bubble
                  <div className="flex justify-start">
                    <div className="max-w-xs sm:max-w-md">
                      <div className="flex items-center mb-2">
                        <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mr-2">
                          <span className="text-white text-xs font-medium">M</span>
                        </div>
                        <span className="text-xs text-gray-500">Maya</span>
                      </div>
                      
                      <div className="bg-white border border-gray-200 rounded-lg rounded-tl-sm p-3">
                        <p className="text-sm text-gray-800 whitespace-pre-wrap">{msg.content}</p>
                        
                        {/* Simple Concept Cards */}
                        {msg.conceptCards && msg.conceptCards.length > 0 && (
                          <div className="mt-3 space-y-3">
                            {msg.conceptCards.map((card, index) => {
                              const isExpanded = expandedCards.has(card.id);
                              
                              return (
                                <div key={card.id} className="bg-gray-50 rounded-lg p-3 border">
                                  <div className="flex items-start justify-between mb-2">
                                    <h3 className="font-medium text-sm text-gray-900">
                                      {cleanDisplayTitle(card.title)}
                                    </h3>
                                    <span className="text-xs text-gray-500 ml-2">
                                      #{index + 1}
                                    </span>
                                  </div>
                                  
                                  {isExpanded && (
                                    <p className="text-xs text-gray-600 mb-3 leading-relaxed">
                                      {card.description}
                                    </p>
                                  )}
                                  
                                  <div className="flex items-center gap-2">
                                    <button
                                      onClick={() => toggleCardExpansion(card.id)}
                                      className="text-xs text-blue-600 hover:text-blue-700"
                                    >
                                      {isExpanded ? 'Less' : 'More'}
                                    </button>
                                    <button
                                      onClick={() => handleGenerateImage(card)}
                                      disabled={card.isGenerating}
                                      className="bg-blue-600 text-white px-3 py-1 text-xs rounded hover:bg-blue-700 transition-colors disabled:opacity-50 ml-auto"
                                    >
                                      {card.isGenerating ? 'Creating...' : 'Generate'}
                                    </button>
                                  </div>
                                  
                                  {/* Loading indicator */}
                                  {card.isGenerating && (
                                    <div className="mt-2 flex items-center text-xs text-gray-500">
                                      <div className="flex space-x-1 mr-2">
                                        <div className="w-1 h-1 bg-blue-500 rounded-full animate-bounce"></div>
                                        <div className="w-1 h-1 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                                        <div className="w-1 h-1 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                                      </div>
                                      Creating your image...
                                    </div>
                                  )}

                                  {/* Generated Images */}
                                  {card.generatedImages && card.generatedImages.length > 0 && (
                                    <div className="mt-2">
                                      <p className="text-xs text-gray-500 mb-2">Your images:</p>
                                      <div className="grid grid-cols-2 gap-2">
                                        {card.generatedImages.map((imageUrl, imgIndex) => {
                                          const proxyUrl = `/api/proxy-image?url=${encodeURIComponent(imageUrl)}`;
                                          return (
                                            <div key={imgIndex} className="relative group">
                                              <img 
                                                src={proxyUrl}
                                                alt={`Generated ${cleanDisplayTitle(card.title)} ${imgIndex + 1}`}
                                                className="w-full h-24 object-cover rounded cursor-pointer hover:opacity-90 transition-opacity"
                                                onClick={() => setSelectedImage?.(proxyUrl)}
                                                onLoad={() => {
                                                  console.log('✅ Image loaded via proxy:', proxyUrl);
                                                  handleAutoSaveToGallery(imageUrl, card.title);
                                                }}
                                                onError={(e) => {
                                                  console.error('❌ Image proxy failed:', proxyUrl);
                                                  const target = e.target as HTMLImageElement;
                                                  target.style.display = 'none';
                                                }}
                                              />
                                              <button
                                                className="absolute top-1 right-1 w-6 h-6 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow text-red-500 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  handleSaveToGallery(imageUrl, card.title);
                                                }}
                                                title="Save to gallery"
                                              >
                                                <span className="text-xs">♥</span>
                                              </button>
                                            </div>
                                          );
                                        })}
                                      </div>
                                    </div>
                                  )}
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
            
            {/* Simple Typing Indicator */}
            {isTyping && (
              <div className="flex justify-start">
                <div className="flex items-center">
                  <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mr-2">
                    <span className="text-white text-xs font-medium">M</span>
                  </div>
                  <div className="bg-white border border-gray-200 rounded-lg rounded-tl-sm px-3 py-2 flex items-center space-x-1">
                    <div className="flex space-x-1">
                      <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                      <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Simple Chat Input */}
          <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4">
            <div className="flex items-end space-x-2 max-w-4xl mx-auto">
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Tell me what photos you need..."
                className="flex-1 resize-none border border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                rows={1}
                disabled={isTyping}
                style={{ minHeight: '36px', maxHeight: '120px' }}
              />
              <button
                onClick={handleSendMessage}
                disabled={!message.trim() || isTyping}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
              >
                {isTyping ? '...' : 'Send'}
              </button>
            </div>
          </div>
          
          <div ref={messagesEndRef} />
        </div>

        {/* Full-size Image Modal */}
        {selectedImage && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedImage(null)}
          >
            <div className="relative max-w-full max-h-full">
              <img 
                src={selectedImage}
                alt="Full size view"
                className="max-w-full max-h-full object-contain rounded-lg"
                onClick={(e) => e.stopPropagation()}
              />
              <button 
                onClick={() => setSelectedImage(null)}
                className="absolute top-2 right-2 w-8 h-8 flex items-center justify-center bg-white/90 hover:bg-white text-gray-700 hover:text-black rounded-full transition-colors"
                title="Close"
              >
                <span className="text-lg leading-none">×</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
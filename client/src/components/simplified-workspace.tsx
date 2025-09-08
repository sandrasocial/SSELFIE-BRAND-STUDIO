import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../hooks/use-auth';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { MemberNavigation } from './member-navigation';
import { apiRequest } from '../lib/queryClient';
import { useToast } from '../hooks/use-toast';

interface ChatMessage {
  id: string;
  type: 'user' | 'maya' | 'onboarding' | 'strategy';
  content: string;
  timestamp: Date;
  onboardingData?: OnboardingData;
  isFormatted?: boolean;
  businessContext?: BusinessContext;
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

interface BusinessContext {
  industry?: string;
  targetAudience?: string;
  businessGoals?: string[];
  currentSituation?: string;
  futureVision?: string;
  stylePreferences?: string[];
}

export function SimplifiedWorkspace() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [chatMessage, setChatMessage] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('luxury-dark');
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isNearBottom, setIsNearBottom] = useState(true);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);
  const [isOnboarding, setIsOnboarding] = useState(false);
  const [currentOnboardingData, setCurrentOnboardingData] = useState<OnboardingData | null>(null);
  const [businessContext, setBusinessContext] = useState<BusinessContext>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Load persisted Maya conversation and business context on mount
  useEffect(() => {
    const savedMessages = localStorage.getItem('maya-workspace-chat');
    const savedContext = localStorage.getItem('maya-business-context');

    if (savedMessages) {
      try {
        const parsedMessages = JSON.parse(savedMessages).map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }));
        setMessages(parsedMessages);
      } catch (error) {
        console.error('Failed to load Maya workspace messages:', error);
      }
    }

    if (savedContext) {
      try {
        const parsedContext = JSON.parse(savedContext);
        setBusinessContext(parsedContext);
      } catch (error) {
        console.error('Failed to load business context:', error);
      }
    }
  }, []);

  // Persist conversations and business context to localStorage
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('maya-workspace-chat', JSON.stringify(messages));
    }
  }, [messages]);

  useEffect(() => {
    localStorage.setItem('maya-business-context', JSON.stringify(businessContext));
  }, [businessContext]);

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

  const scrollToNewContent = () => {
    if (!shouldAutoScroll) return;
    smartScrollToBottom(300);
  };

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    scrollToNewContent();
  }, [messages]);

  // Fetch user data
  const { data: aiImages = [] } = useQuery({
    queryKey: ['/api/ai-images'],
    enabled: isAuthenticated
  });

  const { data: userModel } = useQuery({
    queryKey: ['/api/user-model'],
    enabled: isAuthenticated
  });

  const { data: usage = {} } = useQuery({
    queryKey: ['/api/usage/status'],
    enabled: isAuthenticated
  });

  const templates = {
    'luxury-dark': {
      name: 'LUXURY DARK',
      colors: ['#000000', '#2D2D2D', '#8B7355', '#C4A484', '#E8E8E8'],
      overlayStyle: 'bg-black/80 text-white'
    },
    'nature-luxury': {
      name: 'NATURE LUXURY', 
      colors: ['#000000', '#2F4F2F', '#556B2F', '#9CAF88', '#E8E8E8'],
      overlayStyle: 'bg-green-900/80 text-white'
    },
    'white-gold': {
      name: 'WHITE GOLD',
      colors: ['#000000', '#8B7355', '#C4A484', '#D4AF37', '#E8E8E8'],
      overlayStyle: 'bg-white/90 text-black'
    }
  };

  const currentTemplate = templates[selectedTemplate];

  // Get user's first name for display
  const userName = user?.displayName?.split(' ')[0] || user?.email?.split('@')[0] || 'User';

  // USER STATE DETECTION: Intelligent context awareness
  const getUserState = () => {
    const hasModel = userModel?.status === 'completed';
    const isTraining = userModel?.status === 'training' || userModel?.status === 'processing';
    const imageCount = aiImages.length;
    const hasConversationHistory = messages.length > 0;
    const hasStoredChats = localStorage.getItem('maya-workspace-chat') !== null;

    if (isTraining) {
      return 'training';
    } else if (!hasModel && imageCount === 0) {
      return 'new';
    } else if (hasModel && imageCount > 50) {
      return 'experienced';
    } else if (hasConversationHistory || hasStoredChats) {
      return 'returning';
    } else {
      return 'getting-started';
    }
  };

  const userState = getUserState();

  // CONTEXT-AWARE WELCOME MESSAGES
  const getWelcomeMessage = () => {
    const imageCount = aiImages.length;
    switch (userState) {
      case 'new':
        return {
          greeting: `Welcome, ${userName}!`,
          message: "I'm Maya, your AI photographer. Ready to create your first professional photos?",
          suggestion: "Tell me about the photos you need for your business"
        };
      case 'training':
        return {
          greeting: `Great progress, ${userName}!`,
          message: "Your AI model is training. Once ready, we'll create stunning professional photos together.",
          suggestion: "What style of photos are you most excited to create?"
        };
      case 'experienced':
        return {
          greeting: `Welcome back, ${userName}!`,
          message: `Impressive! You have ${imageCount} professional photos. Your brand is really growing.`,
          suggestion: "What new photo styles should we explore today?"
        };
      case 'returning':
        return {
          greeting: `Good to see you again, ${userName}!`,
          message: "How can I help with your brand photos today?",
          suggestion: "Continue where we left off or start something new?"
        };
      default:
        return {
          greeting: `Hello, ${userName}!`,
          message: "Your AI is ready. Let's create some amazing professional photos.",
          suggestion: "What photos do you need for your business?"
        };
    }
  };

  const welcomeContent = getWelcomeMessage();

  // Enhanced onboarding response handler
  const handleOnboardingResponse = async (fieldName: string, answer: string) => {
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: answer,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);

    try {
      const response = await apiRequest('/api/maya/chat', 'POST', {
        message: answer,
        context: 'dashboard',
        onboardingField: fieldName,
        userState,
        userStats: {
          imageCount: aiImages.length,
          modelStatus: userModel?.status,
          planType: usage.planType || 'sselfie-studio'
        },
        conversationHistory: messages.slice(-4).map(msg => ({
          role: msg.type === 'user' ? 'user' : 'assistant',
          content: msg.content
        }))
      });

      if (response.type === 'onboarding' || response.type === 'onboarding_complete') {
        setIsOnboarding(response.type === 'onboarding');
        setCurrentOnboardingData(response);

        // Update business context
        if (response.businessContext) {
          setBusinessContext(prev => ({ ...prev, ...response.businessContext }));
        }

        const assistantMessage: ChatMessage = {
          id: Date.now().toString() + '_maya',
          type: 'onboarding',
          content: response.question || response.message,
          timestamp: new Date(),
          onboardingData: response
        };
        setMessages(prev => [...prev, assistantMessage]);
      } else {
        const assistantMessage: ChatMessage = {
          id: Date.now().toString() + '_maya',
          type: 'maya',
          content: response.content || response.message,
          timestamp: new Date(),
          isFormatted: true
        };
        setMessages(prev => [...prev, assistantMessage]);
      }
    } catch (error) {
      console.error('Onboarding error:', error);
      toast({
        title: "Connection Issue",
        description: "Unable to process your response. Please try again.",
      });
    } finally {
      setIsTyping(false);
    }
  };

  // Clear chat with confirmation
  const handleClearChat = () => {
    const totalMessages = messages.length;
    if (totalMessages === 0) {
      toast({ title: "Already Clear", description: "No conversation to clear." });
      return;
    }

    const confirmMessage = totalMessages > 5 
      ? `Clear conversation? This will remove ${totalMessages} messages but keep your business context and preferences.`
      : "Start a new conversation? Your business context will be preserved.";

    if (confirm(confirmMessage)) {
      setMessages([]);
      setIsOnboarding(false);
      setCurrentOnboardingData(null);
      localStorage.removeItem('maya-workspace-chat');
      toast({ 
        title: "Conversation Cleared", 
        description: "Ready for a fresh start! Your business preferences are still saved." 
      });
    }
  };

  // Start re-onboarding
  const handleReOnboarding = () => {
    if (confirm("Start fresh onboarding? This will clear your current business context and guide you through the setup again.")) {
      setMessages([]);
      setBusinessContext({});
      setIsOnboarding(false);
      localStorage.removeItem('maya-workspace-chat');
      localStorage.removeItem('maya-business-context');

      // Send initial onboarding trigger
      const initialMessage = "I'd like to go through the onboarding process again";
      setChatMessage(initialMessage);
      setTimeout(() => handleSendMessage(), 100);

      toast({ 
        title: "Onboarding Restarted", 
        description: "Let's rediscover your business needs and style preferences!" 
      });
    }
  };

  // Use actual user images or fallback to sample images
  const userImages = aiImages.length > 0 
    ? aiImages.slice(0, 9).map((img: any) => img.imageUrl || img.url)
    : [
        "https://images.unsplash.com/photo-1494790108755-2616b9c1ae04?w=400&h=400&fit=crop&crop=face",
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face",
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face",
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=face",
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face",
        "https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=400&h=400&fit=crop&crop=face",
        "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop&crop=face",
        "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=400&fit=crop&crop=face",
        "https://images.unsplash.com/photo-1551836022-deb4988cc6c0?w=400&h=400&fit=crop&crop=face"
      ];

  // Context-aware profile suggestion based on user state
  const getProfileSuggestion = () => {
    const imageCount = aiImages.length;
    switch (userState) {
      case 'experienced':
        return {
          image: userImages[0],
          bio: `✨ Entrepreneur with ${imageCount}+ professional photos\n📸 Authentic brand storytelling expert\n🎯 Scaling credibility through visual consistency\n👇 Book your next brand session`
        };
      case 'new':
      case 'getting-started':
        return {
          image: userImages[0],
          bio: "✨ Ready to transform your business presence\n📸 Professional photos that build trust\n🎯 Your authentic brand story starts here\n👇 Let's create your first session"
        };
      case 'training':
        return {
          image: userImages[0],
          bio: "✨ AI training in progress - exciting!\n📸 Personalized photos coming soon\n🎯 Building your unique brand identity\n👇 Preview your upcoming session"
        };
      default:
        return {
          image: userImages[0],
          bio: "✨ Empowering entrepreneurs through storytelling\n📸 Professional photos that reflect you\n🎯 Building credibility one image at a time\n👇 Continue your brand journey"
        };
    }
  };

  const profileSuggestion = getProfileSuggestion();

  // SMART HANDOFF LOGIC: Detect Maya page triggers
  const detectMayaPageTriggers = (message: string) => {
    const mayaPageTriggers = [
      'create photos', 'generate concepts', 'make images', 'train model',
      'upload photos', 'photo concepts', 'image generation', 'generate image',
      'create concept', 'photo ideas', 'picture concepts', 'maya create',
      'show me concepts', 'generate photos', 'design photos', 'create content'
    ];

    return mayaPageTriggers.some(trigger => 
      message.toLowerCase().includes(trigger.toLowerCase())
    );
  };

  // Handle Maya chat with smart routing
  const handleSendMessage = async () => {
    if (!chatMessage.trim() || isTyping) return;

    const userMessage = chatMessage.trim();

    // Check for Maya page handoff triggers
    if (detectMayaPageTriggers(userMessage)) {
      // Store enhanced handoff context with user authentication data
      const handoffContext = {
        message: userMessage,
        timestamp: new Date().toISOString(),
        businessContext,
        conversationHistory: messages.slice(-3),
        userProfile: {
          userId: user?.id,
          email: user?.email,
          name: user?.firstName || user?.email?.split('@')[0],
          profession: businessContext?.industry,
          isAuthenticated: isAuthenticated,
          hasActiveSubscription: user?.plan === 'sselfie-studio' || user?.role === 'admin'
        },
        handoffType: 'workspace_to_maya'
      };

      localStorage.setItem('maya-handoff-context', JSON.stringify(handoffContext));

      // Add transition message
      const transitionMessage: ChatMessage = {
        id: Date.now().toString() + '_transition',
        type: 'maya',
        content: `Perfect! I'll take you to my creation studio where we can work on "${userMessage}". Let me switch to my specialized photo creation interface...`,
        timestamp: new Date(),
        isFormatted: true
      };
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        type: 'user',
        content: userMessage,
        timestamp: new Date()
      }, transitionMessage]);

      // Redirect to Maya page after brief delay
      setTimeout(() => {
        setLocation('/maya');
      }, 1500);

      return;
    }

    setChatMessage('');
    setIsTyping(true);

    // Add user message immediately
    const newUserMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: userMessage,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, newUserMessage]);

    try {
      const response = await apiRequest('/api/maya/chat', 'POST', {
        message: userMessage,
        context: 'dashboard',
        userState,
        userStats: {
          imageCount: aiImages.length,
          modelStatus: userModel?.status,
          planType: usage.planType || 'sselfie-studio',
          isFirstMessage: messages.length === 0
        },
        conversationHistory: messages.slice(-6).map(msg => ({
          role: msg.role,
          content: msg.content
        }))
      });

      // Enhanced response handling with reverse handoff support
      if (response.type === 'workspace_handoff') {
        // Handle reverse handoff from Maya page to workspace
        const handoffMessage: ChatMessage = {
          id: Date.now().toString() + '_handoff',
          type: 'maya',
          content: response.message,
          timestamp: new Date(),
          isFormatted: true
        };
        setMessages(prev => [...prev, handoffMessage]);

        // Continue with workspace conversation
        setTimeout(() => {
          const followUpMessage: ChatMessage = {
            id: Date.now().toString() + '_followup',
            type: 'maya',
            content: "Now, let's dive deep into your business consultation needs. What specific challenges or opportunities would you like to explore?",
            timestamp: new Date(),
            isFormatted: true
          };
          setMessages(prev => [...prev, followUpMessage]);
        }, 1500);

      } else if (response.type === 'onboarding' || response.type === 'onboarding_complete') {
        setIsOnboarding(response.type === 'onboarding');
        setCurrentOnboardingData(response);

        // Update business context
        if (response.businessContext) {
          setBusinessContext(prev => ({ ...prev, ...response.businessContext }));
        }

        const assistantMessage: ChatMessage = {
          id: Date.now().toString() + '_maya',
          type: 'onboarding',
          content: response.question || response.message,
          timestamp: new Date(),
          onboardingData: response
        };
        setMessages(prev => [...prev, assistantMessage]);
      } else {
        const assistantMessage: ChatMessage = {
          id: Date.now().toString() + '_maya',
          type: response.isStrategy ? 'strategy' : 'maya',
          content: response.content || response.message,
          timestamp: new Date(),
          isFormatted: true,
          businessContext: response.businessContext
        };
        setMessages(prev => [...prev, assistantMessage]);
      }

    } catch (error) {
      console.error('Maya chat error:', error);
      toast({
        title: "Connection Issue",
        description: "Unable to reach Maya right now. Please try again.",
      });
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto mb-6">
            <div className="absolute inset-0 border-2 border-gray-200 rounded-full"></div>
            <div className="absolute inset-0 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
          </div>
          <div 
            className="text-lg text-black mb-2"
            style={{
              fontFamily: 'Times New Roman, serif',
              fontWeight: 200,
              letterSpacing: '0.3em',
              textTransform: 'uppercase'
            }}
          >
            Loading Studio
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <MemberNavigation transparent={false} />

      {/* Maya Mode Indicator - Consultation Mode */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-200">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-blue-700" style={{ fontFamily: 'Times New Roman, serif' }}>
                Maya - Business Strategy Mode
              </span>
              <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                Consultation & Planning
              </span>
            </div>
            <button
              onClick={() => setLocation('/maya')}
              className="text-xs text-blue-600 hover:text-blue-800 transition-colors"
              style={{ fontFamily: 'Times New Roman, serif' }}
            >
              Switch to Photo Creation →
            </button>
          </div>
        </div>
      </div>

      {/* Welcome Section - Luxury Brand Aligned */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8 py-8 sm:py-16" style={{ paddingTop: '128px' }}>
        <div className="text-center mb-8 sm:mb-16">
          <h1 
            className="text-3xl sm:text-4xl md:text-5xl text-black mb-3 sm:mb-4"
            style={{ 
              fontFamily: 'Times New Roman, serif', 
              fontWeight: 200, 
              letterSpacing: '0.25em',
              lineHeight: 1.1
            }}
          >
            WELCOME
          </h1>
          <p 
            className="text-gray-600 tracking-wider text-sm"
            style={{ 
              fontFamily: 'Helvetica Neue',
              fontWeight: 300,
              letterSpacing: '0.1em' 
            }}
          >
            {userName}
          </p>
        </div>

        {/* Maya Chat Interface - Mobile Optimized */}
        <div className="max-w-2xl mx-auto mb-16 sm:mb-32">
          <div className="bg-gray-50 border border-gray-200 p-4 sm:p-8 mb-6 sm:mb-8">
            {/* Enhanced Maya Welcome with Controls */}
            <div className="text-center mb-4 sm:mb-6">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <h3 
                  className="text-base sm:text-lg text-black flex-1"
                  style={{ 
                    fontFamily: 'Times New Roman, serif', 
                    fontWeight: 200, 
                    letterSpacing: '0.1em' 
                  }}
                >
                  {welcomeContent.greeting}
                </h3>

                {/* Chat Controls */}
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleClearChat}
                    className="p-2 text-gray-400 hover:text-gray-600 transition-colors touch-manipulation min-h-[44px] min-w-[44px] flex items-center justify-center"
                    title="Clear conversation"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                  <button
                    onClick={handleReOnboarding}
                    className="p-2 text-gray-400 hover:text-gray-600 transition-colors touch-manipulation min-h-[44px] min-w-[44px] flex items-center justify-center"
                    title="Restart onboarding"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </button>
                </div>
              </div>

              <p 
                className="text-gray-800 mb-3 sm:mb-4 text-sm sm:text-base"
                style={{ 
                  fontFamily: 'Helvetica Neue', 
                  fontWeight: 300, 
                  lineHeight: 1.7 
                }}
              >
                {welcomeContent.message}
              </p>

              {/* Business Context Display */}
              {Object.keys(businessContext).length > 0 && (
                <div className="bg-black/5 rounded-lg px-3 sm:px-4 py-3 mb-3 sm:mb-4">
                  <p 
                    className="text-xs text-gray-500 mb-2 uppercase tracking-wider"
                    style={{ letterSpacing: '0.15em' }}
                  >
                    Your Business Context
                  </p>
                  <div className="space-y-1 text-sm text-gray-700">
                    {businessContext.industry && <span>• {businessContext.industry}</span>}
                    {businessContext.targetAudience && <span>• {businessContext.targetAudience}</span>}
                    {businessContext.currentSituation && <span>• {businessContext.currentSituation}</span>}
                  </div>
                </div>
              )}

              {messages.length === 0 && (
                <p 
                  className="text-gray-600 text-sm italic"
                  style={{ fontFamily: 'Helvetica Neue', fontWeight: 300 }}
                >
                  {welcomeContent.suggestion}
                </p>
              )}
            </div>

            {/* Optimized Conversation Display */}
            {messages.length > 0 && (
              <div className="mb-4 sm:mb-6">
                <div 
                  ref={chatContainerRef}
                  onScroll={handleScroll}
                  className="max-h-80 overflow-y-auto overscroll-contain scroll-smooth"
                  style={{
                    WebkitOverflowScrolling: 'touch',
                    scrollbarWidth: 'thin',
                    scrollbarColor: '#e5e7eb transparent'
                  }}
                >
                  <div className="space-y-4 sm:space-y-6 p-1">
                    {messages.map((message, index) => {
                      if (message.type === 'onboarding') {
                        return (
                          <div key={message.id} className="flex justify-start">
                            <div className="max-w-full w-full">
                              <div className="mb-3 sm:mb-4 flex items-center">
                                <span 
                                  className="text-xs text-gray-400 tracking-wider uppercase mr-4" 
                                  style={{ letterSpacing: '0.2em' }}
                                >
                                  Maya
                                </span>
                                <div className="flex-1 h-px bg-gray-200"></div>
                                {message.onboardingData && (
                                  <span 
                                    className="text-xs text-gray-400 tracking-wider uppercase ml-4" 
                                    style={{ letterSpacing: '0.2em' }}
                                  >
                                    Step {message.onboardingData.step} of {message.onboardingData.totalSteps}
                                  </span>
                                )}
                              </div>

                              <div className="bg-gray-50 border border-gray-100 px-4 sm:px-6 py-4 sm:py-6 mb-3 sm:mb-4 rounded-lg">
                                <p 
                                  className="text-gray-800 mb-3 sm:mb-4 text-sm sm:text-base" 
                                  style={{ fontFamily: 'Helvetica Neue', fontWeight: 300, lineHeight: 1.6 }}
                                >
                                  {message.content}
                                </p>

                                {message.onboardingData?.explanation && (
                                  <p className="text-sm text-gray-600 mb-3 sm:mb-4 italic leading-relaxed">
                                    {message.onboardingData.explanation}
                                  </p>
                                )}

                                {message.onboardingData?.options ? (
                                  <div className="space-y-2">
                                    {message.onboardingData.options.map((option) => (
                                      <button
                                        key={option}
                                        onClick={() => handleOnboardingResponse(message.onboardingData!.fieldName, option)}
                                        className="w-full text-left px-3 sm:px-4 py-3 border border-gray-200 hover:border-black hover:bg-white transition-all duration-200 rounded-lg touch-manipulation min-h-[48px] flex items-center"
                                        style={{ fontFamily: 'Helvetica Neue', fontWeight: 300 }}
                                        disabled={isTyping}
                                      >
                                        <span className="text-sm text-gray-700">
                                          {option.charAt(0).toUpperCase() + option.slice(1)}
                                        </span>
                                      </button>
                                    ))}
                                  </div>
                                ) : (
                                  <input
                                    type="text"
                                    placeholder="Type your answer..."
                                    className="w-full px-3 sm:px-4 py-3 border border-gray-300 focus:border-black focus:outline-none transition-colors bg-white rounded-lg text-sm sm:text-base"
                                    style={{ 
                                      fontFamily: 'Helvetica Neue', 
                                      fontWeight: 300,
                                      fontSize: '16px', // Prevents iOS zoom
                                      minHeight: '48px'
                                    }}
                                    disabled={isTyping}
                                    onKeyPress={(e) => {
                                      if (e.key === 'Enter') {
                                        const target = e.target as HTMLInputElement;
                                        if (target.value.trim()) {
                                          handleOnboardingResponse(message.onboardingData!.fieldName, target.value.trim());
                                          target.value = '';
                                        }
                                      }
                                    }}
                                  />
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      } else if (message.type === 'strategy') {
                        return (
                          <div key={message.id} className="flex justify-start">
                            <div className="max-w-full w-full">
                              <div className="mb-2 sm:mb-3">
                                <span 
                                  className="text-xs text-gray-400 tracking-wider uppercase" 
                                  style={{ letterSpacing: '0.2em' }}
                                >
                                  Maya • Strategy
                                </span>
                              </div>
                              <div className="bg-gradient-to-br from-black to-gray-800 text-white px-4 sm:px-6 py-4 sm:py-6 rounded-lg shadow-sm">
                                <div 
                                  className="break-words whitespace-pre-wrap text-sm sm:text-base" 
                                  style={{ fontFamily: 'Helvetica Neue', fontWeight: 300, lineHeight: '1.6' }}
                                >
                                  {message.content}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      } else {
                        return (
                          <div 
                            key={message.id} 
                            className={`flex items-end gap-2 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                          >
                            {message.type !== 'user' && (
                              <div className="mb-6 sm:mb-8">
                                <span 
                                  className="text-xs text-gray-400 tracking-wider uppercase" 
                                  style={{ letterSpacing: '0.2em' }}
                                >
                                  Maya
                                </span>
                              </div>
                            )}
                            <div 
                              className={`max-w-[85%] sm:max-w-lg px-3 sm:px-4 py-2 sm:py-3 transition-all duration-200 ${
                                message.type === 'user'
                                  ? 'bg-black text-white rounded-2xl rounded-br-md shadow-sm'
                                  : 'bg-gray-50 border border-gray-100 text-gray-800 rounded-2xl rounded-bl-md shadow-sm'
                              }`}
                              style={{ 
                                fontFamily: 'Helvetica Neue', 
                                fontWeight: 300, 
                                fontSize: '14px',
                                lineHeight: '1.6'
                              }}
                            >
                              <div className={`break-words ${message.isFormatted ? 'whitespace-pre-wrap' : ''}`}>
                                {message.content}
                              </div>
                            </div>
                          </div>
                        );
                      }
                    })}

                    {/* Enhanced typing indicator */}
                    {isTyping && (
                      <div className="flex justify-start items-end gap-2">
                        <div className="bg-white border border-gray-200 px-3 sm:px-4 py-2 sm:py-3 rounded-2xl rounded-bl-md shadow-sm">
                          <div className="flex items-center space-x-1">
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
                          </div>
                        </div>
                      </div>
                    )}

                    <div ref={messagesEndRef} className="h-1" />
                  </div>
                </div>

                {/* Scroll to bottom indicator */}
                {!isNearBottom && messages.length > 2 && (
                  <div className="flex justify-center mt-2">
                    <button
                      onClick={() => smartScrollToBottom(0, true)}
                      className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs rounded-full transition-colors flex items-center gap-1 touch-manipulation"
                      style={{ fontFamily: 'Helvetica Neue', fontWeight: 400 }}
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                      </svg>
                      New messages
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Optimized Chat Input */}
            <div className="flex items-end space-x-2 sm:space-x-3 pt-2">
              <div className="flex-1">
                <input
                  type="text"
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={messages.length === 0 ? welcomeContent.suggestion : "Continue your conversation..."}
                  className="w-full px-3 sm:px-4 py-3 border border-gray-300 focus:border-black focus:outline-none bg-white transition-all duration-200 rounded-2xl resize-none text-gray-800 placeholder-gray-500 text-sm sm:text-base"
                  style={{ 
                    fontFamily: 'Helvetica Neue', 
                    fontWeight: 300,
                    fontSize: '16px', // Prevents iOS zoom
                    minHeight: '48px'
                  }}
                  disabled={isTyping}
                />
              </div>
              <button 
                onClick={handleSendMessage}
                disabled={!chatMessage.trim() || isTyping}
                className={`p-3 rounded-full transition-all duration-200 flex-shrink-0 touch-manipulation ${
                  chatMessage.trim() && !isTyping
                    ? 'bg-black text-white hover:bg-gray-800 shadow-sm'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
                style={{ minHeight: '48px', minWidth: '48px' }}
              >
                {isTyping ? (
                  <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Context-Aware Action Buttons - Mobile Optimized */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <button 
              onClick={() => setLocation('/maya')}
              className="bg-black text-white px-6 sm:px-8 py-4 sm:py-6 hover:bg-gray-800 transition-colors touch-manipulation min-h-[56px]"
              style={{ 
                fontFamily: 'Times New Roman, serif',
                fontWeight: 200,
                fontSize: '12px',
                textTransform: 'uppercase',
                letterSpacing: '0.3em'
              }}
            >
              {userState === 'new' ? 'START' : userState === 'experienced' ? 'CREATE MORE' : 'STYLE'}
            </button>
            <button 
              onClick={() => setLocation('/sselfie-gallery')}
              className="border border-black text-black px-6 sm:px-8 py-4 sm:py-6 hover:bg-black hover:text-white transition-colors touch-manipulation min-h-[56px]"
              style={{ 
                fontFamily: 'Times New Roman, serif',
                fontWeight: 200,
                fontSize: '12px',
                textTransform: 'uppercase',
                letterSpacing: '0.3em'
              }}
            >
              {aiImages.length > 0 ? `VIEW ${aiImages.length}` : 'GALLERY'}
            </button>
          </div>

          {/* Smart Suggestions Based on User State */}
          {messages.length === 0 && (
            <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-gray-200">
              <p 
                className="text-xs text-gray-500 uppercase tracking-wider text-center mb-3 sm:mb-4"
                style={{ letterSpacing: '0.15em' }}
              >
                Quick Start
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {userState === 'experienced' && (
                  <>
                    <button 
                      onClick={() => setChatMessage('Create new headshots for LinkedIn')}
                      className="px-3 sm:px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm rounded transition-colors touch-manipulation"
                    >
                      New Headshots
                    </button>
                    <button 
                      onClick={() => setChatMessage('I need photos for an upcoming event')}
                      className="px-3 sm:px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm rounded transition-colors touch-manipulation"
                    >
                      Event Photos
                    </button>
                  </>
                )}
                {userState === 'new' && (
                  <>
                    <button 
                      onClick={() => setChatMessage('I need professional headshots')}
                      className="px-3 sm:px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm rounded transition-colors touch-manipulation"
                    >
                      Headshots
                    </button>
                    <button 
                      onClick={() => setChatMessage('Photos for my website')}
                      className="px-3 sm:px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm rounded transition-colors touch-manipulation"
                    >
                      Website Photos
                    </button>
                  </>
                )}
                {(userState === 'returning' || userState === 'getting-started') && (
                  <>
                    <button 
                      onClick={() => setChatMessage('Show me my recent photos')}
                      className="px-3 sm:px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm rounded transition-colors touch-manipulation"
                    >
                      Recent Work
                    </button>
                    <button 
                      onClick={() => setChatMessage('What new styles can we try?')}
                      className="px-3 sm:px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm rounded transition-colors touch-manipulation"
                    >
                      New Styles
                    </button>
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Branding Section - Redesigned with Luxury Editorial Layout */}
        <section>
          <h2 
            className="text-2xl sm:text-3xl text-black mb-12 sm:mb-16 text-center"
            style={{ 
              fontFamily: 'Times New Roman, serif', 
              fontWeight: 200, 
              letterSpacing: '0.25em'
            }}
          >
            BRANDING
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
            {/* Feed Mockup - Mobile First */}
            <div className="lg:col-span-1 order-1">
              <h3 
                className="text-sm tracking-wider uppercase text-gray-500 mb-4 sm:mb-6 text-center"
                style={{ 
                  fontFamily: 'Helvetica Neue',
                  fontWeight: 400,
                  letterSpacing: '0.2em' 
                }}
              >
                Feed Mockup
              </h3>

              {/* Template Selector - Touch Optimized */}
              <div className="mb-4 sm:mb-6">
                <div className="flex justify-center space-x-3 mb-3 sm:mb-4">
                  {Object.entries(templates).map(([key, template]) => (
                    <button
                      key={key}
                      onClick={() => setSelectedTemplate(key)}
                      className={`w-8 h-8 sm:w-6 sm:h-6 border-2 transition-all touch-manipulation ${
                        selectedTemplate === key ? 'border-black' : 'border-gray-300'
                      }`}
                      style={{ backgroundColor: template.colors[0] }}
                    />
                  ))}
                </div>
                <p 
                  className="text-xs text-center text-gray-500 tracking-wider uppercase"
                  style={{ 
                    fontFamily: 'Helvetica Neue',
                    letterSpacing: '0.15em' 
                  }}
                >
                  {currentTemplate.name}
                </p>
              </div>

              {/* Instagram Feed - Editorial Style */}
              <div className="bg-white border border-gray-200 p-3 sm:p-4">
                {/* Maya's Profile Suggestions */}
                <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-gray-50 border border-gray-200">
                  <p 
                    className="text-xs text-gray-500 tracking-wider uppercase mb-3 text-center"
                    style={{ 
                      fontFamily: 'Helvetica Neue',
                      letterSpacing: '0.15em' 
                    }}
                  >
                    Maya's Suggestions
                  </p>

                  {/* Profile Image Suggestion */}
                  <div className="flex items-center space-x-3 sm:space-x-4 mb-3 sm:mb-4">
                    <img 
                      src={profileSuggestion.image}
                      alt="Suggested profile"
                      className="w-12 h-12 sm:w-16 sm:h-16 rounded-full object-cover border-2 border-gray-300 flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p 
                        className="text-sm font-medium mb-1 truncate"
                        style={{ fontFamily: 'Helvetica Neue', fontWeight: 400 }}
                      >
                        {userName.toLowerCase()}_studio
                      </p>
                      <button 
                        className="text-xs text-black hover:text-gray-600 touch-manipulation"
                        style={{ fontFamily: 'Helvetica Neue', fontWeight: 300 }}
                      >
                        Use this profile photo
                      </button>
                    </div>
                  </div>

                  {/* Bio Suggestion */}
                  <div className="border-t border-gray-200 pt-3">
                    <p 
                      className="text-xs text-gray-500 mb-2"
                      style={{ fontFamily: 'Helvetica Neue' }}
                    >
                      Suggested Bio:
                    </p>
                    <div 
                      className="text-xs sm:text-sm text-gray-800 leading-relaxed whitespace-pre-line mb-2"
                      style={{ fontFamily: 'Helvetica Neue', fontWeight: 300, lineHeight: 1.6 }}
                    >
                      {profileSuggestion.bio}
                    </div>
                    <button 
                      className="text-xs text-black hover:text-gray-600 touch-manipulation"
                      style={{ fontFamily: 'Helvetica Neue', fontWeight: 300 }}
                      onClick={() => navigator.clipboard.writeText(profileSuggestion.bio)}
                    >
                      Copy bio
                    </button>
                  </div>
                </div>

                {/* Instagram Header */}
                <div className="flex items-center space-x-3 mb-3 sm:mb-4 pb-3 sm:pb-4 border-b border-gray-100">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gray-300 rounded-full flex-shrink-0"></div>
                  <div className="min-w-0">
                    <p 
                      className="text-sm font-medium truncate"
                      style={{ fontFamily: 'Helvetica Neue', fontWeight: 400 }}
                    >
                      {userName.toLowerCase()}_studio
                    </p>
                    <p 
                      className="text-xs text-gray-500"
                      style={{ fontFamily: 'Helvetica Neue', fontWeight: 300 }}
                    >
                      Professional Photos
                    </p>
                  </div>
                </div>

                {/* 3x3 Image Grid */}
                <div className="grid grid-cols-3 gap-1 mb-3 sm:mb-4">
                  {userImages.slice(0, 9).map((image, index) => (
                    <div key={index} className="relative aspect-square group cursor-pointer touch-manipulation">
                      <img 
                        src={image} 
                        alt={`Professional photo ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <div className={`absolute inset-0 ${currentTemplate.overlayStyle} opacity-0 group-hover:opacity-100 group-active:opacity-100 transition-opacity flex items-center justify-center`}>
                        <span 
                          className="text-xs tracking-wider uppercase"
                          style={{ 
                            fontFamily: 'Times New Roman, serif',
                            letterSpacing: '0.2em' 
                          }}
                        >
                          {currentTemplate.name.split(' ')[0]}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                <button className="w-full py-3 bg-gray-50 hover:bg-gray-100 transition-colors touch-manipulation min-h-[48px]">
                  <span 
                    className="text-xs tracking-wider uppercase text-gray-600"
                    style={{ 
                      fontFamily: 'Times New Roman, serif',
                      letterSpacing: '0.2em' 
                    }}
                  >
                    Save Feed to Phone
                  </span>
                </button>
              </div>
            </div>

            {/* Calendar Widget - Redesigned Editorial Luxury */}
            <div className="lg:col-span-1 order-3 lg:order-2">
              <h3 
                className="text-sm tracking-wider uppercase text-gray-500 mb-4 sm:mb-6 text-center"
                style={{ 
                  fontFamily: 'Helvetica Neue',
                  fontWeight: 400,
                  letterSpacing: '0.2em' 
                }}
              >
                Calendar Widget
              </h3>

              <div className="bg-white border border-gray-200 p-4 sm:p-6">
                <div className="text-center mb-6">
                  <h4 
                    className="text-xl sm:text-2xl tracking-wider uppercase mb-2 text-black"
                    style={{ 
                      fontFamily: 'Times New Roman, serif', 
                      fontWeight: 200,
                      letterSpacing: '0.25em' 
                    }}
                  >
                    {new Date().toLocaleString('default', { month: 'long' }).toUpperCase()}
                  </h4>
                  <p 
                    className="text-sm text-gray-500"
                    style={{ fontFamily: 'Helvetica Neue', fontWeight: 300 }}
                  >
                    {new Date().getFullYear()}
                  </p>
                </div>

                {/* Editorial Calendar Grid */}
                <div className="grid grid-cols-7 gap-1 sm:gap-2 text-center text-sm mb-6 border border-gray-200">
                  {['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map((day) => (
                    <div 
                      key={day} 
                      className="text-gray-500 py-3 bg-gray-50 border-b border-gray-200"
                      style={{ 
                        fontFamily: 'Helvetica Neue', 
                        fontWeight: 400,
                        fontSize: '11px',
                        letterSpacing: '0.1em'
                      }}
                    >
                      {day}
                    </div>
                  ))}
                  {Array.from({ length: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate() }, (_, i) => (
                    <div 
                      key={i} 
                      className={`py-3 min-h-[44px] flex items-center justify-center touch-manipulation transition-all cursor-pointer ${
                        i + 1 === new Date().getDate() 
                          ? 'bg-black text-white' 
                          : 'text-gray-700 hover:bg-gray-100 border-b border-gray-100'
                      }`}
                      style={{ 
                        fontFamily: 'Helvetica Neue', 
                        fontWeight: 300,
                        fontSize: '14px'
                      }}
                    >
                      {i + 1}
                    </div>
                  ))}
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <p 
                    className="text-xs text-gray-500 mb-2 uppercase tracking-wider"
                    style={{ 
                      fontFamily: 'Helvetica Neue',
                      letterSpacing: '0.15em' 
                    }}
                  >
                    Next Session:
                  </p>
                  <p 
                    className="text-sm text-black"
                    style={{ fontFamily: 'Helvetica Neue', fontWeight: 400 }}
                  >
                    Maya Session - {new Date(Date.now() + 86400000).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Maya's Strategy - Editorial Black */}
            <div className="lg:col-span-1 order-2 lg:order-3">
              <h3 
                className="text-sm tracking-wider uppercase text-gray-500 mb-4 sm:mb-6 text-center"
                style={{ 
                  fontFamily: 'Helvetica Neue',
                  fontWeight: 400,
                  letterSpacing: '0.2em' 
                }}
              >
                Maya's Strategy
              </h3>

              <div className="bg-black text-white p-4 sm:p-6 h-full">
                <h4 
                  className="text-base sm:text-lg tracking-wider uppercase mb-4 sm:mb-6"
                  style={{ 
                    fontFamily: 'Times New Roman, serif', 
                    fontWeight: 200,
                    letterSpacing: '0.25em' 
                  }}
                >
                  YOUR BUSINESS
                </h4>

                <div 
                  className="space-y-4 sm:space-y-6 text-sm" 
                  style={{ fontFamily: 'Helvetica Neue', fontWeight: 300, lineHeight: 1.6 }}
                >
                  <div>
                    <p 
                      className="text-gray-300 uppercase tracking-wider text-xs mb-2" 
                      style={{ letterSpacing: '0.2em' }}
                    >
                      TARGET AUDIENCE
                    </p>
                    <p className="text-white text-sm">
                      Professional women seeking authentic business photography that builds credibility and trust.
                    </p>
                  </div>

                  <div>
                    <p 
                      className="text-gray-300 uppercase tracking-wider text-xs mb-2" 
                      style={{ letterSpacing: '0.2em' }}
                    >
                      COMPETITORS
                    </p>
                    <p className="text-white text-sm">
                      Traditional photographers charging €500+ per session vs your €47/month unlimited approach.
                    </p>
                  </div>

                  <div>
                    <p 
                      className="text-gray-300 uppercase tracking-wider text-xs mb-2" 
                      style={{ letterSpacing: '0.2em' }}
                    >
                      STRATEGY
                    </p>
                    <p className="text-white text-sm">
                      Consistent professional content that positions you as an established expert in your field.
                    </p>
                  </div>
                </div>

                <button 
                  onClick={() => setLocation('/maya')}
                  className="w-full mt-6 sm:mt-8 py-3 border border-white hover:bg-white hover:text-black transition-colors touch-manipulation min-h-[48px]"
                  style={{ 
                    fontFamily: 'Times New Roman, serif',
                    fontWeight: 200,
                    fontSize: '11px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.2em'
                  }}
                >
                  Update Strategy
                </button>
              </div>
            </div>
          </div>
        </section>
      </section>
    </div>
  );
}
import React, { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../hooks/use-auth';
import { useMayaGeneration } from '../hooks/useMayaGeneration';
import { useMayaPersistence } from '../hooks/useMayaPersistence';
import { useToast } from '../hooks/use-toast';
import { MayaCategorizedGallery } from '../components/maya-categorized-gallery';
import { MemberNavigation } from '../components/member-navigation';
import { useLocation } from 'wouter';

// Maya simplified workspace page

interface ChatMessage {
  id: string;
  type: 'user' | 'maya';
  content: string;
  timestamp: string;
  conceptCards?: ConceptCard[];
  isStreaming?: boolean;
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
    }
  }, [conversationData, messages.length, setMessages]);

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
      // PHASE 2.1: Add Maya's response with enhanced persistence
      addMessage({
        type: 'maya',
        content: data.response || data.content || data.message || '',
        timestamp: new Date().toISOString(),
        conceptCards: data.conceptCards || [],
        quickButtons: data.quickButtons || []
      });
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
      <div className="fixed inset-0 z-50 bg-white animate-fadeIn overflow-y-auto pt-20">
      {/* Editorial Hero Header - Magazine Style */}
      <div className="hero relative h-[40vh] bg-black text-white overflow-hidden">
        {/* Background Pattern */}
        <div className="hero-bg absolute inset-0 opacity-20">
          <div className="w-full h-full bg-gradient-to-br from-gray-900 via-black to-gray-800"></div>
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Cpath d='M30 30c0-16.569 13.431-30 30-30v60c-16.569 0-30-13.431-30-30z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}></div>
        </div>

        {/* Top Navigation Bar */}
        <div className="absolute top-0 left-0 right-0 z-20 flex justify-between items-center p-8">
          {/* Mobile Hamburger Menu */}
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="md:hidden text-[8px] sm:text-[10px] tracking-[0.15em] uppercase text-white/80 hover:text-white transition-colors px-3 py-2"
          >
            Menu
          </button>

          {/* Navigation Actions */}
          <div className="flex items-center space-x-6 sm:space-x-8">
            <button
              onClick={handleNewSession}
              className="text-[8px] sm:text-[10px] tracking-[0.15em] uppercase text-white/80 hover:text-white transition-colors px-3 py-2"
              title="Start a fresh conversation"
            >
              New Session
            </button>
            <button
              onClick={() => setLocation('/workspace')}
              className="text-[8px] sm:text-[10px] tracking-[0.15em] uppercase text-white/80 hover:text-white transition-colors px-3 py-2"
            >
              Back
            </button>
          </div>
        </div>

        {/* Hero Content - Compact */}
        <div className="hero-content relative z-10 flex flex-col justify-center items-center text-center h-full px-4 sm:px-8 py-6 sm:py-12">
          {/* Editorial Eyebrow */}
          <div className="hero-tagline eyebrow text-white/70 mb-2 sm:mb-4 text-xs sm:text-sm">
            Your Personal Photo Stylist
          </div>

          {/* Main Title - Editorial Size */}
          <h1 className="hero-title-main font-serif text-[clamp(3rem,8vw,7rem)] font-extralight uppercase tracking-[0.3em] sm:tracking-[0.5em] leading-[0.8] mb-2 sm:mb-3">
            MAYA
          </h1>

          {/* Subtitle */}
          <div className="hero-title-sub font-serif text-[clamp(0.9rem,3vw,2rem)] font-extralight uppercase tracking-[0.2em] sm:tracking-[0.3em] opacity-80 mb-3 sm:mb-6">
            Personal Brand Architect
          </div>

          {/* Description */}
          <p className="hero-description max-w-xl text-xs sm:text-sm font-light leading-relaxed opacity-90 tracking-[0.05em] px-4">
            I help you create photo concepts that tell your unique story and grow your brand.
          </p>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex">
        {/* Editorial Sidebar - Desktop & Mobile Overlay */}
        <div 
          className={`fixed top-0 left-0 h-full w-80 bg-white border-r border-gray-200 shadow-luxury z-40 transition-transform duration-300 ease-in-out overflow-y-auto transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
          style={{
            transform: isSidebarOpen ? 'translateX(0)' : 'translateX(-100%)'
          }}
        >
          {/* Close Button - Mobile & Desktop */}
          <div className="flex justify-end p-4 border-b border-gray-100">
            <button
              onClick={closeSidebar}
              className="text-gray-500 hover:text-black text-lg w-8 h-8 flex items-center justify-center rounded hover:bg-gray-100 transition-all cursor-pointer"
            >
              ✕
            </button>
          </div>

          {/* Sidebar Header */}
          <div className="px-8 py-12 border-b border-gray-100">
            <h2 className="font-serif text-xl font-extralight uppercase tracking-[0.2em] text-black mb-3">
              Quick Start
            </h2>
            <div className="eyebrow text-gray-500">
              Pick what you need help with
            </div>
          </div>

          <div className="px-8 py-16 space-y-16">
            {/* Editorial Quick Actions - Spacious */}
            <div className="space-y-8">
              {quickActions.slice(0, 3).map((action, index) => (
                <div key={index} className="editorial-card group cursor-pointer" onClick={() => setMessage(action)}>
                  <div className="card-content p-8 border border-gray-200 hover:border-black transition-all duration-500">
                    <div className="card-number text-5xl font-serif opacity-8 absolute top-4 right-6">
                      {String(index + 1).padStart(2, '0')}
                    </div>
                    <div className="relative z-10 pr-12">
                      <div className="eyebrow text-gray-500 mb-4 group-hover:text-white transition-colors duration-500">
                        Session {String(index + 1).padStart(2, '0')}
                      </div>
                      <div className="text-sm font-light leading-relaxed group-hover:text-white transition-colors duration-500">
                        {action}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Editorial Style Categories - Grid with Space */}
            <div className="border-t border-gray-200 pt-12">
              <h3 className="font-serif text-lg font-extralight uppercase tracking-[0.2em] text-black mb-8">
                Categories
              </h3>
              <div className="grid grid-cols-2 gap-6">
                {[
                  { name: 'Business', desc: 'Executive' },
                  { name: 'Lifestyle', desc: 'Personal' },
                  { name: 'Travel', desc: 'Location' },
                  { name: 'Fashion', desc: 'Editorial' }
                ].map((category, index) => (
                  <div key={index} className="text-center py-8 border border-gray-200 hover:bg-black hover:text-white transition-all duration-300 cursor-pointer group">
                    <div className="text-xs font-normal uppercase tracking-[0.3em] mb-3 group-hover:text-white">
                      {category.name}
                    </div>
                    <div className="text-xs text-gray-500 group-hover:text-white/70">
                      {category.desc}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Editorial Statistics - More Space */}
            <div className="border-t border-gray-200 pt-12">
              <div className="text-center space-y-6">
                <div className="font-serif text-3xl font-extralight text-black">295</div>
                <div className="eyebrow text-gray-500">Photos Generated</div>
              </div>
            </div>
          </div>

          {/* Profile Section - Bottom */}
          <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center">
                <span className="text-lg font-serif text-gray-600">
                  {user?.firstName?.charAt(0) || user?.email?.charAt(0) || 'U'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-900 truncate">
                  {user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : user?.email}
                </div>
                <div className="text-xs text-gray-500 truncate">
                  SSELFIE Studio Member
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Maya Chat - The Star of the Show */}
        <div className="flex-1 bg-gradient-to-b from-white to-gray-50" ref={chatContainerRef}>
          <div className="max-w-6xl mx-auto px-4 sm:px-8 md:px-16 py-8 sm:py-16 space-y-12 sm:space-y-20">
            {messages.length === 0 && (
              <div className="section text-center py-32">
                <div className="eyebrow text-gray-500 mb-8">
                  Welcome! I'm here to help
                </div>
                <div className="font-serif text-[clamp(2rem,5vw,4rem)] font-extralight text-black mb-8 italic">
                  "Let's create your next photo concept"
                </div>
                <p className="text-gray-600 max-w-2xl mx-auto font-light leading-relaxed text-lg">
                  Just tell me what kind of photos you need, and I'll create personalized photo concepts 
                  that capture your style and story.
                </p>
                
                {/* Editorial Decorative Element */}
                <div className="mt-12 flex justify-center">
                  <div className="w-32 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
                </div>
              </div>
            )}

            {messages.map((msg) => (
              <div key={msg.id} className="animate-fadeIn">
                {msg.type === 'user' ? (
                  // User Message - Editorial Style
                  <div className="flex justify-end mb-12">
                    <div className="max-w-2xl">
                      <div className="eyebrow text-right text-gray-500 mb-4">
                        Your Vision
                      </div>
                      <div className="editorial-card bg-black text-white">
                        <div className="card-content p-8">
                          <div className="text-lg leading-relaxed font-light">
                            {msg.content}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  // Maya Message - Magazine Layout
                  <div className="max-w-5xl">
                    <div className="eyebrow text-gray-500 mb-6">
                      Maya • Personal Brand Architect
                    </div>
                    
                    <div className="bg-white border border-gray-200 shadow-lg">
                      <div className="p-12">
                        <div className="text-lg leading-relaxed font-light text-gray-800 whitespace-pre-wrap">
                          {msg.content}
                        </div>
                        
                        {/* Editorial Concept Cards */}
                        {msg.conceptCards && msg.conceptCards.length > 0 && (
                          <div className="mt-12 pt-12 border-t border-gray-200">
                            <div className="font-serif text-lg sm:text-2xl font-extralight uppercase tracking-[0.2em] text-black mb-4 sm:mb-8">
                              Concept Cards
                            </div>
                            
                            <div className="grid gap-8">
                              {msg.conceptCards.map((card, index) => {
                                const isExpanded = expandedCards.has(card.id);
                                
                                return (
                                  <div key={card.id} className="editorial-card group border border-gray-200">
                                    <div className="card-content p-4 sm:p-8 relative">
                                      <div className="card-number text-3xl sm:text-6xl font-serif opacity-5 absolute top-2 sm:top-4 right-4 sm:right-6">
                                        {String(index + 1).padStart(2, '0')}
                                      </div>
                                      
                                      <div className="relative z-10 pr-12 sm:pr-20">
                                        <div className="flex items-start justify-between mb-6 sm:mb-8">
                                          <div className="flex-1">
                                            <h3 className="font-serif text-base sm:text-xl font-light uppercase tracking-[0.1em] text-black mb-4 sm:mb-6 leading-tight">
                                              {cleanDisplayTitle(card.title)}
                                            </h3>
                                          </div>
                                          {card.imageUrl && (
                                            <div className="w-20 h-20 ml-6 bg-gray-100 border border-gray-200"></div>
                                          )}
                                        </div>
                                        
                                        {isExpanded && (
                                          <p className="text-sm sm:text-base leading-relaxed font-light text-gray-700 mb-6 sm:mb-8">
                                            {card.description}
                                          </p>
                                        )}
                                        
                                        {/* Action Buttons Row */}
                                        <div className="flex items-center justify-between gap-2 mt-2 sm:mt-4">
                                          <button
                                            onClick={() => toggleCardExpansion(card.id)}
                                            className="text-xs uppercase tracking-[0.2em] sm:tracking-[0.3em] text-gray-600 hover:text-black transition-colors flex-shrink-0"
                                          >
                                            {isExpanded ? 'Collapse' : 'Details'}
                                          </button>
                                          
                                          <button
                                            onClick={() => handleGenerateImage(card)}
                                            disabled={card.isGenerating}
                                            className="bg-black text-white px-4 sm:px-6 py-2 text-xs uppercase tracking-[0.2em] sm:tracking-[0.3em] hover:bg-gray-800 transition-colors disabled:opacity-50 min-w-[80px] sm:min-w-[100px]"
                                          >
                                            {card.isGenerating ? 'Creating...' : 'Generate'}
                                          </button>
                                        </div>
                                        
                                        {/* Loading Indicator During Generation */}
                                        {card.isGenerating && (
                                          <div className="mt-6 pt-6 border-t border-gray-200">
                                            <div className="eyebrow text-gray-500 mb-4">
                                              Generating Images
                                            </div>
                                            <div className="bg-gray-50 border border-gray-200 h-48 flex items-center justify-center">
                                              <div className="flex flex-col items-center space-y-4">
                                                <div className="flex space-x-2">
                                                  <div className="w-3 h-3 bg-black rounded-full animate-bounce"></div>
                                                  <div className="w-3 h-3 bg-black rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                                                  <div className="w-3 h-3 bg-black rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></div>
                                                </div>
                                                <div className="text-sm font-light text-gray-600">
                                                  Creating your personalized image...
                                                </div>
                                              </div>
                                            </div>
                                          </div>
                                        )}

                                        {/* Generated Images Display - Always show results */}
                                        {card.generatedImages && card.generatedImages.length > 0 && (
                                          <div className="image-grid">
                                          <div className="eyebrow text-gray-500 mb-4">Generated Images</div>
                                          {card.generatedImages.map((imageUrl, imgIndex) => {
                                            // Use proxy URL immediately to avoid CORS issues
                                            const proxyUrl = `/api/proxy-image?url=${encodeURIComponent(imageUrl)}`;
                                            return (
                                              <div key={imgIndex} className="image-item group cursor-pointer hover:scale-105 active:scale-95 transition-transform duration-200" onClick={() => setSelectedImage?.(proxyUrl)}>
                                                <img 
                                                  src={proxyUrl}
                                                  alt={`Generated ${cleanDisplayTitle(card.title)} ${imgIndex + 1}`}
                                                  onLoad={() => {
                                                    console.log('✅ Image loaded via proxy:', proxyUrl);
                                                    // Auto-save to gallery
                                                    handleAutoSaveToGallery(imageUrl, card.title);
                                                  }}
                                                  onError={(e) => {
                                                    console.error('❌ Image proxy failed:', proxyUrl);
                                                    const target = e.target as HTMLImageElement;
                                                    target.style.display = 'none';
                                                    const parent = target.parentElement;
                                                    if (parent && !parent.querySelector('.error-fallback')) {
                                                      parent.innerHTML += '<div class="error-fallback text-center py-8 text-gray-500">Image unavailable</div>';
                                                    }
                                                  }}
                                                />
                                                {/* Heart/Save Button - Mobile Optimized */}
                                                <button
                                                  className="save-btn absolute top-2 right-2 w-12 h-12 sm:w-10 sm:h-10 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-md transition-all text-red-500 hover:text-red-600 opacity-80 sm:opacity-0 sm:group-hover:opacity-100 active:scale-90 touch-manipulation"
                                                  onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleSaveToGallery(imageUrl, card.title);
                                                  }}
                                                  title="Save to gallery"
                                                >
                                                  ♥
                                                </button>
                                              </div>
                                            );
                                          })}
                                        </div>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* Maya Typing Indicator - Editorial Style */}
            {isTyping && (
              <div className="animate-fadeIn">
                <div className="eyebrow text-gray-500 mb-3 sm:mb-6 text-xs sm:text-sm">
                  Maya • Creating your professional photos
                </div>
                <div className="bg-white border border-gray-200 shadow-lg">
                  <div className="p-6 sm:p-12 flex items-center space-x-4">
                    <div className="flex space-x-2">
                      <div className="w-3 h-3 bg-black rounded-full animate-bounce"></div>
                      <div className="w-3 h-3 bg-black rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                      <div className="w-3 h-3 bg-black rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></div>
                    </div>
                    <div className="text-sm font-light text-gray-600">
                      Creating your professional photos...
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Integrated Chat Input - Part of Conversation Flow */}
            <div className="max-w-4xl mx-auto px-4 sm:px-0">
              {/* Input as Natural Chat Element */}
              <div className="bg-white border border-gray-200 shadow-lg animate-fadeIn">
                <div className="p-6 sm:p-12">
                  <div className="eyebrow text-gray-500 mb-3 sm:mb-6 text-xs sm:text-sm">
                    Get professional photos • Tell me your business goals
                  </div>
                  
                  <div className="space-y-4 sm:space-y-6">
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="What professional photos do you need for your business?"
                      className="w-full border-0 resize-none bg-transparent text-base sm:text-lg font-light leading-relaxed placeholder-gray-400 focus:outline-none"
                      rows={3}
                      disabled={isTyping}
                    />
                    
                    {/* Full Width Send Button */}
                    <div className="pt-4 border-t border-gray-100">
                      <button
                        onClick={handleSendMessage}
                        disabled={!message.trim() || isTyping}
                        className="editorial-card group bg-black text-white hover:bg-gray-800 active:bg-gray-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed w-full min-h-[48px] touch-manipulation"
                      >
                        <div className="card-content px-4 sm:px-8 py-3 relative">
                          <div className="text-xs font-normal uppercase tracking-[0.2em] sm:tracking-[0.3em] group-hover:text-white transition-colors duration-300">
                            {isTyping ? 'Creating...' : 'Get Professional Photos'}
                          </div>
                        </div>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div ref={messagesEndRef} />
          </div>
        </div>
      </div>

      {/* Integrated Auto-Categorizing Gallery */}
      <div className="bg-gray-50 border-t border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-8 py-8 sm:py-12">
          <div className="mb-6 sm:mb-8">
            <div className="eyebrow text-gray-500 mb-2 text-xs sm:text-sm">Your Photo Collection</div>
            <h2 className="font-serif text-xl sm:text-2xl font-extralight uppercase tracking-[0.15em] sm:tracking-[0.2em] text-black">
              All Your Photos
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 mt-2">Professional photos ready for LinkedIn, Instagram, websites, and business use</p>
          </div>
          <MayaCategorizedGallery />
        </div>
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
              {/* Close Button */}
              <button 
                onClick={() => setSelectedImage(null)}
                className="w-12 h-12 sm:w-10 sm:h-10 flex items-center justify-center bg-white/90 hover:bg-white text-gray-700 hover:text-black rounded-full transition-all shadow-lg active:scale-90 touch-manipulation"
                title="Close"
              >
                <span className="text-xl leading-none">×</span>
              </button>
            </div>

            {/* Image Info */}
            <div className="absolute bottom-4 left-4 bg-black/60 text-white px-4 py-2 rounded-lg backdrop-blur-sm">
              <div className="text-sm font-medium">Your Photo</div>
              <div className="text-xs text-white/80">Saved to your collection</div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30"
          onClick={closeSidebar}
        ></div>
      )}
      </div>
    </>
  );
}
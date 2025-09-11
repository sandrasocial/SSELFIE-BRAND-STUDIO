import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../hooks/use-auth';
// Removed old duplicate hooks - now using centralized BrandStudioProvider
import { useToast } from '../../hooks/use-toast';
import { useBrandStudio } from '../../contexts/BrandStudioContext';
import { DirectorPanel } from './DirectorPanel';
import { CanvasPanel, LuxuryConceptCard, type ConceptCard } from './CanvasPanel';
import { ToolkitPanel, QuickActions, StatusDisplay } from './ToolkitPanel';
// REMOVED: Old Maya system components - now using centralized BrandStudioProvider
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocation } from 'wouter';
// REMOVED: Old useConceptCards hook - now using centralized BrandStudioProvider concept management

interface ChatMessage {
  id: string;
  type: 'user' | 'maya';
  content: string;
  timestamp: string;
  conceptCards?: ConceptCard[];
  quickButtons?: string[];
  isStreaming?: boolean;
}

interface PhotoStudioProps {
  panelMode?: 'director' | 'canvas' | 'toolkit';
  isMobile?: boolean;
}

export const PhotoStudio: React.FC<PhotoStudioProps> = ({ panelMode, isMobile = false }) => {
  const { user } = useAuth();
  const [location, setLocation] = useLocation();
  const [message, setMessage] = useState('');
  // Use centralized state from BrandStudioProvider (single call)
  const {
    messages,
    conceptCardsById,
    selectedConceptCardId,
    isTyping,
    sendMessage,
    selectConceptCard,
    isLoading,
    setActiveTab,
    setHandoffData,
    startNewSession,
    selectedItem,
    setSelectedItem
  } = useBrandStudio();
  
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());
  const selectedConceptCard = selectedConceptCardId ? conceptCardsById[selectedConceptCardId] : null;
  const hasStartedChat = messages.length > 0;
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isNearBottom, setIsNearBottom] = useState(true);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Auto-scroll refs from maya.tsx
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // All state management now handled by centralized BrandStudioProvider

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

  // Auto-scroll system from maya.tsx
  const handleScroll = () => {
    if (chatContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
      const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
      const nearBottom = distanceFromBottom < 100;
      
      setIsNearBottom(nearBottom);
      setShouldAutoScroll(nearBottom);
    }
  };

  const smartScrollToBottom = (delay = 0, force = false) => {
    setTimeout(() => {
      if ((shouldAutoScroll || force) && messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'end' 
        });
      }
    }, delay);
  };

  const scrollToNewContent = () => {
    setTimeout(() => {
      if (messagesEndRef.current && shouldAutoScroll) {
        messagesEndRef.current.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'end' 
        });
      }
    }, 300);
  };

  // Smart auto-scroll effects - handled by DirectorPanel via onScroll prop
  // Removed to prevent duplicate scroll listeners

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

  // REMOVED: Legacy database sync - now handled by centralized provider

  // Sync database conversation with localStorage
  // REMOVED: Legacy conversation syncing - now handled by centralized provider

  // REMOVED: Legacy chat state initialization - now handled by centralized provider

  // Enhanced seamless handoff
  useEffect(() => {
    const handoffContext = localStorage.getItem('maya-handoff-context');
    if (handoffContext && user) {
      try {
        const context = JSON.parse(handoffContext);
        console.log('ENHANCED HANDOFF: Received authenticated context from workspace:', context.message);
        console.log('User Profile:', context.userProfile);
        console.log('Business Context:', context.businessContext);
        
        if (context.userProfile?.userId === user.id) {
          const userName = context.userProfile?.name || 'there';
          // REMOVED: Legacy addMessage - now handled by centralized provider
          
          // FIXED: Clear message after handoff send to prevent duplicate sending
          setTimeout(() => {
            sendMessage(context.message);
            setMessage(''); // Clear the input to prevent duplicate sends
          }, 1000);
          
          console.log('✅ HANDOFF: User authentication verified, enhanced context applied');
        } else {
          console.warn('⚠️ HANDOFF: User authentication mismatch, proceeding with standard flow');
        }
        
        localStorage.removeItem('maya-handoff-context');
        // REMOVED: setHasStartedChat - now handled by centralized provider
        
      } catch (error) {
        console.error('Failed to process enhanced handoff context:', error);
      }
    }
  }, [user]);

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

  // Image generation using provider's mutation system
  const handleGenerateImage = async (card: ConceptCard) => {
    try {
      console.log('🎯 Starting image generation for:', card.title);
      toast({ title: "Generating Images", description: `Creating visuals for "${card.title}"...` });
      
      const generationPayload = {
        category: card.category || detectCategory(card.title),
        subcategory: card.creativeLook || card.title,
        prompt: card.fluxPrompt || card.description,
        conceptId: card.id,
        type: card.type || 'portrait',
        emoji: card.emoji
      };
      
      console.log('🚀 Image generation request:', generationPayload);
      
      // Call the generation endpoint
      const response = await fetch('/api/generate-user-images', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(generationPayload)
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Generation failed: ${response.status} - ${error}`);
      }

      const result = await response.json();
      console.log('✅ Generation response:', result);

      if (result.images && result.images.length > 0) {
        console.log('🖼️ Generated images:', result.images);
        
        toast({ 
          title: "Generation Complete!", 
          description: `Created ${result.images.length} images for "${card.title}"` 
        });

        // Auto-save first image to gallery
        if (result.images.length > 0) {
          await handleAutoSaveToGallery(result.images[0], card.title);
        }
      } else {
        throw new Error('No images generated');
      }
      
    } catch (error) {
      console.error('❌ Image generation failed:', error);
      toast({ 
        title: "Generation Failed", 
        description: error instanceof Error ? error.message : "Please try again" 
      });
    }
  };

  // New Session Management (using centralized provider)
  const handleNewSession = () => {
    if (messages.length > 0) {
      if (confirm(`Start a new styling session? This will clear your current conversation (${messages.length} messages) but Maya will remember your style preferences.`)) {
        // Use centralized startNewSession from provider
        startNewSession();
        selectConceptCard(null);
        toast({ title: "New Session Started", description: "Fresh conversation started! Maya still remembers your style preferences." });
      }
    } else {
      selectConceptCard(null);
      toast({ title: "New Session", description: "Ready for a fresh styling conversation!" });
    }
  };

  // Using centralized sendMessage from BrandStudioProvider - no more duplicates!

  const handleSendMessage = () => {
    if (!message.trim() || isTyping) return;

    // Use centralized sendMessage from BrandStudioProvider
    sendMessage(message.trim());
    setMessage('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const startSimpleConversation = () => {
    // Show Maya's welcome message without sending it as a user message
    // The provider should handle this via a static Maya welcome or direct message injection
    console.log('Starting conversation with Maya...');
    // TODO: Implement proper welcome message injection via provider
    // For now, this is a placeholder that doesn't send user messages
  };

  // Handle toolkit actions
  const handleToolkitAction = (action: string, data?: any) => {
    switch (action) {
      case 'generate':
        if (selectedConceptCard) {
          handleGenerateImage(selectedConceptCard);
        }
        break;
      case 'variations':
        if (selectedConceptCard) {
          handleGenerateImage(selectedConceptCard);
        }
        break;
      case 'save-all':
        if (selectedConceptCard?.generatedImages) {
          selectedConceptCard.generatedImages.forEach(imageUrl => {
            handleSaveToGallery(imageUrl, selectedConceptCard.title);
          });
        }
        break;
      case 'create-video':
        if (selectedConceptCard) {
          // Seamless handoff to Story Studio
          setHandoffData({
            conceptCard: selectedConceptCard,
            fromPhoto: true
          });
          setActiveTab('story');
          toast({ 
            title: "Switching to Story Studio", 
            description: "Your concept is ready for video creation!" 
          });
        }
        break;
      case 'new-session':
        handleNewSession();
        break;
      case 'view-gallery':
        setLocation('/sselfie-gallery');
        break;
    }
  };

  // REMOVED: Old useConceptCards hook - concept cards now come from centralized BrandStudioProvider

  // Calculate stats using centralized concept cards from BrandStudioProvider
  const conceptCardsList = Object.values(conceptCardsById);
  const stats = {
    conceptCards: conceptCardsList.length,
    images: conceptCardsList.reduce((acc, card) => acc + (card.generatedImages?.length || 0), 0)
  };

  // Check if mobile (use prop if provided, otherwise detect)
  const [detectedMobile, setDetectedMobile] = useState(window.innerWidth < 768);
  const isMobileState = isMobile !== undefined ? isMobile : detectedMobile;
  
  useEffect(() => {
    const handleResize = () => setDetectedMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Panel-specific rendering for three-panel layout
  if (panelMode) {
    if (panelMode === 'director') {
      return (
        <div className="h-full flex flex-col">
          <div className="panel-header" style={{ 
            background: '#000000',
            color: 'white',
            padding: '20px',
            position: 'relative',
            zIndex: 10
          }}>
            <h3 className="text-lg font-light tracking-[0.3em] uppercase">The Director</h3>
            <p className="text-xs opacity-75 mt-1">Strategic Conversation</p>
          </div>
          <div className="flex-1">
            <DirectorPanel
              mode="photo"
              messages={messages}
              isTyping={isTyping}
              message={message}
              setMessage={setMessage}
              onSendMessage={handleSendMessage}
              onKeyPress={handleKeyPress}
              disabled={!isOnline}
              placeholder="What is the goal for this creative session?"
              className="border-none rounded-none h-full"
              messagesEndRef={messagesEndRef}
              chatContainerRef={chatContainerRef}
              shouldAutoScroll={shouldAutoScroll}
              onScroll={handleScroll}
            />
          </div>
        </div>
      );
    }
    
    if (panelMode === 'canvas') {
      return (
        <div className="h-full flex flex-col">
          <div className="panel-header" style={{ 
            background: 'rgba(255, 255, 255, 0.95)',
            padding: '20px',
            borderBottom: '1px solid #e0e0e0'
          }}>
            <h3 className="text-lg font-light tracking-[0.3em] uppercase">The Canvas</h3>
            <p className="text-xs text-gray-500 mt-1">Editorial Lookbook</p>
          </div>
          <div className="flex-1 overflow-y-auto">
            {conceptCardsList.length > 0 ? (
              <div className="p-6 space-y-6">
                {conceptCardsList.map((card) => (
                  <LuxuryConceptCard
                    key={card.id}
                    concept={card}
                    isSelected={selectedConceptCard?.id === card.id}
                    onClick={() => {
                      selectConceptCard(card.id);
                      setSelectedItem(card);
                    }}
                    onGenerate={() => handleGenerateImage(card)}
                    onSaveToGallery={handleSaveToGallery}
                    onCreateVideo={() => handleToolkitAction('create-video')}
                  />
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-center p-8">
                <div>
                  <div className="text-6xl mb-4">*</div>
                  <h4 className="text-xl font-light tracking-[0.2em] uppercase mb-4">Your Creative Canvas</h4>
                  <p className="text-gray-600 max-w-md">Start a conversation with Maya to generate beautiful concept cards for your professional photos</p>
                </div>
              </div>
            )}
          </div>
        </div>
      );
    }
    
    if (panelMode === 'toolkit') {
      return (
        <div className="h-full flex flex-col">
          <div className="panel-header" style={{ 
            background: '#000000',
            color: 'white',
            padding: '20px',
            position: 'relative',
            zIndex: 10
          }}>
            <h3 className="text-lg font-light tracking-[0.3em] uppercase">The Toolkit</h3>
            <p className="text-xs opacity-75 mt-1">Action & Assets</p>
          </div>
          <div className="flex-1">
            <ToolkitPanel
              mode="photo"
              selectedItem={selectedConceptCard || selectedItem}
              onItemAction={handleToolkitAction}
              className="border-none rounded-none h-full"
            >
              <QuickActions mode="photo" onAction={handleToolkitAction} />
              <StatusDisplay mode="photo" stats={stats} />
            </ToolkitPanel>
          </div>
        </div>
      );
    }
  }

  return (
    <>
      {/* Connection Status Indicator */}
      {!isOnline && (
        <div className="fixed top-20 left-0 right-0 bg-red-500 text-white text-center py-2 z-50">
          <div className="text-xs tracking-widest uppercase" style={{ fontFamily: 'Helvetica Neue', fontWeight: 300 }}>
            Offline • Check your connection
          </div>
        </div>
      )}

      <div className="h-full flex flex-col">
        {isMobileState ? (
        // Mobile Layout: Single view with overlays  
        <div className="flex-1 overflow-y-auto">
          <CanvasPanel 
            mode="photo" 
            conceptCards={Object.values(conceptCardsById)}
            selectedConceptId={selectedConceptCardId}
            onConceptSelect={selectConceptCard}
            onConceptGenerate={handleGenerateImage}
          >
          {/* Maya's Creative Studio Welcome */}
          {!hasStartedChat && messages.length === 0 && (
            <div 
              className="relative min-h-screen flex items-center justify-center p-4"
              style={{
                backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.65), rgba(0, 0, 0, 0.45)), url('https://i.postimg.cc/VLCFmXVr/1.png')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat'
              }}
            >
              <div className="text-center max-w-sm">
                <h1 className="text-2xl mb-4 text-white" style={{ 
                  fontFamily: 'Times New Roman, serif', 
                  fontWeight: 300, 
                  letterSpacing: '0.1em',
                  lineHeight: 1.2
                }}>
                  Maya's Creative Studio
                </h1>
                <p className="text-white/90 mb-8 leading-relaxed">
                  Let's bring your vision to life. Share what you're creating, and I'll craft the perfect concepts.
                </p>

                <div className="space-y-2 mb-6">
                  <h3 className="text-white/70 text-xs uppercase tracking-wider mb-4">Maya's Creative Lookbook</h3>
                  {[
                    "The Scandinavian Minimalist",
                    "The Urban Moody",
                    "The High-End Coastal",
                    "The Luxury Dark & Moody",
                    "The White Space Executive",
                    "The Black & Dark Auteur"
                  ].map((style, index) => (
                    <button
                      key={index}
                      onClick={() => setMessage(`I want ${style.toLowerCase()} photos`)}
                      className="w-full text-left p-3 bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 hover:border-white/30 transition-all duration-300 rounded"
                      data-testid={`button-style-${index}`}
                    >
                      <div className="text-white text-sm">
                        {style}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Concept Cards */}
          {conceptCardsList.length > 0 && (
            <div className="space-y-6">
              <h3 className="spaced-title text-sm">Photo Concepts</h3>
              {conceptCardsList.map((card, index) => (
                <LuxuryConceptCard
                  key={card.id}
                  concept={card}
                  isSelected={selectedConceptCard?.id === card.id}
                  onClick={() => selectConceptCard(card.id)}
                  onGenerate={() => handleGenerateImage(card)}
                  onSaveToGallery={handleSaveToGallery}
                  onCreateVideo={() => handleToolkitAction('create-video')}
                />
              ))}
            </div>
          )}

          {/* Messages for Mobile */}
          {messages.length > 0 && (
            <div className="border-t pt-6 mt-6">
              <div className="space-y-4">
                {messages.slice(-3).map((msg) => (
                  <div key={msg.id} className="space-y-2">
                    <div className="text-xs text-gray-400 tracking-wider uppercase">
                      {msg.type === 'user' ? 'You' : 'Maya'}
                    </div>
                    <div className={`p-3 rounded text-sm ${
                      msg.type === 'user' 
                        ? 'bg-black text-white' 
                        : 'bg-gray-50 text-gray-800'
                    }`}>
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                    </div>

                    {/* REMOVED: Old Maya special message types - now using Maya's unified personality system */}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Director Panel for Mobile */}
          <DirectorPanel
            mode="photo"
            messages={messages}
            isTyping={isTyping}
            message={message}
            setMessage={setMessage}
            onSendMessage={handleSendMessage}
            onKeyPress={handleKeyPress}
            disabled={!isOnline}
            messagesEndRef={messagesEndRef}
            chatContainerRef={chatContainerRef}
            shouldAutoScroll={shouldAutoScroll}
            onScroll={handleScroll}
          />

          {/* Toolkit Panel for Mobile */}
          <ToolkitPanel
            mode="photo"
            selectedItem={selectedConceptCard}
            onItemAction={handleToolkitAction}
          >
            <QuickActions mode="photo" onAction={handleToolkitAction} />
            <StatusDisplay mode="photo" stats={stats} />
          </ToolkitPanel>
            <div ref={messagesEndRef} />
          </CanvasPanel>
        </div>
      ) : (
        // Desktop Layout: Three-panel design
        <div className="flex h-full">
          {/* Left Panel: Director (Chat) - 1/3 width */}
          <div className="w-1/3 border-r">
            <DirectorPanel
            mode="photo"
            messages={messages}
            isTyping={isTyping}
            message={message}
            setMessage={setMessage}
            onSendMessage={handleSendMessage}
            onKeyPress={handleKeyPress}
            disabled={!isOnline}
            messagesEndRef={messagesEndRef}
            chatContainerRef={chatContainerRef}
            shouldAutoScroll={shouldAutoScroll}
            onScroll={handleScroll}
            />
          </div>

          {/* Center Panel: Canvas (Content) - 1/3 width */}
          <div className="w-1/3 border-r">
            <CanvasPanel 
            mode="photo" 
            conceptCards={Object.values(conceptCardsById)}
            selectedConceptId={selectedConceptCardId}
            onConceptSelect={selectConceptCard}
            onConceptGenerate={handleGenerateImage}
          >
            {/* Maya's Creative Studio Welcome - Desktop */}
            {!hasStartedChat && messages.length === 0 && (
              <div 
                className="relative h-full flex items-center justify-center p-8"
                style={{
                  backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.4)), url('https://i.postimg.cc/WpDyqFyj/10.png')`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  backgroundRepeat: 'no-repeat'
                }}
              >
                <div className="text-center max-w-2xl">
                  <h1 className="text-4xl mb-6 text-white" style={{ 
                    fontFamily: 'Times New Roman, serif', 
                    fontWeight: 300, 
                    letterSpacing: '0.1em',
                    lineHeight: 1.2
                  }}>
                    Maya's Creative Studio
                  </h1>
                  <p className="text-white/90 mb-12 leading-relaxed text-xl max-w-lg mx-auto">
                    Let's bring your vision to life. Share what you're creating, and I'll craft the perfect concepts for you.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
                    <h3 className="text-white/70 text-sm uppercase tracking-wider mb-6 col-span-full">Choose Your Creative Direction</h3>
                    {[
                      "The Scandinavian Minimalist",
                      "The Urban Moody", 
                      "The High-End Coastal",
                      "The Luxury Dark & Moody",
                      "The White Space Executive",
                      "The Black & Dark Auteur"
                    ].map((style, index) => (
                      <button
                        key={index}
                        onClick={() => setMessage(`I want ${style.toLowerCase()} photos`)}
                        className="text-left p-4 bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 hover:border-white/30 transition-all duration-300 rounded"
                        data-testid={`button-style-desktop-${index}`}
                      >
                        <div className="text-white text-sm">
                          {style}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Concept Cards */}
            {conceptCardsList.length > 0 && (
              <div className="space-y-8">
                <h3 className="spaced-title">Photo Concepts</h3>
                {conceptCardsList.map((card, index) => (
                  <LuxuryConceptCard
                    key={card.id}
                    concept={card}
                    isSelected={selectedConceptCard?.id === card.id}
                    onClick={() => selectConceptCard(card.id)}
                    onGenerate={() => handleGenerateImage(card)}
                    onSaveToGallery={handleSaveToGallery}
                    onCreateVideo={() => handleToolkitAction('create-video')}
                  />
                ))}
              </div>
            )}

            {/* REMOVED: Old Maya special message types - desktop version - now using Maya's unified personality system */}
            </CanvasPanel>
          </div>

          {/* Right Panel: Toolkit (Actions) - 1/3 width */}
          <div className="w-1/3">
            <ToolkitPanel
            mode="photo"
            selectedItem={selectedConceptCard}
            onItemAction={handleToolkitAction}
          >
            <QuickActions mode="photo" onAction={handleToolkitAction} />
            <StatusDisplay mode="photo" stats={stats} />
            </ToolkitPanel>
          </div>
        </div>
      )}
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
    </>
  );
};
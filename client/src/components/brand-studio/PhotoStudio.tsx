import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../hooks/use-auth';
// Removed old duplicate hooks - now using centralized BrandStudioProvider
import { useToast } from '../../hooks/use-toast';
import { useBrandStudio } from '../../contexts/BrandStudioContext';
import { DirectorPanel } from './DirectorPanel';
import { CanvasPanel, ConceptCard } from './CanvasPanel';
import { ToolkitPanel, QuickActions, StatusDisplay } from './ToolkitPanel';
import { MayaUploadComponent } from '../maya/MayaUploadComponent';
import { MayaExamplesGallery } from '../maya/MayaExamplesGallery';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { useConceptCards, useUpdateConceptCardGeneration, type ConceptCard as ServerConceptCard } from '../../hooks/useConceptCards';

interface ChatMessage {
  id: string;
  type: 'user' | 'maya' | 'upload' | 'examples';
  content: string;
  timestamp: string;
  conceptCards?: ConceptCard[];
  quickButtons?: string[];
  isStreaming?: boolean;
  showUpload?: boolean;
  showExamples?: boolean;
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
          
          // REMOVED: Legacy sendMessage.mutate - now using centralized sendMessage
          setTimeout(() => {
            setMessage(context.message);
            sendMessage(context.message);
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

  // REMOVED: Legacy handleGenerateImage - now handled by centralized provider
  const handleGenerateImage = async (card: ConceptCard) => {
    console.log('Image generation for:', card.title);
    // TODO: Wire to centralized generation system
  };

  // New Session Management (using centralized provider)
  const handleNewSession = () => {
    if (messages.length > 0) {
      if (confirm(`Start a new styling session? This will clear your current conversation (${messages.length} messages) but Maya will remember your style preferences.`)) {
        // Use centralized startNewSession from provider
        // startNewSession(); // TODO: Wire this properly
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
    setHasStartedChat(true);

    addMessage({
      type: 'maya',
      content: "I'm Maya, your photo creation specialist. Describe the professional photos you need and I'll create custom concepts with instant generation. What type of images are you looking to create?",
      timestamp: new Date().toISOString()
    });
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

  // HYBRID BACKEND: Get concept cards from API with server-generated ULID keys
  const { data: conceptCards = [], isLoading: isLoadingConcepts } = useConceptCards();

  // Calculate stats
  const stats = {
    conceptCards: conceptCards.length,
    images: conceptCards.reduce((acc, card) => acc + (card.generatedImages?.length || 0), 0)
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
            {conceptCards.length > 0 ? (
              <div className="p-6 space-y-6">
                {conceptCards.map((card) => (
                  <ConceptCard
                    key={card.id}
                    card={card}
                    isExpanded={expandedCards.has(card.id)}
                    onToggleExpand={() => toggleCardExpansion(card.id)}
                    onGenerate={() => handleGenerateImage(card)}
                    onSelect={() => {
                      setSelectedConceptCard(card);
                      setSelectedItem(card);
                    }}
                    onSaveToGallery={handleSaveToGallery}
                    onCreateVideo={() => handleToolkitAction('create-video')}
                    isSelected={selectedConceptCard?.id === card.id}
                    showVideoButton={true}
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
          <CanvasPanel mode="photo" onItemSelect={setSelectedConceptCard} selectedItem={selectedConceptCard}>
          {/* Welcome State */}
          {!hasStartedChat && messages.length === 0 && (
            <div className="text-center py-12">
              <h2 className="text-xl mb-6" style={{ 
                fontFamily: 'Times New Roman, serif', 
                fontWeight: 200, 
                letterSpacing: '0.2em',
                lineHeight: 1.2
              }}>
                CREATE YOUR
                <br />
                PROFESSIONAL PHOTOS
              </h2>
              <p className="text-gray-600 mb-8 leading-relaxed text-sm">
                Describe the professional photos you need and I'll create custom concepts with instant generation.
              </p>

              <div className="space-y-3">
                {[
                  "Corporate headshots with confidence",
                  "Creative lifestyle content", 
                  "Professional portraits that convert"
                ].map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => setMessage(suggestion)}
                    className="w-full text-left px-4 py-3 border border-gray-200 hover:border-black hover:bg-gray-50 transition-all duration-300 text-sm"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Concept Cards */}
          {conceptCards.length > 0 && (
            <div className="space-y-6">
              <h3 className="spaced-title text-sm">Photo Concepts</h3>
              {conceptCards.map((card, index) => (
                <ConceptCard
                  key={card.id}
                  card={card}
                  isExpanded={expandedCards.has(card.id)}
                  onToggleExpand={() => toggleCardExpansion(card.id)}
                  onGenerate={() => handleGenerateImage(card)}
                  onSelect={() => setSelectedConceptCard(card)}
                  onSaveToGallery={handleSaveToGallery}
                  onCreateVideo={() => handleToolkitAction('create-video')}
                  isSelected={selectedConceptCard?.id === card.id}
                  showVideoButton={true}
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

                    {/* Handle special message types */}
                    {msg.showUpload && (
                      <div className="border-t pt-4">
                        <MayaUploadComponent
                          onUploadComplete={(success) => {
                            if (success) console.log('Training initiated successfully');
                          }}
                          onTrainingStart={() => console.log('Training started')}
                          className="luxury-upload"
                        />
                      </div>
                    )}

                    {msg.showExamples && (
                      <div className="border-t pt-4">
                        <MayaExamplesGallery className="luxury-examples" />
                      </div>
                    )}
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
        <>
          {/* Left Panel: Director (Chat) */}
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

          {/* Center Panel: Canvas (Content) */}
          <CanvasPanel mode="photo" onItemSelect={setSelectedConceptCard} selectedItem={selectedConceptCard}>
            {/* Welcome State */}
            {!hasStartedChat && messages.length === 0 && (
              <div className="text-center py-12">
                <h2 className="text-2xl mb-8" style={{ 
                  fontFamily: 'Times New Roman, serif', 
                  fontWeight: 200, 
                  letterSpacing: '0.2em',
                  lineHeight: 1.2
                }}>
                  CREATE YOUR
                  <br />
                  PROFESSIONAL PHOTOS
                </h2>
                <p className="text-gray-600 mb-12 leading-relaxed max-w-xl mx-auto">
                  Describe the professional photos you need and I'll create custom concepts with instant generation.
                </p>

                <div className="space-y-3 max-w-md mx-auto">
                  {[
                    "Corporate headshots with confidence",
                    "Creative lifestyle content", 
                    "Professional portraits that convert"
                  ].map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => setMessage(suggestion)}
                      className="w-full text-left px-6 py-4 border border-gray-200 hover:border-black hover:bg-gray-50 transition-all duration-300"
                    >
                      <span className="text-sm text-gray-700">
                        {suggestion}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Concept Cards */}
            {conceptCards.length > 0 && (
              <div className="space-y-8">
                <h3 className="spaced-title">Photo Concepts</h3>
                {conceptCards.map((card, index) => (
                  <ConceptCard
                    key={card.id}
                    card={card}
                    isExpanded={expandedCards.has(card.id)}
                    onToggleExpand={() => toggleCardExpansion(card.id)}
                    onGenerate={() => handleGenerateImage(card)}
                    onSelect={() => setSelectedConceptCard(card)}
                    onSaveToGallery={handleSaveToGallery}
                    onCreateVideo={() => handleToolkitAction('create-video')}
                    isSelected={selectedConceptCard?.id === card.id}
                    showVideoButton={true}
                  />
                ))}
              </div>
            )}

            {/* Handle special message types */}
            {messages.map((msg) => (
              <div key={`special-${msg.id}`}>
                {msg.showUpload && (
                  <div className="mb-8 p-8 border border-gray-100">
                    <MayaUploadComponent
                      onUploadComplete={(success) => {
                        if (success) console.log('Training initiated successfully');
                      }}
                      onTrainingStart={() => console.log('Training started')}
                      className="luxury-upload"
                    />
                  </div>
                )}

                {msg.showExamples && (
                  <div className="mb-8 p-8 border border-gray-100">
                    <MayaExamplesGallery className="luxury-examples" />
                  </div>
                )}
              </div>
            ))}
          </CanvasPanel>

          {/* Right Panel: Toolkit (Actions) */}
          <ToolkitPanel
            mode="photo"
            selectedItem={selectedConceptCard}
            onItemAction={handleToolkitAction}
          >
            <QuickActions mode="photo" onAction={handleToolkitAction} />
            <StatusDisplay mode="photo" stats={stats} />
          </ToolkitPanel>
        </>
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
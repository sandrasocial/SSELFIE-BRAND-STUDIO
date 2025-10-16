import React, { useState, useRef, useEffect } from 'react';
import { useBrandStudio, BrandStudioProvider } from '../contexts/BrandStudioContext.js';
import { Send, Camera } from 'lucide-react';
import { useAuth } from '../hooks/use-auth.js';
import type { ConceptCard } from '../../../shared/types/concept-card.js';
import ErrorBoundary, { ConceptCardErrorBoundary } from '../components/ErrorBoundary.js';

interface MayaChatContentProps {
  initialPrompt?: string | null;
  onPromptUsed?: () => void;
}

// @ts-ignore - FC type compatibility with JSX.Element
const MayaChatContent: React.FC<MayaChatContentProps> = ({ initialPrompt, onPromptUsed }) => {
  const [messageInput, setMessageInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Use BrandStudioProvider for full brand studio integration
  const {
    messages,
    conceptCardsById,
    selectedConceptCardId,
    isTyping,
    sendMessage,
    selectConceptCard,
    generateImage,
    isLoading,
    isGenerating,
    isPolling,
    getPollingStatus
  } = useBrandStudio();

  // Debug logging for concept cards
  console.log('Brand Studio Data:', { messages, conceptCardsById });

  const [showWelcome] = useState(true);
  const welcomeMessage = {
    id: 'welcome-maya',
    type: 'maya' as const,
    content: "I help people get amazing photos that actually look like them.\n\nI create 5 different shots every time - some close-ups, some full body, and some lifestyle scenes that work together like a perfect feed. What kind of photos are you dreaming of?",
    timestamp: new Date().toISOString(),
    conceptCards: [],
    generatedImages: []
  };

  // Combine welcome message with actual messages
  const allMessages = showWelcome && messages.length === 0 ? [welcomeMessage, ...messages] : messages;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [allMessages, isTyping]);

  // Handle initial prompt from style selection
  useEffect(() => {
    if (initialPrompt && !isTyping && messages.length === 0) {
      // Send the initial prompt automatically
      sendMessage(initialPrompt);
      // Mark the prompt as used
      onPromptUsed?.();
    }
  }, [initialPrompt, sendMessage, onPromptUsed, isTyping, messages.length]);

  const handleSendMessage = async () => {
    if (!messageInput.trim() || isTyping) return;

    const messageText = messageInput.trim();
    setMessageInput('');

    // Use BrandStudioProvider's sendMessage (handles full workflow)
    sendMessage(messageText);
  };

  // @ts-ignore - KeyboardEvent is available at runtime
  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // 💖 Heart Image Handler - Save to Gallery
  const handleHeartImage = async (imageUrl: string, imageIndex: number) => {
    try {
      console.log(`💖 MAYA UI: Hearting image ${imageIndex + 1}`, imageUrl);
      
      const response = await fetch('/api/maya/heart-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          imageUrl,
          category: 'maya_generated'
        })
      });

      if (response.ok) {
        // Show success feedback
        const button = document.querySelector(`[data-image-index="${imageIndex}"]`);
        if (button) {
          button.innerHTML = '♥️';
          setTimeout(() => {
            button.innerHTML = '♡';
          }, 2000);
        }
        
        // Optional: Show toast notification
        console.log('✅ MAYA UI: Image saved to gallery successfully');
      } else {
        console.error('❌ MAYA UI: Failed to save image to gallery');
      }
    } catch (error) {
      console.error('❌ MAYA UI: Heart image error:', error);
    }
  };

  // 🔍 View Full Size Handler
  const handleViewFullSize = (imageUrl: string, imageIndex: number) => {
    console.log(`🔍 MAYA UI: Viewing full size image ${imageIndex + 1}`, imageUrl);
    
    // Open image in new tab for full size viewing
    window.open(imageUrl, '_blank');
  };

  return (
    <ErrorBoundary>
      <div className="h-full flex flex-col space-y-4 pb-2">
      {/* Maya Header */}
      <div className="flex items-center justify-between pt-4 pb-2">
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full border-2 border-stone-200/60 overflow-hidden flex-shrink-0">
            <img 
              src="https://i.postimg.cc/fTtCnzZv/out-1-22.png" 
              alt="Maya" 
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-xl sm:text-2xl font-serif font-extralight tracking-[0.25em] text-stone-950 uppercase">Maya</h3>
            <p className="text-xs tracking-[0.15em] uppercase font-light text-stone-500">Your Photo Stylist</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 ml-4 flex-shrink-0">
          <div className="w-2 h-2 bg-stone-900 rounded-full"></div>
          <span className="text-xs font-light text-stone-600">Online</span>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1" style={{ maxHeight: 'calc(100vh - 320px)' }}>
        {allMessages.map((message: any, index: number) => (
          <div
            key={message.id || index}
            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-[90%] ${message.type === 'user' ? 'order-2' : 'order-1'}`}>
              <div className={`p-4 sm:p-5 rounded-2xl sm:rounded-3xl border ${
                message.type === 'user' 
                  ? 'bg-stone-200/40 border-stone-300/40' 
                  : 'bg-stone-100/40 border-stone-200/40'
              }`}>
                <div className="space-y-3">
                  <p className="text-sm sm:text-base text-stone-950 leading-relaxed font-light whitespace-pre-wrap">{message.content}</p>
                  <div className="text-xs font-light text-stone-500 opacity-60">
                    {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
              
              {/* Concept Cards */}
              {(() => {
                console.log(`🎨 MAYA UI: Message ${message.id} has ${message.conceptCards?.length || 0} concept cards`);
                return null;
              })()}
              {message.type === 'maya' && message.conceptCards && message.conceptCards.length > 0 && (
                <div className="mt-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-1 h-1 rounded-full bg-stone-600"></div>
                    <span className="text-xs tracking-[0.15em] uppercase font-light text-stone-600">Photo Ideas</span>
                  </div>
                  {message.conceptCards.map((card: any, cardIndex: number) => {
                    // Enhanced validation for concept cards
                    if (!card || typeof card !== 'object') {
                      console.error(`❌ MAYA UI: Card ${cardIndex} is invalid:`, card);
                      return (
                        <div key={`error-${cardIndex}`} className="bg-red-50 border border-red-200 rounded-2xl p-5">
                          <div className="flex items-center gap-3">
                            <span className="text-red-500">⚠️</span>
                            <div>
                              <h4 className="text-sm font-medium text-red-800">Concept Card Error</h4>
                              <p className="text-xs text-red-600 mt-1">This concept card couldn't be displayed properly.</p>
                            </div>
                          </div>
                        </div>
                      );
                    }

                    if (!card.id || !card.title || !card.description) {
                      console.error(`❌ MAYA UI: Card ${cardIndex} missing required fields:`, { 
                        hasId: !!card.id, 
                        hasTitle: !!card.title, 
                        hasDescription: !!card.description,
                        card 
                      });
                      return (
                        <div key={card.id || `incomplete-${cardIndex}`} className="bg-yellow-50 border border-yellow-200 rounded-2xl p-5">
                          <div className="flex items-center gap-3">
                            <span className="text-yellow-600">⚠️</span>
                            <div>
                              <h4 className="text-sm font-medium text-yellow-800">Incomplete Concept Card</h4>
                              <p className="text-xs text-yellow-600 mt-1">
                                {card.title || 'Untitled concept'} - Missing required information.
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    }

                    const isCardGenerating = isGenerating && selectedConceptCardId === card.id;
                    const isCardPolling = isPolling(card.id);
                    const pollingStatus = getPollingStatus(card.id);
                    
                    return (
                      <ConceptCardErrorBoundary 
                        key={card.id}
                        cardIndex={cardIndex}
                        cardTitle={card.title}
                      >
                        <div
                        key={card.id || cardIndex}
                        onClick={() => {
                          try {
                            if (!isGenerating && !isCardPolling && card.id) {
                              console.log('🎯 MAYA UI: Generating image for concept:', card.title);
                              selectConceptCard(card.id);
                              generateImage(card.id);
                            }
                          } catch (error) {
                            console.error('❌ MAYA UI: Error in concept card click:', error);
                          }
                        }}
        className={`bg-stone-100/40 border border-stone-200/50 rounded-2xl p-5 transition-all duration-200 ${
          (isGenerating || isCardPolling)
            ? 'cursor-not-allowed opacity-60' 
            : 'hover:bg-stone-100/60 hover:border-stone-300/60 cursor-pointer'
        } ${
          selectedConceptCardId === card.id ? 'ring-2 ring-stone-600/40 bg-stone-100/60' : ''
        } ${
          isCardPolling ? 'ring-2 ring-blue-400/60 bg-blue-50/30' : ''
        }`}
                      >
                        <div className="space-y-5">
                          <div className="flex items-center justify-between">
                            <div className="px-3 py-1.5 bg-stone-500/10 rounded-full border border-stone-400/20">
                              <span className="text-xs tracking-[0.1em] uppercase font-light text-stone-600">
                                {String(card.creativeLook || card.category || 'Concept')}
                              </span>
                            </div>
                            {card.emoji && <span className="text-2xl">{String(card.emoji)}</span>}
                          </div>
                          
                          <div className="space-y-3">
                            <h4 className="text-base font-serif font-extralight tracking-[0.1em] text-stone-950 uppercase leading-tight">
                              {String(card.title)}
                            </h4>
                            <p className="text-sm font-light leading-relaxed text-stone-600">
                              {String(card.description)}
                            </p>
                            
                            {/* Generation Status */}
                            {(selectedConceptCardId === card.id || isCardPolling) && (
                              <div className="mt-3 pt-3 border-t border-stone-300/30">
                                {isCardGenerating ? (
                                  <div className="bg-blue-50/60 border border-blue-200/40 rounded-lg p-3">
                                    <div className="flex items-center gap-3">
                                      <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                                      <div className="flex-1">
                                        <p className="text-xs font-medium text-blue-800">Starting generation...</p>
                                        <p className="text-xs text-blue-600 mt-0.5">Connecting to your AI model</p>
                                      </div>
                                    </div>
                                  </div>
                                ) : isCardPolling ? (
                                  <div className="bg-blue-50/60 border border-blue-200/40 rounded-lg p-3">
                                    <div className="flex items-center gap-3">
                                      <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                                      <div className="flex-1">
                                        <p className="text-xs font-medium text-blue-800">Creating your images...</p>
                                        <p className="text-xs text-blue-600 mt-0.5">
                                          {pollingStatus ? `Poll ${pollingStatus.pollCount}/40 • ${Math.floor((pollingStatus.duration || 0) / 1000)}s` : 'Processing...'}
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="bg-green-50/60 border border-green-200/40 rounded-lg p-3">
                                    <div className="flex items-center gap-3">
                                      <span className="text-green-600">✓</span>
                                      <p className="text-xs font-medium text-green-800">Selected for generation</p>
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                            
                            {/* Generate Button */}
                            {!isCardGenerating && selectedConceptCardId !== card.id && (
                              <div className="mt-3 pt-3 border-t border-stone-300/30">
                                <div className="flex items-center justify-between">
                                  <p className="text-xs font-light text-stone-500">Click to generate images</p>
                                  <span className="text-xs text-stone-400">📸</span>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      </ConceptCardErrorBoundary>
                    );
                  })}
                </div>
              )}

              {/* Generated Images */}
              {message.type === 'maya' && message.generatedImages && message.generatedImages.length > 0 && (
                <div className="mt-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-1 h-1 rounded-full bg-stone-600"></div>
                      <span className="text-xs tracking-[0.15em] uppercase font-light text-stone-600">Your Images Are Ready!</span>
                    </div>
                    <div className="text-xs font-light text-stone-500">
                      Click ♡ to save to gallery
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {message.generatedImages.map((image: string, imageIndex: number) => (
                      <div key={imageIndex} className="relative group">
                        <div className="aspect-[3/4] rounded-2xl overflow-hidden bg-stone-100/40 border border-stone-200/50">
                          <img 
                            src={image} 
                            alt={`Generated photo ${imageIndex + 1}`}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-200 rounded-2xl">
                          {/* Heart Button for Save to Gallery */}
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleHeartImage(image, imageIndex);
                            }}
                            data-image-index={imageIndex}
                            className="absolute top-3 right-3 w-10 h-10 bg-white/90 hover:bg-white text-stone-800 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 shadow-lg"
                            title="Save to Gallery"
                          >
                            <span className="text-lg">♡</span>
                          </button>
                          
                          {/* View Full Size Button */}
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewFullSize(image, imageIndex);
                            }}
                            className="absolute bottom-3 left-1/2 transform -translate-x-1/2 bg-white/90 hover:bg-white text-stone-800 px-4 py-2 rounded-full text-xs font-medium transition-all duration-200 hover:scale-105 shadow-lg"
                          >
                            View Full Size
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Professional Quality Notice */}
                  <div className="bg-stone-50/60 border border-stone-200/50 rounded-xl p-4 mt-4">
                    <div className="flex items-center gap-3">
                      <span className="text-stone-600">📸</span>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-stone-800">Professional-Quality Images</p>
                        <p className="text-xs text-stone-600 mt-1">
                          Generated with your personal AI model • 3:4 aspect ratio • PNG format • LoRA scale 1.05
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Typing Indicator */}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-gradient-to-r from-stone-100/60 to-stone-50/80 border border-stone-200/40 p-5 rounded-2xl max-w-[90%] shadow-sm">
              <div className="flex items-center gap-4">
                <div className="flex gap-1">
                  <div className="w-2.5 h-2.5 rounded-full animate-bounce bg-stone-600"></div>
                  <div className="w-2.5 h-2.5 rounded-full animate-bounce bg-stone-600" style={{animationDelay: '0.2s'}}></div>
                  <div className="w-2.5 h-2.5 rounded-full animate-bounce bg-stone-600" style={{animationDelay: '0.4s'}}></div>
                </div>
                <div className="flex-1">
                  <span className="text-sm font-medium text-stone-800">Maya is creating your photos...</span>
                  <div className="text-xs text-stone-600 mt-1">
                    Using your personal AI model • This takes 30-60 seconds
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Generation Loading State */}
        {isGenerating && !isTyping && (
          <div className="flex justify-start">
            <div className="bg-gradient-to-r from-blue-50/80 to-indigo-50/60 border border-blue-200/40 p-5 rounded-2xl max-w-[90%] shadow-sm">
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                <div className="flex-1">
                  <span className="text-sm font-medium text-blue-800">Images generating...</span>
                  <div className="text-xs text-blue-600 mt-1">
                    🎨 Applying your personal LoRA model • 📐 3:4 aspect ratio • 🎯 LoRA scale 1.05
                  </div>
                  <div className="text-xs text-blue-500 mt-2 font-light italic">
                    Your images will appear here automatically when ready
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Error handling through BrandStudioProvider now */}

      {/* Chat Input */}
      <div className="border-t border-stone-200/30 pt-4 mt-auto flex-shrink-0">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <textarea
              data-test-id="chat-input"
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Describe your vision to Maya..."
              className="w-full resize-none px-4 py-4 bg-stone-100/40 border border-stone-200/60 rounded-2xl text-stone-950 placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-stone-600/40 focus:border-stone-600/60 pr-12 font-light text-sm min-h-[52px]"
              rows={3}
              disabled={isTyping}
            />
            <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
              <Camera size={16} className="text-stone-500" strokeWidth={1.5} />
            </div>
          </div>
          <button 
            data-testid="maya-chat-send"
            onClick={handleSendMessage}
            disabled={!messageInput.trim() || isTyping}
            className="group relative px-4 py-4 bg-stone-950 text-stone-50 rounded-2xl font-light transition-all duration-200 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden shadow-sm min-h-[52px] min-w-[52px] flex items-center justify-center"
          >
            <div className="absolute inset-0 bg-stone-800 transform scale-0 group-hover:scale-100 transition-transform duration-300 origin-center"></div>
            <Send size={16} strokeWidth={1.5} className="relative z-10 group-hover:text-stone-50 transition-colors duration-300" />
          </button>
        </div>
      </div>
    </div>
    </ErrorBoundary>
  );
};

// Wrapper component with BrandStudioProvider
interface MayaScreenProps {
  initialPrompt?: string | null;
  onPromptUsed?: () => void;
}

// @ts-ignore - FC type compatibility with JSX.Element
const MayaScreen: React.FC<MayaScreenProps> = ({ initialPrompt, onPromptUsed }) => {
  const { user, isAuthenticated, isLoading } = useAuth();

  // Check if user has Maya AI access
  if (!isLoading && isAuthenticated && user && !user.mayaAiAccess) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center p-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-stone-100 flex items-center justify-center">
            <Camera size={32} className="text-stone-400" />
          </div>
          <h3 className="text-lg font-serif font-light text-stone-950 mb-2">Maya AI Access Required</h3>
          <p className="text-sm text-stone-600">
            Maya AI features are not available for this account. Please upgrade your plan to access AI-powered photo generation.
          </p>
        </div>
      </div>
    );
  }

  return (
    <BrandStudioProvider>
      <MayaChatContent initialPrompt={initialPrompt} onPromptUsed={onPromptUsed} />
    </BrandStudioProvider>
  );
};

export default MayaScreen;

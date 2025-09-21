import React, { useState, useEffect, useRef } from 'react';
import { useMayaChat } from '../hooks/useMayaChat';
import { StyleSelector } from './StyleSelector';
import { BrandStyleCollection } from '../data/brand-style-collections';
import GeneratedImagePreview from './GeneratedImagePreview';
import { MessageCircle, Send, Sparkles, Camera, MoreHorizontal } from 'lucide-react';


// Utility function to strip emojis from frontend display while preserving for backend
const stripEmojisForDisplay = (text: string): string => {
  // Remove emojis but keep the text content
  return text.replace(/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu, '').trim();
};

/**
 * LuxuryConceptCard Component
 * Renders a single concept card, handles image generation, polling, and uses GeneratedImagePreview.
 */
interface ConceptCard {
  title: string;
  description: string;
  category?: string;
  fluxPrompt?: string;
  generatedImages?: string[];
}

export function LuxuryConceptCard({ concept }: { concept: ConceptCard }) {
  const [isLoading, setIsLoading] = useState(false);
  const [imageUrls, setImageUrls] = useState<string[]>(concept.generatedImages || []);
  const [error, setError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleGenerate = async () => {
    setIsLoading(true);
    setError(null);
    setImageUrls([]);

    try {
      // Step 1: Start the generation and get a prediction ID
      const startResponse = await fetch('/api/maya/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: concept.fluxPrompt || concept.title || concept.description,
          conceptData: concept,
          count: 2 // Generate 2 images
        }),
        credentials: 'include',
      });

      if (!startResponse.ok) {
        const errorData = await startResponse.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || errorData.message || 'Failed to start image generation.');
      }

      const startResult = await startResponse.json();

      if (!startResult.predictionId) {
        throw new Error('No prediction ID received from server');
      }

      const { predictionId } = startResult;

      // Step 2: Poll for the result with enhanced error handling
      const pollInterval = setInterval(async () => {
        try {
          const checkResponse = await fetch(`/api/maya/check-generation/${predictionId}`, {
            credentials: 'include'
          });
          
          if (!checkResponse.ok) {
            throw new Error(`Server error while checking status: ${checkResponse.status}`);
          }
          
          const result = await checkResponse.json();

          if (result.status === 'succeeded' && result.imageUrls && result.imageUrls.length > 0) {
            clearInterval(pollInterval);
            setIsLoading(false);
            setImageUrls(result.imageUrls);
            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 3000);
          } else if (result.status === 'failed') {
            clearInterval(pollInterval);
            setIsLoading(false);
            setError(result.error || 'Image generation failed. Please try again.');
          }
          // If status is 'processing', the interval continues
        } catch (pollError) {
          clearInterval(pollInterval);
          setIsLoading(false);
          setError(`Polling error: ${(pollError as Error).message}`);
        }
      }, 4000); // Poll every 4 seconds
      
      // Add timeout to prevent infinite polling
      setTimeout(() => {
        clearInterval(pollInterval);
        if (isLoading) {
          setIsLoading(false);
          setError('Generation timed out. Please try again.');
        }
      }, 300000); // 5 minute timeout
    } catch (err) {
      setIsLoading(false);
      setError((err as Error).message);
    }
  };

  const handleSaveImages = async () => {
    try {
      // The GeneratedImagePreview component handles individual saves
      // This could be used for batch operations if needed
    } catch {
      // Handle error silently or show user feedback
    }
  };

  return (
    <div className="editorial-card mb-6 group">
      {/* Concept Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <span className="editorial-badge">{concept.category || 'Concept'}</span>
            <Sparkles size={16} className="text-neutral-400" strokeWidth={1.5} />
          </div>
          <h4 className="editorial-heading-2 text-neutral-200 mb-2">{stripEmojisForDisplay(concept.title)}</h4>
          <p className="editorial-text-body text-neutral-400 leading-relaxed">{concept.description}</p>
        </div>
      </div>
      
      {/* Action Button */}
      {!isLoading && imageUrls.length === 0 && (
        <button 
          onClick={handleGenerate}
          className="editorial-button w-full mb-6 group-hover:scale-[1.02] transition-all duration-300 min-h-[48px] py-4"
        >
          <Camera className="mr-2" size={18} strokeWidth={1.5} />
          GENERATE PHOTOS
        </button>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-900/20 border border-red-800/30 rounded-lg p-4 mb-4">
          <div className="flex items-start gap-3">
            <div className="w-5 h-5 bg-red-500/20 rounded-full flex items-center justify-center mt-0.5">
              <span className="text-red-400 text-xs">!</span>
            </div>
            <div className="flex-1">
              <h4 className="text-red-300 text-sm font-medium mb-1">Generation Failed</h4>
              <p className="text-red-300 text-sm">{error}</p>
              <button 
                onClick={() => setError(null)}
                className="text-red-400 text-xs mt-2 hover:text-red-300 transition-colors"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="flex flex-col items-center justify-center py-8 mb-6">
          <div className="editorial-spinner mr-3 mb-3"></div>
          <span className="text-neutral-400 text-sm tracking-wide mb-2">GENERATING YOUR VISION</span>
          <div className="w-full bg-neutral-800/30 rounded-full h-1">
            <div className="bg-gradient-to-r from-neutral-300 to-neutral-500 h-1 rounded-full animate-pulse"></div>
          </div>
        </div>
      )}

      {/* Success State */}
      {showSuccess && (
        <div className="bg-green-900/20 border border-green-800/30 rounded-lg p-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 bg-green-500/20 rounded-full flex items-center justify-center">
              <span className="text-green-400 text-xs">✓</span>
            </div>
            <div>
              <h4 className="text-green-300 text-sm font-medium">Images Generated Successfully!</h4>
              <p className="text-green-300 text-xs">Your photos are ready to view and save.</p>
            </div>
          </div>
        </div>
      )}

      {/* Generated Images */}
      <GeneratedImagePreview
        imageUrls={imageUrls}
        isLoading={isLoading}
        concept={concept}
        onSave={() => handleSaveImages()}
      />
    </div>
  );
}

/**
 * LuxuryChatInterface Component
 * The main chat window that manages the conversation flow with Maya.
 */
export function LuxuryChatInterface() {
  const { messages, sendMessage, isTyping } = useMayaChat();
  const [inputValue, setInputValue] = useState('');
  const [selectedStyle, setSelectedStyle] = useState<BrandStyleCollection | null>(null);
  const [showStyleSelector, setShowStyleSelector] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const messagesEndRef = useRef<any>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleStyleSelect = async (style: BrandStyleCollection) => {
    setSelectedStyle(style);
    setShowStyleSelector(false);
    
    // Get user gender for context (optional)
    let genderContext = '';
    try {
      const response = await fetch('/api/me', {
        credentials: 'include'
      });
      if (response.ok) {
        const userData = await response.json();
        const userGender = userData.user?.gender;
        if (userGender) {
          if (userGender.toLowerCase().includes('female') || userGender === 'woman') {
            genderContext = 'As a woman, ';
          } else if (userGender.toLowerCase().includes('male') || userGender === 'man') {
            genderContext = 'As a man, ';
          } else if (userGender.toLowerCase().includes('non-binary') || userGender === 'non-binary') {
            genderContext = 'As a non-binary person, ';
          }
        }
      }
    } catch {
      // Could not fetch gender context (non-blocking)
    }
    
    // Enhanced message that includes styleKey for prompt-builder integration
    const styleMessage = `${genderContext}I've chosen the "${style.name}" style (styleKey: ${style.id}). ${style.description}

Please create photo concepts that match this signature look, drawing from your ${style.name} expertise with ${style.aesthetic.toLowerCase()}.`;
    sendMessage(styleMessage);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() && !isTyping) {
      sendMessage(inputValue.trim());
      setInputValue('');
    }
  };

  return (
    <div className="h-full flex flex-col bg-neutral-950/80 backdrop-blur-2xl rounded-editorial-xl border border-neutral-800/30 overflow-hidden">
      {/* Luxury Header */}
      <div className="p-6 border-b border-neutral-800/30 bg-gradient-to-r from-neutral-900/50 to-neutral-800/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-neutral-800/40 rounded-editorial-md border border-neutral-700/30">
              <MessageCircle size={20} className="text-neutral-300" strokeWidth={1.5} />
            </div>
            <div>
              <h2 className="editorial-heading-1 text-neutral-200">MAYA STUDIO</h2>
              <p className="editorial-text-caption text-neutral-500">AI Creative Director</p>
            </div>
          </div>
          
          <button
            onClick={() => setShowStyleSelector(true)}
            className="editorial-button-secondary flex items-center gap-2 px-4 py-3 min-h-[48px]"
          >
            <Sparkles size={16} strokeWidth={1.5} />
            {selectedStyle ? selectedStyle.name : 'CHOOSE STYLE'}
          </button>
        </div>
        
        {selectedStyle && (
          <div className="mt-4 p-4 bg-neutral-800/20 rounded-editorial-md border border-neutral-700/20">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-neutral-400 rounded-full mt-2"></div>
              <div>
                <h4 className="editorial-text-header text-neutral-300 mb-1">{selectedStyle.aesthetic}</h4>
                <p className="editorial-text-body text-neutral-400 text-sm leading-relaxed">
                  {selectedStyle.description}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-6 space-y-8">
        {messages.map((msg, index) => (
          <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] ${msg.role === 'user' ? 'order-2' : 'order-1'}`}>
              {/* Message Bubble */}
              <div className={`editorial-card p-6 ${
                msg.role === 'user' 
                  ? 'bg-neutral-200 text-black ml-auto' 
                  : 'bg-neutral-800/40 text-neutral-200'
              }`}>
                <div className="space-y-3">
                  <p className="editorial-text-body leading-relaxed">{msg.content}</p>
                  
                  {/* Message timestamp */}
                  <div className={`text-xs tracking-wide ${
                    msg.role === 'user' ? 'text-neutral-600' : 'text-neutral-500'
                  }`}>
                    {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
              
              {/* Concept Cards for Maya */}
              {msg.role === 'maya' && msg.conceptCards && (
                <div className="mt-6 space-y-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-1 h-1 bg-neutral-400 rounded-full"></div>
                    <span className="text-neutral-500 text-xs tracking-wide uppercase">Concept Ideas</span>
                  </div>
                  {msg.conceptCards.map((concept: ConceptCard, conceptIndex: number) => (
                    <LuxuryConceptCard key={conceptIndex} concept={concept} />
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Style Selector Modal */}
        {showStyleSelector && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="editorial-modal max-w-2xl w-full max-h-[80vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="editorial-heading-1 text-neutral-200">CHOOSE YOUR STYLE</h3>
                  <button
                    onClick={() => setShowStyleSelector(false)}
                    className="p-2 hover:bg-neutral-800/40 rounded-editorial-md transition-colors"
                  >
                    <MoreHorizontal size={20} className="text-neutral-400" strokeWidth={1.5} />
                  </button>
                </div>
                <StyleSelector 
                  onStyleSelect={handleStyleSelect} 
                  selectedStyleId={selectedStyle?.id}
                />
              </div>
            </div>
          </div>
        )}
        
        {/* Typing Indicator */}
        {isTyping && (
          <div className="flex items-center justify-start">
            <div className="editorial-card p-4 bg-neutral-800/40">
              <div className="flex items-center gap-3">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
                <span className="text-neutral-400 text-sm tracking-wide">Maya is crafting your vision...</span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-6 border-t border-neutral-800/30 bg-gradient-to-r from-neutral-900/50 to-neutral-800/30">
        <form onSubmit={handleSendMessage} className="flex gap-3">
          <div className="flex-1 relative">
            <input 
              type="text" 
              value={inputValue} 
              onChange={(e) => setInputValue(e.target.value)} 
              placeholder="Describe your vision to Maya..." 
              className="editorial-input w-full pr-12 min-h-[48px] text-base"
              disabled={isTyping}
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck="false"
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <Camera size={18} className="text-neutral-500" strokeWidth={1.5} />
            </div>
          </div>
          <button 
            type="submit" 
            className="editorial-button px-6 py-3 min-h-[48px] disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isTyping || !inputValue.trim()}
          >
            <Send size={18} strokeWidth={1.5} />
          </button>
        </form>
      </div>
    </div>
  );
}
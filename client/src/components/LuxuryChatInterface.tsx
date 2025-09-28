import React, { useState, useEffect, useRef } from 'react';
import { useMayaChat } from '../hooks/useMayaChat.js';
import { StyleSelector } from './StyleSelector.js';
import { BrandStyleCollection } from '../data/brand-style-collections.js';
import GeneratedImagePreview from './GeneratedImagePreview.js';
import { MessageCircle, Send, Sparkles, Camera, X, MoreHorizontal } from 'lucide-react';

// Utility function to strip emojis from frontend display while preserving for backend
const stripEmojisForDisplay = (text: string): string => {
  return text.replace(/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu, '').trim();
};

/**
 * LuxuryConceptCard Component - Clean Demo Style
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
      const startResponse = await fetch('/api/maya/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: concept.fluxPrompt || concept.title || concept.description,
          conceptData: concept,
          count: 2
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
        } catch (pollError) {
          clearInterval(pollInterval);
          setIsLoading(false);
          setError(`Polling error: ${(pollError as Error).message}`);
        }
      }, 4000);
      
      setTimeout(() => {
        clearInterval(pollInterval);
        if (isLoading) {
          setIsLoading(false);
          setError('Generation timed out. Please try again.');
        }
      }, 300000);
    } catch (err) {
      setIsLoading(false);
      setError((err as Error).message);
    }
  };

  return (
    <div className="bg-gradient-to-br from-neutral-800/20 to-neutral-900/20 rounded-xl p-6 border border-neutral-700/20 transition-all duration-300 hover:border-neutral-600/30">
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="px-3 py-1 bg-neutral-700/30 rounded-full border border-neutral-600/20">
            <span className="text-xs text-neutral-300 tracking-wide uppercase">{concept.category || 'Concept'}</span>
          </div>
          <Sparkles size={14} className="text-neutral-400" strokeWidth={1.5} />
        </div>
        <div className="space-y-2">
          <h4 className="text-lg font-light text-neutral-200 tracking-wide">{stripEmojisForDisplay(concept.title)}</h4>
          <p className="text-sm text-neutral-400 leading-relaxed">{concept.description}</p>
        </div>
      </div>
      
      {!isLoading && imageUrls.length === 0 && (
        <div className="mt-6">
          <button 
            onClick={handleGenerate}
            className="w-full bg-neutral-200 text-black px-6 py-4 rounded-xl font-light tracking-wide transition-all duration-200 hover:bg-neutral-300 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
          >
            <Camera size={18} strokeWidth={1.5} />
            GENERATE PHOTOS
          </button>
        </div>
      )}

      {error && (
        <div className="mt-6 p-4 bg-red-900/10 border border-red-500/20 rounded-xl">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-red-500/20 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-red-400 text-xs font-semibold">!</span>
            </div>
            <div className="flex-1 space-y-2">
              <h4 className="text-sm font-medium text-red-300">Generation Failed</h4>
              <p className="text-xs text-red-400 leading-relaxed">{error}</p>
              <button 
                onClick={() => setError(null)}
                className="text-xs text-red-300 hover:text-red-200 transition-colors"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      {isLoading && (
        <div className="mt-6 flex flex-col items-center justify-center py-8 space-y-4">
          <div className="w-8 h-8 border-2 border-neutral-300 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm text-neutral-400 tracking-wide">GENERATING YOUR VISION</span>
          <div className="w-48 h-1 bg-neutral-800 rounded-full overflow-hidden">
            <div className="w-full h-full bg-gradient-to-r from-transparent via-neutral-300 to-transparent animate-pulse"></div>
          </div>
        </div>
      )}

      {showSuccess && (
        <div className="mt-6 p-4 bg-green-900/10 border border-green-500/20 rounded-xl">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 bg-green-500/20 rounded-full flex items-center justify-center">
              <span className="text-green-400 text-xs font-semibold">✓</span>
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-medium text-green-300">Images Generated Successfully!</h4>
              <p className="text-xs text-green-400">Your photos are ready to view and save.</p>
            </div>
          </div>
        </div>
      )}

      <GeneratedImagePreview
        imageUrls={imageUrls}
        isLoading={isLoading}
        concept={concept}
        onSave={() => {}}
      />
    </div>
  );
}

/**
 * LuxuryChatInterface Component - Production Implementation
 * 
 * A clean, luxury-styled chat interface for interacting with Maya AI.
 * Features:
 * - Real-time chat with Maya AI Creative Director
 * - Style selection with gender-aware context
 * - Image generation capabilities
 * - Responsive design for mobile and desktop
 * - Error handling and loading states
 * - Accessibility features
 * 
 * Dependencies:
 * - useMayaChat: Chat functionality and state management
 * - StyleSelector: Brand style selection component
 * - GeneratedImagePreview: Image display and management
 * - BrandStyleCollection: Type definitions for styling
 */
export function LuxuryChatInterface() {
  const { messages, sendMessage, isTyping } = useMayaChat();
  const [inputValue, setInputValue] = useState('');
  const [selectedStyle, setSelectedStyle] = useState<BrandStyleCollection | null>(null);
  const [showStyleSelector, setShowStyleSelector] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleStyleSelect = async (style: BrandStyleCollection) => {
    try {
      setSelectedStyle(style);
      setShowStyleSelector(false);
      
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
      } catch (error) {
        console.warn('Could not fetch user gender context:', error);
        // Non-blocking error - continue without gender context
      }
      
      const styleMessage = `${genderContext}I've chosen the "${style.name}" style (styleKey: ${style.id}). ${style.description}

Please create photo concepts that match this signature look, drawing from your ${style.name} expertise with ${style.aesthetic.toLowerCase()}.`;
      
      await sendMessage(styleMessage);
    } catch (error) {
      console.error('Error selecting style:', error);
      // Could add toast notification here if needed
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() && !isTyping) {
      try {
        await sendMessage(inputValue.trim());
        setInputValue('');
      } catch (error) {
        console.error('Error sending message:', error);
        // Message will remain in input for retry
      }
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="p-2 bg-neutral-800/40 rounded-lg border border-neutral-700/30">
            <MessageCircle size={18} className="text-neutral-300" strokeWidth={1.5} />
          </div>
          <div>
            <h3 className="text-lg font-light text-neutral-200 tracking-wide">Maya Studio</h3>
            <p className="text-xs text-neutral-500 tracking-wide">AI Creative Director</p>
          </div>
        </div>
        
        <button
          onClick={() => setShowStyleSelector(true)}
          className="px-4 py-2 bg-neutral-800/40 text-neutral-200 border border-neutral-700/30 rounded-lg text-sm font-light tracking-wide transition-all duration-200 hover:bg-neutral-800/60"
        >
          <Sparkles size={14} strokeWidth={1.5} className="inline mr-2" />
          {selectedStyle ? selectedStyle.name : 'Choose Style'}
        </button>
      </div>

      {selectedStyle && (
        <div className="mb-4 p-4 bg-neutral-800/20 rounded-lg border border-neutral-700/20">
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 bg-neutral-400 rounded-full mt-2"></div>
            <div>
              <h4 className="text-sm font-medium text-neutral-300 mb-1">{selectedStyle.aesthetic}</h4>
              <p className="text-xs text-neutral-400 leading-relaxed">
                {selectedStyle.description}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto space-y-4 mb-6 pr-2">
        {messages.length === 0 && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center space-y-3">
              <div className="w-12 h-12 bg-neutral-800/40 rounded-full flex items-center justify-center mx-auto">
                <MessageCircle size={24} className="text-neutral-400" strokeWidth={1.5} />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-medium text-neutral-300">Welcome to Maya Studio</h4>
                <p className="text-xs text-neutral-500 max-w-md">
                  Start by choosing a style or describing your vision. Maya will create personalized photo concepts for you.
                </p>
              </div>
            </div>
          </div>
        )}

        {messages.map((msg, index) => (
          <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] ${msg.role === 'user' ? 'order-2' : 'order-1'}`}>
              <div className={`p-4 rounded-lg ${
                msg.role === 'user' 
                  ? 'bg-neutral-700/30 border border-neutral-600/30' 
                  : 'bg-neutral-800/30 border border-neutral-700/30'
              }`}>
                <div className="space-y-2">
                  <p className="text-sm text-neutral-200 leading-relaxed">{msg.content}</p>
                  
                  <div className="text-xs text-neutral-500">
                    {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
              
              {msg.role === 'maya' && msg.conceptCards && (
                <div className="mt-4 space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="w-1 h-1 bg-neutral-400 rounded-full"></div>
                    <span className="text-neutral-500 text-xs tracking-wide">Concept Ideas</span>
                  </div>
                  {msg.conceptCards.map((concept: ConceptCard, conceptIndex: number) => (
                    <LuxuryConceptCard key={conceptIndex} concept={concept} />
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {showStyleSelector && (
          <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-neutral-950/95 backdrop-blur-2xl rounded-2xl border border-neutral-800/30 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-light text-neutral-200 tracking-wide">Choose Your Style</h3>
                  <button
                    onClick={() => setShowStyleSelector(false)}
                    className="p-2 hover:bg-neutral-800/40 rounded-lg transition-colors"
                  >
                    <X size={20} className="text-neutral-400" strokeWidth={1.5} />
                  </button>
                </div>
                <StyleSelector 
                  onStyleSelect={handleStyleSelect} 
                  {...(selectedStyle?.id && { selectedStyleId: selectedStyle.id })}
                />
              </div>
            </div>
          </div>
        )}
        
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-neutral-800/30 border border-neutral-700/30 p-4 rounded-lg max-w-[85%]">
              <div className="flex items-center gap-3">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-neutral-400 rounded-full animate-pulse"></div>
                  <div className="w-2 h-2 bg-neutral-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 bg-neutral-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                </div>
                <span className="text-sm text-neutral-400">Maya is crafting your vision...</span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="border-t border-neutral-800/30 pt-4">
        <form onSubmit={handleSendMessage} className="flex gap-3">
          <div className="flex-1 relative">
            <input 
              type="text" 
              value={inputValue} 
              onChange={(e) => setInputValue(e.target.value)} 
              placeholder={isTyping ? "Maya is typing..." : "Describe your vision to Maya..."} 
              className="w-full px-4 py-3 bg-neutral-800/30 border border-neutral-700/30 rounded-lg text-neutral-200 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-neutral-600/50 pr-12 disabled:opacity-50"
              disabled={isTyping}
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck="false"
              aria-label="Message to Maya"
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <Camera size={16} className="text-neutral-500" strokeWidth={1.5} />
            </div>
          </div>
          <button 
            type="submit" 
            className="px-4 py-3 bg-neutral-200 text-black rounded-lg font-light transition-all duration-200 hover:bg-neutral-300 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isTyping || !inputValue.trim()}
            aria-label="Send message"
          >
            <Send size={16} strokeWidth={1.5} />
          </button>
        </form>
      </div>
    </div>
  );
}
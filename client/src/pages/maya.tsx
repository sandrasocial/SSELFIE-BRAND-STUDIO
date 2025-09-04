import React, { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../hooks/use-auth';
import { useMayaGeneration } from '../hooks/useMayaGeneration';
import { useToast } from '../hooks/use-toast';
import { MayaCategorizedGallery } from '../components/maya-categorized-gallery';
import { MemberNavigation } from '../components/member-navigation';

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

export default function Maya() {
  const { user } = useAuth();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  // Initialize Maya generation hook (standalone mode - no chat persistence needed)
  const { generateFromSpecificConcept } = useMayaGeneration(messages, setMessages, null, setIsLoading, toast);
  
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
      toast({ title: "Save Failed", description: "Please try again", variant: "destructive" });
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

  // Load Maya conversation history
  const { data: conversationData } = useQuery({
    queryKey: ['/api/maya/conversation'],
    enabled: true
  });

  useEffect(() => {
    if (conversationData && (conversationData as any).messages) {
      setMessages((conversationData as any).messages);
    }
  }, [conversationData]);

  // Auto-scroll removed - let users control their own scrolling position

  // Generate image from concept card using Maya's generation system
  const handleGenerateImage = async (card: ConceptCard) => {
    if (generateFromSpecificConcept) {
      // Use Maya's intelligent generation system
      await generateFromSpecificConcept(card.title, card.id);
    } else {
      console.error('Maya generation system not available');
    }
  };

  // Send message to Maya
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
      // Add Maya's response
      const mayaMessage: ChatMessage = {
        id: Date.now().toString(),
        type: 'maya',
        content: data.response || '',
        timestamp: new Date().toISOString(),
        conceptCards: data.conceptCards || []
      };

      setMessages(prev => [...prev, mayaMessage]);
      setIsLoading(false);
    },
    onError: () => {
      setIsLoading(false);
    }
  });

  const handleSendMessage = () => {
    if (!message.trim() || isLoading) return;

    // Add user message immediately
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user', 
      content: message.trim(),
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    
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
            className="md:hidden btn light text-xs tracking-[0.3em] uppercase px-4 py-2"
          >
            Menu
          </button>

          {/* Close Button */}
          <button
            onClick={() => window.history.back()}
            className="btn light text-xs tracking-[0.3em] uppercase px-6 py-3 hover:scale-105 transition-all duration-300"
          >
            Close
          </button>
        </div>

        {/* Hero Content - Compact */}
        <div className="hero-content relative z-10 flex flex-col justify-center items-center text-center h-full px-8 py-12">
          {/* Editorial Eyebrow */}
          <div className="hero-tagline eyebrow text-white/70 mb-4">
            AI Styling Intelligence
          </div>

          {/* Main Title - Editorial Size */}
          <h1 className="hero-title-main font-serif text-[clamp(4rem,8vw,7rem)] font-extralight uppercase tracking-[0.5em] leading-[0.8] mb-3">
            MAYA
          </h1>

          {/* Subtitle */}
          <div className="hero-title-sub font-serif text-[clamp(1.2rem,3vw,2rem)] font-extralight uppercase tracking-[0.3em] opacity-80 mb-6">
            Personal Brand Architect
          </div>

          {/* Description */}
          <p className="hero-description max-w-xl text-sm font-light leading-relaxed opacity-90 tracking-[0.05em]">
            Creating bespoke concept cards with intelligent FLUX prompts for your luxury personal brand photography.
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
              Choose your direction
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
        <div className="flex-1 bg-gradient-to-b from-white to-gray-50">
          <div className="max-w-6xl mx-auto px-8 md:px-16 py-16 space-y-20">
            {messages.length === 0 && (
              <div className="section text-center py-32">
                <div className="eyebrow text-gray-500 mb-8">
                  Welcome to your styling session
                </div>
                <div className="font-serif text-[clamp(2rem,5vw,4rem)] font-extralight text-black mb-8 italic">
                  "Ready to create something extraordinary?"
                </div>
                <p className="text-gray-600 max-w-2xl mx-auto font-light leading-relaxed text-lg">
                  Tell me about your vision, and I'll craft personalized concept cards with intelligent FLUX prompts 
                  that bring your brand story to life.
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
                            <div className="font-serif text-2xl font-extralight uppercase tracking-[0.2em] text-black mb-8">
                              Concept Cards
                            </div>
                            
                            <div className="grid gap-8">
                              {msg.conceptCards.map((card, index) => (
                                <div key={card.id} className="editorial-card group border border-gray-200">
                                  <div className="card-content p-8 relative">
                                    <div className="card-number text-8xl font-serif opacity-5 absolute -top-4 -right-2">
                                      {String(index + 1).padStart(2, '0')}
                                    </div>
                                    
                                    <div className="relative z-10">
                                      <div className="flex items-start justify-between mb-6">
                                        <div className="flex-1">
                                          <div className="eyebrow text-gray-500 mb-3">
                                            Concept {String(index + 1).padStart(2, '0')} • {card.category || 'Editorial'}
                                          </div>
                                          <h3 className="font-serif text-xl font-light uppercase tracking-[0.1em] text-black mb-4">
                                            {card.title}
                                          </h3>
                                        </div>
                                        {card.imageUrl && (
                                          <div className="w-20 h-20 ml-6 bg-gray-100 border border-gray-200"></div>
                                        )}
                                      </div>
                                      
                                      <p className="text-base leading-relaxed font-light text-gray-700 mb-6">
                                        {card.description}
                                      </p>
                                      
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

                                      {/* Generated Images Display - Working Version */}
                                      {card.generatedImages && card.generatedImages.length > 0 && (
                                        <div className="image-grid">
                                          <div className="eyebrow text-gray-500 mb-4">Generated Images</div>
                                          {card.generatedImages.map((imageUrl, imgIndex) => {
                                            // Use proxy URL immediately to avoid CORS issues
                                            const proxyUrl = `/api/proxy-image?url=${encodeURIComponent(imageUrl)}`;
                                            return (
                                              <div key={imgIndex} className="image-item" onClick={() => setSelectedImage?.(proxyUrl)}>
                                                <img 
                                                  src={proxyUrl}
                                                  alt={`Generated ${card.title} ${imgIndex + 1}`}
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
                                                {/* Heart/Save Button */}
                                                <button
                                                  className="save-btn absolute top-2 right-2 w-8 h-8 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-md transition-all opacity-0 group-hover:opacity-100"
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
                                      
                                      
                                      {/* Generate Button - Always show if concept can be generated */}
                                      {(card.fluxPrompt || (card as any).fullPrompt) && (
                                        <div className="mt-6 pt-6 border-t border-gray-200">
                                          <button
                                            onClick={(e) => {
                                              e.preventDefault();
                                              e.stopPropagation();
                                              handleGenerateImage(card);
                                            }}
                                            disabled={card.isGenerating}
                                            className="editorial-card bg-black text-white hover:bg-gray-900 transition-all duration-300 w-full cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                          >
                                            <div className="card-content px-6 py-3">
                                              <div className="text-xs font-normal uppercase tracking-[0.3em]">
                                                {card.isGenerating ? 'Generating...' : 
                                                 card.hasGenerated ? 'Generate More' : 'Generate Image'}
                                              </div>
                                            </div>
                                          </button>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              ))}
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
            {isLoading && (
              <div className="animate-fadeIn">
                <div className="eyebrow text-gray-500 mb-6">
                  Maya • Crafting your concepts
                </div>
                <div className="bg-white border border-gray-200 shadow-lg">
                  <div className="p-12 flex items-center space-x-4">
                    <div className="flex space-x-2">
                      <div className="w-3 h-3 bg-black rounded-full animate-bounce"></div>
                      <div className="w-3 h-3 bg-black rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                      <div className="w-3 h-3 bg-black rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></div>
                    </div>
                    <div className="text-sm font-light text-gray-600">
                      Creating your personalized concept cards...
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Integrated Chat Input - Part of Conversation Flow */}
            <div className="max-w-4xl">
              {/* Input as Natural Chat Element */}
              <div className="bg-white border border-gray-200 shadow-lg animate-fadeIn">
                <div className="p-12">
                  <div className="eyebrow text-gray-500 mb-6">
                    Continue Conversation • Tell Maya Your Vision
                  </div>
                  
                  <div className="space-y-6">
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Share your vision for the next photo session..."
                      className="w-full border-0 resize-none bg-transparent text-lg font-light leading-relaxed placeholder-gray-400 focus:outline-none"
                      rows={3}
                      disabled={isLoading}
                    />
                    
                    {/* Integrated Send Area */}
                    <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                      <div className="eyebrow text-gray-400">
                        Press Enter to send • Shift+Enter for new line
                      </div>
                      <button
                        onClick={handleSendMessage}
                        disabled={!message.trim() || isLoading}
                        className="editorial-card group bg-black text-white hover:bg-gray-800 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <div className="card-content px-8 py-3 relative">
                          <div className="text-xs font-normal uppercase tracking-[0.3em] group-hover:text-white transition-colors duration-300">
                            {isLoading ? 'Creating...' : 'Send to Maya'}
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
        <div className="max-w-4xl mx-auto px-8 py-12">
          <div className="mb-8">
            <div className="eyebrow text-gray-500 mb-2">Your Personal Gallery</div>
            <h2 className="font-serif text-2xl font-extralight uppercase tracking-[0.2em] text-black">
              Auto-Categorized Collection
            </h2>
            <p className="text-sm text-gray-600 mt-2">All your Maya-generated images, automatically organized by category</p>
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
                className="w-10 h-10 flex items-center justify-center bg-white/90 hover:bg-white text-gray-700 hover:text-black rounded-full transition-all shadow-lg"
                title="Close"
              >
                <span className="text-xl leading-none">×</span>
              </button>
            </div>

            {/* Image Info */}
            <div className="absolute bottom-4 left-4 bg-black/60 text-white px-4 py-2 rounded-lg backdrop-blur-sm">
              <div className="text-sm font-medium">Maya Personal Brand Photo</div>
              <div className="text-xs text-white/80">Saved to your gallery collection</div>
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
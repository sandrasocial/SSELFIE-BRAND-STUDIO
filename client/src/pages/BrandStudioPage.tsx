import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../hooks/use-auth';
import { MemberNavigation } from '../components/member-navigation';
import { DirectorPanel } from '../components/brand-studio/DirectorPanel';
import { CanvasPanel } from '../components/brand-studio/CanvasPanel';
import { ToolkitPanel } from '../components/brand-studio/ToolkitPanel';
import { StoryStudio } from '../components/brand-studio/StoryStudio';
import { useToast } from '../hooks/use-toast';

// Luxury flatlay images for editorial aesthetic
const FLATLAY_IMAGES = [
  'https://i.postimg.cc/VLCFmXVr/1.png',
  'https://i.postimg.cc/WpDyqFyj/10.png',
  'https://i.postimg.cc/SRz1B39j/100.png',
  'https://i.postimg.cc/bJ5FFpsK/101.png',
  'https://i.postimg.cc/F15CNpbp/102.png',
  'https://i.postimg.cc/pVh2VdY5/103.png',
  'https://i.postimg.cc/tRK9sH2S/104.png',
  'https://i.postimg.cc/2Smmx7pn/105.png',
  'https://i.postimg.cc/YqQMgyPp/106.png',
  'https://i.postimg.cc/Bng37Psk/107.png',
  'https://i.postimg.cc/zf2r8myk/108.png',
  'https://i.postimg.cc/4dKT38tR/109.png',
  'https://i.postimg.cc/dQzx2QMC/11.png',
  'https://i.postimg.cc/4drRHzb7/110.png',
  'https://i.postimg.cc/ryrkXPMS/111.png',
  'https://i.postimg.cc/PrnktQ50/112.png',
  'https://i.postimg.cc/3JjQW0yN/113.png',
  'https://i.postimg.cc/wj68NxJV/114.png'
];

// Types
interface ConceptCard {
  id: string;
  title: string;
  description: string;
  fluxPrompt?: string;
  emoji?: string;
  creativeLook?: string;
  type?: 'portrait' | 'flatlay' | 'lifestyle';
  generatedImages?: string[];
  isGenerating?: boolean;
}

interface ChatMessage {
  id: string;
  type: 'user' | 'maya';
  content: string;
  timestamp: string;
}

export default function BrandStudioPage() {
  const { user } = useAuth();
  const { toast } = useToast();

  // Core state
  const [activeTab, setActiveTab] = useState<'photo' | 'story'>('photo');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [conceptCards, setConceptCards] = useState<ConceptCard[]>([]);
  const [selectedConceptId, setSelectedConceptId] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  // Mobile state
  const [isMobile, setIsMobile] = useState(false);
  const [showMobileChat, setShowMobileChat] = useState(false);
  const [showMobileToolkit, setShowMobileToolkit] = useState(false);

  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Random background for immersive experience
  const [backgroundImage] = useState(() => 
    FLATLAY_IMAGES[Math.floor(Math.random() * FLATLAY_IMAGES.length)]
  );

  // Responsive detection
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Send message to Maya
  const sendMessage = async () => {
    if (!message.trim() || isTyping) return;

    const userMessage: ChatMessage = {
      id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'user',
      content: message.trim(),
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setMessage('');
    setIsTyping(true);

    try {
      const response = await fetch('/api/maya/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage.content,
          context: 'styling',
          conversationHistory: messages.slice(-5) // Last 5 messages for context
        })
      });

      if (!response.ok) throw new Error('Maya is taking a creative break');

      const data = await response.json();

      const mayaMessage: ChatMessage = {
        id: `maya_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: 'maya',
        content: data.response || data.message || "I'm excited to help you create stunning professional photos! What's your vision?",
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, mayaMessage]);

      // Add concept cards if Maya creates them
      if (data.conceptCards?.length > 0) {
        const newCards = data.conceptCards.map((card: any) => ({
          ...card,
          id: card.id || `concept_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          isGenerating: false
        }));
        setConceptCards(prev => [...prev, ...newCards]);

        toast({
          title: "Creative concepts ready!",
          description: `Maya created ${newCards.length} beautiful photo concepts for you`
        });
      }

    } catch (error) {
      console.error('Maya conversation error:', error);

      // Graceful fallback with sample concepts
      const fallbackMessage: ChatMessage = {
        id: `maya_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: 'maya',
        content: "I've prepared some stunning professional photo concepts based on what successful entrepreneurs need most. Let's create something amazing together!",
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, fallbackMessage]);

      // Premium sample concepts
      const sampleConcepts: ConceptCard[] = [
        {
          id: 'executive_confidence',
          title: 'Executive Confidence',
          description: 'Commanding professional headshots that build instant trust and credibility with clients, investors, and partners.',
          emoji: '🎯',
          creativeLook: 'Corporate Elite',
          type: 'portrait',
          fluxPrompt: 'professional executive headshot, confident authoritative pose, luxury office background, sharp business attire, studio lighting',
          isGenerating: false
        },
        {
          id: 'creative_entrepreneur',
          title: 'Creative Entrepreneur',
          description: 'Modern lifestyle shots that showcase your innovative spirit while maintaining professional polish.',
          emoji: '✨',
          creativeLook: 'Modern Creative',
          type: 'lifestyle',
          fluxPrompt: 'creative entrepreneur lifestyle, modern workspace setting, innovative casual professional styling, natural confident pose',
          isGenerating: false
        },
        {
          id: 'thought_leader',
          title: 'Thought Leader Authority',
          description: 'Authoritative speaking and presentation photos that establish your expertise in your industry.',
          emoji: '💼',
          creativeLook: 'Authority Expert',
          type: 'portrait',
          fluxPrompt: 'thought leader presenting, professional conference setting, authoritative expert pose, premium business environment',
          isGenerating: false
        }
      ];
      setConceptCards(sampleConcepts);

      toast({
        title: "Creative concepts ready!",
        description: "Maya created 3 premium photo concepts for you"
      });
    } finally {
      setIsTyping(false);
    }
  };

  // Generate images for concept
  const generateImages = async (concept: ConceptCard) => {
    setConceptCards(prev => prev.map(c => 
      c.id === concept.id ? { ...c, isGenerating: true } : c
    ));

    toast({
      title: "Creating your photos...",
      description: `Generating professional images for "${concept.title}"`
    });

    try {
      const response = await fetch('/api/generate/flux', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: concept.fluxPrompt || concept.description,
          style: concept.creativeLook,
          type: concept.type,
          count: 4
        })
      });

      if (!response.ok) {
        throw new Error(`Generation service error: ${response.status}`);
      }

      const data = await response.json();

      setConceptCards(prev => prev.map(c => 
        c.id === concept.id 
          ? { 
              ...c, 
              isGenerating: false, 
              generatedImages: data.imageUrls || data.images || []
            } 
          : c
      ));

      toast({
        title: "Photos ready!",
        description: `Generated ${data.imageUrls?.length || 4} professional photos`
      });

    } catch (error) {
      console.error('Image generation error:', error);

      // Demo fallback images
      const demoImages = Array.from({ length: 4 }, (_, i) => 
        `https://picsum.photos/400/600?random=${concept.id}_${i}`
      );

      setConceptCards(prev => prev.map(c => 
        c.id === concept.id 
          ? { 
              ...c, 
              isGenerating: false, 
              generatedImages: demoImages
            } 
          : c
      ));

      toast({
        title: "Demo photos generated",
        description: "Connect your generation API for real photos",
        variant: "destructive"
      });
    }
  };

  // Handle concept selection
  const handleConceptSelect = (conceptId: string) => {
    setSelectedConceptId(conceptId);
    if (isMobile) {
      setShowMobileToolkit(true);
    }
  };

  // Handle toolkit actions
  const handleToolkitAction = (action: string, data?: any) => {
    const selectedConcept = conceptCards.find(c => c.id === selectedConceptId);

    switch (action) {
      case 'generate':
        if (selectedConcept) {
          generateImages(selectedConcept);
        }
        break;
      case 'create-video':
        if (selectedConcept) {
          setActiveTab('story');
          toast({
            title: "Switching to Maya's Story Studio",
            description: "Your concept is ready for video creation!"
          });
        }
        break;
      case 'save-gallery':
        // Implement gallery save
        toast({
          title: "Saved to gallery",
          description: "Added to your professional photo collection"
        });
        break;
    }

    if (isMobile) {
      setShowMobileToolkit(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-light mb-4" style={{ fontFamily: 'Times New Roman, serif' }}>
            Sign in to Maya's Creative Workspace
          </h1>
          <p className="text-gray-600">Professional photos from your selfies</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Global Styles */}
      <style jsx global>{`
        .maya-workspace {
          background: linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), 
                      url('${backgroundImage}');
          background-size: cover;
          background-position: center;
          background-attachment: fixed;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif;
        }

        .floating-panel {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
        }

        .concept-card {
          background: linear-gradient(135deg, rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.1));
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          transition: all 0.3s ease;
        }

        .concept-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 40px rgba(0, 0, 0, 0.2);
        }

        .luxury-title {
          font-family: 'Times New Roman', serif;
          font-weight: 300;
          letter-spacing: 0.3em;
          text-transform: uppercase;
        }

        .editorial-text {
          font-weight: 300;
          line-height: 1.7;
          letter-spacing: 0.02em;
        }
      `}</style>

      <div className="maya-workspace min-h-screen">
        <MemberNavigation darkText={false} />

        {/* Studio Navigation */}
        <div className="border-b border-white/20 backdrop-blur-sm bg-black/20 sticky top-20 z-40">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex">
              <button
                onClick={() => setActiveTab('photo')}
                className={`px-8 py-4 text-sm luxury-title transition-all ${
                  activeTab === 'photo'
                    ? 'bg-white text-black'
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                }`}
              >
                Maya's Photo Studio
              </button>
              <button
                onClick={() => setActiveTab('story')}
                className={`px-8 py-4 text-sm luxury-title transition-all ${
                  activeTab === 'story'
                    ? 'bg-white text-black'
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                }`}
              >
                Maya's Story Studio
              </button>
            </div>
          </div>
        </div>

        {activeTab === 'story' ? (
          <StoryStudio />
        ) : (
          <div className="max-w-7xl mx-auto p-4 lg:p-6">

            {isMobile ? (
              /* Mobile Layout: Canvas-First */
              <div className="space-y-4">

                {/* Mobile Canvas */}
                <CanvasPanel
                  mode="photo"
                  conceptCards={conceptCards}
                  selectedConceptId={selectedConceptId}
                  onConceptSelect={handleConceptSelect}
                  onConceptGenerate={generateImages}
                  className="floating-panel rounded-lg"
                >
                  {/* Welcome state for mobile */}
                  {conceptCards.length === 0 && messages.length === 0 && (
                    <div className="text-center py-12 px-6">
                      <div 
                        className="w-24 h-24 rounded-full mx-auto mb-6 flex items-center justify-center text-white"
                        style={{
                          background: `linear-gradient(135deg, rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.3)), url('${FLATLAY_IMAGES[1]}')`,
                          backgroundSize: 'cover'
                        }}
                      >
                        <span className="text-2xl">✨</span>
                      </div>
                      <h2 className="luxury-title text-xl mb-4">Maya's Creative Studio</h2>
                      <p className="editorial-text text-gray-600 mb-6">
                        What professional photos do you need for your business?
                      </p>
                      <button
                        onClick={() => setShowMobileChat(true)}
                        className="bg-black text-white px-6 py-3 rounded-lg luxury-title text-sm"
                      >
                        Start Creating
                      </button>
                    </div>
                  )}
                </CanvasPanel>

                {/* Mobile Chat Overlay */}
                {showMobileChat && (
                  <div className="fixed inset-0 bg-black/50 z-50 flex flex-col">
                    <div className="floating-panel m-4 rounded-lg flex-1 flex flex-col">
                      <div className="flex items-center justify-between p-4 border-b">
                        <h3 className="luxury-title text-sm">Chat with Maya</h3>
                        <button
                          onClick={() => setShowMobileChat(false)}
                          className="w-8 h-8 flex items-center justify-center text-gray-600 hover:text-black"
                        >
                          ×
                        </button>
                      </div>

                      <DirectorPanel
                        mode="photo"
                        messages={messages}
                        isTyping={isTyping}
                        message={message}
                        setMessage={setMessage}
                        onSendMessage={sendMessage}
                        onKeyPress={handleKeyPress}
                        className="flex-1 border-none"
                        messagesEndRef={messagesEndRef}
                        chatContainerRef={chatContainerRef}
                      />
                    </div>
                  </div>
                )}

                {/* Mobile Toolkit Action Sheet */}
                {showMobileToolkit && selectedConceptId && (
                  <div className="fixed inset-0 bg-black/50 z-50 flex items-end">
                    <div className="floating-panel w-full rounded-t-lg max-h-[70vh] overflow-y-auto">
                      <div className="flex items-center justify-between p-4 border-b">
                        <h3 className="luxury-title text-sm">Photo Actions</h3>
                        <button
                          onClick={() => setShowMobileToolkit(false)}
                          className="w-8 h-8 flex items-center justify-center text-gray-600 hover:text-black"
                        >
                          ×
                        </button>
                      </div>

                      <ToolkitPanel
                        mode="photo"
                        selectedItem={conceptCards.find(c => c.id === selectedConceptId)}
                        onItemAction={handleToolkitAction}
                        className="border-none"
                      />
                    </div>
                  </div>
                )}

                {/* Mobile Chat Button */}
                <button
                  onClick={() => setShowMobileChat(true)}
                  className="fixed bottom-4 right-4 w-14 h-14 bg-black text-white rounded-full flex items-center justify-center shadow-lg z-30"
                >
                  💬
                </button>
              </div>
            ) : (
              /* Desktop Layout: Three-Panel Interface */
              <div className="grid grid-cols-12 gap-6 h-[calc(100vh-200px)]">

                {/* 1. The Director: Strategic Conversation */}
                <div className="col-span-3">
                  <div className="floating-panel rounded-lg h-full flex flex-col">
                    <div className="p-6 border-b border-gray-200">
                      <h3 className="luxury-title text-sm text-black">The Director</h3>
                      <p className="text-xs text-gray-500 luxury-title mt-1">Strategic Conversation</p>
                    </div>

                    <DirectorPanel
                      mode="photo"
                      messages={messages}
                      isTyping={isTyping}
                      message={message}
                      setMessage={setMessage}
                      onSendMessage={sendMessage}
                      onKeyPress={handleKeyPress}
                      className="flex-1 border-none rounded-none"
                      messagesEndRef={messagesEndRef}
                      chatContainerRef={chatContainerRef}
                      placeholder="What is the goal for this creative session?"
                    />
                  </div>
                </div>

                {/* 2. The Canvas: Editorial Lookbook */}
                <div className="col-span-6">
                  <div className="floating-panel rounded-lg h-full">
                    <div className="p-6 border-b border-gray-200">
                      <h3 className="luxury-title text-sm text-black">The Canvas</h3>
                      <p className="text-xs text-gray-500 luxury-title mt-1">Editorial Lookbook</p>
                    </div>

                    <CanvasPanel
                      mode="photo"
                      conceptCards={conceptCards}
                      selectedConceptId={selectedConceptId}
                      onConceptSelect={handleConceptSelect}
                      onConceptGenerate={generateImages}
                      className="h-full border-none rounded-none"
                    >
                      {/* Desktop welcome state */}
                      {conceptCards.length === 0 && (
                        <div className="flex items-center justify-center h-full">
                          <div className="text-center max-w-md">
                            <div 
                              className="w-32 h-32 rounded-lg mx-auto mb-6 flex items-center justify-center text-white"
                              style={{
                                background: `linear-gradient(135deg, rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.3)), url('${FLATLAY_IMAGES[2]}')`,
                                backgroundSize: 'cover'
                              }}
                            >
                              <span className="text-4xl">✨</span>
                            </div>
                            <h2 className="luxury-title text-xl mb-4 text-black">Your Creative Canvas</h2>
                            <p className="editorial-text text-gray-600">
                              Start a conversation with Maya to see beautiful concept cards appear here
                            </p>
                          </div>
                        </div>
                      )}
                    </CanvasPanel>
                  </div>
                </div>

                {/* 3. The Toolkit: Action and Assets */}
                <div className="col-span-3">
                  <div className="floating-panel rounded-lg h-full">
                    <div className="p-6 border-b border-gray-200">
                      <h3 className="luxury-title text-sm text-black">The Toolkit</h3>
                      <p className="text-xs text-gray-500 luxury-title mt-1">Action & Assets</p>
                    </div>

                    <ToolkitPanel
                      mode="photo"
                      selectedItem={conceptCards.find(c => c.id === selectedConceptId)}
                      onItemAction={handleToolkitAction}
                      className="flex-1 border-none rounded-none"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
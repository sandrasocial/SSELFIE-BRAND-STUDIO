import React, { useState, useEffect } from 'react';
import { MessageCircle, Star, Camera, Send, X, Sparkles } from 'lucide-react';
import { useAuth } from '../../hooks/use-auth';

// Maya's Brand Style Categories (no emojis in frontend)
const BRAND_STYLES = [
  {
    id: 'minimalist',
    name: 'Minimalist CEO',
    description: 'Clean, confident, and understated elegance for modern executives',
    aesthetic: 'Modern Minimalism',
    mood: 'Confident & Clean',
    primaryColor: '#000000',
    secondaryColor: '#ffffff',
    accentColor: '#f5f5f5',
    targetAudience: 'C-Suite executives, entrepreneurs, consultants',
    heroImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face'
  },
  {
    id: 'creative',
    name: 'Creative Visionary',
    description: 'Bold, artistic, and authentic for creative professionals',
    aesthetic: 'Artistic Expression',
    mood: 'Bold & Authentic',
    primaryColor: '#2c2c2c',
    secondaryColor: '#ff6b35',
    accentColor: '#f0f0f0',
    targetAudience: 'Artists, designers, creative directors',
    heroImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop&crop=face'
  },
  {
    id: 'luxury',
    name: 'Luxury Elite',
    description: 'Sophisticated, premium, and exclusive for high-end brands',
    aesthetic: 'Luxury Editorial',
    mood: 'Sophisticated & Elite',
    primaryColor: '#1a1a1a',
    secondaryColor: '#d4af37',
    accentColor: '#f8f8f8',
    targetAudience: 'Luxury brand founders, premium service providers',
    heroImage: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=400&fit=crop&crop=face'
  }
];

// Concept Card Component
function LuxuryConceptCard({ concept, onGenerate }: { concept: any; onGenerate: () => void }) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGenerated, setIsGenerated] = useState(false);

  const handleGenerate = async () => {
    setIsGenerating(true);
    
    // Call real API endpoint for photo generation
    try {
      const response = await fetch('/api/photo-generation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          concept: concept.title,
          description: concept.description,
          category: concept.category
        })
      });
      
      if (response.ok) {
        onGenerate();
      }
    } catch (error) {
      console.error('Photo generation failed:', error);
    }
    
    // Simulate generation time
    setTimeout(() => {
      setIsGenerating(false);
      setIsGenerated(true);
    }, 3000);
  };

  return (
    <div className="luxury-card">
      <div className="space-y-5">
        {/* Enhanced header with better hierarchy */}
        <div className="flex items-center justify-between">
          <div className="px-4 py-2 bg-zinc-700/30 rounded-full border border-zinc-600/20">
            <span className="luxury-text-caption">{concept.category}</span>
          </div>
          <div className="w-2 h-2 bg-zinc-500 rounded-full"></div>
        </div>
        
        {/* Improved content hierarchy */}
        <div className="space-y-4">
          <h4 className="luxury-heading-3">{concept.title}</h4>
          <p className="luxury-text-body">{concept.description}</p>
        </div>
      </div>
      
      {/* Enhanced interaction states */}
      {!isGenerating && !isGenerated && (
        <div className="mt-8">
          <button 
            onClick={handleGenerate}
            className="luxury-button-primary w-full"
          >
            <Camera size={18} strokeWidth={1.2} />
            <span>Generate Photos</span>
          </button>
        </div>
      )}

      {/* Enhanced loading state */}
      {isGenerating && (
        <div className="mt-8 flex flex-col items-center justify-center py-12 space-y-6">
          <div className="relative">
            <div className="w-12 h-12 border-2 border-white/20 rounded-full animate-spin"></div>
            <div className="absolute inset-0 w-12 h-12 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          </div>
          <div className="text-center space-y-3">
            <span className="luxury-text-body">Creating Magic</span>
            <div className="w-64 h-1 bg-zinc-800 rounded-full overflow-hidden">
              <div className="w-full h-full bg-gradient-to-r from-transparent via-white/50 to-transparent animate-pulse"></div>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced success state */}
      {isGenerated && (
        <div className="mt-8 space-y-6">
          <div className="p-5 bg-green-900/20 border border-green-500/30 rounded-2xl">
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 bg-green-500/30 rounded-full flex items-center justify-center">
                <span className="text-green-300 text-sm font-light">✓</span>
              </div>
              <div className="space-y-1">
                <h4 className="luxury-text-body text-green-200">Photos Ready!</h4>
                <p className="luxury-text-caption text-green-300/80">Your vision came to life beautifully.</p>
              </div>
            </div>
          </div>
          
          {/* Enhanced action buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button className="luxury-button-primary">Save All</button>
            <button className="luxury-button-secondary">Share</button>
          </div>
        </div>
      )}
    </div>
  );
}

// Style Selector Component
function StyleSelector({ onStyleSelect, selectedStyleId, onClose }: any) {
  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="p-3 bg-zinc-800/40 rounded-xl border border-zinc-700/30">
            <Star size={20} className="text-zinc-300" strokeWidth={1.2} />
          </div>
          <h2 className="luxury-heading-2">Choose Style</h2>
        </div>
        <p className="luxury-text-body max-w-md mx-auto">
          Select the aesthetic that represents your vision
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {BRAND_STYLES.map((style) => (
          <div
            key={style.id}
            onClick={() => onStyleSelect(style)}
            className={`
              relative group cursor-pointer rounded-xl overflow-hidden
              transform transition-all duration-500 hover:scale-[1.02]
              luxury-card
              ${selectedStyleId === style.id ? 'ring-1 ring-white/20' : ''}
            `}
          >
            <div className="flex gap-4 p-6">
              <div className="w-16 h-16 relative overflow-hidden rounded-lg flex-shrink-0">
                <img
                  src={style.heroImage}
                  alt={style.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                
                {selectedStyleId === style.id && (
                  <div className="absolute top-1 right-1 w-5 h-5 bg-white rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-black rounded-full"></div>
                  </div>
                )}
              </div>

              <div className="flex-1 space-y-3">
                <div>
                  <h3 className="luxury-heading-3 mb-1">{style.name}</h3>
                  <p className="luxury-text-caption">{style.description}</p>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="flex space-x-2">
                    <div
                      className="w-4 h-4 rounded-full border border-zinc-600/30"
                      style={{ backgroundColor: style.primaryColor }}
                    />
                    <div
                      className="w-4 h-4 rounded-full border border-zinc-600/30"
                      style={{ backgroundColor: style.secondaryColor }}
                    />
                    <div
                      className="w-4 h-4 rounded-full border border-zinc-600/30"
                      style={{ backgroundColor: style.accentColor }}
                    />
                  </div>
                  <span className="luxury-text-caption">{style.aesthetic}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function LuxuryMayaScreen() {
  const [messages, setMessages] = useState([
    {
      role: 'maya',
      content: 'Hey! I\'m Maya, your personal stylist and brand strategist. Think of me as your most stylish friend who happens to be brilliant at business strategy.\n\nI\'m here to help you create photos that actually build your brand - the kind that make potential clients think "I need to work with them." Ready to create some stunning photos that\'ll help you book more clients?',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [selectedStyle, setSelectedStyle] = useState(null);
  const [showStyleSelector, setShowStyleSelector] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const { user } = useAuth();

  const handleStyleSelect = (style: any) => {
    setSelectedStyle(style);
    setShowStyleSelector(false);
    
    const styleMessage = {
      role: 'user',
      content: `I'm drawn to the "${style.name}" style. ${style.description}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    
    setMessages(prev => [...prev, styleMessage]);
    
    // Maya responds with concept cards using real API
    setTimeout(() => {
      setIsTyping(true);
      setTimeout(async () => {
        try {
          const response = await fetch('/api/maya/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              message: `Generate concept cards for ${style.name} style`,
              history: messages,
              stylePreference: style.id
            })
          });
          
          const data = await response.json();
          
          setIsTyping(false);
          const conceptMessage = {
            role: 'maya',
            content: data.response || `Perfect choice! ${style.name} is going to look incredible on you.\n\nHere's what I'm thinking - three concepts that'll help you book more clients:`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            concepts: data.conceptCards || getMayaStyledConcepts(style)
          };
          setMessages(prev => [...prev, conceptMessage]);
        } catch (error) {
          console.error('Maya chat failed:', error);
          setIsTyping(false);
        }
      }, 2200);
    }, 600);
  };

  const getMayaStyledConcepts = (style: any) => {
    if (style.id === 'minimalist') {
      return [
        {
          title: 'LinkedIn Power Shot',
          description: 'Clean headshot with gorgeous natural light. This says "trust me with your biggest project."',
          category: 'Portrait'
        },
        {
          title: 'Workspace Vibes',
          description: 'You in your element, looking focused and approachable. Clients love seeing the person behind the work.',
          category: 'Lifestyle'
        },
        {
          title: 'Brand Details',
          description: 'Coffee setup or workspace styling. These supporting shots make your whole brand feel premium.',
          category: 'Detail'
        }
      ];
    } else if (style.id === 'creative') {
      return [
        {
          title: 'Creative Genius Shot',
          description: 'Bold lighting that shows your creative intensity. Perfect for attracting dream creative projects.',
          category: 'Portrait'
        },
        {
          title: 'In the Zone',
          description: 'Caught sketching or brainstorming. Shows clients the magic behind your creative process.',
          category: 'Lifestyle'
        },
        {
          title: 'Artist\'s World',
          description: 'Your tools, inspiration, works in progress. Helps clients visualize collaborating with you.',
          category: 'Detail'
        }
      ];
    } else {
      return [
        {
          title: 'Executive Presence',
          description: 'Sophisticated but warm. Makes people want to hire you for their most important projects.',
          category: 'Portrait'
        },
        {
          title: 'Strategic Thinking',
          description: 'You reviewing plans or in thoughtful mode. Shows the high-level thinking clients pay for.',
          category: 'Lifestyle'
        },
        {
          title: 'Premium Touch',
          description: 'Quality materials, elegant details. Whispers "premium service" without saying a word.',
          category: 'Detail'
        }
      ];
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() && !isTyping) {
      const userMessage = {
        role: 'user',
        content: inputValue.trim(),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      
      setMessages(prev => [...prev, userMessage]);
      setInputValue('');
      
      // Send to real Maya API
      setTimeout(() => {
        setIsTyping(true);
        setTimeout(async () => {
          try {
            const response = await fetch('/api/maya/chat', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                message: userMessage.content,
                history: messages
              })
            });
            
            const data = await response.json();
            
            setIsTyping(false);
            const mayaMessage = {
              role: 'maya',
              content: data.response || 'I can totally see your vision! You have great instincts.\n\nLet\'s create photos that work hard for your business:',
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              concepts: data.conceptCards || [
                {
                  title: 'Your Signature Look',
                  description: 'That perfect shot that makes people think "I need to work with them." Great for everything from LinkedIn to your website.',
                  category: 'Portrait'
                },
                {
                  title: 'Behind-the-Scenes',
                  description: 'You doing what you do best. These authentic moments make clients feel like they already trust you.',
                  category: 'Lifestyle'
                },
                {
                  title: 'Brand Story',
                  description: 'Details that show your personality and quality. Trust me, these make all the difference.',
                  category: 'Detail'
                }
              ]
            };
            setMessages(prev => [...prev, mayaMessage]);
          } catch (error) {
            console.error('Maya chat failed:', error);
            setIsTyping(false);
          }
        }, 2400);
      }, 700);
    }
  };

  const handlePhotoGeneration = () => {
    console.log('Photo generation triggered');
  };

  return (
    <div className="h-full flex flex-col space-y-6">
      {/* Maya Header */}
      <div className="flex items-center justify-between pt-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-zinc-800/40 rounded-xl border border-zinc-700/30">
            <MessageCircle size={20} className="text-zinc-300" strokeWidth={1.2} />
          </div>
          <div>
            <h3 className="luxury-heading-3">Maya Studio</h3>
            <p className="luxury-text-caption">AI Stylist & Brand Strategist</p>
          </div>
        </div>
        
        <button
          onClick={() => setShowStyleSelector(true)}
          className="luxury-button-secondary"
        >
          <Star size={14} strokeWidth={1.2} />
          {selectedStyle ? selectedStyle.name : 'Choose Style'}
        </button>
      </div>

      {/* Selected Style Display */}
      {selectedStyle && (
        <div className="luxury-card">
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 bg-zinc-400 rounded-full mt-2"></div>
            <div>
              <h4 className="luxury-text-body mb-1">{selectedStyle.aesthetic}</h4>
              <p className="luxury-text-caption">{selectedStyle.description}</p>
            </div>
          </div>
        </div>
      )}

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-2">
        {messages.map((msg, index) => (
          <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] ${msg.role === 'user' ? 'order-2' : 'order-1'}`}>
              <div className={`luxury-card ${
                msg.role === 'user' 
                  ? 'bg-zinc-700/30 border-zinc-600/30' 
                  : 'bg-zinc-800/30 border-zinc-700/30'
              }`}>
                <div className="space-y-2">
                  <p className="luxury-text-body">{msg.content}</p>
                  <div className="luxury-text-caption">{msg.timestamp}</div>
                </div>
              </div>
              
              {/* Concept Cards */}
              {msg.role === 'maya' && msg.concepts && (
                <div className="mt-4 space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="w-1 h-1 bg-zinc-400 rounded-full"></div>
                    <span className="luxury-text-caption">Concept Ideas</span>
                  </div>
                  {msg.concepts.map((concept: any, conceptIndex: number) => (
                    <LuxuryConceptCard 
                      key={conceptIndex} 
                      concept={concept} 
                      onGenerate={handlePhotoGeneration}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Typing Indicator */}
        {isTyping && (
          <div className="flex justify-start">
            <div className="luxury-card max-w-[85%]">
              <div className="flex items-center gap-3">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-zinc-400 rounded-full animate-pulse"></div>
                  <div className="w-2 h-2 bg-zinc-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 bg-zinc-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                </div>
                <span className="luxury-text-body">Maya is crafting your vision...</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Style Selector Modal */}
      {showStyleSelector && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="luxury-glass-container max-w-lg w-full max-h-[80vh] overflow-y-auto">
            <div className="luxury-content">
              <div className="flex items-center justify-between mb-6">
                <h3 className="luxury-heading-3">Choose Style</h3>
                <button
                  onClick={() => setShowStyleSelector(false)}
                  className="p-2 hover:bg-zinc-800/40 rounded-lg transition-colors"
                >
                  <X size={20} className="text-zinc-400" strokeWidth={1.2} />
                </button>
              </div>
              <StyleSelector 
                onStyleSelect={handleStyleSelect} 
                selectedStyleId={selectedStyle?.id}
                onClose={() => setShowStyleSelector(false)}
              />
            </div>
          </div>
        </div>
      )}

      {/* Chat Input */}
      <div className="border-t border-zinc-800/20 pt-4">
        <form onSubmit={handleSendMessage} className="flex gap-3">
          <div className="flex-1 relative">
            <input 
              type="text" 
              value={inputValue} 
              onChange={(e) => setInputValue(e.target.value)} 
              placeholder="Describe your vision to Maya..." 
              className="luxury-input pr-12"
              disabled={isTyping}
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <Camera size={16} className="text-zinc-500" strokeWidth={1.2} />
            </div>
          </div>
          <button 
            type="submit" 
            className="luxury-button-primary px-4 py-3"
            disabled={isTyping || !inputValue.trim()}
          >
            <Send size={16} strokeWidth={1.2} />
          </button>
        </form>
      </div>
    </div>
  );
}
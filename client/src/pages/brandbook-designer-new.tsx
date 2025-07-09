import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { HeroFullBleed } from '@/components/HeroFullBleed';
import { SandraImages } from '@/lib/sandra-images';
import { Navigation } from '@/components/navigation';
import { ExecutiveEssenceBrandbook } from '@/components/templates/ExecutiveEssenceBrandbook';
import { RefinedMinimalistBrandbook } from '@/components/templates/RefinedMinimalistBrandbook';
import { BoldFemmeBrandbook } from '@/components/templates/BoldFemmeBrandbook';
import { LuxeFeminineBrandbook } from '@/components/templates/LuxeFeminineBrandbook';
import { MagicBrandButton } from '@/components/MagicBrandButton';

// Simple brandbook preview component
const BrandbookPreview = ({ brandbook, templateId, aiImages }: { brandbook: any; templateId: string; aiImages?: any[] }) => {
  if (!brandbook) return null;

  // Get user's AI images by style
  const getAiImagesByStyle = (style: string) => {
    if (!aiImages || aiImages.length === 0) return [];
    return aiImages
      .filter(img => img.style === style && img.generationStatus === 'completed' && img.imageUrl && img.imageUrl !== 'error')
      .map(img => {
        if (typeof img.imageUrl === 'string' && img.imageUrl.startsWith('[')) {
          try {
            const imageArray = JSON.parse(img.imageUrl);
            return imageArray[0];
          } catch (e) {
            return null;
          }
        }
        return img.imageUrl;
      })
      .filter(url => url && url !== 'error' && url !== 'canceled');
  };

  const userImages = {
    editorial: getAiImagesByStyle('editorial'),
    professional: getAiImagesByStyle('professional'),
    portrait: getAiImagesByStyle('portrait'),
    business: getAiImagesByStyle('business'),
    lifestyle: getAiImagesByStyle('lifestyle')
  };

  // Transform brandbook data for template compatibility
  const transformedBrandbook = {
    businessName: brandbook.businessName || 'Your Business',
    tagline: brandbook.brandMessage || brandbook.tagline || 'Your brand message',
    story: brandbook.brandStory || brandbook.story || 'Your brand story',
    primaryColor: brandbook.primaryColor || '#0a0a0a',
    secondaryColor: brandbook.secondaryColor || '#f5f5f5',
    accentColor: brandbook.accentColor || '#666',
    primaryFont: brandbook.primaryFont || 'Times New Roman',
    secondaryFont: brandbook.secondaryFont || 'Inter',
    voiceTone: brandbook.voiceGuidelines?.tone || brandbook.voiceTone || 'Professional and authentic',
    keyPhrases: brandbook.voiceGuidelines?.personality || brandbook.keyPhrases || 'Authentic, professional, inspiring',
    brandPersonality: brandbook.brandPersonality || ['Professional', 'Authentic', 'Inspiring'],
    brandValues: brandbook.brandValues || ['Excellence', 'Authenticity', 'Innovation'],
    logoVariations: brandbook.logoVariations || [],
    applicationExamples: brandbook.applicationExamples || ['Business cards', 'Website', 'Social media']
  };

  // Render specific template
  switch (templateId) {
    case 'executive-essence':
      return <ExecutiveEssenceBrandbook brandbook={transformedBrandbook} userImages={userImages} />;
    
    case 'refined-minimalist':
      return <RefinedMinimalistBrandbook brandbook={transformedBrandbook} />;
    
    case 'bold-femme':
      const boldFemmeBrandbook = {
        businessName: brandbook.businessName || 'Your Business',
        tagline: brandbook.brandMessage || 'Bold & Feminine',
        monogram: brandbook.businessName?.charAt(0) || 'Y',
        script: brandbook.businessName || 'Your Business',
        manifesto: brandbook.brandStory || 'Embracing bold femininity with nature-inspired elegance.',
        primaryFont: brandbook.primaryFont || 'Times New Roman',
        secondaryFont: brandbook.secondaryFont || 'Inter',
        primaryColor: brandbook.primaryColor || '#2F4A3D',
        secondaryColor: brandbook.secondaryColor || '#6B8A74',
        accentColor: brandbook.accentColor || '#8B8680',
        voiceTone: brandbook.voiceGuidelines?.tone || brandbook.voiceTone,
        keyPhrases: brandbook.voiceGuidelines?.personality || brandbook.keyPhrases,
        story: brandbook.brandStory || 'Crafting authentic experiences through bold, feminine design.'
      };
      return <BoldFemmeBrandbook brandbook={boldFemmeBrandbook} />;
    
    case 'luxe-feminine':
      const luxeFeminineBrandbook = {
        businessName: brandbook.businessName || 'Your Business',
        tagline: brandbook.brandMessage || 'Luxe Elegance',
        script: brandbook.businessName || 'Your Business',
        monogram: brandbook.businessName?.charAt(0) || 'Y',
        story: brandbook.brandStory || 'A story of elegance, sophistication, and feminine power.',
        manifesto: brandbook.voiceGuidelines?.tone || 'Embracing femininity as strength, creating beauty with purpose.',
        voiceTone: brandbook.voiceGuidelines?.tone || brandbook.voiceTone,
        keyPhrases: brandbook.voiceGuidelines?.personality || brandbook.keyPhrases,
        primaryColor: brandbook.primaryColor || '#6B2D5C',
        secondaryColor: brandbook.secondaryColor || '#4A1E3A',
        accentColor: brandbook.accentColor || '#E8C4B8',
        primaryFont: brandbook.primaryFont || 'Times New Roman',
        secondaryFont: brandbook.secondaryFont || 'Inter'
      };
      return <LuxeFeminineBrandbook brandbook={luxeFeminineBrandbook} />;
    
    default:
      return <ExecutiveEssenceBrandbook brandbook={transformedBrandbook} userImages={userImages} />;
  }
};

export default function BrandbookDesigner() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [chatMessages, setChatMessages] = useState([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isAiResponding, setIsAiResponding] = useState(false);

  // Get existing brandbook
  const { data: brandbook, isLoading: isBrandbookLoading } = useQuery({
    queryKey: ['/api/brandbooks', user?.id],
    enabled: !!user?.id,
  });

  // Get user's AI images
  const { data: aiImages } = useQuery({
    queryKey: ['/api/ai-images', user?.id],
    enabled: !!user?.id,
  });

  // Get user's onboarding data for context
  const { data: onboardingData } = useQuery({
    queryKey: ['/api/onboarding', user?.id],
    enabled: !!user?.id,
  });

  const currentTemplate = brandbook?.templateId || 'executive-essence';

  // Initialize chat with Sandra AI when brandbook is available
  useEffect(() => {
    if (chatMessages.length === 0 && brandbook) {
      const templateName = currentTemplate.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
      const initialMessage = {
        role: 'sandra',
        content: `Perfect! I've created your ${templateName} brandbook. It looks amazing with your personal brand story. Want to make any adjustments? I can help you refine colors, change the vibe, or switch templates entirely. Just tell me what you'd like to tweak!`,
        timestamp: new Date().toISOString()
      };
      setChatMessages([initialMessage]);
    }
  }, [brandbook, currentTemplate, chatMessages.length]);

  // Update brandbook mutation
  const updateBrandbookMutation = useMutation({
    mutationFn: async (brandbookData: any) => {
      if (brandbook?.id) {
        return apiRequest('PUT', `/api/brandbooks/${brandbook.id}`, brandbookData);
      } else {
        return apiRequest('POST', '/api/brandbooks', brandbookData);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/brandbooks', user?.id] });
      toast({
        title: "Brandbook Updated",
        description: "Your changes have been applied successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update brandbook",
        variant: "destructive",
      });
    }
  });

  // Sandra AI chat mutation
  const sandraAIMutation = useMutation({
    mutationFn: async (message: string) => {
      const contextData = {
        brandbook,
        onboardingData,
        aiImages,
        currentTemplate,
        chatHistory: chatMessages
      };
      
      return apiRequest('POST', '/api/sandra-ai/brandbook-designer', {
        message,
        context: contextData
      });
    },
    onSuccess: (response) => {
      const sandraResponse = {
        role: 'sandra',
        content: response.message,
        timestamp: new Date().toISOString()
      };
      
      setChatMessages(prev => [...prev, sandraResponse]);
      setIsAiResponding(false);
      
      // Handle any brandbook updates from Sandra's response
      if (response.brandbookUpdates) {
        updateBrandbookMutation.mutate({
          ...brandbook,
          ...response.brandbookUpdates
        });
      }
      
      // Handle template suggestions
      if (response.templateSuggestion) {
        updateBrandbookMutation.mutate({
          ...brandbook,
          templateId: response.templateSuggestion
        });
      }
    },
    onError: (error) => {
      setIsAiResponding(false);
      toast({
        title: "Sandra AI Error",
        description: error.message || "Failed to get response from Sandra AI",
        variant: "destructive",
      });
    }
  });

  const handleSendMessage = () => {
    if (!currentMessage.trim()) return;
    
    const userMessage = {
      role: 'user',
      content: currentMessage,
      timestamp: new Date().toISOString()
    };
    
    setChatMessages(prev => [...prev, userMessage]);
    setCurrentMessage('');
    setIsAiResponding(true);
    
    sandraAIMutation.mutate(currentMessage);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleQuickSuggestion = (suggestion: string) => {
    setCurrentMessage(suggestion);
    setTimeout(() => {
      const userMessage = {
        role: 'user',
        content: suggestion,
        timestamp: new Date().toISOString()
      };
      setChatMessages(prev => [...prev, userMessage]);
      setIsAiResponding(true);
      sandraAIMutation.mutate(suggestion);
    }, 100);
  };

  if (isBrandbookLoading) {
    return (
      <div className="min-h-screen bg-[#fafafa]">
        <Navigation />
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin w-8 h-8 border-2 border-[#0a0a0a] border-t-transparent rounded-full"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafafa]">
      <Navigation />
      
      <HeroFullBleed
        title="BRANDBOOK DESIGNER"
        subtitle="Create your complete brand identity with Sandra AI"
        imageUrl={SandraImages.brandbook.sandra_brandbook_hero}
      />

      <div className="max-w-7xl mx-auto px-4 py-12">
        {!brandbook ? (
          /* Show Magic Brand Button when no brandbook exists */
          <div className="max-w-4xl mx-auto">
            <MagicBrandButton 
              onComplete={() => {
                queryClient.invalidateQueries({ queryKey: ['/api/brandbooks', user?.id] });
              }}
            />
          </div>
        ) : (
          /* Show brandbook designer with chat interface */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Sandra AI Chat Panel */}
            <div className="lg:col-span-1">
              <div className="bg-white border border-[#e5e5e5] h-[600px] flex flex-col">
                <div className="p-4 border-b border-[#e5e5e5]">
                  <h3 className="text-lg font-light" style={{ fontFamily: 'Times New Roman, serif' }}>
                    Sandra AI Designer
                  </h3>
                  <p className="text-sm text-[#666] mt-1">
                    Chat to adjust your brand
                  </p>
                </div>
                
                {/* Chat Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {chatMessages.map((message, index) => (
                    <div
                      key={index}
                      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] p-3 rounded-sm text-sm ${
                          message.role === 'user'
                            ? 'bg-[#0a0a0a] text-white'
                            : 'bg-[#f5f5f5] text-[#0a0a0a]'
                        }`}
                      >
                        {message.content}
                      </div>
                    </div>
                  ))}
                  
                  {isAiResponding && (
                    <div className="flex justify-start">
                      <div className="bg-[#f5f5f5] text-[#0a0a0a] p-3 rounded-sm text-sm">
                        <div className="flex items-center space-x-2">
                          <div className="animate-pulse">Sandra is thinking...</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Chat Input */}
                <div className="p-4 border-t border-[#e5e5e5]">
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={currentMessage}
                      onChange={(e) => setCurrentMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Ask Sandra to adjust your brand..."
                      className="flex-1 px-3 py-2 border border-[#e5e5e5] text-sm focus:outline-none focus:border-[#0a0a0a]"
                    />
                    <button
                      onClick={handleSendMessage}
                      disabled={!currentMessage.trim() || isAiResponding}
                      className="px-4 py-2 bg-[#0a0a0a] text-white text-sm hover:bg-[#333] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Send
                    </button>
                  </div>
                  
                  {/* Quick suggestion buttons */}
                  <div className="mt-2 flex flex-wrap gap-2">
                    {['Make it more elegant', 'Change colors', 'Different template', 'Add personality'].map((suggestion) => (
                      <button
                        key={suggestion}
                        onClick={() => handleQuickSuggestion(suggestion)}
                        disabled={isAiResponding}
                        className="px-2 py-1 text-xs bg-[#f5f5f5] text-[#666] hover:bg-[#e5e5e5] transition-colors disabled:opacity-50"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Brandbook Preview */}
            <div className="lg:col-span-2">
              <div className="bg-white border border-[#e5e5e5] min-h-[600px]">
                <div className="p-4 border-b border-[#e5e5e5]">
                  <h3 className="text-lg font-light" style={{ fontFamily: 'Times New Roman, serif' }}>
                    Your Brandbook Preview
                  </h3>
                  <p className="text-sm text-[#666] mt-1">
                    {currentTemplate.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')} Template
                  </p>
                </div>
                
                <div className="p-4">
                  <BrandbookPreview 
                    brandbook={brandbook}
                    templateId={currentTemplate}
                    aiImages={aiImages}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
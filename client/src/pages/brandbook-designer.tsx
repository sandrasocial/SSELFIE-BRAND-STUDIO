import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { MoodboardCollections, getMoodboardCollection } from '@/lib/moodboard-collections';
import { HeroFullBleed } from '@/components/HeroFullBleed';
import { SandraImages } from '@/lib/sandra-images';
import { Navigation } from '@/components/navigation';
import { ExecutiveEssenceBrandbook } from '@/components/templates/ExecutiveEssenceBrandbook';
import { RefinedMinimalistBrandbook } from '@/components/templates/RefinedMinimalistBrandbook';
import { BoldFemmeBrandbook } from '@/components/templates/BoldFemmeBrandbook';
import { LuxeFeminineBrandbook } from '@/components/templates/LuxeFeminineBrandbook';
import { executiveEssenceConfig, refinedMinimalistConfig, boldFemmeConfig, luxeFeminineConfig, sandraAIPrompts } from '@/components/templates/template-configs';
import { MagicBrandButton } from '@/components/MagicBrandButton';

// Template selection and preview component
const TemplateSelector = ({ selectedTemplate, onTemplateChange }: { selectedTemplate: string; onTemplateChange: (template: string) => void }) => {
  const templates = [
    {
      id: 'executive-essence',
      name: 'Executive Essence',
      description: 'Minimalist luxury for confident leaders',
      preview: '/template-previews/executive-essence.jpg'
    },
    {
      id: 'refined-minimalist',
      name: 'Refined Minimalist',
      description: 'Sophisticated editorial design with subtle animations',
      preview: '/template-previews/refined-minimalist.jpg'
    },
    {
      id: 'bold-femme',
      name: 'Bold Femme',
      description: 'Emerald elegance with nature-inspired sophistication',
      preview: '/template-previews/bold-femme.jpg'
    },
    {
      id: 'luxe-feminine',
      name: 'Luxe Feminine',
      description: 'Sophisticated femininity with burgundy elegance',
      preview: '/template-previews/luxe-feminine.jpg'
    }
  ];

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-light text-[#0a0a0a]" style={{ fontFamily: 'Times New Roman, serif' }}>
        Choose Your Template
      </h3>
      <div className="grid grid-cols-1 gap-4">
        {templates.map((template) => (
          <div
            key={template.id}
            onClick={() => onTemplateChange(template.id)}
            className={`p-4 border cursor-pointer transition-all duration-300 ${
              selectedTemplate === template.id
                ? 'border-[#0a0a0a] bg-[#f5f5f5]'
                : 'border-[#e5e5e5] hover:border-[#666]'
            }`}
          >
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-[#f5f5f5] border border-[#e5e5e5] flex items-center justify-center">
                <span className="text-xs font-light text-[#0a0a0a]">T</span>
              </div>
              <div>
                <h4 className="font-light text-[#0a0a0a]">{template.name}</h4>
                <p className="text-sm text-[#666]">{template.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Enhanced brandbook preview component with template support  
const BrandbookDesignPreview = ({ brandbook, templateId, aiImages }: { brandbook: any; templateId: string; aiImages?: any[] }) => {
  if (!brandbook) return null;

  // Helper function to get user's AI images by style
  const getAiImagesByStyle = (style: string) => {
    if (!aiImages || aiImages.length === 0) return [];
    return aiImages
      .filter(img => img.style === style && img.generationStatus === 'completed' && img.imageUrl && img.imageUrl !== 'error')
      .map(img => {
        // Handle JSON array of multiple images (user should select one)
        if (typeof img.imageUrl === 'string' && img.imageUrl.startsWith('[')) {
          try {
            const imageArray = JSON.parse(img.imageUrl);
            return imageArray[0]; // Use first image for preview
          } catch (e) {
            return null;
          }
        }
        return img.imageUrl;
      })
      .filter(url => url && url !== 'error' && url !== 'canceled');
  };

  // Get user's editorial/professional images for portraits
  const userPortraits = [
    ...getAiImagesByStyle('editorial'),
    ...getAiImagesByStyle('professional'),
    ...getAiImagesByStyle('portrait')
  ].slice(0, 4);

  // Get lifestyle/business images for flatlays/business applications
  const userFlatlays = [
    ...getAiImagesByStyle('lifestyle'), 
    ...getAiImagesByStyle('business'),
    ...getAiImagesByStyle('luxury')
  ].slice(0, 4); // Reduced to make room for moodboard images

  // Helper function to get moodboard images by style preference
  const getMoodboardImagesByStyle = (stylePreference: string, count: number = 6) => {
    // Map style preferences to moodboard collections
    const styleMapping = {
      'luxury-minimal': 'luxury-minimal',
      'editorial-bold': 'editorial-magazine', 
      'feminine-soft': 'pink-girly',
      'business-professional': 'business-professional',
      'creative-artistic': 'bohemian-creative',
      'wellness-calm': 'wellness-reiki'
    };

    const collectionId = styleMapping[stylePreference as keyof typeof styleMapping] || 'luxury-minimal';
    const collection = getMoodboardCollection(collectionId);
    
    if (!collection || !collection.images.length) {
      // Fallback to luxury minimal collection
      const fallbackCollection = getMoodboardCollection('luxury-minimal');
      return fallbackCollection?.images.slice(0, count) || [];
    }
    
    return collection.images.slice(0, count);
  };

  // Get moodboard flatlays based on brandbook style or default to luxury minimal
  const moodboardStyle = brandbook?.moodboardStyle || brandbook?.stylePreference || 'luxury-minimal';
  const moodboardFlatlays = getMoodboardImagesByStyle(moodboardStyle, 6);

  // Transform brandbook data for Executive Essence template
  const transformedBrandbook = {
    name: brandbook.businessName || 'Your Business',
    tagline: brandbook.tagline || 'Professional Excellence',
    logo: brandbook.businessName?.charAt(0) || 'L',
    story: brandbook.story || brandbook.brandStory || 'Your brand story goes here...',
    voice: {
      tone: brandbook.voiceTone || 'Professional and approachable',
      personality: brandbook.voicePersonality?.split(',').map((p: string) => p.trim()) || ['Professional', 'Trustworthy', 'Innovative'],
      dosDonts: {
        dos: brandbook.keyPhrases?.split(',').slice(0, 3) || ['Be authentic', 'Stay professional', 'Focus on value'],
        donts: ['Use jargon', 'Be overly casual', 'Make empty promises']
      }
    },
    fonts: {
      primary: brandbook.primaryFont || 'Times New Roman',
      secondary: brandbook.secondaryFont || 'Inter'
    },
    colors: [
      { name: 'Primary', hex: brandbook.primaryColor || '#0a0a0a', code: brandbook.primaryColor || '#0a0a0a' },
      { name: 'Secondary', hex: brandbook.secondaryColor || '#f5f5f5', code: brandbook.secondaryColor || '#f5f5f5' },
      { name: 'Accent', hex: brandbook.accentColor || '#666666', code: brandbook.accentColor || '#666666' },
      { name: 'Bronze', hex: '#8B6F5A', code: '#8B6F5A' }
    ],
    patterns: [
      SandraImages.flatlays.luxuryMinimal[0],
      SandraImages.flatlays.luxuryMinimal[1],
      SandraImages.flatlays.luxuryMinimal[2],
      SandraImages.flatlays.luxuryMinimal[3]
    ],
    applications: {
      businessCard: SandraImages.flatlays.luxuryMinimal[4],
      socialMedia: SandraImages.flatlays.luxuryMinimal[5],
      letterhead: SandraImages.flatlays.luxuryMinimal[6]
    }
  };

  // Combine AI images with moodboard collections for perfect editorial balance
  const combinedFlatlays = [
    ...userFlatlays, // User's AI lifestyle/business images first
    ...moodboardFlatlays, // Then curated moodboard images
    // Fallback to Sandra's images if needed
    ...SandraImages.flatlays.luxuryMinimal.slice(0, Math.max(0, 7 - userFlatlays.length - moodboardFlatlays.length))
  ].slice(0, 7); // Ensure we have exactly 7 images

  const userImages = {
    portraits: userPortraits.length > 0 ? userPortraits : [
      SandraImages.portraits.professional[0],
      SandraImages.portraits.professional[1],
      SandraImages.portraits.professional[2],
      SandraImages.portraits.professional[3]
    ],
    flatlays: combinedFlatlays
  };

  // Render different templates based on templateId
  if (templateId === 'refined-minimalist') {
    // Transform brandbook for Refined Minimalist template
    const refinedBrandbook = {
      ...transformedBrandbook,
      colors: {
        primary: [
          { name: 'Primary Black', hex: brandbook.primaryColor || '#0a0a0a', code: brandbook.primaryColor || '#0a0a0a', usage: 'Headlines, text, accents' },
          { name: 'Secondary Gray', hex: brandbook.secondaryColor || '#f5f5f5', code: brandbook.secondaryColor || '#f5f5f5', usage: 'Backgrounds, subtle elements' },
          { name: 'Accent Gray', hex: brandbook.accentColor || '#666666', code: brandbook.accentColor || '#666666', usage: 'Body text, captions' }
        ],
        secondary: [
          { name: 'Pure White', hex: '#ffffff', code: '#ffffff', usage: 'Clean backgrounds' },
          { name: 'Soft Gray', hex: '#e5e5e5', code: '#e5e5e5', usage: 'Borders, dividers' },
          { name: 'Warm Neutral', hex: '#f8f6f3', code: '#f8f6f3', usage: 'Soft backgrounds' }
        ]
      },
      fonts: {
        primary: {
          name: brandbook.primaryFont || 'Times New Roman',
          weight: 'Light, Regular',
          usage: 'Headlines, brand name, important text'
        },
        secondary: {
          name: brandbook.secondaryFont || 'Inter',
          weight: 'Regular, Medium',
          usage: 'Body text, captions, user interface'
        }
      },
      applications: {
        businessCard: SandraImages.flatlays.luxuryMinimal[4],
        socialMedia: SandraImages.flatlays.luxuryMinimal[5],
        letterhead: SandraImages.flatlays.luxuryMinimal[6],
        instagram: SandraImages.portraits.professional[0]
      }
    };
    
    return (
      <RefinedMinimalistBrandbook 
        brandbook={refinedBrandbook} 
        userImages={userImages} 
      />
    );
  }
  
  if (templateId === 'bold-femme') {
    // Transform brandbook for Bold Femme template
    const boldFemmeBrandbook = {
      businessName: brandbook.businessName || 'Your Business',
      tagline: brandbook.tagline || 'Emerald Excellence',
      primaryFont: brandbook.primaryFont || 'Times New Roman',
      secondaryFont: brandbook.secondaryFont || 'Inter',
      primaryColor: brandbook.primaryColor || '#2F4A3D',
      secondaryColor: brandbook.secondaryColor || '#6B8A74',
      accentColor: brandbook.accentColor || '#8B8680',
      voiceTone: brandbook.voiceTone,
      keyPhrases: brandbook.keyPhrases,
      story: brandbook.story || brandbook.brandStory || 'Crafting authentic experiences through bold, feminine design that empowers and inspires.'
    };
    
    return <BoldFemmeBrandbook brandbook={boldFemmeBrandbook} />;
  }

  if (templateId === 'luxe-feminine') {
    // Transform brandbook for Luxe Feminine template
    const luxeFeminineBrandbook = {
      businessName: brandbook.businessName || 'Your Business',
      tagline: brandbook.tagline || 'Luxe Elegance',
      script: brandbook.businessName || 'Your Business',
      monogram: brandbook.businessName?.charAt(0) || 'Y',
      story: brandbook.story || brandbook.brandStory || 'A story of elegance, sophistication, and feminine power.',
      manifesto: brandbook.manifesto || brandbook.voiceTone || 'Embracing femininity as strength, creating beauty with purpose.',
      voiceTone: brandbook.voiceTone,
      keyPhrases: brandbook.keyPhrases,
      primaryColor: brandbook.primaryColor || '#6B2D5C',
      secondaryColor: brandbook.secondaryColor || '#4A1E3A',
      accentColor: brandbook.accentColor || '#E8C4B8',
      primaryFont: brandbook.primaryFont || 'Times New Roman',
      secondaryFont: brandbook.secondaryFont || 'Inter'
    };
    
    return <LuxeFeminineBrandbook brandbook={luxeFeminineBrandbook} />;
  }

  if (templateId === 'executive-essence') {
    return (
      <ExecutiveEssenceBrandbook 
        brandbook={transformedBrandbook} 
        userImages={userImages} 
      />
    );
  }

  // Fallback to simple preview for other templates
  return (
    <div className="bg-white p-8 space-y-12">
      {/* Cover Page */}
      <div className="text-center space-y-6 border-b border-[#e5e5e5] pb-12">
        <div className="space-y-2">
          <h1 
            className="text-4xl font-light text-[#0a0a0a]" 
            style={{ fontFamily: brandbook.primaryFont || 'Times New Roman, serif' }}
          >
            {brandbook.businessName || 'Your Business Name'}
          </h1>
          <p className="text-xl text-[#666] tracking-wide">BRAND GUIDELINES</p>
        </div>
        
        {brandbook.tagline && (
          <p 
            className="text-lg text-[#0a0a0a] italic max-w-md mx-auto"
            style={{ fontFamily: brandbook.secondaryFont || 'Inter, sans-serif' }}
          >
            "{brandbook.tagline}"
          </p>
        )}
      </div>

      {/* Logo Section */}
      <div className="space-y-6">
        <h2 className="text-2xl font-light text-[#0a0a0a] border-b border-[#e5e5e5] pb-2" style={{ fontFamily: 'Times New Roman, serif' }}>
          LOGO
        </h2>
        <div className="grid grid-cols-2 gap-8">
          <div className="bg-white border border-[#e5e5e5] p-8 text-center">
            <div className="text-3xl font-light text-[#0a0a0a] mb-2" style={{ fontFamily: brandbook.primaryFont || 'Times New Roman, serif' }}>
              {brandbook.businessName || 'LOGO'}
            </div>
            <p className="text-xs text-[#666] uppercase tracking-wider">Primary Logo</p>
          </div>
          <div className="bg-[#0a0a0a] border border-[#e5e5e5] p-8 text-center">
            <div className="text-3xl font-light text-white mb-2" style={{ fontFamily: brandbook.primaryFont || 'Times New Roman, serif' }}>
              {brandbook.businessName || 'LOGO'}
            </div>
            <p className="text-xs text-[#ccc] uppercase tracking-wider">Reverse Logo</p>
          </div>
        </div>
      </div>

      {/* Color Palette */}
      <div className="space-y-6">
        <h2 className="text-2xl font-light text-[#0a0a0a] border-b border-[#e5e5e5] pb-2" style={{ fontFamily: 'Times New Roman, serif' }}>
          COLOR PALETTE
        </h2>
        <div className="grid grid-cols-3 gap-6">
          <div className="text-center">
            <div 
              className="w-full h-24 border border-[#e5e5e5] mb-3"
              style={{ backgroundColor: brandbook.primaryColor || '#0a0a0a' }}
            />
            <p className="text-sm font-medium text-[#0a0a0a]">PRIMARY</p>
            <p className="text-xs text-[#666] font-mono">{brandbook.primaryColor || '#0a0a0a'}</p>
          </div>
          <div className="text-center">
            <div 
              className="w-full h-24 border border-[#e5e5e5] mb-3"
              style={{ backgroundColor: brandbook.secondaryColor || '#ffffff' }}
            />
            <p className="text-sm font-medium text-[#0a0a0a]">SECONDARY</p>
            <p className="text-xs text-[#666] font-mono">{brandbook.secondaryColor || '#ffffff'}</p>
          </div>
          <div className="text-center">
            <div 
              className="w-full h-24 border border-[#e5e5e5] mb-3"
              style={{ backgroundColor: brandbook.accentColor || '#f5f5f5' }}
            />
            <p className="text-sm font-medium text-[#0a0a0a]">ACCENT</p>
            <p className="text-xs text-[#666] font-mono">{brandbook.accentColor || '#f5f5f5'}</p>
          </div>
        </div>
      </div>

      {/* Typography */}
      <div className="space-y-6">
        <h2 className="text-2xl font-light text-[#0a0a0a] border-b border-[#e5e5e5] pb-2" style={{ fontFamily: 'Times New Roman, serif' }}>
          TYPOGRAPHY
        </h2>
        <div className="grid grid-cols-2 gap-8">
          <div>
            <p className="text-sm font-medium text-[#0a0a0a] mb-3 uppercase tracking-wider">Primary Font</p>
            <div style={{ fontFamily: brandbook.primaryFont || 'Times New Roman, serif' }}>
              <p className="text-3xl text-[#0a0a0a] mb-2">Headlines</p>
              <p className="text-xl text-[#0a0a0a] mb-2">Subheadings</p>
              <p className="text-[#666]">{brandbook.primaryFont || 'Times New Roman'}</p>
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-[#0a0a0a] mb-3 uppercase tracking-wider">Secondary Font</p>
            <div style={{ fontFamily: brandbook.secondaryFont || 'Inter, sans-serif' }}>
              <p className="text-lg text-[#0a0a0a] mb-2">Body text and paragraphs</p>
              <p className="text-base text-[#0a0a0a] mb-2">Navigation and UI elements</p>
              <p className="text-[#666]">{brandbook.secondaryFont || 'Inter'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Brand Voice */}
      {brandbook.voiceTone && (
        <div className="space-y-6">
          <h2 className="text-2xl font-light text-[#0a0a0a] border-b border-[#e5e5e5] pb-2" style={{ fontFamily: 'Times New Roman, serif' }}>
            BRAND VOICE
          </h2>
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-[#0a0a0a] mb-2 uppercase tracking-wider">Tone & Personality</p>
              <p className="text-[#666] leading-relaxed">{brandbook.voiceTone}</p>
            </div>
            {brandbook.keyPhrases && (
              <div>
                <p className="text-sm font-medium text-[#0a0a0a] mb-2 uppercase tracking-wider">Key Phrases</p>
                <p className="text-[#666] leading-relaxed">{brandbook.keyPhrases}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Usage Guidelines */}
      <div className="space-y-6">
        <h2 className="text-2xl font-light text-[#0a0a0a] border-b border-[#e5e5e5] pb-2" style={{ fontFamily: 'Times New Roman, serif' }}>
          USAGE GUIDELINES
        </h2>
        <div className="grid grid-cols-2 gap-8">
          <div>
            <p className="text-sm font-medium text-[#0a0a0a] mb-3 uppercase tracking-wider">Do</p>
            <ul className="space-y-2 text-[#666]">
              <li>• Use consistent spacing and alignment</li>
              <li>• Maintain color hierarchy</li>
              <li>• Keep fonts readable and clean</li>
              <li>• Follow brand voice guidelines</li>
            </ul>
          </div>
          <div>
            <p className="text-sm font-medium text-[#0a0a0a] mb-3 uppercase tracking-wider">Don't</p>
            <ul className="space-y-2 text-[#666]">
              <li>• Distort or skew the logo</li>
              <li>• Use colors outside the palette</li>
              <li>• Mix different font styles</li>
              <li>• Overcrowd design elements</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function BrandbookDesigner() {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [onboardingData, setOnboardingData] = useState<any>(null);
  const [sandraMessage, setSandraMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<Array<{role: string, content: string}>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState('executive-essence');
  
  // Generated brandbook state
  const [brandbook, setBrandbook] = useState<any>(null);

  // Fetch user's AI images
  const { data: aiImages = [] } = useQuery({
    queryKey: ['/api/ai-images'],
    enabled: isAuthenticated
  });

  // Load onboarding data
  useEffect(() => {
    const data = localStorage.getItem('brandbookOnboardingData');
    if (data) {
      const parsed = JSON.parse(data);
      setOnboardingData(parsed);
      
      // Generate initial brandbook based on onboarding
      generateInitialBrandbook(parsed);
      
      // Add initial Sandra message
      setChatHistory([{
        role: 'sandra',
        content: `Hi gorgeous! I've created your initial brandbook based on our chat. I can see you're in the ${parsed.industry} space and want a ${parsed.stylePreference} vibe - perfect! 

Take a look at what I've designed for ${parsed.businessName}. Want me to adjust the colors? Change the fonts? Make it more luxurious? Just tell me what feels right for your brand and I'll make it perfect.`
      }]);
    } else {
      // Redirect back to onboarding if no data
      setLocation('/brandbook-onboarding');
    }
  }, []);

  const generateInitialBrandbook = (data: any) => {
    // Generate smart defaults based on onboarding responses
    const styleMapping = {
      'luxury-minimal': {
        primaryFont: 'Times New Roman',
        secondaryFont: 'Inter',
        primaryColor: '#0a0a0a',
        secondaryColor: '#ffffff',
        accentColor: '#f5f5f5'
      },
      'editorial-bold': {
        primaryFont: 'Playfair Display',
        secondaryFont: 'Source Sans Pro',
        primaryColor: '#1a1a1a',
        secondaryColor: '#ffffff',
        accentColor: '#e5e5e5'
      },
      'feminine-soft': {
        primaryFont: 'Cormorant Garamond',
        secondaryFont: 'Lato',
        primaryColor: '#8b5a3c',
        secondaryColor: '#f4f1eb',
        accentColor: '#deb887'
      },
      'business-professional': {
        primaryFont: 'Georgia',
        secondaryFont: 'Arial',
        primaryColor: '#2c3e50',
        secondaryColor: '#ecf0f1',
        accentColor: '#3498db'
      },
      'creative-artistic': {
        primaryFont: 'Crimson Text',
        secondaryFont: 'Open Sans',
        primaryColor: '#4a5568',
        secondaryColor: '#f7fafc',
        accentColor: '#e2e8f0'
      },
      'wellness-calm': {
        primaryFont: 'Libre Baskerville',
        secondaryFont: 'Roboto',
        primaryColor: '#2d3748',
        secondaryColor: '#f7fafc',
        accentColor: '#38b2ac'
      }
    };

    const style = styleMapping[data.stylePreference as keyof typeof styleMapping] || styleMapping['luxury-minimal'];
    
    setBrandbook({
      businessName: data.businessName,
      tagline: generateTagline(data),
      story: data.brandStory,
      ...style,
      logoType: data.logoPreference,
      moodboardStyle: data.stylePreference,
      voiceTone: data.brandStory,
      keyPhrases: data.values,
      industry: data.industry,
      targetAudience: data.targetAudience
    });
  };

  const generateTagline = (data: any) => {
    // Simple tagline generation based on industry and goals
    const taglines = {
      'coaching': 'Transform Your Life, Achieve Your Dreams',
      'wellness': 'Nurture Your Body, Elevate Your Spirit',
      'beauty': 'Enhance Your Natural Beauty',
      'creative': 'Bringing Your Vision to Life',
      'business': 'Strategies That Drive Success',
      'fitness': 'Stronger Every Day',
      'lifestyle': 'Live Your Best Life',
      'tech': 'Innovation Meets Excellence',
      'education': 'Knowledge That Transforms'
    };
    
    return taglines[data.industry as keyof typeof taglines] || 'Excellence in Everything We Do';
  };

  // Chat with Sandra AI
  const sendMessage = async () => {
    if (!sandraMessage.trim() || isLoading) return;
    
    const userMessage = sandraMessage;
    setSandraMessage('');
    setIsLoading(true);
    
    // Add user message to chat
    const newChatHistory = [...chatHistory, { role: 'user', content: userMessage }];
    setChatHistory(newChatHistory);
    
    try {
      const response = await apiRequest('POST', '/api/sandra-ai-chat', {
        message: userMessage,
        context: 'brandbook-designer',
        brandbook: brandbook,
        onboardingData: onboardingData,
        chatHistory: newChatHistory
      });
      
      const result = await response.json();
      
      // Add Sandra's response
      setChatHistory(prev => [...prev, { role: 'sandra', content: result.message }]);
      
      // Apply any suggested changes to the brandbook
      if (result.brandbookUpdates) {
        setBrandbook((prev: any) => ({
          ...prev,
          ...result.brandbookUpdates
        }));
      }
      
      // Update template if Sandra suggests a different one
      if (result.templateSuggestion && result.templateSuggestion !== selectedTemplate) {
        setSelectedTemplate(result.templateSuggestion);
      }
      
    } catch (error) {
      console.error('Error chatting with Sandra:', error);
      toast({
        title: "Error",
        description: "Couldn't reach Sandra right now. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Save final brandbook
  const saveBrandbookMutation = useMutation({
    mutationFn: async () => {
      return apiRequest('POST', '/api/brandbook', {
        ...brandbook,
        templateType: selectedTemplate,
        onboardingData: onboardingData,
        finalVersion: true
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/brandbook'] });
      toast({
        title: "Brandbook Saved!",
        description: "Your complete brand identity is ready to use."
      });
      // Clear onboarding data
      localStorage.removeItem('brandbookOnboardingData');
      // Redirect to workspace
      setLocation('/workspace');
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to save your brandbook. Please try again.",
        variant: "destructive"
      });
    }
  });

  if (!onboardingData || !brandbook) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-[#0a0a0a] border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-[#666]">Sandra is preparing your brandbook...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      <HeroFullBleed 
        title="SANDRA AI"
        subtitle="DESIGNER"
        tagline="Your Personal Brand Designer"
        ctaText="Design Your Brand"
        backgroundImage={SandraImages.editorial.woman1}
      />

      {/* Split Layout - Sandra Chat on Left, Preview on Right */}
      <div className="flex min-h-screen">
        {/* Left Side - Sandra AI Chat */}
        <div className="w-1/2 border-r border-[#e5e5e5] flex flex-col">
          <div className="p-6 border-b border-[#e5e5e5]">
            <TemplateSelector 
              selectedTemplate={selectedTemplate} 
              onTemplateChange={setSelectedTemplate} 
            />
          </div>
          <div className="p-6 border-b border-[#e5e5e5]">
            <h2 className="text-2xl font-light text-[#0a0a0a] mb-2" style={{ fontFamily: 'Times New Roman, serif' }}>
              Chat with Sandra AI Designer
            </h2>
            <p className="text-[#666]">Tell me what you'd like to adjust about your brandbook</p>
          </div>
          
          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {chatHistory.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] p-4 ${
                    message.role === 'user'
                      ? 'bg-[#0a0a0a] text-white'
                      : 'bg-[#f5f5f5] text-[#0a0a0a]'
                  }`}
                >
                  {message.role === 'sandra' && (
                    <div className="text-xs font-medium mb-2 text-[#666] uppercase tracking-wider">
                      Sandra AI Designer
                    </div>
                  )}
                  <p className="whitespace-pre-wrap">{message.content}</p>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-[#f5f5f5] p-4 max-w-[80%]">
                  <div className="text-xs font-medium mb-2 text-[#666] uppercase tracking-wider">
                    Sandra AI Designer
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="animate-pulse">Sandra is thinking...</div>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Chat Input */}
          <div className="border-t border-[#e5e5e5] p-6">
            <div className="flex space-x-3">
              <input
                type="text"
                value={sandraMessage}
                onChange={(e) => setSandraMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="Ask Sandra to adjust colors, fonts, style..."
                className="flex-1 border border-[#e5e5e5] p-3 text-[#0a0a0a] bg-white"
                disabled={isLoading}
              />
              <button
                onClick={sendMessage}
                disabled={isLoading || !sandraMessage.trim()}
                className="bg-[#0a0a0a] text-white px-6 py-3 text-sm tracking-[0.2em] uppercase hover:bg-[#333] transition-colors disabled:bg-[#ccc] disabled:cursor-not-allowed"
              >
                Send
              </button>
            </div>
            
            {/* Save Button */}
            <div className="mt-6 pt-6 border-t border-[#e5e5e5]">
              <button
                onClick={() => saveBrandbookMutation.mutate()}
                disabled={saveBrandbookMutation.isPending}
                className="w-full bg-[#0a0a0a] text-white py-4 text-sm tracking-[0.3em] uppercase hover:bg-[#333] transition-colors disabled:bg-[#ccc] disabled:cursor-not-allowed"
              >
                {saveBrandbookMutation.isPending ? 'Saving Your Brandbook...' : 'Save My Brandbook'}
              </button>
            </div>
          </div>
        </div>

        {/* Right Side - Live Brandbook Preview */}
        <div className="w-1/2 bg-[#f5f5f5] overflow-y-auto">
          <div className="p-6 border-b border-[#e5e5e5]">
            <h2 className="text-2xl font-light text-[#0a0a0a]" style={{ fontFamily: 'Times New Roman, serif' }}>
              Your Brandbook Preview
            </h2>
          </div>
          
          <div className="p-6">
            <div className="bg-white shadow-lg">
              <BrandbookDesignPreview brandbook={brandbook} templateId={selectedTemplate} aiImages={aiImages} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
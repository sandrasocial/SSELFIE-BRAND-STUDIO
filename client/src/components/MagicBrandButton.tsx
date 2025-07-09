import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';

interface MagicBrandButtonProps {
  onComplete?: () => void;
}

export function MagicBrandButton({ onComplete }: MagicBrandButtonProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [isGenerating, setIsGenerating] = useState(false);

  // Get user's onboarding data
  const { data: onboardingData } = useQuery({
    queryKey: ['/api/onboarding', user?.id],
    enabled: !!user?.id,
  });

  // Get user's AI images
  const { data: aiImages } = useQuery({
    queryKey: ['/api/ai-images', user?.id],
    enabled: !!user?.id,
  });

  // Smart template selection based on onboarding answers
  const selectOptimalTemplate = (onboarding: any) => {
    if (!onboarding) return 'executive-essence';

    const businessType = onboarding.businessType?.toLowerCase() || '';
    const brandVibe = onboarding.brandVibe?.toLowerCase() || '';
    const stylePreferences = onboarding.stylePreferences?.toLowerCase() || '';

    // Template selection logic based on Sandra's user research
    if (businessType.includes('coach') || businessType.includes('consultant') || businessType.includes('executive')) {
      return 'executive-essence';
    }
    
    if (brandVibe.includes('creative') || brandVibe.includes('artistic') || stylePreferences.includes('editorial')) {
      return 'refined-minimalist';
    }
    
    if (brandVibe.includes('nature') || brandVibe.includes('wellness') || brandVibe.includes('sustainable')) {
      return 'bold-femme';
    }
    
    if (brandVibe.includes('feminine') || brandVibe.includes('luxury') || brandVibe.includes('beauty')) {
      return 'luxe-feminine';
    }

    // Default to executive essence for professional businesses
    return 'executive-essence';
  };

  // Generate personalized brand data
  const generateBrandData = (onboarding: any, template: string) => {
    const brandData = {
      templateId: template,
      businessName: onboarding.businessName || `${user?.firstName || 'Your'} Brand`,
      brandStory: onboarding.brandStory || 'Your unique story of transformation and growth.',
      targetClient: onboarding.targetClient || 'Women ready to transform their lives.',
      brandVibe: onboarding.brandVibe || 'Authentic and powerful',
      brandMessage: generateBrandMessage(onboarding, template),
      brandValues: generateBrandValues(onboarding),
      brandPersonality: generateBrandPersonality(onboarding),
      logoVariations: generateLogoVariations(onboarding.businessName || 'Your Brand'),
      colorStory: generateColorStory(template),
      typographyRationale: generateTypographyRationale(template),
      voiceGuidelines: generateVoiceGuidelines(onboarding),
      applicationExamples: generateApplicationExamples(onboarding.businessType)
    };

    return brandData;
  };

  const generateBrandMessage = (onboarding: any, template: string) => {
    const businessType = onboarding.businessType || 'business';
    const brandVibe = onboarding.brandVibe || 'authentic';
    
    const messages = {
      'executive-essence': `Sophisticated ${businessType} solutions for the ${brandVibe} leader.`,
      'refined-minimalist': `Editorial excellence meets ${brandVibe} storytelling.`,
      'bold-femme': `Nature-inspired ${businessType} with ${brandVibe} energy.`,
      'luxe-feminine': `Luxury ${businessType} designed for the ${brandVibe} woman.`
    };

    return messages[template] || messages['executive-essence'];
  };

  const generateBrandValues = (onboarding: any) => {
    const values = ['Authenticity', 'Excellence', 'Innovation'];
    
    if (onboarding.brandVibe?.includes('sustainable')) values.push('Sustainability');
    if (onboarding.brandVibe?.includes('empowerment')) values.push('Empowerment');
    if (onboarding.brandVibe?.includes('luxury')) values.push('Luxury');
    if (onboarding.brandVibe?.includes('creative')) values.push('Creativity');
    
    return values.slice(0, 4);
  };

  const generateBrandPersonality = (onboarding: any) => {
    const base = ['Professional', 'Approachable', 'Confident'];
    const vibe = onboarding.brandVibe || '';
    
    if (vibe.includes('creative')) base.push('Innovative');
    if (vibe.includes('luxury')) base.push('Sophisticated');
    if (vibe.includes('nature')) base.push('Grounded');
    if (vibe.includes('feminine')) base.push('Elegant');
    
    return base.slice(0, 4);
  };

  const generateLogoVariations = (businessName: string) => {
    return [
      { type: 'Primary', description: `${businessName} in elegant serif typography` },
      { type: 'Secondary', description: `${businessName} in clean sans-serif` },
      { type: 'Icon', description: `Minimalist ${businessName} symbol` },
      { type: 'Stacked', description: `${businessName} in vertical layout` }
    ];
  };

  const generateColorStory = (template: string) => {
    const stories = {
      'executive-essence': 'A sophisticated palette that commands respect and exudes quiet confidence.',
      'refined-minimalist': 'Editorial blacks and whites with subtle grays for timeless elegance.',
      'bold-femme': 'Emerald and sage greens inspired by nature\'s powerful yet nurturing energy.',
      'luxe-feminine': 'Burgundy and blush tones that celebrate femininity as a source of strength.'
    };
    
    return stories[template] || stories['executive-essence'];
  };

  const generateTypographyRationale = (template: string) => {
    const rationales = {
      'executive-essence': 'Clean serif headlines paired with modern sans-serif body text for professional authority.',
      'refined-minimalist': 'Times New Roman for editorial sophistication with Inter for perfect readability.',
      'bold-femme': 'Elegant serif with script accents to balance strength and femininity.',
      'luxe-feminine': 'Sophisticated serif with elegant script details for luxury positioning.'
    };
    
    return rationales[template] || rationales['executive-essence'];
  };

  const generateVoiceGuidelines = (onboarding: any) => {
    const baseVoice = {
      tone: 'Professional yet approachable',
      personality: 'Confident and authentic',
      language: 'Clear and inspiring',
      avoid: 'Jargon and overly technical terms'
    };

    if (onboarding.brandVibe?.includes('luxury')) {
      baseVoice.tone = 'Sophisticated and refined';
      baseVoice.personality = 'Elegant and authoritative';
    }

    if (onboarding.brandVibe?.includes('creative')) {
      baseVoice.tone = 'Inspiring and innovative';
      baseVoice.personality = 'Creative and forward-thinking';
    }

    return baseVoice;
  };

  const generateApplicationExamples = (businessType: string) => {
    const examples = {
      'coach': ['Business cards', 'Workbooks', 'Social media templates', 'Website headers'],
      'consultant': ['Presentations', 'Proposals', 'LinkedIn banners', 'Email signatures'],
      'service': ['Brochures', 'Service menus', 'Appointment cards', 'Thank you cards'],
      'product': ['Product packaging', 'Labels', 'Marketing materials', 'Trade show displays']
    };

    const type = businessType?.toLowerCase() || 'service';
    const matchedType = Object.keys(examples).find(key => type.includes(key)) || 'service';
    
    return examples[matchedType] || examples.service;
  };

  const generateBrandMutation = useMutation({
    mutationFn: async () => {
      if (!onboardingData) throw new Error('Onboarding data not available');
      
      const selectedTemplate = selectOptimalTemplate(onboardingData);
      const brandData = generateBrandData(onboardingData, selectedTemplate);
      
      // Create brandbook with generated data
      const response = await apiRequest('POST', '/api/brandbooks', brandData);
      return { brandbook: response, template: selectedTemplate };
    },
    onSuccess: ({ brandbook, template }) => {
      setIsGenerating(false);
      toast({
        title: "Magic Brand Created!",
        description: `Your ${template.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')} brandbook is ready.`,
      });
      
      // Navigate to brandbook designer with the generated brandbook
      setLocation('/brandbook-designer');
      onComplete?.();
    },
    onError: (error) => {
      setIsGenerating(false);
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate your brand. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleMagicGeneration = async () => {
    if (!onboardingData) {
      toast({
        title: "Complete Onboarding First",
        description: "Please complete your brand questionnaire before generating your brand.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    
    // Show preview of what's being generated
    const selectedTemplate = selectOptimalTemplate(onboardingData);
    const templateNames = {
      'executive-essence': 'Executive Essence',
      'refined-minimalist': 'Refined Minimalist',
      'bold-femme': 'Bold Femme',
      'luxe-feminine': 'Luxe Feminine'
    };

    toast({
      title: "Generating Your Brand...",
      description: `Creating your ${templateNames[selectedTemplate]} brandbook based on your answers.`,
    });

    // Start generation after short delay for better UX
    setTimeout(() => {
      generateBrandMutation.mutate();
    }, 1000);
  };

  const isReady = onboardingData && !isGenerating;

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 
          className="text-4xl md:text-5xl font-light mb-6 text-[#0a0a0a]"
          style={{ fontFamily: 'Times New Roman, serif' }}
        >
          Magic Brand Generator
        </h1>
        <p className="text-lg text-[#666] max-w-2xl mx-auto mb-8">
          Based on your onboarding answers, I'll create your complete brand identity in seconds. 
          No complex decisions, just beautiful results.
        </p>
      </div>

      {/* Preview Section */}
      {onboardingData && (
        <div className="bg-[#f5f5f5] p-8 rounded-sm mb-8">
          <h3 
            className="text-xl font-light mb-4 text-[#0a0a0a]"
            style={{ fontFamily: 'Times New Roman, serif' }}
          >
            What I'll Create for You
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-[#0a0a0a] mb-2">Template Selection</h4>
              <p className="text-[#666] text-sm">
                {(() => {
                  const template = selectOptimalTemplate(onboardingData);
                  const templateNames = {
                    'executive-essence': 'Executive Essence - Perfect for your professional leadership brand',
                    'refined-minimalist': 'Refined Minimalist - Ideal for your editorial creative vision',
                    'bold-femme': 'Bold Femme - Suited for your nature-inspired business',
                    'luxe-feminine': 'Luxe Feminine - Designed for your luxury feminine brand'
                  };
                  return templateNames[template] || templateNames['executive-essence'];
                })()}
              </p>
            </div>
            <div>
              <h4 className="font-medium text-[#0a0a0a] mb-2">Brand Elements</h4>
              <ul className="text-[#666] text-sm space-y-1">
                <li>• Complete color palette and story</li>
                <li>• Logo variations and usage guidelines</li>
                <li>• Typography system with rationale</li>
                <li>• Voice guidelines based on your vibe</li>
                <li>• Application examples for your business</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Magic Button */}
      <div className="text-center">
        <button
          onClick={handleMagicGeneration}
          disabled={!isReady}
          className={`
            px-12 py-4 text-sm font-medium tracking-widest transition-all duration-300
            ${isReady 
              ? 'bg-[#0a0a0a] text-white hover:bg-[#333] cursor-pointer' 
              : 'bg-[#e5e5e5] text-[#999] cursor-not-allowed'
            }
          `}
          style={{ letterSpacing: '0.3em' }}
        >
          {isGenerating ? 'GENERATING YOUR BRAND...' : 'CREATE MY BRAND'}
        </button>
        
        {!onboardingData && (
          <p className="text-sm text-[#666] mt-4">
            Complete your onboarding first to use Magic Brand Generator
          </p>
        )}
      </div>

      {/* Chat Enhancement Note */}
      <div className="mt-12 p-6 border border-[#e5e5e5] text-center">
        <p className="text-[#666] text-sm mb-2">
          After generation, you can chat with Sandra AI to make any adjustments
        </p>
        <p className="text-xs text-[#999]">
          "Make it more elegant" • "Change the colors" • "Add more personality"
        </p>
      </div>
    </div>
  );
}
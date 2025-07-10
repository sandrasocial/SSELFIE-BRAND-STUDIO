import type { Express } from "express";
import { storage } from "../storage";
import { isAuthenticated } from "../replitAuth";

export function registerStyleguideRoutes(app: Express) {
  // Get user's styleguide - DEMO VERSION with mock data
  app.get("/api/styleguide/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      
      // Return demo styleguide for testing
      if (userId === "demo123") {
        const demoStyleguide = {
          id: 1,
          userId: "demo123",
          templateId: "refined-minimal",
          title: "Sarah Johnson",
          subtitle: "Strategic Brand Consultant",
          personalMission: "Empowering women entrepreneurs to build authentic, profitable brands that reflect their true essence and create meaningful impact in the world.",
          brandVoice: "Warm, professional, and inspiring with an authentic, conversational tone that makes complex business concepts feel accessible and achievable.",
          targetAudience: "Ambitious women entrepreneurs ready to elevate their brand and scale their business with authentic, strategic positioning.",
          visualStyle: "Refined minimal with editorial sophistication",
          colorPalette: {
            primary: "#0a0a0a",
            secondary: "#ffffff",
            accent: "#f5f5f5",
            neutral: "#666666"
          },
          typography: {
            headline: "Times New Roman",
            subheading: "Times New Roman", 
            body: "System Sans-Serif",
            accent: "System Sans-Serif"
          },
          imageSelections: {
            heroImage: "https://i.postimg.cc/VLCFmXVr/1.png",
            portraitImages: [
              "https://i.postimg.cc/VLCFmXVr/1.png",
              "https://i.postimg.cc/WpDyqFyj/10.png",
              "https://i.postimg.cc/SRz1B3Hk/11.png"
            ],
            lifestyleImages: [
              "https://i.postimg.cc/VLCFmXVr/1.png",
              "https://i.postimg.cc/WpDyqFyj/10.png",
              "https://i.postimg.cc/SRz1B3Hk/11.png",
              "https://i.postimg.cc/VLCFmXVr/1.png"
            ]
          },
          brandPersonality: {
            traits: ["Authentic", "Professional", "Inspiring", "Strategic", "Warm", "Confident"],
            keywords: ["Authentic", "Strategic", "Inspiring"],
            vibe: "Refined Minimal Professional"
          },
          businessApplications: {
            primaryService: "Strategic Brand Consulting",
            priceRange: "Premium Investment",
            clientExperience: "Transformational & Personal"
          },
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        return res.json(demoStyleguide);
      }
      
      // For real database when ready
      // const styleguide = await storage.getUserStyleguide(userId);
      // if (!styleguide) {
      //   return res.status(404).json({ message: "Styleguide not found" });
      // }
      // res.json(styleguide);
      
      res.status(404).json({ message: "Styleguide not found" });
    } catch (error) {
      console.error("Error fetching styleguide:", error);
      res.status(500).json({ message: "Failed to fetch styleguide" });
    }
  });

  // Create or update user's styleguide (SANDRA AI endpoint)
  app.post("/api/styleguide", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user?.claims?.sub;
      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }

      const styleguideData = req.body;
      const styleguide = await storage.createOrUpdateStyleguide(userId, styleguideData);
      
      res.json(styleguide);
    } catch (error) {
      console.error("Error creating styleguide:", error);
      res.status(500).json({ message: "Failed to create styleguide" });
    }
  });

  // Get styleguide templates for SANDRA AI
  app.get("/api/styleguide-templates", async (req, res) => {
    try {
      const templates = await storage.getStyleguideTemplates();
      res.json(templates);
    } catch (error) {
      console.error("Error fetching templates:", error);
      res.status(500).json({ message: "Failed to fetch templates" });
    }
  });

  // SANDRA AI chat endpoint for styleguide creation/editing
  app.post("/api/sandra/styleguide-chat", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const { message, currentStyleguide } = req.body;
      
      // Get user's complete context
      const onboardingData = await storage.getOnboardingData(userId);
      const aiImages = await storage.getUserAIImages(userId);
      const uploadedImages = await storage.getUserUploadedImages(userId);
      
      // Generate SANDRA AI response for styleguide creation/editing
      const response = await generateSandraStyleguideResponse({
        message,
        userId,
        onboardingData,
        aiImages,
        uploadedImages,
        currentStyleguide
      });
      
      res.json(response);
    } catch (error) {
      console.error("Error in SANDRA styleguide chat:", error);
      res.status(500).json({ message: "Failed to process styleguide request" });
    }
  });
}

// SANDRA AI generates personalized styleguide responses
async function generateSandraStyleguideResponse(context: any) {
  const { message, onboardingData, aiImages, uploadedImages, currentStyleguide } = context;
  
  // Build context for SANDRA AI
  const userContext = `
User Context:
- Personal Mission: ${onboardingData?.personalMission || 'Not specified'}
- Business Goals: ${onboardingData?.businessGoals || 'Not specified'}
- Brand Voice: ${onboardingData?.brandVoice || 'Not specified'}
- Target Audience: ${onboardingData?.targetAudience || 'Not specified'}
- Style Preferences: ${onboardingData?.stylePreferences || 'Not specified'}
- Available AI Images: ${aiImages?.length || 0} professional portraits
- Available Uploaded Images: ${uploadedImages?.length || 0} personal photos
- Current Styleguide: ${currentStyleguide ? 'Existing' : 'None'}
`;

  // Determine if this is a creation or modification request
  const isCreation = !currentStyleguide && message.toLowerCase().includes('create');
  const isModification = currentStyleguide && (
    message.toLowerCase().includes('change') || 
    message.toLowerCase().includes('update') ||
    message.toLowerCase().includes('modify')
  );

  if (isCreation) {
    return {
      type: 'styleguide_creation',
      message: generateCreationResponse(onboardingData),
      styleguideData: generateInitialStyleguide(onboardingData, aiImages, uploadedImages),
      suggestions: [
        'Adjust color palette',
        'Change typography style', 
        'Modify brand personality',
        'Update visual layout'
      ]
    };
  }

  if (isModification) {
    return {
      type: 'styleguide_modification',
      message: generateModificationResponse(message, currentStyleguide),
      styleguideUpdates: generateStyleguideUpdates(message, currentStyleguide),
      suggestions: [
        'Preview changes',
        'Try different template',
        'Adjust specific section',
        'Reset to original'
      ]
    };
  }

  return {
    type: 'general_response',
    message: generateGeneralResponse(message, userContext),
    suggestions: [
      'Create my styleguide',
      'Show template options',
      'Explain styleguide benefits',
      'View examples'
    ]
  };
}

function generateCreationResponse(onboardingData: any): string {
  const personalMission = onboardingData?.personalMission || 'your unique mission';
  const businessGoals = onboardingData?.businessGoals || 'your business aspirations';
  
  return `Perfect! I'm creating your personalized styleguide based on ${personalMission} and ${businessGoals}. 

I've selected the ideal template that matches your brand personality and will showcase your AI portraits beautifully. Your styleguide will include:

• Visual identity with your AI-generated portraits
• Personal color palette reflecting your style
• Typography that speaks your brand voice
• Brand personality traits and messaging
• Business applications for your services

This becomes your visual brand bible - everything you need to show up confidently and consistently online.`;
}

function generateModificationResponse(message: string, currentStyleguide: any): string {
  return `I hear you! Let me adjust your styleguide based on what you're asking for. 

Your current ${currentStyleguide.templateId} template is beautiful, and I can definitely make those changes while keeping everything cohesive.

What specific aspect would you like me to focus on first?`;
}

function generateGeneralResponse(message: string, userContext: string): string {
  return `I'm here to help you create your personalized styleguide! 

Think of it as your visual brand bible - a beautiful, professional page that showcases who you are, what you stand for, and how you want to be seen online.

Using your AI portraits, personal story, and brand preferences, I'll create something uniquely yours that you can use for:
• Social media consistency
• Website branding
• Client presentations
• Business materials

Ready to create something amazing together?`;
}

function generateInitialStyleguide(onboardingData: any, aiImages: any[], uploadedImages: any[]) {
  // Select template based on user preferences
  const templateId = selectTemplate(onboardingData);
  
  // Build initial styleguide structure
  return {
    templateId,
    title: extractBusinessName(onboardingData) || 'Personal Brand',
    subtitle: onboardingData?.tagline || '',
    personalMission: onboardingData?.personalMission || '',
    brandVoice: onboardingData?.brandVoice || '',
    targetAudience: onboardingData?.targetAudience || '',
    visualStyle: onboardingData?.stylePreferences || '',
    colorPalette: generateColorPalette(templateId, onboardingData),
    typography: generateTypography(templateId),
    imageSelections: selectImages(aiImages, uploadedImages, templateId),
    brandPersonality: generateBrandPersonality(onboardingData),
    businessApplications: generateBusinessApplications(onboardingData),
    isActive: true
  };
}

function selectTemplate(onboardingData: any): string {
  const stylePrefs = onboardingData?.stylePreferences?.toLowerCase() || '';
  const businessType = onboardingData?.businessType?.toLowerCase() || '';
  
  if (stylePrefs.includes('minimal') || stylePrefs.includes('clean')) {
    return 'refined-minimal';
  }
  if (stylePrefs.includes('luxury') || stylePrefs.includes('elegant')) {
    return 'luxe-feminine';
  }
  if (stylePrefs.includes('bold') || stylePrefs.includes('nature')) {
    return 'bold-femme';
  }
  if (businessType.includes('executive') || businessType.includes('corporate')) {
    return 'executive-essence';
  }
  
  return 'refined-minimal'; // Default
}

function generateColorPalette(templateId: string, onboardingData: any) {
  const palettes = {
    'refined-minimal': {
      primary: '#0a0a0a',
      secondary: '#ffffff', 
      accent: '#f5f5f5',
      neutral: '#666666'
    },
    'luxe-feminine': {
      primary: '#8B0000',
      secondary: '#F5F5DC',
      accent: '#D2B48C',
      neutral: '#2F2F2F'
    },
    'bold-femme': {
      primary: '#2E8B57',
      secondary: '#F0FFF0',
      accent: '#98FB98',
      neutral: '#556B2F'
    },
    'executive-essence': {
      primary: '#000080',
      secondary: '#F8F8FF',
      accent: '#C0C0C0',
      neutral: '#2F4F4F'
    }
  };
  
  return palettes[templateId as keyof typeof palettes] || palettes['refined-minimal'];
}

function generateTypography(templateId: string) {
  return {
    headline: 'Times New Roman',
    subheading: 'Times New Roman',
    body: 'System Sans-Serif',
    accent: 'System Sans-Serif'
  };
}

function selectImages(aiImages: any[], uploadedImages: any[], templateId: string) {
  // Smart image selection based on available images and template
  const heroImage = aiImages?.[0]?.imageUrl || uploadedImages?.[0]?.url || null;
  const portraitImages = aiImages?.slice(0, 3).map(img => img.imageUrl) || [];
  const lifestyleImages = uploadedImages?.slice(0, 4).map(img => img.url) || [];
  
  return {
    heroImage,
    portraitImages,
    lifestyleImages,
    flatlayImages: [] // Will be populated from moodboard collections
  };
}

function generateBrandPersonality(onboardingData: any) {
  const brandVoice = onboardingData?.brandVoice || '';
  const stylePrefs = onboardingData?.stylePreferences || '';
  
  // Extract personality traits from brand voice and style
  const traits = extractPersonalityTraits(brandVoice, stylePrefs);
  
  return {
    traits,
    keywords: traits.slice(0, 3),
    vibe: stylePrefs || 'Authentic & Professional'
  };
}

function generateBusinessApplications(onboardingData: any) {
  return {
    primaryService: onboardingData?.businessGoals || 'Personal Branding',
    priceRange: 'Premium Investment',
    clientExperience: 'Luxury & Personal'
  };
}

function extractPersonalityTraits(brandVoice: string, stylePrefs: string): string[] {
  const defaultTraits = ['Authentic', 'Professional', 'Confident', 'Inspiring', 'Genuine', 'Elegant'];
  
  // Smart extraction based on user input
  const combinedText = `${brandVoice} ${stylePrefs}`.toLowerCase();
  const extractedTraits = [];
  
  if (combinedText.includes('warm')) extractedTraits.push('Warm');
  if (combinedText.includes('professional')) extractedTraits.push('Professional');
  if (combinedText.includes('creative')) extractedTraits.push('Creative');
  if (combinedText.includes('luxury')) extractedTraits.push('Luxurious');
  if (combinedText.includes('minimal')) extractedTraits.push('Refined');
  if (combinedText.includes('bold')) extractedTraits.push('Bold');
  
  return extractedTraits.length > 0 ? extractedTraits : defaultTraits.slice(0, 6);
}

function extractBusinessName(onboardingData: any): string | null {
  // Extract business name from various fields
  const personalMission = onboardingData?.personalMission || '';
  const businessGoals = onboardingData?.businessGoals || '';
  
  // Simple extraction logic - can be enhanced
  if (businessGoals.includes('coaching')) return 'Coaching Practice';
  if (businessGoals.includes('consulting')) return 'Consulting';
  if (businessGoals.includes('photography')) return 'Photography Studio';
  
  return null;
}

function generateStyleguideUpdates(message: string, currentStyleguide: any) {
  // Parse user request and generate appropriate updates
  const updates: any = {};
  
  if (message.toLowerCase().includes('color')) {
    // Color change request
    updates.colorPalette = generateAlternativeColorPalette(currentStyleguide.templateId);
  }
  
  if (message.toLowerCase().includes('template')) {
    // Template change request
    updates.templateId = suggestAlternativeTemplate(currentStyleguide.templateId);
  }
  
  return updates;
}

function generateAlternativeColorPalette(currentTemplateId: string) {
  // Generate alternative color palette
  const alternatives = {
    'refined-minimal': {
      primary: '#2C2C2C',
      secondary: '#FAFAFA',
      accent: '#E8E8E8',
      neutral: '#888888'
    }
  };
  
  return alternatives[currentTemplateId as keyof typeof alternatives] || null;
}

function suggestAlternativeTemplate(currentTemplateId: string): string {
  const alternatives = {
    'refined-minimal': 'luxe-feminine',
    'luxe-feminine': 'bold-femme',
    'bold-femme': 'executive-essence',
    'executive-essence': 'refined-minimal'
  };
  
  return alternatives[currentTemplateId as keyof typeof alternatives] || 'refined-minimal';
}
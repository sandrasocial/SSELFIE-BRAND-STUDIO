/**
 * MEMBER MAYA - Personal Brand Photographer & Style Expert  
 * Dedicated personality for member-facing chat interface
 * Completely separate from Admin Maya (consulting agents)
 */

export const MEMBER_MAYA_PERSONALITY = {
  name: "Maya",
  role: "Personal Brand Photographer & Style Expert",
  
  // WHO IS MAYA - Core identity and mission
  identity: {
    type: "Personal Brand Photographer & Style Expert",
    vibe: "A knowledgeable friend who genuinely wants you to look your best",
    mission: "Help users create photos that tell their personal brand story authentically",
    focus: "Warm best friend who talks like your closest girlfriend who genuinely cares"
  },

  // COMMUNICATION STYLE - Natural everyday language
  voice: {
    style: "Warm best friend energy with fashion expertise",
    energy: "Encouraging and supportive, genuinely excited about fashion", 
    examples: [
      "This is going to be gorgeous!",
      "Trust me on this one",
      "This screams YOU", 
      "You're going to look incredible",
      "These photos will kill it on Instagram",
      "This style is so Pinterest right now",
      "People won't be able to stop looking"
    ]
  },

  // 2025 FASHION EXPERTISE - Current trending elements that photograph beautifully
  expertise: {
    trends: [
      "Expensive Looking: Clean minimalist pieces that look high-end",
      "Big Coats Energy: Oversized outerwear, dramatic silhouettes, leather pieces",
      "Natural Beauty: Slicked-back hair, barely-there makeup, glowing skin",
      "Girly Details: Bows, ribbons, feminine romantic touches",
      "Effortless Chic: Linen pieces, neutral tones, relaxed elegance", 
      "Bold & Bright: Eye-catching colors that pop on social media",
      "Power Pieces: Statement blazers with feminine styling",
      "Pinterest Perfect: That curated casual look everyone saves",
      "Dreamy Romantic: Flowing fabrics, soft textures, ethereal vibes",
      "School Girl Cool: Modern prep with a fresh twist",
      "Black & White Magic: Timeless monochrome for that editorial feel"
    ],
    
    personalBrandOutcomes: [
      "Photos that make people stop scrolling and hit follow immediately",
      "These will absolutely kill it on Instagram Stories",
      "The kind of pics that get saved to Pinterest boards", 
      "Photos where you look like the main character of your own life",
      "Photos where you look like the person everyone wants to be friends with",
      "These are the photos that make people wonder what you do for work",
      "Pictures that make people want to hire you or work with you"
    ],

    photoComposition: {
      "Close-up Portrait": "For headshots, professional profiles, personal connection",
      "Half Body": "For showcasing style, confident poses, social media", 
      "Full Scene": "For lifestyle content, storytelling, showing personality"
    }
  },

  // PROMPT CREATION RULES - Maya's signature technical structure (NEVER shown to users)
  promptRules: {
    structure: "raw photo, visible skin pores, film grain, unretouched natural skin texture, subsurface scattering, photographed on film, [TRIGGERWORD], [POETIC DESCRIPTION], [2025 FASHION], [NATURAL LIGHTING], [AUTHENTIC EMOTION]",
    
    poeticLanguage: {
      lighting: ["soft natural light", "window light", "golden hour warmth"],
      fashion: ["well-fitted", "quality materials", "effortless styling"],
      emotions: ["confident", "approachable", "thoughtful", "genuine"],
      environments: ["clean background", "natural setting", "professional space"]
    },
    
    requirements: [
      "Always include current 2025 fashion trends",
      "Use clear descriptive language for optimal generation", 
      "Focus on natural, authentic expressions",
      "Include proper anatomy fixes automatically",
      "Create exactly 1 image description per request",
      "Never show technical prompt structure to users"
    ],
    
    anatomyFixes: "detailed hands with perfect fingers, natural hand positioning, well-formed feet, accurate anatomy",
    
    naturalPoses: [
      "natural expression", "genuine smile", "thoughtful gaze",
      "confident look", "relaxed posture", "natural positioning"
    ]
  },

  // RESPONSE FORMAT - What users see vs. technical prompts 
  responseFormat: {
    userFacing: [
      "Understanding of what they want to achieve",
      "Why this style works for their goals", 
      "Clear explanation of what the photo will accomplish",
      "Encouraging and supportive tone",
      "Simple next steps"
    ],
    
    guidelines: {
      alwaysDo: [
        "Use warm, encouraging everyday language",
        "Reference current 2025 trends naturally", 
        "Connect photos to practical outcomes",
        "Be specific about what the photo achieves",
        "Keep technical details completely separate"
      ],
      neverDo: [
        "Show technical camera terms to users",
        "Use words like 'prompt' or 'generate' in chat",
        "Include technical photography specifications in conversation",
        "Be cold or overly corporate",
        "Create more than 1 image option per response"
      ]
    }
  }
};

/**
 * Generate Maya's response with proper separation of user chat and technical prompts
 */
export function generateMayaResponse(userMessage: string, chatHistory: any[] = []): {
  message: string;
  canGenerate: boolean;
  generatedPrompt?: string;
} {
  // Analyze user request for styling needs
  const message = userMessage.toLowerCase();
  
  // Determine if this is a generation request
  const canGenerate = message.includes('generate') || message.includes('create') || 
                     message.includes('photo') || message.includes('image') || 
                     message.includes('shoot') || message.includes('look') ||
                     message.includes('style') || message.includes('outfit');

  if (!canGenerate) {
    // General styling advice with Maya's personality
    return {
      message: generateGeneralStylingAdvice(userMessage),
      canGenerate: false
    };
  }

  // Generate prompts based on user request
  const styleAnalysis = analyzeStyleRequest(userMessage);
  const response = generateFullMayaResponse(styleAnalysis);
  
  return {
    message: response.userMessage,      // ✅ FIXED: Friendly chat only
    canGenerate: true,
    generatedPrompt: response.technicalPrompt  // ✅ FIXED: Technical prompt separate
  };
}

function analyzeStyleRequest(message: string): any {
  const message_lower = message.toLowerCase();
  
  // Determine style category based on user intent
  let category = 'professional_approachable';
  
  if (message_lower.includes('business') || message_lower.includes('professional') || 
      message_lower.includes('ceo') || message_lower.includes('corporate')) {
    category = 'professional_authoritative';
  } else if (message_lower.includes('casual') || message_lower.includes('everyday') ||
             message_lower.includes('relaxed') || message_lower.includes('comfortable')) {
    category = 'lifestyle_casual'; 
  } else if (message_lower.includes('elegant') || message_lower.includes('formal') ||
             message_lower.includes('sophisticated') || message_lower.includes('classy')) {
    category = 'elegant_sophisticated';
  } else if (message_lower.includes('creative') || message_lower.includes('artistic') ||
             message_lower.includes('unique') || message_lower.includes('expressive')) {
    category = 'creative_authentic';
  }

  return { category, originalMessage: message };
}

function generateFullMayaResponse(styleAnalysis: any): { userMessage: string; technicalPrompt: string } {
  const { category } = styleAnalysis;
  
  let userMessage = "";
  let technicalPrompt = "";

  switch (category) {
    case 'professional_authoritative':
      userMessage = `I know exactly what you mean - you want to look competent and trustworthy, but not intimidating or cold.

For professional but approachable, we'll focus on natural expressions and quality, simple pieces that photograph well. This will be perfect for LinkedIn or your website header - it says 'professional' immediately while still showing your personality.

This is going to look absolutely incredible! You'll have that perfect balance of authority and warmth that makes people want to work with you.`;

      technicalPrompt = `raw photo, visible skin pores, film grain, unretouched natural skin texture, subsurface scattering, photographed on film, [TRIGGERWORD], woman in well-fitted cream blazer with subtle confident expression, natural minimal makeup, soft window light creating even lighting across face, genuine professional demeanor, hair in polished but natural style, detailed hands with perfect fingers, natural hand positioning, well-formed feet, accurate anatomy, shot with shallow depth of field, clean neutral background, modern professional setting`;
      break;
      
    case 'lifestyle_casual':
      userMessage = `Love this vibe! You want those effortless chic photos that look Pinterest perfect - like you just threw on the most gorgeous outfit and happen to look incredible.

This captures your authentic, approachable side while keeping you looking incredibly put-together. These are perfect for social media or about pages where you want to show your personality.

This style is so on-trend right now - that curated casual look that seems effortless but is absolutely perfect. You're going to look amazing!`;

      technicalPrompt = `raw photo, visible skin pores, film grain, unretouched natural skin texture, subsurface scattering, photographed on film, [TRIGGERWORD], woman in quality neutral cashmere sweater and well-fitted jeans, natural relaxed expression, soft natural lighting from large windows, effortless styling with natural textures, genuine warm smile, detailed hands with perfect fingers, natural hand positioning, well-formed feet, accurate anatomy, contemporary casual setting with clean aesthetic, morning light creating gentle shadows`;
      break;
      
    case 'elegant_sophisticated':
      userMessage = `Oh my goodness, yes! You want that timeless elegance that never goes out of style - sophisticated and refined with just the right touch of mystery.

This shows your refined, feminine side with that elegant quality that draws people in. Perfect for when you need to look polished and put-together for important events or high-end content.

This is giving me major elegant vibes! You'll look like you stepped out of a luxury magazine - absolutely stunning and so sophisticated.`;

      technicalPrompt = `raw photo, visible skin pores, film grain, unretouched natural skin texture, subsurface scattering, photographed on film, [TRIGGERWORD], woman in elegant silk blouse in champagne tone, refined natural expression, soft directional lighting creating gentle shadows, timeless sophisticated styling, thoughtful genuine gaze, detailed hands with perfect fingers, natural hand positioning, well-formed feet, accurate anatomy, classic refined environment, ethereal window light creating luminous quality`;
      break;
      
    case 'creative_authentic':
      userMessage = `I absolutely love this direction! You want photos that show your creative spirit and unique personality - authentic and expressive while still looking polished and professional.

This captures your artistic side perfectly while keeping you looking put-together and professional. Great for creative portfolios, artistic brands, or when you want to show your innovative thinking.

This is going to be so uniquely YOU! Creative, authentic, and absolutely beautiful - the kind of photos that make people curious about your story.`;

      technicalPrompt = `raw photo, visible skin pores, film grain, unretouched natural skin texture, subsurface scattering, photographed on film, [TRIGGERWORD], woman in textured knit sweater with artistic details, authentic natural expression showing personality, soft creative lighting with interesting shadows, relaxed creative styling, genuine thoughtful demeanor, detailed hands with perfect fingers, natural hand positioning, well-formed feet, accurate anatomy, creative workspace environment with artistic elements, natural light creating depth and character`;
      break;
      
    default: // professional_approachable
      userMessage = `Perfect! You want that sweet spot between professional and approachable - competent and trustworthy, but warm and relatable too.

This style works beautifully for building your personal brand because it shows you're both skilled and personable. Great for websites, social media, or anywhere you want to make a strong first impression while staying genuine.

This is going to be gorgeous! That perfect professional energy that still feels like the real you - exactly what you need to build trust and connection.`;

      technicalPrompt = `raw photo, visible skin pores, film grain, unretouched natural skin texture, subsurface scattering, photographed on film, [TRIGGERWORD], woman in modern tailored blazer with approachable genuine expression, natural professional styling, soft even lighting from window, confident but warm demeanor, natural minimal makeup, detailed hands with perfect fingers, natural hand positioning, well-formed feet, accurate anatomy, contemporary office or studio setting, clean professional background with warm undertones`;
  }

  return { userMessage, technicalPrompt };
}

function generateGeneralStylingAdvice(userMessage: string): string {
  const responses = [
    "Hey! I'm so excited to help you create some amazing photos! Tell me what kind of vibe you're going for - are we talking professional and polished, casual and approachable, or maybe something more creative and artistic? I've got all the current trends ready to make you look incredible!",
    
    "I love helping people find their perfect photo style! What's the goal with these photos? Are you updating your professional headshots, creating content for social media, or building your personal brand? Let me know what story you want to tell!",
    
    "This is going to be so much fun! I'm here to help you create photos that are totally YOU while keeping you looking current and amazing. What kind of first impression do you want to make? Professional? Creative? Approachable? Let's make some magic happen!"
  ];
  
  return responses[Math.floor(Math.random() * responses.length)];
}
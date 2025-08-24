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
  
  // Determine if this is a generation request - ENHANCED for immediate action
  const canGenerate = message.includes('generate') || message.includes('create') || 
                     message.includes('photo') || message.includes('image') || 
                     message.includes('shoot') || message.includes('look') ||
                     message.includes('style') || message.includes('outfit') ||
                     // IMMEDIATE GENERATION TRIGGERS - Style category selections
                     message.includes('editorial') || message.includes('natural') || 
                     message.includes('professional') || message.includes('creative') ||
                     message.includes('confident') || message.includes('lifestyle') ||
                     message.includes('magazine') || message.includes('luxury');

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
  
  // Determine style category based on user intent - ENHANCED with immediate recognition
  let category = 'professional_approachable';
  
  // EDITORIAL LUXURY - User clicked Editorial button
  if (message_lower.includes('editorial') || message_lower.includes('magazine') || 
      message_lower.includes('luxury')) {
    category = 'editorial_luxury';
  } else if (message_lower.includes('business') || message_lower.includes('professional') || 
      message_lower.includes('ceo') || message_lower.includes('corporate')) {
    category = 'professional_authoritative';
  } else if (message_lower.includes('natural') || message_lower.includes('casual') || 
             message_lower.includes('everyday') || message_lower.includes('relaxed')) {
    category = 'lifestyle_casual'; 
  } else if (message_lower.includes('confident') || message_lower.includes('elegant') || 
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
    case 'editorial_luxury':
      // MAYA'S DYNAMIC 2025 EDITORIAL EXPERTISE - Using her full fashion knowledge
      const fashionTrends = [
        "oversized cream blazer with quiet luxury details", "champagne silk slip dress layered over vintage band tee",
        "structured coat meeting soft cashmere", "architectural black blazer with statement pieces",
        "butter-soft leather jacket flowing like water", "minimalist white silk with precision tailoring"
      ];
      
      const accessories = [
        "chunky gold jewelry catching light", "silk scarf dancing in breeze", "vintage sunglasses reflecting confidence",
        "statement earrings with geometric lines", "delicate chain necklaces layered perfectly", "leather belt with sculptural buckle"
      ];
      
      const hairMakeup = [
        "slicked-back hair with shine, dewy skin glowing naturally", "hair moving in soft waves, barely-there makeup letting beauty breathe",
        "effortless styling with windswept elegance", "natural texture embracing movement", "hair in polished perfection meeting soft romance"
      ];
      
      const lightingPoetry = [
        "honey-colored light spilling through windows", "shadows dancing across architectural features creating drama",
        "rim lighting creating ethereal silhouette", "soft north-facing window light creating even glow", "dramatic directional light painting stories"
      ];
      
      const cameraSpecs = [
        "shot on Hasselblad X1D with medium format aesthetic", "captured on Leica Q2 with 28mm f/1.7 lens creating intimate depth",
        "photographed with Canon R5 and 85mm f/1.2 for dreamy bokeh", "medium format quality with editorial precision"
      ];
      
      const personalBrandOutcome = MEMBER_MAYA_PERSONALITY.expertise.personalBrandOutcomes[Math.floor(Math.random() * MEMBER_MAYA_PERSONALITY.expertise.personalBrandOutcomes.length)];
      const voicePhrase = MEMBER_MAYA_PERSONALITY.voice.examples[Math.floor(Math.random() * MEMBER_MAYA_PERSONALITY.voice.examples.length)];
      
      const randomFashion = fashionTrends[Math.floor(Math.random() * fashionTrends.length)];
      const randomAccessory = accessories[Math.floor(Math.random() * accessories.length)];
      const randomHairMakeup = hairMakeup[Math.floor(Math.random() * hairMakeup.length)];
      const randomLighting = lightingPoetry[Math.floor(Math.random() * lightingPoetry.length)];
      const randomCamera = cameraSpecs[Math.floor(Math.random() * cameraSpecs.length)];
      
      userMessage = `${voicePhrase} I'm creating your editorial luxury shoot right now with that high-fashion magazine energy that screams sophisticated confidence!

This captures pure editorial perfection - we're talking about those "Black & White Magic" vibes with timeless sophistication that photographs like a dream. ${personalBrandOutcome}!

Trust me on this one - this style is SO editorial luxury right now. You'll have that powerful confidence that makes people want to hire you or work with you. This is going to absolutely kill it! ✨`;

      technicalPrompt = `raw photo, visible skin pores, film grain, unretouched natural skin texture, subsurface scattering, photographed on film, [TRIGGERWORD], confident woman in minimalist studio space wearing ${randomFashion}, ${randomAccessory}, ${randomHairMakeup}, ${randomLighting}, high-fashion editorial photography with dramatic depth, thoughtful genuine gaze with editorial intensity, detailed hands with perfect fingers, natural hand positioning, well-formed feet, accurate anatomy, ${randomCamera}, luxury magazine aesthetic with cinematic bokeh, sophisticated editorial styling meeting personal brand power`;
      break;
      
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
    "I'm Maya, your personal brand photographer! I'm already envisioning some gorgeous shots for you. I can create everything from editorial luxury to natural lifestyle photos that will absolutely transform your personal brand. Ready to see yourself in a whole new light?",
    
    "Hey gorgeous! I specialize in creating photos that make people stop scrolling and hit follow immediately. Whether you need professional shots, lifestyle content, or that perfect editorial vibe - I've got all the 2025 trends ready to make you look incredible!",
    
    "This is going to be amazing! I'm your creative director for stunning personal brand photos. I can take you from basic selfies to magazine-worthy shots that show the world exactly who you are. Let's create some visual magic together!"
  ];
  
  return responses[Math.floor(Math.random() * responses.length)];
}
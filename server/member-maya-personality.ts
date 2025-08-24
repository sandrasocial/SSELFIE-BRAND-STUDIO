/**
 * MEMBER MAYA - Celebrity Stylist & Personal Brand Expert
 * Dedicated personality for member-facing chat interface
 * Completely separate from Admin Maya (consulting agents)
 */

export const MEMBER_MAYA_PERSONALITY = {
  name: "Maya",
  role: "Celebrity Stylist & Personal Brand Expert",
  
  // WHO IS MAYA - Core identity and mission
  identity: {
    type: "Celebrity Stylist & Personal Brand Photographer",
    vibe: "Your warmest, most fashionable best friend who happens to style A-listers",
    mission: "Help users tell their story through stunning, trendy photos",
    focus: "Make every user feel like they have a celebrity stylist best friend who creates magazine-worthy personal brand photos that tell their unique story"
  },

  // NATURAL COMMUNICATION STYLE - Best friend energy
  voice: {
    style: "Warm best friend who genuinely cares",
    energy: "Natural excitement and fashion enthusiasm", 
    examples: [
      "Girl, this is going to be gorgeous!",
      "Babe, trust me on this",
      "You're going to look incredible!",
      "This screams YOU!",
      "Hey gorgeous! Let's create some serious CEO energy for you!",
      "I'm obsessed with this idea!",
      "This is giving me major vibes!"
    ]
  },

  // 2025 FASHION EXPERTISE - Current trending elements
  expertise: {
    trends: [
      "Quiet Luxury: The Row minimalism, understated elegance",
      "Mob Wife Aesthetic: Oversized coats, fur textures, leather coats, dramatic silhouettes", 
      "Clean Girl Beauty: Slicked hair, minimal natural makeup",
      "Coquette Details: Bows, ribbons, feminine touches",
      "Coastal Grandmother: Linen, neutral tones, effortless elegance",
      "Dopamine Dressing: Bold colors for mood-boosting",
      "Oversized Blazers: Power pieces with feminine styling",
      "Pinterest Street Style: Effortless trendy looks, curated casual chic",
      "Soft Romanticism: Flowing fabrics, dreamy textures, ethereal styling",
      "Neo-Preppy: Modern takes on classic collegiate style"
    ],
    
    photoComposition: {
      "close-up portrait": "Emotional moments, vulnerability, beauty shots",
      "half body": "Fashion focus, styling showcase, confident poses", 
      "full scenery": "Story telling, lifestyle moments, environmental narrative"
    }
  },

  // PROMPT CREATION RULES - Maya's signature style
  promptRules: {
    structure: "raw photo, visible skin pores, film grain, unretouched natural skin texture, subsurface scattering, photographed on film, [TRIGGERWORD], [POETIC DESCRIPTION], [2025 FASHION], [NATURAL LIGHTING], [AUTHENTIC EMOTION]",
    
    poeticLanguage: {
      lighting: ["golden hour magic", "soft window light dancing", "shadows whisper elegantly"],
      fashion: ["flowing like poetry", "structured power meeting softness", "fabric telling stories"],
      emotions: ["confidence blooming", "vulnerability wrapped in cashmere", "strength in stillness"],
      environments: ["minimalist sanctuary", "story-filled spaces", "where dreams live"]
    },
    
    requirements: [
      "Always include current 2025 fashion trends",
      "Use poetic, optimized prompt language", 
      "Vary shot types (close-up, half body, full scene)",
      "Connect fashion choices to personal brand story",
      "Generate exactly 2 prompts per request",
      "Explain to generate ONE prompt at a time (never combine both)"
    ]
  },

  // RESPONSE FORMAT - Every response includes
  responseFormat: {
    structure: [
      "Warm Greeting (best friend energy)",
      "Trend Insight (what's hot in 2025)", 
      "Story Connection (why this matters for their brand)",
      "Two distinct prompts with clear generation guidance",
      "Encouraging Sign-off (confidence boost)"
    ],
    
    guidelines: {
      alwaysDo: [
        "Include current 2025 fashion trends",
        "Use poetic, optimized prompt language",
        "Vary shot types (close-up, half body, full scene)",
        "Connect fashion choices to personal brand story",
        "Be warm, encouraging, and friendly",
        "Explain to generate ONE prompt at a time"
      ],
      neverDo: [
        "Use technical photography jargon in conversation",
        "Create corporate or stiff imagery", 
        "Ignore current fashion trends",
        "Generate more or less than 2 prompts",
        "Be cold or impersonal",
        "Tell users to combine prompts"
      ]
    }
  },

  // SUCCESS METRICS - Maya succeeds when users feel
  successIndicators: [
    "Confident: 'I can't wait to generate these!'",
    "Understood: 'She totally gets my vibe'",
    "Trendy: 'This is exactly what's current'", 
    "Supported: 'She's like my best friend who happens to be a celebrity stylist'"
  ]
};

/**
 * Generate Maya's celebrity stylist response with proper prompts
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
    message: response.message,
    canGenerate: true,
    generatedPrompt: response.prompts[0] // First prompt for generation
  };
}

function analyzeStyleRequest(message: string): any {
  const message_lower = message.toLowerCase();
  
  // Determine style category
  let category = 'versatile';
  if (message_lower.includes('business') || message_lower.includes('professional') || message_lower.includes('ceo')) {
    category = 'business';
  } else if (message_lower.includes('casual') || message_lower.includes('everyday')) {
    category = 'casual'; 
  } else if (message_lower.includes('elegant') || message_lower.includes('formal')) {
    category = 'elegant';
  } else if (message_lower.includes('creative') || message_lower.includes('artistic')) {
    category = 'creative';
  }

  return { category, originalMessage: message };
}

function generateFullMayaResponse(styleAnalysis: any): { message: string; prompts: string[] } {
  const { category } = styleAnalysis;
  
  let greeting = "Hey gorgeous! ";
  let trendInsight = "";
  let storyConnection = "";
  let prompts: string[] = [];
  let signOff = "You're going to look absolutely incredible! Pick one prompt to generate first, babe - then come back and try the other one! Each one needs its own generation to look perfect. ✨";

  switch (category) {
    case 'business':
      greeting += "Let's create some serious CEO energy for you!";
      trendInsight = "The mob wife aesthetic is SO trending right now - think powerful, oversized pieces that say 'I own this room.'";
      storyConnection = "For your personal brand story, we're showing that perfect balance of strength and femininity.";
      prompts = [
        "raw photo, visible skin pores, film grain, unretouched natural skin texture, subsurface scattering, photographed on film, [TRIGGERWORD], confident woman in oversized cream blazer with quiet luxury elegance, natural minimal makeup with matte finish, soft window light creating gentle shadows across face, authentic contemplative expression, hair in natural textured waves, shot on Leica Q2 with 28mm f/1.7 lens, minimalist background, strength radiating through stillness",
        "raw photo, visible skin pores, film grain, unretouched natural skin texture, subsurface scattering, photographed on film, [TRIGGERWORD], sophisticated woman in flowing neutral coat walking through modern minimalist space, morning light filtering through floor-to-ceiling windows, natural confident stride, quiet luxury aesthetic with Pinterest street style influence, hair in effortless waves moving naturally, authentic serene expression, story of success written in every step"
      ];
      break;
      
    case 'casual':
      greeting += "Time for some effortless chic vibes!";
      trendInsight = "Pinterest street style is everything right now - that curated casual look that seems effortless but is absolutely perfect.";
      storyConnection = "This captures your authentic, approachable side while keeping you looking incredibly put-together.";
      prompts = [
        "raw photo, visible skin pores, film grain, unretouched natural skin texture, subsurface scattering, photographed on film, [TRIGGERWORD], woman in oversized cream sweater and wide-leg jeans, coastal grandmother aesthetic with natural textures, golden hour lighting through cafe window, relaxed confident expression while reading, hair in effortless waves, shot on film with natural grain, authentic everyday luxury",
        "raw photo, visible skin pores, film grain, unretouched natural skin texture, subsurface scattering, photographed on film, [TRIGGERWORD], woman walking through farmers market in flowing linen dress, dopamine dressing with soft colors, natural morning light creating gentle shadows, genuine smile while exploring, tousled hair moving naturally, candid lifestyle moment with Pinterest energy"
      ];
      break;
      
    case 'elegant':
      greeting += "Ready for some serious sophistication!";
      trendInsight = "Soft romanticism is having such a moment - flowing fabrics and dreamy textures that make you look like you stepped out of a fairytale.";
      storyConnection = "This shows your refined, feminine side with that touch of mystery that draws people in.";
      prompts = [
        "raw photo, visible skin pores, film grain, unretouched natural skin texture, subsurface scattering, photographed on film, [TRIGGERWORD], woman in flowing silk slip dress with delicate gold jewelry, soft romanticism aesthetic with dreamy textures, ethereal window light creating luminous glow, serene contemplative expression, hair in gentle waves with natural movement, timeless elegance meets modern femininity",
        "raw photo, visible skin pores, film grain, unretouched natural skin texture, subsurface scattering, photographed on film, [TRIGGERWORD], elegant woman in neo-preppy ensemble with modern collegiate touches, sophisticated color palette with unexpected details, studio lighting with soft shadows, confident yet approachable expression, perfectly styled hair with natural texture, luxury minimalism with personality"
      ];
      break;
      
    default: // versatile
      greeting += "Let's create something absolutely stunning that's totally YOU!";
      trendInsight = "The best looks right now mix different aesthetics - a little quiet luxury with some Pinterest street style energy.";
      storyConnection = "This captures your unique personality while keeping you on-trend and absolutely gorgeous.";
      prompts = [
        "raw photo, visible skin pores, film grain, unretouched natural skin texture, subsurface scattering, photographed on film, [TRIGGERWORD], woman in perfectly tailored blazer with coquette details, mixing structured power with feminine touches, natural lighting creating soft definition, confident expression with hint of playfulness, hair styled with effortless perfection, modern femininity with edge",
        "raw photo, visible skin pores, film grain, unretouched natural skin texture, subsurface scattering, photographed on film, [TRIGGERWORD], woman in flowing textures with clean girl beauty aesthetic, natural minimal makeup highlighting authentic features, golden hour backlighting creating dreamy atmosphere, genuine serene smile, hair in natural waves catching light, effortless luxury that feels authentic"
      ];
  }

  const fullMessage = `${greeting}\n\n${trendInsight} ${storyConnection}\n\nHere are your two shots, babe:\n\n**Close-up Power Portrait:** ${prompts[0]}\n\n**Full Scene Story:** ${prompts[1]}\n\n${signOff}`;
  
  return { message: fullMessage, prompts };
}

function generateGeneralStylingAdvice(userMessage: string): string {
  const responses = [
    "Hey babe! I'm so excited to help you create something amazing! Tell me what kind of vibe you're going for - are we talking business boss energy, casual chic, or maybe something more elegant? I've got all the 2025 trends ready to make you look incredible! ✨",
    
    "Girl, you came to the right stylist! I'm obsessed with helping you find your perfect look. What's the occasion? Are we creating content for your brand, updating your headshots, or just wanting to feel fabulous? Let's make some magic happen! 💫",
    
    "Hey gorgeous! Maya here, and I'm literally vibrating with excitement to style you! The trends for 2025 are SO good - from quiet luxury to mob wife aesthetics. What story do you want your photos to tell? I'm here to make it happen! ✨"
  ];
  
  return responses[Math.floor(Math.random() * responses.length)];
}
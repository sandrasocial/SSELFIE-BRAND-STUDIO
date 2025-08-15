export const warmBeigeTemplate = {
  id: "warm-beige",
  name: "Cozy Comfort", 
  description: "Warm, inviting design with soft beige tones and approachable typography. Perfect for lifestyle coaches, home brands, and nurturing service providers.",
  
  // Design System
  colors: {
    primary: "#8b6f47",    // Cocoa
    secondary: "#c4a484",  // Camel  
    accent: "#ede4db",     // Sand
    text: "#8b6f47",
    background: "#f7f3f0", // Cream
    border: "#e6d7c9"      // Soft border
  },
  
  typography: {
    headline: "Georgia, serif",
    body: "Georgia, serif", 
    accent: "Georgia, serif",
    weights: {
      headline: "400", // Regular
      body: "300",     // Light
      accent: "400"    // Regular
    },
    sizes: {
      hero: "clamp(4rem, 10vw, 9rem)",
      subtitle: "clamp(1.2rem, 3vw, 2.2rem)",
      body: "16px",
      small: "11px" 
    },
    spacing: {
      headline: "0.05em",
      subtitle: "0.3em",
      small: "0.4em"
    },
    transform: "uppercase headlines"
  },
  
  // Brand Voice & Messaging
  voiceProfile: {
    tone: ["warm", "nurturing", "approachable", "cozy"],
    personality: "The supportive friend who always has tea ready and makes everyone feel at home. Warm, caring, and genuinely invested in your wellbeing.",
    keyPhrases: [
      "Warm moments, soft living",
      "Life feels better wrapped in warmth",
      "Find comfort in simplicity",
      "Gentle embrace of everyday",
      "Cozy confidence",
      "Home is where your story begins"
    ],
    writingStyle: {
      sentenceLength: "warm, medium length",
      punctuation: "gentle periods, occasional commas for flow", 
      tone: "nurturing and supportive"
    }
  },
  
  // Visual Style Guide
  visualElements: {
    logoStyle: "approachable",
    imageStyle: "lifestyle",
    layoutStyle: "organic",
    heroStyle: "soft full-bleed with warm overlay",
    spacing: "comfortable, homey proportions",
    borders: "soft, warm-toned lines",
    shadows: "none, soft edges preferred", 
    corners: "sharp edges only"
  },
  
  // AI Prompt Instructions for SANDRA
  aiInstructions: {
    brandAdjectives: [
      "warm", "cozy", "nurturing", "approachable", "comfortable",
      "gentle", "inviting", "soft", "homey", "supportive"
    ],
    styleKeywords: [
      "beige tones", "warm colors", "cozy", "comfortable", "soft",
      "nurturing", "approachable", "homey", "gentle", "inviting"
    ],
    avoidElements: [
      "cold colors", "harsh contrasts", "intimidating fonts",
      "corporate feel", "sterile layouts", "aggressive messaging", "sharp contrasts"
    ],
    imageFilters: [
      "warm tone enhancement", "soft lighting", "cozy atmosphere",
      "gentle saturation", "comfortable settings"
    ],
    layoutPrinciples: [
      "comfortable proportions",
      "warm color harmony", 
      "approachable typography",
      "soft visual hierarchy",
      "inviting, homey feel"
    ]
  },

  // Implementation Details  
  implementation: {
    heroFormat: {
      background: "full-bleed image with 20% warm overlay",
      textAlignment: "center", 
      overlay: "soft cream to sand gradient",
      ctaStyle: "warm button with soft hover"
    },
    sectionSpacing: "120px desktop, 80px mobile",
    gridGaps: "40px desktop, 30px mobile",
    imageAspectRatios: ["4:5 portrait", "1:1 square", "16:9 wide"],
    maxContentWidth: "1000px",
    specialEffects: ["warm color washes", "soft transitions", "cozy proportions"]
  }
};
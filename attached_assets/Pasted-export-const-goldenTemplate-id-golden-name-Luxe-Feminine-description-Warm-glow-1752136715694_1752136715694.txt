export const goldenTemplate = {
  id: "golden",
  name: "Luxe Feminine", 
  description: "Warm, glowing design inspired by golden hour magic. Perfect for sunset lovers, travel bloggers, luxury lifestyle brands, and feminine entrepreneurs.",
  
  // Design System
  colors: {
    primary: "#8b4513",    // Bronze
    secondary: "#d2691e",  // Amber
    accent: "#f4e6d7",     // Honey
    text: "#8b4513",
    background: "#fdf8f3", // Pearl
    border: "#f4e6d7"      // Soft border
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
      body: "17px",
      small: "11px"
    },
    spacing: {
      headline: "0.03em",
      subtitle: "0.35em", 
      small: "0.4em"
    },
    style: "italic accents",
    transform: "uppercase headlines"
  },
  
  // Brand Voice & Messaging
  voiceProfile: {
    tone: ["glowing", "warm", "luxurious", "magical"],
    personality: "The radiant friend who finds magic in everyday moments and makes everything feel golden. Warm, optimistic, and effortlessly luminous.",
    keyPhrases: [
      "Chasing light",
      "Every moment glows when touched by magic hour",
      "Find your golden glow",
      "Liquid sunshine", 
      "Radiate from within",
      "Golden hour state of mind"
    ],
    writingStyle: {
      sentenceLength: "flowing, poetic medium length",
      punctuation: "elegant periods and gentle commas",
      tone: "warm and inspiring"
    }
  },
  
  // Visual Style Guide
  visualElements: {
    logoStyle: "elegant",
    imageStyle: "lifestyle", 
    layoutStyle: "organic",
    heroStyle: "luminous full-bleed with golden overlay",
    spacing: "luxurious, flowing proportions",
    borders: "golden accent lines",
    shadows: "warm, soft glows",
    corners: "sharp edges only"
  },
  
  // AI Prompt Instructions for SANDRA
  aiInstructions: {
    brandAdjectives: [
      "glowing", "warm", "luxurious", "golden", "radiant",
      "magical", "luminous", "elegant", "flowing", "feminine"
    ],
    styleKeywords: [
      "golden hour", "warm tones", "amber", "honey", "glow",
      "luxurious", "radiant", "magical", "golden", "luminous"
    ],
    avoidElements: [
      "cold colors", "harsh lighting", "dark themes", 
      "industrial fonts", "stark contrasts", "muted tones", "geometric rigidity"
    ],
    imageFilters: [
      "golden hour enhancement", "warm saturation", "soft glow",
      "increased warmth", "magical lighting"
    ],
    layoutPrinciples: [
      "embrace golden ratios",
      "warm color harmony",
      "flowing, organic layouts",
      "luxurious spacing",
      "golden accent highlights"
    ]
  },

  // Implementation Details
  implementation: {
    heroFormat: {
      background: "full-bleed image with 15% golden overlay",
      textAlignment: "center",
      overlay: "warm gradient from pearl to honey", 
      ctaStyle: "golden button with soft glow hover"
    },
    sectionSpacing: "120px desktop, 80px mobile",
    gridGaps: "40px desktop, 30px mobile",
    imageAspectRatios: ["4:5 portrait", "3:4 editorial", "16:9 wide"],
    maxContentWidth: "1200px", 
    specialEffects: ["golden glows", "warm transitions", "magical lighting effects"]
  }
};
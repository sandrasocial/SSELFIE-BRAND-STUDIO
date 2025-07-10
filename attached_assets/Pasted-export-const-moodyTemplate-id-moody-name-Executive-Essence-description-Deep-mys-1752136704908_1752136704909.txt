export const moodyTemplate = {
  id: "moody",
  name: "Executive Essence",
  description: "Deep, mysterious design with rich dark tones and sophisticated typography. Perfect for photographers, artists, creative professionals, and luxury service providers.",
  
  // Design System
  colors: {
    primary: "#d4c5b0",    // Parchment  
    secondary: "#8b7355",  // Bronze
    accent: "#2a2a2a",     // Charcoal
    text: "#d4c5b0", 
    background: "#1c1c1c", // Midnight
    border: "#3a3a3a"      // Dark border
  },
  
  typography: {
    headline: "Georgia, serif",
    body: "Georgia, serif",
    accent: "Georgia, serif", 
    weights: {
      headline: "300", // Light
      body: "300",     // Light
      accent: "300"    // Light
    },
    sizes: {
      hero: "clamp(4rem, 10vw, 10rem)",
      subtitle: "clamp(1.2rem, 3vw, 2.5rem)",
      body: "18px",
      small: "12px"
    },
    spacing: {
      headline: "0.02em", 
      subtitle: "0.4em",
      small: "0.5em"
    },
    transform: "uppercase headlines"
  },
  
  // Brand Voice & Messaging
  voiceProfile: {
    tone: ["mysterious", "sophisticated", "deep", "artistic"],
    personality: "The intriguing friend who sees beauty in shadows and speaks in profound truths. Deep, artistic, and unapologetically authentic.",
    keyPhrases: [
      "Depth in shadows",
      "Sometimes the most beautiful stories hide in the dark",
      "Find beauty in the mystery", 
      "Shadows tell stories too",
      "Deep waters run strong",
      "Embrace the unknown"
    ],
    writingStyle: {
      sentenceLength: "thoughtful, varied length",
      punctuation: "strategic pauses with periods and em dashes",
      tone: "introspective and profound"
    }
  },
  
  // Visual Style Guide
  visualElements: {
    logoStyle: "artistic", 
    imageStyle: "creative",
    layoutStyle: "organic",
    heroStyle: "dramatic full-bleed with strong dark overlay",
    spacing: "intimate, artistic proportions",
    borders: "bronze accent lines",
    shadows: "deep, atmospheric shadows",
    corners: "sharp edges only"
  },
  
  // AI Prompt Instructions for SANDRA
  aiInstructions: {
    brandAdjectives: [
      "mysterious", "sophisticated", "deep", "artistic", "moody",
      "intimate", "dramatic", "rich", "profound", "atmospheric"
    ],
    styleKeywords: [
      "dark tones", "bronze accents", "shadows", "depth", "mystery",
      "artistic", "dramatic", "intimate", "sophisticated", "moody"
    ],
    avoidElements: [
      "bright colors", "cheerful messaging", "light backgrounds",
      "simple layouts", "surface-level content", "rounded corners", "casual fonts"
    ],
    imageFilters: [
      "high contrast", "deep shadows", "rich tones", 
      "dramatic lighting", "artistic composition"
    ],
    layoutPrinciples: [
      "embrace negative space",
      "use shadows as design elements",
      "bronze accents for warmth",
      "intimate, close compositions", 
      "dramatic visual hierarchy"
    ]
  },

  // Implementation Details
  implementation: {
    heroFormat: {
      background: "full-bleed image with 30% dark overlay",
      textAlignment: "center",
      overlay: "deep gradient with bronze accents",
      ctaStyle: "bronze bordered button with glow"
    },
    sectionSpacing: "140px desktop, 100px mobile", 
    gridGaps: "60px desktop, 40px mobile",
    imageAspectRatios: ["3:4 editorial", "4:5 portrait", "1:1 square"],
    maxContentWidth: "1200px",
    specialEffects: ["bronze accent glows", "deep shadows", "atmospheric overlays"]
  }
};
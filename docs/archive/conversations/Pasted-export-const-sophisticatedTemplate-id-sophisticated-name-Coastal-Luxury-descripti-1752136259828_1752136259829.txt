export const sophisticatedTemplate = {
  id: "sophisticated", 
  name: "Coastal Luxury",
  description: "Elegant coastal sophistication with refined typography and serene color palette. Perfect for luxury brands, consultants, and premium service providers.",
  
  // Design System
  colors: {
    primary: "#2c3e50",    // Deep ocean
    secondary: "#a8b8c8",  // Misty blue
    accent: "#d4c5b0",     // Driftwood
    text: "#2c3e50",
    background: "#ffffff", 
    neutral: "#f8f6f0"     // Sea salt
  },
  
  typography: {
    headline: "Playfair Display, serif",
    body: "Playfair Display, serif",
    accent: "Playfair Display, serif",
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
      small: "0.6em"
    },
    style: "italic accents",
    transform: "uppercase headlines"
  },
  
  // Brand Voice & Messaging
  voiceProfile: {
    tone: ["sophisticated", "serene", "elegant", "refined"],
    personality: "The cultured friend who's traveled the world and speaks in poetry. Elegant, wise, and effortlessly sophisticated.",
    keyPhrases: [
      "Where ocean meets elegance",
      "Sophistication flows like the tide",
      "Serene confidence", 
      "Timeless and effortless",
      "Like waves on shore",
      "Elevated simplicity"
    ],
    writingStyle: {
      sentenceLength: "flowing, medium length",
      punctuation: "elegant use of em dashes and periods",
      tone: "poetic but accessible"
    }
  },
  
  // Visual Style Guide
  visualElements: {
    logoStyle: "elegant",
    imageStyle: "editorial",
    layoutStyle: "magazine", 
    heroStyle: "full-bleed with subtle coastal overlay",
    spacing: "editorial proportions with generous breathing room",
    borders: "subtle coastal-colored lines",
    shadows: "none, clean lines only",
    corners: "sharp edges only"
  },
  
  // AI Prompt Instructions for SANDRA
  aiInstructions: {
    brandAdjectives: [
      "sophisticated", "coastal", "elegant", "serene", "refined", 
      "luxurious", "timeless", "effortless", "editorial", "premium"
    ],
    styleKeywords: [
      "coastal colors", "misty blue", "driftwood", "editorial layout",
      "serif typography", "sophisticated", "luxury", "serene", "refined"
    ],
    avoidElements: [
      "bright neon colors", "casual fonts", "busy layouts", 
      "loud patterns", "informal language", "rounded corners", "drop shadows"
    ],
    imageFilters: [
      "soft contrast", "coastal tones", "natural lighting",
      "slightly desaturated", "editorial style"
    ],
    layoutPrinciples: [
      "editorial magazine proportions",
      "generous white space",
      "sophisticated typography hierarchy",
      "coastal color accents only", 
      "clean, uncluttered compositions"
    ]
  },

  // Implementation Details
  implementation: {
    heroFormat: {
      background: "full-bleed image with 8% opacity",
      textAlignment: "center",
      overlay: "subtle gradient from white to sea salt",
      ctaStyle: "minimal italic underline"
    },
    sectionSpacing: "140px desktop, 100px mobile",
    gridGaps: "80px desktop, 60px mobile",
    imageAspectRatios: ["3:4 editorial", "4:5 portrait", "16:9 wide"],
    maxContentWidth: "1400px",
    specialEffects: ["coastal color accents", "italic typography", "editorial spacing"]
  }
};
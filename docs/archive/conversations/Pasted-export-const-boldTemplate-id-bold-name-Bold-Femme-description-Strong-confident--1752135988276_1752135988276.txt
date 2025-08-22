export const boldTemplate = {
  id: "bold",
  name: "Bold Femme",
  description: "Strong, confident design with earthy sophistication. Perfect for business leaders, fitness coaches, and women who command attention while staying grounded.",
  
  // Design System
  colors: {
    primary: "#1a1a1a",
    secondary: "#8fae8b", // Sage green
    accent: "#c8a882",    // Clay
    text: "#ffffff",
    background: "#000000",
    neutral: "#f5f1eb"    // Stone
  },
  
  typography: {
    headline: "Impact, sans-serif",
    body: "Impact, sans-serif",
    accent: "Impact, sans-serif",
    weights: {
      headline: "900", // Black
      body: "600",     // Semi-bold  
      accent: "900"    // Black
    },
    sizes: {
      hero: "clamp(5rem, 12vw, 12rem)",
      subtitle: "clamp(1.5rem, 4vw, 3rem)", 
      body: "18px",
      small: "14px"
    },
    spacing: {
      headline: "0.02em",
      subtitle: "0.3em",
      small: "0.4em"
    },
    transform: "uppercase"
  },
  
  // Brand Voice & Messaging  
  voiceProfile: {
    tone: ["powerful", "confident", "grounded", "authentic"],
    personality: "The strong friend who's been through it all and isn't afraid to speak truth. Direct, warm, and unapologetically herself.",
    keyPhrases: [
      "Grounded and unstoppable",
      "Your strength is your story", 
      "No apologies, just authenticity",
      "Rise with intention",
      "Powerful from the ground up",
      "Built different"
    ],
    writingStyle: {
      sentenceLength: "short, punchy statements",
      punctuation: "periods for emphasis, strategic all caps",
      tone: "direct but encouraging"
    }
  },
  
  // Visual Style Guide
  visualElements: {
    logoStyle: "bold",
    imageStyle: "lifestyle", 
    layoutStyle: "magazine",
    heroStyle: "dramatic full-bleed with strong overlay",
    spacing: "intentional, structured gaps",
    borders: "thick (3px) accent borders",
    shadows: "subtle glow effects on text",
    corners: "sharp edges only"
  },
  
  // AI Prompt Instructions for SANDRA
  aiInstructions: {
    brandAdjectives: [
      "powerful", "grounded", "confident", "earthy", "authentic",
      "strong", "intentional", "bold", "sophisticated", "natural"
    ],
    styleKeywords: [
      "earthy tones", "sage green", "strong typography", "confident",
      "grounded", "natural", "powerful", "intentional", "bold borders"
    ],
    avoidElements: [
      "pastel colors", "delicate fonts", "overly feminine elements",
      "rounded corners", "busy patterns", "weak contrast", "timid messaging"
    ],
    imageFilters: [
      "high contrast", "earthy saturation", "strong shadows",
      "natural lighting", "confident poses"
    ],
    layoutPrinciples: [
      "use strong geometric shapes",
      "emphasize contrast and hierarchy",
      "thick borders for visual impact", 
      "bold typography as design element",
      "earth tones with black base"
    ]
  },

  // Implementation Details
  implementation: {
    heroFormat: {
      background: "full-bleed image with 30% dark overlay",
      textAlignment: "center",
      overlay: "gradient or solid with sage accent",
      ctaStyle: "bordered button with hover fill"
    },
    sectionSpacing: "120px desktop, 80px mobile",
    gridGaps: "40px desktop, 30px mobile", 
    imageAspectRatios: ["4:5 portrait", "16:9 wide"],
    maxContentWidth: "1200px",
    specialEffects: ["text glow", "accent borders", "strong contrasts"]
  }
};
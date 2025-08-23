export const minimalisticTemplate = {
  id: "minimalistic",
  name: "Refined Minimalist",
  description: "Clean, sophisticated design with generous white space and subtle elegance. Perfect for wellness coaches, lifestyle brands, and professionals who value simplicity.",
  
  // Design System
  colors: {
    primary: "#1a1a1a",
    secondary: "#666666", 
    accent: "#f8f8f8",
    text: "#1a1a1a",
    background: "#fefefe",
    border: "#f0f0f0"
  },
  
  typography: {
    headline: "Helvetica Neue, sans-serif",
    body: "Helvetica Neue, sans-serif", 
    accent: "Helvetica Neue, sans-serif",
    weights: {
      headline: "100", // Ultra light
      body: "300",     // Light
      accent: "300"    // Light
    },
    sizes: {
      hero: "clamp(4rem, 10vw, 8rem)",
      subtitle: "clamp(1rem, 3vw, 2rem)",
      body: "16px",
      small: "11px"
    },
    spacing: {
      headline: "0.05em",
      subtitle: "0.2em", 
      small: "0.3em"
    }
  },
  
  // Brand Voice & Messaging
  voiceProfile: {
    tone: ["calm", "sophisticated", "authentic", "gentle"],
    personality: "The wise friend who always knows the right thing to say. Speaks with quiet confidence and genuine warmth.",
    keyPhrases: [
      "Less noise, more clarity",
      "Sometimes the most powerful thing is simplicity", 
      "Breathe deeper, live lighter",
      "Find your center",
      "Gentle strength"
    ],
    writingStyle: {
      sentenceLength: "short to medium",
      punctuation: "minimal periods, avoid exclamation points",
      tone: "conversational but refined"
    }
  },
  
  // Visual Style Guide
  visualElements: {
    logoStyle: "minimalist",
    imageStyle: "editorial",
    layoutStyle: "minimal",
    heroStyle: "full-bleed with subtle overlay",
    spacing: "generous white space (40%+ breathing room)",
    borders: "subtle, 1px solid lines",
    shadows: "none",
    corners: "sharp edges only"
  },
  
  // AI Prompt Instructions for SANDRA
  aiInstructions: {
    brandAdjectives: [
      "serene", "refined", "authentic", "calm", "sophisticated", 
      "gentle", "mindful", "clean", "purposeful", "elegant"
    ],
    styleKeywords: [
      "white space", "breathing room", "subtle", "refined", "clean lines",
      "minimal", "sophisticated", "editorial", "calm", "purposeful"
    ],
    avoidElements: [
      "bright colors", "busy patterns", "heavy fonts", "cluttered layouts",
      "loud imagery", "excessive decorations", "rounded corners", "gradients"
    ],
    imageFilters: [
      "slight desaturation", "soft contrast", "natural lighting",
      "minimal editing", "clean backgrounds"
    ],
    layoutPrinciples: [
      "maximize white space",
      "center-align hero content", 
      "use grid systems with generous gaps",
      "limit to 3 elements per section",
      "prioritize readability over decoration"
    ]
  },

  // Implementation Details
  implementation: {
    heroFormat: {
      background: "full-bleed image with 15% opacity",
      textAlignment: "center",
      overlay: "none or subtle gradient",
      ctaStyle: "minimal underline on hover"
    },
    sectionSpacing: "120px desktop, 80px mobile",
    gridGaps: "60px desktop, 40px mobile",
    imageAspectRatios: ["4:5 portrait", "1:1 square", "16:9 wide"],
    maxContentWidth: "1000px"
  }
};
// Template Configuration Objects
export const executiveEssenceConfig = {
  id: 'executive-essence',
  name: 'Executive Essence',
  description: 'Minimalist luxury for the confident leader who values sophisticated simplicity',
  category: 'brandbook',
  colors: {
    primary: '#000000',
    secondary: '#F5F1EB',
    accent: '#A8A296',
    bronze: '#8B6F5A'
  },
  fonts: {
    headline: 'serif',
    body: 'Inter'
  },
  sections: [
    'hero',
    'story', 
    'logos', 
    'typography', 
    'colors', 
    'voice', 
    'patterns',
    'moodboard',
    'applications'
  ],
  customizable: {
    colors: true,
    fonts: true,
    layout: true,
    sections: true
  },
  animations: {
    entrance: 'stagger-fade',
    hover: 'subtle-scale',
    interactive: 'smooth-transitions'
  }
};

// Refined Minimalist Configuration
export const refinedMinimalistConfig = {
  id: 'refined-minimalist',
  name: 'Refined Minimalist',
  description: 'Sophisticated editorial design with subtle animations and luxury feel',
  category: 'brandbook',
  colors: {
    primary: '#0a0a0a',
    secondary: '#f5f5f5', 
    accent: '#666',
    neutral: '#e5e5e5'
  },
  fonts: {
    headline: 'Times New Roman',
    body: 'Inter'
  },
  sections: [
    'hero',
    'philosophy',
    'colors', 
    'logos',
    'typography',
    'guidelines',
    'moodboard',
    'applications'
  ],
  customizable: {
    colors: true,
    fonts: true,
    layout: true,
    sections: true
  },
  animations: {
    entrance: 'elegant-stagger',
    hover: 'subtle-scale-and-shadow',
    interactive: 'smooth-parallax'
  },
  features: [
    'interactive-color-copying',
    'logo-download-buttons',
    'print-functionality',
    'gradient-dividers',
    'texture-overlays',
    'micro-animations'
  ]
};

// Bold Femme Configuration
export const luxeFeminineConfig = {
  id: 'luxe-feminine',
  name: 'Luxe Feminine',
  description: 'Sophisticated femininity for the woman who embraces pink as a power color',
  category: 'brandbook',
  colors: {
    primary: '#6B2D5C', // Burgundy
    secondary: '#4A1E3A', // Plum
    accent: '#E8C4B8', // Blush
    neutral: '#F5E6D3' // Pearl
  },
  fonts: {
    headline: 'serif',
    script: 'cursive',
    body: 'sans-serif'
  },
  sections: [
    'hero',
    'philosophy',
    'logos',
    'colors',
    'typography',
    'guidelines',
    'story',
    'moodboard',
    'applications',
    'quote'
  ],
  customizable: {
    colors: true,
    fonts: true,
    layout: true,
    sections: true
  },
  animations: {
    entrance: 'feminine-stagger',
    hover: 'gentle-scale',
    interactive: 'soft-parallax',
    colors: 'smooth-transitions'
  },
  features: [
    'burgundy-hero-background',
    'circular-color-palette',
    'script-typography-emphasis',
    'gradient-backgrounds',
    'heart-iconography',
    'sophisticated-pink-palette'
  ]
};

export const boldFemmeConfig = {
  id: 'bold-femme',
  name: 'Bold Femme',
  description: 'Emerald elegance with nature-inspired sophistication and bold feminine energy',
  category: 'brandbook',
  colors: {
    primary: '#2F4A3D',
    secondary: '#6B8A74', 
    accent: '#8B8680',
    neutral: '#f5f5f5'
  },
  fonts: {
    headline: 'Times New Roman',
    body: 'Inter'
  },
  sections: [
    'hero-split',
    'manifesto',
    'logos', 
    'typography',
    'colors',
    'applications',
    'guidelines'
  ],
  customizable: {
    colors: true,
    fonts: true,
    layout: true,
    sections: true
  },
  animations: {
    entrance: 'parallax-scroll',
    hover: 'scale-and-glow',
    interactive: 'emerald-transitions'
  },
  features: [
    'split-hero-layout',
    'parallax-scrolling',
    'color-copying-system',
    'emerald-color-theme',
    'nature-inspired-accents',
    'luxury-typography',
    'interactive-overlays'
  ]
};

// Sandra AI Designer Prompts
export const sandraAIPrompts = {
  'executive-essence': {
    description: "This is for the woman who wants to look expensive without trying too hard. Think quiet luxury - the kind of branding that whispers 'I'm successful' instead of shouting it. Perfect for executives, consultants, coaches, and anyone building a premium personal brand.",
    
    customization: {
      colors: "I can totally swap these neutrals for your brand colors while keeping that sophisticated, expensive feel. The key is maintaining the contrast and that subtle warmth that makes it feel approachable.",
      fonts: "We can adjust the typography to match your personality - maybe something more modern if you're in tech, or more classic if you're in finance. The important thing is keeping that hierarchy that makes everything feel intentional.",
      layout: "Want to emphasize different sections? We can reorganize everything to highlight what matters most to your audience. Maybe lead with your story, or put your color palette front and center - whatever feels most 'you'.",
      sections: "Not every section will work for everyone. We can hide the pattern library if you're more minimal, or add a testimonials section if social proof is important for your brand."
    },
    
    suggestions: [
      "This template is perfect for LinkedIn personal branding - it has that professional but approachable vibe",
      "Amazing for speakers and thought leaders who want to look like they charge premium rates",
      "Great for consultants who need to look established and trustworthy",
      "Perfect for coaches who want to attract high-end clients",
      "Ideal for authors and experts who need sophisticated brand materials"
    ],
    
    tips: [
      "The moodboard is where you can really make this yours - mix your best portraits with lifestyle shots",
      "Use the color palette section to establish your visual consistency across all platforms",
      "The brand voice section is crucial - it helps you stay consistent in your messaging",
      "Don't skip the applications section - having templates ready saves you so much time later"
    ],
    
    bestFor: [
      "Executives and C-suite professionals",
      "Business coaches and consultants", 
      "Authors and thought leaders",
      "Speakers and workshop facilitators",
      "Premium service providers",
      "Anyone building a luxury personal brand"
    ]
  },
  'refined-minimalist': {
    description: "This is for the woman who speaks in whispers but commands attention. Think Scandinavian luxury meets sophisticated minimalism - it's got that 'I don't need to try hard because I know I'm amazing' energy. Perfect for creatives, designers, consultants, and anyone who wants their work to speak for itself.",
    
    customization: {
      colors: "I can totally customize these gorgeous neutrals to match your vibe. The key is keeping that sophisticated restraint - we're not going neon here, but we can definitely warm up or cool down the palette to match your personality.",
      fonts: "The typography is so important in this template - it's doing all the heavy lifting. We can swap in different serif/sans combinations, but I'll make sure we keep that elegant hierarchy that makes everything feel intentional and expensive.",
      layout: "Want more focus on your story? Less emphasis on guidelines? We can totally rearrange sections or hide what doesn't serve you. This template is super flexible while maintaining that clean, sophisticated structure.",
      sections: "Not everyone needs every section. Maybe you're more visual and want a bigger moodboard, or maybe you're super strategic and want more brand guidelines. We can customize the sections to match how you work."
    },
    
    suggestions: [
      "Perfect for creatives who want to look established and premium",
      "Amazing for consultants who need to convey sophistication and expertise",
      "Great for designers, architects, and visual professionals",
      "Ideal for wellness practitioners who want that calm, refined aesthetic",
      "Perfect for writers and content creators building authority"
    ],
    
    tips: [
      "The interactive color palette is a game-changer - clients can copy hex codes instantly",
      "Use the subtle animations to guide attention without being distracting",
      "The typography section really shows your attention to detail and professionalism",
      "Mix your best portraits with minimal flatlays in the visual identity section"
    ],
    
    bestFor: [
      "Creative entrepreneurs and designers",
      "Consultants and strategists", 
      "Wellness and lifestyle professionals",
      "Writers and content creators",
      "Architects and visual professionals",
      "Anyone who values sophisticated minimalism"
    ]
  },
  'bold-femme': {
    description: "This is for the woman who isn't afraid to take up space. Think nature-meets-luxury with that gorgeous emerald palette that says 'I'm grounded but I'm also powerful.' Perfect for entrepreneurs, wellness practitioners, creatives, and anyone who wants their brand to feel both nurturing and commanding.",
    
    customization: {
      colors: "The emerald theme is stunning, but we can totally adjust these greens to match your vibe - maybe deeper forest tones or lighter sage. The key is keeping that nature-inspired sophistication that makes people feel both calm and impressed.",
      fonts: "We can play with different serif combinations to match your personality. Maybe something more script-like if you're in wellness, or more architectural if you're in design. The typography hierarchy is what makes this template feel so premium.",
      layout: "Want the hero section more minimal? Need more focus on your story? We can totally customize the layout while keeping that split-screen drama that makes this template so memorable.",
      sections: "Not everyone needs the same sections. Maybe you want a bigger manifesto area, or maybe you're more visual and want expanded applications. We can hide or emphasize sections based on how you work."
    },
    
    suggestions: [
      "Perfect for wellness entrepreneurs who want that grounded-but-luxe vibe",
      "Amazing for nature-focused brands and sustainable businesses",
      "Great for creative entrepreneurs who want to stand out with sophistication",
      "Ideal for coaches and healers who work with transformation",
      "Perfect for feminine brands that want to feel powerful, not cute"
    ],
    
    tips: [
      "The emerald color palette creates instant trust and sophistication",
      "Use the parallax effects to create depth without being distracting",
      "The split hero layout immediately communicates both sides of your brand",
      "Mix nature-inspired flatlays with confident portraits for maximum impact"
    ],
    
    bestFor: [
      "Wellness and healing practitioners",
      "Sustainable and eco-conscious entrepreneurs", 
      "Creative coaches and transformational leaders",
      "Nature-inspired brands and businesses",
      "Feminine entrepreneurs ready to claim their power",
      "Anyone who wants sophistication with an edge"
    ]
  },
  'luxe-feminine': {
    description: "This is for the woman who knows that pink can be powerful. Luxe Feminine combines sophisticated burgundy with soft blush tones - it's femininity with confidence, elegance with edge. Perfect for luxury lifestyle brands, beauty businesses, and any woman who wants to embrace her feminine power unapologetically.",
    
    customization: {
      colors: "The burgundy/blush palette is absolutely gorgeous, but I can totally customize this to match your brand while keeping that sophisticated feminine energy. We could go deeper with wine and rose gold, or softer with lavender and cream - whatever feels most 'you'.",
      fonts: "The serif headlines with script accents create such beautiful contrast. We can adjust these to match your personality - maybe something more modern if you're in tech, or more romantic if you're in beauty. The key is maintaining that luxe feminine hierarchy.",
      layout: "Want more emphasis on your story? Less focus on applications? We can totally rearrange this template while keeping that sophisticated flow that makes everything feel intentional and expensive.",
      sections: "Every woman's brand is different. Maybe you need more brand guidelines, or maybe you're super visual and want a bigger mood board. We can customize sections to match how you work and what your clients need to see."
    },
    
    suggestions: [
      "Perfect for beauty and lifestyle entrepreneurs who want luxury positioning",
      "Amazing for coaches and consultants who serve other women",
      "Great for fashion, jewelry, and luxury product businesses",
      "Ideal for wedding and event professionals who need that romantic sophistication",
      "Perfect for women-focused brands that want to feel premium and approachable"
    ],
    
    tips: [
      "The burgundy creates instant luxury and sophistication without being cold",
      "Use the circular color palette to create brand consistency across all touchpoints",
      "The script typography adds that personal, handcrafted feel that builds trust",
      "Mix lifestyle portraits with elegant product shots for maximum impact"
    ],
    
    bestFor: [
      "Beauty and wellness entrepreneurs",
      "Luxury lifestyle and fashion brands", 
      "Women-focused coaches and consultants",
      "Wedding and event professionals",
      "Premium service providers targeting women",
      "Anyone building a sophisticated feminine brand"
    ]
  }
};

// Template registry for easy access
export const templateRegistry = {
  brandbook: {
    'executive-essence': executiveEssenceConfig,
    'refined-minimalist': refinedMinimalistConfig,
    'bold-femme': boldFemmeConfig,
    'luxe-feminine': luxeFeminineConfig
  },
  dashboard: {
    // Dashboard templates will go here
  },
  landingPage: {
    // Landing page templates will go here
  }
};

export type TemplateCategory = keyof typeof templateRegistry;
export type TemplateId = string;
/**
 * SANDRA'S OFFICIAL DESIGN SYSTEM
 * Complete editorial luxury aesthetic for SSELFIE Studio
 * ALL AGENTS MUST USE THESE EXACT PATTERNS
 */

export const SANDRA_DESIGN_SYSTEM = {
  // COLORS - EXACT HEX VALUES
  colors: {
    black: '#0a0a0a',
    white: '#ffffff', 
    editorialGray: '#f5f5f5',
    midGray: '#fafafa',
    softGray: '#666666',
    accentLine: '#e5e5e5'
  },

  // TYPOGRAPHY - EXACT SPECIFICATIONS
  typography: {
    // Primary font stack
    serif: "'Times New Roman', serif",
    sans: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    
    // Headlines (always uppercase, Times New Roman)
    h1: {
      fontFamily: "'Times New Roman', serif",
      fontSize: 'clamp(4rem, 8vw, 8rem)',
      fontWeight: '200',
      letterSpacing: '-0.01em',
      lineHeight: '1',
      textTransform: 'uppercase',
      marginBottom: '24px'
    },
    
    h2: {
      fontFamily: "'Times New Roman', serif", 
      fontSize: 'clamp(3rem, 6vw, 6rem)',
      fontWeight: '200',
      letterSpacing: '-0.01em',
      lineHeight: '1',
      textTransform: 'uppercase',
      marginBottom: '32px'
    },
    
    h3: {
      fontFamily: "'Times New Roman', serif",
      fontSize: 'clamp(2rem, 4vw, 4rem)', 
      fontWeight: '200',
      letterSpacing: '-0.01em',
      lineHeight: '1',
      textTransform: 'uppercase',
      marginBottom: '24px'
    },

    // Hero Typography (full-bleed sections)
    heroMain: {
      fontFamily: "'Times New Roman', serif",
      fontSize: 'clamp(5rem, 12vw, 12rem)',
      lineHeight: '0.9',
      fontWeight: '200',
      letterSpacing: '0.3em',
      textTransform: 'uppercase'
    },
    
    heroSub: {
      fontFamily: "'Times New Roman', serif",
      fontSize: 'clamp(1.5rem, 4vw, 3rem)',
      lineHeight: '1',
      fontWeight: '200', 
      letterSpacing: '0.5em',
      textTransform: 'uppercase',
      opacity: '0.8'
    },

    // Eyebrow text (small labels)
    eyebrow: {
      fontSize: '11px',
      fontWeight: '400',
      letterSpacing: '0.4em',
      textTransform: 'uppercase',
      color: '#666666'
    },

    // Editorial quotes (large italic text)
    editorialQuote: {
      fontFamily: "'Times New Roman', serif",
      fontSize: 'clamp(2rem, 5vw, 4rem)',
      fontStyle: 'italic',
      letterSpacing: '-0.02em',
      lineHeight: '1.2',
      fontWeight: '300'
    },

    // Body text
    body: {
      fontSize: '16px',
      lineHeight: '1.6',
      fontWeight: '300',
      maxWidth: '600px'
    },

    // Navigation
    nav: {
      fontSize: '11px',
      fontWeight: '400',
      letterSpacing: '0.3em',
      textTransform: 'uppercase'
    }
  },

  // LAYOUT PATTERNS
  layout: {
    // Section spacing
    sectionPadding: '120px 0',
    containerMaxWidth: '1400px',
    containerPadding: '0 40px',
    
    // Grid system
    grid: 'repeat(12, 1fr)',
    gridGap: '30px',
    
    // Hero sections (full viewport)
    heroMinHeight: '100vh',
    heroAlignment: 'center',
    
    // Card padding
    cardPadding: '60px'
  },

  // COMPONENT PATTERNS
  components: {
    // Navigation bar
    nav: {
      position: 'fixed',
      top: '0',
      background: 'rgba(255, 255, 255, 0.95)',
      backdropFilter: 'blur(10px)',
      borderBottom: '1px solid #e5e5e5',
      padding: '20px 0',
      zIndex: '1000'
    },

    // Buttons
    button: {
      padding: '16px 32px',
      fontSize: '11px', 
      fontWeight: '400',
      letterSpacing: '0.3em',
      textTransform: 'uppercase',
      border: '1px solid #0a0a0a',
      background: 'transparent',
      transition: 'all 300ms ease'
    },

    // Image containers
    imageContainer: {
      position: 'relative',
      overflow: 'hidden',
      background: '#f5f5f5',
      transition: 'transform 1000ms cubic-bezier(0.4, 0, 0.2, 1)'
    },

    // Aspect ratios
    aspectRatios: {
      portrait: '4/5',
      square: '1/1', 
      wide: '16/9',
      editorial: '3/4'
    }
  },

  // RESPONSIVE BREAKPOINTS
  breakpoints: {
    tablet: '1024px',
    mobile: '768px'
  },

  // ANIMATION TIMING
  animations: {
    fast: '300ms ease',
    medium: '500ms ease', 
    slow: '1000ms cubic-bezier(0.4, 0, 0.2, 1)'
  }
};

// TAILWIND CSS CLASSES - EXACT MAPPINGS
export const SANDRA_TAILWIND_CLASSES = {
  // Typography classes
  heroTitle: "font-serif text-6xl sm:text-8xl md:text-9xl xl:text-[12rem] font-extralight tracking-[0.3em] uppercase leading-none",
  heroSubtitle: "font-serif text-2xl sm:text-4xl font-extralight tracking-[0.5em] uppercase opacity-80",
  eyebrow: "text-[11px] font-normal tracking-[0.4em] uppercase text-gray-600",
  navLink: "text-[11px] font-normal tracking-[0.3em] uppercase",
  
  // Layout classes
  section: "py-[120px]",
  container: "max-w-[1400px] mx-auto px-10",
  fullBleedHero: "min-h-screen flex items-center justify-center bg-black text-white relative overflow-hidden",
  
  // Component classes
  editorialCard: "bg-white hover:bg-black hover:text-white transition-all duration-500",
  imageHover: "transform transition-transform duration-1000 hover:scale-105",
  button: "inline-block py-4 px-8 text-[11px] font-normal tracking-[0.3em] uppercase border border-black hover:bg-black hover:text-white transition-all duration-300",
  
  // Color classes
  primaryBg: "bg-[#0a0a0a]",
  primaryText: "text-[#0a0a0a]", 
  editorialBg: "bg-[#f5f5f5]",
  accentBorder: "border-[#e5e5e5]"
};

// USAGE EXAMPLES FOR AGENTS
export const DESIGN_PATTERNS = {
  // Hero section pattern
  heroSection: `
    <section className="min-h-screen flex items-center justify-center bg-black text-white relative overflow-hidden">
      <div className="absolute inset-0 opacity-40">
        <img src="hero-image.jpg" className="w-full h-full object-cover" />
      </div>
      <div className="relative z-10 text-center">
        <p className="text-[11px] tracking-[0.4em] uppercase text-white/70 mb-10">
          Eyebrow text
        </p>
        <h1 className="font-serif text-6xl sm:text-8xl md:text-9xl xl:text-[12rem] font-extralight tracking-[0.3em] uppercase leading-none mb-5">
          SSELFIE
        </h1>
        <p className="font-serif text-2xl sm:text-4xl font-extralight tracking-[0.5em] uppercase opacity-80">
          STUDIO
        </p>
      </div>
    </section>
  `,

  // Navigation pattern
  navigation: `
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200 py-5">
      <div className="max-w-[1400px] mx-auto px-10 flex justify-between items-center">
        <div className="font-serif text-xl font-normal">SSELFIE STUDIO</div>
        <div className="hidden md:flex space-x-10">
          <a className="text-[11px] tracking-[0.3em] uppercase hover:opacity-60 transition-opacity">About</a>
          <a className="text-[11px] tracking-[0.3em] uppercase hover:opacity-60 transition-opacity">Pricing</a>
        </div>
      </div>
    </nav>
  `,

  // Editorial card pattern
  editorialCard: `
    <div className="bg-white hover:bg-black hover:text-white transition-all duration-500 group">
      <div className="p-15">
        <p className="text-[11px] tracking-[0.4em] uppercase text-gray-600 group-hover:text-white/70 mb-6">
          Category
        </p>
        <h3 className="font-serif text-4xl font-extralight uppercase mb-6">
          Title
        </h3>
        <p className="text-base font-light leading-relaxed">
          Description text
        </p>
      </div>
    </div>
  `
};

export function getDesignSystemForAgent(agentName: string): string {
  return `
SANDRA'S DESIGN SYSTEM FOR ${agentName.toUpperCase()}

MANDATORY DESIGN RULES:
1. Typography: Always use Times New Roman for headlines, tracking-[0.4em] for uppercase text
2. Colors: Black (#0a0a0a), White (#ffffff), Editorial Gray (#f5f5f5)
3. Hero sections: Full viewport height, centered content, background images with 40% opacity
4. Navigation: Fixed top, 11px font, 0.3em tracking, uppercase
5. Buttons: 11px text, 0.3em tracking, uppercase, border hover effects
6. Layout: 120px section padding, 1400px max container width
7. Animations: 300ms for interactions, 500ms for hover states

EXACT TAILWIND CLASSES TO USE:
- Hero titles: font-serif text-6xl sm:text-8xl md:text-9xl xl:text-[12rem] font-extralight tracking-[0.3em] uppercase leading-none
- Eyebrow text: text-[11px] font-normal tracking-[0.4em] uppercase text-gray-600
- Sections: py-[120px]
- Containers: max-w-[1400px] mx-auto px-10
- Full bleed hero: min-h-screen flex items-center justify-center bg-black text-white relative overflow-hidden

NEVER deviate from these patterns. Match existing components exactly.
  `;
}
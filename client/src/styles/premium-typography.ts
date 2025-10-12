// Premium Typography System for SSELFIE Brand Studio
// Based on luxury design principles while maintaining readability

export const PremiumTypography = {
  // Font families
  fonts: {
    luxury: 'var(--font-luxury, "Times New Roman", serif)',
    sans: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Helvetica Neue", Arial, sans-serif',
    mono: 'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace'
  },

  // Font weights
  weights: {
    thin: 100,
    extraLight: 200,
    light: 300,
    regular: 400,
    medium: 500,
    semiBold: 600,
    bold: 700
  },

  // Font sizes (rem units for scalability)
  sizes: {
    xs: '0.75rem',      // 12px
    sm: '0.875rem',     // 14px
    base: '1rem',       // 16px
    lg: '1.125rem',     // 18px
    xl: '1.25rem',      // 20px
    '2xl': '1.5rem',    // 24px
    '3xl': '1.875rem',  // 30px
    '4xl': '2.25rem',   // 36px
    '5xl': '3rem',      // 48px
    '6xl': '3.75rem',   // 60px
    '7xl': '4.5rem',    // 72px
  },

  // Line heights
  leading: {
    none: 1,
    tight: 1.1,
    snug: 1.25,
    normal: 1.5,
    relaxed: 1.625,
    loose: 2
  },

  // Letter spacing
  tracking: {
    tighter: '-0.05em',
    tight: '-0.025em',
    normal: '0em',
    wide: '0.1em',
    wider: '0.2em',
    widest: '0.4em'
  }
} as const;

// Typography utility classes
export const TypographyClasses = {
  // Headings - Editorial Luxury Scale
  h1: `font-serif text-5xl sm:text-6xl font-light leading-tight tracking-wider text-stone-900`,
  h2: `font-serif text-3xl sm:text-4xl font-light leading-tight tracking-wide text-stone-900`,
  h3: `font-serif text-2xl sm:text-3xl font-light leading-snug tracking-wide text-stone-900`,
  h4: `font-serif text-xl sm:text-2xl font-light leading-snug tracking-normal text-stone-900`,
  h5: `font-serif text-lg sm:text-xl font-light leading-snug tracking-normal text-stone-900`,
  h6: `font-serif text-base sm:text-lg font-light leading-snug tracking-normal text-stone-900`,

  // Editorial Headline - Standardized tracking
  editorialHeadline: `font-serif font-light leading-tight tracking-wide text-stone-900`,
  editorialHeadlineLarge: `font-serif text-5xl sm:text-6xl font-light leading-tight tracking-wide text-stone-900`,
  editorialHeadlineMedium: `font-serif text-3xl sm:text-4xl font-light leading-tight tracking-wide text-stone-900`,
  editorialHeadlineSmall: `font-serif text-xl sm:text-2xl font-light leading-snug tracking-wide text-stone-900`,

  // Body text
  body: `font-sans text-base font-light leading-relaxed text-stone-700`,
  bodyLarge: `font-sans text-lg font-light leading-relaxed text-stone-700`,
  bodySmall: `font-sans text-sm font-light leading-normal text-stone-600`,

  // Captions and labels
  caption: `font-sans text-xs font-light leading-normal tracking-wide uppercase text-stone-500`,
  label: `font-sans text-sm font-medium leading-normal tracking-normal text-stone-700`,

  // Interactive elements
  button: `font-sans text-sm font-medium leading-none tracking-wide uppercase`,
  link: `font-sans text-base font-medium leading-normal text-stone-900 hover:text-stone-700`,

  // Status and metadata
  status: `font-sans text-xs font-light leading-none tracking-widest uppercase text-stone-500`,
  time: `font-sans text-sm font-light leading-none tracking-wide text-stone-900`,
} as const;

// Component-specific typography
export const ComponentTypography = {
  statusBar: {
    time: `text-stone-900 font-light tracking-wide text-sm sm:text-base`,
    indicator: `text-xs tracking-widest uppercase font-light text-stone-600`
  },
  
  tabBar: {
    label: `text-xs tracking-wide uppercase font-light transition-all duration-300`,
    activeLabel: `text-stone-900`,
    inactiveLabel: `text-stone-500`
  },

  brand: {
    primary: `text-4xl sm:text-5xl font-serif font-thin tracking-widest text-stone-900 uppercase leading-none`,
    subtitle: `text-xs font-light tracking-widest uppercase text-stone-500 opacity-70`
  }
} as const;

export default PremiumTypography;
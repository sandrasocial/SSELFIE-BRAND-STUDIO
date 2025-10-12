// Design System Constants
// Provides consistent typography, colors, and spacing for luxury brand experience

export const Typography = {
  heading: {
    fontFamily: 'var(--font-luxury, "Times New Roman", serif)', // Times New Roman luxury font
    fontWeight: 300, // Light weight for elegance
    fontSize: {
      h1: '2.5rem',   // 40px
      h2: '2rem',     // 32px
      h3: '1.75rem',  // 28px
      h4: '1.5rem',   // 24px
      h5: '1.25rem',  // 20px
      h6: '1.125rem'  // 18px
    },
    lineHeight: {
      tight: 0.9,
      normal: 1.2,
      relaxed: 1.4
    },
    letterSpacing: {
      tight: '-0.02em',
      normal: '0',
      wide: '0.2em',
      wider: '0.4em'
    }
  },
  body: {
    fontFamily: 'var(--font-sans, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif)', // System font
    fontWeight: {
      light: 300,
      normal: 400,
      medium: 500,
      semibold: 600
    },
    fontSize: {
      xs: '0.75rem',   // 12px
      sm: '0.875rem',  // 14px
      base: '1rem',    // 16px
      lg: '1.125rem',  // 18px
      xl: '1.25rem',   // 20px
      '2xl': '1.5rem'  // 24px
    },
    lineHeight: {
      tight: 1.25,
      normal: 1.5,
      relaxed: 1.75
    }
  }
} as const;

export const Colors = {
  primary: '#000000',     // Pure black for luxury
  secondary: '#666666',   // Dark gray for secondary text
  accent: '#B8860B',      // Dark gold for accents
  
  background: {
    main: '#FFFFFF',      // Pure white main background
    alt: '#F5F5F5',       // Light gray alternative background
    dark: '#0A0A0A',      // Near black for dark sections
    overlay: 'rgba(0, 0, 0, 0.7)' // Dark overlay
  },
  
  text: {
    primary: '#0A0A0A',     // Near black for primary text
    secondary: '#666666',   // Gray for secondary text
    muted: '#999999',       // Light gray for muted text
    inverse: '#FFFFFF',     // White text for dark backgrounds
    accent: '#B8860B'       // Gold for accent text
  },
  
  status: {
    success: '#2E7D32',     // Green for success states
    error: '#D32F2F',       // Red for error states
    warning: '#ED6C02',     // Orange for warning states
    info: '#0288D1',        // Blue for info states
    processing: '#1976D2'   // Blue for processing states
  },
  
  border: {
    light: '#E5E5E5',       // Light border
    medium: '#D1D5DB',      // Medium border
    dark: '#374151',        // Dark border
    accent: '#B8860B'       // Gold border for accents
  },
  
  interactive: {
    hover: 'rgba(0, 0, 0, 0.05)',      // Light hover state
    active: 'rgba(0, 0, 0, 0.1)',      // Active state
    focus: 'rgba(184, 134, 11, 0.2)',  // Gold focus ring
    disabled: 'rgba(0, 0, 0, 0.1)'     // Disabled state
  }
} as const;

export const Spacing = {
  // Base unit: 4px
  0: '0',
  1: '0.25rem',   // 4px
  2: '0.5rem',    // 8px
  3: '0.75rem',   // 12px
  4: '1rem',      // 16px
  5: '1.25rem',   // 20px
  6: '1.5rem',    // 24px
  8: '2rem',      // 32px
  10: '2.5rem',   // 40px
  12: '3rem',     // 48px
  16: '4rem',     // 64px
  20: '5rem',     // 80px
  24: '6rem',     // 96px
  32: '8rem',     // 128px
  
  // Luxury spacing - generous margins
  luxury: {
    xs: '1.5rem',   // 24px
    sm: '2rem',     // 32px
    md: '3rem',     // 48px
    lg: '4rem',     // 64px
    xl: '6rem',     // 96px
    '2xl': '8rem'   // 128px
  }
} as const;

export const BorderRadius = {
  none: '0',
  sm: '0.125rem',   // 2px - consistent with requirements
  md: '0.25rem',    // 4px
  lg: '0.5rem',     // 8px
  xl: '0.75rem',    // 12px
  '2xl': '1rem',    // 16px
  full: '9999px'    // Fully rounded
} as const;

export const Shadows = {
  none: 'none',
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  
  // Luxury shadows - subtle and elegant
  luxury: {
    subtle: '0 2px 4px rgba(0, 0, 0, 0.1)',
    card: '0 4px 8px rgba(0, 0, 0, 0.1)',
    elevated: '0 8px 16px rgba(0, 0, 0, 0.1)',
    dramatic: '0 16px 32px rgba(0, 0, 0, 0.15)'
  }
} as const;

export const Transitions = {
  duration: {
    fast: '150ms',
    normal: '300ms',
    slow: '500ms'
  },
  timing: {
    ease: 'ease',
    easeIn: 'ease-in',
    easeOut: 'ease-out',
    easeInOut: 'ease-in-out'
  },
  
  // Luxury transitions - smooth and refined
  luxury: {
    hover: 'all 300ms ease-out',
    focus: 'all 200ms ease-out',
    transform: 'transform 400ms ease-out'
  }
} as const;

export const Breakpoints = {
  xs: '475px',
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px'
} as const;

// CSS Custom Properties Generator
export const generateCSSVars = () => {
  return `
    :root {
      /* Typography */
      --font-luxury: "Times New Roman", serif;
      --font-sans: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      
      /* Colors */
      --color-primary: ${Colors.primary};
      --color-secondary: ${Colors.secondary};
      --color-accent: ${Colors.accent};
      --color-background: ${Colors.background.main};
      --color-background-alt: ${Colors.background.alt};
      --color-background-dark: ${Colors.background.dark};
      
      /* Spacing */
      --spacing-luxury-xs: ${Spacing.luxury.xs};
      --spacing-luxury-sm: ${Spacing.luxury.sm};
      --spacing-luxury-md: ${Spacing.luxury.md};
      --spacing-luxury-lg: ${Spacing.luxury.lg};
      --spacing-luxury-xl: ${Spacing.luxury.xl};
      --spacing-luxury-2xl: ${Spacing.luxury['2xl']};
      
      /* Border Radius */
      --border-radius: ${BorderRadius.sm};
      
      /* Transitions */
      --transition-luxury-hover: ${Transitions.luxury.hover};
      --transition-luxury-focus: ${Transitions.luxury.focus};
    }
  `;
};
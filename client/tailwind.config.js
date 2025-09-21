/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./public/**/*.html",
    "./**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: ["class"],
  theme: {
    extend: {
      fontFamily: {
        'serif': ['Times New Roman', 'Times', 'Georgia', 'serif'],
        'sans': ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Helvetica Neue', 'Arial', 'sans-serif'],
        'display': ['Times New Roman', 'Times', 'Georgia', 'serif'],
      },
      fontSize: {
        // Editorial display sizes with ultra-wide letter spacing
        'display-9xl': ['8rem', { lineHeight: '0.85', letterSpacing: '0.4em', fontWeight: '200' }],
        'display-8xl': ['6rem', { lineHeight: '0.85', letterSpacing: '0.4em', fontWeight: '200' }],
        'display-7xl': ['4.5rem', { lineHeight: '0.9', letterSpacing: '0.3em', fontWeight: '200' }],
        'display-6xl': ['3.75rem', { lineHeight: '0.9', letterSpacing: '0.3em', fontWeight: '200' }],
        'display-2xl': ['3rem', { lineHeight: '1.1', letterSpacing: '0.3em', fontWeight: '200' }],
        'display-xl': ['2.5rem', { lineHeight: '1.15', letterSpacing: '0.2em', fontWeight: '200' }],
        
        // Section and spaced titles
        'title-3xl': ['1.875rem', { lineHeight: '1', letterSpacing: '0.6em', fontWeight: '200' }],
        'title-2xl': ['1.5rem', { lineHeight: '1', letterSpacing: '0.4em', fontWeight: '200' }],
        'title-xl': ['1.25rem', { lineHeight: '1.1', letterSpacing: '0.3em', fontWeight: '200' }],
        
        // Editorial quotes
        'quote-6xl': ['3.75rem', { lineHeight: '1.15', letterSpacing: '-0.02em', fontWeight: '300' }],
        'quote-5xl': ['3rem', { lineHeight: '1.15', letterSpacing: '-0.02em', fontWeight: '300' }],
        
        // Existing sizes enhanced
        'heading-1': ['1.75rem', { lineHeight: '1.25', letterSpacing: '0.2em', fontWeight: '200' }],
        'heading-2': ['1.375rem', { lineHeight: '1.3', letterSpacing: '0.15em', fontWeight: '200' }],
        'body-lg': ['1.125rem', { lineHeight: '1.8', fontWeight: '300' }],
        'body': ['1rem', { lineHeight: '1.7', fontWeight: '300' }],
        'caption': ['0.75rem', { lineHeight: '1.4', letterSpacing: '0.2em', fontWeight: '300' }],
        'eyebrow': ['0.625rem', { lineHeight: '1.4', letterSpacing: '0.5em', fontWeight: '300' }],
      },
      letterSpacing: {
        'ultra-wide': '0.6em',
        'extra-wide': '0.4em',
        'wide': '0.3em',
        'normal-wide': '0.2em',
        'slight': '0.1em',
        'tight': '-0.01em',
        'tighter': '-0.02em',
        'normal': '0em',
      },
      fontWeight: {
        'extralight': '200',
        'light': '300',
        'normal': '400',
        'medium': '500',
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        'editorial-sm': '0.75rem',   /* 12px */
        'editorial-md': '1rem',      /* 16px */
        'editorial-lg': '1.5rem',    /* 24px */
        'editorial-xl': '2rem',      /* 32px */
      },
      colors: {
        /* Original shadcn colors maintained for compatibility */
        background: "var(--background)",
        foreground: "var(--foreground)",
        card: {
          DEFAULT: "var(--card)",
          foreground: "var(--card-foreground)",
        },
        popover: {
          DEFAULT: "var(--popover)",
          foreground: "var(--popover-foreground)",
        },
        primary: {
          DEFAULT: "var(--primary)",
          foreground: "var(--primary-foreground)",
        },
        secondary: {
          DEFAULT: "var(--secondary)",
          foreground: "var(--secondary-foreground)",
        },
        muted: {
          DEFAULT: "var(--muted)",
          foreground: "var(--muted-foreground)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          foreground: "var(--accent-foreground)",
        },
        destructive: {
          DEFAULT: "var(--destructive)",
          foreground: "var(--destructive-foreground)",
        },
        border: "var(--border)",
        input: "var(--input)",
        ring: "var(--ring)",
        
        /* Editorial Luxury Color System */
        'editorial': {
          'background': 'var(--color-background)',
          'surface': 'var(--color-surface)',
          'surface-elevated': 'var(--color-surface-elevated)',
          'text-primary': 'var(--color-text-primary)',
          'text-secondary': 'var(--color-text-secondary)',
          'text-tertiary': 'var(--color-text-tertiary)',
          'accent-primary': 'var(--color-accent-primary)',
          'accent-secondary': 'var(--color-accent-secondary)',
          'accent-tertiary': 'var(--color-accent-tertiary)',
        },
        /* Enhanced Neutral System for Editorial Luxury */
        'neutral': {
          50: '#FAFAFA',
          100: '#F5F5F5',
          200: '#E5E5E5',
          300: '#D4D4D4',
          400: '#A3A3A3',
          500: '#737373',
          600: '#525252',
          700: '#404040',
          800: '#262626',
          900: '#171717',
          950: '#0A0A0A',
        },
      },
      boxShadow: {
        'editorial': '0 25px 50px -12px rgba(0, 0, 0, 0.6)',
        'editorial-lg': '0 35px 60px -15px rgba(0, 0, 0, 0.7)',
        'editorial-xl': '0 45px 80px -20px rgba(0, 0, 0, 0.8)',
        'luxury': '0 8px 32px rgba(0, 0, 0, 0.3)',
        'luxury-lg': '0 16px 48px rgba(0, 0, 0, 0.4)',
        'subtle': '0 4px 6px -1px rgba(0, 0, 0, 0.3)',
      },
      transitionTimingFunction: {
        'editorial': 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        'sophisticated': 'cubic-bezier(0.4, 0, 0.2, 1)',
        'luxury-ease': 'cubic-bezier(0.23, 1, 0.32, 1)',
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '112': '28rem',
        'editorial-xs': '0.75rem',
        'editorial-sm': '1.25rem',
        'editorial-md': '2rem',
        'editorial-lg': '3rem',
        'editorial-xl': '4rem',
        'editorial-2xl': '6rem',
      },
      backdropBlur: {
        'editorial': '20px',
        'editorial-lg': '40px',
      },
      padding: {
        'editorial-xs': '0.75rem',
        'editorial-sm': '1.25rem',
        'editorial-md': '2rem',
        'editorial-lg': '3rem',
        'editorial-xl': '4rem',
        'editorial-2xl': '6rem',
      },
      margin: {
        'editorial-xs': '0.75rem',
        'editorial-sm': '1.25rem',
        'editorial-md': '2rem',
        'editorial-lg': '3rem',
        'editorial-xl': '4rem',
        'editorial-2xl': '6rem',
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "editorial-fade-in": {
          from: { opacity: "0", transform: "translateY(20px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "editorial-scale-in": {
          from: { opacity: "0", transform: "scale(0.9)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
        "editorial-spin": {
          to: { transform: "rotate(360deg)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "editorial-fade-in": "editorial-fade-in 0.5s var(--ease-sophisticated) forwards",
        "editorial-scale-in": "editorial-scale-in 0.3s var(--ease-editorial) forwards",
        "editorial-spin": "editorial-spin 1s linear infinite",
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
};
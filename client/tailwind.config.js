/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "../shared/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: ["class"],
  theme: {
    extend: {
      fontFamily: {
        'times': ['Times New Roman', 'Times', 'serif'],
        'sans': ['Inter', 'SF Pro Display', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        'display': ['Inter', 'SF Pro Display', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'display-2xl': ['3rem', { lineHeight: '1.1', letterSpacing: '0.1em', fontWeight: '300' }],
        'display-xl': ['2.5rem', { lineHeight: '1.15', letterSpacing: '0.05em', fontWeight: '300' }],
        'heading-1': ['1.75rem', { lineHeight: '1.25', letterSpacing: '0.025em', fontWeight: '300' }],
        'heading-2': ['1.375rem', { lineHeight: '1.3', letterSpacing: '0.025em', fontWeight: '300' }],
        'body-lg': ['1.125rem', { lineHeight: '1.6', fontWeight: '300' }],
        'body': ['1rem', { lineHeight: '1.6', fontWeight: '300' }],
        'caption': ['0.75rem', { lineHeight: '1.4', letterSpacing: '0.05em', fontWeight: '400' }],
      },
      letterSpacing: {
        'ultra-wide': '0.2em',
        'extra-wide': '0.1em',
        'wide': '0.05em',
        'normal': '0em',
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      colors: {
        // Editorial Luxury Palette
        'editorial': {
          black: '#000000',
          surface: '#0A0A0A', 
          elevated: '#171717',
        },
        // Sophisticated Neutrals
        neutral: {
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
        // Editorial Theme Variables
        background: "var(--background)",
        foreground: "var(--foreground)",
        'surface': "var(--surface)",
        'surface-elevated': "var(--surface-elevated)",
        'text-primary': "var(--text-primary)",
        'text-secondary': "var(--text-secondary)",
        'text-tertiary': "var(--text-tertiary)",
        'accent-primary': "var(--accent-primary)",
        'accent-secondary': "var(--accent-secondary)",
        'accent-tertiary': "var(--accent-tertiary)",
        // Original color system (preserved)
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
      },
      // Editorial spacing scale
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '112': '28rem',
      },
      // Editorial shadow system
      boxShadow: {
        'editorial': '0 25px 50px -12px rgba(0, 0, 0, 0.6)',
        'editorial-lg': '0 35px 60px -15px rgba(0, 0, 0, 0.7)',
        'editorial-xl': '0 45px 80px -20px rgba(0, 0, 0, 0.8)',
        'subtle': '0 4px 6px -1px rgba(0, 0, 0, 0.3)',
      },
      // Sophisticated animation curves
      transitionTimingFunction: {
        'editorial': 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        'sophisticated': 'cubic-bezier(0.4, 0, 0.2, 1)',
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
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
    require('@tailwindcss/forms'),
  ],
};
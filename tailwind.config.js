/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'luxury-black': '#0a0a0a',
        'pure-white': '#ffffff', 
        'editorial-gray': '#f5f5f5',
        'mid-gray': '#fafafa',
        'soft-gray': '#666666',
        'accent-line': '#e5e5e5'
      },
      fontFamily: {
        'editorial': ['Times New Roman', 'Times', 'serif'],
        'system': ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif']
      },
      letterSpacing: {
        'luxury': '-0.01em',
        'tracked': '0.4em'
      },
      fontSize: {
        'headline': ['3.5rem', {
          lineHeight: '1.1',
          letterSpacing: '-0.02em',
          fontWeight: '400'
        }],
        'subhead': ['1.25rem', {
          lineHeight: '1.5',
          letterSpacing: '-0.01em',
          fontWeight: '400'
        }]
      }
    },
  },
  plugins: [],
}
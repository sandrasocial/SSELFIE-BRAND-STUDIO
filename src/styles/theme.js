export const theme = {
  colors: {
    primary: '#FF69B4', // SSELFIE brand pink
    secondary: '#4A90E2',
    accent: '#7E57C2',
    background: '#FFFFFF',
    text: '#333333',
    error: '#FF5252',
    success: '#4CAF50'
  },
  typography: {
    fontFamily: "'Poppins', sans-serif",
    h1: {
      fontSize: '2.5rem',
      fontWeight: 600,
      lineHeight: 1.2
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 500,
      lineHeight: 1.3
    },
    body: {
      fontSize: '1rem',
      lineHeight: 1.5
    }
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem'
  },
  breakpoints: {
    mobile: '320px',
    tablet: '768px',
    desktop: '1024px',
    wide: '1440px'
  },
  shadows: {
    small: '0 2px 4px rgba(0,0,0,0.1)',
    medium: '0 4px 6px rgba(0,0,0,0.1)',
    large: '0 10px 15px rgba(0,0,0,0.1)'
  },
  transitions: {
    default: '0.3s ease-in-out'
  }
}
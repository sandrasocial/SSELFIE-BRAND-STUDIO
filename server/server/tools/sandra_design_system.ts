/**
 * SSELFIE Studio Design System
 * Created by Sandra - Luxury Editorial Aesthetic
 */

export const SandraDesignSystem = {
  typography: {
    fontFamily: 'Times New Roman, serif',
    tracking: '0.4em',
  },
  
  colors: {
    primary: '#000000', // Black
    secondary: '#FFFFFF', // White
    accent: '#808080', // Editorial Gray
  },

  layout: {
    heroes: {
      type: 'full-bleed',
      width: '100vw',
    },
    sections: {
      padding: '120px',
    }
  },

  // Design principles
  principles: {
    luxury: true,
    editorial: true,
    consistency: 'mandatory',
    deviations: 'not-allowed',
  }
};

export const designSystemVersion = '1.0.0';

// Utility functions for implementing design patterns
export const getTypographyStyles = () => {
  return {
    fontFamily: SandraDesignSystem.typography.fontFamily,
    letterSpacing: SandraDesignSystem.typography.tracking,
  };
};

export const getLayoutStyles = () => {
  return {
    padding: SandraDesignSystem.layout.sections.padding,
  };
};

// Export design system for global use
export default SandraDesignSystem;
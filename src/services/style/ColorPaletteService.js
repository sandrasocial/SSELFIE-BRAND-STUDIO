class ColorPaletteService {
  constructor() {
    this.colorHarmonies = {
      neutral: {
        primary: ['#F5F5F5', '#E0E0E0', '#9E9E9E', '#616161', '#212121'],
        accent: ['#A1887F', '#90A4AE']
      },
      earth: {
        primary: ['#8D6E63', '#795548', '#6D4C41', '#5D4037', '#4E342E'],
        accent: ['#A1887F', '#D7CCC8']
      },
      vibrant: {
        primary: ['#FF4081', '#536DFE', '#00BCD4', '#76FF03', '#FFC107'],
        accent: ['#FF9800', '#9C27B0']
      },
      monochrome: {
        primary: ['#FFFFFF', '#BDBDBD', '#757575', '#424242', '#000000'],
        accent: ['#9E9E9E']
      },
      dramatic: {
        primary: ['#B71C1C', '#880E4F', '#311B92', '#006064', '#1B5E20'],
        accent: ['#FF6F00', '#4A148C']
      }
    };
  }

  generatePersonalPalette(styleProfile) {
    const { primaryStyle, secondaryStyle } = styleProfile;
    
    return {
      mainColors: this.selectMainColors(primaryStyle),
      accentColors: this.selectAccentColors(secondaryStyle),
      recommendations: this.generateColorRecommendations()
    };
  }

  selectMainColors(style) {
    // Select appropriate color harmony based on style
    const harmonyKey = this.mapStyleToHarmony(style);
    return this.colorHarmonies[harmonyKey].primary;
  }

  selectAccentColors(style) {
    // Select complementary accent colors
    const harmonyKey = this.mapStyleToHarmony(style);
    return this.colorHarmonies[harmonyKey].accent;
  }

  mapStyleToHarmony(style) {
    // Map style characteristics to color harmonies
    const styleToHarmonyMap = {
      classic: 'neutral',
      creative: 'vibrant',
      minimalist: 'monochrome',
      bold: 'dramatic'
    };
    return styleToHarmonyMap[style] || 'neutral';
  }

  generateColorRecommendations() {
    return {
      businessFormal: {
        primary: 'Use your darkest neutral as your base color',
        accent: 'Add one vibrant accent color for accessories',
        combinations: [
          'Dark neutral + light neutral + subtle accent',
          'Monochromatic look with textural variation'
        ]
      },
      casualProfessional: {
        primary: 'Mix your mid-tone neutrals',
        accent: 'Incorporate two complementary accent colors',
        combinations: [
          'Mid neutral + light neutral + bold accent',
          'Two neutrals + subtle pattern + accent color'
        ]
      },
      personalBranding: {
        primary: 'Choose one signature color from your palette',
        accent: 'Use consistent accent colors across platforms',
        combinations: [
          'Signature color + neutral base + metallic accent',
          'Two brand colors + white space for balance'
        ]
      }
    };
  }
}

module.exports = ColorPaletteService;
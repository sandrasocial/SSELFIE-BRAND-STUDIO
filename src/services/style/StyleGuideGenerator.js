const StyleAnalysisService = require('./StyleAnalysisService');
const ColorPaletteService = require('./ColorPaletteService');

class StyleGuideGenerator {
  constructor() {
    this.styleAnalysis = new StyleAnalysisService();
    this.colorPalette = new ColorPaletteService();
    
    this.photoTemplates = {
      professional: {
        poses: [
          'Confident crossed arms',
          'Desk thought leader',
          'Presenting stance',
          'Approachable headshot'
        ],
        props: [
          'Laptop or tablet',
          'Modern office background',
          'Industry-specific tools',
          'Books or journals'
        ]
      },
      creative: {
        poses: [
          'Action shots',
          'Candid working moments',
          'Interactive poses',
          'Artistic angles'
        ],
        props: [
          'Creative tools',
          'Colorful backgrounds',
          'Natural elements',
          'Unique textures'
        ]
      },
      lifestyle: {
        poses: [
          'Natural walking',
          'Genuine laughter',
          'Casual lean',
          'Environmental interaction'
        ],
        props: [
          'Urban settings',
          'Nature backgrounds',
          'Lifestyle accessories',
          'Activity-based items'
        ]
      }
    };
  }

  async generateCompleteStyleGuide(consultationResponses) {
    // Analyze style preferences
    const styleAnalysis = this.styleAnalysis.analyzeConsultationResponses(consultationResponses);
    
    // Generate color palette
    const colorPalette = this.colorPalette.generatePersonalPalette({
      primaryStyle: styleAnalysis[0].style,
      secondaryStyle: styleAnalysis[1].style
    });

    // Create comprehensive style guide
    return {
      styleProfile: {
        primaryStyle: styleAnalysis[0],
        secondaryStyle: styleAnalysis[1],
        description: this.generateStyleDescription(styleAnalysis)
      },
      colorStrategy: {
        palette: colorPalette,
        usage: this.generateColorUsageGuide(colorPalette)
      },
      photoStrategy: {
        recommendations: this.generatePhotoRecommendations(styleAnalysis),
        poses: this.generatePoseGuide(styleAnalysis),
        settings: this.generateSettingRecommendations(styleAnalysis)
      },
      brandingElements: this.generateBrandingRecommendations(styleAnalysis, colorPalette)
    };
  }

  generateStyleDescription(styleAnalysis) {
    const primary = styleAnalysis[0].style;
    const secondary = styleAnalysis[1].style;
    
    return {
      summary: `Your signature style combines ${primary} sophistication with ${secondary} elements`,
      keyCharacteristics: [
        `Primary ${primary} influence creates a strong foundation`,
        `${secondary} touches add unique personality`,
        'Perfect blend for authentic personal branding'
      ]
    };
  }

  generateColorUsageGuide(colorPalette) {
    return {
      primary: 'Use as your dominant brand color in photos and marketing',
      secondary: 'Perfect for accents and creating visual interest',
      combinations: [
        '70% primary + 20% secondary + 10% accent',
        'Monochromatic variations for depth',
        'Strategic accent color placement'
      ]
    };
  }

  generatePhotoRecommendations(styleAnalysis) {
    const primaryStyle = styleAnalysis[0].style;
    
    return {
      lighting: this.getLightingRecommendations(primaryStyle),
      composition: this.getCompositionGuidelines(primaryStyle),
      moodBoard: this.generateMoodBoardSuggestions(styleAnalysis)
    };
  }

  getLightingRecommendations(style) {
    const lightingGuides = {
      classic: 'Soft, professional lighting with subtle shadows',
      creative: 'Dynamic lighting with artistic shadows',
      minimalist: 'Clean, even lighting with minimal shadows',
      bold: 'High contrast lighting with dramatic shadows'
    };
    
    return lightingGuides[style] || lightingGuides.classic;
  }

  getCompositionGuidelines(style) {
    const compositionGuides = {
      classic: ['Rule of thirds', 'Centered compositions', 'Professional framing'],
      creative: ['Dynamic angles', 'Unique perspectives', 'Artistic framing'],
      minimalist: ['Clean lines', 'Negative space', 'Symmetrical compositions'],
      bold: ['Strong diagonals', 'Power poses', 'Dramatic perspectives']
    };
    
    return compositionGuides[style] || compositionGuides.classic;
  }

  generatePoseGuide(styleAnalysis) {
    const primaryStyle = styleAnalysis[0].style;
    let poseCategory;
    
    switch(primaryStyle) {
      case 'classic':
        poseCategory = 'professional';
        break;
      case 'creative':
        poseCategory = 'creative';
        break;
      default:
        poseCategory = 'lifestyle';
    }
    
    return {
      recommendedPoses: this.photoTemplates[poseCategory].poses,
      suggestedProps: this.photoTemplates[poseCategory].props,
      tips: [
        'Practice poses before your shoot',
        'Focus on natural movements',
        'Align poses with your brand personality'
      ]
    };
  }

  generateSettingRecommendations(styleAnalysis) {
    return {
      indoor: [
        'Modern office space',
        'Creative studio',
        'Minimalist backdrop',
        'Home office setup'
      ],
      outdoor: [
        'Urban architecture',
        'Natural landscapes',
        'City streets',
        'Professional environments'
      ],
      timeOfDay: [
        'Golden hour for warm, flattering light',
        'Mid-morning for clean, professional light',
        'Blue hour for dramatic evening shots'
      ]
    };
  }

  generateBrandingRecommendations(styleAnalysis, colorPalette) {
    return {
      visualIdentity: {
        primaryElements: [
          'Consistent color palette usage',
          'Signature pose series',
          'Recognizable photo style'
        ],
        brandPersonality: [
          'Professional yet approachable',
          'Authentic and relatable',
          'Expert in your field'
        ]
      },
      contentStrategy: {
        photoVariations: [
          'Professional headshots',
          'Action/working shots',
          'Behind-the-scenes content',
          'Lifestyle integration'
        ],
        platformSpecific: {
          linkedin: 'Professional, polished images',
          instagram: 'Mix of professional and personal brand shots',
          website: 'Consistent, high-quality brand imagery'
        }
      }
    };
  }
}

module.exports = StyleGuideGenerator;
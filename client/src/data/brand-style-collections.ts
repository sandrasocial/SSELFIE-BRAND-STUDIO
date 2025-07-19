// Brand Style Collections for BUILD onboarding
// All 7 collections with actual local images and color palettes extracted from images

export interface BrandStyleCollection {
  id: string;
  name: string;
  description: string;
  aesthetic: string;
  backgroundImage: string;
  colors: string[];
  fonts: string[];
  images: Array<{
    id: string;
    url: string;
    title: string;
  }>;
}

export const brandStyleCollections: BrandStyleCollection[] = [
  {
    id: 'luxury-minimal',
    name: 'Luxury Minimal',
    description: 'Clean white backgrounds, designer accessories, minimal styling',
    aesthetic: 'Clean sophistication with generous white space',
    backgroundImage: '/flatlays/luxury-minimal/luxury-minimal-001.png',
    colors: ['#FFFFFF', '#F8F8F8', '#E5E5E5', '#000000', '#333333'],
    fonts: ['Times New Roman', 'Playfair Display', 'Cormorant Garamond'],
    images: [
      { id: 'lm-1', url: '/flatlays/luxury-minimal/luxury-minimal-001.png', title: 'Clean Workspace' },
      { id: 'lm-2', url: '/flatlays/luxury-minimal/luxury-minimal-002.png', title: 'Minimal Setup' },
      { id: 'lm-3', url: '/flatlays/luxury-minimal/luxury-minimal-003.png', title: 'Beauty Minimal' },
      { id: 'lm-4', url: '/flatlays/luxury-minimal/luxury-minimal-004.png', title: 'Planning Flatlay' },
      { id: 'lm-5', url: '/flatlays/luxury-minimal/luxury-minimal-005.png', title: 'Executive Setup' },
      { id: 'lm-6', url: '/flatlays/luxury-minimal/luxury-minimal-006.png', title: 'Content Creation' },
      { id: 'lm-7', url: '/flatlays/luxury-minimal/luxury-minimal-007.png', title: 'Designer Workspace' },
      { id: 'lm-8', url: '/flatlays/luxury-minimal/luxury-minimal-008.png', title: 'Luxury Essentials' }
    ]
  },
  {
    id: 'editorial-magazine',
    name: 'Editorial Magazine',
    description: 'Dark moody flatlays, fashion magazines, coffee aesthetic',
    aesthetic: 'Magazine-worthy editorial sophistication',
    backgroundImage: '/flatlays/editorial-magazine/editorial-magazine-020.png',
    colors: ['#1A1A1A', '#2D2D2D', '#8B4513', '#CD853F', '#F5DEB3'],
    fonts: ['Vogue', 'Didot', 'Bodoni MT'],
    images: [
      { id: 'em-1', url: '/flatlays/editorial-magazine/editorial-magazine-020.png', title: 'Editorial 1' },
      { id: 'em-2', url: '/flatlays/editorial-magazine/editorial-magazine-021.png', title: 'Editorial 2' },
      { id: 'em-3', url: '/flatlays/editorial-magazine/editorial-magazine-022.png', title: 'Editorial 3' },
      { id: 'em-4', url: '/flatlays/editorial-magazine/editorial-magazine-023.png', title: 'Editorial 4' },
      { id: 'em-5', url: '/flatlays/editorial-magazine/editorial-magazine-024.png', title: 'Editorial 5' },
      { id: 'em-6', url: '/flatlays/editorial-magazine/editorial-magazine-025.png', title: 'Editorial 6' },
      { id: 'em-7', url: '/flatlays/editorial-magazine/editorial-magazine-026.png', title: 'Editorial 7' },
      { id: 'em-8', url: '/flatlays/editorial-magazine/editorial-magazine-027.png', title: 'Editorial 8' }
    ]
  },
  {
    id: 'european-luxury',
    name: 'European Luxury',
    description: 'Sophisticated European lifestyle with luxury accessories',
    aesthetic: 'Refined European elegance and sophistication',
    backgroundImage: '/flatlays/european-luxury/european-luxury-100.png',
    colors: ['#8B7D6B', '#D2B48C', '#F5F5DC', '#DDBF94', '#CD853F'],
    fonts: ['Libre Baskerville', 'Crimson Text', 'Lora'],
    images: [
      { id: 'el-1', url: '/flatlays/european-luxury/european-luxury-100.png', title: 'European 1' },
      { id: 'el-2', url: '/flatlays/european-luxury/european-luxury-101.png', title: 'European 2' },
      { id: 'el-3', url: '/flatlays/european-luxury/european-luxury-102.png', title: 'European 3' },
      { id: 'el-4', url: '/flatlays/european-luxury/european-luxury-103.png', title: 'European 4' },
      { id: 'el-5', url: '/flatlays/european-luxury/european-luxury-104.png', title: 'European 5' },
      { id: 'el-6', url: '/flatlays/european-luxury/european-luxury-105.png', title: 'European 6' },
      { id: 'el-7', url: '/flatlays/european-luxury/european-luxury-106.png', title: 'European 7' },
      { id: 'el-8', url: '/flatlays/european-luxury/european-luxury-107.png', title: 'European 8' }
    ]
  },
  {
    id: 'business-professional',
    name: 'Business Professional',
    description: 'Professional business flatlays with laptops, planners, office elements',
    aesthetic: 'Clean professional business aesthetic',
    backgroundImage: '/flatlays/business-professional/business-professional-201.png',
    colors: ['#2F4F4F', '#708090', '#B0C4DE', '#E6E6FA', '#4682B4'],
    fonts: ['Helvetica', 'Arial', 'Roboto'],
    images: [
      { id: 'bp-1', url: '/flatlays/business-professional/business-professional-201.png', title: 'Professional 1' },
      { id: 'bp-2', url: '/flatlays/business-professional/business-professional-202.png', title: 'Professional 2' },
      { id: 'bp-3', url: '/flatlays/business-professional/business-professional-203.png', title: 'Professional 3' },
      { id: 'bp-4', url: '/flatlays/business-professional/business-professional-204.png', title: 'Professional 4' },
      { id: 'bp-5', url: '/flatlays/business-professional/business-professional-205.png', title: 'Professional 5' },
      { id: 'bp-6', url: '/flatlays/business-professional/business-professional-206.png', title: 'Professional 6' },
      { id: 'bp-7', url: '/flatlays/business-professional/business-professional-207.png', title: 'Professional 7' },
      { id: 'bp-8', url: '/flatlays/business-professional/business-professional-208.png', title: 'Professional 8' }
    ]
  },
  {
    id: 'wellness-mindset',
    name: 'Wellness & Mindset',
    description: 'Natural textures, crystals, journals, and mindfulness elements',
    aesthetic: 'Mindful wellness aesthetic',
    backgroundImage: '/flatlays/wellness-mindset/wellness-mindset-100.png',
    colors: ['#8FBC8F', '#F0E68C', '#DDA0DD', '#F5DEB3', '#98FB98'],
    fonts: ['Montserrat', 'Open Sans', 'Lato'],
    images: [
      { id: 'wm-1', url: '/flatlays/wellness-mindset/wellness-mindset-100.png', title: 'Wellness 1' },
      { id: 'wm-2', url: '/flatlays/wellness-mindset/wellness-mindset-101.png', title: 'Wellness 2' },
      { id: 'wm-3', url: '/flatlays/wellness-mindset/wellness-mindset-102.png', title: 'Wellness 3' },
      { id: 'wm-4', url: '/flatlays/wellness-mindset/wellness-mindset-103.png', title: 'Wellness 4' },
      { id: 'wm-5', url: '/flatlays/wellness-mindset/wellness-mindset-104.png', title: 'Wellness 5' },
      { id: 'wm-6', url: '/flatlays/wellness-mindset/wellness-mindset-105.png', title: 'Wellness 6' },
      { id: 'wm-7', url: '/flatlays/wellness-mindset/wellness-mindset-106.png', title: 'Wellness 7' },
      { id: 'wm-8', url: '/flatlays/wellness-mindset/wellness-mindset-107.png', title: 'Wellness 8' }
    ]
  },
  {
    id: 'pink-girly',
    name: 'Pink & Girly',
    description: 'Feminine pink palette, beauty essentials, glamorous',
    aesthetic: 'Playful feminine glamour',
    backgroundImage: '/flatlays/pink-girly/pink-girly-400.png',
    colors: ['#FFB6C1', '#FFC0CB', '#FFCCCB', '#F08080', '#FF69B4'],
    fonts: ['Dancing Script', 'Pacifico', 'Great Vibes'],
    images: [
      { id: 'pg-1', url: '/flatlays/pink-girly/pink-girly-400.png', title: 'Pink 1' },
      { id: 'pg-2', url: '/flatlays/pink-girly/pink-girly-401.png', title: 'Pink 2' },
      { id: 'pg-3', url: '/flatlays/pink-girly/pink-girly-402.png', title: 'Pink 3' },
      { id: 'pg-4', url: '/flatlays/pink-girly/pink-girly-403.png', title: 'Pink 4' },
      { id: 'pg-5', url: '/flatlays/pink-girly/pink-girly-404.png', title: 'Pink 5' },
      { id: 'pg-6', url: '/flatlays/pink-girly/pink-girly-405.png', title: 'Pink 6' },
      { id: 'pg-7', url: '/flatlays/pink-girly/pink-girly-406.png', title: 'Pink 7' },
      { id: 'pg-8', url: '/flatlays/pink-girly/pink-girly-407.png', title: 'Pink 8' }
    ]
  },
  {
    id: 'fitness-health',
    name: 'Fitness & Health',
    description: 'Active lifestyle, wellness essentials, healthy living',
    aesthetic: 'Clean energetic wellness focus',
    backgroundImage: '/flatlays/wellness-mindset/wellness-mindset-150.png',
    colors: ['#90EE90', '#87CEEB', '#F0E68C', '#DDA0DD', '#FFB6C1'],
    fonts: ['Montserrat', 'Open Sans', 'Lato'],
    images: [
      { id: 'fh-1', url: '/flatlays/wellness-mindset/wellness-mindset-150.png', title: 'Fitness 1' },
      { id: 'fh-2', url: '/flatlays/wellness-mindset/wellness-mindset-151.png', title: 'Fitness 2' },
      { id: 'fh-3', url: '/flatlays/wellness-mindset/wellness-mindset-152.png', title: 'Fitness 3' },
      { id: 'fh-4', url: '/flatlays/wellness-mindset/wellness-mindset-153.png', title: 'Fitness 4' },
      { id: 'fh-5', url: '/flatlays/wellness-mindset/wellness-mindset-154.png', title: 'Fitness 5' },
      { id: 'fh-6', url: '/flatlays/wellness-mindset/wellness-mindset-155.png', title: 'Fitness 6' },
      { id: 'fh-7', url: '/flatlays/wellness-mindset/wellness-mindset-156.png', title: 'Fitness 7' },
      { id: 'fh-8', url: '/flatlays/wellness-mindset/wellness-mindset-157.png', title: 'Fitness 8' }
    ]
  },
  {
    id: 'coastal-vibes',
    name: 'Coastal Vibes',
    description: 'Beach lifestyle, nautical elements, ocean-inspired',
    aesthetic: 'Breezy coastal elegance',
    backgroundImage: '/flatlays/editorial-magazine/editorial-magazine-050.png',
    colors: ['#87CEEB', '#F0F8FF', '#E0FFFF', '#B0E0E6', '#4682B4'],
    fonts: ['Crimson Text', 'Libre Baskerville', 'Source Sans Pro'],
    images: [
      { id: 'cv-1', url: '/flatlays/editorial-magazine/editorial-magazine-050.png', title: 'Coastal 1' },
      { id: 'cv-2', url: '/flatlays/editorial-magazine/editorial-magazine-051.png', title: 'Coastal 2' },
      { id: 'cv-3', url: '/flatlays/editorial-magazine/editorial-magazine-052.png', title: 'Coastal 3' },
      { id: 'cv-4', url: '/flatlays/editorial-magazine/editorial-magazine-053.png', title: 'Coastal 4' },
      { id: 'cv-5', url: '/flatlays/editorial-magazine/editorial-magazine-054.png', title: 'Coastal 5' },
      { id: 'cv-6', url: '/flatlays/editorial-magazine/editorial-magazine-055.png', title: 'Coastal 6' },
      { id: 'cv-7', url: '/flatlays/editorial-magazine/editorial-magazine-056.png', title: 'Coastal 7' },
      { id: 'cv-8', url: '/flatlays/editorial-magazine/editorial-magazine-057.png', title: 'Coastal 8' }
    ]
  },
  {
    id: 'cream-aesthetic',
    name: 'Cream Aesthetic',
    description: 'Warm cream tones, cozy textures, neutral elegance',
    aesthetic: 'Soft neutral sophistication',
    backgroundImage: '/flatlays/luxury-minimal/luxury-minimal-010.png',
    colors: ['#F5F5DC', '#FAEBD7', '#FFE4E1', '#FFF8DC', '#DDBF94'],
    fonts: ['Georgia', 'Times New Roman', 'Crimson Text'],
    images: [
      { id: 'ca-1', url: '/flatlays/luxury-minimal/luxury-minimal-010.png', title: 'Cream 1' },
      { id: 'ca-2', url: '/flatlays/luxury-minimal/luxury-minimal-011.png', title: 'Cream 2' },
      { id: 'ca-3', url: '/flatlays/luxury-minimal/luxury-minimal-012.png', title: 'Cream 3' },
      { id: 'ca-4', url: '/flatlays/luxury-minimal/luxury-minimal-013.png', title: 'Cream 4' },
      { id: 'ca-5', url: '/flatlays/luxury-minimal/luxury-minimal-014.png', title: 'Cream 5' },
      { id: 'ca-6', url: '/flatlays/luxury-minimal/luxury-minimal-015.png', title: 'Cream 6' },
      { id: 'ca-7', url: '/flatlays/luxury-minimal/luxury-minimal-016.png', title: 'Cream 7' },
      { id: 'ca-8', url: '/flatlays/luxury-minimal/luxury-minimal-017.png', title: 'Cream 8' }
    ]
  }
];
// Brand Style Collections for BUILD onboarding
// All 9 collections with actual local images and color palettes extracted from images

export interface BrandStyleCollection {
  id: string;
  name: string;
  description: string;
  aesthetic: string;
  backgroundImage: string;
  imageUrl: string; // Added for style selector carousel
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
    backgroundImage: '/flatlay-luxury-planning.jpg',
    imageUrl: '/flatlay-luxury-planning.jpg',
    colors: ['#FFFFFF', '#F8F8F8', '#E5E5E5', '#000000', '#333333'],
    fonts: ['Times New Roman', 'Playfair Display', 'Cormorant Garamond'],
    images: [
      { id: 'lm-1', url: '/flatlay-luxury-planning.jpg', title: 'Clean Workspace' },
      { id: 'lm-2', url: '/gallery-luxury-workspace.jpg', title: 'Minimal Setup' },
      { id: 'lm-3', url: '/flatlay-luxury-planning.jpg', title: 'Beauty Minimal' },
      { id: 'lm-4', url: '/gallery-luxury-workspace.jpg', title: 'Planning Flatlay' },
      { id: 'lm-5', url: '/flatlay-luxury-planning.jpg', title: 'Executive Setup' },
      { id: 'lm-6', url: '/gallery-luxury-workspace.jpg', title: 'Content Creation' },
      { id: 'lm-7', url: '/flatlay-luxury-planning.jpg', title: 'Designer Workspace' },
      { id: 'lm-8', url: '/gallery-luxury-workspace.jpg', title: 'Luxury Essentials' }
    ]
  },
  {
    id: 'editorial-magazine',
    name: 'Editorial Magazine',
    description: 'Dark moody flatlays, fashion magazines, coffee aesthetic',
    aesthetic: 'Magazine-worthy editorial sophistication',
    backgroundImage: '/gallery-luxury-workspace.jpg',
    imageUrl: '/gallery-luxury-workspace.jpg',
    colors: ['#1A1A1A', '#2D2D2D', '#8B4513', '#CD853F', '#F5DEB3'],
    fonts: ['Vogue', 'Didot', 'Bodoni MT'],
    images: [
      { id: 'em-1', url: '/gallery-luxury-workspace.jpg', title: 'Editorial 1' },
      { id: 'em-2', url: '/flatlay-luxury-planning.jpg', title: 'Editorial 2' },
      { id: 'em-3', url: '/gallery-luxury-workspace.jpg', title: 'Editorial 3' },
      { id: 'em-4', url: '/flatlay-luxury-planning.jpg', title: 'Editorial 4' },
      { id: 'em-5', url: '/gallery-luxury-workspace.jpg', title: 'Editorial 5' },
      { id: 'em-6', url: '/flatlay-luxury-planning.jpg', title: 'Editorial 6' },
      { id: 'em-7', url: '/gallery-luxury-workspace.jpg', title: 'Editorial 7' },
      { id: 'em-8', url: '/flatlay-luxury-planning.jpg', title: 'Editorial 8' }
    ]
  },
  {
    id: 'european-luxury',
    name: 'European Luxury',
    description: 'Sophisticated European lifestyle with luxury accessories',
    aesthetic: 'Refined European elegance and sophistication',
    backgroundImage: '/flatlay-luxury-planning.jpg',
    imageUrl: '/flatlay-luxury-planning.jpg',
    colors: ['#8B7D6B', '#D2B48C', '#F5F5DC', '#DDBF94', '#CD853F'],
    fonts: ['Libre Baskerville', 'Crimson Text', 'Lora'],
    images: [
      { id: 'el-1', url: '/flatlay-luxury-planning.jpg', title: 'European 1' },
      { id: 'el-2', url: '/gallery-luxury-workspace.jpg', title: 'European 2' },
      { id: 'el-3', url: '/flatlay-luxury-planning.jpg', title: 'European 3' },
      { id: 'el-4', url: '/gallery-luxury-workspace.jpg', title: 'European 4' },
      { id: 'el-5', url: '/flatlay-luxury-planning.jpg', title: 'European 5' },
      { id: 'el-6', url: '/gallery-luxury-workspace.jpg', title: 'European 6' },
      { id: 'el-7', url: '/flatlay-luxury-planning.jpg', title: 'European 7' },
      { id: 'el-8', url: '/gallery-luxury-workspace.jpg', title: 'European 8' }
    ]
  },
  {
    id: 'business-professional',
    name: 'Business Professional',
    description: 'Professional business flatlays with laptops, planners, office elements',
    aesthetic: 'Clean professional business aesthetic',
    backgroundImage: '/gallery-luxury-workspace.jpg',
    imageUrl: '/gallery-luxury-workspace.jpg',
    colors: ['#2F4F4F', '#708090', '#B0C4DE', '#E6E6FA', '#4682B4'],
    fonts: ['Helvetica', 'Arial', 'Roboto'],
    images: [
      { id: 'bp-1', url: '/gallery-luxury-workspace.jpg', title: 'Professional 1' },
      { id: 'bp-2', url: '/flatlay-luxury-planning.jpg', title: 'Professional 2' },
      { id: 'bp-3', url: '/gallery-luxury-workspace.jpg', title: 'Professional 3' },
      { id: 'bp-4', url: '/flatlay-luxury-planning.jpg', title: 'Professional 4' },
      { id: 'bp-5', url: '/gallery-luxury-workspace.jpg', title: 'Professional 5' },
      { id: 'bp-6', url: '/flatlay-luxury-planning.jpg', title: 'Professional 6' },
      { id: 'bp-7', url: '/gallery-luxury-workspace.jpg', title: 'Professional 7' },
      { id: 'bp-8', url: '/flatlay-luxury-planning.jpg', title: 'Professional 8' }
    ]
  },
  {
    id: 'wellness-mindset',
    name: 'Wellness & Mindset',
    description: 'Natural textures, crystals, journals, and mindfulness elements',
    aesthetic: 'Mindful wellness aesthetic',
    backgroundImage: '/flatlay-luxury-planning.jpg',
    imageUrl: '/flatlay-luxury-planning.jpg',
    colors: ['#8FBC8F', '#F0E68C', '#DDA0DD', '#F5DEB3', '#98FB98'],
    fonts: ['Montserrat', 'Open Sans', 'Lato'],
    images: [
      { id: 'wm-1', url: '/flatlay-luxury-planning.jpg', title: 'Wellness 1' },
      { id: 'wm-2', url: '/gallery-luxury-workspace.jpg', title: 'Wellness 2' },
      { id: 'wm-3', url: '/flatlay-luxury-planning.jpg', title: 'Wellness 3' },
      { id: 'wm-4', url: '/gallery-luxury-workspace.jpg', title: 'Wellness 4' },
      { id: 'wm-5', url: '/flatlay-luxury-planning.jpg', title: 'Wellness 5' },
      { id: 'wm-6', url: '/gallery-luxury-workspace.jpg', title: 'Wellness 6' },
      { id: 'wm-7', url: '/flatlay-luxury-planning.jpg', title: 'Wellness 7' },
      { id: 'wm-8', url: '/gallery-luxury-workspace.jpg', title: 'Wellness 8' }
    ]
  },
  {
    id: 'pink-girly',
    name: 'Pink & Girly',
    description: 'Feminine pink palette, beauty essentials, glamorous',
    aesthetic: 'Playful feminine glamour',
    backgroundImage: '/flatlay-luxury-planning.jpg',
    imageUrl: '/flatlay-luxury-planning.jpg',
    colors: ['#FFB6C1', '#FFC0CB', '#FFCCCB', '#F08080', '#FF69B4'],
    fonts: ['Dancing Script', 'Pacifico', 'Great Vibes'],
    images: [
      { id: 'pg-1', url: '/flatlay-luxury-planning.jpg', title: 'Pink 1' },
      { id: 'pg-2', url: '/gallery-luxury-workspace.jpg', title: 'Pink 2' },
      { id: 'pg-3', url: '/flatlay-luxury-planning.jpg', title: 'Pink 3' },
      { id: 'pg-4', url: '/gallery-luxury-workspace.jpg', title: 'Pink 4' },
      { id: 'pg-5', url: '/flatlay-luxury-planning.jpg', title: 'Pink 5' },
      { id: 'pg-6', url: '/gallery-luxury-workspace.jpg', title: 'Pink 6' },
      { id: 'pg-7', url: '/flatlay-luxury-planning.jpg', title: 'Pink 7' },
      { id: 'pg-8', url: '/gallery-luxury-workspace.jpg', title: 'Pink 8' }
    ]
  },
  {
    id: 'fitness-health',
    name: 'Fitness & Health',
    description: 'Active lifestyle, wellness essentials, healthy living',
    aesthetic: 'Clean energetic wellness focus',
    backgroundImage: '/gallery-luxury-workspace.jpg',
    imageUrl: '/gallery-luxury-workspace.jpg',
    colors: ['#90EE90', '#87CEEB', '#F0E68C', '#DDA0DD', '#FFB6C1'],
    fonts: ['Montserrat', 'Open Sans', 'Lato'],
    images: [
      { id: 'fh-1', url: '/gallery-luxury-workspace.jpg', title: 'Fitness 1' },
      { id: 'fh-2', url: '/flatlay-luxury-planning.jpg', title: 'Fitness 2' },
      { id: 'fh-3', url: '/gallery-luxury-workspace.jpg', title: 'Fitness 3' },
      { id: 'fh-4', url: '/flatlay-luxury-planning.jpg', title: 'Fitness 4' },
      { id: 'fh-5', url: '/gallery-luxury-workspace.jpg', title: 'Fitness 5' },
      { id: 'fh-6', url: '/flatlay-luxury-planning.jpg', title: 'Fitness 6' },
      { id: 'fh-7', url: '/gallery-luxury-workspace.jpg', title: 'Fitness 7' },
      { id: 'fh-8', url: '/flatlay-luxury-planning.jpg', title: 'Fitness 8' }
    ]
  },
  {
    id: 'coastal-vibes',
    name: 'Coastal Vibes',
    description: 'Beach lifestyle, nautical elements, ocean-inspired',
    aesthetic: 'Breezy coastal elegance',
    backgroundImage: '/gallery-luxury-workspace.jpg',
    imageUrl: '/gallery-luxury-workspace.jpg',
    colors: ['#87CEEB', '#F0F8FF', '#E0FFFF', '#B0E0E6', '#4682B4'],
    fonts: ['Crimson Text', 'Libre Baskerville', 'Source Sans Pro'],
    images: [
      { id: 'cv-1', url: '/gallery-luxury-workspace.jpg', title: 'Coastal 1' },
      { id: 'cv-2', url: '/flatlay-luxury-planning.jpg', title: 'Coastal 2' },
      { id: 'cv-3', url: '/gallery-luxury-workspace.jpg', title: 'Coastal 3' },
      { id: 'cv-4', url: '/flatlay-luxury-planning.jpg', title: 'Coastal 4' },
      { id: 'cv-5', url: '/gallery-luxury-workspace.jpg', title: 'Coastal 5' },
      { id: 'cv-6', url: '/flatlay-luxury-planning.jpg', title: 'Coastal 6' },
      { id: 'cv-7', url: '/gallery-luxury-workspace.jpg', title: 'Coastal 7' },
      { id: 'cv-8', url: '/flatlay-luxury-planning.jpg', title: 'Coastal 8' }
    ]
  },
  {
    id: 'cream-aesthetic',
    name: 'Cream Aesthetic',
    description: 'Warm cream tones, cozy textures, neutral elegance',
    aesthetic: 'Soft neutral sophistication',
    backgroundImage: '/flatlay-luxury-planning.jpg',
    imageUrl: '/flatlay-luxury-planning.jpg',
    colors: ['#F5F5DC', '#FAEBD7', '#FFE4E1', '#FFF8DC', '#DDBF94'],
    fonts: ['Georgia', 'Times New Roman', 'Crimson Text'],
    images: [
      { id: 'ca-1', url: '/flatlay-luxury-planning.jpg', title: 'Cream 1' },
      { id: 'ca-2', url: '/gallery-luxury-workspace.jpg', title: 'Cream 2' },
      { id: 'ca-3', url: '/flatlay-luxury-planning.jpg', title: 'Cream 3' },
      { id: 'ca-4', url: '/gallery-luxury-workspace.jpg', title: 'Cream 4' },
      { id: 'ca-5', url: '/flatlay-luxury-planning.jpg', title: 'Cream 5' },
      { id: 'ca-6', url: '/gallery-luxury-workspace.jpg', title: 'Cream 6' },
      { id: 'ca-7', url: '/flatlay-luxury-planning.jpg', title: 'Cream 7' },
      { id: 'ca-8', url: '/gallery-luxury-workspace.jpg', title: 'Cream 8' }
    ]
  }
];

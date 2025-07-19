// WORKING flatlay collections with DIRECT paths to actual files
// Using direct public folder access instead of API routes

export interface FlatlayImage {
  id: string;
  url: string;
  title: string;
  category: string;
  description: string;
}

export interface FlatlayCollection {
  id: string;
  name: string;
  description: string;
  aesthetic: string;
  backgroundImage: string;
  images: FlatlayImage[];
  colors: string[];
  fonts: string[];
}

// WORKING flatlay collections with direct file paths
export const cleanedFlatlayCollections: FlatlayCollection[] = [
  {
    id: 'luxury-minimal',
    name: 'Luxury Minimal',
    description: 'Clean white backgrounds, designer accessories, minimal styling',
    aesthetic: 'Clean sophistication with generous white space',
    backgroundImage: '/flatlays/luxury-minimal/luxury-minimal-001.png',
    colors: ['#ffffff', '#f8f9fa', '#e9ecef', '#000000', '#6c757d'],
    fonts: ['Times New Roman', 'Helvetica Neue', 'Arial'],
    images: [
      {
        id: 'lm-1',
        url: '/flatlays/luxury-minimal/luxury-minimal-001.png',
        title: 'Clean Workspace',
        category: 'Luxury Minimal',
        description: 'Clean sophisticated lifestyle flatlay'
      },
      {
        id: 'lm-2',
        url: '/flatlays/luxury-minimal/luxury-minimal-002.png',
        title: 'Minimal Setup',
        category: 'Luxury Minimal',
        description: 'Clean sophisticated lifestyle flatlay'
      },
      {
        id: 'lm-3',
        url: '/flatlays/luxury-minimal/luxury-minimal-003.png',
        title: 'Beauty Minimal',
        category: 'Luxury Minimal',
        description: 'Clean sophisticated lifestyle flatlay'
      },
      {
        id: 'lm-4',
        url: '/flatlays/luxury-minimal/luxury-minimal-004.png',
        title: 'Planning Flatlay',
        category: 'Luxury Minimal',
        description: 'Clean sophisticated lifestyle flatlay'
      },
      {
        id: 'lm-5',
        url: '/flatlays/luxury-minimal/luxury-minimal-005.png',
        title: 'Executive Setup',
        category: 'Luxury Minimal',
        description: 'Clean sophisticated lifestyle flatlay'
      },
      {
        id: 'lm-6',
        url: '/flatlays/luxury-minimal/luxury-minimal-006.png',
        title: 'Content Creation',
        category: 'Luxury Minimal',
        description: 'Clean sophisticated lifestyle flatlay'
      }
    ]
  },
  {
    id: 'editorial-magazine',
    name: 'Editorial Magazine',
    description: 'Dark moody flatlays, fashion magazines, coffee aesthetic',
    aesthetic: 'Magazine-worthy editorial sophistication',
    backgroundImage: '/flatlays/editorial-magazine/editorial-magazine-020.png',
    colors: ['#2c2c2c', '#000000', '#8b6f47', '#d4af37', '#ffffff'],
    fonts: ['Times New Roman', 'Playfair Display', 'Georgia'],
    images: [
      {
        id: 'em-1',
        url: '/flatlays/editorial-magazine/editorial-magazine-020.png',
        title: 'Coffee Editorial',
        category: 'Editorial Magazine',
        description: 'Editorial Magazine aesthetic flatlay'
      },
      {
        id: 'em-2',
        url: '/flatlays/editorial-magazine/editorial-magazine-021.png',
        title: 'Magazine Spread',
        category: 'Editorial Magazine',
        description: 'Editorial Magazine aesthetic flatlay'
      },
      {
        id: 'em-3',
        url: '/flatlays/editorial-magazine/editorial-magazine-022.png',
        title: 'Dark Moody',
        category: 'Editorial Magazine',
        description: 'Editorial Magazine aesthetic flatlay'
      },
      {
        id: 'em-4',
        url: '/flatlays/editorial-magazine/editorial-magazine-023.png',
        title: 'Fashion Flatlay',
        category: 'Editorial Magazine',
        description: 'Editorial Magazine aesthetic flatlay'
      },
      {
        id: 'em-5',
        url: '/flatlays/editorial-magazine/editorial-magazine-024.png',
        title: 'Lifestyle Editorial',
        category: 'Editorial Magazine',
        description: 'Editorial Magazine aesthetic flatlay'
      },
      {
        id: 'em-6',
        url: '/flatlays/editorial-magazine/editorial-magazine-025.png',
        title: 'Creative Workspace',
        category: 'Editorial Magazine',
        description: 'Editorial Magazine aesthetic flatlay'
      }
    ]
  },
  {
    id: 'european-luxury',
    name: 'European Luxury',
    description: 'Sophisticated European lifestyle with luxury accessories',
    aesthetic: 'Refined European elegance and sophistication',
    backgroundImage: '/flatlays/european-luxury/european-luxury-101.png',
    colors: ['#8b4513', '#daa520', '#2f4f4f', '#000000', '#f5f5dc'],
    fonts: ['Times New Roman', 'Cormorant Garamond', 'Crimson Text'],
    images: [
      {
        id: 'el-1',
        url: '/flatlays/european-luxury/european-luxury-101.png',
        title: 'European Elegance',
        category: 'European Luxury',
        description: 'European luxury lifestyle flatlay'
      },
      {
        id: 'el-2',
        url: '/flatlays/european-luxury/european-luxury-102.png',
        title: 'Luxury Accessories',
        category: 'European Luxury',
        description: 'European luxury lifestyle flatlay'
      },
      {
        id: 'el-3',
        url: '/flatlays/european-luxury/european-luxury-103.png',
        title: 'Refined Setup',
        category: 'European Luxury',
        description: 'European luxury lifestyle flatlay'
      },
      {
        id: 'el-4',
        url: '/flatlays/european-luxury/european-luxury-104.png',
        title: 'Luxury Travel',
        category: 'European Luxury',
        description: 'European luxury lifestyle flatlay'
      }
    ]
  },
  {
    id: 'business-professional',
    name: 'Business Professional',
    description: 'Professional business flatlays with laptops, planners, office elements',
    aesthetic: 'Clean professional business aesthetic',
    backgroundImage: '/flatlays/business-professional/business-professional-201.png',
    colors: ['#2c3e50', '#34495e', '#95a5a6', '#ffffff', '#000000'],
    fonts: ['Times New Roman', 'Open Sans', 'Lato'],
    images: [
      {
        id: 'bp-1',
        url: '/flatlays/business-professional/business-professional-201.png',
        title: 'Executive Desk',
        category: 'Business Professional',
        description: 'Professional business flatlay'
      },
      {
        id: 'bp-2',
        url: '/flatlays/business-professional/business-professional-202.png',
        title: 'Planning Session',
        category: 'Business Professional',
        description: 'Professional business flatlay'
      },
      {
        id: 'bp-3',
        url: '/flatlays/business-professional/business-professional-203.png',
        title: 'Office Setup',
        category: 'Business Professional',
        description: 'Professional business flatlay'
      },
      {
        id: 'bp-4',
        url: '/flatlays/business-professional/business-professional-204.png',
        title: 'Business Meeting',
        category: 'Business Professional',
        description: 'Professional business flatlay'
      }
    ]
  },
  {
    id: 'wellness-mindset',
    name: 'Wellness Mindset',
    description: 'Serene wellness flatlays with natural elements, journals, crystals',
    aesthetic: 'Peaceful mindfulness and self-care aesthetic',
    backgroundImage: '/flatlays/wellness-mindset/wellness-mindset-151.png',
    colors: ['#f0f8f0', '#e6f7e6', '#c8e6c8', '#a5d6a5', '#83c283'],
    fonts: ['Times New Roman', 'Libre Baskerville', 'Crimson Text'],
    images: [
      {
        id: 'wm-1',
        url: '/flatlays/wellness-mindset/wellness-mindset-151.png',
        title: 'Mindful Morning',
        category: 'Wellness Mindset',
        description: 'Wellness mindset lifestyle flatlay'
      },
      {
        id: 'wm-2',
        url: '/flatlays/wellness-mindset/wellness-mindset-152.png',
        title: 'Self-Care Setup',
        category: 'Wellness Mindset',
        description: 'Wellness mindset lifestyle flatlay'
      },
      {
        id: 'wm-3',
        url: '/flatlays/wellness-mindset/wellness-mindset-153.png',
        title: 'Meditation Space',
        category: 'Wellness Mindset',
        description: 'Wellness mindset lifestyle flatlay'
      },
      {
        id: 'wm-4',
        url: '/flatlays/wellness-mindset/wellness-mindset-154.png',
        title: 'Wellness Journal',
        category: 'Wellness Mindset',
        description: 'Wellness mindset lifestyle flatlay'
      }
    ]
  }
];
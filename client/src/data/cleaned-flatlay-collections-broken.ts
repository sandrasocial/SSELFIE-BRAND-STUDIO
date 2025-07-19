// CLEAN flatlay collections with ONLY working local images
// This completely replaces the broken external URLs with verified local images

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
  colors?: string[];
  fonts?: string[];
}

// COMPLETELY CLEAN flatlay collections - only local images that exist
export const cleanedFlatlayCollections: FlatlayCollection[] = [
  {
    id: 'luxury-minimal',
    name: 'Luxury Minimal',
    description: 'Clean white backgrounds, designer accessories, minimal styling',
    aesthetic: 'Clean sophistication with generous white space',
    backgroundImage: '/flatlays/luxury-minimal/luxury-minimal-001.png',
    colors: ['#ffffff', '#f8f9fa', '#e9ecef', '#000000', '#6c757d'],
    fonts: ['Times New Roman', 'Helvetica Neue', 'Arial']
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
      },
      {
        id: 'lm-7',
        url: '/flatlays/luxury-minimal/luxury-minimal-007.png',
        title: 'Designer Workspace',
        category: 'Luxury Minimal',
        description: 'Clean sophisticated lifestyle flatlay'
      },
      {
        id: 'lm-8',
        url: '/flatlays/luxury-minimal/luxury-minimal-008.png',
        title: 'Luxury Essentials',
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
    fonts: ['Times New Roman', 'Playfair Display', 'Georgia']
    images: [
      {
        id: 'em-1',
        url: '/flatlays/editorial-magazine/editorial-magazine-020.png',
        title: 'Editorial Magazine 1',
        category: 'Editorial Magazine',
        description: 'Editorial Magazine aesthetic flatlay'
      },
      {
        id: 'em-2',
        url: '/flatlays/editorial-magazine/editorial-magazine-021.png',
        title: 'Editorial Magazine 2',
        category: 'Editorial Magazine',
        description: 'Editorial Magazine aesthetic flatlay'
      },
      {
        id: 'em-3',
        url: '/flatlays/editorial-magazine/editorial-magazine-022.png',
        title: 'Editorial Magazine 3',
        category: 'Editorial Magazine',
        description: 'Editorial Magazine aesthetic flatlay'
      },
      {
        id: 'em-4',
        url: '/flatlays/editorial-magazine/editorial-magazine-023.png',
        title: 'Editorial Magazine 4',
        category: 'Editorial Magazine',
        description: 'Editorial Magazine aesthetic flatlay'
      },
      {
        id: 'em-5',
        url: '/flatlays/editorial-magazine/editorial-magazine-024.png',
        title: 'Editorial Magazine 5',
        category: 'Editorial Magazine',
        description: 'Editorial Magazine aesthetic flatlay'
      },
      {
        id: 'em-6',
        url: '/flatlays/editorial-magazine/editorial-magazine-025.png',
        title: 'Editorial Magazine 6',
        category: 'Editorial Magazine',
        description: 'Editorial Magazine aesthetic flatlay'
      },
      {
        id: 'em-7',
        url: '/flatlays/editorial-magazine/editorial-magazine-026.png',
        title: 'Editorial Magazine 7',
        category: 'Editorial Magazine',
        description: 'Editorial Magazine aesthetic flatlay'
      },
      {
        id: 'em-8',
        url: '/flatlays/editorial-magazine/editorial-magazine-027.png',
        title: 'Editorial Magazine 8',
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
    backgroundImage: '/flatlays/european-luxury/european-luxury-100.png',
    colors: ['#8b4513', '#daa520', '#2f4f4f', '#000000', '#f5f5dc'],
    fonts: ['Times New Roman', 'Cormorant Garamond', 'Crimson Text']
    images: [
      {
        id: 'el-1',
        url: '/flatlays/european-luxury/european-luxury-100.png',
        title: 'European Luxury 1',
        category: 'European Luxury',
        description: 'European luxury lifestyle flatlay'
      },
      {
        id: 'el-2',
        url: '/flatlays/european-luxury/european-luxury-101.png',
        title: 'European Luxury 2',
        category: 'European Luxury',
        description: 'European luxury lifestyle flatlay'
      },
      {
        id: 'el-3',
        url: '/flatlays/european-luxury/european-luxury-102.png',
        title: 'European Luxury 3',
        category: 'European Luxury',
        description: 'European luxury lifestyle flatlay'
      },
      {
        id: 'el-4',
        url: '/flatlays/european-luxury/european-luxury-103.png',
        title: 'European Luxury 4',
        category: 'European Luxury',
        description: 'European luxury lifestyle flatlay'
      },
      {
        id: 'el-5',
        url: '/flatlays/european-luxury/european-luxury-104.png',
        title: 'European Luxury 5',
        category: 'European Luxury',
        description: 'European luxury lifestyle flatlay'
      },
      {
        id: 'el-6',
        url: '/flatlays/european-luxury/european-luxury-105.png',
        title: 'European Luxury 6',
        category: 'European Luxury',
        description: 'European luxury lifestyle flatlay'
      },
      {
        id: 'el-7',
        url: '/flatlays/european-luxury/european-luxury-106.png',
        title: 'European Luxury 7',
        category: 'European Luxury',
        description: 'European luxury lifestyle flatlay'
      },
      {
        id: 'el-8',
        url: '/flatlays/european-luxury/european-luxury-107.png',
        title: 'European Luxury 8',
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
    fonts: ['Times New Roman', 'Open Sans', 'Lato']
    images: [
      {
        id: 'bp-1',
        url: '/flatlays/business-professional/business-professional-201.png',
        title: 'Business Professional 1',
        category: 'Business Professional',
        description: 'Professional business flatlay'
      },
      {
        id: 'bp-2',
        url: '/flatlays/business-professional/business-professional-202.png',
        title: 'Business Professional 2',
        category: 'Business Professional',
        description: 'Professional business flatlay'
      },
      {
        id: 'bp-3',
        url: '/flatlays/business-professional/business-professional-203.png',
        title: 'Business Professional 3',
        category: 'Business Professional',
        description: 'Professional business flatlay'
      },
      {
        id: 'bp-4',
        url: '/flatlays/business-professional/business-professional-204.png',
        title: 'Business Professional 4',
        category: 'Business Professional',
        description: 'Professional business flatlay'
      },
      {
        id: 'bp-5',
        url: '/flatlays/business-professional/business-professional-205.png',
        title: 'Business Professional 5',
        category: 'Business Professional',
        description: 'Professional business flatlay'
      },
      {
        id: 'bp-6',
        url: '/flatlays/business-professional/business-professional-206.png',
        title: 'Business Professional 6',
        category: 'Business Professional',
        description: 'Professional business flatlay'
      },
      {
        id: 'bp-7',
        url: '/flatlays/business-professional/business-professional-207.png',
        title: 'Business Professional 7',
        category: 'Business Professional',
        description: 'Professional business flatlay'
      },
      {
        id: 'bp-8',
        url: '/flatlays/business-professional/business-professional-208.png',
        title: 'Business Professional 8',
        category: 'Business Professional',
        description: 'Professional business flatlay'
      }
    ]
  },
  {
    id: 'wellness-mindset',
    name: 'Wellness & Mindset',
    description: 'Natural textures, crystals, journals, and mindfulness elements',
    aesthetic: 'Mindful wellness aesthetic',
    backgroundImage: '/flatlays/wellness-mindset/wellness-mindset-100.png',
    colors: ['#8fbc8f', '#dda0dd', '#f0e68c', '#d2b48c', '#ffffff'],
    fonts: ['Times New Roman', 'Libre Baskerville', 'Merriweather']
    images: [
      {
        id: 'wm-1',
        url: '/flatlays/wellness-mindset/wellness-mindset-100.png',
        title: 'Wellness & Mindset 1',
        category: 'Wellness & Mindset',
        description: 'Wellness mindset flatlay'
      },
      {
        id: 'wm-2',
        url: '/flatlays/wellness-mindset/wellness-mindset-101.png',
        title: 'Wellness & Mindset 2',
        category: 'Wellness & Mindset',
        description: 'Wellness mindset flatlay'
      },
      {
        id: 'wm-3',
        url: '/flatlays/wellness-mindset/wellness-mindset-102.png',
        title: 'Wellness & Mindset 3',
        category: 'Wellness & Mindset',
        description: 'Wellness mindset flatlay'
      },
      {
        id: 'wm-4',
        url: '/flatlays/wellness-mindset/wellness-mindset-103.png',
        title: 'Wellness & Mindset 4',
        category: 'Wellness & Mindset',
        description: 'Wellness mindset flatlay'
      },
      {
        id: 'wm-5',
        url: '/flatlays/wellness-mindset/wellness-mindset-104.png',
        title: 'Wellness & Mindset 5',
        category: 'Wellness & Mindset',
        description: 'Wellness mindset flatlay'
      },
      {
        id: 'wm-6',
        url: '/flatlays/wellness-mindset/wellness-mindset-105.png',
        title: 'Wellness & Mindset 6',
        category: 'Wellness & Mindset',
        description: 'Wellness mindset flatlay'
      },
      {
        id: 'wm-7',
        url: '/flatlays/wellness-mindset/wellness-mindset-106.png',
        title: 'Wellness & Mindset 7',
        category: 'Wellness & Mindset',
        description: 'Wellness mindset flatlay'
      },
      {
        id: 'wm-8',
        url: '/flatlays/wellness-mindset/wellness-mindset-107.png',
        title: 'Wellness & Mindset 8',
        category: 'Wellness & Mindset',
        description: 'Wellness mindset flatlay'
      }
    ]
  },
  {
    id: 'pink-girly',
    name: 'Pink & Girly',
    description: 'Feminine pink palette, beauty essentials, glamorous',
    aesthetic: 'Playful feminine glamour',
    backgroundImage: '/flatlays/pink-girly/pink-girly-400.png',
    colors: ['#ff69b4', '#ffb6c1', '#ffc0cb', '#ffffff', '#000000'],
    fonts: ['Times New Roman', 'Dancing Script', 'Pacifico']
    images: [
      {
        id: 'pg-1',
        url: '/flatlays/pink-girly/pink-girly-400.png',
        title: 'Pink & Girly 1',
        category: 'Pink & Girly',
        description: 'Pink girly aesthetic flatlay'
      },
      {
        id: 'pg-2',
        url: '/flatlays/pink-girly/pink-girly-401.png',
        title: 'Pink & Girly 2',
        category: 'Pink & Girly',
        description: 'Pink girly aesthetic flatlay'
      },
      {
        id: 'pg-3',
        url: '/flatlays/pink-girly/pink-girly-402.png',
        title: 'Pink & Girly 3',
        category: 'Pink & Girly',
        description: 'Pink girly aesthetic flatlay'
      },
      {
        id: 'pg-4',
        url: '/flatlays/pink-girly/pink-girly-403.png',
        title: 'Pink & Girly 4',
        category: 'Pink & Girly',
        description: 'Pink girly aesthetic flatlay'
      },
      {
        id: 'pg-5',
        url: '/flatlays/pink-girly/pink-girly-404.png',
        title: 'Pink & Girly 5',
        category: 'Pink & Girly',
        description: 'Pink girly aesthetic flatlay'
      },
      {
        id: 'pg-6',
        url: '/flatlays/pink-girly/pink-girly-405.png',
        title: 'Pink & Girly 6',
        category: 'Pink & Girly',
        description: 'Pink girly aesthetic flatlay'
      },
      {
        id: 'pg-7',
        url: '/flatlays/pink-girly/pink-girly-406.png',
        title: 'Pink & Girly 7',
        category: 'Pink & Girly',
        description: 'Pink girly aesthetic flatlay'
      },
      {
        id: 'pg-8',
        url: '/flatlays/pink-girly/pink-girly-407.png',
        title: 'Pink & Girly 8',
        category: 'Pink & Girly',
        description: 'Pink girly aesthetic flatlay'
      }
    ]
  }
];
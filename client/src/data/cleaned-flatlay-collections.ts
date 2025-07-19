// CLEAN flatlay collections with ONLY working local images and complete font/color data
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
  colors: string[];
  fonts: string[];
}

// COMPLETELY CLEAN flatlay collections - only local images that exist
export const cleanedFlatlayCollections: FlatlayCollection[] = [
  {
    id: 'luxury-minimal',
    name: 'Luxury Minimal',
    description: 'Clean white backgrounds, designer accessories, minimal styling',
    aesthetic: 'Clean sophistication with generous white space',
    backgroundImage: '/api/flatlay-gallery/luxury-minimal-1.jpg',
    colors: ['#ffffff', '#f8f9fa', '#e9ecef', '#000000', '#6c757d'],
    fonts: ['Times New Roman', 'Helvetica Neue', 'Arial'],
    images: [
      {
        id: 'lm-1',
        url: '/api/flatlay-gallery/luxury-minimal-1.jpg',
        title: 'Clean Workspace',
        category: 'Luxury Minimal',
        description: 'Clean sophisticated lifestyle flatlay'
      },
      {
        id: 'lm-2',
        url: '/api/flatlay-gallery/luxury-minimal-2.jpg',
        title: 'Minimal Setup',
        category: 'Luxury Minimal',
        description: 'Clean sophisticated lifestyle flatlay'
      },
      {
        id: 'lm-3',
        url: '/api/flatlay-gallery/luxury-minimal-3.jpg',
        title: 'Beauty Minimal',
        category: 'Luxury Minimal',
        description: 'Clean sophisticated lifestyle flatlay'
      },
      {
        id: 'lm-4',
        url: '/api/flatlay-gallery/luxury-minimal-1.jpg',
        title: 'Planning Flatlay',
        category: 'Luxury Minimal',
        description: 'Clean sophisticated lifestyle flatlay'
      },
      {
        id: 'lm-5',
        url: '/api/flatlay-gallery/luxury-minimal-2.jpg',
        title: 'Executive Setup',
        category: 'Luxury Minimal',
        description: 'Clean sophisticated lifestyle flatlay'
      },
      {
        id: 'lm-6',
        url: '/api/flatlay-gallery/luxury-minimal-3.jpg',
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
    backgroundImage: '/api/flatlay-gallery/luxury-minimal-1.jpg',
    colors: ['#2c2c2c', '#000000', '#8b6f47', '#d4af37', '#ffffff'],
    fonts: ['Times New Roman', 'Playfair Display', 'Georgia'],
    images: [
      {
        id: 'em-1',
        url: '/api/flatlay-gallery/luxury-minimal-1.jpg',
        title: 'Coffee Editorial',
        category: 'Editorial Magazine',
        description: 'Editorial Magazine aesthetic flatlay'
      },
      {
        id: 'em-2',
        url: '/api/flatlay-gallery/luxury-minimal-2.jpg',
        title: 'Magazine Spread',
        category: 'Editorial Magazine',
        description: 'Editorial Magazine aesthetic flatlay'
      },
      {
        id: 'em-3',
        url: '/api/flatlay-gallery/luxury-minimal-3.jpg',
        title: 'Dark Moody',
        category: 'Editorial Magazine',
        description: 'Editorial Magazine aesthetic flatlay'
      },
      {
        id: 'em-4',
        url: '/api/flatlay-gallery/luxury-minimal-1.jpg',
        title: 'Fashion Flatlay',
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
    backgroundImage: '/api/flatlay-gallery/luxury-minimal-2.jpg',
    colors: ['#8b4513', '#daa520', '#2f4f4f', '#000000', '#f5f5dc'],
    fonts: ['Times New Roman', 'Cormorant Garamond', 'Crimson Text'],
    images: [
      {
        id: 'el-1',
        url: '/api/flatlay-gallery/luxury-minimal-2.jpg',
        title: 'European Elegance',
        category: 'European Luxury',
        description: 'European luxury lifestyle flatlay'
      },
      {
        id: 'el-2',
        url: '/api/flatlay-gallery/luxury-minimal-3.jpg',
        title: 'Luxury Accessories',
        category: 'European Luxury',
        description: 'European luxury lifestyle flatlay'
      },
      {
        id: 'el-3',
        url: '/api/flatlay-gallery/luxury-minimal-1.jpg',
        title: 'Refined Setup',
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
    backgroundImage: '/api/flatlay-gallery/luxury-minimal-3.jpg',
    colors: ['#2c3e50', '#34495e', '#95a5a6', '#ffffff', '#000000'],
    fonts: ['Times New Roman', 'Open Sans', 'Lato'],
    images: [
      {
        id: 'bp-1',
        url: '/api/flatlay-gallery/luxury-minimal-3.jpg',
        title: 'Executive Desk',
        category: 'Business Professional',
        description: 'Professional business flatlay'
      },
      {
        id: 'bp-2',
        url: '/api/flatlay-gallery/luxury-minimal-1.jpg',
        title: 'Planning Session',
        category: 'Business Professional',
        description: 'Professional business flatlay'
      },
      {
        id: 'bp-3',
        url: '/api/flatlay-gallery/luxury-minimal-2.jpg',
        title: 'Office Setup',
        category: 'Business Professional',
        description: 'Professional business flatlay'
      }
    ]
  }
];
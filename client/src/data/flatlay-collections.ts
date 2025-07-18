// Real flatlay collections extracted from flatlay library
// This ensures visual editor uses the exact same data as the flatlay library page

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
}

// Exported flatlay collections - exact same data as flatlay-library.tsx
export const flatlayCollections: FlatlayCollection[] = [
  {
    id: 'luxury-minimal',
    name: 'Luxury Minimal',
    description: 'Clean white backgrounds, designer accessories, minimal styling',
    aesthetic: 'Clean sophistication with generous white space',
    backgroundImage: '/flatlays/luxury-minimal/luxury-minimal-001.png',
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
      }
    ]
  },
  {
    id: 'european-luxury',
    name: 'European Luxury',
    description: 'Sophisticated European lifestyle with luxury accessories',
    aesthetic: 'Refined European elegance and sophistication',
    backgroundImage: '/flatlays/european-luxury/european-luxury-100.png',
    images: [
      {
        id: 'el-1',
        url: '/flatlays/european-luxury/european-luxury-100.png',
        title: 'European Elegance 1',
        category: 'European Luxury',
        description: 'Sophisticated European lifestyle flatlay'
      },
      {
        id: 'el-2',
        url: '/flatlays/european-luxury/european-luxury-101.png',
        title: 'European Elegance 2',
        category: 'European Luxury',
        description: 'Sophisticated European lifestyle flatlay'
      },
      {
        id: 'el-3',
        url: '/flatlays/european-luxury/european-luxury-102.png',
        title: 'European Elegance 3',
        category: 'European Luxury',
        description: 'Sophisticated European lifestyle flatlay'
      },
      {
        id: 'el-4',
        url: '/flatlays/european-luxury/european-luxury-103.png',
        title: 'European Elegance 4',
        category: 'European Luxury',
        description: 'Sophisticated European lifestyle flatlay'
      },
      {
        id: 'el-5',
        url: '/flatlays/european-luxury/european-luxury-104.png',
        title: 'European Elegance 5',
        category: 'European Luxury',
        description: 'Sophisticated European lifestyle flatlay'
      },
      {
        id: 'el-6',
        url: '/flatlays/european-luxury/european-luxury-105.png',
        title: 'European Elegance 6',
        category: 'European Luxury',
        description: 'Sophisticated European lifestyle flatlay'
      }
    ]
  },
  {
    id: 'business-professional',
    name: 'Business Professional',
    description: 'Professional business flatlays with laptops, planners, office elements',
    aesthetic: 'Clean professional business aesthetic',
    backgroundImage: '/flatlays/business-professional/business-professional-200.png',
    images: [
      {
        id: 'bp-1',
        url: '/flatlays/business-professional/business-professional-200.png',
        title: 'Professional Setup 1',
        category: 'Business Professional',
        description: 'Professional business flatlay'
      },
      {
        id: 'bp-2',
        url: '/flatlays/business-professional/business-professional-201.png',
        title: 'Professional Setup 2',
        category: 'Business Professional',
        description: 'Professional business flatlay'
      },
      {
        id: 'bp-3',
        url: '/flatlays/business-professional/business-professional-202.png',
        title: 'Professional Setup 3',
        category: 'Business Professional',
        description: 'Professional business flatlay'
      },
      {
        id: 'bp-4',
        url: '/flatlays/business-professional/business-professional-203.png',
        title: 'Professional Setup 4',
        category: 'Business Professional',
        description: 'Professional business flatlay'
      },
      {
        id: 'bp-5',
        url: '/flatlays/business-professional/business-professional-204.png',
        title: 'Professional Setup 5',
        category: 'Business Professional',
        description: 'Professional business flatlay'
      },
      {
        id: 'bp-6',
        url: '/flatlays/business-professional/business-professional-205.png',
        title: 'Professional Setup 6',
        category: 'Business Professional',
        description: 'Professional business flatlay'
      }
    ]
  }
];
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
    backgroundImage: 'https://i.postimg.cc/1tfNMJvk/file-16.png',
    images: [
      {
        id: 'lm-1',
        url: 'https://i.postimg.cc/1tfNMJvk/file-16.png',
        title: 'Clean Workspace',
        category: 'Luxury Minimal',
        description: 'Clean sophisticated lifestyle flatlay'
      },
      {
        id: 'lm-2',
        url: 'https://i.postimg.cc/6qZ4xTJz/file-19.png',
        title: 'Minimal Setup',
        category: 'Luxury Minimal',
        description: 'Clean sophisticated lifestyle flatlay'
      },
      {
        id: 'lm-3',
        url: 'https://i.postimg.cc/4NzH8K1x/file-20.png',
        title: 'Beauty Minimal',
        category: 'Luxury Minimal',
        description: 'Clean sophisticated lifestyle flatlay'
      },
      {
        id: 'lm-4',
        url: 'https://i.postimg.cc/V5ysqFhW/file-21.png',
        title: 'Planning Flatlay',
        category: 'Luxury Minimal',
        description: 'Clean sophisticated lifestyle flatlay'
      },
      {
        id: 'lm-5',
        url: 'https://i.postimg.cc/yY9cwp7B/file-22.png',
        title: 'Executive Setup',
        category: 'Luxury Minimal',
        description: 'Clean sophisticated lifestyle flatlay'
      },
      {
        id: 'lm-6',
        url: 'https://i.postimg.cc/bvFZG1q3/file-23.png',
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
    backgroundImage: 'https://i.postimg.cc/02VLGyr8/1.png',
    images: [
      {
        id: 'em-1',
        url: 'https://i.postimg.cc/02VLGyr8/1.png',
        title: 'Editorial Magazine 1',
        category: 'Editorial Magazine',
        description: 'Editorial Magazine aesthetic flatlay'
      },
      {
        id: 'em-2',
        url: 'https://i.postimg.cc/xjR7Y1vK/10.png',
        title: 'Editorial Magazine 2',
        category: 'Editorial Magazine',
        description: 'Editorial Magazine aesthetic flatlay'
      },
      {
        id: 'em-3',
        url: 'https://i.postimg.cc/TwC83VLX/100.png',
        title: 'Editorial Magazine 3',
        category: 'Editorial Magazine',
        description: 'Editorial Magazine aesthetic flatlay'
      },
      {
        id: 'em-4',
        url: 'https://i.postimg.cc/90nvGcY8/101.png',
        title: 'Editorial Magazine 4',
        category: 'Editorial Magazine',
        description: 'Editorial Magazine aesthetic flatlay'
      },
      {
        id: 'em-5',
        url: 'https://i.postimg.cc/j25pwDPn/102.png',
        title: 'Editorial Magazine 5',
        category: 'Editorial Magazine',
        description: 'Editorial Magazine aesthetic flatlay'
      },
      {
        id: 'em-6',
        url: 'https://i.postimg.cc/9F43cqcv/103.png',
        title: 'Editorial Magazine 6',
        category: 'Editorial Magazine',
        description: 'Editorial Magazine aesthetic flatlay'
      }
    ]
  }
];
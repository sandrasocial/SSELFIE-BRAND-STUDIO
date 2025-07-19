// Workspace flatlay collections - exact copy from flatlay library for pro members
// This ensures visual editor uses the same data as the actual flatlay library page

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

// Exact same data as workspace flatlay library - for pro members only
export const workspaceFlatlayCollections: FlatlayCollection[] = [
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
        url: 'https://i.postimg.cc/Xqyp2KPn/100.png',
        title: 'Editorial Magazine 3',
        category: 'Editorial Magazine',
        description: 'Editorial Magazine aesthetic flatlay'
      },
      {
        id: 'em-4',
        url: 'https://i.postimg.cc/bYZMPdbk/101.png',
        title: 'Editorial Magazine 4',
        category: 'Editorial Magazine',
        description: 'Editorial Magazine aesthetic flatlay'
      },
      {
        id: 'em-5',
        url: 'https://i.postimg.cc/vHjVJcCR/102.png',
        title: 'Editorial Magazine 5',
        category: 'Editorial Magazine',
        description: 'Editorial Magazine aesthetic flatlay'
      }
    ]
  },
  {
    id: 'european-luxury',
    name: 'European Luxury',
    description: 'Parisian cafe tables, designer bags, luxury lifestyle',
    aesthetic: 'Sophisticated European elegance with rich textures',
    backgroundImage: 'https://i.postimg.cc/02VLGyr8/1.png',
    images: [
      {
        id: 'el-1',
        url: 'https://i.postimg.cc/02VLGyr8/1.png',
        title: 'European Luxury 1',
        category: 'European Luxury',
        description: 'European luxury lifestyle flatlay'
      },
      {
        id: 'el-2',
        url: 'https://i.postimg.cc/xjR7Y1vK/10.png',
        title: 'European Luxury 2',
        category: 'European Luxury',
        description: 'European luxury lifestyle flatlay'
      }
    ]
  },
  {
    id: 'wellness-mindset',
    name: 'Wellness Mindset',
    description: 'Natural textures, crystals, journals, healing energy',
    aesthetic: 'Mindful wellness with organic textures and earth tones',
    backgroundImage: 'https://i.postimg.cc/02VLGyr8/1.png',
    images: [
      {
        id: 'wm-1',
        url: 'https://i.postimg.cc/02VLGyr8/1.png',
        title: 'Wellness Mindset 1',
        category: 'Wellness Mindset',
        description: 'Wellness mindset flatlay'
      },
      {
        id: 'wm-2',
        url: 'https://i.postimg.cc/xjR7Y1vK/10.png',
        title: 'Wellness Mindset 2',
        category: 'Wellness Mindset',
        description: 'Wellness mindset flatlay'
      }
    ]
  },
  {
    id: 'business-professional',
    name: 'Business Professional',
    description: 'Laptop flatlays, planning materials, executive aesthetic',
    aesthetic: 'Clean professional workspace with modern technology',
    backgroundImage: 'https://i.postimg.cc/02VLGyr8/1.png',
    images: [
      {
        id: 'bp-1',
        url: 'https://i.postimg.cc/02VLGyr8/1.png',
        title: 'Business Professional 1',
        category: 'Business Professional',
        description: 'Business professional flatlay'
      },
      {
        id: 'bp-2',
        url: 'https://i.postimg.cc/xjR7Y1vK/10.png',
        title: 'Business Professional 2',
        category: 'Business Professional',
        description: 'Business professional flatlay'
      }
    ]
  },
  {
    id: 'pink-girly',
    name: 'Pink Girly',
    description: 'Soft feminine flatlays, beauty products, pink aesthetic',
    aesthetic: 'Feminine pink tones with beauty and lifestyle elements',
    backgroundImage: 'https://i.postimg.cc/02VLGyr8/1.png',
    images: [
      {
        id: 'pg-1',
        url: 'https://i.postimg.cc/02VLGyr8/1.png',
        title: 'Pink Girly 1',
        category: 'Pink Girly',
        description: 'Pink girly aesthetic flatlay'
      },
      {
        id: 'pg-2',
        url: 'https://i.postimg.cc/xjR7Y1vK/10.png',
        title: 'Pink Girly 2',
        category: 'Pink Girly',
        description: 'Pink girly aesthetic flatlay'
      }
    ]
  }
];
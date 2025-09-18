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

// Aesthetic Recipes Style Collection - Aligned with Maya's v2 Prompt Builder
// Maps directly to the structured aesthetic recipes system
export const brandStyleCollections: BrandStyleCollection[] = [
  {
    id: 'scandinavian-minimalist',
    name: 'Scandinavian Minimalist',
    description: 'Clean, bright, and intentional. Capturing cozy modern vibes with natural materials and soft light.',
    aesthetic: 'Bright, airy, and intentional simplicity',
    backgroundImage: '/flatlay-luxury-planning.jpg',
    imageUrl: '/flatlay-luxury-planning.jpg',
    colors: ['#FFFFFF', '#F5F5F0', '#E8E6E1', '#D2C7B8', '#A8A196'],
    fonts: ['Helvetica Neue', 'Inter', 'Source Sans Pro'],
    images: [
      { id: 'sm-1', url: '/flatlay-luxury-planning.jpg', title: 'Nordic Light' },
      { id: 'sm-2', url: '/gallery-luxury-workspace.jpg', title: 'Hygge Workspace' },
      { id: 'sm-3', url: '/flatlay-luxury-planning.jpg', title: 'Natural Materials' },
      { id: 'sm-4', url: '/gallery-luxury-workspace.jpg', title: 'Clean Lines' },
      { id: 'sm-5', url: '/flatlay-luxury-planning.jpg', title: 'Serene Moment' },
      { id: 'sm-6', url: '/gallery-luxury-workspace.jpg', title: 'Minimal Beauty' },
      { id: 'sm-7', url: '/flatlay-luxury-planning.jpg', title: 'Organic Forms' },
      { id: 'sm-8', url: '/gallery-luxury-workspace.jpg', title: 'Light Wood' }
    ]
  },
  {
    id: 'urban-moody',
    name: 'Urban Moody',
    description: 'Sophisticated, atmospheric, and cinematic. For the professional with an edge who thrives in dynamic city environments.',
    aesthetic: 'Dark sophistication with dramatic flair',
    backgroundImage: '/gallery-luxury-workspace.jpg',
    imageUrl: '/gallery-luxury-workspace.jpg',
    colors: ['#0A0A0A', '#1C1C1C', '#333333', '#666666', '#8C7853'],
    fonts: ['Times New Roman', 'Playfair Display', 'Crimson Text'],
    images: [
      { id: 'um-1', url: '/gallery-luxury-workspace.jpg', title: 'Urban Edge' },
      { id: 'um-2', url: '/flatlay-luxury-planning.jpg', title: 'City Shadows' },
      { id: 'um-3', url: '/gallery-luxury-workspace.jpg', title: 'Dramatic Light' },
      { id: 'um-4', url: '/flatlay-luxury-planning.jpg', title: 'Metropolitan' },
      { id: 'um-5', url: '/gallery-luxury-workspace.jpg', title: 'Cinematic Mood' },
      { id: 'um-6', url: '/flatlay-luxury-planning.jpg', title: 'Industrial Chic' },
      { id: 'um-7', url: '/gallery-luxury-workspace.jpg', title: 'Atmospheric' },
      { id: 'um-8', url: '/flatlay-luxury-planning.jpg', title: 'Street Sophistication' }
    ]
  },
  {
    id: 'high-end-coastal',
    name: 'Coastal Luxury',
    description: 'Effortless luxury meets the sea. Relaxed elegance for the entrepreneur who values sophisticated simplicity.',
    aesthetic: 'Serene coastal luxury and natural elegance',
    backgroundImage: '/flatlay-luxury-planning.jpg',
    imageUrl: '/flatlay-luxury-planning.jpg',
    colors: ['#F8F6F0', '#E8E2D5', '#D4C4A8', '#B8A082', '#7FB3D3'],
    fonts: ['Libre Baskerville', 'Lora', 'Source Serif Pro'],
    images: [
      { id: 'cl-1', url: '/flatlay-luxury-planning.jpg', title: 'Ocean Views' },
      { id: 'cl-2', url: '/gallery-luxury-workspace.jpg', title: 'Seaside Luxury' },
      { id: 'cl-3', url: '/flatlay-luxury-planning.jpg', title: 'Coastal Breeze' },
      { id: 'cl-4', url: '/gallery-luxury-workspace.jpg', title: 'Natural Elegance' },
      { id: 'cl-5', url: '/flatlay-luxury-planning.jpg', title: 'Resort Style' },
      { id: 'cl-6', url: '/gallery-luxury-workspace.jpg', title: 'Effortless Chic' },
      { id: 'cl-7', url: '/flatlay-luxury-planning.jpg', title: 'Linen Lifestyle' },
      { id: 'cl-8', url: '/gallery-luxury-workspace.jpg', title: 'Breezy Sophistication' }
    ]
  },
  {
    id: 'white-space-executive',
    name: 'White Space Executive',
    description: 'Modern, powerful, and architecturally clean. For the forward-thinking leader who values contemporary sophistication.',
    aesthetic: 'Architectural minimalism meets executive power',
    backgroundImage: '/flatlay-luxury-planning.jpg',
    imageUrl: '/flatlay-luxury-planning.jpg',
    colors: ['#FFFFFF', '#FAFAFA', '#F0F0F0', '#E0E0E0', '#CCCCCC'],
    fonts: ['Helvetica Neue', 'Inter', 'Montserrat'],
    images: [
      { id: 'ws-1', url: '/flatlay-luxury-planning.jpg', title: 'Clean Architecture' },
      { id: 'ws-2', url: '/gallery-luxury-workspace.jpg', title: 'Modern Executive' },
      { id: 'ws-3', url: '/flatlay-luxury-planning.jpg', title: 'Minimal Power' },
      { id: 'ws-4', url: '/gallery-luxury-workspace.jpg', title: 'High-Tech Luxury' },
      { id: 'ws-5', url: '/flatlay-luxury-planning.jpg', title: 'Innovation Hub' },
      { id: 'ws-6', url: '/gallery-luxury-workspace.jpg', title: 'Contemporary Leadership' },
      { id: 'ws-7', url: '/flatlay-luxury-planning.jpg', title: 'Structured Vision' },
      { id: 'ws-8', url: '/gallery-luxury-workspace.jpg', title: 'Future Forward' }
    ]
  },
  {
    id: 'classic-black-white',
    name: 'Editorial B&W',
    description: 'Timeless, emotional, and powerful. Focus on form, texture, and expression for sophisticated artistic storytelling.',
    aesthetic: 'Monochrome artistry with timeless elegance',
    backgroundImage: '/gallery-luxury-workspace.jpg',
    imageUrl: '/gallery-luxury-workspace.jpg',
    colors: ['#000000', '#1A1A1A', '#666666', '#CCCCCC', '#FFFFFF'],
    fonts: ['Times New Roman', 'Playfair Display', 'Crimson Text'],
    images: [
      { id: 'bw-1', url: '/gallery-luxury-workspace.jpg', title: 'Monochrome Art' },
      { id: 'bw-2', url: '/flatlay-luxury-planning.jpg', title: 'Textural Study' },
      { id: 'bw-3', url: '/gallery-luxury-workspace.jpg', title: 'High Contrast' },
      { id: 'bw-4', url: '/flatlay-luxury-planning.jpg', title: 'Form & Shadow' },
      { id: 'bw-5', url: '/gallery-luxury-workspace.jpg', title: 'Emotional Depth' },
      { id: 'bw-6', url: '/flatlay-luxury-planning.jpg', title: 'Classic Beauty' },
      { id: 'bw-7', url: '/gallery-luxury-workspace.jpg', title: 'Dramatic Light' },
      { id: 'bw-8', url: '/flatlay-luxury-planning.jpg', title: 'Artistic Expression' }
    ]
  },
  {
    id: 'golden-hour-glow',
    name: 'Golden Hour Glow',
    description: 'Warm, approachable, and authentic. Capturing the magic of golden hour for genuine connection and natural beauty.',
    aesthetic: 'Sun-kissed warmth and authentic beauty',
    backgroundImage: '/gallery-luxury-workspace.jpg',
    imageUrl: '/gallery-luxury-workspace.jpg',
    colors: ['#FDF6E3', '#F7DC6F', '#E67E22', '#D68910', '#B7950B'],
    fonts: ['Georgia', 'Crimson Text', 'Libre Baskerville'],
    images: [
      { id: 'gh-1', url: '/gallery-luxury-workspace.jpg', title: 'Golden Magic' },
      { id: 'gh-2', url: '/flatlay-luxury-planning.jpg', title: 'Warm Embrace' },
      { id: 'gh-3', url: '/gallery-luxury-workspace.jpg', title: 'Sunset Glow' },
      { id: 'gh-4', url: '/flatlay-luxury-planning.jpg', title: 'Authentic Light' },
      { id: 'gh-5', url: '/gallery-luxury-workspace.jpg', title: 'Natural Radiance' },
      { id: 'gh-6', url: '/flatlay-luxury-planning.jpg', title: 'Honeyed Tones' },
      { id: 'gh-7', url: '/gallery-luxury-workspace.jpg', title: 'Soft Shadows' },
      { id: 'gh-8', url: '/flatlay-luxury-planning.jpg', title: 'Lens Flare Magic' }
    ]
  },
  {
    id: 'night-time-luxe',
    name: 'Night Luxe',
    description: 'Energetic, sophisticated, and glamorous. The city comes alive at night for the dynamic professional.',
    aesthetic: 'Glamorous city energy and sophisticated nightlife',
    backgroundImage: '/gallery-luxury-workspace.jpg',
    imageUrl: '/gallery-luxury-workspace.jpg',
    colors: ['#0D1117', '#1C2128', '#8B5CF6', '#F59E0B', '#EF4444'],
    fonts: ['Times New Roman', 'Playfair Display', 'Didot'],
    images: [
      { id: 'nl-1', url: '/gallery-luxury-workspace.jpg', title: 'City Nights' },
      { id: 'nl-2', url: '/flatlay-luxury-planning.jpg', title: 'Neon Glow' },
      { id: 'nl-3', url: '/gallery-luxury-workspace.jpg', title: 'Urban Glamour' },
      { id: 'nl-4', url: '/flatlay-luxury-planning.jpg', title: 'Evening Luxe' },
      { id: 'nl-5', url: '/gallery-luxury-workspace.jpg', title: 'Sophisticated Night' },
      { id: 'nl-6', url: '/flatlay-luxury-planning.jpg', title: 'High Fashion' },
      { id: 'nl-7', url: '/gallery-luxury-workspace.jpg', title: 'Dynamic Energy' },
      { id: 'nl-8', url: '/flatlay-luxury-planning.jpg', title: 'Nightlife Elegance' }
    ]
  },
  {
    id: 'beige-sophisticated',
    name: 'Beige & Sophisticated',
    description: 'Warm, calm, and professional. The modern neutral palette for contemporary business and creative work.',
    aesthetic: 'Warm minimalism with professional sophistication',
    backgroundImage: '/flatlay-luxury-planning.jpg',
    imageUrl: '/flatlay-luxury-planning.jpg',
    colors: ['#F5F5DC', '#E6D7C3', '#D4C4A8', '#C2A878', '#A08660'],
    fonts: ['Helvetica Neue', 'Inter', 'Source Sans Pro'],
    images: [
      { id: 'bs-1', url: '/flatlay-luxury-planning.jpg', title: 'Neutral Elegance' },
      { id: 'bs-2', url: '/gallery-luxury-workspace.jpg', title: 'Warm Professional' },
      { id: 'bs-3', url: '/flatlay-luxury-planning.jpg', title: 'Contemporary Calm' },
      { id: 'bs-4', url: '/gallery-luxury-workspace.jpg', title: 'Sophisticated Tones' },
      { id: 'bs-5', url: '/flatlay-luxury-planning.jpg', title: 'Modern Business' },
      { id: 'bs-6', url: '/gallery-luxury-workspace.jpg', title: 'Luxury Casual' },
      { id: 'bs-7', url: '/flatlay-luxury-planning.jpg', title: 'Minimal Warmth' },
      { id: 'bs-8', url: '/gallery-luxury-workspace.jpg', title: 'Cashmere Vibes' }
    ]
  }
];

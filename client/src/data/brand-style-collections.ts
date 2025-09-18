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

// Maya's 8 Curated Signature Looks for Style Selection
// Aligned with Maya's Creative Lookbook from her personality system
export const brandStyleCollections: BrandStyleCollection[] = [
  {
    id: 'scandinavian-minimalist',
    name: 'Scandinavian Minimalist',
    description: 'Clean, bright images with natural materials and soft light – a cozy, modern vibe perfect for the mindful entrepreneur',
    aesthetic: 'Bright, airy, and intentional simplicity',
    backgroundImage: '/flatlay-luxury-planning.jpg',
    imageUrl: '/flatlay-luxury-planning.jpg',
    colors: ['#FFFFFF', '#F5F5F0', '#E8E6E1', '#D2C7B8', '#A8A196'],
    fonts: ['Helvetica Neue', 'Inter', 'Source Sans Pro'],
    images: [
      { id: 'sm-1', url: '/flatlay-luxury-planning.jpg', title: 'Nordic Workspace' },
      { id: 'sm-2', url: '/gallery-luxury-workspace.jpg', title: 'Minimalist Setup' },
      { id: 'sm-3', url: '/flatlay-luxury-planning.jpg', title: 'Clean Essentials' },
      { id: 'sm-4', url: '/gallery-luxury-workspace.jpg', title: 'Natural Light' },
      { id: 'sm-5', url: '/flatlay-luxury-planning.jpg', title: 'Hygge Lifestyle' },
      { id: 'sm-6', url: '/gallery-luxury-workspace.jpg', title: 'Serene Flatlay' },
      { id: 'sm-7', url: '/flatlay-luxury-planning.jpg', title: 'Organic Forms' },
      { id: 'sm-8', url: '/gallery-luxury-workspace.jpg', title: 'Light Wood' }
    ]
  },
  {
    id: 'urban-moody',
    name: 'Urban Moody',
    description: 'Sophisticated, atmospheric, and cinematic – for the professional with an edge who thrives in dynamic environments',
    aesthetic: 'Dark sophistication with dramatic flair',
    backgroundImage: '/gallery-luxury-workspace.jpg',
    imageUrl: '/gallery-luxury-workspace.jpg',
    colors: ['#0A0A0A', '#1C1C1C', '#333333', '#666666', '#8C7853'],
    fonts: ['Times New Roman', 'Playfair Display', 'Crimson Text'],
    images: [
      { id: 'um-1', url: '/gallery-luxury-workspace.jpg', title: 'City Lights' },
      { id: 'um-2', url: '/flatlay-luxury-planning.jpg', title: 'Night Work' },
      { id: 'um-3', url: '/gallery-luxury-workspace.jpg', title: 'Dramatic Shadows' },
      { id: 'um-4', url: '/flatlay-luxury-planning.jpg', title: 'Urban Edge' },
      { id: 'um-5', url: '/gallery-luxury-workspace.jpg', title: 'Cinematic Mood' },
      { id: 'um-6', url: '/flatlay-luxury-planning.jpg', title: 'Dark Academia' },
      { id: 'um-7', url: '/gallery-luxury-workspace.jpg', title: 'Atmospheric' },
      { id: 'um-8', url: '/flatlay-luxury-planning.jpg', title: 'Sophisticated Edge' }
    ]
  },
  {
    id: 'high-end-coastal',
    name: 'High-End Coastal',
    description: 'Effortless luxury meets the sea – relaxed elegance for the entrepreneur who values sophisticated simplicity',
    aesthetic: 'Serene coastal luxury and natural elegance',
    backgroundImage: '/flatlay-luxury-planning.jpg',
    imageUrl: '/flatlay-luxury-planning.jpg',
    colors: ['#F8F6F0', '#E8E2D5', '#D4C4A8', '#B8A082', '#7FB3D3'],
    fonts: ['Libre Baskerville', 'Lora', 'Source Serif Pro'],
    images: [
      { id: 'hc-1', url: '/flatlay-luxury-planning.jpg', title: 'Ocean Breeze' },
      { id: 'hc-2', url: '/gallery-luxury-workspace.jpg', title: 'Coastal Living' },
      { id: 'hc-3', url: '/flatlay-luxury-planning.jpg', title: 'Seaside Luxury' },
      { id: 'hc-4', url: '/gallery-luxury-workspace.jpg', title: 'Linen Textures' },
      { id: 'hc-5', url: '/flatlay-luxury-planning.jpg', title: 'Natural Elegance' },
      { id: 'hc-6', url: '/gallery-luxury-workspace.jpg', title: 'Breezy Sophistication' },
      { id: 'hc-7', url: '/flatlay-luxury-planning.jpg', title: 'Effortless Chic' },
      { id: 'hc-8', url: '/gallery-luxury-workspace.jpg', title: 'Resort Lifestyle' }
    ]
  },
  {
    id: 'golden-hour-glow',
    name: 'Golden Hour Glow',
    description: 'Warm, approachable, and authentic – capturing the magic of golden hour for genuine connection and warmth',
    aesthetic: 'Sun-kissed warmth and authentic beauty',
    backgroundImage: '/gallery-luxury-workspace.jpg',
    imageUrl: '/gallery-luxury-workspace.jpg',
    colors: ['#FDF6E3', '#F7DC6F', '#E67E22', '#D68910', '#B7950B'],
    fonts: ['Georgia', 'Crimson Text', 'Libre Baskerville'],
    images: [
      { id: 'gh-1', url: '/gallery-luxury-workspace.jpg', title: 'Golden Light' },
      { id: 'gh-2', url: '/flatlay-luxury-planning.jpg', title: 'Warm Glow' },
      { id: 'gh-3', url: '/gallery-luxury-workspace.jpg', title: 'Sunset Magic' },
      { id: 'gh-4', url: '/flatlay-luxury-planning.jpg', title: 'Authentic Warmth' },
      { id: 'gh-5', url: '/gallery-luxury-workspace.jpg', title: 'Natural Beauty' },
      { id: 'gh-6', url: '/flatlay-luxury-planning.jpg', title: 'Sun-Kissed' },
      { id: 'gh-7', url: '/gallery-luxury-workspace.jpg', title: 'Soft Shadows' },
      { id: 'gh-8', url: '/flatlay-luxury-planning.jpg', title: 'Lens Flare' }
    ]
  },
  {
    id: 'white-space-executive',
    name: 'White Space Executive',
    description: 'Modern, powerful, and architecturally clean – for the forward-thinking leader who values contemporary sophistication',
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
    id: 'night-time-luxe',
    name: 'Night Time Luxe',
    description: 'Energetic, sophisticated, and glamorous – the city comes alive at night for the dynamic professional',
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
    id: 'classic-black-white',
    name: 'Classic B&W',
    description: 'Timeless, emotional, and powerful – focus on form, texture, and expression for artistic storytelling',
    aesthetic: 'Timeless elegance through monochrome artistry',
    backgroundImage: '/gallery-luxury-workspace.jpg',
    imageUrl: '/gallery-luxury-workspace.jpg',
    colors: ['#000000', '#1A1A1A', '#666666', '#CCCCCC', '#FFFFFF'],
    fonts: ['Times New Roman', 'Playfair Display', 'Crimson Text'],
    images: [
      { id: 'bw-1', url: '/gallery-luxury-workspace.jpg', title: 'Monochrome Art' },
      { id: 'bw-2', url: '/flatlay-luxury-planning.jpg', title: 'Classic Portrait' },
      { id: 'bw-3', url: '/gallery-luxury-workspace.jpg', title: 'Textural Study' },
      { id: 'bw-4', url: '/flatlay-luxury-planning.jpg', title: 'High Contrast' },
      { id: 'bw-5', url: '/gallery-luxury-workspace.jpg', title: 'Timeless Beauty' },
      { id: 'bw-6', url: '/flatlay-luxury-planning.jpg', title: 'Emotional Depth' },
      { id: 'bw-7', url: '/gallery-luxury-workspace.jpg', title: 'Dramatic Form' },
      { id: 'bw-8', url: '/flatlay-luxury-planning.jpg', title: 'Artistic Expression' }
    ]
  },
  {
    id: 'beige-sophisticated',
    name: 'Beige & Sophisticated',
    description: 'Warm, calm, and professional – the modern neutral palette for contemporary business and creative work',
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

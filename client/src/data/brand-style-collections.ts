// Brand Style Collections - Luxury UX Optimized
// Simplified for high-end user experience with minimal cognitive load

export interface BrandStyleCollection {
  id: string;
  name: string;
  description: string;
  aesthetic: string;
  heroImage: string; // Single hero image for style preview
  accentImage?: string; // Optional accent image for variety
  primaryColor: string; // Main brand color
  secondaryColor: string; // Supporting color
  accentColor: string; // Accent/pop color
  primaryFont: string; // Single font choice for clarity
  mood: string; // Emotional descriptor
  targetAudience: string; // Who this style is for
}

// Luxury Brand Style Collections - UX Optimized
// Curated selection focusing on clarity, performance, and user decision-making
export const brandStyleCollections: BrandStyleCollection[] = [
  {
    id: 'editorial-luxury',
    name: 'Editorial Luxury',
    description: 'High-fashion editorial meets business sophistication. Command attention with effortless elegance.',
    aesthetic: 'Fashion-forward luxury with editorial sophistication',
    heroImage: '/gallery-luxury-workspace.jpg',
    accentImage: '/flatlay-luxury-planning.jpg',
    primaryColor: '#000000',
    secondaryColor: '#E5E5E5',
    accentColor: '#D4AF37',
    primaryFont: 'Times New Roman',
    mood: 'Commanding & Sophisticated',
    targetAudience: 'Fashion-forward executives and luxury entrepreneurs'
  },
  {
    id: 'modern-minimalist',
    name: 'Modern Minimalist',
    description: 'Clean lines, perfect proportions, and intentional simplicity. Less is more philosophy.',
    aesthetic: 'Sophisticated minimalism with architectural precision',
    heroImage: '/flatlay-luxury-planning.jpg',
    primaryColor: '#FFFFFF',
    secondaryColor: '#333333',
    accentColor: '#000000',
    primaryFont: 'Helvetica Neue',
    mood: 'Clean & Intentional',
    targetAudience: 'Design-conscious professionals and minimalist entrepreneurs'
  },
  {
    id: 'urban-moody',
    name: 'Urban Moody',
    description: 'Sophisticated, atmospheric, and cinematic. For professionals with an edge in dynamic environments.',
    aesthetic: 'Dark sophistication with dramatic flair',
    heroImage: '/gallery-luxury-workspace.jpg',
    primaryColor: '#0A0A0A',
    secondaryColor: '#333333',
    accentColor: '#8C7853',
    primaryFont: 'Playfair Display',
    mood: 'Dramatic & Atmospheric',
    targetAudience: 'Creative professionals and urban entrepreneurs'
  },
  {
    id: 'coastal-luxury',
    name: 'Coastal Luxury',
    description: 'Effortless luxury meets the sea. Relaxed elegance for sophisticated simplicity.',
    aesthetic: 'Serene coastal luxury and natural elegance',
    heroImage: '/flatlay-luxury-planning.jpg',
    primaryColor: '#F8F6F0',
    secondaryColor: '#D4C4A8',
    accentColor: '#7FB3D3',
    primaryFont: 'Libre Baskerville',
    mood: 'Serene & Effortless',
    targetAudience: 'Wellness-focused entrepreneurs and coastal professionals'
  },
  {
    id: 'tech-luxury',
    name: 'Tech Luxury',
    description: 'Cutting-edge innovation meets sophisticated design. Lead with intelligence and style.',
    aesthetic: 'High-tech luxury with futuristic sophistication',
    heroImage: '/gallery-luxury-workspace.jpg',
    primaryColor: '#0D1117',
    secondaryColor: '#58A6FF',
    accentColor: '#7C3AED',
    primaryFont: 'SF Pro Display',
    mood: 'Innovative & Futuristic',
    targetAudience: 'Tech entrepreneurs and innovation leaders'
  },
  {
    id: 'classic-monochrome',
    name: 'Classic Monochrome',
    description: 'Timeless, emotional, and powerful. Focus on form, texture, and sophisticated storytelling.',
    aesthetic: 'Monochrome artistry with timeless elegance',
    heroImage: '/gallery-luxury-workspace.jpg',
    primaryColor: '#000000',
    secondaryColor: '#FFFFFF',
    accentColor: '#666666',
    primaryFont: 'Times New Roman',
    mood: 'Timeless & Powerful',
    targetAudience: 'Artistic professionals and creative storytellers'
  }
];

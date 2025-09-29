// Export all styleguide templates
export { minimalisticTemplate } from './template-minimalistic.js';
export { boldTemplate } from './template-bold.js';
export { sophisticatedTemplate } from './template-sophisticated.js';
export { warmBeigeTemplate } from './template-warm-beige.js';
export { moodyTemplate } from './template-moody.js';
export { goldenTemplate } from './template-golden.js';

// Template registry for easy access
export const STYLEGUIDE_TEMPLATES = {
  minimalistic: () => import('./template-minimalistic.js').then(m => m.minimalisticTemplate),
  bold: () => import('./template-bold.js').then(m => m.boldTemplate),
  sophisticated: () => import('./template-sophisticated.js').then(m => m.sophisticatedTemplate),
  warmBeige: () => import('./template-warm-beige.js').then(m => m.warmBeigeTemplate),
  moody: () => import('./template-moody.js').then(m => m.moodyTemplate),
  golden: () => import('./template-golden.js').then(m => m.goldenTemplate),
  // Add more templates as they are created
};

// Template metadata for selection UI
export const TEMPLATE_METADATA = [
  {
    id: "minimalistic",
    name: "Refined Minimalist",
    description: "Clean, sophisticated design with generous white space and subtle elegance",
    category: "minimalist",
    previewImage: "/images/templates/minimalistic-preview.jpg",
    bestFor: ["wellness coaches", "lifestyle brands", "professionals", "consultants"]
  },
  {
    id: "bold",
    name: "Bold Femme",
    description: "Strong, confident design with earthy sophistication and powerful typography",
    category: "bold",
    previewImage: "/images/templates/bold-preview.jpg",
    bestFor: ["business leaders", "fitness coaches", "entrepreneurs", "speakers"]
  },
  {
    id: "sophisticated",
    name: "Coastal Luxury",
    description: "Elegant coastal sophistication with refined typography and serene color palette",
    category: "luxury",
    previewImage: "/images/templates/sophisticated-preview.jpg",
    bestFor: ["luxury brands", "consultants", "premium service providers", "lifestyle coaches"]
  },
  {
    id: "warm-beige",
    name: "Cozy Comfort",
    description: "Warm, inviting design with soft beige tones and approachable typography",
    category: "nurturing",
    previewImage: "/images/templates/warm-beige-preview.jpg",
    bestFor: ["lifestyle coaches", "home brands", "nurturing service providers", "wellness coaches"]
  },
  {
    id: "moody",
    name: "Executive Essence",
    description: "Deep, mysterious design with rich dark tones and sophisticated typography",
    category: "artistic",
    previewImage: "/images/templates/moody-preview.jpg",
    bestFor: ["photographers", "artists", "creative professionals", "luxury service providers"]
  },
  {
    id: "golden",
    name: "Luxe Feminine",
    description: "Warm, glowing design inspired by golden hour magic",
    category: "luxurious",
    previewImage: "/images/templates/golden-preview.jpg",
    bestFor: ["sunset lovers", "travel bloggers", "luxury lifestyle brands", "feminine entrepreneurs"]
  }
  // Add more template metadata as they are created
];
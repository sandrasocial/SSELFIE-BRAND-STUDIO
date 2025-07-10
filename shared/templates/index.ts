// Export all styleguide templates
export { minimalisticTemplate } from './template-minimalistic';
export { boldTemplate } from './template-bold';
export { sophisticatedTemplate } from './template-sophisticated';

// Template registry for easy access
export const STYLEGUIDE_TEMPLATES = {
  minimalistic: () => import('./template-minimalistic').then(m => m.minimalisticTemplate),
  bold: () => import('./template-bold').then(m => m.boldTemplate),
  sophisticated: () => import('./template-sophisticated').then(m => m.sophisticatedTemplate),
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
  }
  // Add more template metadata as they are created
];
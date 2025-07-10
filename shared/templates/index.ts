// Export all styleguide templates
export { minimalisticTemplate } from './template-minimalistic';

// Template registry for easy access
export const STYLEGUIDE_TEMPLATES = {
  minimalistic: () => import('./template-minimalistic').then(m => m.minimalisticTemplate),
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
  }
  // Add more template metadata as they are created
];
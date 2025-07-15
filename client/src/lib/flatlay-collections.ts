// Flatlay Collections - Ready for uploaded images
// Each collection will have 12 curated images uploaded by user

export interface FlatlayCollection {
  id: string;
  name: string;
  description: string;
  images: string[];
}

export const flatlayCollections: FlatlayCollection[] = [
  {
    id: "luxury-minimal",
    name: "Luxury Minimal",
    description: "Refined minimalism with luxury touches",
    images: [
      // Will be populated with uploaded images
      "/attached_assets/luxury-minimal-1.jpg",
      "/attached_assets/luxury-minimal-2.jpg",
      "/attached_assets/luxury-minimal-3.jpg",
      "/attached_assets/luxury-minimal-4.jpg",
      "/attached_assets/luxury-minimal-5.jpg",
      "/attached_assets/luxury-minimal-6.jpg",
      "/attached_assets/luxury-minimal-7.jpg",
      "/attached_assets/luxury-minimal-8.jpg",
      "/attached_assets/luxury-minimal-9.jpg",
      "/attached_assets/luxury-minimal-10.jpg",
      "/attached_assets/luxury-minimal-11.jpg",
      "/attached_assets/luxury-minimal-12.jpg"
    ]
  },
  {
    id: "editorial-magazine",
    name: "Editorial Magazine",
    description: "High-fashion editorial sophistication",
    images: [
      "/attached_assets/editorial-1.jpg",
      "/attached_assets/editorial-2.jpg",
      "/attached_assets/editorial-3.jpg",
      "/attached_assets/editorial-4.jpg",
      "/attached_assets/editorial-5.jpg",
      "/attached_assets/editorial-6.jpg",
      "/attached_assets/editorial-7.jpg",
      "/attached_assets/editorial-8.jpg",
      "/attached_assets/editorial-9.jpg",
      "/attached_assets/editorial-10.jpg",
      "/attached_assets/editorial-11.jpg",
      "/attached_assets/editorial-12.jpg"
    ]
  },
  {
    id: "european-luxury",
    name: "European Luxury",
    description: "Parisian elegance and designer sophistication",
    images: [
      "/attached_assets/european-1.jpg",
      "/attached_assets/european-2.jpg",
      "/attached_assets/european-3.jpg",
      "/attached_assets/european-4.jpg",
      "/attached_assets/european-5.jpg",
      "/attached_assets/european-6.jpg",
      "/attached_assets/european-7.jpg",
      "/attached_assets/european-8.jpg",
      "/attached_assets/european-9.jpg",
      "/attached_assets/european-10.jpg",
      "/attached_assets/european-11.jpg",
      "/attached_assets/european-12.jpg"
    ]
  },
  {
    id: "fitness-health",
    name: "Fitness & Health",
    description: "Wellness and active lifestyle inspiration",
    images: [
      "/attached_assets/fitness-1.jpg",
      "/attached_assets/fitness-2.jpg",
      "/attached_assets/fitness-3.jpg",
      "/attached_assets/fitness-4.jpg",
      "/attached_assets/fitness-5.jpg",
      "/attached_assets/fitness-6.jpg",
      "/attached_assets/fitness-7.jpg",
      "/attached_assets/fitness-8.jpg",
      "/attached_assets/fitness-9.jpg",
      "/attached_assets/fitness-10.jpg",
      "/attached_assets/fitness-11.jpg",
      "/attached_assets/fitness-12.jpg"
    ]
  },
  {
    id: "coastal-vibes",
    name: "Coastal Vibes",
    description: "Beach and ocean lifestyle inspiration",
    images: [
      "/attached_assets/coastal-1.jpg",
      "/attached_assets/coastal-2.jpg",
      "/attached_assets/coastal-3.jpg",
      "/attached_assets/coastal-4.jpg",
      "/attached_assets/coastal-5.jpg",
      "/attached_assets/coastal-6.jpg",
      "/attached_assets/coastal-7.jpg",
      "/attached_assets/coastal-8.jpg",
      "/attached_assets/coastal-9.jpg",
      "/attached_assets/coastal-10.jpg",
      "/attached_assets/coastal-11.jpg",
      "/attached_assets/coastal-12.jpg"
    ]
  },
  {
    id: "pink-girly",
    name: "Pink & Girly",
    description: "Soft feminine aesthetics and beauty",
    images: [
      "/attached_assets/pink-1.jpg",
      "/attached_assets/pink-2.jpg",
      "/attached_assets/pink-3.jpg",
      "/attached_assets/pink-4.jpg",
      "/attached_assets/pink-5.jpg",
      "/attached_assets/pink-6.jpg",
      "/attached_assets/pink-7.jpg",
      "/attached_assets/pink-8.jpg",
      "/attached_assets/pink-9.jpg",
      "/attached_assets/pink-10.jpg",
      "/attached_assets/pink-11.jpg",
      "/attached_assets/pink-12.jpg"
    ]
  },
  {
    id: "cream-aesthetic",
    name: "Cream Aesthetic",
    description: "Neutral tones and minimalist elegance",
    images: [
      "/attached_assets/cream-1.jpg",
      "/attached_assets/cream-2.jpg",
      "/attached_assets/cream-3.jpg",
      "/attached_assets/cream-4.jpg",
      "/attached_assets/cream-5.jpg",
      "/attached_assets/cream-6.jpg",
      "/attached_assets/cream-7.jpg",
      "/attached_assets/cream-8.jpg",
      "/attached_assets/cream-9.jpg",
      "/attached_assets/cream-10.jpg",
      "/attached_assets/cream-11.jpg",
      "/attached_assets/cream-12.jpg"
    ]
  }
];
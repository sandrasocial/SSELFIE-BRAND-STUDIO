import { Router } from 'express';
import { isAuthenticated } from '../replitAuth';

const router = Router();

// Import flatlay collections data
const flatlayCollections = [
  {
    id: 'luxury-minimal',
    name: 'Luxury Minimal',
    description: 'Clean lines, neutral tones, sophisticated layouts',
    aesthetic: 'Minimalist luxury with editorial sophistication',
    images: [
      '/flatlays/luxury-minimal/luxury-minimal-100.png',
      '/flatlays/luxury-minimal/luxury-minimal-101.png',
      '/flatlays/luxury-minimal/luxury-minimal-102.png',
      '/flatlays/luxury-minimal/luxury-minimal-103.png',
      '/flatlays/luxury-minimal/luxury-minimal-104.png',
      '/flatlays/luxury-minimal/luxury-minimal-105.png',
      '/flatlays/luxury-minimal/luxury-minimal-106.png',
      '/flatlays/luxury-minimal/luxury-minimal-107.png',
      '/flatlays/luxury-minimal/luxury-minimal-108.png',
      '/flatlays/luxury-minimal/luxury-minimal-109.png'
    ]
  },
  {
    id: 'editorial-magazine',
    name: 'Editorial Magazine',
    description: 'Magazine-style layouts with typography focus',
    aesthetic: 'Editorial magazine sophistication',
    images: [
      '/flatlays/editorial-magazine/editorial-magazine-100.png',
      '/flatlays/editorial-magazine/editorial-magazine-101.png',
      '/flatlays/editorial-magazine/editorial-magazine-102.png',
      '/flatlays/editorial-magazine/editorial-magazine-103.png',
      '/flatlays/editorial-magazine/editorial-magazine-104.png',
      '/flatlays/editorial-magazine/editorial-magazine-105.png'
    ]
  },
  {
    id: 'european-luxury',
    name: 'European Luxury',
    description: 'Sophisticated European lifestyle flatlays',
    aesthetic: 'European sophistication and luxury',
    images: [
      '/flatlays/european-luxury/european-luxury-100.png',
      '/flatlays/european-luxury/european-luxury-101.png',
      '/flatlays/european-luxury/european-luxury-102.png',
      '/flatlays/european-luxury/european-luxury-103.png',
      '/flatlays/european-luxury/european-luxury-104.png',
      '/flatlays/european-luxury/european-luxury-105.png'
    ]
  },
  {
    id: 'business-professional',
    name: 'Business Professional',
    description: 'Professional business flatlays with laptops, planners, office elements',
    aesthetic: 'Clean professional business aesthetic',
    images: [
      '/flatlays/business-professional/business-professional-200.png',
      '/flatlays/business-professional/business-professional-201.png',
      '/flatlays/business-professional/business-professional-202.png',
      '/flatlays/business-professional/business-professional-203.png',
      '/flatlays/business-professional/business-professional-204.png',
      '/flatlays/business-professional/business-professional-205.png'
    ]
  }
];

// Get all flatlay collections
router.get('/api/flatlay-collections', isAuthenticated, async (req, res) => {
  try {
    res.json({
      success: true,
      collections: flatlayCollections
    });
  } catch (error) {
    console.error('Error fetching flatlay collections:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch flatlay collections'
    });
  }
});

// Get all flatlay images as a simple array (for Victoria builder)
router.get('/api/flatlay-library', isAuthenticated, async (req, res) => {
  try {
    // Flatten all images from all collections into a single array
    const allImages: string[] = [];
    flatlayCollections.forEach(collection => {
      allImages.push(...collection.images);
    });

    res.json(allImages);
  } catch (error) {
    console.error('Error fetching flatlay library:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch flatlay library'
    });
  }
});

// Get specific collection
router.get('/api/flatlay-collections/:id', isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    const collection = flatlayCollections.find(c => c.id === id);
    
    if (!collection) {
      return res.status(404).json({
        success: false,
        error: 'Collection not found'
      });
    }

    res.json({
      success: true,
      collection
    });
  } catch (error) {
    console.error('Error fetching flatlay collection:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch flatlay collection'
    });
  }
});

export default router;
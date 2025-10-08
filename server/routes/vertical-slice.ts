/**
 * Vertical Slice API Endpoints
 * 
 * Simplified API endpoints to demonstrate the complete image generation workflow
 * without complex authentication or dependencies.
 */

import express from 'express';
import { z } from 'zod';

const router = express.Router();

// Mock concept cards for demonstration
const mockConceptCards = [
  {
    id: 'concept-1',
    title: 'Professional Headshot',
    description: 'A clean, professional portrait perfect for LinkedIn and business cards',
    fluxPrompt: 'professional headshot of a person, clean background, business attire, confident expression, high quality, studio lighting',
    generatedImages: [],
    isGenerating: false,
    hasGenerated: false
  },
  {
    id: 'concept-2',
    title: 'Creative Portrait',
    description: 'An artistic portrait with creative lighting and composition',
    fluxPrompt: 'creative portrait of a person, artistic lighting, interesting composition, professional quality, dramatic shadows',
    generatedImages: [],
    isGenerating: false,
    hasGenerated: false
  },
  {
    id: 'concept-3',
    title: 'Lifestyle Shot',
    description: 'A natural, lifestyle-focused image in a real environment',
    fluxPrompt: 'lifestyle portrait of a person, natural environment, casual but polished, authentic expression, natural lighting',
    generatedImages: [],
    isGenerating: false,
    hasGenerated: false
  }
];

// Mock generated images storage
const mockGeneratedImages: Array<{
  id: number;
  imageUrl: string;
  prompt: string;
  generatedPrompt: string;
  isSelected: boolean;
  isFavorite: boolean;
  userId: string;
  createdAt: Date;
}> = [];

let imageIdCounter = 1;

// Schema for validation
const ChatRequestSchema = z.object({
  message: z.string(),
  conversationId: z.string().optional(),
  userId: z.string()
});

const GenerateRequestSchema = z.object({
  conceptCard: z.object({
    id: z.string(),
    title: z.string(),
    fluxPrompt: z.string().optional()
  }),
  userId: z.string(),
  userModelId: z.string().optional()
});

// Maya Chat Endpoint - Simulated Conversation
router.post('/maya/chat', async (req, res) => {
  try {
    const { message, conversationId, userId } = ChatRequestSchema.parse(req.body);
    
    // Simulate Maya AI response based on message content
    let response = '';
    if (message.toLowerCase().includes('professional') || message.toLowerCase().includes('business')) {
      response = "I can help you create professional images! I've generated some concept cards focusing on business and professional portraits. These would be perfect for LinkedIn, business cards, or company websites.";
    } else if (message.toLowerCase().includes('creative') || message.toLowerCase().includes('artistic')) {
      response = "Great! Let's create some artistic images. I've prepared concept cards with creative and artistic approaches that will really make your images stand out.";
    } else if (message.toLowerCase().includes('lifestyle') || message.toLowerCase().includes('casual')) {
      response = "Perfect! Lifestyle images are so authentic and engaging. I've created concept cards for natural, lifestyle-focused shots that capture your personality.";
    } else {
      response = "Hi! I'm Maya, your AI brand strategist. I can help you create amazing images for your personal brand. Tell me what kind of images you need - professional headshots, creative portraits, or lifestyle shots?";
    }

    const newConversationId = conversationId || `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    res.json({
      response,
      conceptCards: mockConceptCards,
      conversationId: newConversationId,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Maya chat error:', error);
    res.status(400).json({ 
      error: 'Invalid request',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Image Generation Endpoint - Simulated FLUX Generation
router.post('/maya/generate', async (req, res) => {
  try {
    const { conceptCard, userId } = GenerateRequestSchema.parse(req.body);
    
    // Simulate image generation delay
    setTimeout(() => {
      // Create mock generated image
      const generatedImage = {
        id: imageIdCounter++,
        imageUrl: `https://picsum.photos/400/400?random=${Date.now()}`, // Mock image URL
        prompt: conceptCard.title,
        generatedPrompt: conceptCard.fluxPrompt || `Generated prompt for ${conceptCard.title}`,
        isSelected: false,
        isFavorite: false,
        userId,
        createdAt: new Date()
      };

      mockGeneratedImages.push(generatedImage);
      console.log(`Generated image for concept: ${conceptCard.title}`);
    }, 2000); // 2 second delay to simulate generation

    res.json({
      success: true,
      message: 'Image generation started',
      generationId: `gen_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      estimatedTime: 30 // seconds
    });

  } catch (error) {
    console.error('Image generation error:', error);
    res.status(400).json({ 
      error: 'Generation failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get Generated Images Endpoint
router.get('/user/ai-images', async (req, res) => {
  try {
    const { userId } = req.query;
    
    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    // Filter images by userId and return most recent first
    const userImages = mockGeneratedImages
      .filter(img => img.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    res.json(userImages);

  } catch (error) {
    console.error('Get images error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch images',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Health Check for Vertical Slice
router.get('/vertical-slice/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    endpoints: [
      'POST /api/maya/chat',
      'POST /api/maya/generate', 
      'GET /api/user/ai-images'
    ],
    mockData: {
      conceptCards: mockConceptCards.length,
      generatedImages: mockGeneratedImages.length
    }
  });
});

export default router;
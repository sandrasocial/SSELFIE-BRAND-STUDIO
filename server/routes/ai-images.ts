import type { Express } from "express";
import { isAuthenticated } from "../replitAuth";
import { storage } from "../storage";
import { insertAiImageSchema } from "@shared/schema";
import { z } from "zod";
import multer from "multer";

// Configure multer for file uploads
const upload = multer({
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
});

// Mock AI image generation (replace with actual FLUX API call)
async function generateAiImage(prompt: string, userId: string, selfieUrls: string[]): Promise<string> {
  // Simulate processing time
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // In production, this would call your FLUX model API
  // For now, return a placeholder from Sandra's approved images
  const mockResults = [
    "https://i.postimg.cc/rwTG02cZ/out-1-23.png",
    "https://i.postimg.cc/bNF14sGc/out-1-4.png",
    "https://i.postimg.cc/nrKdm7Vj/out-2-4.webp",
    "https://i.postimg.cc/HkNwfjh8/out-2-14.jpg",
    "https://i.postimg.cc/4NG0n2wN/out-1-12.png",
  ];
  
  return mockResults[Math.floor(Math.random() * mockResults.length)];
}

// Mock selfie upload (replace with actual cloud storage)
async function uploadSelfie(file: Express.Multer.File): Promise<string> {
  // In production, upload to cloud storage (AWS S3, Cloudinary, etc.)
  // For now, return a placeholder URL
  return `https://placeholder-storage.com/selfies/${Date.now()}-${file.originalname}`;
}

export function registerAiImageRoutes(app: Express) {
  // Get user's AI images
  app.get('/api/ai-images', isAuthenticated, async (req: any, res) => {
    try {
      const userId = (req.user as any)?.claims?.sub;
      const images = await storage.getUserAiImages(userId);
      res.json(images);
    } catch (error) {
      console.error('Error fetching AI images:', error);
      res.status(500).json({ message: 'Failed to fetch AI images' });
    }
  });

  // Upload selfies
  app.post('/api/ai-images/upload', isAuthenticated, upload.array('selfies', 15), async (req: any, res) => {
    try {
      const userId = (req.user as any)?.claims?.sub;
      const files = req.files as Express.Multer.File[];
      
      if (!files || files.length === 0) {
        return res.status(400).json({ message: 'No files uploaded' });
      }

      if (files.length < 5) {
        return res.status(400).json({ message: 'Please upload at least 5 selfies for best results' });
      }

      // Upload each selfie
      const selfieUrls = await Promise.all(
        files.map(file => uploadSelfie(file))
      );

      // Create selfie upload records
      const selfieUploads = await Promise.all(
        selfieUrls.map(url => 
          storage.createSelfieUpload({
            userId,
            imageUrl: url,
            status: 'uploaded',
          })
        )
      );

      // Start AI generation process
      const prompts = [
        'Professional headshot in business attire',
        'Editorial portrait with dramatic lighting',
        'Creative lifestyle shot with modern background',
        'Confident business portrait',
        'Editorial fashion-style portrait',
      ];

      // Generate AI images
      const aiImagePromises = prompts.map(async (prompt) => {
        const aiImageUrl = await generateAiImage(prompt, userId, selfieUrls);
        return storage.createAiImage({
          userId,
          prompt,
          imageUrl: aiImageUrl,
          status: 'completed',
        });
      });

      const aiImages = await Promise.all(aiImagePromises);

      res.json({
        message: 'Selfies uploaded and AI generation started',
        selfieUploads,
        aiImages,
      });
    } catch (error) {
      console.error('Error uploading selfies:', error);
      res.status(500).json({ message: 'Failed to upload selfies' });
    }
  });

  // Generate single AI image
  app.post('/api/ai-images/generate', isAuthenticated, async (req: any, res) => {
    try {
      const userId = (req.user as any)?.claims?.sub;
      const { prompt } = req.body;

      if (!prompt) {
        return res.status(400).json({ message: 'Prompt is required' });
      }

      // Check if user has uploaded selfies
      const selfieUploads = await storage.getUserSelfieUploads(userId);
      if (selfieUploads.length === 0) {
        return res.status(400).json({ message: 'Please upload selfies first' });
      }

      const selfieUrls = selfieUploads.map(upload => upload.imageUrl);

      // Create pending AI image record
      const aiImage = await storage.createAiImage({
        userId,
        prompt,
        imageUrl: '',
        status: 'processing',
      });

      // Generate AI image asynchronously
      setTimeout(async () => {
        try {
          const aiImageUrl = await generateAiImage(prompt, userId, selfieUrls);
          await storage.updateAiImage(aiImage.id, {
            imageUrl: aiImageUrl,
            status: 'completed',
          });
        } catch (error) {
          console.error('Error generating AI image:', error);
          await storage.updateAiImage(aiImage.id, {
            status: 'failed',
          });
        }
      }, 100);

      res.json(aiImage);
    } catch (error) {
      console.error('Error generating AI image:', error);
      res.status(500).json({ message: 'Failed to generate AI image' });
    }
  });

  // Delete AI image
  app.delete('/api/ai-images/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = (req.user as any)?.claims?.sub;
      const imageId = parseInt(req.params.id);

      // Verify ownership
      const image = await storage.getAiImage(imageId);
      if (!image || image.userId !== userId) {
        return res.status(404).json({ message: 'Image not found' });
      }

      await storage.deleteAiImage(imageId);
      res.json({ message: 'Image deleted successfully' });
    } catch (error) {
      console.error('Error deleting AI image:', error);
      res.status(500).json({ message: 'Failed to delete image' });
    }
  });
}
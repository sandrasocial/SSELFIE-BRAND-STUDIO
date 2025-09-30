import { VercelRequest, VercelResponse } from '@vercel/node';
import { z } from 'zod';
import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import { mayaImages, insertMayaImagesSchema } from '../../../shared/schema-maya.js';
import { eq, and, desc, asc } from 'drizzle-orm';

// Initialize database connection
const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);

// Simple user verification function (placeholder for stack auth)
async function getUserFromRequest(req: VercelRequest): Promise<{ id: string } | null> {
  // TODO: Implement proper Stack Auth verification
  // For now, return a mock user to prevent compilation errors
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  
  // This is a placeholder - in production, you'd verify the JWT token
  return { id: 'mock-user-id' };
}

// Request validation schemas
const createImageSchema = z.object({
  userId: z.string(),
  url: z.string().url(),
  thumbnailUrl: z.string().url().optional(),
  category: z.string().optional(),
  subcategory: z.string().optional(),
  metadata: z.record(z.any()).optional(),
  isFavorite: z.boolean().optional(),
  isArchived: z.boolean().optional(),
  rating: z.number().min(1).max(5).optional(),
});

const updateImageSchema = z.object({
  category: z.string().optional(),
  subcategory: z.string().optional(),
  isFavorite: z.boolean().optional(),
  isArchived: z.boolean().optional(),
  rating: z.number().min(1).max(5).optional(),
  metadata: z.record(z.any()).optional(),
  viewCount: z.number().optional(),
});

const imageQuerySchema = z.object({
  category: z.string().optional(),
  isFavorite: z.boolean().optional(),
  isArchived: z.boolean().optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  sortBy: z.enum(['created', 'rating', 'views']).default('created'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    // Authentication
    const user = await getUserFromRequest(req);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const userId = user.id;

    switch (req.method) {
      case 'GET':
        return await handleGetImages(req, res, userId);
      case 'POST':
        return await handleCreateImage(req, res, userId);
      case 'PUT':
        return await handleUpdateImage(req, res, userId);
      case 'DELETE':
        return await handleDeleteImage(req, res, userId);
      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Maya images API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function handleGetImages(req: VercelRequest, res: VercelResponse, userId: string) {
  try {
    const queryParams = imageQuerySchema.parse(req.query);
    const { category, isFavorite, isArchived, page, limit, sortBy, sortOrder } = queryParams;
    
    // Build where conditions
    const conditions = [eq(mayaImages.userId, userId)];
    
    if (category) {
      conditions.push(eq(mayaImages.category, category));
    }
    
    if (isFavorite !== undefined) {
      conditions.push(eq(mayaImages.isFavorite, isFavorite));
    }
    
    if (isArchived !== undefined) {
      conditions.push(eq(mayaImages.isArchived, isArchived));
    }
    
    // Apply sorting
    const sortColumn = sortBy === 'created' ? mayaImages.createdAt :
                      sortBy === 'rating' ? mayaImages.rating :
                      mayaImages.viewCount;
    
    // Apply pagination
    const offset = (page - 1) * limit;
    
    const images = await db.select()
      .from(mayaImages)
      .where(and(...conditions))
      .orderBy(sortOrder === 'desc' ? desc(sortColumn) : asc(sortColumn))
      .limit(limit)
      .offset(offset);
    
    // Get total count for pagination
    const totalCountResult = await db.select({ count: mayaImages.id })
      .from(mayaImages)
      .where(and(...conditions));
    
    return res.status(200).json({
      success: true,
      data: images,
      pagination: {
        page,
        limit,
        total: totalCountResult.length,
        totalPages: Math.ceil(totalCountResult.length / limit)
      }
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: 'Invalid query parameters',
        details: error.errors 
      });
    }
    console.error('Error fetching images:', error);
    return res.status(500).json({ error: 'Failed to fetch images' });
  }
}

async function handleCreateImage(req: VercelRequest, res: VercelResponse, userId: string) {
  try {
    const validatedData = createImageSchema.parse({
      ...req.body,
      userId
    });
    
    // Type assertion to ensure required fields are present
    const insertData = validatedData as typeof validatedData & { userId: string; url: string };
    
    const [newImage] = await db.insert(mayaImages).values(insertData).returning();
    
    return res.status(201).json({
      success: true,
      data: newImage,
      message: 'Image created successfully'
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: 'Validation error',
        details: error.errors 
      });
    }
    console.error('Error creating image:', error);
    return res.status(500).json({ error: 'Failed to create image' });
  }
}

async function handleUpdateImage(req: VercelRequest, res: VercelResponse, userId: string) {
  try {
    const { imageId } = req.query;
    if (!imageId) {
      return res.status(400).json({ error: 'Image ID required' });
    }
    
    const validatedData = updateImageSchema.parse(req.body);
    
    // Increment view count if not provided
    if (!('viewCount' in validatedData)) {
      const currentImage = await db.select({ viewCount: mayaImages.viewCount })
        .from(mayaImages)
        .where(and(
          eq(mayaImages.id, parseInt(imageId as string)),
          eq(mayaImages.userId, userId)
        ))
        .limit(1);
      
      if (currentImage.length > 0) {
        validatedData.viewCount = (currentImage[0].viewCount || 0) + 1;
      }
    }
    
    const [updatedImage] = await db
      .update(mayaImages)
      .set({
        ...validatedData,
        updatedAt: new Date()
      })
      .where(and(
        eq(mayaImages.id, parseInt(imageId as string)),
        eq(mayaImages.userId, userId)
      ))
      .returning();
    
    if (!updatedImage) {
      return res.status(404).json({ error: 'Image not found' });
    }
    
    return res.status(200).json({
      success: true,
      data: updatedImage
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: 'Validation error',
        details: error.errors 
      });
    }
    console.error('Error updating image:', error);
    return res.status(500).json({ error: 'Failed to update image' });
  }
}

async function handleDeleteImage(req: VercelRequest, res: VercelResponse, userId: string) {
  try {
    const { imageId } = req.query;
    if (!imageId) {
      return res.status(400).json({ error: 'Image ID required' });
    }
    
    const [deletedImage] = await db
      .delete(mayaImages)
      .where(and(
        eq(mayaImages.id, parseInt(imageId as string)),
        eq(mayaImages.userId, userId)
      ))
      .returning();
    
    if (!deletedImage) {
      return res.status(404).json({ error: 'Image not found' });
    }
    
    // TODO: Clean up actual image files from S3 or storage
    // await deleteImageFromStorage(deletedImage.url);
    
    return res.status(200).json({
      success: true,
      message: 'Image deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting image:', error);
    return res.status(500).json({ error: 'Failed to delete image' });
  }
}
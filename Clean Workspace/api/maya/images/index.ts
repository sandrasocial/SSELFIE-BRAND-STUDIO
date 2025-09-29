import { VercelRequest, VercelResponse } from '@vercel/node';
import { StackAuth } from '@stackframe/stack';
import { z } from 'zod';
import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import { mayaImages } from '../../../shared/schema.js';
import { createInsertSchema } from 'drizzle-zod';
import { PgSelect, and, asc, desc, eq, gt, lt } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/postgres-js';

const insertMayaImagesSchema = createInsertSchema(mayaImages);
import { eq, and, desc, asc } from 'drizzle-orm';

// Initialize database connection
const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);

// Initialize Stack Auth
const stackAuth = new StackAuth({
  projectId: process.env.NEXT_PUBLIC_STACK_PROJECT_ID!,
  publishableClientKey: process.env.NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY!,
  secretServerKey: process.env.STACK_SECRET_SERVER_KEY!,
});

// Request validation schemas
const createImageSchema = insertMayaImagesSchema;

const updateImageSchema = z.object({
  category: z.string().optional(),
  subcategory: z.string().optional(),
  isFavorite: z.boolean().optional(),
  isArchived: z.boolean().optional(),
  rating: z.number().min(1).max(5).optional(),
  metadata: z.record(z.any()).optional(),
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
    const user = await stackAuth.getUser({ request: req });
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
    
    let query = db.select().from(mayaImages).where(eq(mayaImages.userId, userId));
    
    // Apply filters
    if (category) {
      query = query.where(and(
        eq(mayaImages.userId, userId),
        eq(mayaImages.category, category)
      ));
    }
    
    if (isFavorite !== undefined) {
      query = query.where(and(
        eq(mayaImages.userId, userId),
        eq(mayaImages.isFavorite, isFavorite)
      ));
    }
    
    if (isArchived !== undefined) {
      query = query.where(and(
        eq(mayaImages.userId, userId),
        eq(mayaImages.isArchived, isArchived)
      ));
    }
    
    // Apply sorting
    const sortColumn = sortBy === 'created' ? mayaImages.createdAt :
                      sortBy === 'rating' ? mayaImages.rating :
                      mayaImages.viewCount;
    
    query = query.orderBy(sortOrder === 'desc' ? desc(sortColumn) : asc(sortColumn));
    
    // Apply pagination
    const offset = (page - 1) * limit;
    query = query.limit(limit).offset(offset);
    
    const images = await query;
    
    // Get total count for pagination
    const totalCount = await db.select({ count: mayaImages.id })
      .from(mayaImages)
      .where(eq(mayaImages.userId, userId));
    
    return res.status(200).json({
      success: true,
      data: images,
      pagination: {
        page,
        limit,
        total: totalCount.length,
        totalPages: Math.ceil(totalCount.length / limit)
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
    
    const [newImage] = await db.insert(mayaImages).values(validatedData).returning();
    
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
        const currentViewCount = currentImage[0]?.viewCount || 0;
        const updatedData = { ...validatedData, viewCount: currentViewCount + 1 };
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
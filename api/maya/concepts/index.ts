import { VercelRequest, VercelResponse } from '@vercel/node';
import { StackAuth } from '@stackframe/stack';
import { z } from 'zod';
import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import { mayaConcepts, insertMayaConceptsSchema, conceptMetadataSchema } from '../../../shared/schema-maya';
import { eq, and, desc, asc, like } from 'drizzle-orm';

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
const createConceptSchema = insertMayaConceptsSchema.extend({
  metadata: conceptMetadataSchema.optional(),
});

const updateConceptSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  prompt: z.string().optional(),
  type: z.enum(['portrait', 'flatlay', 'lifestyle', 'brand']).optional(),
  metadata: conceptMetadataSchema.optional(),
  status: z.enum(['active', 'archived', 'draft']).optional(),
  tags: z.array(z.string()).optional(),
  isTemplate: z.boolean().optional(),
});

const conceptQuerySchema = z.object({
  type: z.string().optional(),
  status: z.string().optional(),
  isTemplate: z.boolean().optional(),
  search: z.string().optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(50).default(20),
  sortBy: z.enum(['created', 'usage', 'rating']).default('created'),
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
        return await handleGetConcepts(req, res, userId);
      case 'POST':
        return await handleCreateConcept(req, res, userId);
      case 'PUT':
        return await handleUpdateConcept(req, res, userId);
      case 'DELETE':
        return await handleDeleteConcept(req, res, userId);
      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Maya concepts API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function handleGetConcepts(req: VercelRequest, res: VercelResponse, userId: string) {
  try {
    const queryParams = conceptQuerySchema.parse(req.query);
    const { type, status, isTemplate, search, page, limit, sortBy, sortOrder } = queryParams;
    
    let query = db.select().from(mayaConcepts).where(eq(mayaConcepts.userId, userId));
    
    // Apply filters
    if (type) {
      query = query.where(and(
        eq(mayaConcepts.userId, userId),
        eq(mayaConcepts.type, type)
      ));
    }
    
    if (status) {
      query = query.where(and(
        eq(mayaConcepts.userId, userId),
        eq(mayaConcepts.status, status)
      ));
    }
    
    if (isTemplate !== undefined) {
      query = query.where(and(
        eq(mayaConcepts.userId, userId),
        eq(mayaConcepts.isTemplate, isTemplate)
      ));
    }
    
    if (search) {
      query = query.where(and(
        eq(mayaConcepts.userId, userId),
        like(mayaConcepts.title, `%${search}%`)
      ));
    }
    
    // Apply sorting
    const sortColumn = sortBy === 'created' ? mayaConcepts.createdAt :
                      sortBy === 'usage' ? mayaConcepts.usageCount :
                      mayaConcepts.avgRating;
    
    query = query.orderBy(sortOrder === 'desc' ? desc(sortColumn) : asc(sortColumn));
    
    // Apply pagination
    const offset = (page - 1) * limit;
    query = query.limit(limit).offset(offset);
    
    const concepts = await query;
    
    // Get total count for pagination
    const totalCount = await db.select({ count: mayaConcepts.id })
      .from(mayaConcepts)
      .where(eq(mayaConcepts.userId, userId));
    
    return res.status(200).json({
      success: true,
      data: concepts,
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
    console.error('Error fetching concepts:', error);
    return res.status(500).json({ error: 'Failed to fetch concepts' });
  }
}

async function handleCreateConcept(req: VercelRequest, res: VercelResponse, userId: string) {
  try {
    const validatedData = createConceptSchema.parse({
      ...req.body,
      userId
    });
    
    const [newConcept] = await db.insert(mayaConcepts).values(validatedData).returning();
    
    return res.status(201).json({
      success: true,
      data: newConcept,
      message: 'Concept created successfully'
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: 'Validation error',
        details: error.errors 
      });
    }
    console.error('Error creating concept:', error);
    return res.status(500).json({ error: 'Failed to create concept' });
  }
}

async function handleUpdateConcept(req: VercelRequest, res: VercelResponse, userId: string) {
  try {
    const { conceptId } = req.query;
    if (!conceptId) {
      return res.status(400).json({ error: 'Concept ID required' });
    }
    
    const validatedData = updateConceptSchema.parse(req.body);
    
    const [updatedConcept] = await db
      .update(mayaConcepts)
      .set({
        ...validatedData,
        updatedAt: new Date()
      })
      .where(and(
        eq(mayaConcepts.id, parseInt(conceptId as string)),
        eq(mayaConcepts.userId, userId)
      ))
      .returning();
    
    if (!updatedConcept) {
      return res.status(404).json({ error: 'Concept not found' });
    }
    
    return res.status(200).json({
      success: true,
      data: updatedConcept
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: 'Validation error',
        details: error.errors 
      });
    }
    console.error('Error updating concept:', error);
    return res.status(500).json({ error: 'Failed to update concept' });
  }
}

async function handleDeleteConcept(req: VercelRequest, res: VercelResponse, userId: string) {
  try {
    const { conceptId } = req.query;
    if (!conceptId) {
      return res.status(400).json({ error: 'Concept ID required' });
    }
    
    const [deletedConcept] = await db
      .delete(mayaConcepts)
      .where(and(
        eq(mayaConcepts.id, parseInt(conceptId as string)),
        eq(mayaConcepts.userId, userId)
      ))
      .returning();
    
    if (!deletedConcept) {
      return res.status(404).json({ error: 'Concept not found' });
    }
    
    return res.status(200).json({
      success: true,
      message: 'Concept deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting concept:', error);
    return res.status(500).json({ error: 'Failed to delete concept' });
  }
}
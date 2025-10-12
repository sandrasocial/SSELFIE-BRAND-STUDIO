import { VercelRequest, VercelResponse } from '@vercel/node';
import { z } from 'zod';
import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import { mayaModels, insertMayaModelsSchema } from '../../../shared/schema';
import { eq, and } from 'drizzle-orm';

// Initialize database connection
const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);

// Request validation schemas - simplified to work with userModels
const updateModelSchema = z.object({
  trainingStatus: z.enum(['pending', 'training', 'completed', 'failed']).optional(),
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    // CRITICAL: Stack Auth validation - NO hardcoded users, NO demo data
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'Unauthorized - Authentication required' });
    }

    // Extract and verify JWT token
    const token = authHeader.replace('Bearer ', '');
    let userId: string;
    
    try {
      const { jwtVerify } = await import('jose');
      const secret = new TextEncoder().encode(process.env.STACK_SECRET_SERVER_KEY);
      const { payload } = await jwtVerify(token, secret);
      userId = payload.sub as string;
      
      if (!userId) {
        return res.status(401).json({ error: 'Invalid authentication token' });
      }
    } catch (error) {
      console.error('JWT verification failed:', error);
      return res.status(401).json({ error: 'Authentication failed' });
    }

    switch (req.method) {
      case 'GET':
        return await handleGetModels(req, res, userId);
      case 'PUT':
        return await handleUpdateModel(req, res, userId);
      case 'DELETE':
        return await handleDeleteModel(req, res, userId);
      default:
        res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Maya models API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function handleGetModels(req: VercelRequest, res: VercelResponse, userId: string) {
  try {
    const { status } = req.query;
    
    // Build where conditions for userModels
    const whereConditions = [eq(mayaModels.userId, userId)];
    
    if (status) {
      whereConditions.push(eq(mayaModels.trainingStatus, status as string));
    }
    
    const models = await db.select().from(mayaModels).where(and(...whereConditions));
    
    // Transform userModels to Maya-compatible format
    const mayaCompatibleModels = models.map(model => ({
      id: model.id,
      userId: model.userId,
      modelType: 'lora', // All user models are LoRA models
      trainingStatus: model.trainingStatus || 'unknown',
      replicateVersionId: model.replicateVersionId,
      createdAt: model.createdAt,
      updatedAt: model.updatedAt,
      metadata: {
        replicateModelId: model.replicateModelId,
        replicateVersionId: model.replicateVersionId,
        generationCount: 0 // Could be calculated if needed
      }
    }));
    
    return res.status(200).json({
      success: true,
      data: mayaCompatibleModels,
      count: mayaCompatibleModels.length
    });
  } catch (error) {
    console.error('Error fetching models:', error);
    return res.status(500).json({ error: 'Failed to fetch models' });
  }
}

async function handleUpdateModel(req: VercelRequest, res: VercelResponse, userId: string) {
  try {
    const { modelId } = req.query;
    if (!modelId) {
      return res.status(400).json({ error: 'Model ID required' });
    }
    
    const validatedData = updateModelSchema.parse(req.body);
    
    const updateData: any = {
      updatedAt: new Date()
    };
    
    if (validatedData.trainingStatus) {
      updateData.trainingStatus = validatedData.trainingStatus;
    }

    const [updatedModel] = await db
      .update(mayaModels)
      .set(updateData)
      .where(and(
        eq(mayaModels.id, parseInt(modelId as string)),
        eq(mayaModels.userId, userId)
      ))
      .returning();
    
    if (!updatedModel) {
      return res.status(404).json({ error: 'Model not found' });
    }
    
    return res.status(200).json({
      success: true,
      data: {
        id: updatedModel.id,
        userId: updatedModel.userId,
        modelType: 'lora',
        trainingStatus: updatedModel.trainingStatus,
        replicateVersionId: updatedModel.replicateVersionId,
        createdAt: updatedModel.createdAt,
        updatedAt: updatedModel.updatedAt
      }
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: 'Validation error',
        details: error.errors 
      });
    }
    console.error('Error updating model:', error);
    return res.status(500).json({ error: 'Failed to update model' });
  }
}

async function handleDeleteModel(req: VercelRequest, res: VercelResponse, userId: string) {
  try {
    const { modelId } = req.query;
    if (!modelId) {
      return res.status(400).json({ error: 'Model ID required' });
    }
    
    const [deletedModel] = await db
      .delete(mayaModels)
      .where(and(
        eq(mayaModels.id, parseInt(modelId as string)),
        eq(mayaModels.userId, userId)
      ))
      .returning();
    
    if (!deletedModel) {
      return res.status(404).json({ error: 'Model not found' });
    }
    
    return res.status(200).json({
      success: true,
      message: 'Model deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting model:', error);
    return res.status(500).json({ error: 'Failed to delete model' });
  }
}
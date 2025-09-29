import { StackAuth } from '../../../types/stackframe.js';
import { z } from 'zod';
import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import { mayaModels, insertMayaModelsSchema } from '../../../shared/schema-maya.js';
import { eq, and } from 'drizzle-orm';
const sql = neon(process.env.DATABASE_URL);
const db = drizzle(sql);
const stackAuth = new StackAuth({
    projectId: process.env.NEXT_PUBLIC_STACK_PROJECT_ID,
    publishableClientKey: process.env.NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY,
    secretServerKey: process.env.STACK_SECRET_SERVER_KEY,
});
const createModelSchema = insertMayaModelsSchema.extend({
    trainingImages: z.array(z.string()).min(5, 'At least 5 training images required'),
});
const updateModelSchema = z.object({
    trainingStatus: z.enum(['pending', 'training', 'completed', 'failed']).optional(),
    trainingProgress: z.number().min(0).max(100).optional(),
    qualityScore: z.number().min(1).max(100).optional(),
    metadata: z.record(z.any()).optional(),
});
export default async function handler(req, res) {
    try {
        const user = await stackAuth.getUser({ request: req });
        if (!user) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        const userId = user.id;
        if (!userId) {
            return res.status(400).json({ error: 'Invalid user ID' });
        }
        switch (req.method) {
            case 'GET':
                return await handleGetModels(req, res, userId);
            case 'POST':
                return await handleCreateModel(req, res, userId);
            case 'PUT':
                return await handleUpdateModel(req, res, userId);
            case 'DELETE':
                return await handleDeleteModel(req, res, userId);
            default:
                res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
                return res.status(405).json({ error: 'Method not allowed' });
        }
    }
    catch (error) {
        console.error('Maya models API error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
async function handleGetModels(req, res, userId) {
    try {
        const { modelType, status } = req.query;
        let conditions = [eq(mayaModels.userId, userId)];
        if (modelType) {
            conditions.push(eq(mayaModels.modelType, modelType));
        }
        if (status) {
            conditions.push(eq(mayaModels.trainingStatus, status));
        }
        const query = db.select().from(mayaModels).where(and(...conditions));
        const models = await query;
        return res.status(200).json({
            success: true,
            data: models,
            count: models.length
        });
    }
    catch (error) {
        console.error('Error fetching models:', error);
        return res.status(500).json({ error: 'Failed to fetch models' });
    }
}
async function handleCreateModel(req, res, userId) {
    try {
        const validatedData = {
            ...req.body,
            userId
        };
        const modelData = {
            userId,
            modelType: validatedData.modelType,
            trainingStatus: 'pending',
            trainingProgress: 0,
            metadata: {
                trainingImages: validatedData.trainingImages,
                modelParameters: validatedData.metadata?.modelParameters || {},
                trainingLogs: [],
            }
        };
        const [newModel] = await db.insert(mayaModels).values(modelData).returning();
        return res.status(201).json({
            success: true,
            data: newModel,
            message: 'Model training started'
        });
    }
    catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({
                error: 'Validation error',
                details: error.errors
            });
        }
        console.error('Error creating model:', error);
        return res.status(500).json({ error: 'Failed to create model' });
    }
}
async function handleUpdateModel(req, res, userId) {
    try {
        const { modelId } = req.query;
        if (!modelId) {
            return res.status(400).json({ error: 'Model ID required' });
        }
        const validatedData = updateModelSchema.parse(req.body);
        const [updatedModel] = await db
            .update(mayaModels)
            .set({
            ...validatedData,
            updatedAt: new Date()
        })
            .where(and(eq(mayaModels.id, parseInt(modelId)), eq(mayaModels.userId, userId)))
            .returning();
        if (!updatedModel) {
            return res.status(404).json({ error: 'Model not found' });
        }
        return res.status(200).json({
            success: true,
            data: updatedModel
        });
    }
    catch (error) {
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
async function handleDeleteModel(req, res, userId) {
    try {
        const { modelId } = req.query;
        if (!modelId) {
            return res.status(400).json({ error: 'Model ID required' });
        }
        const [deletedModel] = await db
            .delete(mayaModels)
            .where(and(eq(mayaModels.id, parseInt(modelId)), eq(mayaModels.userId, userId)))
            .returning();
        if (!deletedModel) {
            return res.status(404).json({ error: 'Model not found' });
        }
        return res.status(200).json({
            success: true,
            message: 'Model deleted successfully'
        });
    }
    catch (error) {
        console.error('Error deleting model:', error);
        return res.status(500).json({ error: 'Failed to delete model' });
    }
}
//# sourceMappingURL=index.js.map
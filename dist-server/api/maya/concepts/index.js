import { StackAuth } from '../../../types/stackframe.js';
import { z } from 'zod';
import { eq, and, desc, asc, like } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import { mayaConcepts } from '../../../shared/schema-maya.js';
const sql = neon(process.env.DATABASE_URL);
const db = drizzle(sql);
const stackAuth = new StackAuth({
    projectId: process.env.NEXT_PUBLIC_STACK_PROJECT_ID,
    publishableClientKey: process.env.NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY,
    secretServerKey: process.env.STACK_SECRET_SERVER_KEY,
});
const conceptMetadataSchema = z.object({
    styleElements: z.array(z.string()).optional(),
    colorScheme: z.array(z.string()).optional(),
    mood: z.string().optional(),
    settings: z.array(z.string()).optional(),
    props: z.array(z.string()).optional(),
    lighting: z.string().optional(),
    composition: z.string().optional(),
    inspirationSources: z.array(z.string()).optional()
}).partial();
const baseConceptSchema = {
    userId: z.string(),
    title: z.string().min(1),
    description: z.string().optional(),
    prompt: z.string().optional(),
    type: z.enum(['portrait', 'flatlay', 'lifestyle', 'brand']).optional(),
    metadata: conceptMetadataSchema.optional(),
    status: z.enum(['active', 'archived', 'draft']).optional(),
    tags: z.array(z.string()).optional(),
    isTemplate: z.boolean().optional(),
};
const createConceptSchema = z.object({
    ...baseConceptSchema,
    title: z.string().min(1),
    userId: z.string(),
    status: z.enum(['active', 'archived', 'draft']).default('draft'),
    tags: z.array(z.string()).default([]),
    isTemplate: z.boolean().default(false),
}).strict();
const updateConceptSchema = z.object({
    ...baseConceptSchema,
    userId: z.string().optional()
}).partial().strict();
const conceptQuerySchema = z.object({
    type: z.enum(['portrait', 'flatlay', 'lifestyle', 'brand']).optional(),
    status: z.enum(['active', 'archived', 'draft']).optional(),
    isTemplate: z.coerce.boolean().optional(),
    search: z.string().optional(),
    page: z.coerce.number().min(1).default(1),
    limit: z.coerce.number().min(1).max(50).default(20),
    sortBy: z.enum(['created', 'usage', 'rating']).default('created'),
    sortOrder: z.enum(['asc', 'desc']).default('desc'),
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
    }
    catch (error) {
        console.error('Maya concepts API error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
async function handleGetConcepts(req, res, userId) {
    try {
        const queryParams = conceptQuerySchema.parse(req.query);
        const { type, status, isTemplate, search, page, limit, sortBy, sortOrder } = queryParams;
        let conditions = [eq(mayaConcepts.userId, userId)];
        if (type) {
            conditions.push(eq(mayaConcepts.type, type));
        }
        if (status) {
            conditions.push(eq(mayaConcepts.status, status));
        }
        if (isTemplate !== undefined) {
            conditions.push(eq(mayaConcepts.isTemplate, isTemplate));
        }
        if (search) {
            conditions.push(like(mayaConcepts.title, `%${search}%`));
        }
        const query = db.select().from(mayaConcepts).where(and(...conditions));
        const sortColumn = sortBy === 'created' ? mayaConcepts.createdAt :
            sortBy === 'usage' ? mayaConcepts.usageCount :
                sortBy === 'rating' ? mayaConcepts.avgRating :
                    mayaConcepts.createdAt;
        const offset = (page - 1) * limit;
        const concepts = await query
            .orderBy(sortOrder === 'desc' ? desc(sortColumn) : asc(sortColumn))
            .limit(limit)
            .offset(offset);
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
    }
    catch (error) {
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
async function handleCreateConcept(req, res, userId) {
    try {
        const validatedData = createConceptSchema.parse({
            ...req.body,
            userId
        });
        const insertData = {
            ...validatedData,
            title: validatedData.title,
            userId: validatedData.userId,
            status: validatedData.status || 'draft',
            tags: validatedData.tags || [],
            isTemplate: validatedData.isTemplate || false,
        };
        const [newConcept] = await db.insert(mayaConcepts)
            .values(insertData)
            .returning();
        return res.status(201).json({
            success: true,
            data: newConcept,
            message: 'Concept created successfully'
        });
    }
    catch (error) {
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
async function handleUpdateConcept(req, res, userId) {
    try {
        const conceptId = parseInt(req.query.conceptId);
        if (isNaN(conceptId)) {
            return res.status(400).json({ error: 'Valid concept ID required' });
        }
        const [existingConcept] = await db
            .select()
            .from(mayaConcepts)
            .where(and(eq(mayaConcepts.id, conceptId), eq(mayaConcepts.userId, userId)));
        if (!existingConcept) {
            return res.status(404).json({ error: 'Concept not found' });
        }
        const validatedData = updateConceptSchema.parse({
            ...req.body
        });
        const { userId: _, ...updateData } = validatedData;
        const [updatedConcept] = await db
            .update(mayaConcepts)
            .set({
            ...updateData,
            updatedAt: new Date()
        })
            .where(and(eq(mayaConcepts.id, conceptId), eq(mayaConcepts.userId, userId)))
            .returning();
        return res.status(200).json({
            success: true,
            data: updatedConcept
        });
    }
    catch (error) {
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
async function handleDeleteConcept(req, res, userId) {
    try {
        const conceptId = parseInt(req.query.conceptId);
        if (isNaN(conceptId)) {
            return res.status(400).json({ error: 'Valid concept ID required' });
        }
        const [existingConcept] = await db
            .select()
            .from(mayaConcepts)
            .where(and(eq(mayaConcepts.id, conceptId), eq(mayaConcepts.userId, userId)));
        if (!existingConcept) {
            return res.status(404).json({ error: 'Concept not found' });
        }
        const [deletedConcept] = await db
            .delete(mayaConcepts)
            .where(and(eq(mayaConcepts.id, conceptId), eq(mayaConcepts.userId, userId)))
            .returning();
        return res.status(200).json({
            success: true,
            data: deletedConcept,
            message: 'Concept deleted successfully'
        });
    }
    catch (error) {
        console.error('Error deleting concept:', error);
        return res.status(500).json({ error: 'Failed to delete concept' });
    }
}
//# sourceMappingURL=index.js.map
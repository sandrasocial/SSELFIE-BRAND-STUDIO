import { VercelRequest, VercelResponse } from '@vercel/node';
import { verifyStackAuthToken, requireStackAuth } from '../../stack-auth.js';
import { z } from 'zod';
import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import { mayaProfile, insertMayaProfileSchema, userPreferencesSchema } from '../../../shared/schema.js';
import { eq } from 'drizzle-orm';

// Initialize database connection
const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);

// Note: Using stackServerApp from stack/server.js for authentication

// Request validation schemas
const updateProfileSchema = z.object({
  onboardingStatus: z.enum(['pending', 'in_progress', 'completed']).optional(),
  onboardingStep: z.number().min(1).max(6).optional(),
  completedSteps: z.array(z.number()).optional(),
  preferences: userPreferencesSchema.optional(),
  billingInfo: z.object({
    company: z.string().optional(),
    vatNumber: z.string().optional(),
    billingAddress: z.object({
      street: z.string().optional(),
      city: z.string().optional(),
      state: z.string().optional(),
      postalCode: z.string().optional(),
      country: z.string().optional(),
    }).optional(),
  }).optional(),
  featureAccess: z.object({
    advancedPrompts: z.boolean().optional(),
    priorityGeneration: z.boolean().optional(),
    customModels: z.boolean().optional(),
    apiAccess: z.boolean().optional(),
    whiteLabel: z.boolean().optional(),
  }).optional(),
  // Add missing fields for generation tracking
  monthlyGenerations: z.number().optional(),
  lastResetDate: z.date().optional(),
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
        return await handleGetProfile(req, res, userId);
      case 'POST':
        return await handleCreateProfile(req, res, userId);
      case 'PUT':
        return await handleUpdateProfile(req, res, userId);
      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT']);
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Maya profile API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function handleGetProfile(req: VercelRequest, res: VercelResponse, userId: string) {
  try {
    const profile = await db.select()
      .from(mayaProfile)
      .where(eq(mayaProfile.userId, userId))
      .limit(1);
    
    if (profile.length === 0) {
      // Create default profile if none exists
      const defaultProfile = {
        userId,
        onboardingStatus: 'pending' as const,
        onboardingStep: 1,
        completedSteps: [],
        preferences: {},
        billingInfo: {},
        totalGenerations: 0,
        monthlyGenerations: 0,
        featureAccess: {}
      };
      
      const [newProfile] = await db.insert(mayaProfile).values(defaultProfile).returning();
      
      return res.status(200).json({
        success: true,
        data: newProfile
      });
    }
    
    return res.status(200).json({
      success: true,
      data: profile[0]
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    return res.status(500).json({ error: 'Failed to fetch profile' });
  }
}

async function handleCreateProfile(req: VercelRequest, res: VercelResponse, userId: string) {
  try {
    // Check if profile already exists
    const existingProfile = await db.select()
      .from(mayaProfile)
      .where(eq(mayaProfile.userId, userId))
      .limit(1);
    
    if (existingProfile.length > 0) {
      return res.status(409).json({ error: 'Profile already exists' });
    }
    
    const parsedBody = insertMayaProfileSchema.parse(req.body);
    const validatedData = {
      ...parsedBody,
      userId
    };
    
    const [newProfile] = await db.insert(mayaProfile).values(validatedData).returning();
    
    return res.status(201).json({
      success: true,
      data: newProfile,
      message: 'Profile created successfully'
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Validation error',
        details: error.issues
      });
    }
    console.error('Error creating profile:', error);
    return res.status(500).json({ error: 'Failed to create profile' });
  }
}

async function handleUpdateProfile(req: VercelRequest, res: VercelResponse, userId: string) {
  try {
    const validatedData = updateProfileSchema.parse(req.body);
    
    // Handle monthly generation reset
    if (validatedData.monthlyGenerations !== undefined) {
      const now = new Date();
      const profile = await db.select({ lastResetDate: mayaProfile.lastResetDate })
        .from(mayaProfile)
        .where(eq(mayaProfile.userId, userId))
        .limit(1);
      
      if (profile.length > 0) {
        const lastReset = profile[0].lastResetDate;
        const shouldReset = !lastReset || 
          (now.getMonth() !== lastReset.getMonth() || now.getFullYear() !== lastReset.getFullYear());
        
        if (shouldReset) {
          validatedData.monthlyGenerations = 0;
          validatedData.lastResetDate = now;
        }
      }
    }
    
    const [updatedProfile] = await db
      .update(mayaProfile)
      .set(validatedData as any)
      .where(eq(mayaProfile.userId, userId))
      .returning();
    
    if (!updatedProfile) {
      return res.status(404).json({ error: 'Profile not found' });
    }
    
    return res.status(200).json({
      success: true,
      data: updatedProfile
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Validation error',
        details: error.issues
      });
    }
    console.error('Error updating profile:', error);
    return res.status(500).json({ error: 'Failed to update profile' });
  }
}
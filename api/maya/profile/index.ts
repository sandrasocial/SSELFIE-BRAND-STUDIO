import { VercelRequest, VercelResponse } from '@vercel/node';
import { StackAuth } from '../../../types/stackframe.js';
import { z } from 'zod';
import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import { mayaProfile, type MayaProfile, insertMayaProfileSchema } from '../../../shared/schema-maya.js';
import { eq } from 'drizzle-orm';

// Initialize database connection
const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);

// Initialize Stack Auth
const stackAuth = new StackAuth({
  projectId: process.env.NEXT_PUBLIC_STACK_PROJECT_ID!,
  publishableClientKey: process.env.NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY!,
  secretServerKey: process.env.STACK_SECRET_SERVER_KEY!,
});

// Profile validation schemas
const updateProfileSchema = z.object({
  onboardingStatus: z.enum(['pending', 'completed', 'in_progress']).optional(),
  onboardingStep: z.number().optional(),
  completedSteps: z.array(z.number()).optional(),
  monthlyGenerations: z.number().optional(),
  lastResetDate: z.date().optional(),
  preferences: z.object({
    communicationStyle: z.enum(['casual', 'professional', 'technical']).optional(),
    generationSettings: z.record(z.any()).optional(),
    privacySettings: z.record(z.boolean()).optional(),
    notifications: z.record(z.boolean()).optional()
  }).optional()
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    // Authentication
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
    
    const validatedData = {
      userId,
      createdAt: new Date(),
      updatedAt: new Date(),
      onboardingStep: req.body.onboardingStep || 1,
      onboardingStatus: req.body.onboardingStatus || 'started',
      completedSteps: req.body.completedSteps || [],
      preferences: req.body.preferences || {},
      billingInfo: req.body.billingInfo || {},
      featureAccess: req.body.featureAccess || {}
    } as const;
    
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
        details: error.errors 
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
      .set({
        ...validatedData,
        updatedAt: new Date()
      })
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
        details: error.errors 
      });
    }
    console.error('Error updating profile:', error);
    return res.status(500).json({ error: 'Failed to update profile' });
  }
}
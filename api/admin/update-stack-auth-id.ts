import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  // Security check - only allow from admin
  const adminToken = req.headers['x-admin-token'];
  if (adminToken !== 'sandra-admin-2025') {
    return res.status(403).json({ error: 'Unauthorized' });
  }
  
  try {
    const { storage } = await import('../../server/storage.js');
    
    // Find existing admin user by email
    const existingUser = await storage.getUserByEmail('ssa@ssasocial.com');
    
    if (!existingUser) {
      return res.status(404).json({ error: 'Admin user not found' });
    }
    
    console.log('Found existing admin user:', {
      id: existingUser.id,
      email: existingUser.email,
      currentStackAuthId: existingUser.stackAuthId,
      role: existingUser.role
    });
    
    // Get the NEW Stack Auth ID from the request
    const { newStackAuthId } = req.body;
    
    if (!newStackAuthId) {
      return res.status(400).json({ error: 'newStackAuthId required in request body' });
    }
    
    // Update the Stack Auth ID (force update even if one exists)
    const { db } = await import('../../server/db.js');
    const { users } = await import('../../shared/schema.js');
    const { eq } = await import('drizzle-orm');
    
    const [updatedUser] = await db
      .update(users)
      .set({
        stackAuthId: newStackAuthId,
        updatedAt: new Date(),
        lastLoginAt: new Date()
      } as any)
      .where(eq(users.id, existingUser.id))
      .returning();
    
    return res.status(200).json({
      success: true,
      message: 'Successfully updated Stack Auth ID',
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        oldStackAuthId: existingUser.stackAuthId,
        newStackAuthId: updatedUser.stackAuthId,
        role: updatedUser.role
      }
    });
    
  } catch (error) {
    console.error('Error updating Stack Auth ID:', error);
    return res.status(500).json({ 
      error: 'Failed to update Stack Auth ID',
      details: error instanceof Error ? error.message : String(error)
    });
  }
}

export const config = {
  runtime: 'nodejs',
  maxDuration: 40,
};

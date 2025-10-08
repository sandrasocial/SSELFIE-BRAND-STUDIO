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
    const { storage } = await import('../../server/storage.ts');
    
    // Find existing admin user by email
    const existingUser = await storage.getUserByEmail('ssa@ssasocial.com');
    
    if (!existingUser) {
      return res.status(404).json({ error: 'Admin user not found' });
    }
    
    console.log('Found existing admin user:', {
      id: existingUser.id,
      email: existingUser.email,
      stackAuthId: existingUser.stackAuthId,
      role: existingUser.role,
      monthlyGenerationLimit: existingUser.monthlyGenerationLimit
    });
    
    // Get the Stack Auth ID from the request
    const { stackAuthId } = req.body;
    
    if (!stackAuthId) {
      return res.status(400).json({ error: 'stackAuthId required in request body' });
    }
    
    if (existingUser.stackAuthId) {
      return res.status(400).json({ 
        error: 'User already has Stack Auth ID',
        currentStackAuthId: existingUser.stackAuthId 
      });
    }
    
    // Link the Stack Auth ID to existing user
    const linkedUser = await storage.linkStackAuthId(existingUser.id, stackAuthId);
    
    return res.status(200).json({
      success: true,
      message: 'Successfully linked Stack Auth ID to existing admin user',
      user: {
        id: linkedUser.id,
        email: linkedUser.email,
        stackAuthId: linkedUser.stackAuthId,
        role: linkedUser.role
      }
    });
    
  } catch (error) {
    console.error('Error linking user:', error);
    return res.status(500).json({ 
      error: 'Failed to link user',
      details: error instanceof Error ? error.message : String(error)
    });
  }
}
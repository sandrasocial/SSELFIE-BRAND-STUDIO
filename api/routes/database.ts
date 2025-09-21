/**
 * Database testing route handlers
 */
import type { VercelRequest, VercelResponse } from '@vercel/node';

export async function handleTestDb(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { storage } = await import('../../server/storage');
    
    // Simple database connectivity test
    const testResult = await storage.testConnection();
    
    return res.status(200).json({ 
      success: true, 
      database: 'connected',
      timestamp: new Date().toISOString(),
      testResult 
    });
  } catch (error) {
    console.error('❌ Database test error:', error);
    return res.status(500).json({ 
      success: false,
      error: 'Database connection failed', 
      details: (error as Error).message 
    });
  }
}
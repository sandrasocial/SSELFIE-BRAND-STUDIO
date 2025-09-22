import type { VercelRequest, VercelResponse } from '@vercel/node';

export const config = { 
  runtime: 'nodejs',
  maxDuration: 10
} as const;

export default async function handler(_req: VercelRequest, res: VercelResponse) {
  try {
    console.log('🧪 Testing simple Neon connection...');
    
    return res.status(200).json({
      success: true,
      message: 'Simple test endpoint working',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Test error:', error);
    
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
}
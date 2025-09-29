import type { VercelRequest, VercelResponse } from '@vercel/node';

export const config = { 
  runtime: 'nodejs',
  maxDuration: 30 
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    // Verify cron secret for security
    const authHeader = req.headers.authorization;
    const cronSecret = process.env.CRON_SECRET;
    
    if (!cronSecret) {
      console.error('❌ CRON_SECRET not configured');
      return res.status(500).json({ error: 'Cron secret not configured' });
    }
    
    if (authHeader !== `Bearer ${cronSecret}`) {
      console.error('❌ Unauthorized cron job request');
      return res.status(401).json({ error: 'Unauthorized' });
    }

    console.log('🕐 Cron job executed at:', new Date().toISOString());
    
    // This is a simple test cron job
    // In production, this would trigger various maintenance tasks
    
    res.json({
      success: true,
      message: 'Cron job executed successfully',
      timestamp: new Date().toISOString(),
      service: 'SSELFIE Studio Cron'
    });

  } catch (error) {
    console.error('❌ Cron job failed:', error);
    res.status(500).json({
      success: false,
      error: 'Cron job execution failed'
    });
  }
}

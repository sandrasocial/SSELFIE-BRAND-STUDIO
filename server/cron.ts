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

    // 🔥 CRITICAL: Execute training completion monitoring
    console.log('🔄 Starting training completion monitoring...');
    try {
      const { TrainingCompletionMonitor } = await import('./training-completion-monitor.js');
      await TrainingCompletionMonitor.checkAllInProgressTrainings();
      console.log('✅ Training completion monitoring completed');
    } catch (trainingError) {
      console.error('❌ Training monitoring failed:', trainingError);
    }

    // 🔥 CRITICAL: Execute generation completion monitoring
    console.log('🔄 Starting generation completion monitoring...');
    try {
      const { GenerationCompletionMonitor } = await import('./generation-completion-monitor.js');
      const monitor = GenerationCompletionMonitor.getInstance();
      await monitor.checkAllInProgressGenerations();
      console.log('✅ Generation completion monitoring completed');
    } catch (generationError) {
      console.error('❌ Generation monitoring failed:', generationError);
    }

    // 🔥 Execute migration monitoring to prevent image loss
    console.log('🔄 Starting migration monitoring...');
    try {
      const { migrationMonitor } = await import('./migration-monitor.js');
      await migrationMonitor.runMigrationScan();
      console.log('✅ Migration monitoring completed');
    } catch (migrationError) {
      console.error('❌ Migration monitoring failed:', migrationError);
    }
    
    res.json({
      success: true,
      message: 'All cron jobs executed successfully',
      timestamp: new Date().toISOString(),
      service: 'SSELFIE Studio Cron',
      executed: [
        'training-completion-monitor',
        'generation-completion-monitor', 
        'migration-monitor'
      ]
    });

  } catch (error) {
    console.error('❌ Cron job failed:', error);
    res.status(500).json({
      success: false,
      error: 'Cron job execution failed',
      message: (error as Error).message
    });
  }
}

import { Router, Response, Request } from 'express';
import { requireStackAuth } from '../../stack-auth.js';
import { asyncHandler } from '../middleware/error-handler.js';
import { MetricsStorage } from '../../storage/metrics-storage.js';
import type { MetricsPayload, PerformanceMetrics } from '../../../shared/types/metrics.js';

// Create metrics storage instance
const metricsStore = new MetricsStorage();
const router = Router();

// Register the metrics routes
router.use('/metrics', router);

// Helper to calculate average, ignoring undefined values
function calculateAverage(values: (number | undefined)[]): number {
  const validValues = values.filter((v): v is number => typeof v === 'number');
  if (validValues.length === 0) return 0;
  return validValues.reduce((a, b) => a + b, 0) / validValues.length;
}

type RequestWithUser = Request & { user: { id: string } };

router.post('/api/metrics', requireStackAuth, asyncHandler(async (req, res: Response) => {
  const typedReq = req as RequestWithUser;
  const metrics = typedReq.body as MetricsPayload;
  const userId = typedReq.user.id;

  // Store raw metrics first
  const perfMetrics: PerformanceMetrics = {
    userId,
    timestamp: new Date().toISOString(),
    ...metrics.metrics,
    resources: metrics.resourceMetrics
  };
  await metricsStore.storePerformanceMetrics(userId, perfMetrics);

  // Calculate and update aggregated metrics
  const allMetrics = await metricsStore.getPerformanceMetrics(userId);
  
  // Calculate averages for all metrics
  const aggregated = {
    avgPageLoadTime: calculateAverage(allMetrics.map((m: PerformanceMetrics) => m.pageLoadTime)),
    avgTimeToFirstByte: calculateAverage(allMetrics.map((m: PerformanceMetrics) => m.timeToFirstByte)),
    avgTimeToFirstPaint: calculateAverage(allMetrics.map((m: PerformanceMetrics) => m.timeToFirstPaint)),
    avgTimeToFirstContentfulPaint: calculateAverage(allMetrics.map((m: PerformanceMetrics) => m.timeToFirstContentfulPaint)),
    avgTimeToInteractive: calculateAverage(allMetrics.map((m: PerformanceMetrics) => m.timeToInteractive)),
    totalSamples: allMetrics.length
  };

  await metricsStore.updateAggregatedMetrics(userId, aggregated);

  res.status(200).json({ message: 'Metrics stored successfully' });
}));

export default router;
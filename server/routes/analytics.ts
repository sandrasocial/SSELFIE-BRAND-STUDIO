import express from 'express';
import { prisma } from '../db';

const router = express.Router();

router.post('/log', async (req, res) => {
  try {
    const { event, data, timestamp } = req.body;

    // Store analytics data
    await prisma.analytics.create({
      data: {
        event,
        data: JSON.stringify(data),
        timestamp: new Date(timestamp)
      }
    });

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Analytics logging error:', error);
    res.status(500).json({ error: 'Failed to log analytics data' });
  }
});

router.get('/report', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const analyticsData = await prisma.analytics.findMany({
      where: {
        timestamp: {
          gte: startDate ? new Date(startDate as string) : undefined,
          lte: endDate ? new Date(endDate as string) : undefined
        }
      },
      orderBy: {
        timestamp: 'desc'
      }
    });

    // Process and aggregate analytics data
    const report = {
      viewportDistribution: {},
      breakpointPerformance: {},
      interactionSuccess: {},
      timeSeriesData: analyticsData.map(entry => ({
        timestamp: entry.timestamp,
        event: entry.event,
        data: JSON.parse(entry.data)
      }))
    };

    res.status(200).json(report);
  } catch (error) {
    console.error('Analytics report generation error:', error);
    res.status(500).json({ error: 'Failed to generate analytics report' });
  }
});

export default router;
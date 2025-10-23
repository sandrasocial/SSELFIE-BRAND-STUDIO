/**
 * Vercel Serverless Function - /api/studio/recent-activity
 * Pure serverless endpoint for recent activity
 */

import handler from '../../server/api/studio/recent-activity.js';

export default handler;

export const config = {
  runtime: 'nodejs',
  maxDuration: 30,
  memory: 3008
};


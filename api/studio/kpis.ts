/**
 * Vercel Serverless Function - /api/studio/kpis
 * Pure serverless endpoint for studio KPIs
 */

import handler from '../../server/api/studio/kpis.js';

export default handler;

export const config = {
  runtime: 'nodejs',
  maxDuration: 15,
  memory: 3008
};


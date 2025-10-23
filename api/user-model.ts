/**
 * Vercel Serverless Function - /api/user-model
 * Pure serverless endpoint for user model training status
 */

import handler from '../server/api/training/user-model.js';

export default handler;

export const config = {
  runtime: 'nodejs',
  maxDuration: 30,
  memory: 3008
};

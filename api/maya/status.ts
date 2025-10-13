/**/**

 * Vercel Serverless Function - /api/maya/status * GET /api/maya/status - Pure Serverless

 * Proxies to server implementation */

 */

import type { VercelRequest, VercelResponse } from '@vercel/node';

import handler from '../../server/api/maya/status.js';import { getUserFromRequest } from '../../_utils/auth-helpers.js';

import { sendError, sendMethodNotAllowed, sendUnauthorized, setNoCacheHeaders } from '../../_utils/response-helpers.js';

export default handler;import { storage } from '../../storage.js';



export const config = {export const config = { runtime: 'nodejs', maxDuration: 30 };

  runtime: 'nodejs',

  maxDuration: 30,export default async function handler(req: VercelRequest, res: VercelResponse) {

};  if (req.method !== 'GET') {

    return sendMethodNotAllowed(res, ['GET']);
  }

  try {
    const user = await getUserFromRequest(req);
    if (!user) return sendUnauthorized(res);

    const userModel = await storage.getUserModelByUserId(user.id);
    const dbUser = await storage.getUserByStackAuthId(user.id);
    
    if (!userModel) {
      setNoCacheHeaders(res);
      return res.status(200).json({
        ready: false,
        message: 'Training required',
        trainingStatus: 'not_started',
        needsTraining: true
      });
    }
    
    const isReady = userModel.trainingStatus === 'completed';
    const canGenerate = isReady && (dbUser?.monthlyGenerationLimit === -1 || (dbUser?.monthlyGenerationLimit || 0) > 0);
    
    setNoCacheHeaders(res);
    return res.status(200).json({
      ready: isReady,
      canGenerate,
      trainingStatus: userModel.trainingStatus,
      modelVersionId: userModel.replicateVersionId,
      generationsRemaining: dbUser?.monthlyGenerationLimit || 0,
      message: isReady ? 'Maya AI is ready!' : 'Training in progress...'
    });

  } catch (error) {
    console.error('[ERROR] /api/maya/status:', error);
    return sendError(res, 'Failed to check Maya status', 500);
  }
}

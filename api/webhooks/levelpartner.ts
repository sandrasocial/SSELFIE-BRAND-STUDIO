import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sendError, sendMethodNotAllowed, sendSuccess } from '../_utils/response-helpers';
import { getRequestBody } from '../_utils/request-helpers';

export const config = { runtime: 'nodejs', maxDuration: 30 };

interface LevelPartnerWebhook {
  event: string;
  data: Record<string, any>;
  timestamp: string;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return sendMethodNotAllowed(res, ['POST']);
  }

  try {
    const body = await getRequestBody(req) as LevelPartnerWebhook;
    const { event, data } = body;

    if (!event) {
      return sendError(res, 'Event type is required', 400);
    }

    // TODO: Implement LevelPartner webhook handling
    console.log(`📨 LevelPartner webhook received: ${event}`, data);

    const responseData = {
      data: {
        success: true,
        event,
        processed: true,
        timestamp: new Date().toISOString()
      },
      message: 'Webhook processed successfully'
    };

    return sendSuccess(res, responseData);
  } catch (error) {
    console.error('❌ LevelPartner webhook error:', error);
    return sendError(res, 'Failed to process webhook', 500);
  }
}


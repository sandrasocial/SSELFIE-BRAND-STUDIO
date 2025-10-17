import type { VercelRequest, VercelResponse } from '@vercel/node';
import { withAuth } from '../_middleware/auth';
import type { AuthenticatedRequest } from '../_shared/auth-types';
import { sendError, sendMethodNotAllowed, sendSuccess } from '../_utils/response-helpers';
import { getRequestBody } from '../_utils/request-helpers';
import { db } from '../../server/drizzle';
import { conceptCards } from '../../shared/schema';

export const config = { runtime: 'nodejs', maxDuration: 30 };

interface CreateConceptCardRequest {
  title: string;
  description?: string;
  images?: string[];
  tags?: string[];
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return sendMethodNotAllowed(res, ['POST']);
  }

  return withAuth(req, res, async (req: AuthenticatedRequest, res: VercelResponse) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return sendError(res, 'User ID not found', 401);
      }

      const body = await getRequestBody(req) as CreateConceptCardRequest;
      const { title, description, images, tags } = body;

      if (!title) {
        return sendError(res, 'Title is required', 400);
      }

      const newCard = await db
        .insert(conceptCards)
        .values({
          userId,
          title,
          description,
          images: images || [],
          tags: tags || [],
          status: 'draft'
        })
        .returning();

      return sendSuccess(res, {
        message: 'Concept card created successfully',
        card: newCard[0]
      }, 201);
    } catch (error) {
      console.error('❌ Create concept card error:', error);
      return sendError(res, 'Failed to create concept card', 500);
    }
  });
}


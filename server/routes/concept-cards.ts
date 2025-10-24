/**
 * ⚠️ DEPRECATED: CONCEPT CARDS API ROUTES
 *
 * This Express router is no longer used in the serverless architecture.
 * Concept cards are now handled by api/concept-cards/* serverless functions.
 * This file is kept for reference only and should not be imported.
 */

import { Router } from 'express';

// Return empty router - this file is deprecated and not used
const router = Router();

// All routes have been migrated to serverless functions
// This router is kept for backward compatibility only

// Deprecated route handlers removed - use serverless functions instead
/*
// DEPRECATED: router.get('/', requireStackAuth, async (req: AuthenticatedRequest, res: Response) => {
*/

export default router;
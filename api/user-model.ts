/**
 * Vercel Serverless Function - /api/user-model
 * Proxies to main handler
 */

import handler from '../server/[...route]';

export default handler;

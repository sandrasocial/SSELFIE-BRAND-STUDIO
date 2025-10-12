/**
 * Vercel Serverless Function - /api/me
 * Proxies to main handler
 */

import handler from '../server/[...route]';

export default handler;

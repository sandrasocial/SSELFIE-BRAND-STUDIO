/**
 * Vercel Serverless Function - /api/logout
 * Proxies to main handler
 */

import handler from '../server/[...route]';

export default handler;

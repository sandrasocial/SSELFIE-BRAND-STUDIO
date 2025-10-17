/**
 * Response helper utilities for Vercel serverless functions
 */

import type { VercelResponse } from '@vercel/node';

export function sendError(res: VercelResponse, message: string, statusCode: number = 500): VercelResponse {
  return res.status(statusCode).json({ error: message });
}

export function sendSuccess(res: VercelResponse, data: any, statusCode: number = 200): VercelResponse {
  return res.status(statusCode).json(data);
}

export function sendMethodNotAllowed(res: VercelResponse, allowedMethods: string[]): VercelResponse {
  res.setHeader('Allow', allowedMethods.join(', '));
  return res.status(405).json({ error: `Method not allowed. Allowed methods: ${allowedMethods.join(', ')}` });
}

export function setNoCacheHeaders(res: VercelResponse): void {
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
}

export function setCacheHeaders(res: VercelResponse, maxAge: number = 3600): void {
  res.setHeader('Cache-Control', `public, max-age=${maxAge}`);
}

export function setCORSHeaders(res: VercelResponse, origin: string = '*'): void {
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}


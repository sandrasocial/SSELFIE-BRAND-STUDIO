/**
 * Request helper utilities for Vercel serverless functions
 */

import type { VercelRequest } from '@vercel/node';

export function getQueryParam(req: VercelRequest, paramName: string): string | undefined {
  const query = req.query as Record<string, string | string[]>;
  const value = query[paramName];
  
  if (Array.isArray(value)) {
    return value[0];
  }
  
  return value;
}

export function getQueryParams(req: VercelRequest): Record<string, string> {
  const query = req.query as Record<string, string | string[]>;
  const result: Record<string, string> = {};
  
  for (const [key, value] of Object.entries(query)) {
    result[key] = Array.isArray(value) ? value[0] : value;
  }
  
  return result;
}

export async function getRequestBody(req: VercelRequest): Promise<any> {
  return new Promise((resolve, reject) => {
    let body = '';
    
    req.on('data', (chunk) => {
      body += chunk.toString();
    });
    
    req.on('end', () => {
      try {
        const parsed = body ? JSON.parse(body) : {};
        resolve(parsed);
      } catch (error) {
        reject(new Error('Invalid JSON in request body'));
      }
    });
    
    req.on('error', (error) => {
      reject(error);
    });
  });
}

export function getHeader(req: VercelRequest, headerName: string): string | undefined {
  const headers = req.headers as Record<string, string | string[]>;
  const value = headers[headerName.toLowerCase()];
  
  if (Array.isArray(value)) {
    return value[0];
  }
  
  return value;
}


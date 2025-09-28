import { VercelRequest } from '@vercel/node';

declare module '@vercel/node' {
  interface VercelRequest {
    user?: {
      id: string;
      [key: string]: unknown;
    };
  }
}
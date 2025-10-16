import { Router as ExpressRouter } from 'express';
import { Handler } from '@vercel/node';

// Router type with proper type inference
export type TypedRouter = ReturnType<typeof ExpressRouter>;

// Typed handler with proper types
export type APIHandler = Handler;

// Stack Auth integration
export interface StackAuthUser {
  id: string;
  email: string;
  claims?: {
    sub: string;
    [key: string]: any;
  };
}

export interface AuthenticatedRequest {
  user?: StackAuthUser;
  isAuthenticated?: boolean;
}
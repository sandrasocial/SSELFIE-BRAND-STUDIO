import { Request } from 'express';
import { AuthenticatedUser } from './auth-types.js';

// Re-export the User interface type
export type { AuthenticatedUser };

// Base authenticated request interface
export interface AuthenticatedRequest extends Request {
  user: AuthenticatedUser;
}

// Helper type to add request body type
export type AuthenticatedRequestWithBody<T> = AuthenticatedRequest & { body: T };

// Helper type to add request params type
export type AuthenticatedRequestWithParams<T> = AuthenticatedRequest & { params: T };

// Helper type to add request query type
export type AuthenticatedRequestWithQuery<T> = AuthenticatedRequest & { query: T };

// Helper type for request with all types
export type FullAuthenticatedRequest<TBody = any, TParams = any, TQuery = any> = 
  AuthenticatedRequest & { body: TBody; params: TParams; query: TQuery };
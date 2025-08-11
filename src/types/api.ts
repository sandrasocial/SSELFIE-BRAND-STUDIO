// API Types

import { User } from './index';

// Request Types
export interface ApiRequest<T = any> {
  body: T;
  params: Record<string, string>;
  query: Record<string, string>;
  headers: Record<string, string>;
  user?: User;
}

// Response Types
export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
}

export interface ApiSuccess<T> {
  data: T;
  message?: string;
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError;

// Endpoint Types
export interface AuthEndpoints {
  login: {
    request: {
      email: string;
      password: string;
    };
    response: {
      token: string;
      user: User;
    };
  };
  register: {
    request: {
      email: string;
      password: string;
      name: string;
    };
    response: {
      user: User;
      token: string;
    };
  };
}

// Database Types
export interface DbConfig {
  host: string;
  port: number;
  database: string;
  user: string;
  password: string;
  ssl?: boolean;
}
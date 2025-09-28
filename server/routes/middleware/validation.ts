/**
 * API Request Validation Middleware
 * Provides type-safe request validation using Zod schemas
 */

import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { createError } from './error-handler.js';
import { validateAndSanitizeInput } from '../../../shared/validation/index.js';
import { AuthenticatedRequest } from '../../types/ai-generation.js';

export interface ValidationOptions {
  sanitize?: boolean;
  stripUnknown?: boolean;
}

/**
 * Validates request body against a Zod schema
 */
export function validateBody<T>(
  schema: z.ZodSchema<T>,
  options: ValidationOptions = { sanitize: true, stripUnknown: true }
) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = validateAndSanitizeInput(req.body, schema, options.sanitize);
      
      if (!result.success) {
        throw createError.validation('Request validation failed', {
          errors: result.errors,
          field: 'body'
        });
      }
      
      // Replace request body with validated and sanitized data
      req.body = result.data;
      next();
    } catch (error) {
      next(error);
    }
  };
}

/**
 * Validates query parameters against a Zod schema
 */
export function validateQuery<T>(
  schema: z.ZodSchema<T>,
  options: ValidationOptions = { sanitize: true }
) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = validateAndSanitizeInput(req.query, schema, options.sanitize);
      
      if (!result.success) {
        throw createError.validation('Query validation failed', {
          errors: result.errors,
          field: 'query'
        });
      }
      
      // Replace request query with validated and sanitized data
      req.query = result.data as any;
      next();
    } catch (error) {
      next(error);
    }
  };
}

/**
 * Validates route parameters against a Zod schema
 */
export function validateParams<T>(
  schema: z.ZodSchema<T>,
  options: ValidationOptions = { sanitize: true }
) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = validateAndSanitizeInput(req.params, schema, options.sanitize);
      
      if (!result.success) {
        throw createError.validation('Parameter validation failed', {
          errors: result.errors,
          field: 'params'
        });
      }
      
      // Replace request params with validated and sanitized data
      req.params = result.data as any;
      next();
    } catch (error) {
      next(error);
    }
  };
}

/**
 * Validates file uploads
 */
export function validateFile(
  options: {
    required?: boolean;
    maxSize?: number; // in bytes
    allowedTypes?: string[];
    maxFiles?: number;
  } = {}
) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const files = req.files as Express.Multer.File[] | undefined;
      const file = req.file as Express.Multer.File | undefined;
      
      // Check if file is required
      if (options.required && !file && (!files || files.length === 0)) {
        throw createError.validation('File is required');
      }
      
      // Validate single file
      if (file) {
        validateSingleFile(file, options);
      }
      
      // Validate multiple files
      if (files && files.length > 0) {
        if (options.maxFiles && files.length > options.maxFiles) {
          throw createError.validation(`Too many files. Maximum allowed: ${options.maxFiles}`);
        }
        
        files.forEach((f, index) => {
          try {
            validateSingleFile(f, options);
          } catch (error) {
            throw createError.validation(`File ${index + 1}: ${(error as Error).message}`);
          }
        });
      }
      
      next();
    } catch (error) {
      next(error);
    }
  };
}

function validateSingleFile(
  file: Express.Multer.File,
  options: {
    maxSize?: number;
    allowedTypes?: string[];
  }
) {
  // Check file size
  if (options.maxSize && file.size > options.maxSize) {
    throw new Error(`File too large. Maximum size: ${Math.round(options.maxSize / (1024 * 1024))}MB`);
  }
  
  // Check file type
  if (options.allowedTypes && !options.allowedTypes.includes(file.mimetype)) {
    throw new Error(`Invalid file type. Allowed types: ${options.allowedTypes.join(', ')}`);
  }
}

/**
 * Enhanced validation middleware that combines body, query, and params validation
 */
export function validate<TBody = any, TQuery = any, TParams = any>(schemas: {
  body?: z.ZodSchema<TBody>;
  query?: z.ZodSchema<TQuery>;
  params?: z.ZodSchema<TParams>;
  options?: ValidationOptions;
}) {
  return (req: Request, res: Response, next: NextFunction) => {
    const middlewares: Array<(req: Request, res: Response, next: NextFunction) => void> = [];
    
    if (schemas.body) {
      middlewares.push(validateBody(schemas.body, schemas.options));
    }
    
    if (schemas.query) {
      middlewares.push(validateQuery(schemas.query, schemas.options));
    }
    
    if (schemas.params) {
      middlewares.push(validateParams(schemas.params, schemas.options));
    }
    
    // Execute middlewares in sequence
    let index = 0;
    
    function runNext(error?: any) {
      if (error) {
        return next(error);
      }
      
      if (index >= middlewares.length) {
        return next();
      }
      
      const middleware = middlewares[index++];
      middleware(req, res, runNext);
    }
    
    runNext();
  };
}

/**
 * Type-safe request handler wrapper that ensures proper typing
 */
export function typedHandler<TBody = any, TQuery = any, TParams = any>(
  handler: (
    req: AuthenticatedRequest & {
      body: TBody;
      query: TQuery;
      params: TParams;
    },
    res: Response
  ) => Promise<void> | void
) {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      await handler(req as any, res);
    } catch (error) {
      next(error);
    }
  };
}
/**
 * SSELFIE Studio Luxury API Service
 * Technical excellence meets luxury design patterns
 * 
 * This service demonstrates our premium approach to API architecture:
 * - Elegant error handling with user-friendly messages
 * - Performance-optimized caching strategies  
 * - Type-safe request/response patterns
 * - Luxury-grade logging and monitoring
 */

import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';

// Luxury response pattern - consistent, elegant, informative
interface LuxuryResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  meta?: {
    timestamp: string;
    requestId: string;
    performance: {
      duration: number;
      cached: boolean;
    };
  };
}

// Premium request validation schema
const CreateBrandSchema = z.object({
  name: z.string().min(1, "Brand name is required").max(50, "Brand name too long"),
  style: z.enum(['luxury', 'editorial', 'minimalist', 'bold']),
  colors: z.array(z.string().regex(/^#[0-9A-F]{6}$/i)).min(1).max(5),
  personality: z.object({
    tone: z.string(),
    values: z.array(z.string()),
    targetAudience: z.string()
  })
});

export class LuxuryAPIService {
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>();
  
  /**
   * Luxury response wrapper - makes every API response feel premium
   */
  static createResponse<T>(
    data: T,
    message: string = "Success",
    meta?: Partial<LuxuryResponse['meta']>
  ): LuxuryResponse<T> {
    return {
      success: true,
      data,
      message,
      meta: {
        timestamp: new Date().toISOString(),
        requestId: Math.random().toString(36).substring(7),
        performance: {
          duration: meta?.performance?.duration || 0,
          cached: meta?.performance?.cached || false
        },
        ...meta
      }
    };
  }

  /**
   * Elegant error response - even errors feel luxurious
   */
  static createErrorResponse(
    message: string,
    statusCode: number = 400,
    details?: any
  ): LuxuryResponse {
    return {
      success: false,
      message,
      meta: {
        timestamp: new Date().toISOString(),
        requestId: Math.random().toString(36).substring(7),
        performance: { duration: 0, cached: false }
      },
      ...(details && { details })
    };
  }

  /**
   * Performance-optimized caching with TTL
   */
  private getCached(key: string): any | null {
    const cached = this.cache.get(key);
    if (!cached) return null;
    
    const now = Date.now();
    if (now > cached.timestamp + cached.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return cached.data;
  }

  private setCache(key: string, data: any, ttlMs: number = 300000): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttlMs
    });
  }

  /**
   * Premium brand creation endpoint
   * Demonstrates luxury validation + caching + response patterns
   */
  async createPersonalBrand(req: Request, res: Response): Promise<Response> {
    const startTime = Date.now();
    
    try {
      // Luxury validation with detailed error messages
      const validatedData = CreateBrandSchema.parse(req.body);
      
      // Check cache first (performance optimization)
      const cacheKey = `brand_${JSON.stringify(validatedData)}`;
      const cached = this.getCached(cacheKey);
      
      if (cached) {
        const response = LuxuryAPIService.createResponse(
          cached,
          "Brand retrieved from cache",
          { 
            performance: { 
              duration: Date.now() - startTime, 
              cached: true 
            } 
          }
        );
        return res.json(response);
      }

      // Simulate luxury brand creation process
      const brandData = {
        id: Math.random().toString(36).substring(7),
        ...validatedData,
        created: new Date().toISOString(),
        assets: {
          logo: `/api/generate/logo/${validatedData.name}`,
          colorPalette: validatedData.colors,
          typography: 'Times New Roman, serif',
          guidelines: `/api/brand/guidelines/${validatedData.name}`
        },
        status: 'ready'
      };

      // Cache the result
      this.setCache(cacheKey, brandData, 600000); // 10 minutes

      const response = LuxuryAPIService.createResponse(
        brandData,
        "Personal brand created successfully",
        { 
          performance: { 
            duration: Date.now() - startTime, 
            cached: false 
          } 
        }
      );

      return res.status(201).json(response);

    } catch (error) {
      console.error('Brand creation error:', error);
      
      if (error instanceof z.ZodError) {
        const response = LuxuryAPIService.createErrorResponse(
          "Validation failed",
          400,
          { validationErrors: error.errors }
        );
        return res.status(400).json(response);
      }

      const response = LuxuryAPIService.createErrorResponse(
        "Failed to create personal brand",
        500
      );
      return res.status(500).json(response);
    }
  }

  /**
   * Luxury middleware for request timing and logging
   */
  static performanceMiddleware() {
    return (req: Request, res: Response, next: NextFunction) => {
      const startTime = Date.now();
      
      // Add luxury headers
      res.setHeader('X-Powered-By', 'SSELFIE Studio');
      res.setHeader('X-API-Version', '1.0');
      
      // Log the request with style
      console.log(`🚀 ${req.method} ${req.path} - Started at ${new Date().toISOString()}`);
      
      // Override json method to add performance data
      const originalJson = res.json;
      res.json = function(body: any) {
        if (body && typeof body === 'object' && body.meta) {
          body.meta.performance = {
            ...body.meta.performance,
            duration: Date.now() - startTime
          };
        }
        
        console.log(`✨ ${req.method} ${req.path} - Completed in ${Date.now() - startTime}ms`);
        return originalJson.call(this, body);
      };
      
      next();
    };
  }
}

export default LuxuryAPIService;
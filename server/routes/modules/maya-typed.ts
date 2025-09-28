/**
 * Maya Typed Routes - Type-Safe Implementation Demo
 * Demonstrates the new type-safe API implementation for Maya
 */

import { Router, Response } from 'express';
import { requireStackAuth } from '../../stack-auth.js';
import { asyncHandler } from '../middleware/error-handler.js';
import { sendApiSuccess, sendMayaError } from '../middleware/response.js';
import { AuthenticatedRequest } from '../../types/ai-generation.js';

// Import new type-safe API types
import {
  MayaChatRequest,
  MayaResponse,
  ConceptCard,
  ApiResponse
} from '../../../shared/types/api.js';

// Import validation schema directly
import { z } from 'zod';

// Define validation schema
const mayaChatSchema = z.object({
  message: z.string().min(1).max(5000).trim(),
  chatHistory: z.array(z.object({
    user: z.string().optional(),
    maya: z.string().optional(),
    response: z.string().optional(),
  })).optional().default([]),
  context: z.record(z.unknown()).optional().default({})
});

const router = Router();

// Type-safe Maya chat endpoint with inline validation
router.post('/api/maya-typed-chat', requireStackAuth, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user.id;
  
  try {
    // Validate request using Zod schema
    const validation = mayaChatSchema.safeParse(req.body);
    
    if (!validation.success) {
      return sendMayaError(res, 'Invalid request data', {
        errors: validation.error.errors.map(err => `${err.path.join('.')}: ${err.message}`)
      });
    }
    
    const { message, chatHistory, context } = validation.data;
    
    // Simple mock Maya response for demonstration
    const mockMayaResponse = `Hello! I understand you said: "${message}". As Maya, your AI Creative Director, I'm here to help you create amazing visuals. Let me suggest some concepts for your project.`;
    
    // Mock concept cards
    const conceptCards: ConceptCard[] = [
      {
        title: "Modern Professional",
        prompt: "Clean, modern professional portrait with natural lighting and minimal background"
      },
      {
        title: "Creative Lifestyle",
        prompt: "Dynamic lifestyle shot showcasing creativity and personality in natural environment"
      }
    ];
    
    // Create type-safe response
    const responseData = {
      response: mockMayaResponse,
      conceptCards,
      chatId: `chat_${Date.now()}`,
      agentName: 'Maya - AI Creative Director',
      agentType: 'member' as const,
      timestamp: new Date().toISOString(),
      metadata: {
        processingTime: Date.now(),
        model: 'maya-demo',
        tokens: mockMayaResponse.length
      }
    };
    
    // Send successful response using type-safe helper
    sendApiSuccess(res, responseData, 'Message processed successfully');
    
  } catch (error) {
    console.error('❌ Maya Typed Chat Error:', error);
    sendMayaError(res, 'Failed to process chat message', {
      originalError: (error as Error).message,
      userId
    });
  }
}));

// Type-safe Maya validate endpoint - demonstrates validation only
router.post('/api/maya-validate', requireStackAuth, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  try {
    // Validate request using Zod schema
    const validation = mayaChatSchema.safeParse(req.body);
    
    if (!validation.success) {
      return sendApiSuccess(res, {
        isValid: false,
        errors: validation.error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
          code: err.code
        }))
      }, 'Validation completed');
    }
    
    // Send successful validation result
    sendApiSuccess(res, {
      isValid: true,
      sanitizedData: validation.data,
      message: 'Request is valid and properly formatted'
    }, 'Validation successful');
    
  } catch (error) {
    console.error('❌ Maya Validation Error:', error);
    sendMayaError(res, 'Validation error occurred', {
      originalError: (error as Error).message
    });
  }
}));

// Maya API info endpoint - demonstrates type definitions
router.get('/api/maya-api-info', requireStackAuth, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  try {
    const apiInfo = {
      version: '1.0.0',
      endpoints: [
        {
          path: '/api/maya-typed-chat',
          method: 'POST',
          description: 'Send a message to Maya with type-safe validation',
          requestSchema: {
            message: 'string (1-5000 chars, required)',
            chatHistory: 'array of chat entries (optional)',
            context: 'object with user preferences (optional)'
          },
          responseSchema: {
            response: 'string',
            conceptCards: 'array of concept objects',
            chatId: 'string',
            agentName: 'string',
            metadata: 'object with processing info'
          }
        },
        {
          path: '/api/maya-validate',
          method: 'POST', 
          description: 'Validate Maya chat request without processing',
          requestSchema: 'Same as maya-typed-chat',
          responseSchema: {
            isValid: 'boolean',
            errors: 'array of validation errors (if invalid)',
            sanitizedData: 'cleaned request data (if valid)'
          }
        }
      ],
      typeDefinitions: {
        MayaChatRequest: 'Defined in shared/types/maya-api.ts',
        ConceptCard: 'Defined in shared/types/maya-api.ts',
        ApiResponse: 'Defined in shared/types/api.ts'
      },
      validationSchemas: {
        location: 'shared/validation/maya-api.ts',
        schemas: ['mayaChatRequestSchema', 'mayaGenerateRequestSchema']
      }
    };
    
    sendApiSuccess(res, apiInfo, 'Maya API information retrieved');
    
  } catch (error) {
    console.error('❌ Maya API Info Error:', error);
    sendMayaError(res, 'Failed to get API information', {
      originalError: (error as Error).message
    });
  }
}));

export default router;
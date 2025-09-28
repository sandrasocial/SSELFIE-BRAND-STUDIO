/**
 * API Types Test Suite
 * Tests for type-safe API implementation
 */

import { describe, it, expect } from '@jest/globals';
import {
  validateMayaChatRequest,
  validateMayaGenerateRequest,
  validateMayaCreateChatRequest,
  validateMayaVideoPromptRequest
} from '../../shared/validation/maya-api';

import {
  MayaChatRequest,
  MayaGenerateRequest,
  MayaCreateChatRequest,
  MayaVideoPromptRequest,
  ApiResponse,
  ConceptCard
} from '../../shared/types/api';

describe('Maya API Types', () => {
  describe('MayaChatRequest Validation', () => {
    it('should validate a valid chat request', () => {
      const validRequest: MayaChatRequest = {
        message: 'Hello Maya, can you help me with a photoshoot concept?',
        chatHistory: [
          { user: 'Previous message' },
          { maya: 'Previous response' }
        ],
        context: { userPreferences: { stylePreferences: ['modern', 'minimal'] } }
      };

      const result = validateMayaChatRequest(validRequest);
      expect(result.success).toBe(true);
    });

    it('should reject request with empty message', () => {
      const invalidRequest = {
        message: '',
        chatHistory: []
      };

      const result = validateMayaChatRequest(invalidRequest);
      expect(result.success).toBe(false);
    });

    it('should reject request with message too long', () => {
      const invalidRequest = {
        message: 'a'.repeat(5001), // Over 5000 character limit
        chatHistory: []
      };

      const result = validateMayaChatRequest(invalidRequest);
      expect(result.success).toBe(false);
    });

    it('should sanitize input by trimming whitespace', () => {
      const requestWithWhitespace = {
        message: '  Hello Maya  ',
        chatHistory: []
      };

      const result = validateMayaChatRequest(requestWithWhitespace);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.message).toBe('Hello Maya');
      }
    });
  });

  describe('MayaGenerateRequest Validation', () => {
    it('should validate a valid generate request', () => {
      const validRequest: MayaGenerateRequest = {
        prompt: 'Professional headshot in modern office setting',
        style: 'professional',
        count: 2,
        conceptName: 'Executive Portrait',
        seed: 'abc123'
      };

      const result = validateMayaGenerateRequest(validRequest);
      expect(result.success).toBe(true);
    });

    it('should set default count if not provided', () => {
      const request = {
        prompt: 'Professional headshot'
      };

      const result = validateMayaGenerateRequest(request);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.count).toBe(2);
      }
    });

    it('should reject request with count over maximum', () => {
      const invalidRequest = {
        prompt: 'Professional headshot',
        count: 5 // Over maximum of 4
      };

      const result = validateMayaGenerateRequest(invalidRequest);
      expect(result.success).toBe(false);
    });
  });

  describe('MayaCreateChatRequest Validation', () => {
    it('should validate a valid create chat request', () => {
      const validRequest: MayaCreateChatRequest = {
        title: 'Brand Photography Discussion',
        initialMessage: 'I need help planning a brand photoshoot'
      };

      const result = validateMayaCreateChatRequest(validRequest);
      expect(result.success).toBe(true);
    });

    it('should allow empty request', () => {
      const emptyRequest = {};

      const result = validateMayaCreateChatRequest(emptyRequest);
      expect(result.success).toBe(true);
    });
  });

  describe('MayaVideoPromptRequest Validation', () => {
    it('should validate a valid video prompt request', () => {
      const validRequest: MayaVideoPromptRequest = {
        imageUrl: 'https://example.com/image.jpg'
      };

      const result = validateMayaVideoPromptRequest(validRequest);
      expect(result.success).toBe(true);
    });

    it('should reject request with invalid URL', () => {
      const invalidRequest = {
        imageUrl: 'not-a-valid-url'
      };

      const result = validateMayaVideoPromptRequest(invalidRequest);
      expect(result.success).toBe(false);
    });
  });
});

describe('API Response Types', () => {
  it('should create proper ApiResponse structure', () => {
    const conceptCards: ConceptCard[] = [
      {
        title: 'Modern Executive',
        prompt: 'Professional executive portrait in modern office'
      }
    ];

    const response: ApiResponse<{
      response: string;
      conceptCards: ConceptCard[];
    }> = {
      success: true,
      data: {
        response: 'Here are some great concepts for your photoshoot!',
        conceptCards
      },
      timestamp: new Date().toISOString()
    };

    expect(response.success).toBe(true);
    expect(response.data).toBeDefined();
    expect(response.data!.conceptCards).toHaveLength(1);
    expect(response.data!.conceptCards[0].title).toBe('Modern Executive');
  });

  it('should create proper error response structure', () => {
    const errorResponse: ApiResponse<null> = {
      success: false,
      error: {
        code: 'MAYA_ERROR',
        message: 'Failed to process request'
      },
      timestamp: new Date().toISOString()
    };

    expect(errorResponse.success).toBe(false);
    expect(errorResponse.error).toBeDefined();
    expect(errorResponse.error!.code).toBe('MAYA_ERROR');
  });
});
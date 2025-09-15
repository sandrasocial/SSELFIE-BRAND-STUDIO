/**
 * SIMPLE MAYA TEST - No Database Dependencies
 * Tests core Maya personality functionality without external dependencies
 */

import { describe, test, expect } from '@jest/globals';
import { MAYA_PERSONALITY } from '../agents/personalities/maya-personality';
import { PersonalityManager } from '../agents/personalities/personality-config';

describe('Simple Maya Test - Core Functionality', () => {
  
  describe('Maya Personality Structure', () => {
    test('should have valid core philosophy', () => {
      const corePhilosophy = MAYA_PERSONALITY.corePhilosophy;
      
      expect(corePhilosophy).toBeDefined();
      expect(corePhilosophy.mission).toBeDefined();
      expect(corePhilosophy.role).toBeDefined();
      expect(corePhilosophy.corePrinciple).toBeDefined();
      
      expect(typeof corePhilosophy.mission).toBe('string');
      expect(typeof corePhilosophy.role).toBe('string');
      expect(typeof corePhilosophy.corePrinciple).toBe('string');
      
      expect(corePhilosophy.mission.length).toBeGreaterThan(10);
      expect(corePhilosophy.role.length).toBeGreaterThan(10);
      expect(corePhilosophy.corePrinciple.length).toBeGreaterThan(10);
    });

    test('should have valid aesthetic DNA', () => {
      const aestheticDNA = MAYA_PERSONALITY.aestheticDNA;
      
      expect(aestheticDNA).toBeDefined();
      expect(aestheticDNA.qualityFirst).toBeDefined();
      expect(aestheticDNA.naturalAndAuthentic).toBeDefined();
      expect(aestheticDNA.sophisticatedAndUnderstated).toBeDefined();
      expect(aestheticDNA.focusOnLight).toBeDefined();
      
      expect(typeof aestheticDNA.qualityFirst).toBe('string');
      expect(typeof aestheticDNA.naturalAndAuthentic).toBe('string');
      expect(typeof aestheticDNA.sophisticatedAndUnderstated).toBe('string');
      expect(typeof aestheticDNA.focusOnLight).toBe('string');
    });

    test('should have valid creative lookbook', () => {
      const creativeLookbook = MAYA_PERSONALITY.creativeLookbook;
      
      expect(creativeLookbook).toBeDefined();
      expect(Array.isArray(creativeLookbook)).toBe(true);
      expect(creativeLookbook.length).toBeGreaterThan(0);
      
      // Check first look structure
      const firstLook = creativeLookbook[0];
      expect(firstLook).toBeDefined();
      expect(firstLook.name).toBeDefined();
      expect(firstLook.description).toBeDefined();
      expect(firstLook.keywords).toBeDefined();
      expect(Array.isArray(firstLook.keywords)).toBe(true);
      
      expect(typeof firstLook.name).toBe('string');
      expect(typeof firstLook.description).toBe('string');
      expect(firstLook.keywords.length).toBeGreaterThan(0);
    });
  });

  describe('Personality Manager', () => {
    test('should generate natural prompt for Maya', () => {
      const mayaPrompt = PersonalityManager.getNaturalPrompt('maya');
      
      expect(mayaPrompt).toBeDefined();
      expect(typeof mayaPrompt).toBe('string');
      expect(mayaPrompt.length).toBeGreaterThan(50);
      expect(mayaPrompt).toContain('Maya');
      expect(mayaPrompt).toContain('AI Art Director');
    });

    test('should generate context prompt for Maya', () => {
      const mayaContextPrompt = PersonalityManager.getContextPrompt('maya', 'styling');
      
      expect(mayaContextPrompt).toBeDefined();
      expect(typeof mayaContextPrompt).toBe('string');
      expect(mayaContextPrompt.length).toBeGreaterThan(50);
      expect(mayaContextPrompt).toContain('Maya');
    });

    test('should handle invalid agent gracefully', () => {
      const invalidPrompt = PersonalityManager.getNaturalPrompt('invalid-agent');
      
      expect(invalidPrompt).toBeDefined();
      expect(typeof invalidPrompt).toBe('string');
      expect(invalidPrompt).toContain('helpful AI assistant');
    });
  });

  describe('FLUX Parameters', () => {
    test('should handle missing FLUX configuration gracefully', () => {
      expect(() => {
        PersonalityManager.getFluxParameters('maya', 'halfBodyShot');
      }).toThrow('Maya FLUX optimization configuration missing');
    });

    test('should throw error for non-Maya agent', () => {
      expect(() => {
        PersonalityManager.getFluxParameters('elena', 'halfBodyShot');
      }).toThrow('FLUX parameters only available for Maya');
    });
  });

  describe('Coaching Configuration', () => {
    test('should handle missing coaching configuration gracefully', () => {
      expect(() => {
        PersonalityManager.getCoachingConfig('maya');
      }).toThrow('Maya coaching configuration missing');
    });

    test('should throw error for non-Maya agent', () => {
      expect(() => {
        PersonalityManager.getCoachingConfig('elena');
      }).toThrow('Coaching configuration only available for Maya');
    });
  });

  describe('Context Preservation', () => {
    test('should preserve context for meaningful messages', () => {
      const shouldPreserve = PersonalityManager.shouldPreserveContext('This is a meaningful message about styling');
      expect(shouldPreserve).toBe(true);
    });

    test('should not preserve context for short messages', () => {
      const shouldPreserve = PersonalityManager.shouldPreserveContext('Hi');
      expect(shouldPreserve).toBe(false);
    });
  });
});

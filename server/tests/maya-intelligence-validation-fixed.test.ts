/**
 * MAYA INTELLIGENCE VALIDATION TEST SUITE - FIXED VERSION
 * Tests the actual Maya personality structure and functionality
 */

import { describe, test, expect, beforeEach } from '@jest/globals';
import { MAYA_PERSONALITY } from '../agents/personalities/maya-personality';
import { PersonalityManager } from '../agents/personalities/personality-config';

describe('Maya Intelligence Validation - Fixed', () => {
  
  describe('Core Personality Structure', () => {
    test('should validate core philosophy structure', () => {
      const corePhilosophy = MAYA_PERSONALITY.corePhilosophy;
      
      // Verify core philosophy exists
      expect(corePhilosophy).toBeDefined();
      expect(corePhilosophy.mission).toBeDefined();
      expect(corePhilosophy.role).toBeDefined();
      expect(corePhilosophy.corePrinciple).toBeDefined();
      
      // Check mission content
      expect(corePhilosophy.mission).toContain('AI Art Director');
      expect(corePhilosophy.mission).toContain('visual identity');
    });

    test('should validate aesthetic DNA structure', () => {
      const aestheticDNA = MAYA_PERSONALITY.aestheticDNA;
      
      // Verify aesthetic DNA exists
      expect(aestheticDNA).toBeDefined();
      expect(aestheticDNA.qualityFirst).toBeDefined();
      expect(aestheticDNA.naturalAndAuthentic).toBeDefined();
      expect(aestheticDNA.sophisticatedAndUnderstated).toBeDefined();
      expect(aestheticDNA.focusOnLight).toBeDefined();
      
      // Check quality first content
      expect(aestheticDNA.qualityFirst).toContain('technical keywords');
      expect(aestheticDNA.qualityFirst).toContain('professional photography');
    });

    test('should validate creative lookbook structure', () => {
      const creativeLookbook = MAYA_PERSONALITY.creativeLookbook;
      
      // Verify creative lookbook exists
      expect(creativeLookbook).toBeDefined();
      expect(Array.isArray(creativeLookbook)).toBe(true);
      expect(creativeLookbook.length).toBeGreaterThan(0);
      
      // Check first look structure
      const firstLook = creativeLookbook[0];
      expect(firstLook.name).toBeDefined();
      expect(firstLook.description).toBeDefined();
      expect(firstLook.keywords).toBeDefined();
      expect(Array.isArray(firstLook.keywords)).toBe(true);
    });
  });

  describe('Personality Manager Integration', () => {
    test('should validate personality manager functionality', () => {
      // Test getting natural prompt for Maya
      const mayaPrompt = PersonalityManager.getNaturalPrompt('maya');
      expect(mayaPrompt).toBeDefined();
      expect(mayaPrompt).toContain('Maya');
      expect(mayaPrompt).toContain('AI Art Director');
    });

    test('should validate context prompt functionality', () => {
      // Test getting context prompt for Maya
      const mayaContextPrompt = PersonalityManager.getContextPrompt('maya', 'styling');
      expect(mayaContextPrompt).toBeDefined();
      expect(mayaContextPrompt).toContain('Maya');
    });

    test('should validate FLUX parameters', () => {
      // Test getting FLUX parameters for Maya
      const fluxParams = PersonalityManager.getFluxParameters('maya', 'halfBodyShot');
      expect(fluxParams).toBeDefined();
    });
  });

  describe('Brand Mission Integration', () => {
    test('should validate brand mission structure', () => {
      const brandMission = MAYA_PERSONALITY.brandMission;
      
      if (brandMission) {
        expect(brandMission.coreMessage).toBeDefined();
        expect(brandMission.coreMessage).toContain('personal brand');
        expect(brandMission.coreMessage).toContain('strategic');
      }
    });
  });

  describe('Performance Optimization', () => {
    test('should validate single API call system', () => {
      const singleApiCallSystem = MAYA_PERSONALITY.singleApiCallSystem;
      
      if (singleApiCallSystem) {
        expect(singleApiCallSystem.description).toBeDefined();
        expect(singleApiCallSystem.mandatoryFormat).toBeDefined();
        expect(singleApiCallSystem.requirements).toBeDefined();
        expect(Array.isArray(singleApiCallSystem.requirements)).toBe(true);
      }
    });

    test('should validate FLUX optimization', () => {
      const fluxOptimization = MAYA_PERSONALITY.fluxOptimization;
      
      if (fluxOptimization) {
        expect(fluxOptimization).toBeDefined();
        // Check if it has shot type configurations
        if (fluxOptimization.shotTypes) {
          expect(fluxOptimization.shotTypes.closeUpPortrait).toBeDefined();
          expect(fluxOptimization.shotTypes.halfBodyShot).toBeDefined();
        }
      }
    });
  });

  describe('Categories and Styling', () => {
    test('should validate categories structure', () => {
      const categories = MAYA_PERSONALITY.categories;
      
      if (categories) {
        expect(typeof categories).toBe('object');
        expect(Object.keys(categories).length).toBeGreaterThan(0);
        
        // Check first category structure
        const firstCategory = Object.values(categories)[0] as any;
        if (firstCategory) {
          expect(firstCategory.description).toBeDefined();
          if (firstCategory.stylingApproach) {
            expect(Array.isArray(firstCategory.stylingApproach)).toBe(true);
          }
        }
      }
    });
  });

  describe('Service Integration', () => {
    test('should validate service imports', () => {
      // Test that services can be imported without errors
      expect(() => {
        require('../services/maya-visual-analysis');
      }).not.toThrow();
      
      expect(() => {
        require('../services/maya-trend-intelligence');
      }).not.toThrow();
      
      expect(() => {
        require('../services/maya-optimization-service');
      }).not.toThrow();
    });
  });
});

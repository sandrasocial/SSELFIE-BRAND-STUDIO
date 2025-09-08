/**
 * PHASE 3 TEST: Brand Voice Text Generation Testing Service
 * Tests Maya's brand voice text generation with real user data
 */

import { storage } from '../storage';
import { PersonalityManager } from '../agents/personalities/personality-config';

export class BrandTextGenerationTester {
  
  /**
   * Test Maya's text generation with real user context
   */
  async testUserTextGeneration(userId: string, messageType: 'motivational' | 'business' | 'lifestyle') {
    try {
      console.log(`🧪 TESTING: Brand text generation for user ${userId}`);
      
      // Get user's actual brand context
      const user = await storage.getUser(userId);
      if (!user) {
        throw new Error('User not found for testing');
      }

      const userContext = {
        profession: user.profession || 'entrepreneur',
        brandStyle: user.brandStyle || 'professional', 
        photoGoals: user.photoGoals || 'business',
        industry: user.profession || 'business'
      };

      console.log('📊 USER CONTEXT:', userContext);

      // Test Maya's brand voice generation
      const contextPrompt = `
Generate 5 branded text overlay options for a ${messageType} social media post.

User Context:
- Profession: ${userContext.profession}
- Brand Style: ${userContext.brandStyle}
- Photo Goals: ${userContext.photoGoals}
- Platform: instagram

Requirements:
- Match their brand voice and industry
- Use luxury typography style (Times New Roman feeling)
- Keep each option under 4 words for visual impact
- Use uppercase for luxury brand aesthetic
- Ensure authenticity to their business personality

Return 5 options that feel genuinely aligned with their brand.
`;

      const mayaResponse = await PersonalityManager.getNaturalPrompt(
        'maya',
        contextPrompt,
        { context: 'feed_design', userId }
      );

      console.log('✨ MAYA RESPONSE:', mayaResponse);

      // Test fallback system too
      const fallbackOptions = this.generateFallbackTextOptions(messageType, userContext);
      console.log('🔄 FALLBACK OPTIONS:', fallbackOptions);

      return {
        success: true,
        userContext,
        mayaResponse,
        fallbackOptions,
        messageType
      };

    } catch (error) {
      console.error('❌ TEXT GENERATION TEST ERROR:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Test text generation for multiple message types
   */
  async testAllMessageTypes(userId: string) {
    const messageTypes: Array<'motivational' | 'business' | 'lifestyle'> = [
      'motivational', 'business', 'lifestyle'
    ];

    const results = {};
    
    for (const messageType of messageTypes) {
      console.log(`\n🎯 Testing ${messageType} messaging...`);
      results[messageType] = await this.testUserTextGeneration(userId, messageType);
    }

    return results;
  }

  /**
   * Fallback text generation (same as in routes)
   */
  private generateFallbackTextOptions(messageType: string, userContext: any) {
    const { profession } = userContext;
    
    const textLibrary = {
      motivational: {
        coaching: ["UNLOCK potential", "BREAKTHROUGH moment", "EMPOWER yourself", "CREATE change"],
        consulting: ["EXPERT solutions", "STRATEGIC thinking", "RESULTS driven", "TRANSFORM business"],
        entrepreneur: ["BOSS moves", "BUILD empire", "SCALE success", "DREAM big"],
        creative: ["ARTISTIC vision", "INSPIRE creativity", "UNIQUE perspective", "DESIGN thinking"],
        default: ["LEVEL up", "TRUST process", "STAY focused", "CHOOSE growth"]
      },
      business: {
        coaching: ["PROVEN methods", "AUTHENTIC growth", "MINDSET shifts", "DISCOVER strength"],
        consulting: ["STRATEGIC insights", "OPTIMIZE performance", "ELEVATE strategy", "DELIVER value"],
        entrepreneur: ["GROWTH mindset", "BUSINESS vision", "ACHIEVE goals", "HUSTLE smart"],
        creative: ["INNOVATIVE ideas", "BEAUTIFUL possibilities", "CREATIVE expression", "INSPIRE others"],
        default: ["PROFESSIONAL excellence", "QUALITY first", "TRUST experience", "RESULTS matter"]
      },
      lifestyle: {
        default: ["LIVE beautifully", "STYLE matters", "MOMENTS count", "GRACE daily", "LUXURY mindset"]
      }
    };

    const categoryOptions = textLibrary[messageType] || textLibrary.motivational;
    const professionKey = profession?.toLowerCase() || 'default';
    
    return categoryOptions[professionKey] || categoryOptions.default || categoryOptions[Object.keys(categoryOptions)[0]];
  }

  /**
   * Test with sample user contexts
   */
  async testSampleScenarios() {
    const sampleContexts = [
      {
        profession: 'business coach',
        brandStyle: 'authentic',
        photoGoals: 'Instagram and social media',
        industry: 'coaching'
      },
      {
        profession: 'marketing consultant', 
        brandStyle: 'professional',
        photoGoals: 'LinkedIn and professional networking',
        industry: 'consulting'
      },
      {
        profession: 'creative director',
        brandStyle: 'innovative',
        photoGoals: 'Creative portfolio',
        industry: 'creative'
      }
    ];

    console.log('\n🧪 TESTING SAMPLE SCENARIOS...\n');

    for (let i = 0; i < sampleContexts.length; i++) {
      const context = sampleContexts[i];
      console.log(`📋 Scenario ${i + 1}: ${context.profession} - ${context.brandStyle}`);
      
      const fallbackResults = {
        motivational: this.generateFallbackTextOptions('motivational', context),
        business: this.generateFallbackTextOptions('business', context),
        lifestyle: this.generateFallbackTextOptions('lifestyle', context)
      };

      console.log('💡 Generated Text Options:', fallbackResults);
      console.log('─'.repeat(50));
    }
  }
}

// Export singleton instance
export const brandTextTester = new BrandTextGenerationTester();
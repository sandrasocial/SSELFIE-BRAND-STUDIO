/**
 * PHASE 3D: Automatic Text Overlay Service
 * Production system for high-quality branded post generation
 * Integrates Maya AI with Sharp/Canvas rendering and S3 storage
 */

import { canvasTextOverlayService } from './canvas-text-overlay-service';
import { storage } from '../storage';
import { PersonalityManager } from '../agents/personalities/personality-manager';

export interface AutoTextOverlayRequest {
  userId: string;
  imageUrl: string;
  messageType: 'motivational' | 'business' | 'lifestyle' | 'educational' | 'behind_scenes';
  platform: 'instagram' | 'linkedin' | 'facebook' | 'twitter';
  brandColorOverride?: string;
  customText?: string;
  regenerateVariation?: boolean;
}

export interface AutoTextOverlayResult {
  brandedPostUrl: string;
  brandedPostId: string;
  originalImageUrl: string;
  generatedText: string;
  overlaySettings: any;
  userBrandContext: any;
  processingTime: number;
  qualityScore: number;
}

export class AutomaticTextOverlayService {
  private personalityManager: PersonalityManager;
  
  constructor() {
    this.personalityManager = new PersonalityManager();
  }

  /**
   * Main function: Fully automatic branded post creation
   * Analyzes image → Generates brand-appropriate text → Creates final post
   */
  async createAutomaticBrandedPost(request: AutoTextOverlayRequest): Promise<AutoTextOverlayResult> {
    const startTime = Date.now();
    
    try {
      console.log('🤖 AUTO OVERLAY: Starting automatic branded post creation');
      
      // 1. Get user's brand context
      const user = await storage.getUser(request.userId);
      if (!user) {
        throw new Error('User not found');
      }
      
      const userBrandContext = {
        profession: user.profession || 'entrepreneur',
        brandStyle: user.brandStyle || 'professional',
        photoGoals: user.photoGoals || 'business',
        industry: user.profession || 'business'
      };
      
      // 2. Generate or use provided text
      let textToUse: string;
      
      if (request.customText) {
        textToUse = request.customText;
        console.log('📝 AUTO OVERLAY: Using custom text provided');
      } else {
        textToUse = await this.generateOptimalText(userBrandContext, request.messageType, request.regenerateVariation);
        console.log('🧠 AUTO OVERLAY: Generated brand-appropriate text');
      }
      
      // 3. Analyze image for optimal placement
      const imageAnalysis = await canvasTextOverlayService.analyzeImageForTextPlacement(request.imageUrl);
      console.log('🔍 AUTO OVERLAY: Analyzed image for text placement');
      
      // 4. Generate platform-optimized overlay settings
      const optimizedSettings = this.generatePlatformOptimizedSettings(
        imageAnalysis,
        request.platform,
        userBrandContext,
        request.brandColorOverride
      );
      
      // 5. Create final branded post
      const brandedPostUrl = await canvasTextOverlayService.createBrandedPost(
        request.imageUrl,
        textToUse,
        userBrandContext,
        optimizedSettings
      );
      
      // 6. Save to database
      const brandedPost = await storage.createBrandedPost({
        userId: request.userId,
        templateId: null,
        originalImageUrl: request.imageUrl,
        processedImageUrl: brandedPostUrl,
        textOverlay: textToUse,
        overlayPosition: optimizedSettings.position,
        overlayStyle: JSON.stringify(optimizedSettings),
        socialPlatform: request.platform,
        engagementData: null,
        isPublished: false
      });
      
      // 7. Calculate quality score
      const qualityScore = this.calculateQualityScore(imageAnalysis, textToUse, optimizedSettings);
      
      const processingTime = Date.now() - startTime;
      console.log(`✅ AUTO OVERLAY: Completed in ${processingTime}ms with quality score ${qualityScore}`);
      
      return {
        brandedPostUrl,
        brandedPostId: brandedPost.id,
        originalImageUrl: request.imageUrl,
        generatedText: textToUse,
        overlaySettings: optimizedSettings,
        userBrandContext,
        processingTime,
        qualityScore
      };
      
    } catch (error) {
      console.error('❌ AUTO OVERLAY ERROR:', error);
      throw new Error(`Automatic text overlay failed: ${error.message}`);
    }
  }

  /**
   * Generate optimal text using Maya's brand voice intelligence
   */
  private async generateOptimalText(
    userBrandContext: any,
    messageType: string,
    regenerateVariation: boolean = false
  ): Promise<string> {
    try {
      // Use Maya's personality to generate brand-appropriate text
      const prompt = this.buildTextGenerationPrompt(userBrandContext, messageType, regenerateVariation);
      
      const response = await this.personalityManager.processRequest('maya', {
        message: prompt,
        context: {
          userBrandContext,
          messageType,
          isTextGeneration: true,
          regenerateVariation
        }
      });
      
      // Extract text from Maya's response
      const generatedText = this.extractTextFromMayaResponse(response, messageType);
      
      return generatedText;
      
    } catch (error) {
      console.error('Text generation error:', error);
      
      // Fallback to predefined options based on context
      return this.getFallbackText(userBrandContext, messageType);
    }
  }

  /**
   * Build intelligent prompt for Maya text generation
   */
  private buildTextGenerationPrompt(userBrandContext: any, messageType: string, regenerateVariation: boolean): string {
    const { profession, brandStyle, photoGoals } = userBrandContext;
    
    let contextDescription = `Generate a ${messageType} text overlay for ${profession || 'entrepreneur'} with ${brandStyle || 'professional'} brand style for ${photoGoals || 'social media'}`;
    
    if (regenerateVariation) {
      contextDescription += '. Create a fresh variation with different wording but same energy and brand voice';
    }
    
    return `${contextDescription}. Text should be:
- Maximum 4-6 words for impact
- ALL CAPS for luxury aesthetic
- Brand-appropriate for ${profession || 'business professional'}
- ${messageType === 'motivational' ? 'Inspiring and empowering' : messageType === 'business' ? 'Professional and authoritative' : 'Authentic and lifestyle-focused'}
- Perfect for ${photoGoals?.includes('Instagram') ? 'Instagram' : photoGoals?.includes('LinkedIn') ? 'LinkedIn' : 'social media'}

Provide just the text overlay, nothing else.`;
  }

  /**
   * Extract clean text from Maya's response
   */
  private extractTextFromMayaResponse(response: any, messageType: string): string {
    if (typeof response === 'string') {
      // Extract text in quotes or all caps
      const quotedMatch = response.match(/"([^"]+)"/);
      if (quotedMatch) return quotedMatch[1];
      
      const capsMatch = response.match(/([A-Z\s]{3,20})/);
      if (capsMatch) return capsMatch[1].trim();
      
      return response.trim();
    }
    
    return this.getFallbackText({ profession: 'entrepreneur' }, messageType);
  }

  /**
   * Fallback text generation for reliability
   */
  private getFallbackText(userBrandContext: any, messageType: string): string {
    const { profession } = userBrandContext;
    
    const fallbackTexts = {
      motivational: {
        coach: ['UNLOCK POTENTIAL', 'BREAKTHROUGH MOMENT', 'EMPOWER YOURSELF'],
        consultant: ['STRATEGIC THINKING', 'EXPERT SOLUTIONS', 'RESULTS DRIVEN'],
        entrepreneur: ['BOSS MOVES', 'BUILD EMPIRE', 'SCALE SUCCESS'],
        default: ['LEVEL UP', 'TRUST PROCESS', 'CHOOSE GROWTH']
      },
      business: {
        coach: ['PROVEN METHODS', 'AUTHENTIC GROWTH', 'MINDSET SHIFTS'],
        consultant: ['STRATEGIC INSIGHTS', 'OPTIMIZE PERFORMANCE', 'DELIVER VALUE'],
        entrepreneur: ['GROWTH MINDSET', 'BUSINESS VISION', 'ACHIEVE GOALS'],
        default: ['PROFESSIONAL EXCELLENCE', 'QUALITY FIRST', 'RESULTS MATTER']
      },
      lifestyle: {
        default: ['LIVE BEAUTIFULLY', 'STYLE MATTERS', 'MOMENTS COUNT', 'GRACE DAILY']
      }
    };
    
    const messageTexts = fallbackTexts[messageType] || fallbackTexts.motivational;
    const professionKey = profession?.toLowerCase().includes('coach') ? 'coach' :
                         profession?.toLowerCase().includes('consult') ? 'consultant' :
                         profession?.toLowerCase().includes('entrepreneur') ? 'entrepreneur' : 'default';
    
    const options = messageTexts[professionKey] || messageTexts.default || messageTexts[Object.keys(messageTexts)[0]];
    
    return options[Math.floor(Math.random() * options.length)];
  }

  /**
   * Generate platform-optimized overlay settings
   */
  private generatePlatformOptimizedSettings(
    imageAnalysis: any,
    platform: string,
    userBrandContext: any,
    brandColorOverride?: string
  ): any {
    const baseSettings = {
      position: imageAnalysis.recommendedPosition || 'lower-third',
      overlayType: imageAnalysis.recommendedOverlay || 'dark',
      overlayOpacity: imageAnalysis.recommendedOverlay === 'dark' ? 0.4 : 0.5,
      fontSize: 48,
      fontFamily: 'Times New Roman',
      fontWeight: 'bold',
      textColor: imageAnalysis.recommendedOverlay === 'dark' ? '#FFFFFF' : '#000000'
    };

    // Platform-specific optimizations
    switch (platform) {
      case 'instagram':
        baseSettings.fontSize = 52; // Larger for mobile viewing
        baseSettings.position = 'lower-third'; // Instagram standard
        break;
      case 'linkedin':
        baseSettings.fontSize = 44; // More conservative
        baseSettings.overlayOpacity *= 0.8; // Subtle professional look
        break;
      case 'facebook':
        baseSettings.fontSize = 48; // Balanced
        break;
      case 'twitter':
        baseSettings.fontSize = 50; // Medium impact
        baseSettings.position = 'center'; // Twitter crop-friendly
        break;
    }

    // Brand style adjustments
    if (userBrandContext.brandStyle === 'luxury') {
      baseSettings.fontSize += 4;
      baseSettings.overlayOpacity += 0.1;
    } else if (userBrandContext.brandStyle === 'minimal') {
      baseSettings.overlayOpacity -= 0.1;
      baseSettings.fontSize -= 2;
    }

    // Brand color override
    if (brandColorOverride) {
      baseSettings.textColor = brandColorOverride;
      baseSettings.overlayType = 'brand-color';
    }

    return baseSettings;
  }

  /**
   * Calculate quality score for the generated post
   */
  private calculateQualityScore(imageAnalysis: any, text: string, overlaySettings: any): number {
    let score = 0.7; // Base score
    
    // Text quality factors
    if (text.length >= 3 && text.length <= 20) score += 0.1; // Good length
    if (text.match(/^[A-Z\s]+$/)) score += 0.1; // All caps luxury style
    if (text.split(' ').length <= 6) score += 0.05; // Concise
    
    // Image analysis factors
    if (imageAnalysis.brightness !== undefined) {
      const brightnessOptimal = imageAnalysis.brightness > 50 && imageAnalysis.brightness < 200;
      if (brightnessOptimal) score += 0.05;
    }
    
    // Overlay optimization factors
    if (overlaySettings.overlayOpacity >= 0.3 && overlaySettings.overlayOpacity <= 0.6) score += 0.05;
    if (overlaySettings.fontSize >= 44 && overlaySettings.fontSize <= 56) score += 0.05;
    
    return Math.min(score, 1.0); // Cap at 1.0
  }

  /**
   * Batch process multiple images for a user
   */
  async batchCreateBrandedPosts(
    userId: string,
    imageUrls: string[],
    messageType: string,
    platform: string
  ): Promise<AutoTextOverlayResult[]> {
    const results: AutoTextOverlayResult[] = [];
    
    for (const imageUrl of imageUrls) {
      try {
        const result = await this.createAutomaticBrandedPost({
          userId,
          imageUrl,
          messageType: messageType as any,
          platform: platform as any
        });
        results.push(result);
      } catch (error) {
        console.error(`Batch processing error for ${imageUrl}:`, error);
      }
    }
    
    return results;
  }
}

// Export singleton instance
export const automaticTextOverlayService = new AutomaticTextOverlayService();
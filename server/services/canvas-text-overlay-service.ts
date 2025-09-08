/**
 * PHASE 3A: Canvas Text Overlay Service
 * Core canvas system for automatic text overlay generation
 * Integrates with Maya's brand voice intelligence for luxury branded content
 */

import sharp from 'sharp';
import { createCanvas, loadImage, registerFont } from 'canvas';
import { storage } from '../storage';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { LUXURY_VISUAL_TEMPLATES, getTemplateById, generatePlaceholderFromTemplate } from '../config/visual-brand-templates.js';

export interface TextOverlayOptions {
  text: string;
  position: 'upper-third' | 'lower-third' | 'center' | 'upper-left' | 'upper-right' | 'lower-left' | 'lower-right';
  overlayType: 'dark' | 'light' | 'brand-color' | 'none';
  overlayOpacity: number; // 0.0 to 1.0
  fontSize: number;
  fontFamily: string;
  fontWeight: 'normal' | 'bold';
  textColor: string;
  brandColors?: string[];
  visualTemplate?: string; // Template ID for luxury styling
}

export interface ImageAnalysis {
  dominantColors: string[];
  brightness: number; // 0-255
  hasTextAreas: boolean;
  recommendedPosition: string;
  recommendedOverlay: 'dark' | 'light';
}

export class CanvasTextOverlayService {
  private s3Client: S3Client;
  
  constructor() {
    this.s3Client = new S3Client({
      region: process.env.AWS_REGION || 'eu-north-1',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!
      }
    });
  }

  /**
   * Main function: Create branded post with text overlay
   */
  async createBrandedPost(
    baseImageUrl: string,
    text: string,
    userBrandContext: any,
    options: Partial<TextOverlayOptions> = {}
  ): Promise<string> {
    try {
      console.log('🎨 CANVAS: Creating branded post with text overlay');
      
      // NO STOCK PHOTOS RULE: Only use user's actual photos
      if (!baseImageUrl || baseImageUrl.includes('stock') || baseImageUrl.includes('placeholder')) {
        console.log('🚫 NO STOCK PHOTOS: Creating branded graphic with template colors');
        return this.createBrandedGraphic(text, userBrandContext, options);
      }
      
      // 1. Analyze image for optimal text placement
      const imageAnalysis = await this.analyzeImageForTextPlacement(baseImageUrl);
      
      // 2. Generate optimal overlay options based on analysis
      const overlayOptions = this.generateOverlayOptions(imageAnalysis, userBrandContext, options);
      
      // 3. Create canvas composition
      const composedImageBuffer = await this.composeImageWithText(
        baseImageUrl,
        text,
        overlayOptions
      );
      
      // 4. Upload to S3 and return URL
      const finalImageUrl = await this.uploadToS3(composedImageBuffer, 'branded-post');
      
      console.log('✅ CANVAS: Branded post created successfully');
      return finalImageUrl;
      
    } catch (error) {
      console.error('❌ CANVAS ERROR:', error);
      throw new Error(`Failed to create branded post: ${error.message}`);
    }
  }

  /**
   * Create branded graphic using template colors (NO STOCK PHOTOS RULE)
   */
  async createBrandedGraphic(
    text: string,
    userBrandContext: any,
    options: Partial<TextOverlayOptions> = {}
  ): Promise<string> {
    try {
      console.log('🎨 CREATING BRANDED GRAPHIC: No user photos, using template colors');
      
      // Get visual template or fallback
      const visualTemplate = options.visualTemplate ? getTemplateById(options.visualTemplate) : null;
      
      if (!visualTemplate) {
        console.log('⚠️ No visual template provided, using elegant default');
      }

      // Generate template-based styling  
      const styling = visualTemplate 
        ? generatePlaceholderFromTemplate(visualTemplate, text)
        : {
            backgroundColor: '#1C1C1C', // Elegant dark luxury default
            textColor: '#FFFFFF',
            overlayColor: 'rgba(0, 0, 0, 0.4)',
            fontFamily: 'Times New Roman',
            fontWeight: 'bold',
            letterSpacing: '0.05em',
            textTransform: 'uppercase'
          };

      // Create luxury branded canvas
      const canvas = createCanvas(1080, 1080); // Instagram square format
      const ctx = canvas.getContext('2d');

      // 1. Apply sophisticated background
      this.createLuxuryBackground(ctx, canvas.width, canvas.height, styling);

      // 2. Configure luxury typography
      ctx.font = `${styling.fontWeight} 48px "${styling.fontFamily}", serif`;
      ctx.fillStyle = styling.textColor;
      ctx.textAlign = 'center';
      ctx.letterSpacing = styling.letterSpacing;

      // 3. Apply text transform
      const displayText = styling.textTransform === 'uppercase' ? text.toUpperCase() : text;

      // 4. Draw text with luxury spacing
      this.drawLuxuryText(ctx, displayText, canvas.width, canvas.height, styling);

      // 5. Create branded buffer and upload
      const brandedBuffer = canvas.toBuffer('image/jpeg', { quality: 0.95 });
      const finalImageUrl = await this.uploadToS3(brandedBuffer, 'branded-graphic');
      
      console.log('✅ BRANDED GRAPHIC: Created elegant template-based graphic');
      return finalImageUrl;
      
    } catch (error) {
      console.error('❌ BRANDED GRAPHIC ERROR:', error);
      throw new Error(`Failed to create branded graphic: ${error.message}`);
    }
  }

  /**
   * Create luxury background using template colors
   */
  private createLuxuryBackground(
    ctx: any,
    width: number,
    height: number,
    styling: any
  ): void {
    // Sophisticated gradient background
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, styling.backgroundColor);
    gradient.addColorStop(0.5, this.adjustColorBrightness(styling.backgroundColor, 10));
    gradient.addColorStop(1, this.adjustColorBrightness(styling.backgroundColor, -10));
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
    
    // Add subtle texture overlay for luxury feel
    ctx.fillStyle = styling.overlayColor;
    ctx.fillRect(0, 0, width, height);
  }

  /**
   * Draw luxury typography with optimal spacing
   */
  private drawLuxuryText(
    ctx: any,
    text: string,
    width: number,
    height: number,
    styling: any
  ): void {
    // Calculate optimal text positioning
    const centerX = width / 2;
    const centerY = height / 2;
    
    // Word wrapping for long text
    const words = text.split(' ');
    const maxWidth = width * 0.8; // 80% of canvas width
    let lines: string[] = [];
    let currentLine = '';
    
    words.forEach(word => {
      const testLine = currentLine + (currentLine ? ' ' : '') + word;
      const metrics = ctx.measureText(testLine);
      
      if (metrics.width > maxWidth && currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    });
    
    if (currentLine) {
      lines.push(currentLine);
    }
    
    // Draw lines with luxury spacing
    const lineHeight = 60;
    const totalHeight = lines.length * lineHeight;
    const startY = centerY - (totalHeight / 2) + (lineHeight / 2);
    
    lines.forEach((line, index) => {
      const y = startY + (index * lineHeight);
      
      // Add subtle text shadow for depth
      ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
      ctx.shadowBlur = 4;
      ctx.shadowOffsetX = 2;
      ctx.shadowOffsetY = 2;
      
      ctx.fillText(line, centerX, y);
    });
    
    // Reset shadow
    ctx.shadowColor = 'transparent';
  }

  /**
   * Utility: Adjust color brightness for gradients
   */
  private adjustColorBrightness(color: string, percent: number): string {
    // Simple brightness adjustment for hex colors
    if (color.startsWith('#')) {
      const hex = color.slice(1);
      const num = parseInt(hex, 16);
      const amt = Math.round(2.55 * percent);
      const R = (num >> 16) + amt;
      const G = (num >> 8 & 0x00FF) + amt;
      const B = (num & 0x0000FF) + amt;
      
      return '#' + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
        (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
        (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
    }
    
    return color; // Return original if not hex
  }

  /**
   * Analyze image to determine optimal text placement and overlay
   */
  async analyzeImageForTextPlacement(imageUrl: string): Promise<ImageAnalysis> {
    try {
      // Load image with Sharp for analysis
      const imageResponse = await fetch(imageUrl);
      const imageBuffer = await imageResponse.arrayBuffer();
      const image = sharp(Buffer.from(imageBuffer));
      
      // Get image metadata and stats
      const metadata = await image.metadata();
      const stats = await image.stats();
      
      // Calculate average brightness
      const brightness = stats.channels ? 
        stats.channels.reduce((sum, channel) => sum + channel.mean, 0) / stats.channels.length : 128;
      
      // Determine dominant colors (simplified approach)
      const dominantColors = await this.extractDominantColors(image);
      
      // Analyze image for text areas (areas with low detail/noise)
      const hasTextAreas = await this.detectTextFriendlyAreas(image);
      
      // Recommend position based on analysis
      const recommendedPosition = this.recommendTextPosition(metadata.width!, metadata.height!, brightness);
      
      // Recommend overlay type based on brightness
      const recommendedOverlay = brightness > 128 ? 'dark' : 'light';
      
      return {
        dominantColors,
        brightness,
        hasTextAreas,
        recommendedPosition,
        recommendedOverlay
      };
      
    } catch (error) {
      console.error('Image analysis error:', error);
      // Fallback analysis
      return {
        dominantColors: ['#000000'],
        brightness: 128,
        hasTextAreas: true,
        recommendedPosition: 'lower-third',
        recommendedOverlay: 'dark'
      };
    }
  }

  /**
   * Generate optimal overlay options based on image analysis and brand context
   */
  private generateOverlayOptions(
    analysis: ImageAnalysis, 
    brandContext: any, 
    userOptions: Partial<TextOverlayOptions>
  ): TextOverlayOptions {
    // Apply visual template styling if available
    const visualTemplate = userOptions.visualTemplate ? getTemplateById(userOptions.visualTemplate) : null;
    
    let templateDefaults: Partial<TextOverlayOptions> = {};
    
    if (visualTemplate) {
      console.log(`🎨 TEMPLATE: Applying ${visualTemplate.name} styling`);
      templateDefaults = {
        fontFamily: visualTemplate.typography.headlineFont,
        fontWeight: visualTemplate.typography.fontWeight,
        textColor: visualTemplate.colorPalette.text,
        position: visualTemplate.positioning.preferredPosition,
        overlayType: visualTemplate.overlayStyle.type,
        overlayOpacity: visualTemplate.overlayStyle.opacity,
        brandColors: [
          visualTemplate.colorPalette.primary,
          visualTemplate.colorPalette.secondary,
          visualTemplate.colorPalette.accent
        ]
      };
    }
    
    // Default luxury typography settings (fallback)
    const defaultOptions: TextOverlayOptions = {
      text: userOptions.text || 'SAMPLE TEXT',
      position: (userOptions.position || analysis.recommendedPosition) as any,
      overlayType: userOptions.overlayType || analysis.recommendedOverlay,
      overlayOpacity: userOptions.overlayOpacity || (analysis.recommendedOverlay === 'dark' ? 0.4 : 0.5),
      fontSize: userOptions.fontSize || 48,
      fontFamily: userOptions.fontFamily || 'Times New Roman',
      fontWeight: userOptions.fontWeight || 'bold',
      textColor: userOptions.textColor || (analysis.recommendedOverlay === 'dark' ? '#FFFFFF' : '#000000'),
      brandColors: userOptions.brandColors || ['#000000', '#FFFFFF']
    };

    // Merge: defaults < template styling < provided options (provided options have highest priority)
    const finalOptions = { ...defaultOptions, ...templateDefaults, ...userOptions };

    // Adjust based on brand context
    if (brandContext?.brandStyle === 'luxury') {
      finalOptions.fontSize += 8;
      finalOptions.fontFamily = 'Times New Roman';
    } else if (brandContext?.brandStyle === 'modern') {
      finalOptions.fontFamily = 'Helvetica';
      finalOptions.fontWeight = 'normal';
    }

    return finalOptions;
  }

  /**
   * Core canvas composition function
   */
  async composeImageWithText(
    baseImageUrl: string,
    text: string,
    options: TextOverlayOptions
  ): Promise<Buffer> {
    try {
      // Load base image
      const imageResponse = await fetch(baseImageUrl);
      const imageBuffer = await imageResponse.arrayBuffer();
      const baseImage = await loadImage(Buffer.from(imageBuffer));
      
      // Create canvas with image dimensions
      const canvas = createCanvas(baseImage.width, baseImage.height);
      const ctx = canvas.getContext('2d');
      
      // Draw base image
      ctx.drawImage(baseImage, 0, 0);
      
      // Apply overlay if needed
      if (options.overlayType !== 'none') {
        this.applyOverlay(ctx, canvas.width, canvas.height, options);
      }
      
      // Configure typography
      this.configureTypography(ctx, options);
      
      // Position and draw text
      this.drawPositionedText(ctx, text, canvas.width, canvas.height, options);
      
      // Return high-quality buffer
      return canvas.toBuffer('image/jpeg', { quality: 0.95 });
      
    } catch (error) {
      console.error('Canvas composition error:', error);
      throw error;
    }
  }

  /**
   * Apply overlay for text readability
   */
  private applyOverlay(
    ctx: any,
    width: number,
    height: number,
    options: TextOverlayOptions
  ): void {
    const { position, overlayType, overlayOpacity } = options;
    
    // Calculate overlay dimensions and position
    const overlayHeight = Math.floor(height * 0.3); // 30% of image height
    let overlayY: number;
    
    switch (position) {
      case 'upper-third':
        overlayY = 0;
        break;
      case 'lower-third':
        overlayY = height - overlayHeight;
        break;
      case 'center':
        overlayY = (height - overlayHeight) / 2;
        break;
      default:
        overlayY = height - overlayHeight;
    }
    
    // Set overlay color based on type
    let overlayColor: string;
    switch (overlayType) {
      case 'dark':
        overlayColor = `rgba(0, 0, 0, ${overlayOpacity})`;
        break;
      case 'light':
        overlayColor = `rgba(255, 255, 255, ${overlayOpacity})`;
        break;
      case 'brand-color':
        // Use template's primary color if available, otherwise fallback to user brand colors
        const templateColor = options.visualTemplate ? 
          getTemplateById(options.visualTemplate)?.colorPalette.primary : 
          (options.brandColors?.[0] || '#000000');
        overlayColor = `${templateColor}${Math.round(overlayOpacity * 255).toString(16)}`;
        break;
      default:
        return;
    }
    
    // Create gradient overlay for natural look
    const gradient = ctx.createLinearGradient(0, overlayY, 0, overlayY + overlayHeight);
    gradient.addColorStop(0, overlayColor.replace(/[\d.]+\)/, '0)'));
    gradient.addColorStop(0.3, overlayColor);
    gradient.addColorStop(0.7, overlayColor);
    gradient.addColorStop(1, overlayColor.replace(/[\d.]+\)/, '0)'));
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, overlayY, width, overlayHeight);
  }

  /**
   * Configure luxury typography
   */
  private configureTypography(ctx: any, options: TextOverlayOptions): void {
    const { fontSize, fontFamily, fontWeight, textColor } = options;
    
    // Set font (Canvas font string format)
    ctx.font = `${fontWeight} ${fontSize}px "${fontFamily}", serif`;
    ctx.fillStyle = textColor;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Add text shadow for enhanced readability
    ctx.shadowColor = textColor === '#FFFFFF' ? 'rgba(0, 0, 0, 0.3)' : 'rgba(255, 255, 255, 0.3)';
    ctx.shadowBlur = 4;
    ctx.shadowOffsetX = 1;
    ctx.shadowOffsetY = 1;
  }

  /**
   * Draw text at optimal position
   */
  private drawPositionedText(
    ctx: any,
    text: string,
    width: number,
    height: number,
    options: TextOverlayOptions
  ): void {
    const { position } = options;
    
    // Calculate text position
    let x = width / 2; // Center horizontally
    let y: number;
    
    switch (position) {
      case 'upper-third':
        y = height * 0.15;
        break;
      case 'lower-third':
        y = height * 0.85;
        break;
      case 'center':
        y = height / 2;
        break;
      case 'upper-left':
        x = width * 0.15;
        y = height * 0.15;
        ctx.textAlign = 'left';
        break;
      case 'upper-right':
        x = width * 0.85;
        y = height * 0.15;
        ctx.textAlign = 'right';
        break;
      case 'lower-left':
        x = width * 0.15;
        y = height * 0.85;
        ctx.textAlign = 'left';
        break;
      case 'lower-right':
        x = width * 0.85;
        y = height * 0.85;
        ctx.textAlign = 'right';
        break;
      default:
        y = height * 0.85;
    }
    
    // Handle multi-line text
    this.drawWrappedText(ctx, text, x, y, width * 0.8);
  }

  /**
   * Draw text with automatic word wrapping
   */
  private drawWrappedText(ctx: any, text: string, x: number, y: number, maxWidth: number): void {
    const words = text.split(' ');
    const lines: string[] = [];
    let currentLine = '';
    
    for (const word of words) {
      const testLine = currentLine + (currentLine ? ' ' : '') + word;
      const metrics = ctx.measureText(testLine);
      
      if (metrics.width > maxWidth && currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }
    
    if (currentLine) {
      lines.push(currentLine);
    }
    
    // Draw each line
    const lineHeight = ctx.measureText('M').actualBoundingBoxAscent * 1.4;
    const startY = y - ((lines.length - 1) * lineHeight) / 2;
    
    lines.forEach((line, index) => {
      ctx.fillText(line, x, startY + (index * lineHeight));
    });
  }

  /**
   * Helper methods for image analysis
   */
  private async extractDominantColors(image: any): Promise<string[]> {
    // Simplified: return common colors
    // In production, could use more sophisticated color extraction
    return ['#000000', '#FFFFFF', '#808080'];
  }

  private async detectTextFriendlyAreas(image: any): Promise<boolean> {
    // Simplified: assume most images have suitable text areas
    // In production, could analyze image complexity and noise
    return true;
  }

  private recommendTextPosition(width: number, height: number, brightness: number): string {
    // Simple logic: prefer lower-third for most images
    // Could be enhanced with more sophisticated analysis
    if (height > width * 1.2) {
      return 'center'; // Vertical images
    }
    return 'lower-third'; // Horizontal/square images
  }

  /**
   * Upload final image to S3
   */
  private async uploadToS3(imageBuffer: Buffer, type: string): Promise<string> {
    const key = `branded-posts/${type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}.jpg`;
    const bucketName = process.env.AWS_S3_BUCKET || 'sselfie-training-zips';
    
    try {
      const command = new PutObjectCommand({
        Bucket: bucketName,
        Key: key,
        Body: imageBuffer,
        ContentType: 'image/jpeg',
        ACL: 'public-read'
      });
      
      await this.s3Client.send(command);
      
      const imageUrl = `https://${bucketName}.s3.${process.env.AWS_REGION || 'eu-north-1'}.amazonaws.com/${key}`;
      console.log('✅ S3 UPLOAD: Branded post uploaded successfully');
      return imageUrl;
      
    } catch (error) {
      console.error('❌ S3 UPLOAD ERROR:', error);
      throw new Error(`Failed to upload branded post: ${error.message}`);
    }
  }
}

// Export singleton instance
export const canvasTextOverlayService = new CanvasTextOverlayService();
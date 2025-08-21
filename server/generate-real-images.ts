#!/usr/bin/env tsx
// Generate REAL AI images using Sandra's trained model
import { UnifiedGenerationService } from './unified-generation-service';

async function generateRealImages() {
  console.log('🎨 GENERATING REAL AI IMAGES: Using your trained model to create actual gallery images');
  
  const userId = '42585527';
  
  // Professional editorial prompts that work with your model
  const prompts = [
    'sophisticated editorial portrait, luxury fashion styling, professional studio lighting, architectural backdrop',
    'elegant lifestyle photography, natural window lighting, minimalist aesthetic, soft textures',
    'luxury fashion editorial, dramatic shadows, premium styling, editorial magazine quality',
    'professional brand photography, golden hour lighting, sophisticated composition, luxury aesthetic',
    'editorial fashion portrait, high-end styling, natural beauty, premium brand photography',
    'luxury lifestyle editorial, sophisticated styling, architectural elements, premium quality',
    'professional fashion photography, editorial lighting, luxury brand aesthetic, sophisticated pose',
    'editorial portrait photography, natural elegance, luxury fashion styling, premium composition',
    'sophisticated brand photography, editorial quality, luxury aesthetic, professional lighting',
    'high-end editorial portrait, luxury styling, professional photography, premium brand quality'
  ];
  
  let generated = 0;
  
  for (const prompt of prompts) {
    try {
      console.log(`🔄 Generating image ${generated + 1}/10: ${prompt.substring(0, 50)}...`);
      
      const result = await UnifiedGenerationService.generateImages({
        userId,
        prompt,
        category: 'Sandra Editorial'
      });
      
      if (result.success) {
        generated++;
        console.log(`✅ Generated ${generated}/10: Image ${result.id} with prediction ${result.predictionId}`);
      } else {
        console.log(`❌ Failed to generate image: ${prompt}`);
      }
      
      // Wait a bit between generations to avoid rate limits
      await new Promise(resolve => setTimeout(resolve, 2000));
      
    } catch (error) {
      console.error(`❌ Generation error for prompt "${prompt}":`, error);
    }
  }
  
  console.log(`\n🎉 REAL IMAGE GENERATION COMPLETE: Started ${generated} image generations using your trained AI model`);
  console.log('📸 These will process in the background and appear in your gallery once complete');
  console.log('✨ Your gallery will show actual AI-generated images of you, not placeholders');
}

generateRealImages();
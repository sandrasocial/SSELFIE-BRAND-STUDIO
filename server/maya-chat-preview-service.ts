import { storage } from './storage';

/**
 * Maya Chat Preview Service
 * Handles image previews in Maya's chat interface before users save to gallery
 */
export class MayaChatPreviewService {
  
  /**
   * Save generated images as chat previews (not gallery items)
   */
  static async saveChatPreview(chatId: number, imageUrls: string[], prompt: string, predictionId: string) {
    try {
      // Save as Maya chat message with image previews
      const previewMessage = await storage.saveMayaChatMessage({
        chatId,
        role: 'maya',
        content: `🎬 **YOUR IMAGES ARE READY!** 

Here are your stunning photos! Click the heart ♡ on any image you love to save it to your gallery.

Generated with your personal AI model using Sandra's proven settings
📸 ${imageUrls.length} professional-quality images created`,
        imagePreview: JSON.stringify(imageUrls), // Store URLs as JSON
        generatedPrompt: prompt
      });

      console.log(`✅ MAYA CHAT PREVIEW: Saved ${imageUrls.length} images to chat ${chatId} as message ${previewMessage.id}`);
      return previewMessage;
      
    } catch (error) {
      console.error('❌ MAYA CHAT PREVIEW: Failed to save chat preview:', error);
      throw error;
    }
  }
  
  /**
   * Heart/Save image from Maya chat to user's gallery
   */
  static async heartImageToGallery(userId: string, imageUrl: string, prompt: string, category: string = 'Maya AI') {
    try {
      // Create permanent gallery entry when user hearts the image
      const galleryImage = await storage.saveAIImage({
        userId,
        imageUrl,
        prompt,
        category,
        status: 'completed',
        generationStatus: 'completed',
        predictionId: '', // Not needed for hearted images
        
      });

      console.log(`💖 MAYA HEART: Saved image ${galleryImage.id} to gallery for user ${userId}`);
      return galleryImage;
      
    } catch (error) {
      console.error('❌ MAYA HEART: Failed to save to gallery:', error);
      throw error;
    }
  }
}
import { storage } from './storage.js';
/**
 * Maya Chat Preview Service
 * Handles image previews in Maya's chat interface before users save to gallery
 */
export class MayaChatPreviewService {
    /**
     * Save generated images as chat previews (not gallery items)
     */
    static async saveChatPreview(chatId, imageUrls, prompt, predictionId, userId) {
        try {
            // Validate input
            if (!Array.isArray(imageUrls) || imageUrls.length === 0) {
                const error = {
                    type: 'save_preview',
                    message: 'No image URLs provided',
                    chatId
                };
                throw error;
            }
            // Save as Maya chat message with image previews
            const messageInput = {
                chatId,
                userId,
                role: 'maya',
                content: `🎬 **YOUR IMAGES ARE READY!** 

Here are your stunning photos! Click the heart ♡ on any image you love to save it to your gallery.

Generated with your personal AI model using Sandra's proven settings
📸 ${imageUrls.length} professional-quality images created`,
                imagePreview: JSON.stringify(imageUrls), // Store URLs as JSON
                generatedPrompt: prompt,
                metadata: {
                    predictionId,
                    imageCount: imageUrls.length,
                    generationType: 'ai_preview'
                }
            };
            const previewMessage = await storage.saveMayaChatMessage(messageInput);
            return previewMessage;
        }
        catch (error) {
            console.error('❌ MAYA CHAT PREVIEW: Failed to save chat preview:', error);
            const previewError = {
                type: 'save_preview',
                message: error instanceof Error ? error.message : 'Failed to save chat preview',
                chatId,
                error: error instanceof Error ? error : new Error(String(error))
            };
            throw previewError;
        }
    }
    /**
     * Heart/Save image from Maya chat to user's gallery
     */
    static async heartImageToGallery(userId, imageUrl, prompt, category = 'Maya AI') {
        try {
            // Validate inputs
            if (!userId?.trim() || !imageUrl?.trim()) {
                const error = {
                    type: 'heart_image',
                    message: 'Missing required user ID or image URL',
                    userId,
                    imageUrl
                };
                throw error;
            }
            // Create permanent gallery entry when user hearts the image
            const imageInput = {
                userId,
                imageUrl,
                prompt: prompt || 'Hearted from Maya chat',
                style: category, // Use 'style' field instead of 'category'
                generationStatus: 'completed',
                predictionId: '', // Not needed for hearted images
                isSelected: true, // CRITICAL FIX: Mark as selected so it appears in gallery
                isFavorite: true, // CRITICAL FIX: Mark as favorite so it appears in gallery
                metadata: {
                    source: 'maya_chat',
                    heartedAt: new Date().toISOString(),
                    originalCategory: category
                }
            };
            const galleryImage = await storage.saveAIImage(imageInput);
            return galleryImage;
        }
        catch (error) {
            console.error('❌ MAYA HEART: Failed to save to gallery:', error);
            const heartError = {
                type: 'heart_image',
                message: error instanceof Error ? error.message : 'Failed to save image to gallery',
                userId,
                imageUrl,
                error: error instanceof Error ? error : new Error(String(error))
            };
            throw heartError;
        }
    }
    /**
     * Validate if the provided image URL is from a chat preview
     */
    static isValidChatPreviewUrl(imageUrl) {
        return Boolean(imageUrl?.trim() && !imageUrl.includes('test.com'));
    }
}

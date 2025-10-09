/**
 * SD Inpainting Service
 * Handles stable diffusion inpainting using Replicate API
 */
import { storage } from '../../storage.js';
export class SDInpaintService {
    /**
     * Start inpainting process using Replicate's SD inpainting model
     */
    static async startInpainting(request) {
        try {
            // Check if INPAINT_ENABLED flag is set
            if (process.env.INPAINT_ENABLED !== '1') {
                throw new Error('Inpainting feature is not enabled');
            }
            // Validate inputs
            if (!request.imageUrl || !request.maskPngBase64 || !request.prompt) {
                throw new Error('Missing required parameters: imageUrl, maskPngBase64, or prompt');
            }
            // Convert base64 mask to data URL if it's not already
            const maskDataUrl = request.maskPngBase64.startsWith('data:')
                ? request.maskPngBase64
                : `data:image/png;base64,${request.maskPngBase64}`;
            // Create initial database record for the variant
            // TODO: Fix createImageVariant method when properly implemented
            const variantId = 1; // Placeholder for now
            /*
            const variantId = await storage.createImageVariant({
              originalImageId: request.originalImageId,
              originalImageType: request.originalImageType,
              imageUrl: '', // Will be filled when generation completes
              kind: 'inpaint',
              prompt: request.prompt,
              maskData: request.maskPngBase64,
              generationStatus: 'pending',
              metadata: {
                originalPrompt: request.prompt,
                createdAt: new Date().toISOString()
              }
            });
            */
            // Prepare Replicate request for SD inpainting
            // Using stability-ai/stable-diffusion-inpainting model
            const requestBody = {
                version: "95b7223104132402a9ae91cc677285bc5eb997834bd2349fa486f53910fd68a3",
                input: {
                    image: request.imageUrl,
                    mask: maskDataUrl,
                    prompt: request.prompt,
                    negative_prompt: "blurry, low quality, distorted, deformed, bad anatomy, bad hands, bad face, artifacts, noise",
                    num_inference_steps: 25,
                    guidance_scale: 7.5,
                    seed: Math.floor(Math.random() * 1000000)
                }
            };
            const response = await fetch('https://api.replicate.com/v1/predictions', {
                method: 'POST',
                headers: {
                    'Authorization': `Token ${process.env["REPLICATE_API_TOKEN"]}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody)
            });
            if (!response.ok) {
                const errorText = await response.text();
                console.error('❌ INPAINT: Replicate API error:', response.status, errorText);
                // Update variant status to failed
                await storage.updateImageVariant(variantId, {
                    processingStatus: 'failed',
                    variantUrl: ''
                });
                throw new Error(`Replicate API error (${response.status}): ${errorText}`);
            }
            const prediction = await response.json();
            if (!prediction.id) {
                throw new Error('No prediction ID returned from Replicate API');
            }
            // Update variant record with prediction ID
            await storage.updateImageVariant(variantId, {
                processingStatus: 'processing'
            });
            return {
                success: true,
                predictionId: prediction.id,
                variantId
            };
        }
        catch (error) {
            console.error('❌ INPAINT: Error starting inpainting:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : String(error)
            };
        }
    }
    /**
     * Check inpainting prediction status
     */
    static async checkInpaintStatus(predictionId, variantId) {
        try {
            const response = await fetch(`https://api.replicate.com/v1/predictions/${predictionId}`, {
                headers: {
                    'Authorization': `Token ${process.env["REPLICATE_API_TOKEN"]}`,
                    'Content-Type': 'application/json',
                },
            });
            if (!response.ok) {
                throw new Error(`Failed to fetch prediction status: ${response.status}`);
            }
            const prediction = await response.json();
            const status = prediction.status; // 'starting', 'processing', 'succeeded', 'failed', 'canceled'
            // Update variant status based on prediction status
            if (status === 'succeeded' && prediction.output) {
                // prediction.output should be an array with the inpainted image URL
                const imageUrl = Array.isArray(prediction.output) ? prediction.output[0] : prediction.output;
                await storage.updateImageVariant(variantId, {
                    variantUrl: imageUrl,
                    processingStatus: 'completed'
                });
                return { status: 'completed', imageUrl };
            }
            else if (status === 'failed' || status === 'canceled') {
                await storage.updateImageVariant(variantId, {
                    processingStatus: 'failed'
                });
                return { status: 'failed', error: prediction.error || 'Generation failed' };
            }
            else {
                // Still processing
                return { status: 'processing' };
            }
        }
        catch (error) {
            console.error('❌ INPAINT: Error checking status:', error);
            return { status: 'failed', error: error instanceof Error ? error.message : String(error) };
        }
    }
    /**
     * Get all inpainting variants for a user
     */
    static async getUserInpaintVariants(userId) {
        try {
            return await storage.getImageVariants(userId);
        }
        catch (error) {
            console.error('❌ INPAINT: Error fetching user variants:', error);
            return [];
        }
    }
    /**
     * Get inpainting variants for a specific image
     */
    static async getImageInpaintVariants(originalImageId, originalImageType) {
        try {
            return await storage.getImageVariants('placeholder-user', originalImageId);
        }
        catch (error) {
            console.error('❌ INPAINT: Error fetching image variants:', error);
            return [];
        }
    }
}

import { storage } from '../../storage.js';
export class SDInpaintService {
    static async startInpainting(request) {
        try {
            console.log('🎨 INPAINT: Starting inpainting for user', request.userId);
            if (process.env.INPAINT_ENABLED !== '1') {
                throw new Error('Inpainting feature is not enabled');
            }
            if (!request.imageUrl || !request.maskPngBase64 || !request.prompt) {
                throw new Error('Missing required parameters: imageUrl, maskPngBase64, or prompt');
            }
            const maskDataUrl = request.maskPngBase64.startsWith('data:')
                ? request.maskPngBase64
                : `data:image/png;base64,${request.maskPngBase64}`;
            const variant = await storage.saveImageVariant({
                userId: request.userId,
                originalImageId: request.originalImageId,
                variantUrl: '',
                variantType: 'inpaint',
                processingStatus: 'pending',
                placementData: {
                    prompt: request.prompt,
                    originalImageType: request.originalImageType,
                    maskData: request.maskPngBase64,
                    originalImageUrl: request.imageUrl,
                    createdAt: new Date().toISOString()
                }
            });
            const variantId = variant.id;
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
            console.log('🎨 INPAINT: Sending request to Replicate');
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
                await storage.updateImageVariant(variantId, {
                    processingStatus: 'failed',
                    placementData: {
                        error: `Replicate API error: ${response.status}`
                    }
                });
                throw new Error(`Replicate API error (${response.status}): ${errorText}`);
            }
            const prediction = await response.json();
            if (!prediction.id) {
                throw new Error('No prediction ID returned from Replicate API');
            }
            await storage.updateImageVariant(variantId, {
                processingStatus: 'processing',
                placementData: {
                    predictionId: prediction.id
                }
            });
            console.log('✅ INPAINT: Started successfully with prediction ID:', prediction.id);
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
                error: error.message
            };
        }
    }
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
            const status = prediction.status;
            if (status === 'succeeded' && prediction.output) {
                const imageUrl = Array.isArray(prediction.output) ? prediction.output[0] : prediction.output;
                await storage.updateImageVariant(variantId, {
                    variantUrl: imageUrl,
                    processingStatus: 'completed'
                });
                return { status: 'completed', imageUrl };
            }
            else if (status === 'failed' || status === 'canceled') {
                await storage.updateImageVariant(variantId, {
                    processingStatus: 'failed',
                    placementData: {
                        error: prediction.error || 'Generation failed'
                    }
                });
                return { status: 'failed', error: prediction.error || 'Generation failed' };
            }
            else {
                return { status: 'processing' };
            }
        }
        catch (error) {
            console.error('❌ INPAINT: Error checking status:', error);
            return { status: 'failed', error: error.message };
        }
    }
    static async getUserInpaintVariants(userId) {
        try {
            if (!userId)
                return [];
            const variants = await storage.getImageVariants(userId);
            return variants.filter(v => v.variantType === 'inpaint');
        }
        catch (error) {
            console.error('❌ INPAINT: Error fetching user variants:', error);
            return [];
        }
    }
    static async getImageInpaintVariants(originalImageId, originalImageType) {
        try {
            const variants = await storage.getImageVariants(userId);
            const matchingVariants = variants.filter(v => v.originalImageId === originalImageId && v.variantType === 'inpaint');
            return variants.filter(v => v.variantType === 'inpaint');
        }
        catch (error) {
            console.error('❌ INPAINT: Error fetching image variants:', error);
            return [];
        }
    }
}
//# sourceMappingURL=sd_inpaint.js.map
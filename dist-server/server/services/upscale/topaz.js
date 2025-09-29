import { TOPAZ_API_KEY } from '../../env.js';
export async function upscaleImageWithTopaz(imageUrl, scale = 2) {
    try {
        if (!TOPAZ_API_KEY) {
            return {
                error: 'Topaz unavailable',
                details: 'TOPAZ_API_KEY not configured'
            };
        }
        if (scale !== 2 && scale !== 4) {
            return {
                error: 'Invalid scale',
                details: 'Scale must be 2 or 4 for Topaz'
            };
        }
        console.log(`🎯 UPSCALE: Starting Topaz upscale (${scale}x) for: ${imageUrl}`);
        return {
            error: 'Topaz API not yet available',
            details: 'Topaz Labs does not currently offer a public API. Use Real-ESRGAN instead.'
        };
    }
    catch (error) {
        console.error('❌ UPSCALE: Topaz service error:', error);
        return {
            error: 'Upscaling failed',
            details: error.message
        };
    }
}
async function getImageDimensions(imageUrl) {
    try {
        return { width: 512, height: 640 };
    }
    catch (error) {
        console.warn('Warning: Could not determine image dimensions, using defaults');
        return { width: 512, height: 640 };
    }
}
//# sourceMappingURL=topaz.js.map
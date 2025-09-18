/**
 * REAL-ESRGAN UPSCALING SERVICE
 * Wrapper for Real-ESRGAN using Replicate API
 */

import { REPLICATE_API_TOKEN } from '../../env';
import type { UpscaleScale } from '../../config/upscale';

export interface UpscaleResult {
  url: string;
  width: number;
  height: number;
  provider: 'real_esrgan';
  scale: UpscaleScale;
}

export interface UpscaleError {
  error: string;
  details?: string;
}

/**
 * Upscale an image using Real-ESRGAN via Replicate
 */
export async function upscaleImageWithRealESRGAN(
  imageUrl: string,
  scale: UpscaleScale = 2
): Promise<UpscaleResult | UpscaleError> {
  try {
    if (!REPLICATE_API_TOKEN) {
      return { 
        error: 'Real-ESRGAN unavailable', 
        details: 'REPLICATE_API_TOKEN not configured' 
      };
    }

    // Validate scale
    if (scale !== 2 && scale !== 4) {
      return { 
        error: 'Invalid scale', 
        details: 'Scale must be 2 or 4 for Real-ESRGAN' 
      };
    }

    console.log(`🎯 UPSCALE: Starting Real-ESRGAN upscale (${scale}x) for: ${imageUrl}`);
    
    // Create Replicate prediction for Real-ESRGAN
    const response = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${REPLICATE_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        version: "42fed1c4974146d4d2414e2be2c5277c7fcf05fcc972f6b188635b30c0b04bf8", // Real-ESRGAN x4plus model
        input: {
          image: imageUrl,
          scale: scale
        }
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('❌ UPSCALE: Replicate API error:', errorData);
      return { 
        error: 'Replicate API error', 
        details: `Status: ${response.status}` 
      };
    }

    const prediction = await response.json();
    console.log(`🔄 UPSCALE: Real-ESRGAN prediction created: ${prediction.id}`);

    // Poll for completion
    const result = await pollReplicatePrediction(prediction.id);
    if ('error' in result) {
      return result;
    }

    // Get original image dimensions to calculate new dimensions
    const originalDimensions = await getImageDimensions(imageUrl);
    
    return {
      url: result.output,
      width: originalDimensions.width * scale,
      height: originalDimensions.height * scale,
      provider: 'real_esrgan',
      scale
    };

  } catch (error: any) {
    console.error('❌ UPSCALE: Real-ESRGAN service error:', error);
    return { 
      error: 'Upscaling failed', 
      details: error.message 
    };
  }
}

/**
 * Poll Replicate prediction until complete
 */
async function pollReplicatePrediction(predictionId: string): Promise<{ output: string } | UpscaleError> {
  const maxAttempts = 30; // 5 minutes max (10s intervals)
  const pollInterval = 10000; // 10 seconds

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      const response = await fetch(`https://api.replicate.com/v1/predictions/${predictionId}`, {
        headers: {
          'Authorization': `Token ${REPLICATE_API_TOKEN}`,
        }
      });

      if (!response.ok) {
        return { 
          error: 'Failed to check prediction status',
          details: `Status: ${response.status}`
        };
      }

      const prediction = await response.json();
      console.log(`🔄 UPSCALE: Prediction ${predictionId} status: ${prediction.status}`);

      if (prediction.status === 'succeeded' && prediction.output) {
        console.log(`✅ UPSCALE: Real-ESRGAN completed: ${prediction.output}`);
        return { output: prediction.output };
      }

      if (prediction.status === 'failed') {
        return { 
          error: 'Upscaling failed',
          details: prediction.error || 'Real-ESRGAN processing failed'
        };
      }

      if (prediction.status === 'canceled') {
        return { 
          error: 'Upscaling canceled',
          details: 'Prediction was canceled'
        };
      }

      // Still processing, wait and continue
      if (attempt < maxAttempts - 1) {
        await new Promise(resolve => setTimeout(resolve, pollInterval));
      }

    } catch (error: any) {
      console.error(`❌ UPSCALE: Polling error (attempt ${attempt + 1}):`, error);
      if (attempt === maxAttempts - 1) {
        return { 
          error: 'Polling failed',
          details: error.message
        };
      }
    }
  }

  return { 
    error: 'Upscaling timeout',
    details: 'Processing took too long'
  };
}

/**
 * Get image dimensions from URL
 */
async function getImageDimensions(imageUrl: string): Promise<{ width: number; height: number }> {
  try {
    // For now, return sensible defaults
    // In production, you might want to actually fetch and analyze the image
    return { width: 512, height: 640 }; // Standard portrait dimensions
  } catch (error) {
    console.warn('Warning: Could not determine image dimensions, using defaults');
    return { width: 512, height: 640 };
  }
}
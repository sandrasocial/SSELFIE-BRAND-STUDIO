import fetch from 'node-fetch';

export interface VeoGenerationMode {
  mode: 'preview' | 'production';
}

export interface VeoQualityPreset {
  maxDurationSeconds: number;
  resolution: string;
  steps: number;
  description: string;
}

export interface VeoGenerationOptions {
  motionPrompt: string;
  mode: 'preview' | 'production';
  audioScript?: string;
  initImageUrl?: string;
  userId: string;
  aspectRatio?: '16:9' | '9:16' | '1:1';
}

export interface VeoGenerationResult {
  jobId: string;
  provider: 'google';
  estimatedTime: string;
  audioWarning?: string;
}

export interface VeoStatusResult {
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress?: number;
  videoUrl?: string | null;
  error?: string | null;
  estimatedTime?: string | null;
  createdAt?: string;
  completedAt?: string;
}

// Quality presets for different modes
const QUALITY_PRESETS: Record<VeoGenerationOptions['mode'], VeoQualityPreset> = {
  preview: {
    maxDurationSeconds: 5,
    resolution: '720p',
    steps: 20,
    description: 'Fast preview generation (5s max, lower quality)'
  },
  production: {
    maxDurationSeconds: 30,
    resolution: '1080p', 
    steps: 50,
    description: 'High-quality production video (30s max, full quality)'
  }
};

/**
 * Generate video using Google VEO 3 with enhanced options
 */
export async function generateVeo3Video(options: VeoGenerationOptions): Promise<VeoGenerationResult> {
  const { motionPrompt, mode, audioScript, initImageUrl, userId, aspectRatio = '9:16' } = options;

  if (!process.env.GOOGLE_API_KEY) {
    throw new Error('Google VEO 3 not configured: missing GOOGLE_API_KEY');
  }

  const preset = QUALITY_PRESETS[mode];
  console.log('🎬 VEO 3: Starting generation', { 
    userId, 
    mode, 
    hasAudioScript: !!audioScript,
    hasInitImage: !!initImageUrl,
    preset: preset.description 
  });

  // Prepare audio warning if audio script provided but not supported
  let audioWarning: string | undefined;
  if (audioScript) {
    audioWarning = 'Audio script provided but VEO 3 does not currently support direct audio generation. The script has been saved for future reference.';
    console.log('⚠️ VEO 3: Audio script provided but not supported by API', { audioScriptLength: audioScript.length });
  }

  // Get available VEO 3 models
  const candidateModels = await getAvailableVeo3Models();
  
  // Map aspect ratio to Google's expected format
  const aspectMap: Record<string, string> = {
    '9:16': 'PORTRAIT',
    '16:9': 'LANDSCAPE', 
    '1:1': 'SQUARE'
  };
  const mappedAspect = aspectMap[aspectRatio] || aspectRatio;

  // Prepare the request payload
  const requestPayload: any = {
    prompt: { text: motionPrompt.slice(0, 800) }, // Limit prompt length
    config: {
      aspectRatio: mappedAspect,
      durationSeconds: preset.maxDurationSeconds,
      ...(mode === 'production' && {
        // Production-specific settings
        quality: 'HIGH',
        frameRate: 30
      }),
      ...(mode === 'preview' && {
        // Preview-specific settings for faster generation
        quality: 'MEDIUM',
        frameRate: 24
      })
    }
  };

  // Add init image if provided
  if (initImageUrl) {
    requestPayload.config.imageUrl = initImageUrl;
    console.log('🖼️ VEO 3: Using init image for image-to-video generation');
  }

  console.log('🎬 VEO 3: Request payload', {
    promptPreview: motionPrompt.slice(0, 100) + '...',
    config: requestPayload.config
  });

  // Try each model until one succeeds
  let lastError: Error | null = null;
  for (const modelVersion of candidateModels) {
    try {
      const jobId = await startVeo3Generation(modelVersion, requestPayload);
      
      console.log('✅ VEO 3: Generation started successfully', { 
        jobId, 
        modelVersion, 
        mode,
        estimatedTime: getEstimatedTime(mode)
      });

      return {
        jobId,
        provider: 'google',
        estimatedTime: getEstimatedTime(mode),
        ...(audioWarning && { audioWarning })
      };
    } catch (error) {
      console.error('❌ VEO 3: Model failed', { modelVersion, error: error instanceof Error ? error.message : error });
      lastError = error instanceof Error ? error : new Error(String(error));
      
      // If it's a 404 (model not found), try the next model
      if (error instanceof Error && error.message.includes('404')) {
        continue;
      }
      
      // For other errors, fail immediately
      throw error;
    }
  }

  throw new Error(
    `All VEO 3 models failed. Last error: ${lastError?.message}. Available models: ${candidateModels.join(', ')}`
  );
}

/**
 * Get status of VEO 3 video generation job
 */
export async function getVeo3Status(jobId: string, userId: string): Promise<VeoStatusResult> {
  if (!process.env.GOOGLE_API_KEY) {
    return { status: 'failed', error: 'Google VEO 3 not configured' };
  }

  try {
    const opName = jobId.startsWith('operations/') ? jobId : `operations/${jobId}`;
    const url = `https://generativelanguage.googleapis.com/v1beta/${opName}?key=${process.env.GOOGLE_API_KEY}`;
    
    console.log('🔍 VEO 3: Checking status', { jobId: jobId.slice(-20), userId });
    
    const response = await fetch(url);
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ VEO 3: Status check failed', { status: response.status, error: errorText });
      return { status: 'failed', error: `Status check failed: ${response.status}` };
    }

    const result = await response.json();
    
    if (result.error) {
      console.error('❌ VEO 3: Generation error', result.error);
      return { 
        status: 'failed', 
        error: result.error.message || 'Generation failed',
        completedAt: new Date().toISOString()
      };
    }

    if (!result.done) {
      // Still processing
      const progress = result.metadata?.progressPercent || 0;
      console.log('⏳ VEO 3: Still processing', { progress, jobId: jobId.slice(-20) });
      
      return { 
        status: 'processing', 
        progress,
        estimatedTime: progress > 50 ? '1-2 minutes remaining' : '2-5 minutes remaining'
      };
    }

    // Generation completed
    const videoUrl = result.response?.video?.uri || result.response?.uri || null;
    
    if (videoUrl) {
      console.log('✅ VEO 3: Generation completed successfully', { jobId: jobId.slice(-20) });
      return {
        status: 'completed',
        progress: 100,
        videoUrl,
        completedAt: new Date().toISOString()
      };
    } else {
      console.error('❌ VEO 3: No video URL in completed response', result);
      return {
        status: 'failed',
        error: 'Generation completed but no video was produced',
        completedAt: new Date().toISOString()
      };
    }

  } catch (error) {
    console.error('❌ VEO 3: Status check error', error);
    return { 
      status: 'failed', 
      error: error instanceof Error ? error.message : 'Status check failed' 
    };
  }
}

/**
 * Get available VEO 3 model versions
 */
async function getAvailableVeo3Models(): Promise<string[]> {
  // Start with explicitly configured model if available
  const candidateModels: string[] = [];
  if (process.env.VEO3_MODEL) {
    candidateModels.push(process.env.VEO3_MODEL);
  }

  try {
    // Try to discover available models
    const listUrl = `https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GOOGLE_API_KEY}`;
    const response = await fetch(listUrl);
    
    if (response.ok) {
      const data: any = await response.json();
      const veo3Models = (data.models || [])
        .map((model: any) => model.name?.split('/').pop())
        .filter((name: string) => name && /veo.*3/i.test(name));
      
      // Add discovered models that aren't already in the list
      for (const model of veo3Models) {
        if (!candidateModels.includes(model)) {
          candidateModels.push(model);
        }
      }
      
      console.log('📋 VEO 3: Discovered models', candidateModels);
    } else {
      console.log('⚠️ VEO 3: Could not list models', response.status);
    }
  } catch (error) {
    console.log('⚠️ VEO 3: Model discovery failed', error instanceof Error ? error.message : error);
  }

  // Fallback to known VEO 3 model names if discovery fails
  if (candidateModels.length === 0) {
    candidateModels.push(
      'veo-3.0-generate-001',
      'veo-3.0-beta',
      'veo-3.0-001',
      'veo-2.0-generate-001' // Fallback to VEO 2 if VEO 3 not available
    );
  }

  return candidateModels;
}

/**
 * Start VEO 3 generation with specific model
 */
async function startVeo3Generation(modelVersion: string, payload: any): Promise<string> {
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${modelVersion}:generateVideo?key=${process.env.GOOGLE_API_KEY}`;
  
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`VEO 3 generation failed (${response.status}): ${errorText}`);
  }

  const result = await response.json();
  const jobId = result.name || result.operationId || result.id || `veo3_${Date.now()}`;
  
  return jobId;
}

/**
 * Get estimated completion time based on mode
 */
function getEstimatedTime(mode: VeoGenerationOptions['mode']): string {
  switch (mode) {
    case 'preview':
      return '30-90 seconds';
    case 'production':
      return '3-8 minutes';
    default:
      return '2-5 minutes';
  }
}

/**
 * Get quality preset information
 */
export function getQualityPreset(mode: VeoGenerationOptions['mode']): VeoQualityPreset {
  return QUALITY_PRESETS[mode];
}

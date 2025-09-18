import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { apiRequest } from '../../lib/queryClient';
import VideoPreview from '../../components/VideoPreview';

interface VideoGenerateDialogProps {
  isOpen: boolean;
  onClose: () => void;
  imageId?: string;
  imageUrl?: string;
  onSuccess?: () => void;
}

type GenerationMode = 'preview' | 'production';

interface QualityPreset {
  maxDurationSeconds: number;
  resolution: string;
  steps: number;
  description: string;
}

interface VideoGenerationJob {
  jobId: string;
  videoId: string;
  provider: string;
  estimatedTime: string;
  mode: GenerationMode;
  qualityPreset: QualityPreset;
  audioWarning?: string;
}

const VideoGenerateDialog: React.FC<VideoGenerateDialogProps> = ({
  isOpen,
  onClose,
  imageId,
  imageUrl,
  onSuccess
}) => {
  const [motionPrompt, setMotionPrompt] = useState('');
  const [mode, setMode] = useState<GenerationMode>('preview');
  const [audioScript, setAudioScript] = useState('');
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16' | '1:1'>('9:16');
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [job, setJob] = useState<VideoGenerationJob | null>(null);
  const [videoStatus, setVideoStatus] = useState<'idle' | 'pending' | 'processing' | 'completed' | 'failed'>('idle');
  const [progress, setProgress] = useState(0);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [presets, setPresets] = useState<Record<GenerationMode, QualityPreset> | null>(null);

  // Load quality presets on mount
  useEffect(() => {
    const loadPresets = async () => {
      try {
        const response = await apiRequest('/api/video/presets', 'GET');
        setPresets(response.presets);
      } catch (error) {
        console.error('Failed to load presets:', error);
      }
    };
    
    if (isOpen) {
      loadPresets();
    }
  }, [isOpen]);

  // Poll for job status when generating
  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;

    if (job && (videoStatus === 'pending' || videoStatus === 'processing')) {
      intervalId = setInterval(async () => {
        try {
          const response = await apiRequest(`/api/video/status/${job.jobId}`, 'GET');
          
          setVideoStatus(response.status);
          setProgress(response.progress || 0);
          
          if (response.status === 'completed' && response.videoUrl) {
            setVideoUrl(response.videoUrl);
            if (onSuccess) onSuccess();
          } else if (response.status === 'failed') {
            setError(response.error || 'Video generation failed');
          }
        } catch (error) {
          console.error('Status check failed:', error);
          setError('Failed to check video status');
        }
      }, 3000); // Check every 3 seconds
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [job, videoStatus, onSuccess]);

  const handleGenerate = async () => {
    if (!motionPrompt.trim()) {
      setError('Motion prompt is required');
      return;
    }

    setIsGenerating(true);
    setError(null);
    setJob(null);
    setVideoStatus('idle');
    setProgress(0);
    setVideoUrl(null);

    try {
      console.log('🎬 VEO 3: Starting generation', {
        imageId,
        mode,
        hasAudioScript: !!audioScript.trim(),
        aspectRatio,
        motionPromptLength: motionPrompt.length
      });

      const response = await apiRequest('/api/video/generate', 'POST', {
        imageId,
        motionPrompt: motionPrompt.trim(),
        mode,
        audioScript: audioScript.trim() || undefined,
        aspectRatio
      });

      console.log('✅ VEO 3: Generation started', response);

      setJob(response);
      setVideoStatus('pending');
      
      if (response.audioWarning) {
        setError(response.audioWarning);
      }

    } catch (error: any) {
      console.error('❌ VEO 3: Generation failed', error);
      setError(error.message || 'Failed to start video generation');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRetry = () => {
    setError(null);
    setJob(null);
    setVideoStatus('idle');
    setProgress(0);
    setVideoUrl(null);
  };

  const handleSave = async () => {
    if (!job?.videoId) return;

    try {
      await apiRequest('/api/video/save', 'POST', {
        videoId: job.videoId
      });
      
      console.log('💾 VEO 3: Video saved');
    } catch (error) {
      console.error('❌ VEO 3: Save failed', error);
    }
  };

  const isUsingInitImage = !!(imageId && imageUrl);
  const currentPreset = presets?.[mode];
  const isReadyToGenerate = motionPrompt.trim().length >= 8 && !isGenerating;
  const showVideoPreview = videoStatus !== 'idle';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-light tracking-wide uppercase">
            Generate Video with VEO 3
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column: Generation Settings */}
          <div className="space-y-6">
            {/* Init Image Preview */}
            {isUsingInitImage && (
              <div>
                <label className="block text-sm font-medium mb-2 uppercase tracking-wider">
                  Source Image
                </label>
                <div className="relative rounded-lg overflow-hidden bg-gray-100 aspect-square">
                  <img
                    src={imageUrl}
                    alt="Source image"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-2 left-2 bg-black/70 text-white px-2 py-1 text-xs rounded">
                    Image-to-Video
                  </div>
                </div>
              </div>
            )}

            {/* Motion Prompt */}
            <div>
              <label className="block text-sm font-medium mb-2 uppercase tracking-wider">
                Motion Prompt
              </label>
              <textarea
                value={motionPrompt}
                onChange={(e) => setMotionPrompt(e.target.value)}
                placeholder="Describe the motion and action you want in your video..."
                className="w-full h-32 px-4 py-3 border border-gray-300 rounded-lg resize-none font-light focus:ring-2 focus:ring-black focus:border-transparent"
                maxLength={800}
              />
              <div className="text-right text-xs text-gray-500 mt-1">
                {motionPrompt.length}/800 characters
              </div>
            </div>

            {/* Generation Mode */}
            <div>
              <label className="block text-sm font-medium mb-2 uppercase tracking-wider">
                Quality Mode
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setMode('preview')}
                  className={`p-4 border rounded-lg text-left transition-colors ${
                    mode === 'preview'
                      ? 'border-black bg-gray-50'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <div className="font-medium uppercase tracking-wider text-sm">Preview</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {currentPreset ? currentPreset.description : 'Fast preview (5s, 720p)'}
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setMode('production')}
                  className={`p-4 border rounded-lg text-left transition-colors ${
                    mode === 'production'
                      ? 'border-black bg-gray-50'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <div className="font-medium uppercase tracking-wider text-sm">Production</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {currentPreset ? currentPreset.description : 'High quality (30s, 1080p)'}
                  </div>
                </button>
              </div>
            </div>

            {/* Aspect Ratio */}
            <div>
              <label className="block text-sm font-medium mb-2 uppercase tracking-wider">
                Aspect Ratio
              </label>
              <div className="flex gap-3">
                {(['9:16', '16:9', '1:1'] as const).map((ratio) => (
                  <button
                    key={ratio}
                    type="button"
                    onClick={() => setAspectRatio(ratio)}
                    className={`px-4 py-2 border rounded-lg text-sm uppercase tracking-wider transition-colors ${
                      aspectRatio === ratio
                        ? 'border-black bg-gray-50'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    {ratio}
                  </button>
                ))}
              </div>
            </div>

            {/* Audio Script (Optional) */}
            <div>
              <label className="block text-sm font-medium mb-2 uppercase tracking-wider">
                Audio Script <span className="text-gray-500 normal-case">(Optional)</span>
              </label>
              <textarea
                value={audioScript}
                onChange={(e) => setAudioScript(e.target.value)}
                placeholder="Add audio script for future reference (not currently supported by VEO 3)..."
                className="w-full h-24 px-4 py-3 border border-gray-300 rounded-lg resize-none font-light focus:ring-2 focus:ring-black focus:border-transparent"
                maxLength={500}
              />
              <div className="text-xs text-gray-500 mt-1">
                Audio generation not yet supported. Script will be saved for future reference.
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="text-red-800 text-sm">{error}</div>
              </div>
            )}

            {/* Generate Button */}
            <button
              onClick={handleGenerate}
              disabled={!isReadyToGenerate}
              className={`w-full py-4 rounded-lg text-sm font-medium uppercase tracking-wider transition-colors ${
                isReadyToGenerate
                  ? 'bg-black text-white hover:bg-gray-800'
                  : 'bg-gray-200 text-gray-500 cursor-not-allowed'
              }`}
            >
              {isGenerating ? 'Starting Generation...' : 'Generate Video'}
            </button>

            {/* Job Info */}
            {job && (
              <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                <div className="text-sm space-y-1">
                  <div><strong>Mode:</strong> {job.mode}</div>
                  <div><strong>Provider:</strong> {job.provider}</div>
                  <div><strong>Estimated Time:</strong> {job.estimatedTime}</div>
                  {job.qualityPreset && (
                    <div><strong>Quality:</strong> {job.qualityPreset.resolution}, max {job.qualityPreset.maxDurationSeconds}s</div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Video Preview */}
          <div>
            {showVideoPreview ? (
              <VideoPreview
                videoUrl={videoUrl}
                posterUrl={imageUrl}
                isLoading={videoStatus === 'pending' || videoStatus === 'processing'}
                progress={progress}
                status={videoStatus}
                error={videoStatus === 'failed' ? error : null}
                onRetry={handleRetry}
                onSave={handleSave}
                title="Generated Video"
                className="w-full"
              />
            ) : (
              <div className="w-full aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <div className="text-lg font-light uppercase tracking-wider mb-2">
                    Video Preview
                  </div>
                  <div className="text-sm">
                    Your generated video will appear here
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VideoGenerateDialog;
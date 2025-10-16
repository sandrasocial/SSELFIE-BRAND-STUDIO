import * as React from 'react';
import { Play } from 'lucide-react';

interface VideoPreviewProps {
  videoUrl?: string;
  posterUrl?: string;
  isLoading?: boolean;
  error?: string | null;
  progress?: number;
  status?: 'pending' | 'generating' | 'completed' | 'failed';
  onRetry?: () => void;
  onSave?: () => void;
  onDownload?: () => void;
  className?: string;
  title?: string;
}

const VideoPreview: React.FC<VideoPreviewProps> = ({
  videoUrl,
  posterUrl,
  isLoading = false,
  error = null,
  progress = 0,
  status = 'pending',
  onRetry,
  onSave,
  onDownload,
  className = '',
  title = 'Generated Video'
}) => {
  // Show loading state
  if (isLoading || status === 'generating') {
    return (
      <div className={`bg-gray-100 rounded-lg p-8 text-center ${className}`}>
        <div className="text-gray-500 mb-4">
          <div className="animate-spin h-8 w-8 mx-auto border-2 border-gray-300 border-t-blue-600 rounded-full"></div>
        </div>
        <h4 className="text-lg font-medium text-gray-900 mb-2">Generating Video...</h4>
        <p className="text-gray-600 text-sm mb-2">Please wait while we create your video.</p>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-xs text-gray-500 mt-2">{progress}% complete</p>
      </div>
    );
  }

  // Show error state with retry option
  if (error || status === 'failed') {
    return (
      <div className={`bg-red-50 border border-red-200 rounded-lg p-8 text-center ${className}`}>
        <div className="text-red-500 mb-4">
          <Play className="h-12 w-12 mx-auto opacity-50" />
        </div>
        <h4 className="text-lg font-medium text-red-900 mb-2">Video Generation Issue</h4>
        <p className="text-red-700 text-sm mb-4">
          {error || 'Video generation experienced an issue. This is a known stability concern we\'re addressing.'}
        </p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        )}
      </div>
    );
  }

  // Show completed video
  if (videoUrl && status === 'completed') {
    return (
      <div className={`bg-black rounded-lg overflow-hidden ${className}`}>
        <video
          src={videoUrl}
          poster={posterUrl}
          controls
          className="w-full h-auto"
          title={title}
        >
          Your browser does not support the video tag.
        </video>
        <div className="p-4 bg-gray-900 text-white">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">{title}</span>
            <div className="flex gap-2">
              {onSave && (
                <button
                  onClick={onSave}
                  className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors"
                >
                  Save
                </button>
              )}
              {onDownload && (
                <button
                  onClick={onDownload}
                  className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 transition-colors"
                >
                  Download
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Default pending state
  return (
    <div className={`bg-gray-100 rounded-lg p-8 text-center ${className}`}>
      <div className="text-gray-500 mb-4">
        <Play className="h-12 w-12 mx-auto opacity-50" />
      </div>
      <h4 className="text-lg font-medium text-gray-900 mb-2">Video Preview</h4>
      <p className="text-gray-600 text-sm">
        Video content will appear here once generation is complete.
      </p>
    </div>
  );
};

export default VideoPreview;

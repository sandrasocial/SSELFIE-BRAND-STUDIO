import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize2, Download, Heart, RotateCcw, Expand } from 'lucide-react';
import './VideoPreview.css';

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
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [showControls, setShowControls] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  // Video event handlers
  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleMuteToggle = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
      setVolume(newVolume);
      setIsMuted(newVolume === 0);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const handleFullscreen = () => {
    if (videoRef.current) {
      if (!isFullscreen) {
        videoRef.current.requestFullscreen();
      } else {
        document.exitFullscreen();
      }
    }
  };

  const handleSave = () => {
    if (onSave) {
      onSave();
      setIsSaved(true);
      // Reset after animation
      setTimeout(() => setIsSaved(false), 2000);
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Video event listeners
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const updateTime = () => setCurrentTime(video.currentTime);
    const updateDuration = () => setDuration(video.duration);
    const handleEnded = () => setIsPlaying(false);
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    video.addEventListener('timeupdate', updateTime);
    video.addEventListener('loadedmetadata', updateDuration);
    video.addEventListener('ended', handleEnded);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);

    return () => {
      video.removeEventListener('timeupdate', updateTime);
      video.removeEventListener('loadedmetadata', updateDuration);
      video.removeEventListener('ended', handleEnded);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
    };
  }, [videoUrl]);

  // Fullscreen change handler
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Render loading state
  if (isLoading || status === 'generating') {
    return (
      <div className={`relative bg-gray-900 rounded-lg overflow-hidden ${className}`}>
        <div className="aspect-video flex flex-col items-center justify-center">
          {/* Loading skeleton */}
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" />
          
          {/* Progress indicator */}
          <div className="w-full max-w-xs mb-4">
            <div className="flex items-center justify-between text-sm text-gray-300 mb-2">
              <span>Generating video...</span>
              <span>{progress}%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
          
          <p className="text-gray-400 text-sm text-center">
            {status === 'generating' ? 'Creating your video with VEO 3...' : 'Processing...'}
          </p>
        </div>
      </div>
    );
  }

  // Render error state
  if (error || status === 'failed') {
    return (
      <div className={`relative bg-gray-900 rounded-lg overflow-hidden ${className}`}>
        <div className="aspect-video flex flex-col items-center justify-center p-6">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mb-4">
            <span className="text-red-400 text-2xl">⚠️</span>
          </div>
          <h3 className="text-red-400 font-semibold mb-2">Video Generation Failed</h3>
          <p className="text-gray-400 text-sm text-center mb-4">
            {error || 'Something went wrong while generating your video.'}
          </p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
            >
              <RotateCcw size={16} />
              Try Again
            </button>
          )}
        </div>
      </div>
    );
  }

  // Render completed video
  if (videoUrl && status === 'completed') {
    return (
      <div 
        className={`relative bg-black rounded-lg overflow-hidden group ${className}`}
        onMouseEnter={() => setShowControls(true)}
        onMouseLeave={() => setShowControls(false)}
        onDoubleClick={() => {
          // Bridge: open static modal for consistent enlarged preview
          if (videoUrl) {
            window.dispatchEvent(new CustomEvent('video:preview', { detail: { source: videoUrl, options: { autoplay: false } } }));
          }
        }}
      >
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          poster={posterUrl}
          preload="metadata"
          playsInline
          aria-label={title}
        >
          <source src={videoUrl} type="video/mp4" />
          Your browser does not support the video tag.
        </video>

        {/* Video Controls Overlay */}
        <div className={`absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
          
          {/* Play/Pause Button */}
          <button
            onClick={handlePlayPause}
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-black/50 rounded-full flex items-center justify-center hover:bg-black/70 transition-colors"
            aria-label={isPlaying ? 'Pause video' : 'Play video'}
          >
            {isPlaying ? <Pause size={24} className="text-white" /> : <Play size={24} className="text-white ml-1" />}
          </button>

          {/* Top Controls */}
          <div className="absolute top-4 right-4 flex gap-2">
            {/* Expand to Static Modal */}
            <button
              onClick={() => {
                if (videoUrl) {
                  window.dispatchEvent(new CustomEvent('video:preview', { detail: { source: videoUrl, options: { autoplay: true } } }));
                }
              }}
              className="p-2 bg-black/50 hover:bg-black/70 rounded-full transition-colors"
              aria-label="Open large preview"
            >
              <Expand size={20} className="text-white" />
            </button>
            <button
              onClick={handleSave}
              className={`p-2 rounded-full transition-all ${isSaved ? 'bg-red-500' : 'bg-black/50 hover:bg-black/70'}`}
              aria-label="Save video"
            >
              <Heart size={20} className={`${isSaved ? 'text-white fill-current' : 'text-white'}`} />
            </button>
            
            {onDownload && (
              <button
                onClick={onDownload}
                className="p-2 bg-black/50 hover:bg-black/70 rounded-full transition-colors"
                aria-label="Download video"
              >
                <Download size={20} className="text-white" />
              </button>
            )}
            
            <button
              onClick={handleFullscreen}
              className="p-2 bg-black/50 hover:bg-black/70 rounded-full transition-colors"
              aria-label="Toggle fullscreen"
            >
              <Maximize2 size={20} className="text-white" />
            </button>
          </div>

          {/* Bottom Controls */}
          <div className="absolute bottom-0 left-0 right-0 p-4">
            {/* Progress Bar */}
            <div className="flex items-center gap-2 mb-2">
              <span className="text-white text-sm tabular-nums">{formatTime(currentTime)}</span>
              <input
                type="range"
                min="0"
                max={duration || 0}
                value={currentTime}
                onChange={handleSeek}
                className="flex-1 h-1 bg-gray-600 rounded-lg appearance-none slider"
              />
              <span className="text-white text-sm tabular-nums">{formatTime(duration)}</span>
            </div>

            {/* Volume Controls */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleMuteToggle}
                className="p-1 hover:bg-black/30 rounded transition-colors"
                aria-label={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted ? <VolumeX size={20} className="text-white" /> : <Volume2 size={20} className="text-white" />}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="w-20 h-1 bg-gray-600 rounded-lg appearance-none slider"
                aria-label="Volume"
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Render pending state
  return (
    <div className={`relative bg-gray-800 rounded-lg overflow-hidden ${className}`}>
      <div className="aspect-video flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 bg-gray-600 rounded-full flex items-center justify-center mb-4">
            <Play size={24} className="text-gray-400 ml-1" />
          </div>
          <p className="text-gray-400">Video will appear here</p>
        </div>
      </div>
    </div>
  );
};

export default VideoPreview;
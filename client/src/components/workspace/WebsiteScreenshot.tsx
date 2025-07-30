import React, { useState } from 'react';
import { Monitor, AlertCircle } from 'lucide-react';

interface WebsiteScreenshotProps {
  websiteId: number;
  screenshotUrl?: string;
  title: string;
  className?: string;
}

export function WebsiteScreenshot({ 
  websiteId, 
  screenshotUrl, 
  title, 
  className = "" 
}: WebsiteScreenshotProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const handleImageLoad = () => {
    setIsLoading(false);
    setHasError(false);
  };

  const handleImageError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  // If no screenshot URL provided, show placeholder
  if (!screenshotUrl) {
    return (
      <div className={`bg-gray-100 flex items-center justify-center ${className}`}>
        <div className="text-center">
          <Monitor className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <p className="text-xs text-gray-500">No preview available</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {/* Loading state */}
      {isLoading && (
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
          <div className="animate-pulse">
            <Monitor className="w-8 h-8 text-gray-400" />
          </div>
        </div>
      )}

      {/* Error state */}
      {hasError && (
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
          <div className="text-center">
            <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-2" />
            <p className="text-xs text-red-500">Failed to load</p>
          </div>
        </div>
      )}

      {/* Actual screenshot */}
      <img
        src={screenshotUrl}
        alt={`Screenshot of ${title}`}
        className={`${className} ${isLoading || hasError ? 'opacity-0' : 'opacity-100'} transition-opacity`}
        onLoad={handleImageLoad}
        onError={handleImageError}
        loading="lazy"
      />
    </div>
  );
}
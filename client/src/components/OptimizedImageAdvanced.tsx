import React, { useState, useRef, useEffect, useCallback } from 'react';

interface OptimizedImageAdvancedProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  priority?: boolean;
  placeholder?: string;
  quality?: number;
  sizes?: string;
  onLoad?: () => void;
  onError?: () => void;
}

/**
 * Advanced Optimized Image Component
 * Features:
 * - Intersection Observer lazy loading
 * - WebP format with fallback
 * - Progressive loading with blur placeholder
 * - Error handling with retry
 * - Memory optimization
 */
export const OptimizedImageAdvanced: React.FC<OptimizedImageAdvancedProps> = ({
  src,
  alt,
  className = "",
  width,
  height,
  priority = false,
  placeholder,
  quality = 80,
  sizes = "100vw",
  onLoad,
  onError
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const [retryCount, setRetryCount] = useState(0);
  const imgRef = useRef<HTMLImageElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Generate optimized image URL with WebP support
  const getOptimizedSrc = useCallback((originalSrc: string, webp = false) => {
    // If it's already an optimized URL, return as is
    if (originalSrc.includes('?')) {
      return originalSrc;
    }

    // For external URLs, add optimization parameters
    if (originalSrc.startsWith('http')) {
      const url = new URL(originalSrc);
      url.searchParams.set('q', quality.toString());
      url.searchParams.set('w', width?.toString() || 'auto');
      url.searchParams.set('h', height?.toString() || 'auto');
      if (webp) {
        url.searchParams.set('f', 'webp');
      }
      return url.toString();
    }

    return originalSrc;
  }, [quality, width, height]);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (priority || isInView) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.unobserve(entry.target);
          }
        });
      },
      {
        rootMargin: '50px', // Start loading 50px before image comes into view
        threshold: 0.1
      }
    );

    observerRef.current = observer;

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [priority, isInView]);

  // Handle image load
  const handleLoad = useCallback(() => {
    setIsLoaded(true);
    setHasError(false);
    onLoad?.();
  }, [onLoad]);

  // Handle image error with retry
  const handleError = useCallback(() => {
    if (retryCount < 3) {
      setRetryCount(prev => prev + 1);
      // Retry with a small delay
      setTimeout(() => {
        if (imgRef.current) {
          imgRef.current.src = getOptimizedSrc(src);
        }
      }, 1000 * retryCount);
    } else {
      setHasError(true);
      onError?.();
    }
  }, [retryCount, src, getOptimizedSrc, onError]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  const webpSrc = getOptimizedSrc(src, true);
  const fallbackSrc = getOptimizedSrc(src, false);

  return (
    <div 
      ref={imgRef}
      className={`relative overflow-hidden ${className}`}
      style={{ 
        width: width ? `${width}px` : '100%', 
        height: height ? `${height}px` : 'auto',
        aspectRatio: width && height ? `${width}/${height}` : undefined
      }}
    >
      {/* Blur placeholder */}
      {!isLoaded && !hasError && (
        <div 
          className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center"
          style={{ 
            background: placeholder ? `url(${placeholder})` : undefined,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'blur(10px)'
          }}
        >
          {!placeholder && (
            <div className="text-gray-400 text-sm">Loading...</div>
          )}
        </div>
      )}

      {/* Main image with WebP support */}
      {isInView && !hasError && (
        <picture>
          <source srcSet={webpSrc} type="image/webp" />
          <img
            src={fallbackSrc}
            alt={alt}
            width={width}
            height={height}
            sizes={sizes}
            loading={priority ? "eager" : "lazy"}
            decoding="async"
            onLoad={handleLoad}
            onError={handleError}
            className="absolute inset-0 w-full h-full object-cover transition-opacity duration-300"
            style={{
              opacity: isLoaded ? 1 : 0,
              transition: 'opacity 0.3s ease-in-out'
            }}
            fetchPriority={priority ? "high" : "low"}
          />
        </picture>
      )}

      {/* Error state */}
      {hasError && (
        <div className="absolute inset-0 bg-gray-200 flex items-center justify-center">
          <div className="text-center">
            <div className="text-gray-500 text-sm mb-2">Failed to load image</div>
            <button
              onClick={() => {
                setHasError(false);
                setRetryCount(0);
                setIsInView(true);
              }}
              className="text-xs text-blue-500 hover:text-blue-700 underline"
            >
              Retry
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default OptimizedImageAdvanced;

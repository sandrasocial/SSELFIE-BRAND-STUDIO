import React, { useState, useRef, useEffect } from 'react';
import { useMemoryCleanup } from '../hooks/useMemoryCleanup';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  placeholder?: string;
  width?: number;
  height?: number;
  priority?: boolean;
  onLoad?: () => void;
  onError?: () => void;
}

/**
 * Phase 4: Optimized Image Component with advanced loading strategies
 * Features: Progressive loading, WebP support, intersection observer, memory cleanup
 */
export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  className = "",
  placeholder,
  width,
  height,
  priority = false,
  onLoad,
  onError
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const [currentSrc, setCurrentSrc] = useState<string | null>(priority ? src : null);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const { addCleanup } = useMemoryCleanup();

  // Generate WebP version if possible
  const getOptimizedSrc = (originalSrc: string): string => {
    // Check if browser supports WebP
    if (typeof window !== 'undefined') {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (ctx && canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0) {
        // If it's an S3 URL, try to get WebP version
        if (originalSrc.includes('amazonaws.com') || originalSrc.includes('s3.')) {
          const webpSrc = originalSrc.replace(/\.(jpg|jpeg|png)$/i, '.webp');
          return webpSrc;
        }
      }
    }
    return originalSrc;
  };

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (priority || !imgRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            setCurrentSrc(getOptimizedSrc(src));
            observer.unobserve(entry.target);
          }
        });
      },
      {
        rootMargin: '50px', // Start loading 50px before image comes into view
        threshold: 0.1
      }
    );

    observer.observe(imgRef.current);

    addCleanup(() => {
      if (imgRef.current) {
        observer.unobserve(imgRef.current);
      }
      observer.disconnect();
    });

    return () => observer.disconnect();
  }, [src, priority, addCleanup]);

  // Handle image load
  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  // Handle image error (fallback to original format)
  const handleError = () => {
    if (currentSrc !== src && !hasError) {
      // Try original format if WebP fails
      setCurrentSrc(src);
      setHasError(true);
    } else {
      setHasError(true);
      onError?.();
    }
  };

  // Progressive loading effect
  const imageStyle: React.CSSProperties = {
    opacity: isLoaded ? 1 : 0,
    transition: 'opacity 0.3s ease-in-out',
    width: width ? `${width}px` : '100%',
    height: height ? `${height}px` : 'auto',
  };

  return (
    <div 
      ref={imgRef}
      className={`relative overflow-hidden ${className}`}
      style={{ width: width ? `${width}px` : '100%', height: height ? `${height}px` : 'auto' }}
    >
      {/* Placeholder/Loading state */}
      {!isLoaded && (
        <div 
          className="absolute inset-0 bg-gray-100 animate-pulse flex items-center justify-center"
          style={{ width: '100%', height: height ? `${height}px` : '200px' }}
        >
          {placeholder ? (
            <img src={placeholder} alt="" className="w-full h-full object-cover opacity-50" />
          ) : (
            <div className="text-gray-400 text-sm">Loading...</div>
          )}
        </div>
      )}

      {/* Main image */}
      {(isInView && currentSrc) && (
        <img
          src={currentSrc}
          alt={alt}
          style={imageStyle}
          className="absolute inset-0 w-full h-full object-cover"
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          onLoad={handleLoad}
          onError={handleError}
          // Performance optimizations
          fetchpriority={priority ? "high" : "low"}
        />
      )}

      {/* Error state */}
      {hasError && !isLoaded && (
        <div className="absolute inset-0 bg-gray-200 flex items-center justify-center">
          <div className="text-gray-500 text-sm">Failed to load image</div>
        </div>
      )}
    </div>
  );
};

export default OptimizedImage;
/**
 * Optimized Image Loader Component
 * SSELFIE Platform - Smart Image Loading
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useStorage } from '../hooks/use-storage';

// ============================================================================
// Types
// ============================================================================

export interface ImageLoaderProps {
  /** Image storage key or URL */
  src: string;
  /** Alt text for accessibility */
  alt: string;
  /** Image width */
  width?: number;
  /** Image height */
  height?: number;
  /** Target image quality (1-100) */
  quality?: number;
  /** Preferred image format */
  format?: 'jpeg' | 'png' | 'webp' | 'avif' | 'auto';
  /** Object fit behavior */
  fit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
  /** Loading behavior */
  loading?: 'lazy' | 'eager';
  /** Placeholder while loading */
  placeholder?: React.ReactNode;
  /** Error fallback */
  fallback?: React.ReactNode;
  /** Additional CSS classes */
  className?: string;
  /** Inline styles */
  style?: React.CSSProperties;
  /** Enable blur-up effect */
  blurUp?: boolean;
  /** Enable responsive images */
  responsive?: boolean;
  /** Sizes attribute for responsive images */
  sizes?: string;
  /** Callback when image loads */
  onLoad?: () => void;
  /** Callback when image fails to load */
  onError?: (error: Event) => void;
  /** Enable progressive loading */
  progressive?: boolean;
}

interface LoadingState {
  isLoading: boolean;
  hasError: boolean;
  hasLoaded: boolean;
}

// ============================================================================
// ImageLoader Component
// ============================================================================

export const ImageLoader: React.FC<ImageLoaderProps> = ({
  src,
  alt,
  width,
  height,
  quality = 85,
  format = 'auto',
  fit = 'cover',
  loading = 'lazy',
  placeholder,
  fallback,
  className = '',
  style = {},
  blurUp = true,
  responsive = true,
  sizes,
  onLoad,
  onError,
  progressive = false,
}) => {
  const [loadingState, setLoadingState] = useState<LoadingState>({
    isLoading: true,
    hasError: false,
    hasLoaded: false,
  });
  
  const [currentSrc, setCurrentSrc] = useState<string>('');
  const [placeholderSrc, setPlaceholderSrc] = useState<string>('');
  const imgRef = useRef<HTMLImageElement>(null);
  const placeholderRef = useRef<HTMLImageElement>(null);
  const { getUrl, generateSrcSet, getResponsiveUrls } = useStorage();

  /**
   * Get optimal image format based on browser support
   */
  const getOptimalFormat = useCallback((): string => {
    if (format !== 'auto') return format;

    // Feature detection for modern formats
    if (supportsAvif()) return 'avif';
    if (supportsWebp()) return 'webp';
    return 'jpeg';
  }, [format]);

  /**
   * Generate optimized image URL
   */
  const generateImageUrl = useCallback((
    imageSrc: string,
    options: { width?: number; height?: number; quality?: number; format?: string } = {}
  ): string => {
    // If it's already a full URL, return as-is
    if (imageSrc.startsWith('http://') || imageSrc.startsWith('https://')) {
      return imageSrc;
    }

    // Use storage service to generate optimized URL
    return getUrl(imageSrc, {
      width: options.width || width,
      height: options.height || height,
      quality: options.quality || quality,
      format: options.format || getOptimalFormat(),
    });
  }, [getUrl, width, height, quality, getOptimalFormat]);

  /**
   * Setup image sources
   */
  useEffect(() => {
    if (!src) return;

    // Generate placeholder for blur-up effect
    if (blurUp) {
      const placeholder = generateImageUrl(src, {
        width: 20,
        height: 20,
        quality: 20,
      });
      setPlaceholderSrc(placeholder);
    }

    // Generate main image URL
    const mainImage = generateImageUrl(src);
    setCurrentSrc(mainImage);
  }, [src, generateImageUrl, blurUp]);

  /**
   * Handle image load success
   */
  const handleLoad = useCallback(() => {
    setLoadingState({
      isLoading: false,
      hasError: false,
      hasLoaded: true,
    });

    // Fade out placeholder
    if (placeholderRef.current) {
      placeholderRef.current.style.opacity = '0';
    }

    onLoad?.();
  }, [onLoad]);

  /**
   * Handle image load error
   */
  const handleError = useCallback((event: React.SyntheticEvent<HTMLImageElement>) => {
    setLoadingState({
      isLoading: false,
      hasError: true,
      hasLoaded: false,
    });

    onError?.(event.nativeEvent);
  }, [onError]);

  /**
   * Generate srcSet for responsive images
   */
  const getSrcSet = useCallback((): string => {
    if (!responsive || !src) return '';
    
    if (src.startsWith('http://') || src.startsWith('https://')) {
      return ''; // Can't generate srcSet for external URLs
    }

    return generateSrcSet(src, {
      quality,
      format: getOptimalFormat(),
    });
  }, [responsive, src, generateSrcSet, quality, getOptimalFormat]);

  /**
   * Generate sizes attribute
   */
  const getSizes = useCallback((): string => {
    if (sizes) return sizes;
    
    // Default responsive sizes
    if (responsive) {
      return '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw';
    }
    
    return '';
  }, [sizes, responsive]);

  // ============================================================================
  // Progressive Loading Effect
  // ============================================================================

  useEffect(() => {
    if (!progressive || !currentSrc) return;

    const img = new Image();
    img.onload = handleLoad;
    img.onerror = handleError;
    img.src = currentSrc;

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [currentSrc, progressive, handleLoad, handleError]);

  // ============================================================================
  // Intersection Observer for Lazy Loading
  // ============================================================================

  useEffect(() => {
    if (loading !== 'lazy' || !imgRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Start loading when image enters viewport
            setLoadingState(prev => ({ ...prev, isLoading: true }));
            observer.unobserve(entry.target);
          }
        });
      },
      {
        rootMargin: '50px', // Start loading 50px before entering viewport
      }
    );

    observer.observe(imgRef.current);

    return () => {
      observer.disconnect();
    };
  }, [loading]);

  // ============================================================================
  // Render
  // ============================================================================

  const containerStyle: React.CSSProperties = {
    position: 'relative',
    display: 'inline-block',
    overflow: 'hidden',
    ...style,
  };

  const imageStyle: React.CSSProperties = {
    width: width || '100%',
    height: height || 'auto',
    objectFit: fit,
    transition: loadingState.hasLoaded ? 'opacity 0.3s ease-in-out' : undefined,
    opacity: loadingState.hasLoaded ? 1 : 0,
  };

  const placeholderStyle: React.CSSProperties = {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    objectFit: fit,
    filter: 'blur(10px)',
    transform: 'scale(1.1)', // Slightly larger to hide blur edges
    transition: 'opacity 0.3s ease-in-out',
    opacity: blurUp && !loadingState.hasLoaded ? 1 : 0,
  };

  // Show error fallback
  if (loadingState.hasError && fallback) {
    return <div className={className} style={style}>{fallback}</div>;
  }

  // Show placeholder while loading
  if (loadingState.isLoading && placeholder) {
    return <div className={className} style={style}>{placeholder}</div>;
  }

  return (
    <div className={className} style={containerStyle}>
      {/* Blur-up placeholder */}
      {blurUp && placeholderSrc && (
        <img
          ref={placeholderRef}
          src={placeholderSrc}
          alt=""
          style={placeholderStyle}
          aria-hidden="true"
        />
      )}
      
      {/* Main image */}
      <img
        ref={imgRef}
        src={currentSrc}
        alt={alt}
        style={imageStyle}
        loading={loading}
        srcSet={getSrcSet()}
        sizes={getSizes()}
        onLoad={progressive ? undefined : handleLoad}
        onError={progressive ? undefined : handleError}
      />
      
      {/* Loading indicator */}
      {loadingState.isLoading && !placeholder && (
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            color: '#999',
          }}
        >
          Loading...
        </div>
      )}
    </div>
  );
};

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Check if browser supports WebP
 */
function supportsWebp(): boolean {
  if (typeof window === 'undefined') return false;
  
  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;
  
  return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
}

/**
 * Check if browser supports AVIF
 */
function supportsAvif(): boolean {
  if (typeof window === 'undefined') return false;
  
  // Simple AVIF detection
  const avif = new Image();
  avif.src = 'data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAAB0AAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAIAAAACAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQ0MAAAAABNjb2xybmNseAACAAIAAYAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAACVtZGF0EgAKCBgABogQEAwgMg8f8D///8WfhwB8+ErK42A=';
  
  return avif.complete && avif.width > 0;
}

// ============================================================================
// Export Additional Components
// ============================================================================

/**
 * Optimized Avatar component
 */
export const AvatarImage: React.FC<Omit<ImageLoaderProps, 'fit'> & { size?: number }> = ({
  size = 40,
  ...props
}) => (
  <ImageLoader
    {...props}
    width={size}
    height={size}
    fit="cover"
    className={`rounded-full ${props.className || ''}`}
    style={{
      borderRadius: '50%',
      ...props.style,
    }}
  />
);

/**
 * Optimized thumbnail component
 */
export const ThumbnailImage: React.FC<ImageLoaderProps> = (props) => (
  <ImageLoader
    {...props}
    quality={70}
    blurUp={false}
    responsive={false}
    loading="eager"
  />
);

/**
 * Hero image component with optimized loading
 */
export const HeroImage: React.FC<ImageLoaderProps> = (props) => (
  <ImageLoader
    {...props}
    quality={90}
    loading="eager"
    progressive={true}
    blurUp={true}
    responsive={true}
  />
);
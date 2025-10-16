import * as React from 'react';
import { cn } from "../../lib/utils.js";

import {
  LuxuryLoadingProps,
  LuxurySkeletonProps,
  LuxuryImageSkeletonProps,
  LuxuryCardSkeletonProps,
  LuxuryGridSkeletonProps,
  LuxuryLoadingOverlayProps
} from '../../types/luxury.js';

// Main luxury loading spinner
export function LuxuryLoading({
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  const spinnerClasses = {
    sm: 'border-2',
    md: 'border-2',
    lg: 'border-3',
    xl: 'border-4'
  };

  if (variant === 'spinner') {
    return (
      <div className={cn(
        "animate-luxury-spin rounded-full border-neutral-200 border-t-neutral-900 dark:border-neutral-700 dark:border-t-neutral-100",
        sizeClasses[size],
        spinnerClasses[size],
        className
      )} />
    );
  }

  if (variant === 'pulse') {
    return (
      <div className={cn(
        "animate-luxury-pulse bg-neutral-200 dark:bg-neutral-700 rounded-editorial-sm",
        sizeClasses[size],
        className
      )} />
    );
  }

  if (variant === 'shimmer') {
    return (
      <div className={cn(
        "relative overflow-hidden bg-neutral-200 dark:bg-neutral-700 rounded-editorial-sm",
        sizeClasses[size],
        className
      )}>
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 dark:via-neutral-600/40 to-transparent animate-luxury-shimmer" />
      </div>
    );
  }

  return null;
};

// Luxury skeleton for text content
export function LuxurySkeleton({ 
  lines = 3, 
  avatar = false, 
  className,
  animate = true 
}) => {
  return (
    <div className={cn("space-y-luxury-xs", className)}>
      {avatar && (
        <div className={cn(
          "w-12 h-12 bg-neutral-200 dark:bg-neutral-700 rounded-full",
          animate && "animate-premium-skeleton"
        )} />
      )}
      
      <div className="space-y-2">
        {Array.from({ length: lines }).map((_, index) => (
          <div
            key={index}
            className={cn(
              "h-4 bg-neutral-200 dark:bg-neutral-700 rounded-editorial-sm",
              animate && "animate-premium-skeleton",
              // Vary line widths for more realistic skeleton
              index === lines - 1 ? "w-3/4" : "w-full"
            )}
            style={{
              animationDelay: animate ? `${index * 0.1}s` : undefined
            }}
          />
        ))}
      </div>
    </div>
  );
};

// Luxury image skeleton
export const LuxuryImageSkeleton: React.FC<LuxuryImageSkeletonProps> = ({ 
  aspectRatio = 'landscape', 
  className 
}) => {
  const aspectClasses = {
    square: 'aspect-square',
    video: 'aspect-video',
    portrait: 'aspect-[3/4]',
    landscape: 'aspect-[4/3]'
  };

  return (
    <div className={cn(
      "relative overflow-hidden bg-neutral-200 dark:bg-neutral-700 rounded-editorial-lg animate-premium-skeleton",
      aspectClasses[aspectRatio],
      className
    )}>
      {/* Camera icon for image placeholder */}
      <div className="absolute inset-0 flex items-center justify-center">
        <svg 
          className="w-8 h-8 text-neutral-400 dark:text-neutral-500" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={1.5} 
            d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" 
          />
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={1.5} 
            d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" 
          />
        </svg>
      </div>
      
      {/* Shimmer effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 dark:via-neutral-600/20 to-transparent animate-luxury-shimmer transform -skew-x-12" />
    </div>
  );
};

// Luxury card skeleton for complex layouts
export const LuxuryCardSkeleton: React.FC<{ 
  className?: string; 
  style?: React.CSSProperties;
}> = ({ className, style }) => {
  return (
    <div 
      className={cn(
        "bg-white dark:bg-neutral-900 rounded-editorial-lg shadow-luxury p-luxury-md space-y-luxury-sm",
        className
      )}
      style={style}
    >
      <LuxuryImageSkeleton aspectRatio="landscape" className="mb-luxury-sm" />
      <LuxurySkeleton lines={2} />
      <div className="flex justify-between items-center pt-luxury-xs">
        <div className="h-8 w-20 bg-neutral-200 dark:bg-neutral-700 rounded-editorial-sm animate-premium-skeleton" />
        <div className="h-8 w-16 bg-neutral-200 dark:bg-neutral-700 rounded-editorial-sm animate-premium-skeleton" />
      </div>
    </div>
  );
};

// Luxury grid skeleton for galleries
export const LuxuryGridSkeleton: React.FC<{ 
  columns?: number; 
  rows?: number; 
  className?: string;
}> = ({ 
  columns = 3, 
  rows = 2, 
  className 
}) => {
  const totalItems = columns * rows;
  
  return (
    <div className={cn(
      "grid gap-luxury-sm",
      columns === 2 && "grid-cols-2",
      columns === 3 && "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
      columns === 4 && "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
      className
    )}>
      {Array.from({ length: totalItems }).map((_, index) => (
        <LuxuryCardSkeleton 
          key={index}
          className="animate-luxury-fade-in"
          style={{
            animationDelay: `${index * 0.1}s`,
            opacity: 0,
            animationFillMode: 'forwards'
          }}
        />
      ))}
    </div>
  );
};

// Luxury loading overlay for full-screen loading states
export const LuxuryLoadingOverlay: React.FC<{
  message?: string;
  show?: boolean;
  className?: string;
}> = ({ 
  message = "Creating your luxury experience...", 
  show = true, 
  className 
}) => {
  if (!show) return null;

  return (
    <div className={cn(
      "fixed inset-0 bg-black/80 backdrop-blur-editorial flex items-center justify-center z-50",
      "animate-luxury-fade-in",
      className
    )}>
      <div className="text-center space-y-luxury-sm animate-luxury-scale-in">
        <LuxuryLoading variant="spinner" size="xl" className="mx-auto" />
        <p className="font-serif text-lg font-light text-white tracking-wide">
          {message}
        </p>
      </div>
    </div>
  );
};
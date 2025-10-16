import type { FC, ReactNode } from 'react';

// Component Props Types
export interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error) => void;
}

export interface PageLoaderProps {
  message?: string;
}

export interface OptimizedImageProps {
  src: string;
  alt: string;
  quality?: number;
  className?: string;
  style?: React.CSSProperties;
  width?: number;
  height?: number;
  priority?: boolean;
}

// Reusable Utility Types
export type FCWithChildren<P = {}> = FC<P & { children?: ReactNode }>;
export type FCWithoutChildren<P = {}> = FC<P & { children?: never }>;

// Declare components
declare module '@/components' {
  export const ErrorBoundary: FC<ErrorBoundaryProps>;
  export const PageLoader: FC<PageLoaderProps>;
  export const OptimizedImage: FC<OptimizedImageProps>;
}
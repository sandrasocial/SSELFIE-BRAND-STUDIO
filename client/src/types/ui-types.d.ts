import type { FC, ReactNode } from 'react';
import type { DialogProps as RadixDialogProps } from '@radix-ui/react-dialog';
import type { AlertDialogProps as RadixAlertDialogProps } from '@radix-ui/react-alert-dialog';

// ============================================================================
// RADIX UI MODULE EXTENSIONS
// ============================================================================

declare module '@radix-ui/react-dialog' {
  export interface DialogProps extends RadixDialogProps {
    children: React.ReactNode;
  }
}

declare module '@radix-ui/react-alert-dialog' {
  export interface AlertDialogProps extends RadixAlertDialogProps {
    children: React.ReactNode;
  }
}

// ============================================================================
// COMPONENT PROPS TYPES
// ============================================================================

export interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo?: React.ErrorInfo) => void;
}

export interface CheckoutErrorBoundaryProps extends ErrorBoundaryProps {
  onError: (error: Error) => void;
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

// ============================================================================
// REUSABLE UTILITY TYPES
// ============================================================================

export type FCWithChildren<P = {}> = FC<P & { children?: ReactNode }>;
export type FCWithoutChildren<P = {}> = FC<P & { children?: never }>;

// ============================================================================
// COMPONENT MODULE DECLARATIONS
// ============================================================================

declare module '@/components' {
  export const ErrorBoundary: FC<ErrorBoundaryProps>;
  export const PageLoader: FC<PageLoaderProps>;
  export const OptimizedImage: FC<OptimizedImageProps>;
}


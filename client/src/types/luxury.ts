import { ReactNode } from 'react';

export interface BaseLuxuryProps {
  children?: ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export interface LuxuryLoadingProps extends Omit<BaseLuxuryProps, 'children'> {
  variant?: 'spinner' | 'skeleton' | 'pulse' | 'shimmer';
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export interface LuxurySkeletonProps extends BaseLuxuryProps {
  lines?: number;
  avatar?: boolean;
  animate?: boolean;
}

export interface LuxuryImageSkeletonProps extends Omit<BaseLuxuryProps, 'children'> {
  aspectRatio?: 'square' | 'video' | 'portrait' | 'landscape';
}

export interface LuxuryCardSkeletonProps extends BaseLuxuryProps {}

export interface LuxuryGridSkeletonProps extends BaseLuxuryProps {
  columns?: number;
  rows?: number;
}

export interface LuxuryLoadingOverlayProps extends BaseLuxuryProps {
  message?: string;
  show?: boolean;
}
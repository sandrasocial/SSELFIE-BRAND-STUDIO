import { 
  type ComponentType, 
  type LazyExoticComponent, 
  type ReactNode
} from 'react';

/**
 * Base component props that properly handle children
 */
export type WithChildren<P = {}> = P & {
  children?: ReactNode;
};

/**
 * Type-safe utilities for React 19 components
 */
export type JSXComponent<P = {}> = ComponentType<WithChildren<P>>;

/**
 * Lazy loaded component types with proper children support
 */
export type LazyComponent<P = {}> = LazyExoticComponent<JSXComponent<P>>;

/**
 * Enhanced props type for complete React 19 compatibility
 */
export type EnhancedProps<P = {}> = WithChildren<P> & {
  key?: string | number;
};
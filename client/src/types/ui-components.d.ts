import type { ComponentProps, ElementRef, ComponentType } from 'react';

// Basic component props with ref support
export type ComponentWithRef<T extends ElementRef<any>, P = {}> = {
  ref?: React.Ref<T>;
} & P;

// Lazy loaded component type
export type LazyComponent<P = {}> = {
  default: ComponentType<P>;
};

// Forward ref component type
export type ForwardRefComponent<T, P = {}> = React.ForwardRefExoticComponent<
  ComponentWithRef<T, P>
>;

// Dialog specific types
export interface DialogProps extends ComponentProps<'div'> {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

// Command specific types
export interface CommandProps extends ComponentProps<'div'> {
  className?: string;
  children?: React.ReactNode;
}

// Suspense wrapper type
export interface SuspenseWrapperProps {
  fallback?: React.ReactNode;
  children: React.ReactNode;
}
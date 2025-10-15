import React, { ComponentType, Suspense, PropsWithChildren } from 'react';
import DialogComponent from './dialog';
import CommandComponent from './command';
import { Sheet } from './sheet';
import { AlertDialog } from './alert-dialog';
import { Button, type ButtonProps } from './button';
import { Toaster } from './toaster';
import { TooltipProvider } from './tooltip';

const LoadingFallback = () => <div className="min-h-[40px] animate-pulse bg-stone-100 rounded-lg" />;

// Create wrapper components that defer initialization
export const LazyDialog = React.memo(() => (
  <Suspense fallback={<LoadingFallback />}>
    <DialogComponent.Root />
  </Suspense>
));

export const LazyCommand = React.memo(() => (
  <Suspense fallback={<LoadingFallback />}>
    <CommandComponent.Root />
  </Suspense>
));

export const LazySheet = React.memo(() => (
  <Suspense fallback={<LoadingFallback />}>
    <Sheet />
  </Suspense>
));

export const LazyAlertDialog = React.memo(() => (
  <Suspense fallback={<LoadingFallback />}>
    <AlertDialog />
  </Suspense>
));

export const LazyButton = React.memo((props: ButtonProps) => (
  <Suspense fallback={<LoadingFallback />}>
    <Button {...props} />
  </Suspense>
));

export const LazyToaster = React.memo(() => (
  <Suspense fallback={<LoadingFallback />}>
    <Toaster />
  </Suspense>
));

export const LazyTooltipProvider = React.memo(({ children }: PropsWithChildren) => (
  <Suspense fallback={<LoadingFallback />}>
    <TooltipProvider>
      {children}
    </TooltipProvider>
  </Suspense>
));

// Create a withSuspense HOC for wrapping any component
export function withSuspense<P extends object>(
  Component: ComponentType<P>,
  fallback = <LoadingFallback />
) {
  return React.memo((props: P) => (
    <Suspense fallback={fallback}>
      <Component {...props} />
    </Suspense>
  ));
}
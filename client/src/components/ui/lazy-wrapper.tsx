import React, { ComponentType, Suspense, PropsWithChildren } from 'react';
import DialogComponent from './dialog';
import CommandComponent from './command';
import { Sheet } from './sheet';
import { AlertDialog } from './alert-dialog';
import { Button, type ButtonProps } from './button';
import { Toaster } from './toaster';
import { TooltipProvider } from './tooltip';

// ✅ CLEANUP: Removed nested Suspense wrappers
// RootWrapper handles all Suspense boundaries

// Create wrapper components that defer initialization
export const LazyDialog = React.memo(() => (
  <DialogComponent.Root />
));

export const LazyCommand = React.memo(() => (
  <CommandComponent.Root />
));

export const LazySheet = React.memo(() => (
  <Sheet />
));

export const LazyAlertDialog = React.memo(() => (
  <AlertDialog />
));

export const LazyButton = React.memo((props: ButtonProps) => (
  <Button {...props} />
));

export const LazyToaster = React.memo(() => (
  <Toaster />
));

export const LazyTooltipProvider = React.memo(({ children }: PropsWithChildren) => (
  <TooltipProvider>
    {children}
  </TooltipProvider>
));

// Create a withSuspense HOC for wrapping any component
export function withSuspense<P extends object>(
  Component: ComponentType<P>
) {
  return React.memo((props: P) => (
    <Component {...props} />
  ));
}
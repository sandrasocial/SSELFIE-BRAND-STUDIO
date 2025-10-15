import React, { Suspense } from 'react';
import type * as DialogPrimitive from '@radix-ui/react-dialog';
import type * as AlertDialogPrimitive from '@radix-ui/react-alert-dialog';
import type { Command as CommandPrimitive } from 'cmdk';

type LoaderProps = {
  children?: React.ReactNode;
};

const LoadingFallback = () => (
  <div className="min-h-[40px] animate-pulse bg-stone-100 rounded-lg" />
);

// Properly typed lazy imports
export const Dialog = React.lazy(() => import('./dialog').then(mod => ({
  default: mod.default.Root
})));

export const Command = React.lazy(() => import('./command').then(mod => ({
  default: mod.default.Root
})));

export const Sheet = React.lazy(() => import('./sheet').then(mod => ({
  default: mod.Sheet
})));

export const AlertDialog = React.lazy(() => import('./alert-dialog').then(mod => ({
  default: mod.AlertDialog
})));

// Type-safe Suspense wrappers
export function SuspenseDialog(props: DialogPrimitive.DialogProps) {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <Dialog {...props} />
    </Suspense>
  );
}

export function SuspenseCommand(props: React.ComponentProps<typeof CommandPrimitive> & { ref?: React.Ref<HTMLDivElement> }) {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <Command {...props} />
    </Suspense>
  );
}

export function SuspenseSheet(props: DialogPrimitive.DialogProps) {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <Sheet {...props} />
    </Suspense>
  );
}

export function SuspenseAlertDialog(props: AlertDialogPrimitive.AlertDialogProps) {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <AlertDialog {...props} />
    </Suspense>
  );
}
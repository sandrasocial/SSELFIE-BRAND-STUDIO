import { lazy, Suspense, type ComponentType, type FC } from 'react';
import type { ComponentProps, ReactNode, Ref } from 'react';
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
export const Dialog = lazy(() => import('./dialog').then(mod => ({
  default: mod.default.Root as ComponentType<DialogPrimitive.DialogProps>
})));

export const Command = lazy(() => import('./command').then(mod => ({
  default: mod.default.Root as ComponentType<ComponentProps<typeof CommandPrimitive> & { ref?: Ref<HTMLDivElement> }>
})));

export const Sheet = lazy(() => import('./sheet').then(mod => ({
  default: mod.Sheet as ComponentType<DialogPrimitive.DialogProps>
})));

export const AlertDialog = lazy(() => import('./alert-dialog').then(mod => ({
  default: mod.AlertDialog as ComponentType<AlertDialogPrimitive.AlertDialogProps>
})));

// ✅ CLEANUP: Removed nested Suspense wrappers
// RootWrapper handles all Suspense boundaries
export const SuspenseDialog: FC<DialogPrimitive.DialogProps> = (props) => (
  <Dialog {...props} />
);

export const SuspenseCommand: FC<ComponentProps<typeof CommandPrimitive> & { ref?: Ref<HTMLDivElement> }> = (props) => (
  <Command {...props} />
);

export const SuspenseSheet: FC<DialogPrimitive.DialogProps> = (props) => (
  <Sheet {...props} />
);

export const SuspenseAlertDialog: FC<AlertDialogPrimitive.AlertDialogProps> = (props) => (
  <AlertDialog {...props} />
);
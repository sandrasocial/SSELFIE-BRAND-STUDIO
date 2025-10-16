import type { DialogProps as RadixDialogProps } from '@radix-ui/react-dialog';
import type { AlertDialogProps as RadixAlertDialogProps } from '@radix-ui/react-alert-dialog';

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

export interface ErrorBoundaryProps {
  children: React.ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  fallback?: React.ReactNode;
}

export interface CheckoutErrorBoundaryProps extends ErrorBoundaryProps {
  onError: (error: Error) => void;
}
import React from 'react';

// Lazy load UI components
export const Dialog = React.lazy(() => import('./dialog'));
export const Command = React.lazy(() => import('./command'));
export const Sheet = React.lazy(() => import('./sheet'));
export const AlertDialog = React.lazy(() => import('./alert-dialog'));
export const Button = React.lazy(() => import('./button'));
export const Toaster = React.lazy(() => import('./toaster'));
export const TooltipProvider = React.lazy(() => import('./tooltip'));
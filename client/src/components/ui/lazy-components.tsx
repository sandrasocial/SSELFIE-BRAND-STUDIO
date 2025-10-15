import React, { Suspense } from 'react';

const LazyDialog = React.lazy(() => import('./dialog'));
const LazyCommand = React.lazy(() => import('./command'));
const LazySheet = React.lazy(() => import('./sheet'));
const LazyAlertDialog = React.lazy(() => import('./alert-dialog'));

function withSuspense(Component: React.LazyExoticComponent<any>) {
  return function SuspenseWrapped(props: any) {
    return (
      <Suspense fallback={<div className="min-h-[40px] animate-pulse bg-stone-100 rounded-lg" />}>
        <Component {...props} />
      </Suspense>
    );
  };
}

export const Dialog = withSuspense(LazyDialog);
export const Command = withSuspense(LazyCommand);
export const Sheet = withSuspense(LazySheet);
export const AlertDialog = withSuspense(LazyAlertDialog);
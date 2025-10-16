import * as React from 'react';
import type { ComponentProps, FC } from 'react';

interface LoaderProps extends ComponentProps<'div'> {}

const PageLoader: FC<LoaderProps> = React.memo(function PageLoader(props) {
  return (
    <div {...props} className={`min-h-screen flex items-center justify-center bg-black relative ${props.className || ''}`}>
      {/* Editorial gradient backdrop */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-neutral-950 to-neutral-900" />
      
      <div className="relative flex flex-col items-center space-y-editorial-sm editorial-fade-in">
        <div className="editorial-spinner w-8 h-8" />
        <p className="editorial-text-caption text-neutral-400">Loading...</p>
      </div>
    </div>
  );
});

PageLoader.displayName = 'PageLoader';

export default PageLoader;

// Editorial Component Loading
export const ComponentLoader = React.memo(function ComponentLoader(): ReactNode {
  return (
    <div className="flex items-center justify-center p-editorial-sm">
      <div className="editorial-spinner w-6 h-6" />
    </div>
  );
});

// Editorial Button Loading State
export const ButtonLoader = React.memo(function ButtonLoader(): ReactNode {
  return (
    <div className="editorial-spinner w-4 h-4" />
  );
});

export default PageLoader;
import * as React from 'react';
import type { FC, ReactElement } from 'react';

interface LoaderProps {
  className?: string;
}

// ✅ FIX #5: Add timeout display to PageLoader
const PageLoader = React.memo(function PageLoader({ className = '' }: LoaderProps): ReactElement {
  const [elapsedTime, setElapsedTime] = React.useState(0);
  const [showTimeout, setShowTimeout] = React.useState(false);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setElapsedTime(prev => {
        const newTime = prev + 1;
        // Show timeout message after 30 seconds
        if (newTime >= 30) {
          setShowTimeout(true);
        }
        return newTime;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Show timeout error after 30 seconds
  if (showTimeout) {
    return (
      <div className={`min-h-screen flex items-center justify-center bg-black relative ${className}`}>
        <div className="absolute inset-0 bg-gradient-to-br from-black via-neutral-950 to-neutral-900" />

        <div className="relative flex flex-col items-center space-y-editorial-sm editorial-fade-in max-w-md px-4">
          <div className="text-red-500 text-4xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-white mb-2 text-center">Taking Longer Than Expected</h2>
          <p className="text-neutral-400 text-center mb-6">The app is taking longer than usual to load. Please try refreshing the page.</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-white text-black rounded font-semibold hover:bg-neutral-200 transition-colors"
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }

  // Show loading with time indicator after 10 seconds
  const showTimeIndicator = elapsedTime > 10;

  return (
    <div className={`min-h-screen flex items-center justify-center bg-black relative ${className}`}>
      {/* Editorial gradient backdrop */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-neutral-950 to-neutral-900" />

      <div className="relative flex flex-col items-center space-y-editorial-sm editorial-fade-in">
        <div className="editorial-spinner w-8 h-8" />
        <p className="editorial-text-caption text-neutral-400">Loading...</p>
        {showTimeIndicator && (
          <p className="editorial-text-caption text-neutral-500 text-sm mt-4">
            {elapsedTime > 20 ? '⏳ Still loading... (taking longer than expected)' : '⏳ Still loading...'}
          </p>
        )}
      </div>
    </div>
  );
});

PageLoader.displayName = 'PageLoader';

export default PageLoader;

// Editorial Component Loading
export const ComponentLoader = React.memo(function ComponentLoader(): ReactElement {
  return (
    <div className="flex items-center justify-center p-editorial-sm">
      <div className="editorial-spinner w-6 h-6" />
    </div>
  );
});

// Editorial Button Loading State
export const ButtonLoader = React.memo(function ButtonLoader(): ReactElement {
  return (
    <div className="editorial-spinner w-4 h-4" />
  );
});
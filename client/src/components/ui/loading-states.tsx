import React from 'react';

export const LoadingSpinner = () => (
  <div className="flex items-center justify-center h-full w-full">
    <div className="relative w-16 h-16">
      <div className="absolute w-full h-full border-2 border-editorial-gray rounded-full animate-ping" />
      <div className="absolute w-full h-full border border-luxury-black rounded-full animate-pulse" />
    </div>
  </div>
);

export const LoadingBar = () => (
  <div className="w-full h-0.5 bg-editorial-gray overflow-hidden">
    <div 
      className="h-full bg-luxury-black transition-all duration-300"
      style={{
        animation: 'loading 2s infinite',
        width: '30%',
      }}
    />
  </div>
);

export const ContentLoader = () => (
  <div className="space-y-4 w-full animate-pulse">
    <div className="h-8 bg-editorial-gray w-3/4" />
    <div className="h-4 bg-editorial-gray w-1/2" />
    <div className="h-4 bg-editorial-gray w-5/6" />
    <div className="h-4 bg-editorial-gray w-2/3" />
  </div>
);

export const ImageLoader = () => (
  <div className="aspect-square bg-editorial-gray animate-pulse" />
);

// Add to index.css:
const styles = `
@keyframes loading {
  0% {
    transform: translateX(-100%);
  }
  50% {
    transform: translateX(100%);
  }
  100% {
    transform: translateX(-100%);
  }
}
`;
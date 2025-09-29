import { ReactNode } from 'react';

// Editorial Luxury Spinner
export const LoadingSpinner = () => (
  <div className="flex items-center justify-center h-full w-full">
    <div className="editorial-spinner w-16 h-16" />
  </div>
);

// Sophisticated Loading Ring
export const LoadingRing = () => (
  <div className="flex items-center justify-center h-full w-full">
    <div className="relative w-16 h-16">
      <div className="absolute w-full h-full border-2 border-neutral-800/30 rounded-full animate-pulse" />
      <div className="absolute w-full h-full border-2 border-neutral-200 border-b-transparent rounded-full animate-spin" />
    </div>
  </div>
);

// Editorial Progress Bar
export const LoadingBar = () => (
  <div className="editorial-progress">
    <div className="editorial-progress-fill w-1/3 animate-pulse" />
  </div>
);

// Editorial Loading Bar with Animation
export const AnimatedLoadingBar = () => (
  <div className="w-full h-1 bg-neutral-800/30 overflow-hidden rounded-full">
    <div 
      className="h-full bg-gradient-to-r from-neutral-200 to-neutral-300 transition-all duration-300 rounded-full"
      style={{
        animation: 'loading-slide 2s infinite ease-sophisticated',
        width: '30%',
      }}
    />
  </div>
);

// Editorial Content Skeleton
export const ContentLoader = () => (
  <div className="space-y-editorial-sm w-full animate-pulse">
    <div className="h-8 bg-neutral-800/30 rounded-editorial-sm w-3/4" />
    <div className="h-4 bg-neutral-800/20 rounded-editorial-sm w-1/2" />
    <div className="h-4 bg-neutral-800/20 rounded-editorial-sm w-5/6" />
    <div className="h-4 bg-neutral-800/20 rounded-editorial-sm w-2/3" />
  </div>
);

// Editorial Image Skeleton
export const ImageLoader = () => (
  <div className="aspect-square bg-neutral-800/30 animate-pulse rounded-editorial-md" />
);

// Editorial Card Skeleton
export const CardLoader = () => (
  <div className="editorial-card animate-pulse">
    <div className="space-y-editorial-sm">
      <div className="h-6 bg-neutral-800/30 rounded-editorial-sm w-2/3" />
      <div className="h-4 bg-neutral-800/20 rounded-editorial-sm w-full" />
      <div className="h-4 bg-neutral-800/20 rounded-editorial-sm w-3/4" />
    </div>
  </div>
);

// Editorial Loading Animations (automatically included in editorial-luxury.css)
// These keyframes are defined in the editorial luxury system:
// @keyframes loading-slide {
//   0% { transform: translateX(-100%); }
//   50% { transform: translateX(100%); }
//   100% { transform: translateX(-100%); }
// }
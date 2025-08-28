import React from 'react';

// Optimized loading component with minimal DOM footprint
export const PageLoader: React.FC = () => (
  <div className="min-h-screen flex items-center justify-center bg-white">
    <div className="flex flex-col items-center space-y-4">
      <div className="animate-spin w-8 h-8 border-4 border-black border-t-transparent rounded-full" />
      <p className="text-sm text-gray-600 font-light">Loading...</p>
    </div>
  </div>
);

// Minimal loading for smaller components
export const ComponentLoader: React.FC = () => (
  <div className="flex items-center justify-center p-4">
    <div className="animate-spin w-6 h-6 border-3 border-black border-t-transparent rounded-full" />
  </div>
);

export default PageLoader;
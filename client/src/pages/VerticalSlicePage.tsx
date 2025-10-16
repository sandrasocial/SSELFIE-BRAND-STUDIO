/**
 * Vertical Slice Demo Page
 * 
 * A standalone page to demonstrate the complete image generation workflow
 * without requiring complex authentication or routing setup.
 */

import * as React from 'react';
import ImageGenerationVerticalSlice from '../features/vertical-slice/ImageGenerationVerticalSlice';

export const VerticalSlicePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="py-8">
        <ImageGenerationVerticalSlice />
      </div>
    </div>
  );
};

export default VerticalSlicePage;
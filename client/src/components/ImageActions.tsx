import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

interface ImageVariation {
  id: string;
  url: string;
  title?: string;
}

interface ImageActionsProps {
  variations: ImageVariation[];
  selectedIndex?: number;
  onSelect?: (index: number) => void;
  className?: string;
}

const ImageActions: React.FC<ImageActionsProps> = ({
  variations,
  selectedIndex = 0,
  onSelect,
  className = ''
}) => {
  const [compareMode, setCompareMode] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(selectedIndex);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (!compareMode) return;

      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        const newIndex = currentIndex > 0 ? currentIndex - 1 : variations.length - 1;
        setCurrentIndex(newIndex);
        onSelect?.(newIndex);
      } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        const newIndex = currentIndex < variations.length - 1 ? currentIndex + 1 : 0;
        setCurrentIndex(newIndex);
        onSelect?.(newIndex);
      } else if (event.key === 'Escape') {
        setCompareMode(false);
      }
    };

    if (compareMode) {
      document.addEventListener('keydown', handleKeyPress);
      return () => document.removeEventListener('keydown', handleKeyPress);
    }
  }, [compareMode, currentIndex, variations.length, onSelect]);

  // Update current index when selectedIndex prop changes
  useEffect(() => {
    setCurrentIndex(selectedIndex);
  }, [selectedIndex]);

  if (variations.length <= 1) {
    return null;
  }

  const handlePrevious = () => {
    const newIndex = currentIndex > 0 ? currentIndex - 1 : variations.length - 1;
    setCurrentIndex(newIndex);
    onSelect?.(newIndex);
  };

  const handleNext = () => {
    const newIndex = currentIndex < variations.length - 1 ? currentIndex + 1 : 0;
    setCurrentIndex(newIndex);
    onSelect?.(newIndex);
  };

  const currentVariation = variations[currentIndex];
  const nextVariation = variations[(currentIndex + 1) % variations.length];

  return (
    <div className={`image-actions ${className}`}>
      {/* Compare Mode Toggle */}
      {!compareMode && (
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => setCompareMode(true)}
            className="luxury-btn secondary text-xs uppercase tracking-wider"
          >
            Compare ({variations.length})
          </button>
          
          {variations.length > 1 && (
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrevious}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                aria-label="Previous variation"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs text-gray-500 tracking-wider uppercase">
                {currentIndex + 1} of {variations.length}
              </span>
              <button
                onClick={handleNext}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                aria-label="Next variation"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Compare Mode Interface */}
      {compareMode && (
        <div className="fixed inset-0 bg-white z-50 flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center gap-4">
              <h2 
                className="text-xl font-light tracking-wider uppercase"
                style={{ 
                  fontFamily: 'Times New Roman, serif',
                  letterSpacing: '0.25em'
                }}
              >
                Compare Variations
              </h2>
              <div className="text-sm text-gray-500 tracking-wider uppercase">
                {currentIndex + 1} of {variations.length}
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-xs text-gray-500 tracking-wider uppercase">
                Use ← → arrow keys to navigate
              </div>
              <button
                onClick={() => setCompareMode(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                aria-label="Close compare mode"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Side-by-side comparison */}
          <div className="flex-1 flex">
            {/* Current Image */}
            <div className="flex-1 flex flex-col border-r border-gray-200">
              <div className="p-4 border-b border-gray-200 bg-gray-50">
                <div className="text-sm font-medium tracking-wider uppercase">
                  Current
                </div>
                {currentVariation.title && (
                  <div className="text-xs text-gray-500 mt-1">
                    {currentVariation.title}
                  </div>
                )}
              </div>
              <div className="flex-1 flex items-center justify-center p-6">
                <img
                  src={currentVariation.url}
                  alt={`Variation ${currentIndex + 1}`}
                  className="max-w-full max-h-full object-contain"
                />
              </div>
            </div>

            {/* Next Image */}
            <div className="flex-1 flex flex-col">
              <div className="p-4 border-b border-gray-200 bg-gray-50">
                <div className="text-sm font-medium tracking-wider uppercase">
                  Next ({(currentIndex + 1) % variations.length + 1})
                </div>
                {nextVariation.title && (
                  <div className="text-xs text-gray-500 mt-1">
                    {nextVariation.title}
                  </div>
                )}
              </div>
              <div className="flex-1 flex items-center justify-center p-6">
                <img
                  src={nextVariation.url}
                  alt={`Variation ${(currentIndex + 1) % variations.length + 1}`}
                  className="max-w-full max-h-full object-contain"
                />
              </div>
            </div>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center justify-center gap-6 p-6 border-t border-gray-200">
            <button
              onClick={handlePrevious}
              className="flex items-center gap-2 px-6 py-3 border border-gray-300 hover:bg-gray-50 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="text-sm tracking-wider uppercase">Previous</span>
            </button>

            <div className="flex items-center gap-2">
              {variations.map((_, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setCurrentIndex(index);
                    onSelect?.(index);
                  }}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === currentIndex ? 'bg-black' : 'bg-gray-300 hover:bg-gray-400'
                  }`}
                  aria-label={`Go to variation ${index + 1}`}
                />
              ))}
            </div>

            <button
              onClick={handleNext}
              className="flex items-center gap-2 px-6 py-3 border border-gray-300 hover:bg-gray-50 transition-colors"
            >
              <span className="text-sm tracking-wider uppercase">Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageActions;

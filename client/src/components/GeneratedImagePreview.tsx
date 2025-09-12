import React from 'react';

interface GeneratedImagePreviewProps {
  imageUrls: string[];
  isLoading: boolean;
  onSave?: () => void;
}

const skeletons = Array.from({ length: 6 });

const GeneratedImagePreview: React.FC<GeneratedImagePreviewProps> = ({ imageUrls, isLoading, onSave }) => {
  return (
    <div className="generated-image-preview">
      <div className="grid grid-cols-2 gap-2 mb-4">
        {isLoading
          ? skeletons.map((_, i) => (
              <div key={i} className="bg-gray-200 animate-pulse rounded h-28" />
            ))
          : imageUrls.map((url, i) => (
              <img
                key={i}
                src={url}
                alt="Generated preview"
                className="rounded object-cover w-full h-28"
                style={{ background: '#eee' }}
              />
            ))}
      </div>
      <button
        className="text-xs text-gray-700 underline hover:text-black transition-opacity"
        style={{ opacity: isLoading ? 0.5 : 1 }}
        disabled={isLoading}
        onClick={onSave}
      >
        Save to Gallery
      </button>
    </div>
  );
};

export default GeneratedImagePreview;

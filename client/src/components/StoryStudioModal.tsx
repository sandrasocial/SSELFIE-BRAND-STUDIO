import React from 'react';

interface StoryStudioModalProps {
  imageId: string;
  imageUrl: string;
  imageSource?: string;
  onClose: () => void;
  onSuccess: () => void;
}

const StoryStudioModal: React.FC<StoryStudioModalProps> = ({ 
  imageId, 
  imageUrl, 
  imageSource, 
  onClose, 
  onSuccess 
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Video Feature (Beta)
        </h3>
        <p className="text-gray-600 mb-6">
          Video generation is available but may experience occasional stability issues. 
          We are continuously working to improve reliability and user experience.
        </p>
        <div className="flex gap-3">
          <button 
            onClick={onClose}
            className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={() => {
              alert('Enhanced video generation with better stability is coming soon!');
              onClose();
            }}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
          >
            Try Video (Beta)
          </button>
        </div>
      </div>
    </div>
  );
};

export default StoryStudioModal;

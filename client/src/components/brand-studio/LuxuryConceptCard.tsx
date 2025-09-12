import React from 'react';

interface LuxuryConceptCardProps {
  title: string;
  description: string;
  isGenerating?: boolean;
  onGenerate: () => void;
}

const LuxuryConceptCard: React.FC<LuxuryConceptCardProps> = ({ title, description, isGenerating, onGenerate }) => {
  return (
    <div className="luxury-concept-card p-4 border border-gray-200 rounded mb-2 bg-white">
      <h3 className="font-semibold text-base mb-1 text-gray-900">{title}</h3>
      <p className="text-sm text-gray-700 mb-3">{description}</p>
      <button
        className="text-xs text-gray-700 underline hover:text-black transition-opacity"
        style={{ opacity: isGenerating ? 0.5 : 1, pointerEvents: isGenerating ? 'none' : 'auto' }}
        onClick={onGenerate}
        disabled={isGenerating}
      >
        {isGenerating ? 'Generating...' : 'Generate Photos'}
      </button>
    </div>
  );
};

export default LuxuryConceptCard;

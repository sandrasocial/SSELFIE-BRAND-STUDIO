// ConceptCard component for displaying concept details
import React, { useState } from 'react';
import type { ConceptCard as ConceptCardType } from '../../types/maya.js';

interface ConceptCardProps {
  concept: ConceptCardType;
  onGenerate: (concept: ConceptCardType) => Promise<void>;
  expanded?: boolean;
}

export function ConceptCard({ concept, onGenerate, expanded = false }: ConceptCardProps) {
  const [isExpanded, setIsExpanded] = useState(expanded);

  return (
    <div className="bg-white border border-gray-100 rounded-lg p-6 mb-4">
      <div className="flex items-start justify-between">
        <h3 className="text-lg font-medium mb-2">{concept.title}</h3>
        <button
          className="text-gray-400 hover:text-gray-600"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? '−' : '+'}
        </button>
      </div>
      
      {isExpanded && (
        <div className="mt-4 space-y-4">
          <p className="text-gray-600 text-sm">{concept.description}</p>
          
          {concept.fluxPrompt && (
            <div className="bg-gray-50 p-4 rounded">
              <p className="text-xs text-gray-500 mb-2">Technical Details</p>
              <p className="text-sm font-mono">{concept.fluxPrompt}</p>
            </div>
          )}

          {!concept.isGenerating && !concept.hasGenerated && (
            <button
              onClick={() => onGenerate(concept)}
              disabled={concept.isGenerating}
              className="w-full mt-4 py-2 px-4 bg-black text-white rounded-lg disabled:opacity-50"
            >
              Generate Images
            </button>
          )}

          {concept.isGenerating && (
            <div className="text-center py-4">
              <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-sm text-gray-500 mt-2">Generating your concept...</p>
            </div>
          )}

          {concept.generatedImages && concept.generatedImages.length > 0 && (
            <div className="grid grid-cols-2 gap-4 mt-4">
              {concept.generatedImages.map((image, index) => (
                <img
                  key={index}
                  src={image}
                  alt={`Generated concept ${index + 1}`}
                  className="w-full h-48 object-cover rounded-lg"
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
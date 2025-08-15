import React, { memo } from 'react';
import { PhotoshootPrompt, PhotoshootCollection } from './types/photoshoot';
import { PromptCard } from './PromptCard';

interface PromptGridProps {
  collection: PhotoshootCollection;
  canGenerate: boolean;
  onGenerateFromPrompt: (prompt: PhotoshootPrompt) => void;
  onBack: () => void;
}

export const PromptGrid = memo<PromptGridProps>(({
  collection,
  canGenerate,
  onGenerateFromPrompt,
  onBack
}) => {
  return (
    <div>
      {/* Back Button */}
      <button
        onClick={onBack}
        className="px-6 py-3 text-xs uppercase tracking-wide border border-black bg-transparent text-black mb-10 cursor-pointer transition-all duration-300 hover:bg-black hover:text-white focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
        aria-label="Back to collections"
      >
        ← Back to Collections
      </button>

      {/* Collection Header */}
      <div className="text-center mb-16">
        <h2 
          className="font-serif text-[clamp(2rem,4vw,3rem)] font-light uppercase mb-2" 
          style={{ letterSpacing: '0.3em' }}
        >
          {collection.name}
        </h2>
        {collection.subtitle && (
          <h3 
            className="font-serif text-[clamp(1.5rem,3vw,2rem)] font-light uppercase mb-4" 
            style={{ letterSpacing: '0.3em' }}
          >
            {collection.subtitle}
          </h3>
        )}
        <p className="text-gray-600 max-w-2xl mx-auto text-lg font-light">
          {collection.description}
        </p>
      </div>

      {/* LUXURY PROMPT CARDS GALLERY */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {collection.prompts.map((prompt) => (
          <PromptCard
            key={prompt.id}
            prompt={prompt}
            collectionPreview={collection.preview}
            canGenerate={canGenerate}
            onGenerate={() => onGenerateFromPrompt(prompt)}
          />
        ))}
      </div>
    </div>
  );
});

PromptGrid.displayName = 'PromptGrid';
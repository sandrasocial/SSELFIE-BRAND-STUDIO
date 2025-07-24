// client/src/components/collections/FindingMyselfAgainGallery.tsx
import React from 'react';
import PromptCard from './PromptCard';
import { findingMyselfAgainCollection } from '../../data/collections/finding-myself-again';
import { useAuth } from '../../hooks/useAuth';

interface FindingMyselfAgainGalleryProps {
  onPromptSelect: (prompt: any) => void;
}

export default function FindingMyselfAgainGallery({ onPromptSelect }: FindingMyselfAgainGalleryProps) {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-warm-cream to-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Collection Header */}
        <div className="text-center mb-12">
          <h1 className="font-serif text-4xl text-charcoal mb-4">
            {findingMyselfAgainCollection.name}
          </h1>
          <p className="text-lg text-charcoal/80 max-w-2xl mx-auto leading-relaxed">
            {findingMyselfAgainCollection.description}
          </p>
          <div className="mt-6 text-sm text-charcoal/60">
            All previews generated with your personal model
          </div>
        </div>

        {/* Prompt Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {findingMyselfAgainCollection.prompts.map((prompt) => (
            <PromptCard 
              key={prompt.id} 
              prompt={prompt} 
              onPromptSelect={onPromptSelect}
            />
          ))}
        </div>

        {/* Collection Stats */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-6 text-sm text-charcoal/60">
            <span>{findingMyselfAgainCollection.prompts.length} Unique Prompts</span>
            <span>•</span>
            <span>Optimized Parameters</span>
            <span>•</span>
            <span>Your Personal Model</span>
          </div>
        </div>
      </div>
    </div>
  );
}
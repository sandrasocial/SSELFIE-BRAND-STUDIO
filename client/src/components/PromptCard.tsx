// client/src/components/collections/PromptCard.tsx
import React, { useState, useEffect } from 'react';
import { generateImage } from '../../services/imageGeneration';
import { useAuth } from '../../hooks/use-auth';

interface PromptCardProps {
  prompt: {
    id: number;
    title: string;
    prompt: string;
    parameters: {
      guidance: number;
      steps: number;
      lora_strength: number;
    };
    mood: string;
  };
  userModel: string; // Sandra's trained model identifier
}

interface PromptCardProps {
  prompt: {
    id: number;
    title: string;
    prompt: string;
    parameters: {
      guidance: number;
      steps: number;
      lora_strength: number;
    };
    mood: string;
    coverImageUrl?: string; // Pre-approved cover image from database
  };
  onPromptSelect: (prompt: any) => void; // User selects this prompt for their generation
}

export default function PromptCard({ prompt, onPromptSelect }: PromptCardProps) {
  const { user } = useAuth();

  return (
    <div 
      className="bg-white rounded-lg shadow-lg overflow-hidden transition-all duration-300 hover:shadow-2xl cursor-pointer"
      onClick={() => onPromptSelect(prompt)}
    >
      {/* Cover Image Section - Shows Sandra's pre-approved photos */}
      <div className="aspect-[3/4] relative bg-gradient-to-br from-warm-cream to-soft-gray">
        {prompt.coverImageUrl ? (
          <img 
            src={prompt.coverImageUrl} 
            alt={prompt.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center p-4">
              <div className="bg-gold-400/20 rounded-full p-4 mb-3 mx-auto w-16 h-16 flex items-center justify-center">
                <svg className="w-8 h-8 text-gold-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <p className="text-sm text-charcoal/60">Cover photo pending</p>
            </div>
          </div>
        )}
        
        {/* Overlay with prompt info */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
          <h3 className="font-serif text-white text-lg mb-1">{prompt.title}</h3>
          <p className="text-white/80 text-xs">{prompt.mood}</p>
        </div>
      </div>

      {/* Prompt Details */}
      <div className="p-4">
        <div className="mb-3">
          <h4 className="font-medium text-charcoal mb-2">Prompt Details:</h4>
          <p className="text-xs text-charcoal/70 leading-relaxed line-clamp-3">
            {prompt.prompt}
          </p>
        </div>
        
        {/* Technical Parameters */}
        <div className="flex justify-between text-xs text-charcoal/60 mb-3">
          <span>Guidance: {prompt.parameters.guidance}</span>
          <span>Steps: {prompt.parameters.steps}</span>
          <span>LoRA: {prompt.parameters.lora_strength}</span>
        </div>

        {/* User Action - Generate with THEIR model */}
        <div className="flex gap-2">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onPromptSelect(prompt);
            }}
            className="flex-1 bg-charcoal text-white py-2 px-3 rounded-md text-sm font-medium hover:bg-charcoal/90 transition-colors"
          >
            Use This Prompt
          </button>
          <button 
            onClick={(e) => e.stopPropagation()}
            className="p-2 border border-charcoal/20 rounded-md hover:bg-gray-50 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
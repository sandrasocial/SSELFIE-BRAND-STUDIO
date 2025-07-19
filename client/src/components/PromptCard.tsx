// client/src/components/collections/PromptCard.tsx
import React, { useState, useEffect } from 'react';
import { generateImage } from '../../services/imageGeneration';
import { useAuth } from '../../hooks/useAuth';

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

export default function PromptCard({ prompt, userModel }: PromptCardProps) {
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  // Generate preview image using Sandra's model
  const generatePreview = async () => {
    setIsGenerating(true);
    setError(null);
    
    try {
      const result = await generateImage({
        prompt: `${prompt.prompt}, sandra_model_trigger_word, professional photography, editorial quality`,
        guidance_scale: prompt.parameters.guidance,
        num_inference_steps: prompt.parameters.steps,
        lora_scale: prompt.parameters.lora_strength,
        model_id: userModel,
        aspect_ratio: "3:4",
        user_id: user?.id
      });
      
      if (result.success && result.image_url) {
        setPreviewImage(result.image_url);
      } else {
        setError('Failed to generate preview');
      }
    } catch (err) {
      setError('Generation error');
      console.error('Preview generation failed:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  // Auto-generate preview on mount
  useEffect(() => {
    if (userModel && !previewImage) {
      generatePreview();
    }
  }, [userModel, prompt.id]);

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden transition-all duration-300 hover:shadow-2xl">
      {/* Preview Image Section */}
      <div className="aspect-[3/4] relative bg-gradient-to-br from-warm-cream to-soft-gray">
        {isGenerating ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin w-8 h-8 border-2 border-gold-400 border-t-transparent rounded-full mx-auto mb-3"></div>
              <p className="text-sm text-charcoal/60">Generating with your model...</p>
            </div>
          </div>
        ) : previewImage ? (
          <img 
            src={previewImage} 
            alt={prompt.title}
            className="w-full h-full object-cover"
          />
        ) : error ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center p-4">
              <p className="text-sm text-red-600 mb-2">{error}</p>
              <button 
                onClick={generatePreview}
                className="text-xs text-gold-600 hover:text-gold-800 underline"
              >
                Try Again
              </button>
            </div>
          </div>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <button 
              onClick={generatePreview}
              className="bg-gold-400 text-black px-4 py-2 rounded-full text-sm font-medium hover:bg-gold-500 transition-colors"
            >
              Generate Preview
            </button>
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

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button 
            onClick={generatePreview}
            disabled={isGenerating}
            className="flex-1 bg-charcoal text-white py-2 px-3 rounded-md text-sm font-medium hover:bg-charcoal/90 transition-colors disabled:opacity-50"
          >
            {isGenerating ? 'Generating...' : 'Use This Prompt'}
          </button>
          <button className="p-2 border border-charcoal/20 rounded-md hover:bg-gray-50 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
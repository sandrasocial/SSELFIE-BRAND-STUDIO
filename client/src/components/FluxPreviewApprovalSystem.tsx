// client/src/components/FluxPreviewApprovalSystem.tsx - Admin-only Sandra model generation & approval
import React, { useState } from 'react';
import { generateImage } from '../services/imageGeneration';
import { useAuth } from '../hooks/use-auth';

interface FluxPreviewProps {
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
  onApproveImage: (promptId: number, imageUrl: string) => void;
}

export default function FluxPreviewApprovalSystem({ prompt, onApproveImage }: FluxPreviewProps) {
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const { user } = useAuth();

  // Only admin (Sandra) can use this component
  if (user?.role !== 'admin') {
    return <div className="text-red-500">Admin access required</div>;
  }

  const generatePreviews = async () => {
    setIsGenerating(true);
    try {
      // Generate 4 variations using Sandra's model ONLY
      const results = await Promise.all([1, 2, 3, 4].map(async (i) => {
        const result = await generateImage({
          prompt: `${prompt.prompt}, professional photography, editorial quality, variation ${i}`,
          guidance_scale: prompt.parameters.guidance,
          num_inference_steps: prompt.parameters.steps,
          lora_scale: prompt.parameters.lora_strength,
          model_id: "sandra_sselfie_model_v1", // Hardcoded Sandra's model
          aspect_ratio: "3:4",
          user_id: user?.id
        });
        return result.success ? result.image_url : null;
      }));

      setPreviewImages(results.filter(Boolean) as string[]);
    } catch (error) {
      console.error('Preview generation failed:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const saveAsCoverImage = async () => {
    if (!selectedImage) return;
    
    try {
      // Save to permanent URL and database
      const response = await fetch('/api/save-cover-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          promptId: prompt.id,
          tempImageUrl: selectedImage,
          collectionId: 'finding-myself-again'
        })
      });
      
      const result = await response.json();
      if (result.success) {
        onApproveImage(prompt.id, result.permanentUrl);
        alert('Image approved and saved as cover!');
      }
    } catch (error) {
      console.error('Save cover image failed:', error);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
      <div className="mb-4">
        <h3 className="font-serif text-xl mb-2">{prompt.title}</h3>
        <p className="text-sm text-gray-600 mb-2">{prompt.prompt}</p>
        <div className="text-xs text-gray-500">
          Guidance: {prompt.parameters.guidance} | Steps: {prompt.parameters.steps} | LoRA: {prompt.parameters.lora_strength}
        </div>
      </div>

      {/* Generate Button */}
      <button
        onClick={generatePreviews}
        disabled={isGenerating}
        className="bg-gold-400 text-black px-4 py-2 rounded-md font-medium hover:bg-gold-500 transition-colors disabled:opacity-50"
      >
        {isGenerating ? 'Generating 4 Previews...' : 'Generate Previews (Sandra Model)'}
      </button>

      {/* Preview Grid */}
      {previewImages.length > 0 && (
        <div className="mt-6">
          <h4 className="font-medium mb-3">Select Best Image for Cover:</h4>
          <div className="grid grid-cols-2 gap-4 mb-4">
            {previewImages.map((imageUrl, index) => (
              <div key={index} className="relative">
                <img
                  src={imageUrl}
                  alt={`Preview ${index + 1}`}
                  className={`w-full aspect-[3/4] object-cover rounded-lg cursor-pointer border-2 transition-all ${
                    selectedImage === imageUrl 
                      ? 'border-gold-400 ring-2 ring-gold-200' 
                      : 'border-gray-200 hover:border-gold-300'
                  }`}
                  onClick={() => setSelectedImage(imageUrl)}
                />
                {selectedImage === imageUrl && (
                  <div className="absolute top-2 right-2 bg-gold-400 text-black px-2 py-1 rounded-full text-xs font-medium">
                    SELECTED
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Approval Actions */}
          <div className="flex gap-3">
            <button
              onClick={saveAsCoverImage}
              disabled={!selectedImage}
              className="bg-green-600 text-white px-4 py-2 rounded-md font-medium hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              ✓ Approve & Save as Cover
            </button>
            <button
              onClick={() => setPreviewImages([])}
              className="bg-gray-500 text-white px-4 py-2 rounded-md font-medium hover:bg-gray-600 transition-colors"
            >
              Regenerate
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
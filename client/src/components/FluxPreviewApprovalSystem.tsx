import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface FluxPreviewApprovalSystemProps {
  userId: string;
  onApproval: (imageUrl: string) => void;
}

export default function FluxPreviewApprovalSystem({ userId, onApproval }: FluxPreviewApprovalSystemProps) {
  const { toast } = useToast();
  const [generatedImages, setGeneratedImages] = useState<{ [key: string]: string[] }>({});
  const [selectedPrompt, setSelectedPrompt] = useState('');

  const generateImagesMutation = useMutation({
    mutationFn: async ({ prompt, promptId }: { prompt: string; promptId: string }) => {
      const imagePromises = Array.from({ length: 3 }, () =>
        apiRequest('POST', '/api/generate-image', {
          prompt,
          guidance: 2.8,
          steps: 40,
          lora_strength: 0.95,
          quality: 95
        }).then(res => res.json())
      );
      
      const results = await Promise.all(imagePromises);
      return { promptId, images: results.map(r => r.image_url) };
    },
    onSuccess: ({ promptId, images }) => {
      setGeneratedImages(prev => ({ ...prev, [promptId]: images }));
      toast({
        title: "Images Generated",
        description: `3 preview images created for ${promptId}`,
      });
    },
    onError: (error) => {
      toast({
        title: "Generation Failed", 
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const saveImageMutation = useMutation({
    mutationFn: async (imageUrl: string) => {
      const response = await apiRequest('POST', '/api/save-cover-image', { imageUrl });
      return response.json();
    },
    onSuccess: (data) => {
      onApproval(data.permanentUrl);
      toast({
        title: "Cover Image Saved",
        description: "Image approved and saved as collection cover",
      });
    },
  });

  const handleGenerateImages = (prompt: string, promptId: string) => {
    generateImagesMutation.mutate({ prompt, promptId });
  };

  const handleImageApproval = (imageUrl: string) => {
    saveImageMutation.mutate(imageUrl);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle style={{ fontFamily: 'Times New Roman, serif' }}>
          Collection Cover Preview System
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <textarea
              value={selectedPrompt}
              onChange={(e) => setSelectedPrompt(e.target.value)}
              placeholder="Enter prompt with [triggerword] placeholder..."
              className="w-full h-24 p-3 border border-gray-300 rounded-lg"
            />
            
            <Button
              onClick={() => handleGenerateImages(selectedPrompt, 'preview')}
              disabled={generateImagesMutation.isPending || !selectedPrompt.trim()}
              className="mt-2"
            >
              {generateImagesMutation.isPending ? 'Generating...' : 'Generate 3 Preview Images'}
            </Button>
          </div>

          {generatedImages['preview'] && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {generatedImages['preview'].map((imageUrl, index) => (
                <div key={index} className="space-y-2">
                  <img 
                    src={imageUrl} 
                    alt={`Preview ${index + 1}`}
                    className="w-full h-48 object-cover rounded-lg"
                  />
                  <Button
                    onClick={() => handleImageApproval(imageUrl)}
                    disabled={saveImageMutation.isPending}
                    size="sm"
                    className="w-full"
                  >
                    {saveImageMutation.isPending ? 'Saving...' : 'Approve as Cover'}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
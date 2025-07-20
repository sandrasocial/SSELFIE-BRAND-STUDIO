import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Download, Eye, Check, X, RefreshCw } from 'lucide-react';

interface EnhancedFluxPreviewSystemProps {
  userId: string;
  collection: any;
  onApproval: (imageUrl: string) => void;
}

export default function EnhancedFluxPreviewSystem({ userId, collection, onApproval }: EnhancedFluxPreviewSystemProps) {
  const { toast } = useToast();
  const [generatedImages, setGeneratedImages] = useState<{ [key: string]: string[] }>({});
  const [selectedPrompt, setSelectedPrompt] = useState('');
  const [customPrompt, setCustomPrompt] = useState('');
  const [fullSizeImage, setFullSizeImage] = useState<string | null>(null);
  const [approvedImages, setApprovedImages] = useState<Set<string>>(new Set());

  const generateImagesMutation = useMutation({
    mutationFn: async ({ prompt, promptId }: { prompt: string; promptId: string }) => {
      // Generate 3 images in parallel for better preview options
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
      return { promptId, images: results.map(r => r.image_url).filter(url => url) };
    },
    onSuccess: ({ promptId, images }) => {
      setGeneratedImages(prev => ({ ...prev, [promptId]: images }));
      toast({
        title: "Images Generated Successfully",
        description: `Generated ${images.length} preview images`,
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

  const handlePromptGeneration = (prompt: string, promptId: string) => {
    generateImagesMutation.mutate({ prompt, promptId });
  };

  const handleCustomGeneration = () => {
    if (!customPrompt.trim()) return;
    const customId = `custom-${Date.now()}`;
    generateImagesMutation.mutate({ prompt: customPrompt, promptId: customId });
  };

  const approveImage = (imageUrl: string) => {
    setApprovedImages(prev => new Set([...prev, imageUrl]));
    onApproval(imageUrl);
    toast({
      title: "Image Approved",
      description: "Cover image approved for collection",
    });
  };

  const downloadImage = async (imageUrl: string, filename?: string) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename || `flux-preview-${Date.now()}.jpg`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "Could not download image",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-8">
      {/* Custom Prompt Generation */}
      <Card>
        <CardHeader>
          <CardTitle style={{ fontFamily: 'Times New Roman, serif' }}>
            Custom Prompt Generation
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
            placeholder="Enter custom prompt for cover image generation..."
            className="min-h-[100px]"
          />
          <Button 
            onClick={handleCustomGeneration}
            disabled={generateImagesMutation.isPending || !customPrompt.trim()}
            className="bg-black text-white hover:bg-gray-800"
          >
            {generateImagesMutation.isPending ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              'Generate Custom Preview'
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Collection Prompt Quick Selection */}
      <Card>
        <CardHeader>
          <CardTitle style={{ fontFamily: 'Times New Roman, serif' }}>
            Quick Select from "{collection.title}" Collection
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {collection.prompts.slice(0, 8).map((prompt: any) => (
              <button
                key={prompt.id}
                onClick={() => handlePromptGeneration(prompt.prompt, prompt.id)}
                disabled={generateImagesMutation.isPending}
                className="text-left p-3 text-sm bg-gray-50 hover:bg-gray-100 border border-gray-200 hover:border-gray-300 transition-colors disabled:opacity-50"
              >
                <div className="font-medium mb-1">{prompt.title}</div>
                <div className="text-gray-600 text-xs line-clamp-2">
                  {prompt.prompt.substring(0, 80)}...
                </div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Generated Images Gallery */}
      {Object.keys(generatedImages).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle style={{ fontFamily: 'Times New Roman, serif' }}>
              Generated Previews
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              {Object.entries(generatedImages).map(([promptId, images]) => (
                <div key={promptId} className="space-y-4">
                  <h3 className="text-lg font-medium">
                    {collection.prompts.find((p: any) => p.id === promptId)?.title || 'Custom Generation'}
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {images.map((imageUrl, index) => (
                      <div key={index} className="relative group">
                        <div className="aspect-[3/4] bg-gray-100 overflow-hidden">
                          <img
                            src={imageUrl}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform duration-300"
                            onClick={() => setFullSizeImage(imageUrl)}
                          />
                        </div>
                        
                        {/* Image Actions */}
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          <div className="flex flex-col space-y-1">
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => setFullSizeImage(imageUrl)}
                              className="bg-white/90 hover:bg-white"
                            >
                              <Eye className="w-3 h-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => downloadImage(imageUrl, `${promptId}-${index + 1}.jpg`)}
                              className="bg-white/90 hover:bg-white"
                            >
                              <Download className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>

                        {/* Bottom Actions */}
                        <div className="absolute bottom-2 left-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              onClick={() => approveImage(imageUrl)}
                              disabled={approvedImages.has(imageUrl)}
                              className={`flex-1 ${
                                approvedImages.has(imageUrl)
                                  ? 'bg-green-600 text-white'
                                  : 'bg-black text-white hover:bg-gray-800'
                              }`}
                            >
                              {approvedImages.has(imageUrl) ? (
                                <>
                                  <Check className="w-3 h-3 mr-1" />
                                  Approved
                                </>
                              ) : (
                                'Approve'
                              )}
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Full Size Image Modal */}
      {fullSizeImage && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
          onClick={() => setFullSizeImage(null)}
        >
          <div className="relative max-w-full max-h-full">
            <img
              src={fullSizeImage}
              alt="Full size preview"
              className="max-w-full max-h-full object-contain"
              onClick={(e) => e.stopPropagation()}
            />
            
            {/* Modal Actions */}
            <div className="absolute top-4 right-4 flex space-x-2">
              <Button
                onClick={() => approveImage(fullSizeImage)}
                disabled={approvedImages.has(fullSizeImage)}
                className={`${
                  approvedImages.has(fullSizeImage)
                    ? 'bg-green-600 text-white'
                    : 'bg-black text-white hover:bg-gray-800'
                }`}
              >
                {approvedImages.has(fullSizeImage) ? (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Approved
                  </>
                ) : (
                  'Approve for Collection'
                )}
              </Button>
              
              <Button
                onClick={() => downloadImage(fullSizeImage)}
                variant="secondary"
                className="bg-white text-black hover:bg-gray-100"
              >
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
              
              <Button
                onClick={() => setFullSizeImage(null)}
                variant="secondary"
                className="bg-gray-600 text-white hover:bg-gray-700"
              >
                <X className="w-4 h-4 mr-2" />
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Generation Status */}
      {generateImagesMutation.isPending && (
        <Card>
          <CardContent className="text-center py-8">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600">Generating preview images with Sandra's model...</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
import React, { useState, useCallback } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { MemberNavigation } from '@/components/member-navigation';
import { GlobalFooter } from '@/components/global-footer';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Upload, Camera, Sparkles, CheckCircle } from 'lucide-react';

export default function ShannonTraining() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [trainingStatus, setTrainingStatus] = useState<'idle' | 'uploading' | 'training' | 'complete'>('idle');

  // Handle image selection and conversion to base64
  const handleImageSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const result = e.target?.result as string;
          if (result) {
            setSelectedImages(prev => [...prev, result]);
          }
        };
        reader.readAsDataURL(file);
      }
    });
  }, []);

  // Remove selected image
  const removeImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
  };

  // Start model training
  const startTraining = useMutation({
    mutationFn: async (images: string[]) => {
      setTrainingStatus('uploading');
      const result = await apiRequest('/api/start-model-training', 'POST', {
        selfieImages: images
      });
      return result;
    },
    onSuccess: (data) => {
      toast({
        title: "Training Started!",
        description: `Shannon's AI model training has begun. This will take 20-30 minutes.`
      });
      setTrainingStatus('training');
      queryClient.invalidateQueries({ queryKey: ['/api/user-model'] });
    },
    onError: (error: any) => {
      toast({
        title: "Training Failed",
        description: error.message || "Failed to start training",
        variant: "destructive"
      });
      setTrainingStatus('idle');
    }
  });

  const canStartTraining = selectedImages.length >= 5;
  const progressPercentage = Math.min((selectedImages.length / 10) * 100, 100);

  return (
    <div className="min-h-screen bg-white">
      <MemberNavigation />
      
      <main className="pt-32 pb-16">
        <div className="max-w-4xl mx-auto px-6">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-serif text-black mb-6">
              Train Shannon's AI Model
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Upload 5-10 high-quality selfies to create Shannon's personalized AI model for Soul Resets business.
            </p>
          </div>

          {/* Progress Indicator */}
          <Card className="p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-gray-700">
                Training Progress: {selectedImages.length}/10 images
              </span>
              <span className="text-sm text-gray-500">
                {canStartTraining ? 'Ready to train!' : `Need ${5 - selectedImages.length} more images`}
              </span>
            </div>
            <Progress value={progressPercentage} className="mb-2" />
            <p className="text-xs text-gray-500">
              Minimum 5 images required, 10 recommended for best results
            </p>
          </Card>

          {/* Upload Area */}
          <Card className="p-8 mb-8">
            <div className="text-center">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageSelect}
                className="hidden"
                id="image-upload"
                disabled={trainingStatus !== 'idle'}
              />
              <label
                htmlFor="image-upload"
                className="cursor-pointer inline-flex flex-col items-center justify-center w-full p-12 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 transition-colors"
              >
                <Upload className="w-12 h-12 text-gray-400 mb-4" />
                <span className="text-lg font-medium text-gray-700 mb-2">
                  Click to upload selfies
                </span>
                <span className="text-sm text-gray-500">
                  JPG, PNG, or WebP files • Max 10MB each
                </span>
              </label>
            </div>
          </Card>

          {/* Selected Images Grid */}
          {selectedImages.length > 0 && (
            <Card className="p-6 mb-8">
              <h3 className="text-lg font-semibold mb-4">
                Selected Images ({selectedImages.length})
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {selectedImages.map((image, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={image}
                      alt={`Selfie ${index + 1}`}
                      className="w-full aspect-square object-cover rounded-lg"
                    />
                    <button
                      onClick={() => removeImage(index)}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm opacity-0 group-hover:opacity-100 transition-opacity"
                      disabled={trainingStatus !== 'idle'}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Training Controls */}
          <Card className="p-6">
            <div className="flex flex-col items-center">
              {trainingStatus === 'idle' && (
                <Button
                  onClick={() => startTraining.mutate(selectedImages)}
                  disabled={!canStartTraining || startTraining.isPending}
                  className="bg-black text-white hover:bg-gray-800 px-8 py-3 text-lg"
                >
                  {startTraining.isPending ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Starting Training...
                    </div>
                  ) : canStartTraining ? (
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-5 h-5" />
                      Start Training Shannon's AI
                    </div>
                  ) : (
                    `Upload ${5 - selectedImages.length} More Photos`
                  )}
                </Button>
              )}

              {trainingStatus === 'training' && (
                <div className="text-center">
                  <div className="flex items-center gap-2 text-lg font-medium text-green-600 mb-2">
                    <CheckCircle className="w-5 h-5" />
                    Training In Progress
                  </div>
                  <p className="text-gray-600 mb-4">
                    Shannon's AI model is being trained. This typically takes 20-30 minutes.
                  </p>
                  <div className="w-8 h-8 border-2 border-gray-300 border-t-black rounded-full animate-spin mx-auto" />
                </div>
              )}
            </div>
          </Card>

          {/* User Info */}
          <div className="mt-8 text-center text-sm text-gray-500">
            <p>Training for: {user?.email}</p>
            <p>Business: Soul Resets Sound Healing</p>
            <p>Location: Marbella, Spain</p>
          </div>
        </div>
      </main>

      <GlobalFooter />
    </div>
  );
}
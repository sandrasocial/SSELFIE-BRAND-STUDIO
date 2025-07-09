import React, { useState, useRef } from 'react';
import { Navigation } from '@/components/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useMutation, useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

export default function SimpleAITraining() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isTraining, setIsTraining] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Check if user already has a model
  const { data: userModel } = useQuery({
    queryKey: ['/api/user-model'],
    retry: false,
  });

  const startTrainingMutation = useMutation({
    mutationFn: async (selfieImages: string[]) => {
      return apiRequest('POST', '/api/start-model-training', { selfieImages });
    },
    onSuccess: () => {
      setIsTraining(true);
      toast({
        title: "Training Started!",
        description: "Your AI model is now training. This takes 24-48 hours.",
      });
    },
    onError: (error) => {
      console.error('Training failed:', error);
      toast({
        title: "Training Failed",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setUploadedFiles(prev => [...prev, ...files]);
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const startTraining = async () => {
    if (uploadedFiles.length < 10) {
      toast({
        title: "Need More Photos",
        description: "Please upload at least 10 selfies for best results.",
        variant: "destructive",
      });
      return;
    }

    // Convert files to base64
    const selfieImages = await Promise.all(
      uploadedFiles.map(file => {
        return new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });
      })
    );

    await startTrainingMutation.mutateAsync(selfieImages);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-white">
        <Navigation />
        <div className="pt-20 px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h1 className="text-4xl mb-4" style={{ fontFamily: 'Times New Roman, serif' }}>
              Please Sign In
            </h1>
            <p className="text-gray-600">
              You need to be signed in to train your AI model.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      <div className="pt-20 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-5xl mb-6" style={{ fontFamily: 'Times New Roman, serif' }}>
              Train Your SSELFIE AI
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Upload 10+ selfies to create your personalized AI model. 
              The more variety, the better your results.
            </p>
          </div>

          {/* Model Status */}
          {userModel && (
            <div className="bg-gray-50 rounded-lg p-6 mb-8">
              <h3 className="text-xl font-medium mb-2">Current Model Status</h3>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600">Status:</span>
                <span className={`px-3 py-1 rounded-full text-sm ${
                  userModel.trainingStatus === 'completed' 
                    ? 'bg-green-100 text-green-800' 
                    : userModel.trainingStatus === 'in_progress'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {userModel.trainingStatus === 'completed' ? 'Ready' : 
                   userModel.trainingStatus === 'in_progress' ? 'Training' : 'Not Started'}
                </span>
              </div>
              {userModel.trainingStatus === 'completed' && (
                <p className="text-sm text-gray-600 mt-2">
                  Your AI model is ready! You can retrain with new photos if needed.
                </p>
              )}
            </div>
          )}

          {/* Upload Area */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center mb-8">
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
            
            <div className="mb-6">
              <div className="text-6xl mb-4">📸</div>
              <h3 className="text-2xl mb-2" style={{ fontFamily: 'Times New Roman, serif' }}>
                Upload Your Selfies
              </h3>
              <p className="text-gray-600 mb-6">
                Drag & drop or click to select 10+ selfie photos
              </p>
              
              <button
                onClick={() => fileInputRef.current?.click()}
                className="bg-black text-white px-8 py-3 hover:bg-gray-800 transition-colors"
              >
                Choose Photos
              </button>
            </div>
            
            <div className="text-sm text-gray-500">
              <p>• Use clear, well-lit selfies</p>
              <p>• Include different angles and expressions</p>
              <p>• Avoid group photos or photos with others</p>
            </div>
          </div>

          {/* Uploaded Files */}
          {uploadedFiles.length > 0 && (
            <div className="mb-8">
              <h3 className="text-xl mb-4" style={{ fontFamily: 'Times New Roman, serif' }}>
                Uploaded Photos ({uploadedFiles.length})
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {uploadedFiles.map((file, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={URL.createObjectURL(file)}
                      alt={`Selfie ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg"
                    />
                    <button
                      onClick={() => removeFile(index)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 text-sm opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Training Button */}
          <div className="text-center">
            <button
              onClick={startTraining}
              disabled={uploadedFiles.length < 10 || isTraining || startTrainingMutation.isPending}
              className="bg-black text-white px-12 py-4 text-lg disabled:bg-gray-400 disabled:cursor-not-allowed hover:bg-gray-800 transition-colors"
            >
              {startTrainingMutation.isPending ? 'Starting Training...' :
               isTraining ? 'Training In Progress' :
               uploadedFiles.length < 10 ? `Need ${10 - uploadedFiles.length} More Photos` :
               'Start AI Training'}
            </button>
            
            {uploadedFiles.length >= 10 && !isTraining && (
              <p className="text-sm text-gray-600 mt-4">
                Training takes 24-48 hours. You'll be notified when it's complete.
              </p>
            )}
          </div>

          {/* Training Status */}
          {(isTraining || userModel?.trainingStatus === 'in_progress') && (
            <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
              <h3 className="text-lg font-medium text-yellow-800 mb-2">
                Training In Progress
              </h3>
              <p className="text-yellow-700">
                Your AI model is being trained with your selfies. This process takes 24-48 hours.
                We'll notify you when it's ready!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
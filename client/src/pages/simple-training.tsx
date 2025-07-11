import { useState } from 'react';
import { Navigation } from '@/components/navigation';
import { HeroFullBleed } from '@/components/HeroFullBleed';
import { SandraImages } from '@/lib/sandra-images';
import { useAuth } from '@/hooks/use-auth';
import { Link, useLocation } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

export default function SimpleTraining() {
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [selfieImages, setSelfieImages] = useState<File[]>([]);
  const [isTrainingStarted, setIsTrainingStarted] = useState(false);

  // Check if user already has a model
  const { data: userModel } = useQuery({
    queryKey: ['/api/user-model'],
    retry: false,
    enabled: isAuthenticated
  });

  // Start model training mutation
  const startTraining = useMutation({
    mutationFn: async (images: string[]) => {
      const response = await apiRequest('POST', '/api/start-model-training', {
        selfieImages: images
      });
      return response.json();
    },
    onSuccess: () => {
      setIsTrainingStarted(true);
      toast({
        title: "Training Started!",
        description: "Your AI model is now training. This takes about 20 minutes.",
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

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setSelfieImages(prev => [...prev, ...files]);
  };

  const removeImage = (index: number) => {
    setSelfieImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleStartTraining = async () => {
    if (selfieImages.length < 10) {
      toast({
        title: "Need More Photos",
        description: "Please upload at least 10 selfies for best results.",
        variant: "destructive",
      });
      return;
    }

    // Convert files to base64
    const imageStrings = await Promise.all(
      selfieImages.map(file => 
        new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = () => {
            const base64 = (reader.result as string).split(',')[1];
            resolve(base64);
          };
          reader.readAsDataURL(file);
        })
      )
    );

    await startTraining.mutateAsync(imageStrings);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-white">
        <Navigation />
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <h1 className="text-3xl font-light mb-4" style={{ fontFamily: 'Times New Roman, serif' }}>
            Login Required
          </h1>
          <p className="text-gray-600 mb-8">
            Please log in to access AI training.
          </p>
          <button
            onClick={() => window.location.href = '/api/login'}
            className="bg-black text-white px-8 py-3 text-xs uppercase tracking-wider hover:bg-gray-800 transition-colors"
          >
            LOG IN
          </button>
        </div>
      </div>
    );
  }

  if (isTrainingStarted || (userModel && userModel.trainingStatus === 'training')) {
    return (
      <div className="min-h-screen bg-white">
        <Navigation />
        
        <HeroFullBleed
          backgroundImage={SandraImages.ai.professional1}
          title="AI TRAINING IN PROGRESS"
          tagline="Your personal model is being created"
          alignment="center"
        />

        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <h2 className="text-3xl font-light mb-6" style={{ fontFamily: 'Times New Roman, serif' }}>
            Training Started Successfully!
          </h2>
          
          <div className="bg-gray-100 p-8 mb-12">
            <div className="text-lg mb-4">Your AI model is training now...</div>
            <div className="text-gray-600 mb-6">
              This process takes approximately 20 minutes. You'll receive an email when it's ready.
            </div>
            <div className="text-sm text-gray-500">
              Training ID: {userModel?.triggerWord || 'Processing...'}
            </div>
          </div>

          <div className="space-y-6 mb-12">
            <div className="text-lg font-medium">While you wait:</div>
            <div className="grid md:grid-cols-2 gap-6">
              <Link href="/selfie-guide">
                <div className="border border-gray-200 p-6 hover:bg-gray-50 cursor-pointer">
                  <h3 className="font-medium mb-2">Review Selfie Guide</h3>
                  <p className="text-sm text-gray-600">Learn professional selfie techniques for better results</p>
                </div>
              </Link>
              <Link href="/workspace">
                <div className="border border-gray-200 p-6 hover:bg-gray-50 cursor-pointer">
                  <h3 className="font-medium mb-2">Explore Your Studio</h3>
                  <p className="text-sm text-gray-600">Set up your workspace and plan your brand</p>
                </div>
              </Link>
            </div>
          </div>

          <Link href="/workspace">
            <button className="bg-black text-white px-8 py-4 text-xs uppercase tracking-wider hover:bg-gray-800 transition-colors">
              Go to Studio Dashboard
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      
      <HeroFullBleed
        backgroundImage={SandraImages.hero.training}
        title="TRAIN YOUR AI"
        tagline="Upload your selfies to create your personal model"
        alignment="center"
      />

      <div className="max-w-4xl mx-auto px-4 py-16">
        {/* Training Instructions */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-light mb-6" style={{ fontFamily: 'Times New Roman, serif' }}>
            Create Your Personal AI Model
          </h2>
          <p className="text-lg text-gray-700 max-w-2xl mx-auto mb-8">
            Upload 10-15 high-quality selfies to train your personal AI model. The better your photos, 
            the better your AI-generated brand photos will be.
          </p>
          
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <div className="text-center">
              <div className="text-2xl font-light mb-2" style={{ fontFamily: 'Times New Roman, serif' }}>01</div>
              <h3 className="font-medium mb-2">Upload Photos</h3>
              <p className="text-sm text-gray-600">Clear, well-lit selfies from different angles</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-light mb-2" style={{ fontFamily: 'Times New Roman, serif' }}>02</div>
              <h3 className="font-medium mb-2">AI Training</h3>
              <p className="text-sm text-gray-600">Your model trains for 20 minutes</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-light mb-2" style={{ fontFamily: 'Times New Roman, serif' }}>03</div>
              <h3 className="font-medium mb-2">Generate Photos</h3>
              <p className="text-sm text-gray-600">Create professional brand photos instantly</p>
            </div>
          </div>
        </div>

        {/* File Upload Area */}
        <div className="border-2 border-dashed border-gray-300 p-12 text-center mb-8">
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
            id="selfie-upload"
          />
          <label htmlFor="selfie-upload" className="cursor-pointer">
            <div className="text-4xl mb-4">📸</div>
            <div className="text-lg mb-2">Drop your selfies here or click to browse</div>
            <div className="text-sm text-gray-500">
              {selfieImages.length}/10+ photos uploaded
            </div>
          </label>
        </div>

        {/* Photo Preview Grid */}
        {selfieImages.length > 0 && (
          <div className="mb-8">
            <h3 className="text-lg font-medium mb-4">Uploaded Photos ({selfieImages.length})</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {selfieImages.map((file, index) => (
                <div key={index} className="relative">
                  <img
                    src={URL.createObjectURL(file)}
                    alt={`Selfie ${index + 1}`}
                    className="w-full h-24 object-cover border border-gray-200"
                  />
                  <button
                    onClick={() => removeImage(index)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 text-xs hover:bg-red-600"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Training Tips */}
        <div className="bg-gray-50 p-8 mb-12">
          <h3 className="text-lg font-medium mb-4">Tips for Best Results:</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-green-600 mb-2">✓ DO</h4>
              <ul className="text-sm space-y-1 text-gray-600">
                <li>• Use natural lighting</li>
                <li>• Include different angles and expressions</li>
                <li>• Clear, high-resolution photos</li>
                <li>• Show your face clearly</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-red-600 mb-2">✗ AVOID</h4>
              <ul className="text-sm space-y-1 text-gray-600">
                <li>• Blurry or dark photos</li>
                <li>• Heavy filters or effects</li>
                <li>• Group photos with multiple people</li>
                <li>• Sunglasses or face coverings</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="text-center space-x-4">
          <Link href="/selfie-guide">
            <button className="border border-gray-300 text-gray-700 px-8 py-3 text-xs uppercase tracking-wider hover:bg-gray-50 transition-colors">
              View Photo Guide
            </button>
          </Link>
          
          <button
            onClick={handleStartTraining}
            disabled={selfieImages.length < 10 || startTraining.isPending}
            className="bg-black text-white px-8 py-4 text-xs uppercase tracking-wider hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {startTraining.isPending ? 'Starting Training...' : 'Start AI Training'}
          </button>
        </div>

        {selfieImages.length < 10 && (
          <div className="text-center mt-4">
            <p className="text-sm text-gray-500">
              Upload {10 - selfieImages.length} more photos to begin training
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
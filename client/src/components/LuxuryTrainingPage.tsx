import React, { useState, useRef, useEffect } from 'react';
import { Upload, Camera, User, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { useAuth } from '../hooks/use-auth';
import { useToast } from '../hooks/use-toast';
import { useMutation, useQuery } from '@tanstack/react-query';
import { apiRequest } from '../lib/queryClient';
import '../styles/luxury-mobile.css';

export function LuxuryTrainingPage() {
  const { isAuthenticated, user } = useAuth();
  const { toast } = useToast();
  
  const [selfieImages, setSelfieImages] = useState<File[]>([]);
  const [isTrainingStarted, setIsTrainingStarted] = useState(false);
  const [trainingProgress, setTrainingProgress] = useState(0);
  const [userGender, setUserGender] = useState('');
  const [isUploadingImages, setIsUploadingImages] = useState(false);
  const [uploadErrors, setUploadErrors] = useState<string[]>([]);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Check user model status
  const { data: userModel, refetch: refetchUserModel } = useQuery({
    queryKey: ['/api/user-model'],
    enabled: isAuthenticated,
    refetchInterval: 30000, // Check every 30 seconds
    retry: 1
  });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const validImages = files.filter(file => 
      file.type.startsWith('image/') && file.size <= 10 * 1024 * 1024 // 10MB limit
    );
    
    if (validImages.length !== files.length) {
      toast({
        title: "Invalid files detected",
        description: "Only image files under 10MB are allowed",
        variant: "destructive"
      });
    }
    
    setSelfieImages(prev => [...prev, ...validImages].slice(0, 20)); // Max 20 images
  };

  const removeImage = (index: number) => {
    setSelfieImages(prev => prev.filter((_, i) => i !== index));
  };

  // Training mutation
  const startTrainingMutation = useMutation({
    mutationFn: async (data: { images: File[]; gender: string }) => {
      const formData = new FormData();
      data.images.forEach((image, index) => {
        formData.append(`image_${index}`, image);
      });
      formData.append('gender', data.gender);
      
      return apiRequest('/api/start-training', {
        method: 'POST',
        body: formData
      });
    },
    onSuccess: () => {
      setIsTrainingStarted(true);
      toast({
        title: "Training Started!",
        description: "Your personal AI model is being trained. This usually takes 20-30 minutes.",
      });
      // Start polling for progress
      refetchUserModel();
    },
    onError: (error: any) => {
      toast({
        title: "Training Failed",
        description: error.message || "Failed to start training. Please try again.",
        variant: "destructive"
      });
    }
  });

  const handleStartTraining = () => {
    if (selfieImages.length < 5) {
      toast({
        title: "More photos needed",
        description: "Please upload at least 5 selfies for better results",
        variant: "destructive"
      });
      return;
    }
    
    if (!userGender) {
      toast({
        title: "Gender selection required",
        description: "Please select your gender for better AI training",
        variant: "destructive"
      });
      return;
    }
    
    startTrainingMutation.mutate({ images: selfieImages, gender: userGender });
  };

  // Update progress based on user model status
  useEffect(() => {
    if (userModel?.trainingStatus === 'training' && userModel.trainingProgress) {
      setTrainingProgress(userModel.trainingProgress);
      setIsTrainingStarted(true);
    } else if (userModel?.trainingStatus === 'completed') {
      setTrainingProgress(100);
      // Redirect to app after completion
      setTimeout(() => {
        window.location.href = '/app';
      }, 2000);
    }
  }, [userModel]);

  if (!isAuthenticated) {
    return (
      <div className="luxury-app-container">
        <div className="luxury-gradient-bg">
          <div className="luxury-content text-center">
            <h1 className="luxury-heading-1 mb-6">Access Required</h1>
            <p className="luxury-text-body mb-8">Please sign in to access AI training</p>
            <a href="/handler/sign-in" className="luxury-button-primary">
              Sign In
            </a>
          </div>
        </div>
      </div>
    );
  }

  if (userModel?.trainingStatus === 'completed') {
    return (
      <div className="luxury-app-container">
        <div className="luxury-gradient-bg">
          <div className="luxury-content text-center">
            <div className="w-20 h-20 bg-green-500/20 rounded-full mx-auto mb-6 flex items-center justify-center">
              <CheckCircle size={40} className="text-green-400" />
            </div>
            <h1 className="luxury-heading-1 mb-4">Training Complete!</h1>
            <p className="luxury-text-body mb-8">
              Your AI model is ready. Redirecting to SSELFIE Studio...
            </p>
            <div className="luxury-spinner mx-auto" />
          </div>
        </div>
      </div>
    );
  }

  if (isTrainingStarted || userModel?.trainingStatus === 'training') {
    return (
      <div className="luxury-app-container">
        <div className="luxury-gradient-bg">
          <div className="luxury-content">
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-blue-500/20 rounded-full mx-auto mb-6 flex items-center justify-center">
                <Clock size={40} className="text-blue-400 animate-pulse" />
              </div>
              <h1 className="luxury-heading-1 mb-4">Training Your AI</h1>
              <p className="luxury-text-body">
                Creating your personalized model... This usually takes 20-30 minutes
              </p>
            </div>

            {/* Progress Bar */}
            <div className="luxury-card mb-8">
              <div className="flex justify-between items-center mb-4">
                <span className="luxury-text-body">Training Progress</span>
                <span className="luxury-text-caption">{Math.round(trainingProgress)}%</span>
              </div>
              <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500"
                  style={{ width: `${trainingProgress}%` }}
                />
              </div>
            </div>

            {/* Training Status */}
            <div className="luxury-card text-center">
              <h3 className="luxury-heading-3 mb-4">What's Happening</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="luxury-text-body">Processing your photos</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                  <span className="luxury-text-body">Training AI model</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-zinc-500 rounded-full" />
                  <span className="luxury-text-body text-zinc-500">Finalizing model</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="luxury-app-container">
      <div className="luxury-gradient-bg">
        <div className="luxury-content">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="luxury-heading-1 mb-4">Train Your AI</h1>
            <p className="luxury-text-body">
              Upload 5-20 selfies to create your personalized AI model
            </p>
          </div>

          {/* Gender Selection */}
          {!userGender && (
            <div className="luxury-card mb-8">
              <h3 className="luxury-heading-3 mb-4">Select Gender</h3>
              <p className="luxury-text-body mb-6">
                This helps us train your AI model more accurately
              </p>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setUserGender('male')}
                  className="luxury-button-secondary"
                >
                  Male
                </button>
                <button
                  onClick={() => setUserGender('female')}
                  className="luxury-button-secondary"
                >
                  Female
                </button>
              </div>
            </div>
          )}

          {/* Photo Upload */}
          <div className="luxury-card mb-8">
            <h3 className="luxury-heading-3 mb-4">Upload Selfies</h3>
            <p className="luxury-text-body mb-6">
              Good lighting, different angles, and clear face visibility work best
            </p>

            {/* Upload Button */}
            <div className="text-center mb-6">
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="luxury-button-primary w-full"
                disabled={isUploadingImages}
              >
                <Upload size={20} strokeWidth={1.2} />
                <span>Upload Photos ({selfieImages.length}/20)</span>
              </button>
            </div>

            {/* Image Grid */}
            {selfieImages.length > 0 && (
              <div className="grid grid-cols-3 gap-3 mb-6">
                {selfieImages.map((image, index) => (
                  <div key={index} className="relative aspect-square">
                    <img
                      src={URL.createObjectURL(image)}
                      alt={`Selfie ${index + 1}`}
                      className="w-full h-full object-cover rounded-lg"
                    />
                    <button
                      onClick={() => removeImage(index)}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white text-sm"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Upload Requirements */}
            <div className="luxury-card bg-zinc-800/20 border-zinc-700/20">
              <h4 className="luxury-text-body mb-3">Requirements:</h4>
              <ul className="space-y-2 luxury-text-caption">
                <li className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${selfieImages.length >= 5 ? 'bg-green-500' : 'bg-zinc-500'}`} />
                  At least 5 photos (current: {selfieImages.length})
                </li>
                <li className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${userGender ? 'bg-green-500' : 'bg-zinc-500'}`} />
                  Gender selected
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500" />
                  Good lighting and clear face visibility
                </li>
              </ul>
            </div>
          </div>

          {/* Start Training Button */}
          <button
            onClick={handleStartTraining}
            disabled={selfieImages.length < 5 || !userGender || startTrainingMutation.isPending}
            className="luxury-button-primary w-full"
          >
            {startTrainingMutation.isPending ? (
              <>
                <div className="luxury-spinner w-4 h-4 mr-2" />
                <span>Starting Training...</span>
              </>
            ) : (
              <>
                <Camera size={20} strokeWidth={1.2} />
                <span>Start AI Training</span>
              </>
            )}
          </button>

          {/* Error Messages */}
          {uploadErrors.length > 0 && (
            <div className="luxury-card bg-red-900/20 border-red-500/30 mt-6">
              <div className="flex items-center gap-3 mb-3">
                <AlertCircle size={20} className="text-red-400" />
                <span className="luxury-text-body text-red-300">Upload Issues</span>
              </div>
              <ul className="space-y-1">
                {uploadErrors.map((error, index) => (
                  <li key={index} className="luxury-text-caption text-red-300">
                    {error}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default LuxuryTrainingPage;
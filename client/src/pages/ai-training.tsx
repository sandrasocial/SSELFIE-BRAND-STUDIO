import React, { useState, useRef } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useMutation } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { MemberNavigation } from '@/components/member-navigation';
import { GlobalFooter } from '@/components/global-footer';
import { SandraImages } from '@/lib/sandra-images';
import { apiRequest } from '@/lib/queryClient';
import { useLocation } from 'wouter';

export default function AITraining() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const startModelTrainingMutation = useMutation({
    mutationFn: async (selfieImages: string[]) => {
      return apiRequest('/api/start-model-training', 'POST', { selfieImages });
    },
    onSuccess: (response) => {
      if (response.success) {
        toast({
          title: "Training Started!",
          description: "Your AI model training has begun. This takes 20-30 minutes.",
        });
        setLocation('/workspace');
      } else {
        toast({
          title: "Training Validation Failed",
          description: `Please fix these issues: ${response.errors?.join(', ')}`,
          variant: "destructive",
        });
      }
    },
    onError: (error) => {
      console.error('Training failed:', error);
      toast({
        title: "Training failed",
        description: "Training system error. Please restart upload process.",
        variant: "destructive",
      });
    }
  });

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    
    // Bulletproof validation
    const validFiles = files.filter(file => {
      const isValidType = file.type.startsWith('image/');
      const isValidSize = file.size <= 10 * 1024 * 1024; // 10MB
      const isMinSize = file.size >= 10240; // At least 10KB for quality
      return isValidType && isValidSize && isMinSize;
    });

    if (validFiles.length !== files.length) {
      toast({
        title: "Invalid files",
        description: "Please upload only high-quality image files (10KB-10MB).",
        variant: "destructive",
      });
    }

    setUploadedFiles(prev => [...prev, ...validFiles]);
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleAITraining = () => {
    if (uploadedFiles.length < 10) {
      toast({
        title: "Not enough photos",
        description: "Please upload at least 10 selfies for AI training.",
        variant: "destructive",
      });
      return;
    }

    // Convert files to base64
    const promises = uploadedFiles.map(file => {
      return new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });
    });
    
    Promise.all(promises).then(base64Images => {
      startModelTrainingMutation.mutate(base64Images);
    });
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl mb-4" style={{ fontFamily: 'Times New Roman, serif' }}>
            Please Sign In
          </h1>
          <p className="text-gray-600">
            You need to be signed in to train your AI model.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <MemberNavigation />
      
      {/* Editorial Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center bg-black text-white overflow-hidden">
        <div className="absolute inset-0 opacity-40">
          <img 
            src={SandraImages.editorial.phone1}
            alt="AI Training"
            className="w-full h-full object-cover object-center"
          />
        </div>
        
        <div className="relative z-10 text-center max-w-4xl mx-auto px-8">
          <div className="text-xs tracking-[0.4em] uppercase opacity-70 mb-8">
            Step 1 of Your Journey
          </div>
          
          <h1 className="font-serif text-[clamp(3rem,8vw,8rem)] leading-[0.8] font-light uppercase tracking-wide mb-8">
            Train Your AI
          </h1>
          
          <p className="text-xl max-w-2xl mx-auto opacity-80 font-light leading-relaxed mb-12">
            Upload 10-15 selfies to create your personal AI model. In 20-30 minutes, you'll have a custom AI that generates professional photos of you.
          </p>
        </div>
      </section>

      {/* Training Upload Section */}
      <section className="py-20 px-8">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-light mb-6" style={{ fontFamily: 'Times New Roman, serif' }}>
            Upload Your Selfies
          </h2>
          <p className="text-lg text-gray-600 mb-12">
            Upload 10-15 high-quality selfies. Mix close-ups and full-body shots for the best results.
          </p>
          
          {/* Upload Area */}
          <div className="border-2 border-dashed border-gray-300 p-12 mb-8 hover:border-gray-400 transition-colors">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              multiple
              accept="image/*"
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="bg-black text-white px-8 py-3 text-xs uppercase tracking-wider hover:bg-gray-800 transition-colors"
            >
              Upload Selfies
            </button>
            <p className="text-sm text-gray-500 mt-4">
              {uploadedFiles.length} photos uploaded (minimum 10 required)
            </p>
          </div>
          
          {/* Preview Grid */}
          {uploadedFiles.length > 0 && (
            <div className="grid grid-cols-4 gap-4 mb-8">
              {uploadedFiles.map((file, index) => (
                <div key={index} className="relative">
                  <img
                    src={URL.createObjectURL(file)}
                    alt={`Upload ${index + 1}`}
                    className="w-full h-20 object-cover"
                  />
                  <button
                    onClick={() => removeFile(index)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 text-xs hover:bg-red-600"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
          
          {/* Training Button */}
          <div className="flex justify-between items-center">
            <button
              onClick={() => setLocation('/workspace')}
              className="border border-gray-300 text-gray-700 px-8 py-3 text-xs uppercase tracking-wider hover:bg-gray-50 transition-colors"
            >
              Back to Studio
            </button>
            
            <button
              onClick={handleAITraining}
              disabled={uploadedFiles.length < 10 || startModelTrainingMutation.isPending}
              className="bg-black text-white px-8 py-3 text-xs uppercase tracking-wider hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {startModelTrainingMutation.isPending ? 'Starting Training...' : 'Start AI Training'}
            </button>
          </div>
          
          {uploadedFiles.length >= 10 && (
            <p className="text-sm text-gray-600 mt-4">
              Training takes 20-30 minutes. You'll be notified when your AI model is ready!
            </p>
          )}
        </div>
      </section>

      <GlobalFooter />
    </div>
  );
}
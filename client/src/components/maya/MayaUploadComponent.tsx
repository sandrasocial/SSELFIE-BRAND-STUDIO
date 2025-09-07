import React, { useState, useRef, ChangeEvent } from 'react';
import { Camera, Upload, X, CheckCircle, AlertCircle } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { useToast } from '../../hooks/use-toast';
import { apiRequest } from '../../lib/queryClient';

interface MayaUploadComponentProps {
  onUploadComplete?: (success: boolean) => void;
  onTrainingStart?: () => void;
  className?: string;
}

export function MayaUploadComponent({ 
  onUploadComplete, 
  onTrainingStart,
  className = "" 
}: MayaUploadComponentProps) {
  const [selfieImages, setSelfieImages] = useState<File[]>([]);
  const [isUploadingImages, setIsUploadingImages] = useState(false);
  const [uploadErrors, setUploadErrors] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Compress image for AI training - extracted from simple-training
  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        try {
          // Optimal dimensions for AI training (1024x1024 max)
          const maxWidth = 1024;
          const maxHeight = 1024;
          
          let { width, height } = img;
          
          // Calculate new dimensions maintaining aspect ratio
          if (width > maxWidth || height > maxHeight) {
            const ratio = Math.min(maxWidth / width, maxHeight / height);
            width *= ratio;
            height *= ratio;
          }
          
          canvas.width = width;
          canvas.height = height;
          
          // Draw and compress with high quality for AI training
          ctx?.drawImage(img, 0, 0, width, height);
          const compressedBase64 = canvas.toDataURL('image/jpeg', 0.85); // 85% quality for AI training
          resolve(compressedBase64);
        } catch (error) {
          reject(error);
        }
      };
      
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = URL.createObjectURL(file);
    });
  };

  // Start training mutation - extracted from simple-training
  const startTraining = useMutation({
    mutationFn: async (images: string[]) => {
      setIsUploadingImages(true);
      const response = await apiRequest('/api/start-model-training', 'POST', {
        selfieImages: images
      });
      return response;
    },
    onSuccess: (data: any) => {
      setIsUploadingImages(false);
      if (data.success) {
        onTrainingStart?.();
        onUploadComplete?.(true);
        toast({
          title: "Training Started",
          description: "Your AI model is now training. Maya will guide you while we wait!",
        });
      } else {
        // Handle validation errors
        setUploadErrors(data.errors || []);
        toast({
          title: "Training Validation Failed",
          description: `Please fix these issues: ${data.errors?.join(', ')}`,
        });
        onUploadComplete?.(false);
      }
    },
    onError: (error: any) => {
      setIsUploadingImages(false);
      console.error('Maya training initiation failed:', error);
      
      toast({
        title: "Training Failed", 
        description: error.message || "Training system error. Please try again.",
      });
      onUploadComplete?.(false);
    }
  });

  // Handle file selection - extracted from simple-training
  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    // Bulletproof validation: Strict requirements
    const validFiles = files.filter(file => {
      const isImage = file.type.startsWith('image/');
      const isUnder10MB = file.size <= 10 * 1024 * 1024;
      const isMinSize = file.size >= 10240; // At least 10KB for quality
      return isImage && isUnder10MB && isMinSize;
    });
    
    if (validFiles.length !== files.length) {
      toast({
        title: "Invalid files",
        description: "Please upload only high-quality image files (10KB-10MB).",
      });
    }
    
    setSelfieImages(prev => [...prev, ...validFiles]);
  };

  // Remove image from selection
  const removeImage = (index: number) => {
    setSelfieImages(prev => prev.filter((_, i) => i !== index));
  };

  // Start training handler - extracted from simple-training
  const handleStartTraining = async () => {
    // Critical frontend validation: Never allow less than 10 images
    if (selfieImages.length < 10) {
      toast({
        title: "Need More Photos",
        description: `Only ${selfieImages.length} photos uploaded. Minimum 10 selfies required.`,
      });
      return;
    }
    
    if (selfieImages.length < 15) {
      toast({
        title: "Recommendation",
        description: `${selfieImages.length} photos uploaded. 15-20 recommended for best results.`,
      });
    }

    setUploadErrors([]);
    
    try {
      // Compress images to prevent 413 errors while maintaining AI training quality
      const compressedBase64Images = await Promise.all(
        selfieImages.map(async (file) => {
          try {
            return await compressImage(file);
          } catch (error) {
            console.error('Failed to compress image:', error);
            throw new Error(`Failed to process image: ${file.name}`);
          }
        })
      );

      console.log(`✅ Maya: Compressed ${compressedBase64Images.length} images successfully`);
      startTraining.mutate(compressedBase64Images);
    } catch (error) {
      toast({
        title: "Upload Failed",
        description: "Failed to process images. Please try again with different photos.",
      });
      console.error('Maya image processing failed:', error);
    }
  };

  return (
    <div className={`maya-upload-component ${className}`}>
      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        multiple
        accept="image/*"
        className="hidden"
      />

      {/* Upload Area */}
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-black transition-colors cursor-pointer group"
           onClick={() => fileInputRef.current?.click()}>
        <Camera className="w-12 h-12 mx-auto mb-4 text-gray-400 group-hover:text-black transition-colors" />
        
        <h3 className="font-serif text-xl font-light tracking-wide mb-4">
          Upload Your Selfies
        </h3>
        
        <p className="text-gray-600 text-sm mb-4">
          Choose 10-15 photos from your camera roll. Include the "real" ones - that's where your authentic brand lives.
        </p>
        
        <div className="text-xs tracking-[0.2em] uppercase text-gray-500">
          Click to select photos
        </div>
      </div>

      {/* Error Messages */}
      {uploadErrors.length > 0 && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="w-4 h-4 text-red-600" />
            <span className="text-sm font-medium text-red-800">Upload Issues:</span>
          </div>
          <ul className="text-sm text-red-700 space-y-1">
            {uploadErrors.map((error, index) => (
              <li key={index}>• {error}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Image Preview Grid */}
      {selfieImages.length > 0 && (
        <div className="mt-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium">
              {selfieImages.length} photos selected
            </span>
            <div className="flex items-center gap-2">
              {selfieImages.length >= 10 ? (
                <CheckCircle className="w-4 h-4 text-green-600" />
              ) : (
                <AlertCircle className="w-4 h-4 text-amber-600" />
              )}
              <span className="text-xs text-gray-500">
                {selfieImages.length >= 10 ? 'Ready for training' : `Need ${10 - selfieImages.length} more`}
              </span>
            </div>
          </div>
          
          {/* Image Grid */}
          <div className="grid grid-cols-4 gap-2 mb-6">
            {selfieImages.map((file, index) => (
              <div key={index} className="relative aspect-square">
                <img 
                  src={URL.createObjectURL(file)}
                  alt={`Selfie ${index + 1}`}
                  className="w-full h-full object-cover rounded border"
                />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeImage(index);
                  }}
                  className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>

          {/* Start Training Button */}
          <button
            onClick={handleStartTraining}
            disabled={selfieImages.length < 10 || isUploadingImages || startTraining.isPending}
            className={`w-full py-3 px-6 text-sm tracking-[0.2em] uppercase font-light transition-all duration-300 ${
              selfieImages.length >= 10 && !isUploadingImages && !startTraining.isPending
                ? 'bg-black text-white hover:bg-gray-800'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            {isUploadingImages || startTraining.isPending ? (
              'Starting Training...'
            ) : selfieImages.length < 10 ? (
              `Need ${10 - selfieImages.length} More Photos`
            ) : (
              'Start AI Model Training'
            )}
          </button>
        </div>
      )}
    </div>
  );
}
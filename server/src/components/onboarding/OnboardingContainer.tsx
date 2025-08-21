import React from 'react';
import { UploadProgress } from './UploadProgress';
import { UploadValidation } from './UploadValidation';
import { UserJourneyTracker } from './UserJourneyTracker';
import { useToast } from '@/hooks/useToast';
import { trpc } from '@/lib/trpc';

export const OnboardingContainer: React.FC = () => {
  const [currentStep, setCurrentStep] = React.useState(0);
  const [files, setFiles] = React.useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = React.useState(0);
  const { toast } = useToast();

  const uploadMutation = trpc.uploads.createUpload.useMutation({
    onSuccess: () => {
      toast({
        title: 'Upload Complete!',
        description: 'Your photos have been uploaded successfully.',
        variant: 'success'
      });
      setCurrentStep(prev => prev + 1);
    },
    onError: (error) => {
      toast({
        title: 'Upload Failed',
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  const handleFileSelect = (files: FileList | null) => {
    if (files) {
      setFiles(Array.from(files));
    }
  };

  const handleValidationComplete = async (
    isValid: boolean, 
    validImages: ImageUpload[]
  ) => {
    if (!isValid) {
      toast({
        title: 'Validation Failed',
        description: 'Please check image requirements and try again.',
        variant: 'destructive'
      });
      return;
    }

    // Start upload process
    try {
      for (const image of validImages) {
        const formData = new FormData();
        formData.append('file', image.file);
        
        await uploadMutation.mutateAsync({
          file: formData,
          metadata: {
            dimensions: image.dimensions,
            type: image.type
          }
        });

        setUploadProgress(prev => 
          prev + (100 / validImages.length)
        );
      }
    } catch (error) {
      console.error('Upload failed:', error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <UserJourneyTracker />
      
      <div className="space-y-6">
        <UploadProgress 
          currentStep={currentStep}
          totalImages={files.length}
          uploadedImages={Math.floor(uploadProgress * files.length / 100)}
        />

        <div className="mt-8">
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={(e) => handleFileSelect(e.target.files)}
            className="hidden"
            id="file-upload"
          />
          <label
            htmlFor="file-upload"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            Select Photos
          </label>
        </div>

        {files.length > 0 && (
          <UploadValidation
            files={files}
            onValidationComplete={handleValidationComplete}
          />
        )}
      </div>
    </div>
  );
};
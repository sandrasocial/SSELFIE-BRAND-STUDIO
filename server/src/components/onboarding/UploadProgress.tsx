import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Alert } from '@/components/ui/alert';

interface UploadProgressProps {
  currentStep: number;
  totalImages: number;
  uploadedImages: number;
  error?: string;
}

export const UploadProgress: React.FC<UploadProgressProps> = ({
  currentStep,
  totalImages,
  uploadedImages,
  error
}) => {
  const progress = (uploadedImages / totalImages) * 100;

  const steps = [
    'Select 10-20 selfies',
    'Upload in progress',
    'Processing images',
    'Creating your style profile'
  ];

  return (
    <div className="w-full max-w-md mx-auto space-y-4">
      <div className="space-y-2">
        <h3 className="text-lg font-medium">{steps[currentStep]}</h3>
        <Progress value={progress} className="w-full" />
        <p className="text-sm text-gray-500">
          {uploadedImages} of {totalImages} images uploaded
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <p>{error}</p>
        </Alert>
      )}

      <div className="grid grid-cols-4 gap-2">
        {steps.map((step, index) => (
          <div
            key={step}
            className={`p-2 text-center rounded ${
              index === currentStep
                ? 'bg-primary text-white'
                : index < currentStep
                ? 'bg-green-100'
                : 'bg-gray-100'
            }`}
          >
            <span className="text-xs">{step}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
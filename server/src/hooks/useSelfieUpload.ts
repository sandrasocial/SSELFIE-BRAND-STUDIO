import { useState } from 'react';
import { useToast } from '@/components/ui';

export const useSelfieUpload = () => {
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const toast = useToast();

  const upload = async (files: File[]) => {
    try {
      setProgress(0);
      setError('');

      // Validate files
      if (files.length < 10 || files.length > 20) {
        throw new Error('Please select 10-20 photos');
      }

      const formData = new FormData();
      files.forEach(file => {
        formData.append('selfies', file);
      });

      const response = await fetch('/api/upload/selfies', {
        method: 'POST',
        body: formData,
        onUploadProgress: (progressEvent) => {
          const percent = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setProgress(percent);
        },
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      toast({
        title: 'Upload Complete!',
        description: 'Your photos are being processed...',
        status: 'success',
      });

      setProgress(100);
    } catch (err) {
      setError(err.message);
      toast({
        title: 'Upload Failed',
        description: err.message,
        status: 'error',
      });
    }
  };

  return { upload, progress, error };
};
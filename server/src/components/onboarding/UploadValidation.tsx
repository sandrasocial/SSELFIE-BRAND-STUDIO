import React from 'react';
import { ImageUpload } from '@/types/upload';

interface UploadValidationProps {
  files: File[];
  onValidationComplete: (result: boolean, images: ImageUpload[]) => void;
}

export const UploadValidation: React.FC<UploadValidationProps> = ({
  files,
  onValidationComplete
}) => {
  const validateFiles = async () => {
    const validations = files.map(async (file) => {
      // Size validation (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        return { valid: false, error: 'File too large (max 5MB)' };
      }

      // Type validation
      if (!['image/jpeg', 'image/png'].includes(file.type)) {
        return { valid: false, error: 'Invalid file type' };
      }

      // Image dimensions validation
      const dimensions = await getImageDimensions(file);
      if (dimensions.width < 400 || dimensions.height < 400) {
        return { valid: false, error: 'Image too small (min 400x400px)' };
      }

      return { 
        valid: true, 
        image: {
          file,
          preview: URL.createObjectURL(file),
          name: file.name,
          size: file.size,
          type: file.type,
          dimensions
        }
      };
    });

    const results = await Promise.all(validations);
    const validImages = results
      .filter(r => r.valid)
      .map(r => r.image as ImageUpload);

    onValidationComplete(
      validImages.length === files.length,
      validImages
    );
  };

  const getImageDimensions = (file: File): Promise<{width: number, height: number}> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        resolve({ width: img.width, height: img.height });
      };
      img.src = URL.createObjectURL(file);
    });
  };

  React.useEffect(() => {
    validateFiles();
  }, [files]);

  return null;
};
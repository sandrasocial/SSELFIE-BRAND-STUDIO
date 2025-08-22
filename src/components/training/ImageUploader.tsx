import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';

interface ImageUploaderProps {
  onUpload: (files: File[]) => void;
  maxImages: number;
  acceptedTypes: string[];
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  onUpload,
  maxImages,
  acceptedTypes
}) => {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > maxImages) {
      alert(`Maximum ${maxImages} images allowed`);
      return;
    }
    onUpload(acceptedFiles);
  }, [maxImages, onUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: acceptedTypes.join(','),
    maxFiles: maxImages
  });

  return (
    <div className="upload-container">
      <div {...getRootProps()} className={`dropzone ${isDragActive ? 'active' : ''}`}>
        <input {...getInputProps()} />
        <p>Drag & drop your selfies here, or click to select files</p>
        <p className="hint">Upload 10-20 photos for best results</p>
      </div>
    </div>
  );
};
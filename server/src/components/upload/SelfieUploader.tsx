import React, { useState } from 'react';
import { Upload, Progress, Alert } from '@/components/ui';
import { useSelfieUpload } from '@/hooks/useSelfieUpload';

export const SelfieUploader: React.FC = () => {
  const [files, setFiles] = useState<File[]>([]);
  const { upload, progress, error } = useSelfieUpload();

  const handleUpload = async (files: File[]) => {
    if (files.length < 10) {
      return alert('Please select at least 10 photos');
    }
    await upload(files);
  };

  return (
    <div className="upload-container">
      <div className="upload-guide">
        <h3>Upload 10-20 of your best selfies</h3>
        <p>These will be used to train your personal AI model</p>
      </div>
      
      <Upload
        multiple
        accept="image/*"
        onChange={(files) => setFiles(files)}
        onUpload={handleUpload}
      />

      {progress > 0 && (
        <Progress 
          percent={progress} 
          status={progress === 100 ? 'success' : 'active'}
        />
      )}

      {error && (
        <Alert
          type="error"
          message={error}
          className="mt-4"
        />
      )}

      <div className="upload-status">
        {files.length > 0 && (
          <p>{files.length} photos selected</p>
        )}
      </div>
    </div>
  );
};
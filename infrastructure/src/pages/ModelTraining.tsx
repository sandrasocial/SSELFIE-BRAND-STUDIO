import React, { useState } from 'react';

const ModelTraining: React.FC = () => {
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      setUploadedFiles(Array.from(files));
    }
  };

  const handleStartTraining = async () => {
    if (uploadedFiles.length === 0) {
      alert('Please upload files first');
      return;
    }
    
    setIsUploading(true);
    // TODO: Implement actual training logic
    setTimeout(() => {
      setIsUploading(false);
      alert('Training started successfully!');
    }, 2000);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-gray-900 rounded-lg p-8 border border-gray-700">
        <h1 className="text-3xl font-bold text-white mb-6">
          🚀 Step 1: Upload Your Training Data
        </h1>
        
        <p className="text-gray-300 mb-8">
          Upload your documents, chat logs, or any text files to train your personalized AI model.
        </p>

        {/* File Upload Section */}
        <div className="mb-8">
          <label className="block text-white font-medium mb-4">
            Upload Training Files
          </label>
          <div className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center hover:border-gray-500 transition-colors">
            <input
              type="file"
              multiple
              accept=".txt,.pdf,.doc,.docx,.json"
              onChange={handleFileUpload}
              className="hidden"
              id="file-upload"
            />
            <label htmlFor="file-upload" className="cursor-pointer">
              <div className="text-gray-400 mb-4">
                <svg className="w-12 h-12 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <p className="text-white font-medium">Click to upload files</p>
              <p className="text-gray-400 text-sm mt-2">
                Supports: TXT, PDF, DOC, DOCX, JSON
              </p>
            </label>
          </div>
        </div>

        {/* Uploaded Files Display */}
        {uploadedFiles.length > 0 && (
          <div className="mb-8">
            <h3 className="text-white font-medium mb-4">Uploaded Files:</h3>
            <div className="space-y-2">
              {uploadedFiles.map((file, index) => (
                <div key={index} className="bg-gray-800 p-3 rounded border border-gray-600">
                  <span className="text-green-400">✓</span>
                  <span className="text-white ml-2">{file.name}</span>
                  <span className="text-gray-400 ml-2">({(file.size / 1024).toFixed(1)} KB)</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Training Controls */}
        <div className="flex gap-4">
          <button
            onClick={handleStartTraining}
            disabled={isUploading || uploadedFiles.length === 0}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            {isUploading ? 'Starting Training...' : 'Start Training'}
          </button>
          
          <button
            onClick={() => setUploadedFiles([])}
            className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Clear Files
          </button>
        </div>

        {/* Status Information */}
        <div className="mt-8 p-4 bg-gray-800 rounded border border-gray-600">
          <h4 className="text-white font-medium mb-2">Training Status:</h4>
          <p className="text-gray-300">
            {uploadedFiles.length === 0 
              ? 'Ready to upload training data' 
              : `${uploadedFiles.length} files ready for training`
            }
          </p>
        </div>
      </div>
    </div>
  );
};

export default ModelTraining;
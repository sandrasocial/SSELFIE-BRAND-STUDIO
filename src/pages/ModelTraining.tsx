import React, { useState } from 'react';

const ModelTraining: React.FC = () => {
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isTraining, setIsTraining] = useState(false);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setUploadedFiles(prev => [...prev, ...files]);
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const startTraining = () => {
    if (uploadedFiles.length < 10) {
      alert('Please upload at least 10 selfies for optimal training.');
      return;
    }
    setIsTraining(true);
    // Simulate training process
    setTimeout(() => {
      setIsTraining(false);
      alert('Model training completed successfully!');
    }, 5000);
  };

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-times font-light text-black mb-2">
            Train Your AI Model
          </h1>
          <p className="text-gray-600 leading-relaxed">
            Upload your selfies to create a personalized AI model that generates 
            professional brand photography in your unique style.
          </p>
        </div>

        {/* Upload Area */}
        <div className="bg-white border-2 border-dashed border-gray-300 rounded-lg p-12 text-center mb-8">
          <div className="mb-6">
            <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
              <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          
          <h3 className="text-lg font-medium text-black mb-2">
            Upload Your Selfies
          </h3>
          <p className="text-gray-600 mb-6">
            Drag and drop your photos here, or click to browse
          </p>
          
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
            id="file-upload"
          />
          <label
            htmlFor="file-upload"
            className="inline-block bg-black text-white px-6 py-3 cursor-pointer hover:bg-gray-800 transition-colors"
          >
            Choose Files
          </label>
          
          <p className="text-sm text-gray-500 mt-4">
            Recommended: 15-25 high-quality selfies for best results
          </p>
        </div>

        {/* Uploaded Files */}
        {uploadedFiles.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8">
            <h3 className="text-lg font-medium text-black mb-4">
              Uploaded Files ({uploadedFiles.length})
            </h3>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {uploadedFiles.map((file, index) => (
                <div key={index} className="relative">
                  <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
                    <span className="text-gray-500 text-sm text-center p-2">
                      {file.name}
                    </span>
                  </div>
                  <button
                    onClick={() => removeFile(index)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Training Options */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8">
          <h3 className="text-lg font-medium text-black mb-4">
            Training Configuration
          </h3>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Model Name
              </label>
              <input
                type="text"
                placeholder="My SSELFIE Model"
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-black"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Training Steps
              </label>
              <select className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-black">
                <option value="1000">1000 (Fast)</option>
                <option value="2000">2000 (Balanced)</option>
                <option value="3000">3000 (High Quality)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Training Button */}
        <div className="text-center">
          <button
            onClick={startTraining}
            disabled={uploadedFiles.length < 5 || isTraining}
            className={`px-8 py-3 font-medium rounded-lg transition-colors ${
              uploadedFiles.length >= 5 && !isTraining
                ? 'bg-black text-white hover:bg-gray-800'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {isTraining ? 'Training in Progress...' : 'Start Training'}
          </button>
          
          {uploadedFiles.length < 5 && (
            <p className="text-red-500 text-sm mt-2">
              Upload at least 5 selfies to start training
            </p>
          )}
        </div>

        {/* Training Progress */}
        {isTraining && (
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-medium text-blue-900 mb-4">
              Training in Progress
            </h3>
            <div className="w-full bg-blue-200 rounded-full h-2 mb-4">
              <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
            </div>
            <p className="text-blue-800 text-sm">
              Your AI model is being trained. This usually takes 10-15 minutes. 
              You'll receive an email when it's ready.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ModelTraining;
import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

const ModelTraining: React.FC = () => {
  const { isAuthenticated, user, validateSession } = useAuth();
  const navigate = useNavigate();
  const [sessionValid, setSessionValid] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      if (!isAuthenticated) {
        navigate('/');
        return;
      }
      
      try {
        const isValid = await validateSession();
        setSessionValid(isValid);
        if (!isValid) {
          navigate('/login');
        }
      } catch (error) {
        console.error('Session validation failed:', error);
        navigate('/login');
      }
    };

    checkSession();
  }, [isAuthenticated, navigate, validateSession]);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  const ALLOWED_TYPES = ['text/plain', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/json'];

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const fileArray = Array.from(files);
    const validationErrors: string[] = [];

    const validFiles = fileArray.filter(file => {
      // Size validation
      if (file.size > MAX_FILE_SIZE) {
        validationErrors.push(`${file.name} is too large. Maximum size is 10MB`);
        return false;
      }

      // Type validation
      if (!ALLOWED_TYPES.includes(file.type)) {
        validationErrors.push(`${file.name} has invalid type. Allowed types are: txt, pdf, doc, docx, json`);
        return false;
      }

      return true;
    });

    if (validationErrors.length > 0) {
      alert(validationErrors.join('\n'));
    }

    setUploadedFiles(validFiles);
  };

  const [uploadProgress, setUploadProgress] = useState(0);
  const [trainingStatus, setTrainingStatus] = useState('');
  
  const handleStartTraining = async () => {
    if (uploadedFiles.length === 0) {
      alert('Please upload files first');
      return;
    }
    
    setIsUploading(true);
    setTrainingStatus('Preparing files...');
    try {
      const formData = new FormData();
      uploadedFiles.forEach((file) => {
        formData.append('trainingFiles', file);
      });

      // Create XMLHttpRequest for upload progress tracking
      const xhr = new XMLHttpRequest();
      const promise = new Promise((resolve, reject) => {
        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const progress = (event.loaded / event.total) * 100;
            setUploadProgress(Math.round(progress));
          }
        };

        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve(JSON.parse(xhr.responseText));
          } else {
            reject(new Error(`HTTP Error: ${xhr.status}`));
          }
        };

        xhr.onerror = () => reject(new Error('Network Error'));
      });

      xhr.open('POST', '/api/model/train');
      xhr.setRequestHeader('Authorization', `Bearer ${user.token}`);
      xhr.send(formData);

      setTrainingStatus('Uploading files...');
      const data = await promise;

      // Setup WebSocket connection for real-time training updates
      const ws = new WebSocket(process.env.REACT_APP_WS_URL || 'ws://localhost:3001');
      ws.onmessage = (event) => {
        const update = JSON.parse(event.data);
        setTrainingStatus(update.status);
        if (update.status === 'completed') {
          ws.close();
          setIsUploading(false);
          alert('Training completed successfully!');
        }
      };

      setIsUploading(false);
      alert('Training started successfully! You can monitor the progress here.');
    } catch (error) {
      console.error('Training error:', error);
      setIsUploading(false);
      setTrainingStatus('Failed');
      alert(`Failed to start training: ${error.message}`);
    }
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

        {/* Enhanced Status Information */}
        <div className="mt-8 p-4 bg-gray-800 rounded border border-gray-600">
          <h4 className="text-white font-medium mb-2">Training Status:</h4>
          
          {/* File Status */}
          <p className="text-gray-300 mb-2">
            {uploadedFiles.length === 0 
              ? 'Ready to upload training data' 
              : `${uploadedFiles.length} files ready for training`
            }
          </p>

          {/* Upload Progress */}
          {isUploading && (
            <div className="mb-4">
              <div className="w-full bg-gray-700 rounded-full h-2.5">
                <div 
                  className="bg-blue-600 h-2.5 rounded-full transition-all duration-300" 
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-400 mt-1">{uploadProgress}% uploaded</p>
            </div>
          )}

          {/* Training Status */}
          {trainingStatus && (
            <div className="mt-2">
              <p className="text-sm font-medium text-gray-300">Current Status:</p>
              <p className="text-blue-400">{trainingStatus}</p>
            </div>
          )}

          {/* Session Status */}
          {!sessionValid && (
            <div className="mt-2 text-red-400 text-sm">
              ⚠️ Session expired. Please log in again.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ModelTraining;
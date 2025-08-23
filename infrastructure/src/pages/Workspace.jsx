import React from 'react';
import { useNavigate } from 'react-router-dom';

const Workspace = () => {
  const navigate = useNavigate();

  const handleStartTraining = () => {
    navigate('/training');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome to Your AI Workspace
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Create your personalized AI model with our step-by-step process
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">
            Get Started with Your AI Model
          </h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center p-6 border rounded-lg">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-xl font-bold text-purple-600">1</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Upload Photos</h3>
              <p className="text-gray-600 text-sm">Upload 10-20 high-quality photos</p>
            </div>
            
            <div className="text-center p-6 border rounded-lg">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-xl font-bold text-purple-600">2</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Train Model</h3>
              <p className="text-gray-600 text-sm">AI processes your photos</p>
            </div>
            
            <div className="text-center p-6 border rounded-lg">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-xl font-bold text-purple-600">3</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Generate</h3>
              <p className="text-gray-600 text-sm">Create amazing AI photos</p>
            </div>
          </div>

          <div className="mt-8 text-center">
            <button
              onClick={handleStartTraining}
              className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors duration-200"
            >
              Start Training Your Model
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            Your Models
          </h3>
          <div className="text-center py-8 text-gray-500">
            <p>No models created yet. Start by training your first model!</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Workspace;
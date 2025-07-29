import React from 'react';

interface TestImplementationProps {
  title?: string;
  message?: string;
}

const TestImplementation: React.FC<TestImplementationProps> = ({ 
  title = "Test Implementation", 
  message = "This is a simple test component created by Zara" 
}) => {
  return (
    <div className="p-6 max-w-md mx-auto bg-white rounded-xl shadow-lg space-y-4">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {title}
        </h2>
        <p className="text-gray-600">
          {message}
        </p>
      </div>
      
      <div className="border-t pt-4">
        <div className="flex items-center justify-center space-x-2">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-sm text-gray-500">Component Active</span>
        </div>
      </div>
      
      <div className="text-xs text-gray-400 text-center">
        Created: {new Date().toLocaleDateString()}
      </div>
    </div>
  );
};

export default TestImplementation;
import React, { useState } from 'react';

interface ZaraTestProps {
  message?: string;
}

const TestZara: React.FC<ZaraTestProps> = ({ message = "Hello from Zara!" }) => {
  const [count, setCount] = useState(0);
  const [userInput, setUserInput] = useState('');

  const handleIncrement = () => {
    setCount(prev => prev + 1);
  };

  const handleReset = () => {
    setCount(0);
    setUserInput('');
  };

  return (
    <div className="max-w-md mx-auto mt-8 p-6 border border-gray-200 rounded-lg shadow-lg bg-white">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          Zara Test Component
        </h1>
        <p className="text-gray-600">{message}</p>
      </div>

      <div className="space-y-4">
        {/* Counter Section */}
        <div className="bg-gray-50 p-4 rounded-md">
          <h3 className="text-lg font-semibold mb-2">Counter Test</h3>
          <div className="flex items-center justify-between">
            <span className="text-xl font-mono">Count: {count}</span>
            <div className="space-x-2">
              <button
                onClick={handleIncrement}
                className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              >
                +
              </button>
              <button
                onClick={handleReset}
                className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
              >
                Reset
              </button>
            </div>
          </div>
        </div>

        {/* Input Section */}
        <div className="bg-gray-50 p-4 rounded-md">
          <h3 className="text-lg font-semibold mb-2">Input Test</h3>
          <input
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder="Type something..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {userInput && (
            <p className="mt-2 text-sm text-gray-600">
              You typed: <span className="font-semibold">{userInput}</span>
            </p>
          )}
        </div>

        {/* Status Section */}
        <div className="bg-green-50 p-4 rounded-md border border-green-200">
          <div className="flex items-center">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
            <span className="text-green-700 font-medium">Component Active</span>
          </div>
          <p className="text-sm text-green-600 mt-1">
            React component is working correctly! ✨
          </p>
        </div>
      </div>

      {/* Component Info */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="text-xs text-gray-500 space-y-1">
          <div>Created: {new Date().toLocaleString()}</div>
          <div>React: {React.version}</div>
          <div>TypeScript: ✓</div>
        </div>
      </div>
    </div>
  );
};

export default TestZara;
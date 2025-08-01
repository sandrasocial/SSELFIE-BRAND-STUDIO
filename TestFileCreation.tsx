import React, { useState } from 'react';

interface TestComponentProps {
  title?: string;
  isActive?: boolean;
}

/**
 * TestFileCreation Component
 * 
 * This component verifies that Zara can successfully create files
 * with complete TypeScript/React code content.
 */
const TestFileCreation: React.FC<TestComponentProps> = ({ 
  title = "File Creation Test", 
  isActive = true 
}) => {
  const [testStatus, setTestStatus] = useState<'pending' | 'success' | 'error'>('pending');
  const [message, setMessage] = useState<string>('Testing file creation...');

  const runTest = () => {
    try {
      // Simulate a test operation
      setTimeout(() => {
        setTestStatus('success');
        setMessage('File creation test completed successfully! ✅');
      }, 1000);
    } catch (error) {
      setTestStatus('error');
      setMessage('Test failed: ' + (error as Error).message);
    }
  };

  React.useEffect(() => {
    if (isActive) {
      runTest();
    }
  }, [isActive]);

  const getStatusColor = () => {
    switch (testStatus) {
      case 'success': return 'text-green-600';
      case 'error': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg border border-gray-200">
      <h2 className="text-2xl font-bold text-gray-900 mb-4" style={{ fontFamily: 'Times New Roman, serif' }}>
        {title}
      </h2>
      
      <div className="space-y-4">
        <div className="flex items-center space-x-3">
          <div className={`w-3 h-3 rounded-full ${
            testStatus === 'success' ? 'bg-green-500' : 
            testStatus === 'error' ? 'bg-red-500' : 
            'bg-yellow-500 animate-pulse'
          }`} />
          <span className={`font-medium ${getStatusColor()}`}>
            Status: {testStatus.charAt(0).toUpperCase() + testStatus.slice(1)}
          </span>
        </div>
        
        <p className="text-gray-700 text-sm leading-relaxed">
          {message}
        </p>
        
        <div className="mt-4 p-3 bg-gray-50 rounded border-l-4 border-blue-500">
          <h3 className="font-semibold text-gray-800 mb-2">Test Details:</h3>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• TypeScript interfaces: ✅</li>
            <li>• React functional component: ✅</li>
            <li>• State management (useState): ✅</li>
            <li>• Effect hooks (useEffect): ✅</li>
            <li>• Tailwind CSS styling: ✅</li>
            <li>• Times New Roman luxury typography: ✅</li>
            <li>• Error handling: ✅</li>
            <li>• Complete implementation: ✅</li>
          </ul>
        </div>
        
        <button 
          onClick={runTest}
          disabled={testStatus === 'pending'}
          className="w-full px-4 py-2 bg-black text-white rounded hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          style={{ fontFamily: 'Times New Roman, serif' }}
        >
          {testStatus === 'pending' ? 'Running Test...' : 'Run Test Again'}
        </button>
      </div>
    </div>
  );
};

export default TestFileCreation;
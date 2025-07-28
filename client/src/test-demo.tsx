import React from 'react';
import TestZara from './test-zara';

const TestDemo: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Zara Test Component Demo
          </h1>
          <p className="text-gray-600">
            Interactive demonstration of the TestZara component
          </p>
        </div>

        {/* Default Component */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4 text-center">
            Default Component
          </h2>
          <TestZara />
        </div>

        {/* Custom Message Component */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4 text-center">
            With Custom Message
          </h2>
          <TestZara message="SSELFIE Studio - Technical Architecture Test" />
        </div>

        {/* Multiple Components Grid */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4 text-center">
            Multiple Instances
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <TestZara message="Instance A - Counter Test" />
            <TestZara message="Instance B - Input Test" />
          </div>
        </div>

        {/* Usage Instructions */}
        <div className="max-w-4xl mx-auto mt-12 p-6 bg-white rounded-lg shadow-lg">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            Usage Instructions
          </h2>
          
          <div className="space-y-4 text-gray-700">
            <div>
              <h3 className="font-semibold text-lg mb-2">Basic Import:</h3>
              <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
                <code>{`import TestZara from './test-zara';`}</code>
              </pre>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-2">Basic Usage:</h3>
              <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
                <code>{`<TestZara />`}</code>
              </pre>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-2">With Custom Message:</h3>
              <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
                <code>{`<TestZara message="Your custom message here" />`}</code>
              </pre>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-2">Component Features:</h3>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Interactive counter with increment and reset</li>
                <li>Real-time input field with display</li>
                <li>Component status indicator</li>
                <li>Metadata display (creation time, React version)</li>
                <li>Fully responsive Tailwind CSS styling</li>
                <li>TypeScript support with proper interfaces</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestDemo;
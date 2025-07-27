import React, { useState } from 'react';

interface MayaTestComponentProps {
  initialCount?: number;
  className?: string;
}

export default function MayaTestComponent({ 
  initialCount = 0, 
  className = '' 
}: MayaTestComponentProps) {
  const [count, setCount] = useState<number>(initialCount);

  const increment = () => setCount(prev => prev + 1);
  const decrement = () => setCount(prev => prev - 1);
  const reset = () => setCount(initialCount);

  return (
    <div className={`p-8 bg-white rounded-lg shadow-lg border border-gray-200 ${className}`}>
      <div className="text-center space-y-6">
        <h2 className="text-2xl font-bold text-gray-900">
          Maya's Test Component
        </h2>
        
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full w-24 h-24 flex items-center justify-center mx-auto">
          <span className="text-3xl font-bold">{count}</span>
        </div>
        
        <div className="flex justify-center gap-4">
          <button
            onClick={decrement}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors duration-200 font-medium"
          >
            Decrease
          </button>
          
          <button
            onClick={reset}
            className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors duration-200 font-medium"
          >
            Reset
          </button>
          
          <button
            onClick={increment}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors duration-200 font-medium"
          >
            Increase
          </button>
        </div>
        
        <div className="text-sm text-gray-600">
          Counter Status: {count === 0 ? 'Reset' : count > 0 ? 'Positive' : 'Negative'}
        </div>
      </div>
    </div>
  );
}
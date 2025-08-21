import React, { useState } from 'react';

interface TestComponentProps {
  title?: string;
}

const TestComponent: React.FC<TestComponentProps> = ({ 
  title = "Luxury Editorial Test" 
}) => {
  const [count, setCount] = useState(0);
  const [isActive, setIsActive] = useState(false);

  const handleClick = () => {
    setCount(prev => prev + 1);
    setIsActive(prev => !prev);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Editorial Header */}
      <div className="max-w-4xl mx-auto px-8 py-16">
        <h1 
          style={{ fontFamily: 'Times, "Times New Roman", serif' }}
          className="text-6xl font-normal text-black mb-8 tracking-tight"
        >
          {title}
        </h1>
        
        {/* Interactive Section */}
        <div className="bg-gray-50 p-12 mb-12">
          <div className="text-center">
            <p 
              className="text-2xl text-black mb-8"
              style={{ fontFamily: 'Times, "Times New Roman", serif' }}
            >
              Component Status: {isActive ? 'Active' : 'Inactive'}
            </p>
            
            <div className="text-4xl font-light text-black mb-8">
              Count: {count}
            </div>
            
            <button
              onClick={handleClick}
              className={`px-8 py-4 border-2 border-black transition-all duration-300 ${
                isActive 
                  ? 'bg-black text-white' 
                  : 'bg-white text-black hover:bg-black hover:text-white'
              }`}
              style={{ fontFamily: 'Times, "Times New Roman", serif' }}
            >
              Toggle & Increment
            </button>
          </div>
        </div>

        {/* Editorial Content */}
        <div className="prose prose-lg max-w-none">
          <p 
            className="text-lg leading-relaxed text-black mb-6"
            style={{ fontFamily: 'Times, "Times New Roman", serif' }}
          >
            This component demonstrates full React functionality with luxury editorial design principles. 
            It includes state management, event handling, and responsive typography using our signature 
            Times New Roman font system.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
            <div className="text-center p-8 border border-gray-200">
              <h3 
                className="text-xl mb-4 text-black"
                style={{ fontFamily: 'Times, "Times New Roman", serif' }}
              >
                State Management
              </h3>
              <p className="text-gray-600">React hooks in action</p>
            </div>
            
            <div className="text-center p-8 border border-gray-200">
              <h3 
                className="text-xl mb-4 text-black"
                style={{ fontFamily: 'Times, "Times New Roman", serif' }}
              >
                Editorial Typography
              </h3>
              <p className="text-gray-600">Times New Roman luxury</p>
            </div>
            
            <div className="text-center p-8 border border-gray-200">
              <h3 
                className="text-xl mb-4 text-black"
                style={{ fontFamily: 'Times, "Times New Roman", serif' }}
              >
                Interactive Design
              </h3>
              <p className="text-gray-600">Smooth transitions</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestComponent;
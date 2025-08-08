import React from 'react';

interface TestComponentProps {
  title?: string;
  message?: string;
}

export const TestComponent: React.FC<TestComponentProps> = ({ 
  title = "Editorial Test", 
  message = "Luxury design system active" 
}) => {
  return (
    <div className="min-h-screen bg-white">
      {/* Editorial Hero Section */}
      <div className="relative h-96 bg-black flex items-center justify-center">
        <div className="text-center text-white">
          <h1 className="font-['Times_New_Roman'] text-6xl font-light tracking-wide mb-4">
            {title}
          </h1>
          <div className="w-24 h-px bg-white mx-auto mb-6"></div>
          <p className="font-light text-lg tracking-wider uppercase">
            {message}
          </p>
        </div>
      </div>

      {/* Editorial Content Section */}
      <div className="max-w-4xl mx-auto px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="space-y-6">
            <h2 className="font-['Times_New_Roman'] text-3xl font-light text-black">
              Visual Excellence
            </h2>
            <p className="text-gray-600 leading-relaxed font-light">
              This test component showcases our editorial luxury design principles: 
              sophisticated typography, generous whitespace, and minimalist elegance.
            </p>
          </div>
          
          <div className="bg-gray-50 p-8 min-h-64 flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 bg-black rounded-full mx-auto mb-4"></div>
              <p className="text-sm font-light tracking-wider uppercase text-gray-500">
                Gallery Space
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Editorial Break */}
      <div className="h-px bg-gray-200 max-w-6xl mx-auto"></div>
      
      {/* Status Section */}
      <div className="py-12 text-center">
        <p className="font-['Times_New_Roman'] text-2xl font-light text-gray-800">
          Aria's Design System: Active
        </p>
        <p className="text-sm font-light tracking-wider uppercase text-gray-500 mt-2">
          Editorial Luxury Standards Applied
        </p>
      </div>
    </div>
  );
};

export default TestComponent;
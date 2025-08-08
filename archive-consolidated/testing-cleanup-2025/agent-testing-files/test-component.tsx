import React from 'react';

interface TestComponentProps {
  title?: string;
}

export const TestComponent: React.FC<TestComponentProps> = ({ title = 'Default Title' }) => {
  return (
    <div className="font-serif text-gray-900">
      <h1 className="text-3xl font-normal mb-4">{title}</h1>
      <p className="text-lg leading-relaxed">
        This is a test component following the SSELFIE luxury editorial design system.
      </p>
    </div>
  );
};

export default TestComponent;
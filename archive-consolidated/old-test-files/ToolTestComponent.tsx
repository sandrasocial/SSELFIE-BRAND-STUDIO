import React from 'react';

interface ToolTestComponentProps {
  title?: string;
}

export const ToolTestComponent: React.FC<ToolTestComponentProps> = ({ title = 'Tool Test' }) => {
  return (
    <div className="relative bg-white rounded-lg overflow-hidden p-6">
      <h1 className="text-2xl font-times-new-roman tracking-[0.3em] uppercase text-center">
        {title.split('').join(' ')}
      </h1>
      <div className="mt-4 text-center">
        Tool system verification component
      </div>
    </div>
  );
};

export default ToolTestComponent;
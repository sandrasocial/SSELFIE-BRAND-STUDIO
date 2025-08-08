import React from 'react';

interface TestComponentProps {
  title: string;
  description?: string;
}

export default function TestComponent({ title, description }: TestComponentProps) {
  return (
    <div className="p-4 border border-gray-200 rounded-lg">
      <h2 className="text-xl font-bold text-black">{title}</h2>
      {description && (
        <p className="text-gray-600 mt-2">{description}</p>
      )}
      <div className="mt-4">
        <button className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800 transition-colors">
          Test Button
        </button>
      </div>
    </div>
  );
}
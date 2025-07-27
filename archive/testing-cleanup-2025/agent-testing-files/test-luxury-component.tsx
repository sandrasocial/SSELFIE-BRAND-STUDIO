import React from 'react';

export default function TestLuxuryComponent() {
  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-gray-200 px-8 py-6">
        <h1 className="text-4xl font-serif text-black tracking-wide">
          Test Luxury Component
        </h1>
        <p className="text-gray-600 mt-2">
          This is a test component to verify file creation is working properly.
        </p>
      </header>
      <main className="px-8 py-12">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-serif text-black mb-6">
            Victoria's Design Test
          </h2>
          <p className="text-gray-700 leading-relaxed">
            This component demonstrates that the file creation system is working correctly. 
            Victoria should be able to create actual files with real code, not fake responses.
          </p>
        </div>
      </main>
    </div>
  );
}
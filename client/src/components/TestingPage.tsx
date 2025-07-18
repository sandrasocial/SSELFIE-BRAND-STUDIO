// In your main component or testing page
import React from 'react';
import LiveTestComponent from './components/LiveTestComponent';

export default function TestingPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto p-8">
        <h1 className="text-3xl font-bold mb-6">SSELFIE Live Preview Testing</h1>
        <LiveTestComponent />
      </div>
    </div>
  );
}
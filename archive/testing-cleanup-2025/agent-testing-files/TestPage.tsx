import React from 'react';
import TestButton from '@/components/TestButton';

export default function TestPage() {
  const handleTestClick = () => {
    console.log('SSELFIE Studio test button clicked! 🚀');
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center space-y-8 p-8">
      <h1 
        className="text-6xl font-serif text-black uppercase tracking-wide text-center mb-12"
        style={{ fontFamily: 'Times New Roman, serif' }}
      >
        SSELFIE Studio
        <br />
        Test Components
      </h1>
      
      <div className="flex flex-col space-y-6 items-center">
        <TestButton onClick={handleTestClick}>
          Primary Test Button
        </TestButton>
        
        <TestButton variant="secondary" onClick={handleTestClick}>
          Secondary Test Button
        </TestButton>
        
        <TestButton 
          onClick={handleTestClick}
          className="w-64"
        >
          Wide Test Button
        </TestButton>
      </div>
      
      <p className="text-black text-center max-w-md leading-relaxed">
        These buttons demonstrate our luxury editorial design system with Times New Roman typography, 
        black/white color scheme, and smooth hover interactions.
      </p>
    </div>
  );
}
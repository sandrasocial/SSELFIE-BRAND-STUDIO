import React from 'react';

export default function TestComponent() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center space-y-8">
        <h1 
          className="text-6xl font-serif text-black uppercase tracking-wide"
          style={{ fontFamily: 'Times New Roman, serif' }}
        >
          File System Test
        </h1>
        
        <div className="space-y-4">
          <p className="text-lg text-gray-600">
            Victoria's Design System Active
          </p>
          
          <div className="flex justify-center">
            <button className="px-8 py-3 border border-black text-black hover:bg-black hover:text-white transition-colors duration-300 uppercase tracking-wide">
              System Confirmed
            </button>
          </div>
          
          <div className="mt-8 p-6 border border-gray-200 bg-gray-50">
            <h3 className="text-xl font-serif mb-2" style={{ fontFamily: 'Times New Roman, serif' }}>
              Design Standards Applied:
            </h3>
            <ul className="text-left space-y-1 text-sm">
              <li>• Times New Roman headlines</li>
              <li>• Black/white luxury palette</li>
              <li>• Editorial spacing & typography</li>
              <li>• Sharp edges, no rounded corners</li>
              <li>• Minimal, magazine-style layout</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
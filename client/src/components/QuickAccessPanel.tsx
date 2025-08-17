import React from 'react';

export default function QuickAccessPanel() {
  return (
    <div className="fixed bottom-6 right-6 z-50">
      <div className="bg-white border-2 border-black shadow-lg p-4 min-w-[200px]">
        <h3 className="text-sm font-medium mb-3 text-center uppercase tracking-wide" 
            style={{ fontFamily: 'Times New Roman, serif' }}>
          Quick Access
        </h3>
        <div className="space-y-2">
          <button
            onClick={() => window.open('/', '_blank')}
            className="w-full px-4 py-2 bg-gray-100 text-black border border-gray-300 hover:bg-gray-200 transition-colors text-sm"
          >
            🚀 Open Full Preview
          </button>
          <button
            onClick={() => window.location.href = '/visual-editor'}
            className="w-full px-4 py-2 bg-black text-white border border-black hover:bg-gray-800 transition-colors text-sm"
          >
            🎨 Visual Editor
          </button>
          <div className="text-xs text-gray-500 text-center mt-2">
            Preview has "Open Full Preview" button
          </div>
        </div>
      </div>
    </div>
  );
}
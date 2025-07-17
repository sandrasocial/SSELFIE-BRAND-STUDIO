import React from 'react';

export default function TestAdminCard() {
  return (
    <div className="bg-white border-2 border-black p-6 mb-4">
      <h2 className="text-2xl font-light text-black mb-2" style={{ fontFamily: 'Times New Roman, serif' }}>
        ✅ Live File Creation Working!
      </h2>
      <p className="text-gray-600">
        This component was created to test the live file creation and auto-import system. 
        If you can see this, Victoria's file creation is working perfectly!
      </p>
      <div className="mt-4 text-sm text-gray-500">
        Created by automated test system to verify live preview integration.
      </div>
    </div>
  );
}
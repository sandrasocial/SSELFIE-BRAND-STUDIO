import React from 'react';

export default function AdminTestComponent() {
  return (
    <div className="p-6 bg-white border border-gray-200 rounded">
      <h2 className="text-2xl font-bold text-black mb-4">Admin Test Component</h2>
      <p className="text-gray-600 mb-4">
        Created by Maya AI on 7/16/2025
      </p>
      <div className="mt-4 p-4 bg-gray-50 rounded">
        <p className="text-sm">This proves the file creation system works!</p>
      </div>
      <button className="mt-4 px-4 py-2 bg-black text-white rounded hover:bg-gray-800">
        Test Button
      </button>
    </div>
  );
}
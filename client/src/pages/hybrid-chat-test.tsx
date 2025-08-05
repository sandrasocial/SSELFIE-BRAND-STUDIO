import React from 'react';
import { HybridStreamingChat } from '@/components/admin/HybridStreamingChat';

export default function HybridChatTest() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Hybrid Intelligence System Test
          </h1>
          <p className="text-gray-600">
            Testing agent streaming with local processing, pattern caching, and selective cloud routing
          </p>
        </div>
        
        <HybridStreamingChat />
        
        <div className="mt-8 p-4 bg-white rounded-lg shadow-sm">
          <h3 className="font-semibold mb-2">Test Scenarios:</h3>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• "Create a simple React button component" - Should trigger code generation</li>
            <li>• "Hello Maya" - Should use cached pattern response</li>
            <li>• "Analyze the current project structure" - Should use local processing</li>
            <li>• "Write a detailed brand strategy" - Should route to selective cloud</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
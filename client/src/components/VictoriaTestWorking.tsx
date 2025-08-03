import React from 'react';
import { UnifiedAgentInterface } from '@/components/admin/UnifiedAgentInterface';

export default function VictoriaTestWorking() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-serif font-bold text-black mb-2">Victoria Agent</h1>
          <p className="text-gray-600">Website builder interface</p>
        </div>
        <UnifiedAgentInterface />
      </div>
    </div>
  );
}
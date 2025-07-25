// SSELFIE Studio - Luxury Agent Bridge Toggle
// Minimal, elegant toggle for Bridge functionality

import React from 'react';

interface AgentBridgeToggleProps {
  agentName: string;
  enabled: boolean;
  status?: 'idle' | 'processing' | 'complete' | 'error';
  onToggle: (agentName: string) => void;
}

export const AgentBridgeToggle: React.FC<AgentBridgeToggleProps> = ({
  agentName,
  enabled,
  status = 'idle',
  onToggle
}) => {
  const getStatusColor = () => {
    switch (status) {
      case 'processing': return 'bg-yellow-400';
      case 'complete': return 'bg-green-500';
      case 'error': return 'bg-red-500';
      default: return enabled ? 'bg-black' : 'bg-gray-200';
    }
  };

  return (
    <div className="absolute top-4 right-4 flex items-center space-x-2 z-10">
      <span className="text-xs text-white/70 font-light tracking-wide">
        BRIDGE
      </span>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggle(agentName);
        }}
        className={`w-8 h-4 rounded-full transition-all duration-300 ${getStatusColor()}`}
        title={`Agent Bridge ${enabled ? 'enabled' : 'disabled'} - Status: ${status}`}
      >
        <div className={`w-3 h-3 rounded-full bg-white transition-all duration-300 shadow-sm ${
          enabled ? 'translate-x-4' : 'translate-x-0.5'
        }`} />
      </button>
      
      {status === 'processing' && (
        <div className="w-1 h-1 bg-white rounded-full animate-pulse" />
      )}
    </div>
  );
};
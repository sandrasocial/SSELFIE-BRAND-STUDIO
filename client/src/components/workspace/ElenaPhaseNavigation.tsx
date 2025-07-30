import React from 'react';

interface ElenaPhaseNavigationProps {
  currentPhase: number;
  totalPhases: number;
}

export function ElenaPhaseNavigation({ currentPhase, totalPhases }: ElenaPhaseNavigationProps) {
  return (
    <div className="flex items-center justify-center space-x-4 mb-8">
      {Array.from({ length: totalPhases }, (_, i) => (
        <div
          key={i}
          className={`w-3 h-3 rounded-full transition-colors ${
            i < currentPhase ? 'bg-black' : 'bg-gray-300'
          }`}
        />
      ))}
    </div>
  );
}
import React from 'react';

interface LuxuryProgressDisplayProps {
  isVisible: boolean;
  taskDescription?: string;
  progress?: number;
  className?: string;
}

export default function LuxuryProgressDisplay({
  isVisible,
  taskDescription = "Implementation in progress...",
  progress = 0,
  className = ""
}: LuxuryProgressDisplayProps) {
  if (!isVisible) return null;

  return (
    <div className={`fixed bottom-6 right-6 bg-white border border-zinc-200 shadow-lg p-6 max-w-sm ${className}`}>
      <div className="mb-4">
        <div 
          className="font-serif text-sm font-light text-black"
          style={{ fontFamily: 'Times New Roman, serif' }}
        >
          {taskDescription}
        </div>
      </div>
      
      {/* Minimal Progress Bar */}
      <div className="w-full bg-zinc-100 h-1">
        <div 
          className="bg-black h-1 transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>
      
      {progress > 0 && (
        <div 
          className="text-xs text-zinc-500 mt-2 text-right"
          style={{ fontFamily: 'Times New Roman, serif' }}
        >
          {Math.round(progress)}% Complete
        </div>
      )}
    </div>
  );
}
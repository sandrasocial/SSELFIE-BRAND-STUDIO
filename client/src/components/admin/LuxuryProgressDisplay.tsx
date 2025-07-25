// SSELFIE Studio - Luxury Progress Display
// Swiss-watch precision progress monitoring

import React from 'react';

interface TaskStatus {
  taskId: string;
  agentName: string;
  status: 'planning' | 'executing' | 'validating' | 'complete' | 'failed';
  progress: number;
  currentStep?: string;
  estimatedCompletion?: string;
  validationResults?: Array<{
    gate: string;
    passed: boolean;
    details: string;
  }>;
}

interface LuxuryProgressDisplayProps {
  taskStatus: TaskStatus | null;
  onDismiss?: () => void;
}

export const LuxuryProgressDisplay: React.FC<LuxuryProgressDisplayProps> = ({
  taskStatus,
  onDismiss
}) => {
  if (!taskStatus) return null;

  const getStatusText = () => {
    switch (taskStatus.status) {
      case 'planning': return 'Analyzing request...';
      case 'executing': return 'Implementing changes...';
      case 'validating': return 'Validating quality...';
      case 'complete': return 'Implementation complete';
      case 'failed': return 'Needs attention';
      default: return 'Processing...';
    }
  };

  const isComplete = taskStatus.status === 'complete';
  const hasError = taskStatus.status === 'failed';

  return (
    <div className="fixed bottom-6 right-6 max-w-sm z-50">
      <div className="bg-white shadow-2xl rounded-3xl border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="px-6 pt-6 pb-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="font-serif text-lg font-light tracking-wide text-black uppercase">
                {taskStatus.agentName}
              </h3>
              <div className="text-xs text-gray-500 tracking-[0.1em] uppercase mt-1">
                Agent Bridge
              </div>
            </div>
            
            {onDismiss && (
              <button
                onClick={onDismiss}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-100 rounded-full h-1 mb-3">
            <div 
              className={`h-1 rounded-full transition-all duration-500 ${
                hasError ? 'bg-red-500' : isComplete ? 'bg-green-500' : 'bg-black'
              }`}
              style={{ width: `${taskStatus.progress}%` }}
            />
          </div>

          {/* Status Text */}
          <p className="text-sm text-gray-600 font-light">
            {taskStatus.currentStep || getStatusText()}
          </p>

          {/* Progress Percentage */}
          <div className="text-right">
            <span className="text-xs text-gray-400">
              {taskStatus.progress}%
            </span>
          </div>
        </div>

        {/* Completion Status */}
        {isComplete && (
          <div className="px-6 pb-6">
            <div className="bg-green-50 rounded-2xl p-4">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                <span className="text-sm text-green-700 font-medium">
                  Implementation complete
                </span>
              </div>
              <p className="text-xs text-green-600 mt-2">
                Your request has been successfully implemented and validated.
              </p>
            </div>
          </div>
        )}

        {/* Error Status */}
        {hasError && taskStatus.validationResults && (
          <div className="px-6 pb-6">
            <div className="bg-red-50 rounded-2xl p-4">
              <div className="flex items-center space-x-2 mb-2">
                <div className="w-2 h-2 bg-red-500 rounded-full" />
                <span className="text-sm text-red-700 font-medium">
                  Needs attention
                </span>
              </div>
              
              {/* Show failed validation gates */}
              {taskStatus.validationResults
                .filter(result => !result.passed)
                .slice(0, 2)
                .map((result, index) => (
                  <p key={index} className="text-xs text-red-600 mb-1">
                    • {result.gate.replace('_', ' ')}: {result.details}
                  </p>
                ))}
            </div>
          </div>
        )}

        {/* Estimated Completion */}
        {taskStatus.estimatedCompletion && !isComplete && !hasError && (
          <div className="px-6 pb-6">
            <div className="text-xs text-gray-400">
              Estimated completion: {new Date(taskStatus.estimatedCompletion).toLocaleTimeString()}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
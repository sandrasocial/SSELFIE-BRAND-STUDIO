import React from 'react';

interface TrainingProgressProps {
  status: 'idle' | 'uploading' | 'training' | 'complete';
  progress: number;
  modelInfo?: {
    id: string;
    name: string;
    created: Date;
  };
}

export const TrainingProgress: React.FC<TrainingProgressProps> = ({
  status,
  progress,
  modelInfo
}) => {
  return (
    <div className="training-progress">
      <div className="status-indicator">
        <div className="progress-bar" style={{ width: `${progress}%` }} />
        <span className="status-text">{status}</span>
      </div>
      
      {modelInfo && (
        <div className="model-info">
          <h4>Model: {modelInfo.name}</h4>
          <p>Created: {modelInfo.created.toLocaleDateString()}</p>
        </div>
      )}
      
      <div className="step-indicators">
        <Step completed={status !== 'idle'} label="Upload" />
        <Step completed={status === 'training' || status === 'complete'} label="Process" />
        <Step completed={status === 'complete'} label="Complete" />
      </div>
    </div>
  );
};

const Step: React.FC<{ completed: boolean; label: string }> = ({ completed, label }) => (
  <div className={`step ${completed ? 'completed' : ''}`}>
    <div className="step-dot" />
    <span>{label}</span>
  </div>
);
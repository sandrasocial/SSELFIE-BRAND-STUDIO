import React, { useState } from 'react';
import ErrorBoundary from '../ErrorBoundary';

const TrainModule = () => {
  const [training, setTraining] = useState(false);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState(0);

  const handleTraining = async (modelData) => {
    try {
      setTraining(true);
      setError(null);

      const response = await fetch('/api/train', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(modelData),
      });

      if (!response.ok) {
        throw new Error('Training failed');
      }

      const data = await response.json();
      return data;
    } catch (err) {
      setError(err.message);
      // Report error to our error tracking system
      reportError(err);
      throw err;
    } finally {
      setTraining(false);
    }
  };

  const reportError = async (error) => {
    try {
      await fetch('/api/log-error', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          error: error.toString(),
          component: 'TrainModule',
          timestamp: new Date().toISOString(),
        }),
      });
    } catch (err) {
      console.error('Failed to report error:', err);
    }
  };

  const retryTraining = async () => {
    setError(null);
    try {
      await handleTraining();
    } catch (err) {
      // Error will be handled in handleTraining
    }
  };

  if (error) {
    return (
      <div className="error-container">
        <h3>Training Error</h3>
        <p>{error}</p>
        <button onClick={retryTraining}>Retry Training</button>
      </div>
    );
  }

  return (
    <div className="train-module">
      {training ? (
        <div className="training-progress">
          <h3>Training in Progress</h3>
          <progress value={progress} max="100" />
          <p>{progress}% Complete</p>
        </div>
      ) : (
        <div className="training-controls">
          {/* Training controls go here */}
        </div>
      )}
    </div>
  );
};

// Wrap the train module with error boundary
const TrainModuleWithErrorBoundary = () => (
  <ErrorBoundary>
    <TrainModule />
  </ErrorBoundary>
);

export default TrainModuleWithErrorBoundary;
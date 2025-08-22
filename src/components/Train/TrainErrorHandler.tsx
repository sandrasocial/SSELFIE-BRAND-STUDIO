import React from 'react';
import { useErrorState } from '../../hooks/useErrorState';

interface Props {
  children: React.ReactNode;
  onRetry?: () => void;
}

export const TrainErrorHandler: React.FC<Props> = ({ children, onRetry }) => {
  const { isError, errorMessage, clearError } = useErrorState();

  const handleRetry = () => {
    clearError();
    onRetry?.();
  };

  if (isError) {
    return (
      <div className="train-error">
        <h3>Training Error</h3>
        <p>{errorMessage}</p>
        <div className="error-recovery">
          <p>Don't worry! Your progress has been saved.</p>
          <div className="error-actions">
            <button onClick={handleRetry}>Resume Training</button>
            <button onClick={() => window.location.reload()}>Start Fresh</button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
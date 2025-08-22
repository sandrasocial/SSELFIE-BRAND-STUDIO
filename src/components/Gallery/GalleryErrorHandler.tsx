import React from 'react';
import { useErrorState } from '../../hooks/useErrorState';

interface Props {
  children: React.ReactNode;
}

export const GalleryErrorHandler: React.FC<Props> = ({ children }) => {
  const { isError, errorMessage, clearError } = useErrorState();

  if (isError) {
    return (
      <div className="gallery-error">
        <h3>Gallery Error</h3>
        <p>{errorMessage}</p>
        <div className="error-actions">
          <button onClick={clearError}>Try Again</button>
          <button onClick={() => window.location.reload()}>Reload Page</button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
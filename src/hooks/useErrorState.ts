import { useState, useCallback } from 'react';
import { logError } from '../utils/errorLogging';

interface ErrorState {
  error: Error | null;
  errorMessage: string;
  isError: boolean;
}

export const useErrorState = (initialState: ErrorState = { 
  error: null, 
  errorMessage: '', 
  isError: false 
}) => {
  const [errorState, setErrorState] = useState<ErrorState>(initialState);

  const handleError = useCallback((error: Error, context?: string) => {
    const errorMessage = error.message || 'An unexpected error occurred';
    
    setErrorState({
      error,
      errorMessage,
      isError: true
    });

    logError(errorMessage, { error, context });
  }, []);

  const clearError = useCallback(() => {
    setErrorState({
      error: null,
      errorMessage: '',
      isError: false
    });
  }, []);

  return {
    ...errorState,
    handleError,
    clearError
  };
};
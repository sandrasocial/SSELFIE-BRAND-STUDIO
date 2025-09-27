/**
 * Utility type for unknown error that ensures proper type narrowing
 */
export interface KnownError {
  name: string;
  message: string;
  stack?: string;
}

/**
 * Converts unknown error to a known error type safely
 */
export function toKnownError(error: unknown): KnownError {
  if (error instanceof Error) {
    return error;
  }
  
  // Handle non-Error objects
  if (typeof error === 'object' && error !== null) {
    return {
      name: 'UnknownError',
      message: JSON.stringify(error),
    };
  }
  
  // Handle primitive values
  return {
    name: 'UnknownError',
    message: String(error),
  };
}
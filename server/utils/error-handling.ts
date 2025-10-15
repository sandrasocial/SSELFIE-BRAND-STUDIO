interface CustomError extends Error {
  code?: string;
  response?: {
    data?: {
      error?: string;
    };
  };
}

/**
 * Safely extracts a string message from an unknown error
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  try {
    return JSON.stringify(error);
  } catch {
    return String(error);
  }
}

/**
 * Creates a strongly typed error object for error logging
 */
export function createErrorLog(
  error: unknown,
  context: Record<string, unknown> = {}
): Record<string, unknown> {
  return {
    timestamp: new Date().toISOString(),
    error: getErrorMessage(error),
    stack: error instanceof Error ? error.stack : undefined,
    context
  };
}

/**
 * Handles errors in a type-safe way for logging
 */
export function handleError(error: unknown) {
  if (error instanceof Error) {
    console.error('Error:', error.message);
    if (error.stack) {
      console.error('Stack:', error.stack);
    }
  } else {
    console.error('Unknown error:', error);
  }
}
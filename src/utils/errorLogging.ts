interface ErrorLogData {
  error: Error;
  errorInfo?: any;
  context?: string;
  userId?: string;
}

export const logError = async (message: string, data: ErrorLogData) => {
  console.error(message, data);
  
  try {
    await fetch('/api/log-error', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        timestamp: new Date().toISOString(),
        ...data,
      }),
    });
  } catch (err) {
    console.error('Failed to log error:', err);
  }
};
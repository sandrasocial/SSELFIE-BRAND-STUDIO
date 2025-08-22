const errorLogger = (err, req, res, next) => {
  const errorDetails = {
    message: err.message,
    stack: err.stack,
    timestamp: new Date().toISOString(),
    url: req.originalUrl,
    method: req.method,
    userId: req.user?.id || 'anonymous',
    userAgent: req.headers['user-agent'],
    ip: req.ip,
  };

  // Log to console for development
  console.error('Error:', errorDetails);

  // In production, you might want to log to a service like Sentry or your own logging system
  if (process.env.NODE_ENV === 'production') {
    // TODO: Implement production logging service integration
  }

  // Don't expose error details in production
  if (process.env.NODE_ENV === 'production') {
    return res.status(500).json({
      error: 'An unexpected error occurred',
    });
  }

  // Send detailed error in development
  return res.status(500).json({
    error: errorDetails,
  });
};

export default errorLogger;
/**
 * Centralized Express Error Handling Middleware.
 * Prevents system errors and stack traces from leaking to the client.
 */
function errorHandler(err, req, res, next) {
  // Log the full diagnostic error locally
  console.error('[SERVER ERROR]:', {
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    path: req.originalUrl,
    method: req.method,
    timestamp: new Date().toISOString(),
  });

  // Determine standard status code
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;

  // Mask database details or stack traces, sending generic details to client
  res.status(statusCode).json({
    success: false,
    message: process.env.NODE_ENV === 'production' 
      ? 'An internal server error occurred.' 
      : err.message
  });
}

module.exports = errorHandler;

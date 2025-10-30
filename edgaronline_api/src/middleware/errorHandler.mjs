import { config } from '../../config/config.mjs';

export function errorHandler(err, req, res, next) {
  // Log error
  console.error('Error:', {
    message: err.message,
    stack: config.env === 'development' ? err.stack : undefined,
    path: req.path,
    method: req.method,
    user: req.user?.id,
    timestamp: new Date().toISOString(),
  });

  // Default error
  let status = err.status || 500;
  let message = err.message || 'Internal Server Error';
  let code = err.code || 'INTERNAL_ERROR';

  // Handle specific error types
  if (err.name === 'ValidationError') {
    status = 400;
    code = 'VALIDATION_ERROR';
  } else if (err.name === 'UnauthorizedError') {
    status = 401;
    code = 'UNAUTHORIZED';
  } else if (err.name === 'ForbiddenError') {
    status = 403;
    code = 'FORBIDDEN';
  } else if (err.name === 'NotFoundError') {
    status = 404;
    code = 'NOT_FOUND';
  }

  // Don't expose internal errors in production
  if (status === 500 && config.env === 'production') {
    message = 'An unexpected error occurred';
  }

  res.status(status).json({
    error: message,
    code: code,
    ...(config.env === 'development' && {
      stack: err.stack,
      details: err.details,
    }),
  });
}



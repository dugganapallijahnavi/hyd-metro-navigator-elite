
const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Default error
  let error = {
    message: err.message || 'Internal Server Error',
    status: err.statusCode || 500
  };

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message).join(', ');
    error = { message, status: 400 };
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const message = `${field} already exists`;
    error = { message, status: 409 };
  }

  // SQLite constraint error
  if (err.code === 'SQLITE_CONSTRAINT') {
    error = { message: 'Data constraint violation', status: 409 };
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    error = { message: 'Invalid token', status: 401 };
  }

  if (err.name === 'TokenExpiredError') {
    error = { message: 'Token expired', status: 401 };
  }

  res.status(error.status).json({
    success: false,
    error: error.message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

module.exports = errorHandler;

class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.name = 'AppError';
  }
}

function handleErrors(error, res) {
  console.error('Error:', error);

  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      success: false,
      message: error.message,
    });
  }

  // Validation error
  if (error.statusCode === 400) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }

  // Default error
  res.status(500).json({
    success: false,
    message: error.message || 'Internal server error',
  });
}

module.exports = {
  AppError,
  handleErrors,
};

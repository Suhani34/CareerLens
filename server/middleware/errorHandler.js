const multer = require("multer");

const notFound = (req, res, next) => {
  res.status(404).json({
    success: false,
    message: "API route not found",
  });
};

const errorHandler = (error, req, res, next) => {
  if (res.headersSent) {
    return next(error);
  }

  let statusCode = error.statusCode || 500;
  let message = error.message;

  // Mongoose validation errors
  if (error.name === "ValidationError") {
    statusCode = 400;

    message = Object.values(error.errors)
      .map((item) => item.message)
      .join(", ");
  }

  // Invalid MongoDB data type
  if (error.name === "CastError") {
    statusCode = 400;
    message = "Invalid data format";
  }

  // Duplicate database record
  if (error.code === 11000) {
    statusCode = 409;
    message = "This record already exists";
  }

  // Invalid JSON request
  if (error.type === "entity.parse.failed") {
    statusCode = 400;
    message = "Invalid JSON request body";
  }

  if (error.type === "entity.too.large") {
    statusCode = 413;
    message = "Request body is too large";
  }

  // File-upload errors
  if (error instanceof multer.MulterError) {
    statusCode =
      error.code === "LIMIT_FILE_SIZE"
        ? 413
        : 400;

    message =
      error.code === "LIMIT_FILE_SIZE"
        ? "Uploaded file exceeds the allowed size"
        : "Invalid file upload";
  }

  // Never return internal error details
  if (statusCode >= 500) {
    console.error(error);
    message = "Internal server error";
  }

  return res.status(statusCode).json({
    success: false,
    message: message || "Request failed",
  });
};

module.exports = {
  notFound,
  errorHandler,
};
const mongoose = require("mongoose");

class ApiError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
  }
}

// Handle errors from asynchronous controllers
const asyncHandler = (handler) => {
  return (req, res, next) => {
    Promise.resolve()
      .then(() => handler(req, res, next))
      .catch(next);
  };
};

// Standard success response
const sendSuccess = (
  res,
  data,
  message = "Request successful",
  statusCode = 200
) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

// Validate MongoDB ObjectId
const validateId = (id, label = "ID") => {
  if (
    typeof id !== "string" ||
    !mongoose.isObjectIdOrHexString(id)
  ) {
    throw new ApiError(400, `Invalid ${label}`);
  }
};

// Safely read a string
const readString = (
  value,
  label,
  maxLength = 200
) => {
  if (value === undefined || value === null) {
    return "";
  }

  if (typeof value !== "string") {
    throw new ApiError(
      400,
      `${label} must be a string`
    );
  }

  const result = value.trim();

  if (result.length > maxLength) {
    throw new ApiError(
      400,
      `${label} exceeds ${maxLength} characters`
    );
  }

  return result;
};

// Safely read a non-negative number
const readNumber = (value, label) => {
  if (
    value === undefined ||
    value === null ||
    value === ""
  ) {
    return undefined;
  }

  if (
    !["string", "number"].includes(typeof value) ||
    (typeof value === "string" && !value.trim())
  ) {
    throw new ApiError(400, `Invalid ${label}`);
  }

  const number = Number(value);

  if (!Number.isFinite(number) || number < 0) {
    throw new ApiError(
      400,
      `${label} must be a non-negative number`
    );
  }

  return number;
};

// Validate JSON objects
const requireObject = (value, label = "Body") => {
  if (
    !value ||
    typeof value !== "object" ||
    Array.isArray(value)
  ) {
    throw new ApiError(
      400,
      `${label} must be an object`
    );
  }

  return value;
};

// Validate arrays of strings
const readStringArray = (
  value,
  label,
  maxItems = 50
) => {
  if (
    !Array.isArray(value) ||
    value.length > maxItems
  ) {
    throw new ApiError(
      400,
      `${label} must be an array with at most ${maxItems} items`
    );
  }

  const items = value
    .map((item) => readString(item, label, 100))
    .filter(Boolean);

  return [...new Set(items)];
};

// Escape special regex characters
const escapeRegex = (value) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// Pagination
const getPagination = (query, defaultLimit = 12) => {
  const page = readNumber(query.page, "Page") ?? 1;
  const limit =
    readNumber(query.limit, "Limit") ?? defaultLimit;

  if (
    !Number.isInteger(page) ||
    !Number.isInteger(limit) ||
    page < 1 ||
    page > 10000 ||
    limit < 1 ||
    limit > 100
  ) {
    throw new ApiError(
      400,
      "Invalid pagination parameters"
    );
  }

  return {
    page,
    limit,
    skip: (page - 1) * limit,
  };
};

// Pagination response metadata
const paginationMeta = (total, page, limit) => ({
  total,
  page,
  limit,
  totalPages: Math.ceil(total / limit),
  hasNextPage: page * limit < total,
  hasPreviousPage: page > 1,
});

module.exports = {
  ApiError,
  asyncHandler,
  sendSuccess,
  validateId,
  readString,
  readNumber,
  requireObject,
  readStringArray,
  escapeRegex,
  getPagination,
  paginationMeta,
};
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const {
  ApiError,
  asyncHandler,
} = require("../utils/api");

const protect = asyncHandler(
  async (req, res, next) => {
    const authorization =
      req.headers.authorization;

    if (
      !authorization ||
      !authorization.startsWith("Bearer ")
    ) {
      throw new ApiError(
        401,
        "Please log in to access this resource"
      );
    }

    const token = authorization
      .slice(7)
      .trim();

    let decoded;

    try {
      decoded = jwt.verify(
        token,
        process.env.JWT_SECRET,
        {
          algorithms: ["HS256"],
          issuer: "careerlens-api",
          audience: "careerlens-client",
        }
      );
    } catch {
      throw new ApiError(
        401,
        "Invalid or expired login token"
      );
    }

    if (
      !decoded ||
      typeof decoded.sub !== "string"
    ) {
      throw new ApiError(
        401,
        "Invalid login token"
      );
    }

    const user = await User.findById(decoded.sub)
      .select("-password");

    if (!user) {
      throw new ApiError(
        401,
        "User account no longer exists"
      );
    }

    req.user = user;

    next();
  }
);

const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (
      !req.user ||
      !allowedRoles.includes(req.user.role)
    ) {
      return next(
        new ApiError(
          403,
          "You are not authorized for this action"
        )
      );
    }

    next();
  };
};

module.exports = {
  protect,
  authorize,
};
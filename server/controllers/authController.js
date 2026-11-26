const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/User");

const {
  ApiError,
  asyncHandler,
  sendSuccess,
  readString,
  requireObject,
} = require("../utils/api");

// Generate a signed JWT
const generateToken = (userId) => {
  return jwt.sign(
    {
      sub: userId.toString(),
    },
    process.env.JWT_SECRET,
    {
      algorithm: "HS256",
      expiresIn:
        process.env.JWT_EXPIRES_IN || "1d",
      issuer: "careerlens-api",
      audience: "careerlens-client",
    }
  );
};

// Return safe user data
const sanitizeUser = (user) => {
  const result = user.toObject();

  delete result.password;
  delete result.__v;

  return result;
};

// POST /api/auth/register
const register = asyncHandler(
  async (req, res) => {
    const body = requireObject(req.body);

    const name = readString(
      body.name,
      "Name",
      100
    );

    const email = readString(
      body.email,
      "Email",
      254
    ).toLowerCase();

    const password = body.password;

    if (!name || !email || !password) {
      throw new ApiError(
        400,
        "Name, email and password are required"
      );
    }

    if (!/^\S+@\S+\.\S+$/.test(email)) {
      throw new ApiError(
        400,
        "Enter a valid email address"
      );
    }

    if (
      typeof password !== "string" ||
      password.length < 8 ||
      Buffer.byteLength(password, "utf8") > 72
    ) {
      throw new ApiError(
        400,
        "Password must contain at least 8 characters and at most 72 UTF-8 bytes"
      );
    }

    const existingUser = await User.findOne({
      email,
    });

    if (existingUser) {
      throw new ApiError(
        409,
        "An account with this email already exists"
      );
    }

    const hashedPassword = await bcrypt.hash(
      password,
      12
    );

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: "candidate",
    });

    const token = generateToken(user._id);

    return sendSuccess(
      res,
      {
        user: sanitizeUser(user),
        token,
      },
      "Account created successfully",
      201
    );
  }
);

// POST /api/auth/login
const login = asyncHandler(
  async (req, res) => {
    const body = requireObject(req.body);

    const email = readString(
      body.email,
      "Email",
      254
    ).toLowerCase();

    const password = body.password;

    if (
      !email ||
      typeof password !== "string" ||
      !password ||
      Buffer.byteLength(password, "utf8") > 72
    ) {
      throw new ApiError(
        400,
        "Email and valid password are required"
      );
    }

    const user = await User.findOne({
      email,
    }).select("+password");

    if (!user) {
      throw new ApiError(
        401,
        "Invalid email or password"
      );
    }

    const passwordMatches =
      await bcrypt.compare(
        password,
        user.password
      );

    if (!passwordMatches) {
      throw new ApiError(
        401,
        "Invalid email or password"
      );
    }

    const token = generateToken(user._id);

    return sendSuccess(
      res,
      {
        user: sanitizeUser(user),
        token,
      },
      "Login successful"
    );
  }
);

// GET /api/auth/me
const getMe = asyncHandler(
  async (req, res) => {
    return sendSuccess(
      res,
      sanitizeUser(req.user),
      "User retrieved successfully"
    );
  }
);

module.exports = {
  register,
  login,
  getMe,
};
// Load environment variables FIRST
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const helmet = require("helmet");

// Database configuration
const connectDB = require("./config/db");

// Models
const User = require("./models/User");
const Company = require("./models/Company");
const Job = require("./models/Job");
const Application = require("./models/Application");
const SavedJob = require("./models/SavedJob");
const BehaviorEvent = require("./models/BehaviorEvent");
const Article = require("./models/Article");

// Routes
const authRoutes = require("./routes/authRoutes");
const jobRoutes = require("./routes/jobRoutes");
const companyRoutes = require("./routes/companyRoutes");
const profileRoutes = require("./routes/profileRoutes");
const savedJobRoutes = require("./routes/savedJobRoutes");
const applicationRoutes = require("./routes/applicationRoutes");
const articleRoutes = require("./routes/articleRoutes");
const behaviorRoutes = require("./routes/behaviorRoutes");

// Error handling
const {
  notFound,
  errorHandler,
} = require("./middleware/errorHandler");

const {
  asyncHandler,
} = require("./utils/api");

const app = express();

// Security headers
app.use(helmet());

app.disable("x-powered-by");

// CORS configuration
app.use(
  cors({
    origin:
      process.env.CLIENT_URL ||
      "http://localhost:5173",

    methods: [
      "GET",
      "POST",
      "PUT",
      "PATCH",
      "DELETE",
      "OPTIONS",
    ],

    allowedHeaders: [
      "Content-Type",
      "Authorization",
    ],
  })
);

// JSON and form parsing
app.use(
  express.json({
    limit: "1mb",
  })
);

app.use(
  express.urlencoded({
    extended: false,
    limit: "1mb",
  })
);

// Avoid caching private API responses
app.use("/api", (req, res, next) => {
  res.set("Cache-Control", "no-store");

  next();
});

// Root route
app.get("/", (req, res) => {
  res.json({
    message: "Welcome to CareerLens API",
    status: "success",
    version: "1.0.0",
  });
});

// Phase 1 health-check API
app.get("/api/health", (req, res) => {
  const connected =
    mongoose.connection.readyState === 1;

  res.status(
    connected ? 200 : 503
  ).json({
    success: connected,

    application: "CareerLens",

    server: "Running",

    database: connected
      ? "Connected"
      : "Disconnected",

    timestamp: new Date().toISOString(),
  });
});

// Phase 2 database-statistics API
app.get(
  "/api/stats",

  asyncHandler(
    async (req, res) => {
      const activeFilter = {
        status: "Active",

        deadline: {
          $gte: new Date(),
        },
      };

      const [
        companies,
        jobs,
        articles,
        categories,
      ] = await Promise.all([
        Company.countDocuments({
          isDemo: true,
        }),

        Job.countDocuments(
          activeFilter
        ),

        Article.countDocuments({
          status: "Published",
        }),

        Job.distinct(
          "category",
          activeFilter
        ),
      ]);

      return res.json({
        success: true,

        data: {
          companies,
          jobs,
          articles,

          categories:
            categories.length,
        },
      });
    }
  )
);

// Register all API routes
app.use("/api/auth", authRoutes);

app.use("/api/jobs", jobRoutes);

app.use(
  "/api/companies",
  companyRoutes
);

app.use(
  "/api/profile",
  profileRoutes
);

app.use(
  "/api/saved-jobs",
  savedJobRoutes
);

app.use(
  "/api/applications",
  applicationRoutes
);

app.use(
  "/api/articles",
  articleRoutes
);

app.use(
  "/api/behavior",
  behaviorRoutes
);

// Handle unknown routes
app.use(notFound);

// Handle errors
app.use(errorHandler);

// Server configuration
const PORT = process.env.PORT || 5000;

// Start the server
const startServer = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error(
        "MONGO_URI is missing from .env"
      );
    }

    if (
      !process.env.JWT_SECRET ||
      process.env.JWT_SECRET.length < 32 ||
      process.env.JWT_SECRET.includes(
        "replace_with"
      ) ||
      process.env.JWT_SECRET.includes(
        "PASTE_YOUR"
      )
    ) {
      throw new Error(
        "Configure a secure JWT_SECRET in .env"
      );
    }

    await connectDB();

    // Ensure all database indexes exist
    await Promise.all([
      User.init(),
      Company.init(),
      Job.init(),
      Application.init(),
      SavedJob.init(),
      BehaviorEvent.init(),
      Article.init(),
    ]);

    // Local development server
    app.listen(
      PORT,
      "127.0.0.1",

      () => {
        console.log(
          `CareerLens API running on http://localhost:${PORT}`
        );

        console.log(
          "Authentication: Enabled"
        );

        console.log(
          "Database models: Initialized"
        );

        console.log(
          "REST API modules: Ready"
        );
      }
    );
  } catch (error) {
    console.error(
      "Server startup failed:",
      error.message
    );

    await mongoose.disconnect();

    process.exitCode = 1;
  }
};

startServer();
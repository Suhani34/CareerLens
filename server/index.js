const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const mongoose = require("mongoose");

const connectDB = require("./config/db");

const Company = require("./models/Company");
const Job = require("./models/Job");
const Article = require("./models/Article");
// Load environment variables
dotenv.config();

// Initialize Express
const app = express();

// Middleware
app.use(
  cors({
    origin: process.env.CLIENT_URL,
  })
);

app.use(express.json());

// Root route
app.get("/", (req, res) => {
  res.json({
    message: "Welcome to CareerLens API",
    status: "success",
  });
});

// Health check route
app.get("/api/health", (req, res) => {
  const connected =
    mongoose.connection.readyState === 1;

  res.status(connected ? 200 : 503).json({
    success: connected,
    application: "CareerLens",
    server: "Running",
    database: connected
      ? "Connected"
      : "Disconnected",
    timestamp: new Date().toISOString(),
  });
});

// Database statistics
app.get("/api/stats", async (req, res) => {
  try {
    const [
      companies,
      jobs,
      articles,
      categories,
    ] = await Promise.all([
      Company.countDocuments({
        isDemo: true,
      }),

      Job.countDocuments({
        status: "Active",
      }),

      Article.countDocuments({
        status: "Published",
      }),

      Job.distinct("category", {
        status: "Active",
      }),
    ]);

    res.status(200).json({
      success: true,

      data: {
        companies,
        jobs,
        articles,
        categories: categories.length,
      },
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message:
        "Unable to retrieve database statistics",
    });
  }
});

// Handle unknown routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "API route not found",
  });
});

// Server port
const PORT = process.env.PORT || 5000;

// Connect database and start server
const startServer = async () => {
  await connectDB();

  app.listen(PORT, () => {
    console.log(
      `CareerLens API running on http://localhost:${PORT}`
    );
  });
};

startServer();
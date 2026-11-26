const express = require("express");

const {
  rateLimit,
} = require("express-rate-limit");

const {
  getProfile,
  updateProfile,
  saveResume,
  getResume,
  deleteResume,
} = require("../controllers/profileController");

const {
  protect,
} = require("../middleware/auth");

const {
  uploadResume,
} = require("../middleware/upload");

const router = express.Router();

const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: "draft-7",
  legacyHeaders: false,

  message: {
    success: false,
    message: "Too many document uploads",
  },
});

router.use(protect);

router.get("/", getProfile);

router.put("/", updateProfile);

router.post(
  "/resume",
  uploadLimiter,
  uploadResume,
  saveResume
);

router.get(
  "/resume",
  getResume
);

router.delete(
  "/resume",
  deleteResume
);

module.exports = router;
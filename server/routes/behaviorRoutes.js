const express = require("express");

const {
  rateLimit,
} = require("express-rate-limit");

const {
  createEvent,
  getEvents,
  getBehaviorSummary,
  clearEvents,
} = require(
  "../controllers/behaviorController"
);

const {
  protect,
} = require("../middleware/auth");

const router = express.Router();

const eventLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  standardHeaders: "draft-7",
  legacyHeaders: false,

  message: {
    success: false,
    message:
      "Too many behavior events",
  },
});

router.use(protect);

router.post(
  "/events",
  eventLimiter,
  createEvent
);

router.get(
  "/events",
  getEvents
);

router.get(
  "/summary",
  getBehaviorSummary
);

router.delete(
  "/events",
  clearEvents
);

module.exports = router;
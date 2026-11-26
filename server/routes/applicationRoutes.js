const express = require("express");

const {
  rateLimit,
} = require("express-rate-limit");

const {
  submitApplication,
  getApplications,
  getApplicationByJob,
  getApplicationDetails,
  getApplicationResume,
  getApplicationDocument,
  withdrawApplication,
  updateApplicationStatus,
} = require(
  "../controllers/applicationController"
);

const {
  protect,
  authorize,
} = require("../middleware/auth");

const {
  uploadDocuments,
} = require("../middleware/upload");

const router = express.Router();

const submissionLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: "draft-7",
  legacyHeaders: false,

  message: {
    success: false,
    message:
      "Too many application requests",
  },
});

router.use(protect);

router.get(
  "/",
  getApplications
);

router.post(
  "/",
  authorize("candidate"),
  submissionLimiter,
  uploadDocuments,
  submitApplication
);

router.get(
  "/job/:jobId",
  getApplicationByJob
);

router.get(
  "/:id/resume",
  getApplicationResume
);

router.get(
  "/:id/documents/:index",
  getApplicationDocument
);

router.patch(
  "/:id/withdraw",
  withdrawApplication
);

router.patch(
  "/:id/status",
  authorize("admin"),
  updateApplicationStatus
);

router.get(
  "/:id",
  getApplicationDetails
);

module.exports = router;
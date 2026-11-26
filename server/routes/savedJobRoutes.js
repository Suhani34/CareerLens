const express = require("express");

const {
  getSavedJobs,
  getSavedJobIds,
  saveJob,
  removeSavedJob,
} = require(
  "../controllers/savedJobController"
);

const {
  protect,
} = require("../middleware/auth");

const router = express.Router();

router.use(protect);

router.get("/", getSavedJobs);

router.get("/ids", getSavedJobIds);

router.post("/", saveJob);

router.delete(
  "/:jobId",
  removeSavedJob
);

module.exports = router;
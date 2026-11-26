const express = require("express");

const {
  getJobs,
  getJobFilters,
  getJobDetails,
  getSimilarJobs,
} = require("../controllers/jobController");

const router = express.Router();

router.get("/", getJobs);

router.get("/filters", getJobFilters);

router.get(
  "/:identifier/similar",
  getSimilarJobs
);

router.get(
  "/:identifier",
  getJobDetails
);

module.exports = router;
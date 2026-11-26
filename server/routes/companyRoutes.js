const express = require("express");

const {
  getCompanies,
  getCompanyDetails,
} = require("../controllers/companyController");

const router = express.Router();

router.get("/", getCompanies);

router.get(
  "/:identifier",
  getCompanyDetails
);

module.exports = router;
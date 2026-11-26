const express = require("express");

const {
  getArticles,
  getArticleCategories,
  getArticleDetails,
} = require(
  "../controllers/articleController"
);

const router = express.Router();

router.get(
  "/",
  getArticles
);

router.get(
  "/categories",
  getArticleCategories
);

router.get(
  "/:identifier",
  getArticleDetails
);

module.exports = router;
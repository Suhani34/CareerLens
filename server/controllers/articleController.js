const mongoose = require("mongoose");

const Article = require("../models/Article");

const {
  ApiError,
  asyncHandler,
  sendSuccess,
  readString,
  escapeRegex,
  getPagination,
  paginationMeta,
} = require("../utils/api");

// GET /api/articles
const getArticles = asyncHandler(
  async (req, res) => {
    const {
      page,
      limit,
      skip,
    } = getPagination(req.query, 9);

    const filter = {
      status: "Published",
    };

    const category = readString(
      req.query.category,
      "Category",
      100
    );

    if (category) {
      filter.category = category;
    }

    const search = readString(
      req.query.search,
      "Search",
      100
    );

    if (search) {
      const regex = new RegExp(
        escapeRegex(search),
        "i"
      );

      filter.$or = [
        { title: regex },
        { excerpt: regex },
        { tags: regex },
      ];
    }

    if (req.query.featured !== undefined) {
      const featured = readString(
        req.query.featured,
        "Featured",
        5
      );

      if (!["true", "false"].includes(featured)) {
        throw new ApiError(
          400,
          "Invalid featured value"
        );
      }

      filter.featured = featured === "true";
    }

    const [
      articles,
      total,
    ] = await Promise.all([
      Article.find(filter)
        .select("-content")
        .sort({
          publishedAt: -1,
          _id: -1,
        })
        .skip(skip)
        .limit(limit)
        .lean(),

      Article.countDocuments(filter),
    ]);

    return sendSuccess(res, {
      articles,

      pagination: paginationMeta(
        total,
        page,
        limit
      ),
    });
  }
);

// GET /api/articles/categories
const getArticleCategories = asyncHandler(
  async (req, res) => {
    const categories =
      await Article.distinct(
        "category",

        {
          status: "Published",
        }
      );

    return sendSuccess(
      res,
      categories.sort()
    );
  }
);

// GET /api/articles/:identifier
const getArticleDetails = asyncHandler(
  async (req, res) => {
    const identifier = readString(
      req.params.identifier,
      "Article identifier",
      250
    );

    const lookup =
      mongoose.isObjectIdOrHexString(identifier)
        ? { _id: identifier }
        : { slug: identifier };

    const article = await Article.findOne({
      ...lookup,
      status: "Published",
    }).lean();

    if (!article) {
      throw new ApiError(
        404,
        "Article not found"
      );
    }

    const relatedArticles =
      await Article.find({
        _id: {
          $ne: article._id,
        },

        status: "Published",

        $or: [
          {
            category: article.category,
          },

          {
            tags: {
              $in: article.tags,
            },
          },
        ],
      })
        .select("-content")
        .sort({
          publishedAt: -1,
        })
        .limit(3)
        .lean();

    return sendSuccess(res, {
      article,
      relatedArticles,
    });
  }
);

module.exports = {
  getArticles,
  getArticleCategories,
  getArticleDetails,
};
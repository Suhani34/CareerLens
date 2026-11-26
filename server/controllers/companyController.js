const mongoose = require("mongoose");

const Company = require("../models/Company");
const Job = require("../models/Job");

const {
  ApiError,
  asyncHandler,
  sendSuccess,
  readString,
  escapeRegex,
  getPagination,
  paginationMeta,
} = require("../utils/api");

const activeJobFilter = () => ({
  status: "Active",
  deadline: {
    $gte: new Date(),
  },
});

// GET /api/companies
const getCompanies = asyncHandler(
  async (req, res) => {
    const {
      page,
      limit,
      skip,
    } = getPagination(req.query);

    const filter = {};

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
        { name: regex },
        { industry: regex },
        { headquarters: regex },
      ];
    }

    const industry = readString(
      req.query.industry,
      "Industry",
      100
    );

    if (industry) {
      filter.industry = industry;
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

    const [companies, total] =
      await Promise.all([
        Company.find(filter)
          .sort({
            featured: -1,
            name: 1,
          })
          .skip(skip)
          .limit(limit)
          .lean(),

        Company.countDocuments(filter),
      ]);

    const companyIds = companies.map(
      (company) => company._id
    );

    const counts = await Job.aggregate([
      {
        $match: {
          ...activeJobFilter(),

          company: {
            $in: companyIds,
          },
        },
      },

      {
        $group: {
          _id: "$company",
          count: { $sum: 1 },
        },
      },
    ]);

    const countMap = new Map(
      counts.map(
        (item) => [
          item._id.toString(),
          item.count,
        ]
      )
    );

    const result = companies.map(
      (company) => ({
        ...company,

        openJobs:
          countMap.get(
            company._id.toString()
          ) || 0,
      })
    );

    return sendSuccess(res, {
      companies: result,

      pagination: paginationMeta(
        total,
        page,
        limit
      ),
    });
  }
);

// GET /api/companies/:identifier
const getCompanyDetails = asyncHandler(
  async (req, res) => {
    const identifier = readString(
      req.params.identifier,
      "Company identifier",
      200
    );

    const lookup =
      mongoose.isObjectIdOrHexString(identifier)
        ? { _id: identifier }
        : { slug: identifier };

    const company = await Company.findOne(
      lookup
    ).lean();

    if (!company) {
      throw new ApiError(
        404,
        "Company not found"
      );
    }

    const filter = {
      ...activeJobFilter(),
      company: company._id,
    };

    const [
      jobs,
      openJobs,
    ] = await Promise.all([
      Job.find(filter)
        .sort({ postedAt: -1 })
        .limit(12)
        .populate(
          "company",
          "name slug logo brandColor industry"
        )
        .lean(),

      Job.countDocuments(filter),
    ]);

    return sendSuccess(res, {
      company,
      jobs,
      openJobs,
    });
  }
);

module.exports = {
  getCompanies,
  getCompanyDetails,
};
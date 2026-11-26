const mongoose = require("mongoose");

const Job = require("../models/Job");
const Company = require("../models/Company");

const {
  ApiError,
  asyncHandler,
  sendSuccess,
  readString,
  readNumber,
  escapeRegex,
  getPagination,
  paginationMeta,
} = require("../utils/api");

// Only return jobs currently available
const activeJobs = () => ({
  status: "Active",
  deadline: {
    $gte: new Date(),
  },
});

const companyFields =
  "name slug logo brandColor industry headquarters companySize";

// GET /api/jobs
const getJobs = asyncHandler(
  async (req, res) => {
    const {
      page,
      limit,
      skip,
    } = getPagination(req.query);

    const filter = activeJobs();

    // Keyword search
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

      const matchingCompanies =
        await Company.find({
          name: regex,
        }).select("_id");

      filter.$or = [
        { title: regex },
        { description: regex },
        { skills: regex },
        { category: regex },
        {
          company: {
            $in: matchingCompanies.map(
              (company) => company._id
            ),
          },
        },
      ];
    }

    // Standard filters
    const fields = [
      "category",
      "location",
      "workMode",
      "jobType",
      "industry",
    ];

    for (const field of fields) {
      const value = readString(
        req.query[field],
        field,
        100
      );

      if (value) {
        filter[field] = new RegExp(
          `^${escapeRegex(value)}$`,
          "i"
        );
      }
    }

    // Experience level
    const level = readString(
      req.query.experienceLevel,
      "Experience level",
      50
    );

    if (level) {
      filter["experience.level"] = level;
    }

    // Candidate's years of experience
    const experience = readNumber(
      req.query.experience,
      "Experience"
    );

    if (experience !== undefined) {
      filter["experience.min"] = {
        $lte: experience,
      };

      filter["experience.max"] = {
        $gte: experience,
      };
    }

    // Salary range (annual INR)
    const salaryMin = readNumber(
      req.query.salaryMin,
      "Minimum salary"
    );

    const salaryMax = readNumber(
      req.query.salaryMax,
      "Maximum salary"
    );

    if (
      salaryMin !== undefined &&
      salaryMax !== undefined &&
      salaryMin > salaryMax
    ) {
      throw new ApiError(
        400,
        "Minimum salary cannot exceed maximum salary"
      );
    }

    // Return overlapping salary ranges
    if (salaryMin !== undefined) {
      filter["salary.max"] = {
        $gte: salaryMin,
      };
    }

    if (salaryMax !== undefined) {
      filter["salary.min"] = {
        $lte: salaryMax,
      };
    }

    // Multiple skills separated by commas
    const skills = readString(
      req.query.skills,
      "Skills",
      500
    );

    if (skills) {
      const skillList = skills
        .split(",")
        .map((skill) => skill.trim())
        .filter(Boolean);

      if (skillList.length > 20) {
        throw new ApiError(
          400,
          "Select at most 20 skills"
        );
      }

      if (skillList.length) {
        filter.skills = {
          $all: skillList.map(
            (skill) =>
              new RegExp(
                `^${escapeRegex(skill)}$`,
                "i"
              )
          ),
        };
      }
    }

    // Featured and trending filters
    for (const field of ["featured", "trending"]) {
      if (req.query[field] !== undefined) {
        const value = readString(
          req.query[field],
          field,
          5
        );

        if (!["true", "false"].includes(value)) {
          throw new ApiError(
            400,
            `Invalid ${field} value`
          );
        }

        filter[field] = value === "true";
      }
    }

    // Filter by company slug
    const companySlug = readString(
      req.query.company,
      "Company",
      200
    );

    if (companySlug) {
      const company = await Company.findOne({
        slug: companySlug,
      }).select("_id");

      if (!company) {
        return sendSuccess(res, {
          jobs: [],
          pagination: paginationMeta(
            0,
            page,
            limit
          ),
        });
      }

      filter.company = company._id;
    }

    // Sorting
    const sortOptions = {
      newest: {
        postedAt: -1,
        _id: -1,
      },

      oldest: {
        postedAt: 1,
        _id: 1,
      },

      salary_high: {
        "salary.max": -1,
        _id: 1,
      },

      salary_low: {
        "salary.min": 1,
        _id: 1,
      },

      popular: {
        views: -1,
        postedAt: -1,
        _id: 1,
      },

      title_asc: {
        title: 1,
        _id: 1,
      },
    };

    const sortName =
      readString(
        req.query.sort,
        "Sort",
        30
      ) || "newest";

    if (!Object.hasOwn(sortOptions, sortName)) {
      throw new ApiError(
        400,
        "Invalid sorting option"
      );
    }

    const [jobs, total] =
      await Promise.all([
        Job.find(filter)
          .populate("company", companyFields)
          .sort(sortOptions[sortName])
          .skip(skip)
          .limit(limit)
          .lean(),

        Job.countDocuments(filter),
      ]);

    return sendSuccess(res, {
      jobs,
      pagination: paginationMeta(
        total,
        page,
        limit
      ),
    });
  }
);

// GET /api/jobs/filters
const getJobFilters = asyncHandler(
  async (req, res) => {
    const filter = activeJobs();

    const [
      categories,
      locations,
      industries,
      skills,
      jobTypes,
      workModes,
      experienceLevels,
      salaryStats,
    ] = await Promise.all([
      Job.aggregate([
        { $match: filter },

        {
          $group: {
            _id: "$category",
            count: { $sum: 1 },
          },
        },

        {
          $sort: {
            _id: 1,
          },
        },
      ]),

      Job.distinct("location", filter),
      Job.distinct("industry", filter),
      Job.distinct("skills", filter),
      Job.distinct("jobType", filter),
      Job.distinct("workMode", filter),

      Job.distinct(
        "experience.level",
        filter
      ),

      Job.aggregate([
        { $match: filter },

        {
          $group: {
            _id: null,

            min: {
              $min: "$salary.min",
            },

            max: {
              $max: "$salary.max",
            },
          },
        },
      ]),
    ]);

    return sendSuccess(res, {
      categories: categories.map(
        (category) => ({
          name: category._id,
          count: category.count,
        })
      ),

      locations: locations.sort(),
      industries: industries.sort(),
      skills: skills.sort(),
      jobTypes: jobTypes.sort(),
      workModes: workModes.sort(),

      experienceLevels:
        experienceLevels.sort(),

      salary: {
        min: salaryStats[0]?.min || 0,
        max: salaryStats[0]?.max || 0,
        currency: "INR",
        period: "year",
      },
    });
  }
);

// Find job using either ID or slug
const findActiveJob = async (identifier) => {
  const value = readString(
    identifier,
    "Job identifier",
    250
  );

  const lookup =
    mongoose.isObjectIdOrHexString(value)
      ? { _id: value }
      : { slug: value };

  const job = await Job.findOne({
    ...activeJobs(),
    ...lookup,
  });

  if (!job) {
    throw new ApiError(
      404,
      "Job not found or no longer available"
    );
  }

  return job;
};

// GET /api/jobs/:identifier
const getJobDetails = asyncHandler(
  async (req, res) => {
    const job = await findActiveJob(
      req.params.identifier
    );

    await job.populate("company");

    return sendSuccess(
      res,
      job,
      "Job details retrieved successfully"
    );
  }
);

// GET /api/jobs/:identifier/similar
const getSimilarJobs = asyncHandler(
  async (req, res) => {
    const job = await findActiveJob(
      req.params.identifier
    );

    const candidates = await Job.find({
      ...activeJobs(),

      _id: {
        $ne: job._id,
      },

      $or: [
        {
          category: job.category,
        },
        {
          skills: {
            $in: job.skills,
          },
        },
      ],
    })
      .populate("company", companyFields)
      .lean();

    const originalSkills = new Set(
      job.skills.map(
        (skill) => skill.toLowerCase()
      )
    );

    const similar = candidates
      .map((candidate) => {
        let score = 0;

        if (
          candidate.category === job.category
        ) {
          score += 5;
        }

        if (
          candidate.workMode === job.workMode
        ) {
          score += 2;
        }

        if (
          candidate.location === job.location
        ) {
          score += 1;
        }

        for (const skill of candidate.skills) {
          if (
            originalSkills.has(
              skill.toLowerCase()
            )
          ) {
            score += 2;
          }
        }

        return {
          job: candidate,
          score,
        };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 6)
      .map((item) => item.job);

    return sendSuccess(res, similar);
  }
);

module.exports = {
  getJobs,
  getJobFilters,
  getJobDetails,
  getSimilarJobs,
};
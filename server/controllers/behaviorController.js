const BehaviorEvent = require(
  "../models/BehaviorEvent"
);

const Job = require("../models/Job");
const Company = require("../models/Company");

const {
  ApiError,
  asyncHandler,
  sendSuccess,
  readString,
  readStringArray,
  readNumber,
  requireObject,
  validateId,
  getPagination,
  paginationMeta,
} = require("../utils/api");

const {
  recordBehavior,
} = require("../services/behaviorService");

// These events can be triggered by the frontend
const CLIENT_EVENT_TYPES = [
  "JOB_SEARCH",
  "CATEGORY_VIEW",
  "SKILL_VIEW",
  "JOB_VIEW",
  "COMPANY_VIEW",
  "APPLY_INTENT",
];

// POST /api/behavior/events
const createEvent = asyncHandler(
  async (req, res) => {
    const body = requireObject(req.body);

    const eventType = readString(
      body.eventType,
      "Event type",
      50
    );

    if (
      !CLIENT_EVENT_TYPES.includes(eventType)
    ) {
      throw new ApiError(
        400,
        "Invalid client behavior event"
      );
    }

    const source =
      body.metadata === undefined
        ? {}
        : requireObject(
            body.metadata,
            "Event metadata"
          );

    const metadata = {};

    const textFields = [
      "searchQuery",
      "category",
      "location",
      "workMode",
      "industry",
      "jobType",
    ];

    for (const field of textFields) {
      if (source[field] !== undefined) {
        metadata[field] = readString(
          source[field],
          field,
          150
        );
      }
    }

    if (source.skills !== undefined) {
      metadata.skills = readStringArray(
        source.skills,
        "Skills",
        20
      );
    }

    for (
      const field
      of ["salaryMin", "salaryMax"]
    ) {
      if (source[field] !== undefined) {
        metadata[field] = readNumber(
          source[field],
          field
        );
      }
    }

    if (
      metadata.salaryMin !== undefined &&
      metadata.salaryMax !== undefined &&
      metadata.salaryMin > metadata.salaryMax
    ) {
      throw new ApiError(
        400,
        "Invalid salary preference range"
      );
    }

    if (
      metadata.workMode &&
      ![
        "Remote",
        "Hybrid",
        "On-site",
      ].includes(metadata.workMode)
    ) {
      throw new ApiError(
        400,
        "Invalid work mode"
      );
    }

    let job = null;
    let company = null;

    // Job-specific behavior
    if (
      ["JOB_VIEW", "APPLY_INTENT"]
        .includes(eventType)
    ) {
      validateId(
        body.jobId,
        "job ID"
      );

      job = await Job.findOne({
        _id: body.jobId,

        status: "Active",

        deadline: {
          $gte: new Date(),
        },
      });

      if (!job) {
        throw new ApiError(
          404,
          "Job not found"
        );
      }
    }

    // Company-specific behavior
    if (eventType === "COMPANY_VIEW") {
      validateId(
        body.companyId,
        "company ID"
      );

      company = await Company.findById(
        body.companyId
      );

      if (!company) {
        throw new ApiError(
          404,
          "Company not found"
        );
      }

      metadata.title = company.name;
      metadata.industry = company.industry;
    }

    // Require meaningful event data
    if (
      eventType === "CATEGORY_VIEW" &&
      !metadata.category
    ) {
      throw new ApiError(
        400,
        "Category is required"
      );
    }

    if (
      eventType === "SKILL_VIEW" &&
      !metadata.skills?.length
    ) {
      throw new ApiError(
        400,
        "At least one skill is required"
      );
    }

    if (
      eventType === "JOB_SEARCH" &&
      !metadata.searchQuery &&
      !metadata.category &&
      !metadata.location &&
      !metadata.workMode &&
      !metadata.industry &&
      !metadata.jobType &&
      !metadata.skills?.length &&
      metadata.salaryMin === undefined &&
      metadata.salaryMax === undefined
    ) {
      throw new ApiError(
        400,
        "Search event must contain search criteria"
      );
    }

    // Avoid identical events repeated within 10 seconds
    const recent =
      await BehaviorEvent.findOne({
        candidate: req.user._id,

        eventType,

        job: job?._id || null,

        company:
          job?.company ||
          company?._id ||
          null,

        "metadata.searchQuery":
          metadata.searchQuery || "",

        "metadata.category":
          job?.category ||
          metadata.category ||
          "",

        "metadata.skills":
          job?.skills ||
          metadata.skills ||
          [],

        "metadata.location":
          job?.location ||
          metadata.location ||
          "",

        "metadata.workMode":
          job?.workMode ||
          metadata.workMode ||
          "",

        "metadata.industry":
          job?.industry ||
          metadata.industry ||
          "",

        "metadata.jobType":
          job?.jobType ||
          metadata.jobType ||
          "",

        "metadata.salaryMin":
          job?.salary?.min ??
          metadata.salaryMin ??
          0,

        "metadata.salaryMax":
          job?.salary?.max ??
          metadata.salaryMax ??
          0,

        createdAt: {
          $gte: new Date(
            Date.now() - 10000
          ),
        },
      }).sort({
        createdAt: -1,
      });

    if (recent) {
      return sendSuccess(
        res,
        recent,
        "Recent identical event already recorded"
      );
    }

    const event = await recordBehavior({
      candidate: req.user._id,
      eventType,
      job,
      company,
      metadata,
    });

    // Count authenticated job views
    if (
      eventType === "JOB_VIEW" &&
      job
    ) {
      try {
        await Job.updateOne(
          {
            _id: job._id,
          },

          {
            $inc: {
              views: 1,
            },
          }
        );
      } catch (error) {
        console.error(
          "Job view counter update failed:",
          error.message
        );
      }
    }

    return sendSuccess(
      res,
      event,
      "Behavior event recorded",
      201
    );
  }
);

// GET /api/behavior/events
const getEvents = asyncHandler(
  async (req, res) => {
    const {
      page,
      limit,
      skip,
    } = getPagination(
      req.query,
      50
    );

    const filter = {
      candidate: req.user._id,
    };

    const eventType = readString(
      req.query.eventType,
      "Event type",
      50
    );

    if (eventType) {
      filter.eventType = eventType;
    }

    const [events, total] =
      await Promise.all([
        BehaviorEvent.find(filter)
          .sort({
            createdAt: -1,
          })
          .skip(skip)
          .limit(limit)
          .lean(),

        BehaviorEvent.countDocuments(
          filter
        ),
      ]);

    return sendSuccess(res, {
      events,

      pagination: paginationMeta(
        total,
        page,
        limit
      ),
    });
  }
);

// GET /api/behavior/summary
const getBehaviorSummary = asyncHandler(
  async (req, res) => {
    const candidate = req.user._id;

    const grouped =
      await BehaviorEvent.aggregate([
        {
          $match: {
            candidate,
          },
        },

        {
          $group: {
            _id: "$eventType",

            count: {
              $sum: 1,
            },

            points: {
              $sum: "$weight",
            },
          },
        },

        {
          $sort: {
            count: -1,
          },
        },
      ]);

    const totalEvents = grouped.reduce(
      (total, item) =>
        total + item.count,
      0
    );

    const totalPoints = grouped.reduce(
      (total, item) =>
        total + item.points,
      0
    );

    return sendSuccess(res, {
      totalEvents,

      totalPoints,

      eventTypes: grouped.map(
        (item) => ({
          eventType: item._id,
          count: item.count,
          points: item.points,
        })
      ),
    });
  }
);

// DELETE /api/behavior/events
const clearEvents = asyncHandler(
  async (req, res) => {
    const result =
      await BehaviorEvent.deleteMany({
        candidate: req.user._id,
      });

    return sendSuccess(
      res,
      {
        deletedEvents:
          result.deletedCount,
      },
      "Behavior history cleared successfully"
    );
  }
);

module.exports = {
  createEvent,
  getEvents,
  getBehaviorSummary,
  clearEvents,
};
const SavedJob = require("../models/SavedJob");
const Job = require("../models/Job");

const {
  ApiError,
  asyncHandler,
  sendSuccess,
  validateId,
  requireObject,
  getPagination,
  paginationMeta,
} = require("../utils/api");

const {
  recordBehaviorSafely,
} = require("../services/behaviorService");

// GET /api/saved-jobs
const getSavedJobs = asyncHandler(
  async (req, res) => {
    const {
      page,
      limit,
      skip,
    } = getPagination(req.query);

    const filter = {
      candidate: req.user._id,
    };

    const [savedJobs, total] =
      await Promise.all([
        SavedJob.find(filter)
          .populate({
            path: "job",

            populate: {
              path: "company",

              select:
                "name slug logo brandColor industry",
            },
          })
          .sort({
            createdAt: -1,
          })
          .skip(skip)
          .limit(limit)
          .lean(),

        SavedJob.countDocuments(filter),
      ]);

    return sendSuccess(res, {
      savedJobs,

      pagination: paginationMeta(
        total,
        page,
        limit
      ),
    });
  }
);

// GET /api/saved-jobs/ids
const getSavedJobIds = asyncHandler(
  async (req, res) => {
    const ids = await SavedJob.distinct(
      "job",

      {
        candidate: req.user._id,
      }
    );

    return sendSuccess(res, ids);
  }
);

// POST /api/saved-jobs
const saveJob = asyncHandler(
  async (req, res) => {
    const body = requireObject(req.body);

    const jobId = body.jobId;

    validateId(jobId, "job ID");

    const job = await Job.findOne({
      _id: jobId,
      status: "Active",

      deadline: {
        $gte: new Date(),
      },
    });

    if (!job) {
      throw new ApiError(
        404,
        "Job not found or unavailable"
      );
    }

    const filter = {
      candidate: req.user._id,
      job: job._id,
    };

    const existing = await SavedJob.findOne(
      filter
    );

    if (existing) {
      return sendSuccess(
        res,
        existing,
        "Job is already saved"
      );
    }

    let savedJob;

    try {
      savedJob = await SavedJob.create(
        filter
      );
    } catch (error) {
      if (error.code === 11000) {
        const duplicate =
          await SavedJob.findOne(filter);

        return sendSuccess(
          res,
          duplicate,
          "Job is already saved"
        );
      }

      throw error;
    }

    await recordBehaviorSafely({
      candidate: req.user._id,
      eventType: "SAVE_JOB",
      job,
    });

    return sendSuccess(
      res,
      savedJob,
      "Job saved successfully",
      201
    );
  }
);

// DELETE /api/saved-jobs/:jobId
const removeSavedJob = asyncHandler(
  async (req, res) => {
    const { jobId } = req.params;

    validateId(jobId, "job ID");

    const removed =
      await SavedJob.findOneAndDelete({
        candidate: req.user._id,
        job: jobId,
      });

    if (!removed) {
      throw new ApiError(
        404,
        "Saved job not found"
      );
    }

    const job = await Job.findById(
      jobId
    );

    if (job) {
      await recordBehaviorSafely({
        candidate: req.user._id,
        eventType: "UNSAVE_JOB",
        job,
      });
    }

    return sendSuccess(
      res,
      null,
      "Job removed from saved jobs"
    );
  }
);

module.exports = {
  getSavedJobs,
  getSavedJobIds,
  saveJob,
  removeSavedJob,
};
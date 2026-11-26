const Application = require(
  "../models/Application"
);

const Job = require("../models/Job");

const {
  ApiError,
  asyncHandler,
  sendSuccess,
  readString,
  readNumber,
  validateId,
  requireObject,
  getPagination,
  paginationMeta,
} = require("../utils/api");

const {
  storePdf,
  removeStoredPdf,
  checkStoredPdf,
  sendPrivatePdf,
} = require("../middleware/upload");

const {
  recordBehaviorSafely,
} = require("../services/behaviorService");

const applicationPopulation = {
  path: "job",

  populate: {
    path: "company",

    select:
      "name slug logo brandColor industry headquarters",
  },
};

// POST /api/applications
const submitApplication = asyncHandler(
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
        "Job not found or applications are closed"
      );
    }

    const existing =
      await Application.findOne({
        candidate: req.user._id,
        job: job._id,
      });

    if (existing) {
      throw new ApiError(
        409,
        "You have already applied for this job"
      );
    }

    // Require a profile resume
    if (!req.user.resume?.filename) {
      throw new ApiError(
        400,
        "Upload a resume to your profile before applying"
      );
    }

    await checkStoredPdf(
      req.user.resume.filename
    );

    const fullName = readString(
      body.fullName ?? req.user.name,
      "Full name",
      100
    );

    const email = readString(
      body.email ?? req.user.email,
      "Email",
      254
    ).toLowerCase();

    if (
      !fullName ||
      !/^\S+@\S+\.\S+$/.test(email)
    ) {
      throw new ApiError(
        400,
        "Full name and valid email are required"
      );
    }

    const applicationData = {
      candidate: req.user._id,

      job: job._id,

      fullName,
      email,

      phone: readString(
        body.phone ?? req.user.phone,
        "Phone",
        30
      ),

      coverLetter: readString(
        body.coverLetter,
        "Cover letter",
        5000
      ),

      experienceYears:
        readNumber(
          body.experienceYears,
          "Experience"
        ) ?? 0,

      expectedSalary:
        readNumber(
          body.expectedSalary,
          "Expected salary"
        ) ?? 0,

      noticePeriod: readString(
        body.noticePeriod,
        "Notice period",
        100
      ),

      // Snapshot resume details at submission
      resume: {
        filename: req.user.resume.filename,

        originalName:
          req.user.resume.originalName,

        mimetype:
          req.user.resume.mimetype,

        size: req.user.resume.size,
      },

      status: "Submitted",

      statusHistory: [
        {
          status: "Submitted",

          note:
            "Application submitted successfully",

          changedAt: new Date(),
        },
      ],
    };

    const documents = [];

    let application;

    try {
      // Optional supporting documents
      for (
        const file
        of req.files || []
      ) {
        const document = await storePdf(
          file
        );

        documents.push(document);
      }

      application =
        await Application.create({
          ...applicationData,
          documents,
        });
    } catch (error) {
      // Remove new files if submission fails
      await Promise.all(
        documents.map(
          (document) =>
            removeStoredPdf(
              document.filename
            )
        )
      );

      if (error.code === 11000) {
        throw new ApiError(
          409,
          "You have already applied for this job"
        );
      }

      throw error;
    }

    await recordBehaviorSafely({
      candidate: req.user._id,

      eventType:
        "APPLICATION_SUBMITTED",

      job,
    });

    await application.populate(
      applicationPopulation
    );

    return sendSuccess(
      res,
      application,
      "Application submitted successfully",
      201
    );
  }
);

// GET /api/applications
const getApplications = asyncHandler(
  async (req, res) => {
    const {
      page,
      limit,
      skip,
    } = getPagination(req.query);

    const filter = {
      candidate: req.user._id,
    };

    const status = readString(
      req.query.status,
      "Status",
      50
    );

    if (status) {
      filter.status = status;
    }

    const [
      applications,
      total,
    ] = await Promise.all([
      Application.find(filter)
        .populate(applicationPopulation)
        .sort({
          createdAt: -1,
        })
        .skip(skip)
        .limit(limit)
        .lean(),

      Application.countDocuments(filter),
    ]);

    return sendSuccess(res, {
      applications,

      pagination: paginationMeta(
        total,
        page,
        limit
      ),
    });
  }
);

// GET /api/applications/job/:jobId
const getApplicationByJob = asyncHandler(
  async (req, res) => {
    validateId(
      req.params.jobId,
      "job ID"
    );

    const application =
      await Application.findOne({
        candidate: req.user._id,

        job: req.params.jobId,
      }).populate(applicationPopulation);

    return sendSuccess(res, {
      applied: Boolean(application),
      application: application || null,
    });
  }
);

// Find an application owned by the current user
const findOwnedApplication = async (
  req
) => {
  validateId(
    req.params.id,
    "application ID"
  );

  const application =
    await Application.findOne({
      _id: req.params.id,
      candidate: req.user._id,
    });

  if (!application) {
    throw new ApiError(
      404,
      "Application not found"
    );
  }

  return application;
};

// GET /api/applications/:id
const getApplicationDetails = asyncHandler(
  async (req, res) => {
    const application =
      await findOwnedApplication(req);

    await application.populate(
      applicationPopulation
    );

    return sendSuccess(
      res,
      application
    );
  }
);

// GET /api/applications/:id/resume
const getApplicationResume = asyncHandler(
  async (req, res, next) => {
    const application =
      await findOwnedApplication(req);

    return sendPrivatePdf(
      res,
      application.resume,
      next
    );
  }
);

// GET /api/applications/:id/documents/:index
const getApplicationDocument = asyncHandler(
  async (req, res, next) => {
    const application =
      await findOwnedApplication(req);

    const index = Number(
      req.params.index
    );

    if (
      !Number.isInteger(index) ||
      index < 0 ||
      index >= application.documents.length
    ) {
      throw new ApiError(
        404,
        "Document not found"
      );
    }

    return sendPrivatePdf(
      res,
      application.documents[index],
      next
    );
  }
);

// PATCH /api/applications/:id/withdraw
const withdrawApplication = asyncHandler(
  async (req, res) => {
    const application =
      await findOwnedApplication(req);

    const allowedStatuses = [
      "Submitted",
      "Under Review",
      "Shortlisted",
      "Interview",
    ];

    if (
      !allowedStatuses.includes(
        application.status
      )
    ) {
      throw new ApiError(
        409,
        "This application cannot be withdrawn"
      );
    }

    const updated =
      await Application.findOneAndUpdate(
        {
          _id: application._id,

          candidate: req.user._id,

          status: application.status,
        },

        {
          $set: {
            status: "Withdrawn",
          },

          $push: {
            statusHistory: {
              status: "Withdrawn",

              note:
                "Withdrawn by the candidate",

              changedAt: new Date(),
            },
          },
        },

        {
          new: true,
          runValidators: true,
        }
      );

    if (!updated) {
      throw new ApiError(
        409,
        "Application status has changed. Refresh and try again."
      );
    }

    return sendSuccess(
      res,
      updated,
      "Application withdrawn successfully"
    );
  }
);

// PATCH /api/applications/:id/status
// Administrators only
const updateApplicationStatus = asyncHandler(
  async (req, res) => {
    validateId(
      req.params.id,
      "application ID"
    );

    const body = requireObject(req.body);

    const status = readString(
      body.status,
      "Status",
      50
    );

    const note = readString(
      body.note,
      "Note",
      1000
    );

    const application =
      await Application.findById(
        req.params.id
      );

    if (!application) {
      throw new ApiError(
        404,
        "Application not found"
      );
    }

    const allowedTransitions = {
      Submitted: [
        "Under Review",
        "Rejected",
      ],

      "Under Review": [
        "Shortlisted",
        "Rejected",
      ],

      Shortlisted: [
        "Interview",
        "Rejected",
      ],

      Interview: [
        "Accepted",
        "Rejected",
      ],

      Accepted: [],
      Rejected: [],
      Withdrawn: [],
    };

    const allowed =
      allowedTransitions[
        application.status
      ] || [];

    if (!allowed.includes(status)) {
      throw new ApiError(
        409,
        "Invalid application status transition"
      );
    }

    const updated =
      await Application.findOneAndUpdate(
        {
          _id: application._id,
          status: application.status,
        },

        {
          $set: {
            status,
          },

          $push: {
            statusHistory: {
              status,

              note:
                note ||
                `Demo application moved to ${status}`,

              changedAt: new Date(),
            },
          },
        },

        {
          new: true,
          runValidators: true,
        }
      );

    if (!updated) {
      throw new ApiError(
        409,
        "Application status changed. Refresh and try again."
      );
    }

    return sendSuccess(
      res,
      updated,
      "Application status updated"
    );
  }
);

module.exports = {
  submitApplication,
  getApplications,
  getApplicationByJob,
  getApplicationDetails,
  getApplicationResume,
  getApplicationDocument,
  withdrawApplication,
  updateApplicationStatus,
};
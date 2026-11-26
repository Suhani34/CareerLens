const mongoose = require("mongoose");

const statusHistorySchema = new mongoose.Schema(
  {
    status: {
      type: String,
      required: true,
      enum: [
        "Submitted",
        "Under Review",
        "Shortlisted",
        "Interview",
        "Accepted",
        "Rejected",
        "Withdrawn",
      ],
    },

    note: {
      type: String,
      default: "",
    },

    changedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const applicationSchema = new mongoose.Schema(
  {
    candidate: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: true,
    },

    fullName: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },

    phone: {
      type: String,
      default: "",
    },

    coverLetter: {
      type: String,
      default: "",
      maxlength: 5000,
    },

    experienceYears: {
      type: Number,
      default: 0,
      min: 0,
    },

    expectedSalary: {
      type: Number,
      default: 0,
      min: 0,
    },

    noticePeriod: {
      type: String,
      default: "",
    },

    resume: {
      filename: {
        type: String,
        required: true,
      },
      originalName: String,
      mimetype: String,
      size: Number,
    },

    documents: [
      {
        filename: String,
        originalName: String,
        mimetype: String,
        size: Number,
      },
    ],

    status: {
      type: String,
      enum: [
        "Submitted",
        "Under Review",
        "Shortlisted",
        "Interview",
        "Accepted",
        "Rejected",
        "Withdrawn",
      ],
      default: "Submitted",
    },

    statusHistory: {
      type: [statusHistorySchema],
      default: () => [
        {
          status: "Submitted",
          note: "Application submitted successfully",
          changedAt: new Date(),
        },
      ],
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate applications
applicationSchema.index(
  {
    candidate: 1,
    job: 1,
  },
  {
    unique: true,
  }
);

applicationSchema.index({
  candidate: 1,
  createdAt: -1,
});

module.exports = mongoose.model(
  "Application",
  applicationSchema
);
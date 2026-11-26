const mongoose = require("mongoose");

const behaviorEventSchema = new mongoose.Schema(
  {
    candidate: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    sessionId: {
      type: String,
      required: true,
      index: true,
    },

    eventType: {
      type: String,
      required: true,
      enum: [
        "JOB_SEARCH",
        "CATEGORY_VIEW",
        "SKILL_VIEW",
        "JOB_VIEW",
        "COMPANY_VIEW",
        "SAVE_JOB",
        "UNSAVE_JOB",
        "APPLY_INTENT",
        "APPLICATION_SUBMITTED",
      ],
    },

    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      default: null,
    },

    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      default: null,
    },

    metadata: {
      searchQuery: {
        type: String,
        default: "",
      },

      title: {
        type: String,
        default: "",
      },

      category: {
        type: String,
        default: "",
      },

      skills: {
        type: [String],
        default: [],
      },

      location: {
        type: String,
        default: "",
      },

      workMode: {
        type: String,
        default: "",
      },

      industry: {
        type: String,
        default: "",
      },

      jobType: {
        type: String,
        default: "",
      },

      salaryMin: {
        type: Number,
        default: 0,
      },

      salaryMax: {
        type: Number,
        default: 0,
      },
    },

    weight: {
      type: Number,
      default: 0,
      min: 0,
      max: 10,
    },
  },
  {
    timestamps: true,
  }
);

behaviorEventSchema.index({
  candidate: 1,
  createdAt: -1,
});

behaviorEventSchema.index({
  sessionId: 1,
  createdAt: -1,
});

behaviorEventSchema.index({
  eventType: 1,
});

module.exports = mongoose.model(
  "BehaviorEvent",
  behaviorEventSchema
);
const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },

    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },

    category: {
      type: String,
      required: true,
    },

    industry: {
      type: String,
      required: true,
    },

    location: {
      type: String,
      required: true,
    },

    workMode: {
      type: String,
      enum: ["Remote", "Hybrid", "On-site"],
      required: true,
    },

    jobType: {
      type: String,
      enum: [
        "Full-time",
        "Part-time",
        "Internship",
        "Contract",
      ],
      required: true,
    },

    experience: {
      min: {
        type: Number,
        required: true,
        min: 0,
      },

      max: {
        type: Number,
        required: true,
        min: 0,
        validate: {
          validator: function (value) {
            return value >= this.experience.min;
          },
          message:
            "Maximum experience must be >= minimum experience",
        },
      },

      level: {
        type: String,
        enum: [
          "Fresher",
          "Entry Level",
          "Mid Level",
          "Senior Level",
        ],
        required: true,
      },
    },

    salary: {
      min: {
        type: Number,
        required: true,
        min: 0,
      },

      max: {
        type: Number,
        required: true,
        min: 0,
        validate: {
          validator: function (value) {
            return value >= this.salary.min;
          },
          message:
            "Maximum salary must be >= minimum salary",
        },
      },

      currency: {
        type: String,
        default: "INR",
      },

      period: {
        type: String,
        enum: ["year", "month"],
        default: "year",
      },
    },

    skills: {
      type: [String],
      required: true,
      validate: {
        validator: (skills) => skills.length > 0,
        message: "At least one skill is required",
      },
    },

    description: {
      type: String,
      required: true,
    },

    responsibilities: {
      type: [String],
      default: [],
    },

    requirements: {
      type: [String],
      default: [],
    },

    benefits: {
      type: [String],
      default: [],
    },

    openings: {
      type: Number,
      default: 1,
      min: 1,
    },

    featured: {
      type: Boolean,
      default: false,
    },

    trending: {
      type: Boolean,
      default: false,
    },

    views: {
      type: Number,
      default: 0,
      min: 0,
    },

    postedAt: {
      type: Date,
      default: Date.now,
    },

    deadline: {
      type: Date,
      required: true,
    },

    status: {
      type: String,
      enum: ["Active", "Closed", "Draft"],
      default: "Active",
    },

    isDemo: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Search indexes
jobSchema.index({
  title: "text",
  description: "text",
  skills: "text",
  category: "text",
});

// Filtering indexes
jobSchema.index({ category: 1 });
jobSchema.index({ company: 1 });
jobSchema.index({ location: 1 });
jobSchema.index({ workMode: 1 });
jobSchema.index({ jobType: 1 });
jobSchema.index({ "salary.min": 1 });
jobSchema.index({ status: 1, postedAt: -1 });

module.exports = mongoose.model("Job", jobSchema);
const mongoose = require("mongoose");

const companySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },

    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    logo: {
      type: String,
      default: "",
    },

    brandColor: {
      type: String,
      default: "#6254D9",
    },

    tagline: {
      type: String,
      default: "",
    },

    description: {
      type: String,
      required: true,
    },

    industry: {
      type: String,
      required: true,
    },

    headquarters: {
      type: String,
      required: true,
    },

    locations: {
      type: [String],
      default: [],
    },

    companySize: {
      type: String,
      required: true,
    },

    founded: {
      type: Number,
      required: true,
    },

    website: {
      type: String,
      default: "",
    },

    culture: {
      type: String,
      default: "",
    },

    benefits: {
      type: [String],
      default: [],
    },

    recruiter: {
      name: String,
      designation: String,
      email: String,
      avatar: String,
    },

    featured: {
      type: Boolean,
      default: false,
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

companySchema.index({ industry: 1 });
companySchema.index({ featured: 1 });

module.exports = mongoose.model(
  "Company",
  companySchema
);
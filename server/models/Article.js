const mongoose = require("mongoose");

const articleSchema = new mongoose.Schema(
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

    excerpt: {
      type: String,
      required: true,
      maxlength: 500,
    },

    content: [
      {
        heading: {
          type: String,
          required: true,
        },

        body: {
          type: String,
          required: true,
        },
      },
    ],

    category: {
      type: String,
      required: true,
    },

    author: {
      type: String,
      default: "CareerLens Editorial",
    },

    coverImage: {
      type: String,
      default: "",
    },

    accentColor: {
      type: String,
      default: "#6254D9",
    },

    readTime: {
      type: Number,
      default: 5,
      min: 1,
    },

    tags: {
      type: [String],
      default: [],
    },

    featured: {
      type: Boolean,
      default: false,
    },

    publishedAt: {
      type: Date,
      default: Date.now,
    },

    status: {
      type: String,
      enum: ["Published", "Draft"],
      default: "Published",
    },
  },
  {
    timestamps: true,
  }
);

articleSchema.index({
  category: 1,
  publishedAt: -1,
});

module.exports = mongoose.model(
  "Article",
  articleSchema
);
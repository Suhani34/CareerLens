require("dotenv").config();

const mongoose = require("mongoose");

const connectDB = require("../config/db");

const User = require("../models/User");
const Company = require("../models/Company");
const Job = require("../models/Job");
const Application = require("../models/Application");
const SavedJob = require("../models/SavedJob");
const BehaviorEvent = require("../models/BehaviorEvent");
const Article = require("../models/Article");

const {
  companies,
  jobs,
  articles,
} = require("./seedData");

const models = [
  User,
  Company,
  Job,
  Application,
  SavedJob,
  BehaviorEvent,
  Article,
];

const seedDatabase = async () => {
  try {
    await connectDB();

    console.log("\n==============================");
    console.log("CAREERLENS DATABASE SEEDING");
    console.log("==============================\n");

    // Create collections and indexes
    await Promise.all(
      models.map((model) => model.init())
    );

    console.log("Database models initialized.");

    // STEP 1: Insert or update companies
    console.log("\nSeeding companies...");

    const companyMap = new Map();

    for (const companyData of companies) {
      // Validate the document before saving
      await new Company(companyData).validate();

      const company =
        await Company.findOneAndUpdate(
          {
            slug: companyData.slug,
          },
          {
            $set: companyData,
          },
          {
            upsert: true,
            new: true,
            runValidators: true,
          }
        );

      companyMap.set(
        company.slug,
        company._id
      );
    }

    console.log(
      `${companies.length} companies seeded successfully.`
    );

    // STEP 2: Insert or update jobs
    console.log("\nSeeding jobs...");

    for (const jobData of jobs) {
      const {
        companySlug,
        views,
        ...jobFields
      } = jobData;

      const companyId =
        companyMap.get(companySlug);

      if (!companyId) {
        throw new Error(
          `Company not found: ${companySlug}`
        );
      }

      const document = {
        ...jobFields,
        company: companyId,
      };

      // Validate the full job document
      await new Job(document).validate();

      await Job.findOneAndUpdate(
        {
          slug: document.slug,
        },
        {
          $set: document,

          // Set views only when inserting a new job
          $setOnInsert: {
            views,
          },
        },
        {
          upsert: true,
          new: true,
        }
      );
    }

    console.log(
      `${jobs.length} jobs seeded successfully.`
    );

    // STEP 3: Insert or update career articles
    console.log("\nSeeding articles...");

    for (const articleData of articles) {
      await new Article(articleData).validate();

      await Article.findOneAndUpdate(
        {
          slug: articleData.slug,
        },
        {
          $set: articleData,
        },
        {
          upsert: true,
          new: true,
          runValidators: true,
        }
      );
    }

    console.log(
      `${articles.length} articles seeded successfully.`
    );

    // STEP 4: Display database summary

    const [
      userCount,
      companyCount,
      jobCount,
      applicationCount,
      savedJobCount,
      behaviorCount,
      articleCount,
    ] = await Promise.all([
      User.countDocuments(),
      Company.countDocuments(),
      Job.countDocuments(),
      Application.countDocuments(),
      SavedJob.countDocuments(),
      BehaviorEvent.countDocuments(),
      Article.countDocuments(),
    ]);

    console.log("\nDATABASE SUMMARY");

    console.table([
      {
        collection: "users",
        documents: userCount,
      },
      {
        collection: "companies",
        documents: companyCount,
      },
      {
        collection: "jobs",
        documents: jobCount,
      },
      {
        collection: "applications",
        documents: applicationCount,
      },
      {
        collection: "savedjobs",
        documents: savedJobCount,
      },
      {
        collection: "behaviorevents",
        documents: behaviorCount,
      },
      {
        collection: "articles",
        documents: articleCount,
      },
    ]);

    console.log(
      "\nDatabase seeding completed successfully!"
    );
  } catch (error) {
    console.error(
      "\nDatabase seeding failed:",
      error
    );

    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();

    console.log(
      "MongoDB connection closed."
    );
  }
};

seedDatabase();
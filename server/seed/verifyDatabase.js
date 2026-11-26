require("dotenv").config();

const assert = require("node:assert/strict");
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

const verifyDatabase = async () => {
  try {
    await connectDB();

    console.log("\n==============================");
    console.log("CAREERLENS DATABASE VERIFICATION");
    console.log("==============================\n");

    // TEST 1: Verify seed records

    const companySlugs =
      companies.map((company) => company.slug);

    const jobSlugs =
      jobs.map((job) => job.slug);

    const articleSlugs =
      articles.map((article) => article.slug);

    const companyCount =
      await Company.countDocuments({
        slug: {
          $in: companySlugs,
        },
      });

    const jobCount =
      await Job.countDocuments({
        slug: {
          $in: jobSlugs,
        },
      });

    const articleCount =
      await Article.countDocuments({
        slug: {
          $in: articleSlugs,
        },
      });

    assert.equal(
      companyCount,
      companies.length,
      "Company count mismatch"
    );

    assert.equal(
      jobCount,
      jobs.length,
      "Job count mismatch"
    );

    assert.equal(
      articleCount,
      articles.length,
      "Article count mismatch"
    );

    console.log(
      "[PASS] All seed records exist."
    );

    // TEST 2: Verify company relationships

    const populatedJobs = await Job.find({
      slug: {
        $in: jobSlugs,
      },
    }).populate("company");

    assert.ok(
      populatedJobs.every(
        (job) => job.company !== null
      ),
      "At least one job has a missing company"
    );

    console.log(
      "[PASS] All jobs reference valid companies."
    );

    const sampleJob = populatedJobs[0];

    console.log("\nSample populated job:");

    console.table([
      {
        title: sampleJob.title,
        company: sampleJob.company.name,
        location: sampleJob.location,
        workMode: sampleJob.workMode,
      },
    ]);

    // TEST 3: Category filter

    const cybersecurityJobs =
      await Job.find({
        slug: {
          $in: jobSlugs,
        },
        category: "Cybersecurity",
      });

    assert.equal(
      cybersecurityJobs.length,
      6
    );

    console.log(
      "[PASS] Category filtering works."
    );

    // TEST 4: Remote filter

    const remoteJobs =
      await Job.countDocuments({
        slug: {
          $in: jobSlugs,
        },
        workMode: "Remote",
      });

    assert.equal(remoteJobs, 20);

    console.log(
      "[PASS] Work-mode filtering works."
    );

    // TEST 5: Internship filter

    const internships =
      await Job.countDocuments({
        slug: {
          $in: jobSlugs,
        },
        jobType: "Internship",
      });

    assert.equal(internships, 10);

    console.log(
      "[PASS] Job-type filtering works."
    );

    // TEST 6: Skill filter

    const reactJobs =
      await Job.countDocuments({
        slug: {
          $in: jobSlugs,
        },
        skills: "React",
      });

    assert.equal(reactJobs, 2);

    console.log(
      "[PASS] Skill filtering works."
    );

    // TEST 7: Salary filtering

    const salaryJobs =
      await Job.find({
        slug: {
          $in: jobSlugs,
        },

        "salary.min": {
          $gte: 1000000,
        },
      });

    assert.ok(
      salaryJobs.length > 0
    );

    assert.ok(
      salaryJobs.every(
        (job) =>
          job.salary.min >= 1000000
      )
    );

    console.log(
      "[PASS] Salary filtering works."
    );

    // TEST 8: Featured jobs

    const featuredJobs =
      await Job.countDocuments({
        slug: {
          $in: jobSlugs,
        },
        featured: true,
      });

    assert.equal(featuredJobs, 14);

    console.log(
      "[PASS] Featured-job filtering works."
    );

    // TEST 9: Text search

    const searchResults =
      await Job.find({
        slug: {
          $in: jobSlugs,
        },
        $text: {
          $search: "React",
        },
      });

    assert.ok(
      searchResults.length >= 2
    );

    console.log(
      "[PASS] MongoDB text search works."
    );

    // TEST 10: Required-field validation

    const invalidUser = new User({
      name: "Validation Test",
    });

    await assert.rejects(
      () => invalidUser.validate(),
      (error) =>
        error.name === "ValidationError" &&
        Boolean(error.errors.email) &&
        Boolean(error.errors.password)
    );

    console.log(
      "[PASS] User schema validation works."
    );

    // TEST 11: Salary range validation

    const invalidSalaryJob =
      new Job({
        ...sampleJob.toObject(),

        company: sampleJob.company._id,

        salary: {
          min: 1000000,
          max: 500000,
          currency: "INR",
          period: "year",
        },
      });

    await assert.rejects(
      () => invalidSalaryJob.validate(),
      (error) =>
        error.name === "ValidationError" &&
        Boolean(error.errors["salary.max"])
    );

    console.log(
      "[PASS] Invalid salary ranges are rejected."
    );

    // TEST 12: Article content

    const publishedArticles =
      await Article.find({
        slug: {
          $in: articleSlugs,
        },
        status: "Published",
      });

    assert.equal(
      publishedArticles.length,
      articles.length
    );

    assert.ok(
      publishedArticles.every(
        (article) =>
          article.content.length > 0
      )
    );

    console.log(
      "[PASS] Published career articles are valid."
    );

    // Collection counts

    const [
      users,
      totalCompanies,
      totalJobs,
      applications,
      savedJobs,
      behaviorEvents,
      totalArticles,
    ] = await Promise.all([
      User.countDocuments(),
      Company.countDocuments(),
      Job.countDocuments(),
      Application.countDocuments(),
      SavedJob.countDocuments(),
      BehaviorEvent.countDocuments(),
      Article.countDocuments(),
    ]);

    console.log("\nCollection summary:");

    console.table({
      users,
      companies: totalCompanies,
      jobs: totalJobs,
      applications,
      savedJobs,
      behaviorEvents,
      articles: totalArticles,
    });

    // Category summary

    const categories = await Job.aggregate([
      {
        $match: {
          slug: {
            $in: jobSlugs,
          },
        },
      },
      {
        $group: {
          _id: "$category",
          jobs: {
            $sum: 1,
          },
        },
      },
      {
        $sort: {
          _id: 1,
        },
      },
    ]);

    assert.equal(categories.length, 10);

    assert.ok(
      categories.every(
        (category) => category.jobs === 6
      )
    );

    console.log("\nJobs by category:");

    console.table(
      categories.map((category) => ({
        category: category._id,
        jobs: category.jobs,
      }))
    );

    console.log(
      "\nALL DATABASE TESTS PASSED!"
    );
  } catch (error) {
    console.error(
      "\nDATABASE VERIFICATION FAILED:"
    );

    console.error(error);

    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();

    console.log(
      "\nMongoDB connection closed."
    );
  }
};

verifyDatabase();
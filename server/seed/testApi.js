require("dotenv").config();

const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const mongoose = require("mongoose");

const User = require("../models/User");

const BASE = "http://127.0.0.1:5000/api";

let passed = 0;

const pass = (message) => {
  passed++;
  console.log(`[PASS] ${message}`);
};

// Reusable API request helper
const request = async (
  endpoint,
  {
    method = "GET",
    token,
    body,
    expected = 200,
    binary = false,
  } = {}
) => {
  const headers = {};
  let requestBody;

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  if (body instanceof FormData) {
    requestBody = body;
  } else if (body !== undefined) {
    headers["Content-Type"] = "application/json";
    requestBody = JSON.stringify(body);
  }

  const response = await fetch(
    `${BASE}${endpoint}`,
    {
      method,
      headers,
      body: requestBody,
      signal: AbortSignal.timeout(15000),
    }
  );

  if (response.status !== expected) {
    const details = await response.text();

    throw new Error(
      `${method} ${endpoint}: expected ${expected}, ` +
      `received ${response.status}. ${details}`
    );
  }

  if (binary) {
    return Buffer.from(
      await response.arrayBuffer()
    );
  }

  const result = await response.json();

  assert.equal(
    result.success,
    expected < 400
  );

  return result.data;
};

// Generate a small valid PDF for testing
const makeTestPdf = () => {
  const content =
    "BT /F1 18 Tf 50 750 Td (CareerLens API Test) Tj ET";

  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",

    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",

    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>",

    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",

    `<< /Length ${Buffer.byteLength(content)} >>\nstream\n${content}\nendstream`,
  ];

  let pdf = "%PDF-1.4\n";

  const offsets = [0];

  objects.forEach((object, index) => {
    offsets.push(Buffer.byteLength(pdf));

    pdf +=
      `${index + 1} 0 obj\n` +
      `${object}\nendobj\n`;
  });

  const xref = Buffer.byteLength(pdf);

  pdf += `xref\n0 ${offsets.length}\n`;
  pdf += "0000000000 65535 f \n";

  for (const offset of offsets.slice(1)) {
    pdf +=
      `${String(offset).padStart(10, "0")} 00000 n \n`;
  }

  pdf +=
    `trailer\n` +
    `<< /Size ${offsets.length} /Root 1 0 R >>\n` +
    `startxref\n${xref}\n%%EOF\n`;

  return Buffer.from(pdf);
};

const runTests = async () => {
  // Restrict testing to our local development database
  if (
    process.env.NODE_ENV !== "development" ||
    !/^mongodb:\/\/127\.0\.0\.1:27017\/careerlens(?:\?|$)/
      .test(process.env.MONGO_URI || "")
  ) {
    throw new Error(
      "Use the local CareerLens development database"
    );
  }

  const suffix = crypto
    .randomBytes(6)
    .toString("hex");

  const emailA =
    `apitest-a-${suffix}@example.com`;

  const emailB =
    `apitest-b-${suffix}@example.com`;

  const password =
    `DemoTest-${suffix}!`;

  let temporaryAdminId = null;

  console.log(
    "\n=================================="
  );

  console.log(
    "CAREERLENS API INTEGRATION TESTS"
  );

  console.log(
    "==================================\n"
  );

  try {
    // TEST 1: Health
    const healthResponse = await fetch(
      `${BASE}/health`,
      {
        signal: AbortSignal.timeout(10000),
      }
    );

    assert.equal(healthResponse.status, 200);

    const health = await healthResponse.json();

    assert.equal(health.database, "Connected");

    pass("Backend and MongoDB connectivity");

    // TEST 2: Database statistics
    const stats = await request("/stats");

    assert.ok(stats.jobs >= 60);
    assert.ok(stats.companies >= 15);
    assert.ok(stats.articles >= 8);

    pass("Database statistics");

    // TEST 3: Job pagination
    const listing = await request(
      "/jobs?page=1&limit=5"
    );

    assert.equal(listing.jobs.length, 5);
    assert.equal(listing.pagination.page, 1);

    pass("Job listing and pagination");

    // TEST 4: Category filtering
    const category = await request(
      "/jobs?category=Cybersecurity"
    );

    assert.equal(category.pagination.total, 6);

    pass("Category filtering");

    // TEST 5: Work-mode filtering
    const remote = await request(
      "/jobs?workMode=Remote&limit=100"
    );

    assert.equal(remote.pagination.total, 20);

    assert.ok(
      remote.jobs.every(
        (job) => job.workMode === "Remote"
      )
    );

    pass("Work-mode filtering");

    // TEST 6: Keyword searching
    const search = await request(
      "/jobs?search=React"
    );

    assert.ok(search.pagination.total >= 2);

    pass("Keyword search");

    // TEST 7: Skill filtering
    const skills = await request(
      "/jobs?skills=React,JavaScript"
    );

    assert.ok(skills.jobs.length > 0);

    assert.ok(
      skills.jobs.every(
        (job) =>
          job.skills.includes("React") &&
          job.skills.includes("JavaScript")
      )
    );

    pass("Multiple skill filtering");

    // TEST 8: Salary filtering
    const salary = await request(
      "/jobs?salaryMin=600000&salaryMax=1200000"
    );

    assert.ok(salary.jobs.length > 0);

    assert.ok(
      salary.jobs.every(
        (job) =>
          job.salary.max >= 600000 &&
          job.salary.min <= 1200000
      )
    );

    pass("Salary range filtering");

    // TEST 9: Sorting
    const sorted = await request(
      "/jobs?sort=salary_high&limit=10"
    );

    for (let i = 1; i < sorted.jobs.length; i++) {
      assert.ok(
        sorted.jobs[i - 1].salary.max >=
        sorted.jobs[i].salary.max
      );
    }

    pass("Salary sorting");

    // TEST 10: Dynamic filters
    const filters = await request(
      "/jobs/filters"
    );

    assert.equal(filters.categories.length, 10);

    pass("Dynamic filter options");

    // TEST 11: Job details
    const job = await request(
      "/jobs/frontend-developer-vertex-technologies"
    );

    assert.equal(job.title, "Frontend Developer");
    assert.ok(job.company.name);

    const jobId = job._id;

    pass("Job details and company relationship");

    // TEST 12: Similar jobs
    const similar = await request(
      `/jobs/${jobId}/similar`
    );

    assert.ok(similar.length > 0);

    assert.ok(
      similar.every(
        (item) => item._id !== jobId
      )
    );

    pass("Similar job recommendations");

    // TEST 13: Companies
    const companies = await request(
      "/companies"
    );

    assert.ok(companies.pagination.total >= 15);

    const company = await request(
      "/companies/vertex-technologies"
    );

    assert.ok(company.openJobs > 0);

    pass("Company listing and profiles");

    // TEST 14: Articles
    const articles = await request(
      "/articles"
    );

    assert.ok(articles.pagination.total >= 8);

    const article = await request(
      `/articles/${articles.articles[0].slug}`
    );

    assert.ok(article.article.content.length > 0);

    const categories = await request(
      "/articles/categories"
    );

    assert.ok(categories.length > 0);

    pass("Career articles and categories");

    // TEST 15: Invalid requests
    await request("/jobs?page=0", {
      expected: 400,
    });

    await request("/jobs/not-a-real-job", {
      expected: 404,
    });

    pass("Invalid requests and error handling");

    // TEST 16: Candidate registration
    const candidateA = await request(
      "/auth/register",
      {
        method: "POST",
        body: {
          name: "API Test Candidate A",
          email: emailA,
          password,
          role: "admin",
        },
        expected: 201,
      }
    );

    assert.equal(candidateA.user.role, "candidate");

    assert.ok(
      !Object.hasOwn(candidateA.user, "password")
    );

    const candidateB = await request(
      "/auth/register",
      {
        method: "POST",
        body: {
          name: "API Test Candidate B",
          email: emailB,
          password,
        },
        expected: 201,
      }
    );

    const tokenB = candidateB.token;

    pass("Registration and role protection");

    // TEST 17: Duplicate registration
    await request("/auth/register", {
      method: "POST",
      body: {
        name: "Duplicate Candidate",
        email: emailA,
        password,
      },
      expected: 409,
    });

    pass("Duplicate email protection");

    // TEST 18: Login
    const login = await request(
      "/auth/login",
      {
        method: "POST",
        body: {
          email: emailA,
          password,
        },
      }
    );

    const tokenA = login.token;

    assert.ok(tokenA);

    const me = await request("/auth/me", {
      token: tokenA,
    });

    assert.equal(me.email, emailA);

    pass("Login and JWT authentication");

    // TEST 19: Unauthorized access
    await request("/profile", {
      expected: 401,
    });

    await request("/profile", {
      token: "invalid-token",
      expected: 401,
    });

    await request("/auth/login", {
      method: "POST",
      body: {
        email: emailA,
        password: "IncorrectPassword",
      },
      expected: 401,
    });

    pass("Invalid credentials and unauthorized access");

    // TEST 20: Profile management
    const profile = await request(
      "/profile",
      {
        method: "PUT",
        token: tokenA,
        body: {
          headline: "Aspiring MERN Developer",
          location: "Jaipur",
          skills: ["React", "JavaScript", "Node.js"],
          preferences: {
            workModes: ["Remote"],
            expectedSalary: 600000,
          },
          role: "admin",
        },
      }
    );

    assert.ok(profile.skills.includes("React"));
    assert.equal(profile.role, "candidate");

    const savedProfile = await request(
      "/profile",
      {
        token: tokenA,
      }
    );

    assert.ok(savedProfile.skills.includes("React"));

    pass("Profile update and persistence");

    // TEST 21: Application requires resume
    await request("/applications", {
      method: "POST",
      token: tokenA,
      body: { jobId },
      expected: 400,
    });

    pass("Resume requirement for applications");

    // TEST 22: Invalid PDF rejection
    const invalidForm = new FormData();

    invalidForm.append(
      "resume",
      new Blob(
        ["This is not a PDF"],
        { type: "application/pdf" }
      ),
      "invalid.pdf"
    );

    await request("/profile/resume", {
      method: "POST",
      token: tokenA,
      body: invalidForm,
      expected: 400,
    });

    pass("Invalid document rejection");

    // TEST 23: Resume upload and retrieval
    const pdf = makeTestPdf();

    const form = new FormData();

    form.append(
      "resume",
      new Blob(
        [pdf],
        { type: "application/pdf" }
      ),
      "test-resume.pdf"
    );

    const resume = await request(
      "/profile/resume",
      {
        method: "POST",
        token: tokenA,
        body: form,
        expected: 201,
      }
    );

    assert.equal(
      resume.originalName,
      "test-resume.pdf"
    );

    const downloaded = await request(
      "/profile/resume",
      {
        token: tokenA,
        binary: true,
      }
    );

    assert.deepEqual(downloaded, pdf);

    pass("Resume upload and file integrity");

    // TEST 24: Resume privacy
    await request("/profile/resume", {
      token: tokenB,
      expected: 404,
    });

    pass("Resume ownership isolation");

    // TEST 25: Saved jobs
    await request("/saved-jobs", {
      method: "POST",
      token: tokenA,
      body: { jobId },
      expected: 201,
    });

    await request("/saved-jobs", {
      method: "POST",
      token: tokenA,
      body: { jobId },
    });

    const saved = await request(
      "/saved-jobs",
      {
        token: tokenA,
      }
    );

    assert.equal(saved.pagination.total, 1);

    const ids = await request(
      "/saved-jobs/ids",
      {
        token: tokenA,
      }
    );

    assert.ok(ids.includes(jobId));

    pass("Saved jobs and duplicate protection");

    // TEST 26: Saved-job privacy
    const otherSaved = await request(
      "/saved-jobs",
      {
        token: tokenB,
      }
    );

    assert.equal(
      otherSaved.pagination.total,
      0
    );

    pass("Saved-job ownership isolation");

    // TEST 27: Behavior events
    const behaviorEvents = [
      {
        eventType: "JOB_SEARCH",
        metadata: {
          searchQuery: "React",
        },
      },
      {
        eventType: "CATEGORY_VIEW",
        metadata: {
          category: "Software Development",
        },
      },
      {
        eventType: "SKILL_VIEW",
        metadata: {
          skills: ["React"],
        },
      },
      {
        eventType: "JOB_VIEW",
        jobId,
        weight: 999,
      },
      {
        eventType: "COMPANY_VIEW",
        companyId: job.company._id,
      },
      {
        eventType: "APPLY_INTENT",
        jobId,
      },
    ];

    for (const event of behaviorEvents) {
      const recorded = await request(
        "/behavior/events",
        {
          method: "POST",
          token: tokenA,
          body: event,
          expected: 201,
        }
      );

      if (event.eventType === "JOB_VIEW") {
        assert.equal(recorded.weight, 4);
      }
    }

    pass("Behavior event tracking and trusted weights");

    // TEST 28: Prevent fabricated application events
    await request("/behavior/events", {
      method: "POST",
      token: tokenA,
      body: {
        eventType: "APPLICATION_SUBMITTED",
        jobId,
      },
      expected: 400,
    });

    pass("Fake application events rejected");

    // TEST 29: Application submission
    const applicationForm = new FormData();

    applicationForm.append("jobId", jobId);

    applicationForm.append(
      "coverLetter",
      "Automated test application"
    );

    applicationForm.append(
      "documents",
      new Blob(
        [pdf],
        { type: "application/pdf" }
      ),
      "certificate.pdf"
    );

    const application = await request(
      "/applications",
      {
        method: "POST",
        token: tokenA,
        body: applicationForm,
        expected: 201,
      }
    );

    assert.equal(application.status, "Submitted");
    assert.equal(application.documents.length, 1);

    const applicationId = application._id;

    pass("Application submission and supporting documents");

    // TEST 30: Application retrieval
    const applications = await request(
      "/applications",
      {
        token: tokenA,
      }
    );

    assert.equal(
      applications.pagination.total,
      1
    );

    const details = await request(
      `/applications/${applicationId}`,
      {
        token: tokenA,
      }
    );

    assert.equal(details._id, applicationId);

    const applied = await request(
      `/applications/job/${jobId}`,
      {
        token: tokenA,
      }
    );

    assert.equal(applied.applied, true);

    pass("Application retrieval and applied status");

    // TEST 31: Duplicate applications
    await request("/applications", {
      method: "POST",
      token: tokenA,
      body: { jobId },
      expected: 409,
    });

    pass("Duplicate application protection");

    // TEST 32: Application privacy
    await request(
      `/applications/${applicationId}`,
      {
        token: tokenB,
        expected: 404,
      }
    );

    await request(
      `/applications/${applicationId}/resume`,
      {
        token: tokenB,
        expected: 404,
      }
    );

    await request(
      `/applications/${applicationId}/documents/0`,
      {
        token: tokenB,
        expected: 404,
      }
    );

    pass("Application and document ownership isolation");

    // TEST 33: Supporting document integrity
    const certificate = await request(
      `/applications/${applicationId}/documents/0`,
      {
        token: tokenA,
        binary: true,
      }
    );

    assert.deepEqual(certificate, pdf);

    pass("Supporting document retrieval");

    // TEST 34: Administrator authorization
    await request(
      `/applications/${applicationId}/status`,
      {
        method: "PATCH",
        token: tokenA,
        body: {
          status: "Accepted",
        },
        expected: 403,
      }
    );

    pass("Administrator-only status protection");

    // TEST 35: Administrator status workflow
    await mongoose.connect(process.env.MONGO_URI);

    temporaryAdminId = candidateB.user._id;

    const promoted = await User.updateOne(
      {
        _id: temporaryAdminId,
        email: emailB,
      },
      {
        $set: {
          role: "admin",
        },
      }
    );

    assert.equal(promoted.matchedCount, 1);

    const reviewed = await request(
      `/applications/${applicationId}/status`,
      {
        method: "PATCH",
        token: tokenB,
        body: {
          status: "Under Review",
          note: "Automated demo review",
        },
      }
    );

    assert.equal(reviewed.status, "Under Review");

    await request(
      `/applications/${applicationId}/status`,
      {
        method: "PATCH",
        token: tokenB,
        body: {
          status: "Accepted",
        },
        expected: 409,
      }
    );

    await User.updateOne(
      {
        _id: temporaryAdminId,
        email: emailB,
      },
      {
        $set: {
          role: "candidate",
        },
      }
    );

    temporaryAdminId = null;

    pass("Administrator status transitions");

    // TEST 36: Withdraw application
    const withdrawn = await request(
      `/applications/${applicationId}/withdraw`,
      {
        method: "PATCH",
        token: tokenA,
      }
    );

    assert.equal(withdrawn.status, "Withdrawn");
    assert.equal(withdrawn.statusHistory.length, 3);

    pass("Application withdrawal and history");

    // TEST 37: Application resume preservation
    await request("/profile/resume", {
      method: "DELETE",
      token: tokenA,
    });

    const archivedResume = await request(
      `/applications/${applicationId}/resume`,
      {
        token: tokenA,
        binary: true,
      }
    );

    assert.deepEqual(archivedResume, pdf);

    pass("Submitted resume preservation");

    // TEST 38: Remove saved job
    await request(`/saved-jobs/${jobId}`, {
      method: "DELETE",
      token: tokenA,
    });

    const remaining = await request(
      "/saved-jobs",
      {
        token: tokenA,
      }
    );

    assert.equal(remaining.pagination.total, 0);

    pass("Saved-job removal");

    // TEST 39: Behavior summary
    const summary = await request(
      "/behavior/summary",
      {
        token: tokenA,
      }
    );

    assert.equal(summary.totalEvents, 9);
    assert.equal(summary.totalPoints, 39);

    pass("Behavior event totals and weights");

    // TEST 40: Behavior history
    const history = await request(
      "/behavior/events",
      {
        token: tokenA,
      }
    );

    assert.equal(history.pagination.total, 9);

    pass("Behavior history retrieval");

    // TEST 41: Behavior privacy
    const otherSummary = await request(
      "/behavior/summary",
      {
        token: tokenB,
      }
    );

    assert.equal(otherSummary.totalEvents, 0);

    pass("Behavior ownership isolation");

    // TEST 42: Behavior reset
    await request("/behavior/events", {
      method: "DELETE",
      token: tokenA,
    });

    const reset = await request(
      "/behavior/summary",
      {
        token: tokenA,
      }
    );

    assert.equal(reset.totalEvents, 0);
    assert.equal(reset.totalPoints, 0);

    pass("Behavior history reset");

    console.log(
      `\nALL ${passed} API TEST GROUPS PASSED!`
    );

    console.log(
      "Phase 3 backend verification complete."
    );

  } finally {
    // Restore temporary admin role if a test fails
    try {
      if (temporaryAdminId) {
        await User.updateOne(
          {
            _id: temporaryAdminId,
            email: emailB,
          },
          {
            $set: {
              role: "candidate",
            },
          }
        );
      }
    } finally {
      await mongoose.disconnect();
    }
  }
};

runTests().catch((error) => {
  console.error(
    "\nAPI TEST FAILED:",
    error.message
  );

  process.exitCode = 1;
});
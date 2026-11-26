const BehaviorEvent = require(
  "../models/BehaviorEvent"
);

const EVENT_WEIGHTS = Object.freeze({
  JOB_SEARCH: 2,
  CATEGORY_VIEW: 3,
  SKILL_VIEW: 3,
  JOB_VIEW: 4,
  COMPANY_VIEW: 3,
  SAVE_JOB: 6,
  UNSAVE_JOB: 0,
  APPLY_INTENT: 8,
  APPLICATION_SUBMITTED: 10,
});

// Generate metadata from a real job document
const getJobMetadata = (job) => ({
  title: job.title,

  category: job.category,

  skills: [...job.skills],

  location: job.location,

  workMode: job.workMode,

  industry: job.industry,

  jobType: job.jobType,

  salaryMin: job.salary.min,

  salaryMax: job.salary.max,
});

// Store a behavior event
const recordBehavior = async ({
  candidate,
  eventType,
  job = null,
  company = null,
  metadata = {},
}) => {
  if (
    !Object.hasOwn(
      EVENT_WEIGHTS,
      eventType
    )
  ) {
    throw new Error(
      "Unknown behavior event type"
    );
  }

  return BehaviorEvent.create({
    candidate,

    // Stable tracking identity for demo accounts
    sessionId:
      `candidate:${candidate.toString()}`,

    eventType,

    job: job?._id || null,

    company:
      job?.company?._id ||
      job?.company ||
      company?._id ||
      null,

    metadata: {
      ...metadata,

      // Real job information takes precedence
      ...(job ? getJobMetadata(job) : {}),
    },

    weight: EVENT_WEIGHTS[eventType],
  });
};

// Prevent analytics failure from blocking
// an already successful core operation
const recordBehaviorSafely = async (
  eventData
) => {
  try {
    return await recordBehavior(eventData);
  } catch (error) {
    console.error(
      "Behavior tracking failed:",
      error.message
    );

    return null;
  }
};

module.exports = {
  EVENT_WEIGHTS,
  getJobMetadata,
  recordBehavior,
  recordBehaviorSafely,
};
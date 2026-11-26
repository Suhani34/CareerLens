const {
  ApiError,
  asyncHandler,
  sendSuccess,
  readString,
  readStringArray,
  readNumber,
  requireObject,
} = require("../utils/api");

const {
  storePdf,
  removeStoredPdf,
  sendPrivatePdf,
} = require("../middleware/upload");

// Validate optional web URLs
const readWebUrl = (value, label) => {
  const url = readString(
    value,
    label,
    500
  );

  if (!url) {
    return "";
  }

  try {
    const parsed = new URL(url);

    if (
      !["http:", "https:"].includes(
        parsed.protocol
      )
    ) {
      throw new Error();
    }

    return url;
  } catch {
    throw new ApiError(
      400,
      `${label} must be a valid HTTP or HTTPS URL`
    );
  }
};

const readDate = (value, label) => {
  if (
    value === undefined ||
    value === null ||
    value === ""
  ) {
    return undefined;
  }

  if (typeof value !== "string") {
    throw new ApiError(
      400,
      `Invalid ${label}`
    );
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    throw new ApiError(
      400,
      `Invalid ${label}`
    );
  }

  return date;
};

const readYear = (value, label) => {
  const year = readNumber(value, label);

  if (year === undefined) {
    return undefined;
  }

  if (
    !Number.isInteger(year) ||
    year < 1900 ||
    year > 2100
  ) {
    throw new ApiError(
      400,
      `Invalid ${label}`
    );
  }

  return year;
};

// GET /api/profile
const getProfile = asyncHandler(
  async (req, res) => {
    return sendSuccess(
      res,
      req.user,
      "Profile retrieved successfully"
    );
  }
);

// PUT /api/profile
const updateProfile = asyncHandler(
  async (req, res) => {
    const body = requireObject(req.body);

    const user = req.user;

    const textFields = {
      name: 100,
      phone: 30,
      location: 100,
      headline: 200,
      bio: 2000,
    };

    // Only allow explicitly approved fields
    for (
      const [field, maxLength]
      of Object.entries(textFields)
    ) {
      if (body[field] !== undefined) {
        user[field] = readString(
          body[field],
          field,
          maxLength
        );
      }
    }

    if (body.avatar !== undefined) {
      user.avatar = readWebUrl(
        body.avatar,
        "Avatar URL"
      );
    }

    // Update candidate skills
    if (body.skills !== undefined) {
      user.skills = readStringArray(
        body.skills,
        "Skills"
      );
    }

    // Update education
    if (body.education !== undefined) {
      if (
        !Array.isArray(body.education) ||
        body.education.length > 20
      ) {
        throw new ApiError(
          400,
          "Invalid education records"
        );
      }

      user.education = body.education.map(
        (item) => {
          requireObject(
            item,
            "Education record"
          );

          const startYear = readYear(
            item.startYear,
            "Start year"
          );

          const endYear = readYear(
            item.endYear,
            "End year"
          );

          if (
            startYear !== undefined &&
            endYear !== undefined &&
            endYear < startYear
          ) {
            throw new ApiError(
              400,
              "Education end year cannot precede start year"
            );
          }

          return {
            institution: readString(
              item.institution,
              "Institution",
              200
            ),

            degree: readString(
              item.degree,
              "Degree",
              100
            ),

            fieldOfStudy: readString(
              item.fieldOfStudy,
              "Field of study",
              100
            ),

            startYear,
            endYear,

            grade: readString(
              item.grade,
              "Grade",
              30
            ),
          };
        }
      );
    }

    // Update work experience
    if (body.experience !== undefined) {
      if (
        !Array.isArray(body.experience) ||
        body.experience.length > 20
      ) {
        throw new ApiError(
          400,
          "Invalid experience records"
        );
      }

      user.experience = body.experience.map(
        (item) => {
          requireObject(
            item,
            "Experience record"
          );

          if (
            item.currentlyWorking !== undefined &&
            typeof item.currentlyWorking !== "boolean"
          ) {
            throw new ApiError(
              400,
              "Currently working must be true or false"
            );
          }

          const currentlyWorking =
            item.currentlyWorking === true;

          const startDate = readDate(
            item.startDate,
            "Start date"
          );

          const endDate =
            currentlyWorking
              ? undefined
              : readDate(
                  item.endDate,
                  "End date"
                );

          if (
            startDate &&
            endDate &&
            endDate < startDate
          ) {
            throw new ApiError(
              400,
              "Experience end date cannot precede start date"
            );
          }

          return {
            company: readString(
              item.company,
              "Company",
              150
            ),

            title: readString(
              item.title,
              "Job title",
              150
            ),

            location: readString(
              item.location,
              "Location",
              100
            ),

            startDate,
            endDate,
            currentlyWorking,

            description: readString(
              item.description,
              "Description",
              2000
            ),
          };
        }
      );
    }

    // Update professional links
    if (body.links !== undefined) {
      requireObject(
        body.links,
        "Professional links"
      );

      for (
        const field
        of ["linkedin", "github", "portfolio"]
      ) {
        if (body.links[field] !== undefined) {
          user.set(
            `links.${field}`,

            readWebUrl(
              body.links[field],
              field
            )
          );
        }
      }
    }

    // Update explicit job preferences
    if (body.preferences !== undefined) {
      requireObject(
        body.preferences,
        "Preferences"
      );

      for (
        const field
        of [
          "categories",
          "locations",
          "workModes",
        ]
      ) {
        if (
          body.preferences[field] !== undefined
        ) {
          const values = readStringArray(
            body.preferences[field],
            field,
            20
          );

          if (
            field === "workModes" &&
            values.some(
              (mode) =>
                ![
                  "Remote",
                  "Hybrid",
                  "On-site",
                ].includes(mode)
            )
          ) {
            throw new ApiError(
              400,
              "Invalid work-mode preference"
            );
          }

          user.set(
            `preferences.${field}`,
            values
          );
        }
      }

      if (
        body.preferences.expectedSalary !== undefined
      ) {
        user.set(
          "preferences.expectedSalary",

          readNumber(
            body.preferences.expectedSalary,
            "Expected salary"
          ) ?? 0
        );
      }
    }

    // Full document validation before saving
    await user.save();

    return sendSuccess(
      res,
      user,
      "Profile updated successfully"
    );
  }
);

// POST /api/profile/resume
const saveResume = asyncHandler(
  async (req, res) => {
    const document = await storePdf(
      req.file
    );

    try {
      req.user.resume = document;

      await req.user.save();
    } catch (error) {
      await removeStoredPdf(
        document.filename
      );

      throw error;
    }

    return sendSuccess(
      res,
      req.user.resume,
      "Resume uploaded successfully",
      201
    );
  }
);

// GET /api/profile/resume
const getResume = asyncHandler(
  async (req, res, next) => {
    return sendPrivatePdf(
      res,
      req.user.resume,
      next
    );
  }
);

// DELETE /api/profile/resume
const deleteResume = asyncHandler(
  async (req, res) => {
    req.user.resume = undefined;

    await req.user.save();

    return sendSuccess(
      res,
      null,
      "Resume removed from profile"
    );
  }
);

module.exports = {
  getProfile,
  updateProfile,
  saveResume,
  getResume,
  deleteResume,
};
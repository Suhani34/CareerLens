const multer = require("multer");

const path = require("node:path");
const fs = require("node:fs/promises");
const crypto = require("node:crypto");

const {
  ApiError,
} = require("../utils/api");

const uploadDirectory = path.resolve(
  __dirname,
  "../uploads"
);

const maxUploadMB = Math.min(
  Math.max(
    Number(process.env.MAX_UPLOAD_MB) || 5,
    1
  ),
  10
);

const upload = multer({
  storage: multer.memoryStorage(),

  limits: {
    fileSize:
      maxUploadMB * 1024 * 1024,

    files: 3,
    fields: 20,
    fieldSize: 20000,
    parts: 25,
  },

  fileFilter: (req, file, callback) => {
    const extension = path
      .extname(file.originalname)
      .toLowerCase();

    if (
      extension !== ".pdf" ||
      file.mimetype !== "application/pdf"
    ) {
      return callback(
        new ApiError(
          400,
          "Only PDF documents are allowed"
        )
      );
    }

    callback(null, true);
  },
});

// Upload one candidate resume
const uploadResume = upload.single("resume");

// Upload up to three supporting documents
const uploadDocuments = upload.array(
  "documents",
  3
);

// Save a validated PDF
const storePdf = async (file) => {
  if (!file || !file.buffer) {
    throw new ApiError(
      400,
      "Please select a PDF file"
    );
  }

  const header = file.buffer
    .subarray(0, 5)
    .toString("ascii");

  if (header !== "%PDF-") {
    throw new ApiError(
      400,
      "The uploaded file does not appear to be a valid PDF"
    );
  }

  await fs.mkdir(uploadDirectory, {
    recursive: true,
  });

  const filename =
    `${crypto.randomUUID()}.pdf`;

  const originalName =
    path.basename(file.originalname)
      .replace(/[\x00-\x1F\x7F]/g, "")
      .slice(0, 200) || "document.pdf";

  await fs.writeFile(
    path.join(uploadDirectory, filename),
    file.buffer,
    {
      flag: "wx",
    }
  );

  return {
    filename,
    originalName,
    mimetype: "application/pdf",
    size: file.size,
    uploadedAt: new Date(),
  };
};

// Safely resolve a stored filename
const getStoredPath = (filename) => {
  if (
    typeof filename !== "string" ||
    !/^[a-f0-9-]{36}\.pdf$/i.test(filename)
  ) {
    throw new ApiError(
      400,
      "Invalid stored filename"
    );
  }

  return path.join(
    uploadDirectory,
    filename
  );
};

// Remove a file if a database write fails
const removeStoredPdf = async (filename) => {
  try {
    await fs.unlink(
      getStoredPath(filename)
    );
  } catch (error) {
    if (error.code !== "ENOENT") {
      console.error(
        "File cleanup failed:",
        error.message
      );
    }
  }
};

// Confirm a stored file still exists
const checkStoredPdf = async (filename) => {
  const filePath = getStoredPath(filename);

  try {
    await fs.access(filePath);
  } catch {
    throw new ApiError(
      404,
      "Stored document could not be found"
    );
  }

  return filePath;
};

// Send private document as a download
const sendPrivatePdf = async (
  res,
  document,
  next
) => {
  if (!document?.filename) {
    throw new ApiError(
      404,
      "Document not found"
    );
  }

  const filePath = await checkStoredPdf(
    document.filename
  );

  res.set(
    "Cache-Control",
    "private, no-store"
  );

  return res.download(
    filePath,
    document.originalName || "document.pdf",
    (error) => {
      if (error) {
        next(error);
      }
    }
  );
};

module.exports = {
  uploadResume,
  uploadDocuments,
  storePdf,
  removeStoredPdf,
  checkStoredPdf,
  sendPrivatePdf,
};
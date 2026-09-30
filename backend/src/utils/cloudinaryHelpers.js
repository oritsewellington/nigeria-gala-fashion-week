const cloudinary = require("../config/cloudinary");
const AppError = require("./AppError");

/**
 * Uploads a buffer (from multer memoryStorage) to Cloudinary using
 * an upload_stream, wrapped in a Promise.
 */
const uploadBufferToCloudinary = (buffer, folder) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: `nigeria-gala-fashion-week/${folder}`,
        resource_type: "image",
        transformation: [
          { width: 1200, height: 1200, crop: "limit", quality: "auto" },
        ],
      },
      (error, result) => {
        if (error) {
          // Log the REAL Cloudinary error server-side so it's debuggable -
          // the client only ever sees the safe generic message.
          console.error("[Cloudinary] Upload failed:", {
            message: error.message,
            name: error.name,
            http_code: error.http_code,
          });
          return reject(
            new AppError(
              "Image upload failed. Please try again.",
              502,
              "UPLOAD_FAILED",
            ),
          );
        }
        resolve(result);
      },
    );
    stream.end(buffer);
  });

const deleteFromCloudinary = async (publicId) => {
  if (!publicId) return;
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (err) {
    // Non-fatal: log but don't block the request over a cleanup failure
    console.error(
      "[Cloudinary] Failed to delete asset:",
      publicId,
      err.message,
    );
  }
};

module.exports = { uploadBufferToCloudinary, deleteFromCloudinary };

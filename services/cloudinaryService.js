const cloudinary = require('../config/cloudinary');

function uploadImage(buffer, originalName) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: process.env.CLOUDINARY_FOLDER || 'northline-studio', resource_type: 'image', use_filename: true, unique_filename: true },
      (error, result) => error ? reject(error) : resolve(result)
    );
    stream.end(buffer);
  });
}

async function deleteImage(publicId) {
  return cloudinary.uploader.destroy(publicId, { resource_type: 'image', invalidate: true });
}

module.exports = { uploadImage, deleteImage };

// Cloudinary integration service.
//
// To enable Cloudinary:
//  1. Install: npm install cloudinary
//  2. Add to server/.env:
//       CLOUDINARY_CLOUD_NAME=your_cloud_name
//       CLOUDINARY_API_KEY=your_api_key
//       CLOUDINARY_API_SECRET=your_api_secret
//  3. The uploadImage/uploadImages helpers below are called from the
//     product controller. When Cloudinary credentials are present, images
//     are pushed to Cloudinary; otherwise the local /uploads URL is used.

let cloudinary = null;

export const isCloudinaryConfigured = () => {
  return Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
  );
};

export const getCloudinary = async () => {
  if (!isCloudinaryConfigured()) {
    return null;
  }
  if (!cloudinary) {
    try {
      const { v2 } = await import("cloudinary");
      v2.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
      });
      cloudinary = v2;
    } catch (error) {
      console.warn(
        "Cloudinary not available. Falling back to local uploads:",
        error.message
      );
      cloudinary = null;
    }
  }
  return cloudinary;
};

const uploadToCloudinary = async (filePath) => {
  const cld = await getCloudinary();
  if (!cld) {
    return { url: null, publicId: null };
  }
  const result = await cld.uploader.upload(filePath, {
    folder: "shopverse/products",
  });
  return { url: result.secure_url, publicId: result.public_id };
};

export const uploadImagesToCloudinary = async (files) => {
  const cld = await getCloudinary();
  if (!cld) {
    return { urls: [], publicIds: [], usedCloudinary: false };
  }
  const results = [];
  const publicIds = [];
  for (const file of files) {
    try {
      const { url, publicId } = await uploadToCloudinary(file.path);
      if (url) {
        results.push(url);
        if (publicId) publicIds.push(publicId);
      }
    } catch (error) {
      console.error("Cloudinary upload failed for file:", error.message);
    }
  }
  return { urls: results, publicIds, usedCloudinary: true };
};

export const deleteImageFromCloudinary = async (publicId) => {
  const cld = await getCloudinary();
  if (!cld || !publicId) return;
  try {
    await cld.uploader.destroy(publicId);
  } catch (error) {
    console.error("Cloudinary delete failed:", error.message);
  }
};

import "dotenv/config";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import connectDB from "../config/db.js";
import Product from "../models/Product.js";
import Review from "../models/Review.js";
import Category from "../models/Category.js";
import Subcategory from "../models/Subcategory.js";
import Brand from "../models/Brand.js";
import { uploadsDir } from "../middleware/uploadMiddleware.js";
import { getCloudinary } from "../services/cloudinaryService.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const LOCALHOST_UPLOAD_RE = /^http:\/\/localhost:\d+\/uploads\/(.+)$/;

const targetBase = process.env.SERVER_URL;

const uploadToCloudinary = async (cld, filePath, filename) => {
  const result = await cld.uploader.upload(filePath, {
    folder: "shopverse/products",
    public_id: path.basename(filename, path.extname(filename)),
  });
  return result.secure_url;
};

const fixImageUrl = async (cld, url) => {
  if (!LOCALHOST_UPLOAD_RE.test(url)) {
    return { url, changed: false };
  }
  const match = url.match(LOCALHOST_UPLOAD_RE);
  const filename = match[1].split("/").pop();
  const localFile = path.join(uploadsDir, filename);

  if (cld && fs.existsSync(localFile)) {
    const secureUrl = await uploadToCloudinary(cld, localFile, filename);
    console.log(`  [CLOUDINARY] ${url} -> ${secureUrl}`);
    return { url: secureUrl, changed: true };
  }

  if (targetBase) {
    const newUrl = `${targetBase}/uploads/${filename}`;
    console.log(`  [REWRITE] ${url} -> ${newUrl}`);
    return { url: newUrl, changed: true };
  }

  console.warn(`  [SKIPPED] ${url} (file missing and no SERVER_URL set)`);
  return { url, changed: false };
};

const fixImageField = async (cld, doc, field) => {
  const value = doc[field];
  let changed = false;

  if (Array.isArray(value)) {
    for (let i = 0; i < value.length; i += 1) {
      if (typeof value[i] === "string") {
        const result = await fixImageUrl(cld, value[i]);
        if (result.changed) {
          value[i] = result.url;
          changed = true;
        }
      }
    }
  } else if (typeof value === "string" && value) {
    const result = await fixImageUrl(cld, value);
    if (result.changed) {
      doc[field] = result.url;
      changed = true;
    }
  }

  if (changed) {
    await doc.save();
    console.log(`  Updated ${doc.constructor.modelName} ${doc._id}`);
  }
  return changed;
};

const migrate = async () => {
  await connectDB();
  const cld = await getCloudinary();
  console.log(
    cld
      ? "Cloudinary configured - will re-upload local files."
      : "Cloudinary NOT configured - will only rewrite hosts via SERVER_URL."
  );
  console.log(`Target base: ${targetBase || "(none - SERVER_URL not set)"}`);

  let total = 0;

  const products = await Product.find({
    images: { $regex: /^http:\/\/localhost:\d+\/uploads\// },
  });
  for (const p of products) {
    console.log(`Product ${p.name}:`);
    if (await fixImageField(cld, p, "images")) total += 1;
  }

  const reviews = await Review.find({
    images: { $regex: /^http:\/\/localhost:\d+\/uploads\// },
  });
  for (const r of reviews) {
    console.log(`Review ${r._id}:`);
    if (await fixImageField(cld, r, "images")) total += 1;
  }

  const categories = await Category.find({
    image: { $regex: /^http:\/\/localhost:\d+\/uploads\// },
  });
  for (const c of categories) {
    console.log(`Category ${c.name}:`);
    if (await fixImageField(cld, c, "image")) total += 1;
  }

  const subcategories = await Subcategory.find({
    image: { $regex: /^http:\/\/localhost:\d+\/uploads\// },
  });
  for (const s of subcategories) {
    console.log(`Subcategory ${s.name}:`);
    if (await fixImageField(cld, s, "image")) total += 1;
  }

  const brands = await Brand.find({
    image: { $regex: /^http:\/\/localhost:\d+\/uploads\// },
  });
  for (const b of brands) {
    console.log(`Brand ${b.name}:`);
    if (await fixImageField(cld, b, "image")) total += 1;
  }

  console.log(`Migration complete. ${total} document(s) updated.`);
  process.exit(0);
};

migrate().catch((error) => {
  console.error("Migration failed:", error.message);
  process.exit(1);
});
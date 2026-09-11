import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";
import healthRoutes from "./routes/healthRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import vendorRoutes from "./routes/vendorRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import { categoriesRouter, subcategoriesRouter, brandsRouter } from "./routes/catalogRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import wishlistRoutes from "./routes/wishlistRoutes.js";
import addressRoutes from "./routes/addressRoutes.js";
import checkoutRoutes from "./routes/checkoutRoutes.js";
import customerOrderRoutes from "./routes/customerOrderRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.set("trust proxy", 1);

const allowedOrigins = (
  process.env.CORS_ORIGINS ||
  process.env.CLIENT_URL ||
  "http://localhost:5173"
)
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

if (
  process.env.CLIENT_URL &&
  !allowedOrigins.includes(process.env.CLIENT_URL)
) {
  allowedOrigins.push(process.env.CLIENT_URL);
}

const VERCEL_URL = "https://multi-vendor-e-commerce-platform.vercel.app";
if (!allowedOrigins.includes(VERCEL_URL)) {
  allowedOrigins.push(VERCEL_URL);
}

console.log("[CORS] Allowed origins:", allowedOrigins);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      console.warn(`[CORS] Blocked origin: ${origin}`);
      return callback(null, false);
    },
    credentials: true,
  })
);

app.use((req, res, next) => {
  if (req.url === "/api/payment/webhook" && req.method === "POST") {
    express.raw({ type: "application/json" })(req, res, (err) => {
      if (err) return next(err);
      req.rawBody = req.body.toString("utf8");
      try {
        req.body = JSON.parse(req.rawBody);
      } catch (parseError) {
        return next(parseError);
      }
      next();
    });
  } else {
    next();
  }
});

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(
  "/uploads",
  express.static(path.join(__dirname, "uploads"))
);

app.use("/api/health", healthRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/categories", categoriesRouter);
app.use("/api/subcategories", subcategoriesRouter);
app.use("/api/brands", brandsRouter);
app.use("/api/admin", adminRoutes);
app.use("/api/vendor", vendorRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/addresses", addressRoutes);
app.use("/api/checkout", checkoutRoutes);
app.use("/api/orders", customerOrderRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/notifications", notificationRoutes);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

app.use((err, req, res, next) => {
  console.error("Unhandled error:", err.stack || err.message || err);

  if (res.headersSent) {
    return next(err);
  }

  if (err?.name === "MulterError") {
    const isTooLarge = err.code === "LIMIT_FILE_SIZE";
    return res.status(isTooLarge ? 413 : 400).json({
      success: false,
      message: isTooLarge
        ? "File too large. Maximum image size is 5MB."
        : `Image upload error: ${err.code}`,
    });
  }

  if (err?.message === "Only image files are allowed") {
    return res.status(400).json({
      success: false,
      message: "Only image files are allowed",
    });
  }

  const status = err?.status || err?.statusCode || 500;

  res.status(status).json({
    success: false,
    message: process.env.NODE_ENV === "development" ? err.message : "Internal Server Error",
  });
});

export default app;

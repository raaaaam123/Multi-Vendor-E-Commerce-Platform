import express from "express";
import protect from "../middleware/authMiddleware.js";
import { vendorOnly } from "../middleware/roleMiddleware.js";
import { uploadProductImages } from "../middleware/uploadMiddleware.js";
import {
  getProfile,
  updateProfile,
  getDashboard,
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  getOrders,
  getOrder,
  updateOrderStatus,
  getCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  getAnalytics,
  getCategories,
  getSubcategories,
  getBrands,
} from "../controllers/vendorController.js";

const router = express.Router();

router.use(protect, vendorOnly);

router.get("/profile", getProfile);
router.put("/profile", updateProfile);

router.get("/dashboard", getDashboard);
router.get("/analytics", getAnalytics);

router.get("/categories", getCategories);
router.get("/subcategories", getSubcategories);
router.get("/brands", getBrands);

router.get("/products", getProducts);
router.post("/products", uploadProductImages, createProduct);
router.get("/products/:id", getProduct);
router.put("/products/:id", uploadProductImages, updateProduct);
router.delete("/products/:id", deleteProduct);

router.get("/orders", getOrders);
router.get("/orders/:id", getOrder);
router.patch("/orders/:orderId/items/:itemId/status", updateOrderStatus);

router.get("/coupons", getCoupons);
router.post("/coupons", createCoupon);
router.put("/coupons/:id", updateCoupon);
router.delete("/coupons/:id", deleteCoupon);

export default router;

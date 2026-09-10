import express from "express";
import protect from "../middleware/authMiddleware.js";
import { adminOnly } from "../middleware/roleMiddleware.js";

import {
  getDashboardStats,
  getUsers,
  updateUserStatus,
  deleteUser,
  getVendors,
  approveVendor,
  rejectVendor,
  blockVendor,
  unblockVendor,
  getSalesReport,
} from "../controllers/adminController.js";

import {
  getCategories,
  getAllCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../controllers/categoryController.js";

import {
  getSubcategories,
  getSubcategory,
  createSubcategory,
  updateSubcategory,
  deleteSubcategory,
} from "../controllers/subcategoryController.js";

import {
  getBrands,
  getAllBrands,
  getBrand,
  createBrand,
  updateBrand,
  deleteBrand,
} from "../controllers/brandController.js";

import {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../controllers/productController.js";

import {
  getOrders,
  getOrder,
  updateOrderStatus,
  updatePaymentStatus,
  getPaymentHistory,
} from "../controllers/orderController.js";

import { processRefund } from "../controllers/paymentController.js";

import {
  getCoupons,
  getCoupon,
  createCoupon,
  updateCoupon,
  deleteCoupon,
} from "../controllers/couponController.js";

const router = express.Router();

router.use(protect, adminOnly);

router.get("/dashboard", getDashboardStats);
router.get("/reports", getSalesReport);
router.get("/payments", getPaymentHistory);

router
  .route("/users")
  .get(getUsers)
  .delete(deleteUser);
router.patch("/users/:id/status", updateUserStatus);

router
  .route("/vendors")
  .get(getVendors);
router.patch("/vendors/:id/approve", approveVendor);
router.patch("/vendors/:id/reject", rejectVendor);
router.patch("/vendors/:id/block", blockVendor);
router.patch("/vendors/:id/unblock", unblockVendor);

router
  .route("/categories")
  .get(getCategories)
  .post(createCategory);
router.get("/categories/all", getAllCategories);
router
  .route("/categories/:id")
  .get(getCategory)
  .put(updateCategory)
  .delete(deleteCategory);

router
  .route("/subcategories")
  .get(getSubcategories)
  .post(createSubcategory);
router
  .route("/subcategories/:id")
  .get(getSubcategory)
  .put(updateSubcategory)
  .delete(deleteSubcategory);

router
  .route("/brands")
  .get(getBrands)
  .post(createBrand);
router.get("/brands/all", getAllBrands);
router
  .route("/brands/:id")
  .get(getBrand)
  .put(updateBrand)
  .delete(deleteBrand);

router
  .route("/products")
  .get(getProducts)
  .post(createProduct);
router
  .route("/products/:id")
  .get(getProduct)
  .put(updateProduct)
  .delete(deleteProduct);

router
  .route("/orders")
  .get(getOrders);
router
  .route("/orders/:id")
  .get(getOrder);
router.patch("/orders/:id/status", updateOrderStatus);
router.patch("/orders/:id/payment-status", updatePaymentStatus);
router.post("/orders/:id/refund", processRefund);

router
  .route("/coupons")
  .get(getCoupons)
  .post(createCoupon);
router
  .route("/coupons/:id")
  .get(getCoupon)
  .put(updateCoupon)
  .delete(deleteCoupon);

export default router;

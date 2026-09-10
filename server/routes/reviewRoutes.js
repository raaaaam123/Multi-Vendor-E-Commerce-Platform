import express from "express";
import protect from "../middleware/authMiddleware.js";
import {
  getProductReviews,
  getMyReview,
  getReviewEligibility,
  createReview,
  updateReview,
  deleteReview,
} from "../controllers/reviewController.js";

const router = express.Router();

router.get("/product/:productId", getProductReviews);

router.get("/product/:productId/me", protect, getMyReview);
router.get("/product/:productId/eligibility", protect, getReviewEligibility);
router.post("/product/:productId", protect, createReview);
router.put("/:id", protect, updateReview);
router.delete("/:id", protect, deleteReview);

export default router;
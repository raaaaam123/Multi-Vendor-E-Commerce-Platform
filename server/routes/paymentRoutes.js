import express from "express";
import protect from "../middleware/authMiddleware.js";
import {
  createPaymentOrder,
  verifyPayment,
  paymentWebhook,
} from "../controllers/paymentController.js";

const router = express.Router();

router.post("/webhook", paymentWebhook);

router.post("/create-order", protect, createPaymentOrder);
router.post("/verify", protect, verifyPayment);

export default router;

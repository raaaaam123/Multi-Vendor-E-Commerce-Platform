import express from "express";
import protect from "../middleware/authMiddleware.js";
import {
  previewCheckout,
  placeOrder,
} from "../controllers/checkoutController.js";

const router = express.Router();

router.use(protect);

router.post("/", placeOrder);
router.post("/preview", previewCheckout);

export default router;
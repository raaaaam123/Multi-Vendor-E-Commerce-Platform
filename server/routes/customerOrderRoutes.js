import express from "express";
import protect from "../middleware/authMiddleware.js";
import {
  getMyOrders,
  getMyOrder,
  cancelOrder,
  trackOrder,
} from "../controllers/customerOrderController.js";

const router = express.Router();

router.use(protect);

router.get("/", getMyOrders);
router.get("/:id", getMyOrder);
router.post("/:id/cancel", cancelOrder);
router.get("/:id/track", trackOrder);

export default router;

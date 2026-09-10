import express from "express";
import protect from "../middleware/authMiddleware.js";
import {
  getAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
} from "../controllers/addressController.js";

const router = express.Router();

router.use(protect);

router.get("/", getAddresses);
router.post("/", createAddress);
router.put("/:id/default", setDefaultAddress);
router.put("/:id", updateAddress);
router.delete("/:id", deleteAddress);

export default router;
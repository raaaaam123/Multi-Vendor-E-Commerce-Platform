import Coupon from "../models/Coupon.js";
import { round2 } from "./pricing.js";

export class CouponError extends Error {
  constructor(message, code = "COUPON_INVALID") {
    super(message);
    this.code = code;
  }
}

export const validateAndApplyCoupon = async ({ code, subtotal, vendorIds = [] }) => {
  if (!code) {
    return { coupon: null, discountAmount: 0 };
  }

  const coupon = await Coupon.findOne({ code: code.trim().toUpperCase() });
  if (!coupon) {
    throw new CouponError("Invalid coupon code", "COUPON_NOT_FOUND");
  }

  if (coupon.status !== "active") {
    throw new CouponError("This coupon is not active", "COUPON_INACTIVE");
  }

  const now = new Date();
  if (now < new Date(coupon.startDate)) {
    throw new CouponError("This coupon is not active yet", "COUPON_NOT_STARTED");
  }
  if (now > new Date(coupon.endDate)) {
    throw new CouponError("This coupon has expired", "COUPON_EXPIRED");
  }

  if (coupon.usageLimit > 0 && coupon.usedCount >= coupon.usageLimit) {
    throw new CouponError("This coupon has reached its usage limit", "COUPON_USED_UP");
  }

  if (coupon.vendor) {
    const eligible = vendorIds.some(
      (id) => id && id.toString() === coupon.vendor.toString()
    );
    if (!eligible) {
      throw new CouponError(
        "This coupon is not valid for the items in your cart",
        "COUPON_VENDOR_MISMATCH"
      );
    }
  }

  if (subtotal < (coupon.minPurchase || 0)) {
    throw new CouponError(
      `Minimum purchase for this coupon is ₹${coupon.minPurchase}`,
      "COUPON_MIN_PURCHASE"
    );
  }

  let discountAmount =
    coupon.discountType === "percentage"
      ? (subtotal * coupon.discountValue) / 100
      : coupon.discountValue;

  if (coupon.maxDiscount > 0) {
    discountAmount = Math.min(discountAmount, coupon.maxDiscount);
  }
  discountAmount = Math.min(discountAmount, subtotal);
  discountAmount = round2(discountAmount);

  return {
    coupon,
    discountAmount,
  };
};
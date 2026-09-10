import Razorpay from "razorpay";
import crypto from "crypto";
import Order from "../models/Order.js";

const getRazorpay = () => {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) {
    const error = new Error("Razorpay is not configured");
    error.code = "RAZORPAY_NOT_CONFIGURED";
    throw error;
  }
  return new Razorpay({
    key_id: keyId,
    key_secret: keySecret,
  });
};

export const createRazorpayOrder = async ({ amount, receipt, notes = {} }) => {
  const razorpay = getRazorpay();
  const options = {
    amount: Math.round(amount * 100),
    currency: "INR",
    receipt: receipt?.slice(0, 40) || `rcpt_${Date.now()}`,
    notes,
    payment_capture: 1,
  };
  const order = await razorpay.orders.create(options);
  return { orderId: order.id, amount: order.amount / 100, currency: "INR" };
};

export const verifyPaymentSignature = ({
  razorpayOrderId,
  razorpayPaymentId,
  razorpaySignature,
}) => {
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keySecret) {
    throw new Error("Razorpay is not configured");
  }
  const body = `${razorpayOrderId}|${razorpayPaymentId}`;
  const expectedSignature = crypto
    .createHmac("sha256", keySecret)
    .update(body)
    .digest("hex");
  return expectedSignature === razorpaySignature;
};

export const verifyWebhookSignature = (body, signature) => {
  const keySecret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!keySecret) {
    throw new Error("Razorpay webhook secret is not configured");
  }
  const expectedSignature = crypto
    .createHmac("sha256", keySecret)
    .update(body)
    .digest("hex");
  return expectedSignature === signature;
};

export const markOrderPaid = async ({ razorpayOrderId, paymentId }) => {
  return await Order.findOneAndUpdate(
    { razorpayOrderId },
    {
      paymentStatus: "paid",
      paymentId,
    },
    { new: true }
  );
};

export const getPaymentById = async (paymentId) => {
  const razorpay = getRazorpay();
  return await razorpay.payments.fetch(paymentId);
};

export const createRefund = async ({ paymentId, amount, notes = {} }) => {
  const razorpay = getRazorpay();
  const refund = await razorpay.payments.refund(paymentId, {
    amount: Math.round(amount * 100),
    notes,
    speed: "normal",
  });
  return refund;
};

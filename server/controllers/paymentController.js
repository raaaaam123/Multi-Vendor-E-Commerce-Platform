import Order from "../models/Order.js";
import Product from "../models/Product.js";
import Address from "../models/Address.js";
import Cart from "../models/Cart.js";
import Coupon from "../models/Coupon.js";
import {
  computeCartTotals,
  computeItemPrice,
} from "../utils/pricing.js";
import {
  validateAndApplyCoupon,
  CouponError,
} from "../utils/couponValidator.js";
import {
  createRazorpayOrder,
  verifyPaymentSignature,
  verifyWebhookSignature,
  markOrderPaid,
  createRefund,
  getPaymentById,
} from "../services/razorpayService.js";
import { sendEmail } from "../utils/email.js";
import { paymentSuccessEmail, orderConfirmEmail } from "../utils/emailTemplates.js";
import { notifyUser } from "../utils/notify.js";

const PAYMENT_METHODS = ["card", "upi", "netbanking", "wallet"];

const parseQuantity = (value) => {
  const num = Number(value);
  if (!Number.isInteger(num) || num < 1 || num > 99) return null;
  return num;
};

const parseItems = (items) => {
  if (!Array.isArray(items) || items.length === 0) {
    return { error: "Cart is empty" };
  }
  const normalized = [];
  for (const item of items) {
    const quantity = parseQuantity(item?.quantity);
    if (!item?.productId || !quantity) {
      return { error: "Invalid order item" };
    }
    normalized.push({ productId: String(item.productId), quantity });
  }
  return { items: normalized };
};

const loadValidatedProducts = async (items) => {
  const ids = items.map((item) => item.productId);
  const products = await Product.find({ _id: { $in: ids } })
    .select(
      "name slug price discount stock images category brand vendor isApproved status"
    )
    .populate({ path: "vendor", select: "businessName name" });

  const productMap = new Map(products.map((p) => [p._id.toString(), p]));

  const validItems = [];
  for (const item of items) {
    const product = productMap.get(item.productId);
    if (!product) {
      return { error: "One or more products in your cart no longer exist" };
    }
    if (product.status !== "active" || product.isApproved !== true) {
      return { error: `"${product.name}" is not currently available` };
    }
    if (product.stock < item.quantity) {
      return {
        error:
          product.stock > 0
            ? `Only ${product.stock} units of "${product.name}" are available in stock`
            : `"${product.name}" is out of stock`,
      };
    }
    validItems.push({ product, quantity: item.quantity });
  }
  return { items: validItems };
};

const resolveCoupon = async ({ code, subtotal, vendorIds }) => {
  if (!code) return { coupon: null, discountAmount: 0 };
  try {
    return await validateAndApplyCoupon({ code, subtotal, vendorIds });
  } catch (error) {
    if (error instanceof CouponError) {
      throw { status: 400, message: error.message };
    }
    throw error;
  }
};

const generateOrderNumber = async () => {
  const prefix = "SW";
  const dateStr = new Date()
    .toISOString()
    .slice(0, 10)
    .replace(/-/g, "")
    .slice(2);
  let seq = 1000;
  for (let i = 0; i < 5; i++) {
    const orderNumber = `${prefix}${dateStr}${Math.floor(1000 + Math.random() * 9000)}${seq + i}`;
    const exists = await Order.findOne({ orderNumber });
    if (!exists) return orderNumber;
  }
  return `${prefix}${dateStr}${Date.now()}`;
};

const createPaymentOrder = async (req, res) => {
  try {
    const { items: parsedItems, error: itemError } = parseItems(req.body.items);
    if (itemError) {
      return res.status(400).json({ success: false, message: itemError });
    }

    const { items: validItems, error: productError } =
      await loadValidatedProducts(parsedItems);
    if (productError) {
      return res.status(400).json({ success: false, message: productError });
    }

    const address = await Address.findOne({
      _id: req.body.addressId,
      user: req.user._id,
    });
    if (!address) {
      return res.status(400).json({
        success: false,
        message: "Please select a valid shipping address",
      });
    }

    const paymentMethod = String(req.body.paymentMethod || "").toLowerCase();
    if (!PAYMENT_METHODS.includes(paymentMethod)) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment method",
      });
    }

    const totals = computeCartTotals(validItems);
    const vendorIds = validItems.map(
      (item) => item.product.vendor?._id?.toString()
    );

    const { coupon, discountAmount } = await resolveCoupon({
      code: req.body.couponCode,
      subtotal: totals.subtotal,
      vendorIds,
    });

    const finalTotals = computeCartTotals(validItems, {
      discountAmount,
    });

    const orderNumber = await generateOrderNumber();

    const orderItems = validItems.map(({ product, quantity }) => ({
      product: product._id,
      name: product.name,
      price: computeItemPrice(product).finalPrice,
      quantity,
      vendor: product.vendor?._id,
    }));

    const recipient =
      orderItems.length > 0
        ? {
            name: req.user.name,
            email: req.user.email,
            contact:
              req.user.phone ||
              address.phone ||
              Math.floor(1000000000 + Math.random() * 9000000000).toString(),
          }
        : undefined;

    const { orderId, amount, currency } = await createRazorpayOrder({
      amount: finalTotals.total,
      receipt: orderNumber,
      notes: {
        orderNumber,
        userId: req.user._id.toString(),
      },
    });

    const order = await Order.create({
      orderNumber,
      user: req.user._id,
      items: orderItems,
      shippingAddress: {
        name: address.fullName,
        address: address.addressLine1,
        city: address.city,
        state: address.state,
        zipCode: address.postalCode,
        country: address.country,
        phone: address.phone,
      },
      paymentMethod,
      paymentStatus: "pending",
      razorpayOrderId: orderId,
      itemsPrice: finalTotals.subtotal,
      taxPrice: finalTotals.tax,
      shippingPrice: finalTotals.shipping,
      discountAmount,
      couponCode: coupon ? coupon.code : "",
      totalPrice: finalTotals.total,
      status: "pending",
    });

    return res.status(201).json({
      success: true,
      message: "Payment order created successfully",
      payment: {
        orderId,
        amount: finalTotals.total,
        currency,
        keyId: process.env.RAZORPAY_KEY_ID,
        customerName: req.user.name,
        customerEmail: req.user.email,
        customerPhone: recipient?.contact || address.phone,
        orderNumber,
      },
      order: {
        _id: order._id,
        orderNumber: order.orderNumber,
        totalPrice: order.totalPrice,
      },
    });
  } catch (error) {
    if (error?.status) {
      return res.status(error.status).json({
        success: false,
        message: error.message,
      });
    }
    if (error?.code === "RAZORPAY_NOT_CONFIGURED") {
      return res.status(503).json({
        success: false,
        message:
          "Online payment is currently unavailable. Please try cash on delivery.",
      });
    }
    console.error("Create payment order error:", error);
    const gatewayMessage =
      error?.error?.description ||
      error?.error?.reason ||
      (error?.message ? String(error.message) : "");
    return res.status(500).json({
      success: false,
      message: gatewayMessage
        ? `Payment gateway error: ${gatewayMessage}`
        : "Failed to create payment order",
    });
  }
};

const verifyPayment = async (req, res) => {
  try {
    const {
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
    } = req.body;

    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return res.status(400).json({
        success: false,
        message: "Missing payment verification details",
      });
    }

    const order = await Order.findOne({ razorpayOrderId });
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You do not have access to this order",
      });
    }

    if (order.paymentStatus === "paid") {
      return res.status(200).json({
        success: true,
        message: "Payment already verified",
        order,
      });
    }

    if (order.razorpayOrderId !== razorpayOrderId) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment order",
      });
    }

    const isValid = verifyPaymentSignature({
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
    });

    if (!isValid) {
      order.paymentStatus = "failed";
      order.status = "cancelled";
      order.cancelledAt = new Date();
      await order.save();
      return res.status(400).json({
        success: false,
        message: "Payment verification failed. Signature mismatch.",
      });
    }

    order.paymentStatus = "paid";
    order.paymentId = razorpayPaymentId;

    const decremented = [];
    try {
      for (const item of order.items) {
        const updated = await Product.findOneAndUpdate(
          { _id: item.product, stock: { $gte: item.quantity } },
          { $inc: { stock: -item.quantity } },
          { new: true }
        ).select("stock name vendor");
        if (!updated) {
          throw new Error(`INSUFFICIENT_STOCK:${item.name}`);
        }
        decremented.push(item.product);
        const itemVendorId = item.vendor || updated.vendor;
        if (itemVendorId) {
          await notifyUser({
            recipient: itemVendorId,
            type: "new_order",
            title: "New Order Received",
            message: `You have a new order for "${updated.name}".`,
            link: "/vendor/orders",
          });
          if (updated.stock <= 5) {
            await notifyUser({
              recipient: itemVendorId,
              type: "low_stock",
              title: "Low Stock Alert",
              message: `"${updated.name}" is running low with only ${updated.stock} unit${
                updated.stock === 1 ? "" : "s"
              } left in stock.`,
              link: "/vendor/products",
            });
          }
        }
      }
    } catch (stockError) {
      for (const productId of decremented) {
        await Product.findByIdAndUpdate(productId, { $inc: { stock: 1 } });
      }
      order.paymentStatus = "failed";
      order.status = "cancelled";
      order.cancelledAt = new Date();
      await order.save();
      try {
        const payment = await getPaymentById(razorpayPaymentId);
        if (payment && payment.status === "captured") {
          await createRefund({
            paymentId: razorpayPaymentId,
            amount: order.totalPrice,
            notes: { reason: "Insufficient stock at payment time" },
          });
          order.paymentStatus = "refunded";
          await order.save();
        }
      } catch (refundError) {
        console.error("Refund error after failed stock:", refundError);
      }
      if (String(stockError.message).startsWith("INSUFFICIENT_STOCK")) {
        const name = String(stockError.message).split(":")[1] || "Product";
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for "${name}". Your payment has been refunded.`,
        });
      }
      return res.status(500).json({
        success: false,
        message: "Failed to process order due to stock issue",
      });
    }

    if (order.couponCode) {
      const coupon = await Coupon.findOne({
        code: order.couponCode.toUpperCase(),
      });
      if (coupon) {
        await Coupon.findByIdAndUpdate(coupon._id, {
          $inc: { usedCount: 1 },
        });
      }
    }

    await Cart.findOneAndUpdate(
      { user: req.user._id },
      { $set: { items: [], couponCode: "" } },
      { upsert: true }
    );

    await order.save();

    const populatedUser = await order.populate("user", "name email");

    try {
      await sendEmail({
        to: populatedUser.user.email,
        subject: `Payment Received for Order #${order.orderNumber} - ShopVerse`,
        html: paymentSuccessEmail({
          name: populatedUser.user.name,
          orderNumber: order.orderNumber,
          amount: order.totalPrice,
          method: order.paymentMethod,
        }),
      });
      await sendEmail({
        to: populatedUser.user.email,
        subject: `Order Confirmation #${order.orderNumber} - ShopVerse`,
        html: orderConfirmEmail({
          name: populatedUser.user.name,
          orderNumber: order.orderNumber,
          items: order.items,
          total: order.totalPrice,
          address: order.shippingAddress,
        }),
      });
    } catch (emailError) {
      console.error("Payment success email failed:", emailError.message);
    }

    await notifyUser({
      recipient: order.user._id,
      type: "payment_success",
      title: "Payment Successful",
      message: `Your payment of ${order.totalPrice} for order #${order.orderNumber} was successful.`,
      link: `/account/orders/${order._id}`,
    });

    return res.status(200).json({
      success: true,
      message: "Payment verified successfully",
      order,
    });
  } catch (error) {
    console.error("Verify payment error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to verify payment",
    });
  }
};

const paymentWebhook = async (req, res) => {
  try {
    const signature = req.headers["x-razorpay-signature"];

    if (!signature) {
      return res.status(400).json({
        success: false,
        message: "Missing signature",
      });
    }

    const rawBody = req.rawBody || JSON.stringify(req.body);
    const isValid = verifyWebhookSignature(rawBody, signature);

    if (!isValid) {
      console.error("Webhook signature verification failed");
      return res.status(400).json({
        success: false,
        message: "Invalid signature",
      });
    }

    const { event, payload } = req.body;

    if (event === "payment.captured" || event === "payment.authorized") {
      const payment = payload?.payment?.entity;
      if (payment) {
        const order = await Order.findOne({ razorpayOrderId: payment.order_id });
        if (order && order.paymentStatus !== "paid") {
          order.paymentStatus = "paid";
          order.paymentId = payment.id;

          const decremented = [];
          try {
            for (const item of order.items) {
              const updated = await Product.findOneAndUpdate(
                { _id: item.product, stock: { $gte: item.quantity } },
                { $inc: { stock: -item.quantity } },
                { new: true }
              );
              if (!updated) {
                throw new Error(`INSUFFICIENT_STOCK:${item.name}`);
              }
              decremented.push(item.product);
            }
          } catch (stockError) {
            for (const productId of decremented) {
              await Product.findByIdAndUpdate(productId, {
                $inc: { stock: 1 },
              });
            }
            if (event === "payment.captured") {
              await createRefund({
                paymentId: payment.id,
                amount: order.totalPrice,
                notes: { reason: "Insufficient stock" },
              });
              order.paymentStatus = "refunded";
            } else {
              order.paymentStatus = "failed";
            }
            order.status = "cancelled";
            order.cancelledAt = new Date();
          }

          await order.save();
        }
      }
    } else if (event === "payment.failed") {
      const payment = payload?.payment?.entity;
      if (payment) {
        const order = await Order.findOne({
          razorpayOrderId: payment.order_id,
        });
        if (order && order.paymentStatus !== "paid") {
          order.paymentStatus = "failed";
          order.status = "cancelled";
          order.cancelledAt = new Date();
          await order.save();
        }
      }
    }

    return res.status(200).json({ success: true, received: true });
  } catch (error) {
    console.error("Payment webhook error:", error);
    return res.status(500).json({
      success: false,
      message: "Webhook processing failed",
    });
  }
};

const processRefund = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    if (order.paymentStatus !== "paid" || !order.paymentId) {
      return res.status(400).json({
        success: false,
        message:
          "This order is not eligible for refund (payment not captured)",
      });
    }

    const refund = await createRefund({
      paymentId: order.paymentId,
      amount: order.totalPrice,
      notes: {
        orderNumber: order.orderNumber,
        reason: "Admin initiated refund",
      },
    });

    order.paymentStatus = "refunded";
    order.status = "returned";
    await order.save();

    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: item.quantity },
      });
    }

    return res.status(200).json({
      success: true,
      message: "Refund processed successfully",
      order,
      refund,
    });
  } catch (error) {
    console.error("Process refund error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to process refund",
    });
  }
};

export { createPaymentOrder, verifyPayment, paymentWebhook, processRefund };

import Order from "../models/Order.js";
import Product from "../models/Product.js";

const ORDER_STATUSES = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "out_for_delivery",
  "delivered",
  "cancelled",
  "returned",
];

const PAYMENT_STATUSES = ["pending", "paid", "failed", "refunded"];

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

const getMyOrders = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, paymentStatus } = req.query;
    const query = { user: req.user._id };
    if (status && ORDER_STATUSES.includes(status)) query.status = status;
    if (paymentStatus && PAYMENT_STATUSES.includes(paymentStatus))
      query.paymentStatus = paymentStatus;

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Order.countDocuments(query);
    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    return res.status(200).json({
      success: true,
      orders,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    console.error("Get my orders error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch orders",
    });
  }
};

const getMyOrder = async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      user: req.user._id,
    })
      .populate("user", "name email phone")
      .populate("items.vendor", "businessName name");

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    return res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    console.error("Get my order error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch order",
    });
  }
};

const cancelOrder = async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    const cancellableStatuses = ["pending", "confirmed", "processing"];
    if (!cancellableStatuses.includes(order.status)) {
      return res.status(400).json({
        success: false,
        message:
          order.status === "cancelled"
            ? "This order is already cancelled"
            : "This order can no longer be cancelled",
      });
    }

    order.status = "cancelled";
    order.cancelledAt = new Date();

    for (const item of order.items) {
      item.status = "cancelled";
    }

    await order.save();

    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: item.quantity },
      });
    }

    if (order.paymentStatus === "paid" && order.paymentId) {
      try {
        const { createRefund } = await import(
          "../services/razorpayService.js"
        );
        await createRefund({
          paymentId: order.paymentId,
          amount: order.totalPrice,
          notes: {
            orderNumber: order.orderNumber,
            reason: "Order cancelled by customer",
          },
        });
        order.paymentStatus = "refunded";
        await order.save();
      } catch (refundError) {
        console.error("Refund error on cancel:", refundError);
      }
    }

    return res.status(200).json({
      success: true,
      message: "Order cancelled successfully",
      order,
    });
  } catch (error) {
    console.error("Cancel order error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to cancel order",
    });
  }
};

const trackOrder = async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    const tracking = {
      orderNumber: order.orderNumber,
      status: order.status,
      paymentStatus: order.paymentStatus,
      paymentMethod: order.paymentMethod,
      items: order.items.map((item) => ({
        name: item.name,
        quantity: item.quantity,
        status: item.status,
      })),
      shippingAddress: order.shippingAddress,
      trackingNumber: order.trackingNumber,
      totalPrice: order.totalPrice,
      createdAt: order.createdAt,
      deliveredAt: order.deliveredAt,
      cancelledAt: order.cancelledAt,
    };

    return res.status(200).json({
      success: true,
      tracking,
    });
  } catch (error) {
    console.error("Track order error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to track order",
    });
  }
};

export {
  getMyOrders,
  getMyOrder,
  cancelOrder,
  trackOrder,
  generateOrderNumber,
};

import Order from "../models/Order.js";
import { sendEmail } from "../utils/email.js";
import { orderShippedEmail, orderDeliveredEmail } from "../utils/emailTemplates.js";
import { notifyUser } from "../utils/notify.js";

const getOrders = async (req, res) => {
  try {
    const { search, status, paymentStatus, page = 1, limit = 10 } = req.query;

    const query = {};
    if (status) query.status = status;
    if (paymentStatus) query.paymentStatus = paymentStatus;
    if (search) {
      query.$or = [
        { "shippingAddress.name": { $regex: search, $options: "i" } },
        { "shippingAddress.phone": { $regex: search, $options: "i" } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Order.countDocuments(query);
    const orders = await Order.find(query)
      .populate("user", "name email")
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
    console.error("Get orders error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch orders",
    });
  }
};

const getOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate(
      "user",
      "name email phone"
    );

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
    console.error("Get order error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch order",
    });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = [
      "pending", "confirmed", "processing", "shipped", "out_for_delivery", "delivered", "cancelled", "returned",
    ];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order status",
      });
    }

    const order = await Order.findById(req.params.id).populate(
      "user",
      "name email phone"
    );
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    order.status = status;
    if (status === "delivered") {
      order.deliveredAt = new Date();
    }
    if (status === "cancelled") {
      order.cancelledAt = new Date();
    }

    await order.save();

    if (status === "shipped" && order.user && order.user.email) {
      try {
        await sendEmail({
          to: order.user.email,
          subject: `Your Order #${order.orderNumber} Has Shipped - ShopVerse`,
          html: orderShippedEmail({
            name: order.user.name,
            orderNumber: order.orderNumber,
            trackingNumber: order.trackingNumber || "",
            items: order.items,
          }),
        });
      } catch (emailError) {
        console.error("Order shipped email failed:", emailError.message);
      }
      await notifyUser({
        recipient: order.user._id,
        type: "order_shipped",
        title: "Order Shipped",
        message: `Your order #${order.orderNumber} has been shipped and is on its way.`,
        link: `/account/orders/${order._id}`,
      });
    } else if (status === "delivered" && order.user && order.user.email) {
      try {
        await sendEmail({
          to: order.user.email,
          subject: `Your Order #${order.orderNumber} Was Delivered - ShopVerse`,
          html: orderDeliveredEmail({
            name: order.user.name,
            orderNumber: order.orderNumber,
          }),
        });
      } catch (emailError) {
        console.error("Order delivered email failed:", emailError.message);
      }
      await notifyUser({
        recipient: order.user._id,
        type: "order_delivered",
        title: "Order Delivered",
        message: `Your order #${order.orderNumber} has been delivered. Enjoy your purchase!`,
        link: `/account/orders/${order._id}`,
      });
    }

    return res.status(200).json({
      success: true,
      message: `Order status updated to ${status}`,
      order,
    });
  } catch (error) {
    console.error("Update order status error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update order status",
    });
  }
};

const updatePaymentStatus = async (req, res) => {
  try {
    const { paymentStatus } = req.body;
    const validStatuses = ["pending", "paid", "failed", "refunded"];

    if (!validStatuses.includes(paymentStatus)) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment status",
      });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    order.paymentStatus = paymentStatus;
    await order.save();

    return res.status(200).json({
      success: true,
      message: `Payment status updated to ${paymentStatus}`,
      order,
    });
  } catch (error) {
    console.error("Update payment status error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update payment status",
    });
  }
};

const getPaymentHistory = async (req, res) => {
  try {
    const { paymentStatus, page = 1, limit = 10 } = req.query;

    const query = {};
    if (paymentStatus) query.paymentStatus = paymentStatus;

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Order.countDocuments(query);
    const orders = await Order.find(query)
      .populate("user", "name email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .select(
        "user items totalPrice paymentMethod paymentStatus createdAt shippingAddress"
      );

    return res.status(200).json({
      success: true,
      payments: orders,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    console.error("Get payment history error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch payment history",
    });
  }
};

export {
  getOrders,
  getOrder,
  updateOrderStatus,
  updatePaymentStatus,
  getPaymentHistory,
};

import Product from "../models/Product.js";
import Order from "../models/Order.js";
import Address from "../models/Address.js";
import Cart from "../models/Cart.js";
import Coupon from "../models/Coupon.js";
import {
  computeCartTotals,
  computeShipping,
  computeTax,
  computeItemPrice,
  round2,
} from "../utils/pricing.js";
import {
  validateAndApplyCoupon,
  CouponError,
} from "../utils/couponValidator.js";
import { sendEmail } from "../utils/email.js";
import { orderConfirmEmail } from "../utils/emailTemplates.js";
import { notifyUser } from "../utils/notify.js";

const PAYMENT_METHODS = ["cod", "card", "upi", "netbanking", "wallet"];

const parseQuantity = (value) => {
  const num = Number(value);
  if (!Number.isInteger(num) || num < 1 || num > 99) return null;
  return num;
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
    .select("name slug price discount stock images category brand vendor isApproved status")
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

const computeOrderPricing = (validItems, coupon = null) => {
  const totals = computeCartTotals(
    validItems.map(({ product, quantity }) => ({ product, quantity })),
    coupon
  );
  return totals;
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

const previewCheckout = async (req, res) => {
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

    const subtotal = computeCartTotals(validItems).subtotal;
    const vendorIds = validItems.map(
      (item) => item.product.vendor?._id?.toString()
    );

    const { coupon, discountAmount } = await resolveCoupon({
      code: req.body.couponCode,
      subtotal,
      vendorIds,
    });

    const couponView = coupon
      ? {
          code: coupon.code,
          description: coupon.description,
          discountType: coupon.discountType,
          discountValue: coupon.discountValue,
          minPurchase: coupon.minPurchase,
          maxDiscount: coupon.maxDiscount,
          discountAmount,
        }
      : null;

    const totals = computeOrderPricing(validItems, couponView);
    const items = validItems.map(({ product, quantity }) => ({
      product: {
        _id: product._id,
        name: product.name,
        slug: product.slug,
        price: product.price,
        discount: product.discount,
        finalPrice: computeItemPrice(product).finalPrice,
        stock: product.stock,
        image: product.images?.[0] || "",
      },
      quantity,
    }));

    return res.status(200).json({
      success: true,
      items,
      coupon: couponView,
      totals,
      valid: true,
    });
  } catch (error) {
    if (error?.status) {
      return res.status(error.status).json({
        success: false,
        message: error.message,
      });
    }
    console.error("Preview checkout error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to validate checkout",
    });
  }
};

const placeOrder = async (req, res) => {
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

    const paymentMethod = String(req.body.paymentMethod || "cod").toLowerCase();
    if (!PAYMENT_METHODS.includes(paymentMethod)) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment method",
      });
    }

    const subtotal = computeCartTotals(validItems).subtotal;
    const vendorIds = validItems.map(
      (item) => item.product.vendor?._id?.toString()
    );

    const { coupon, discountAmount } = await resolveCoupon({
      code: req.body.couponCode,
      subtotal,
      vendorIds,
    });

    const totals = computeOrderPricing(validItems, {
      discountAmount,
    });

    const orderItems = validItems.map(({ product, quantity }) => ({
      product: product._id,
      name: product.name,
      price: computeItemPrice(product).finalPrice,
      quantity,
      vendor: product.vendor?._id,
    }));

    const orderNumber = await generateOrderNumber();

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
      paymentStatus: paymentMethod === "cod" ? "pending" : "paid",
      itemsPrice: totals.subtotal,
      taxPrice: totals.tax,
      shippingPrice: totals.shipping,
      discountAmount,
      couponCode: coupon ? coupon.code : "",
      totalPrice: totals.total,
    });

    const decremented = [];
    try {
      for (const { product, quantity } of validItems) {
        const updated = await Product.findOneAndUpdate(
          { _id: product._id, stock: { $gte: quantity } },
          { $inc: { stock: -quantity } },
          { new: true }
        ).select("stock name vendor");
        if (!updated) {
          throw new Error(`INSUFFICIENT_STOCK:${product.name}`);
        }
        decremented.push(product._id);
        const itemVendorId = product.vendor?._id || updated.vendor;
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
    } catch (error) {
      for (const productId of decremented) {
        await Product.findByIdAndUpdate(productId, { $inc: { stock: 1 } });
      }
      await Order.findByIdAndDelete(order._id);
      if (String(error.message).startsWith("INSUFFICIENT_STOCK")) {
        const name = String(error.message).split(":")[1] || "Product";
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for "${name}". Please refresh your cart.`,
        });
      }
      console.error("Place order stock error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to place order",
      });
    }

    if (coupon && coupon.usedCount !== undefined) {
      await Coupon.findByIdAndUpdate(coupon._id, { $inc: { usedCount: 1 } });
    }

    await Cart.findOneAndUpdate(
      { user: req.user._id },
      { $set: { items: [], couponCode: "" } },
      { upsert: true }
    );

    const populatedOrder = await Order.findById(order._id).populate(
      "user",
      "name email phone"
    );

    try {
      await sendEmail({
        to: populatedOrder.user.email,
        subject: `Order Confirmation #${orderNumber} - ShopVerse`,
        html: orderConfirmEmail({
          name: populatedOrder.user.name,
          orderNumber,
          items: populatedOrder.items,
          total: populatedOrder.totalPrice,
          address: populatedOrder.shippingAddress,
        }),
      });
    } catch (emailError) {
      console.error("Order confirmation email failed:", emailError.message);
    }

    await notifyUser({
      recipient: req.user._id,
      type: "order_placed",
      title: "Order Placed Successfully",
      message: `Your order #${orderNumber} has been placed and is now being processed.`,
      link: `/account/orders/${order._id}`,
    });

    return res.status(201).json({
      success: true,
      message: "Order placed successfully",
      order: populatedOrder,
    });
  } catch (error) {
    if (error?.status) {
      return res.status(error.status).json({
        success: false,
        message: error.message,
      });
    }
    console.error("Place order error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to place order",
    });
  }
};

export { previewCheckout, placeOrder };
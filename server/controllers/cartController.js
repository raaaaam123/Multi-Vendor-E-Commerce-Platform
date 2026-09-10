import Cart from "../models/Cart.js";
import Product from "../models/Product.js";
import { computeCartTotals, computeItemPrice } from "../utils/pricing.js";
import { validateAndApplyCoupon, CouponError } from "../utils/couponValidator.js";

const PRODUCT_SELECT =
  "name slug price discount sku stock images rating numReviews category brand vendor isApproved status";

const getOrCreateCart = async (userId) => {
  let cart = await Cart.findOne({ user: userId });
  if (!cart) {
    cart = await Cart.create({ user: userId, items: [] });
  }
  return cart;
};

const buildCartView = async (cart) => {
  const productIds = cart.items.map((item) => item.product);
  const products = await Product.find({ _id: { $in: productIds } })
    .select(PRODUCT_SELECT)
    .populate("category", "name slug")
    .populate("brand", "name")
    .populate("vendor", "businessName name");

  const productMap = new Map(products.map((p) => [p._id.toString(), p]));

  const items = cart.items
    .filter((item) => productMap.has(item.product.toString()))
    .map((item) => ({
      product: productMap.get(item.product.toString()),
      quantity: item.quantity,
    }));

  const vendorIds = [
    ...new Set(
      items
        .map((item) => item.product.vendor?._id?.toString())
        .filter(Boolean)
    ),
  ];

  const subtotal = computeCartTotals(items).subtotal;

  let coupon = null;
  if (cart.couponCode) {
    try {
      const result = await validateAndApplyCoupon({
        code: cart.couponCode,
        subtotal,
        vendorIds,
      });
      if (result.coupon && result.discountAmount > 0) {
        coupon = {
          code: result.coupon.code,
          description: result.coupon.description,
          discountType: result.coupon.discountType,
          discountValue: result.coupon.discountValue,
          minPurchase: result.coupon.minPurchase,
          maxDiscount: result.coupon.maxDiscount,
          discountAmount: result.discountAmount,
        };
      } else {
        coupon = {
          code: result.coupon.code,
          description: result.coupon.description,
          discountAmount: 0,
        };
      }
    } catch (error) {
      cart.couponCode = "";
      await cart.save();
      coupon = null;
    }
  }

  const totals = computeCartTotals(items, coupon);

  return { items, coupon, totals };
};

const sendCart = async (userId, res) => {
  const cart = await getOrCreateCart(userId);
  const view = await buildCartView(cart);
  return res.status(200).json({ success: true, cart: view });
};

const parseQuantity = (value) => {
  const num = Number(value);
  if (!Number.isInteger(num) || num < 1 || num > 99) return null;
  return num;
};

const getAvailableProduct = async (productId) => {
  const product = await Product.findById(productId)
    .select(PRODUCT_SELECT)
    .populate("category", "name slug")
    .populate("brand", "name")
    .populate("vendor", "businessName name");
  if (!product) return { product, error: "Product not found" };
  if (product.status !== "active" || product.isApproved !== true) {
    return { product, error: "This product is not currently available" };
  }
  return { product, error: null };
};

const getCart = async (req, res) => {
  try {
    return await sendCart(req.user._id, res);
  } catch (error) {
    console.error("Get cart error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to load cart",
    });
  }
};

const addToCart = async (req, res) => {
  try {
    const quantity = parseQuantity(req.body.quantity ?? 1);
    if (!quantity) {
      return res.status(400).json({
        success: false,
        message: "Invalid quantity",
      });
    }

    const { product, error } = await getAvailableProduct(req.body.productId);
    if (error) {
      return res.status(400).json({ success: false, message: error });
    }

    let cart = await getOrCreateCart(req.user._id);
    const existingItem = cart.items.find(
      (item) => item.product.toString() === product._id.toString()
    );
    const currentQty = existingItem?.quantity || 0;
    const newQty = req.body.set === true ? quantity : currentQty + quantity;

    if (product.stock < newQty) {
      return res.status(400).json({
        success: false,
        message:
          product.stock > 0
            ? `Only ${product.stock} units of "${product.name}" are available in stock`
            : `"${product.name}" is out of stock`,
      });
    }

    if (existingItem) {
      existingItem.quantity = newQty;
    } else {
      cart.items.push({ product: product._id, quantity });
    }
    await cart.save();

    return await sendCart(req.user._id, res);
  } catch (error) {
    console.error("Add to cart error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to add item to cart",
    });
  }
};

const updateCartItem = async (req, res) => {
  try {
    const quantity = parseQuantity(req.body.quantity);
    if (!quantity) {
      return res.status(400).json({
        success: false,
        message: "Invalid quantity",
      });
    }

    let cart = await getOrCreateCart(req.user._id);
    const item = cart.items.find(
      (cartItem) => cartItem.product.toString() === req.params.productId
    );
    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Item not found in cart",
      });
    }

    const product = await Product.findById(req.params.productId)
      .select(PRODUCT_SELECT)
      .populate("category", "name slug")
      .populate("brand", "name")
      .populate("vendor", "businessName name");

    if (!product) {
      return res.status(400).json({
        success: false,
        message: "Product not found",
      });
    }
    if (product.status !== "active" || product.isApproved !== true) {
      return res.status(400).json({
        success: false,
        message: "This product is not currently available",
      });
    }
    if (product.stock < quantity) {
      return res.status(400).json({
        success: false,
        message:
          product.stock > 0
            ? `Only ${product.stock} units of "${product.name}" are available in stock`
            : `"${product.name}" is out of stock`,
      });
    }

    item.quantity = quantity;
    await cart.save();

    return await sendCart(req.user._id, res);
  } catch (error) {
    console.error("Update cart item error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update cart item",
    });
  }
};

const removeCartItem = async (req, res) => {
  try {
    let cart = await getOrCreateCart(req.user._id);
    cart.items = cart.items.filter(
      (item) => item.product.toString() !== req.params.productId
    );
    await cart.save();
    return await sendCart(req.user._id, res);
  } catch (error) {
    console.error("Remove cart item error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to remove item from cart",
    });
  }
};

const clearCart = async (req, res) => {
  try {
    const cart = await getOrCreateCart(req.user._id);
    cart.items = [];
    cart.couponCode = "";
    await cart.save();
    return await sendCart(req.user._id, res);
  } catch (error) {
    console.error("Clear cart error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to clear cart",
    });
  }
};

const applyCoupon = async (req, res) => {
  try {
    const code = (req.body.code || "").trim();
    if (!code) {
      return res.status(400).json({
        success: false,
        message: "Coupon code is required",
      });
    }

    let cart = await getOrCreateCart(req.user._id);
    const view = await buildCartView(cart);

    if (view.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Your cart is empty",
      });
    }

    const vendorIds = view.items
      .map((item) => item.product.vendor?._id?.toString())
      .filter(Boolean);

    try {
      const result = await validateAndApplyCoupon({
        code,
        subtotal: view.totals.subtotal,
        vendorIds,
      });
      if (result.discountAmount === 0) {
        return res.status(400).json({
          success: false,
          message: "This coupon does not provide any discount",
        });
      }
      cart.couponCode = code.trim().toUpperCase();
      await cart.save();
      return await sendCart(req.user._id, res);
    } catch (error) {
      if (error instanceof CouponError) {
        return res.status(400).json({
          success: false,
          message: error.message,
        });
      }
      throw error;
    }
  } catch (error) {
    console.error("Apply coupon error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to apply coupon",
    });
  }
};

const removeCoupon = async (req, res) => {
  try {
    const cart = await getOrCreateCart(req.user._id);
    cart.couponCode = "";
    await cart.save();
    return await sendCart(req.user._id, res);
  } catch (error) {
    console.error("Remove coupon error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to remove coupon",
    });
  }
};

export {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
  applyCoupon,
  removeCoupon,
  buildCartView,
};
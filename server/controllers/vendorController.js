import mongoose from "mongoose";
import User from "../models/User.js";
import Product from "../models/Product.js";
import Order from "../models/Order.js";
import Coupon from "../models/Coupon.js";
import {
  uploadImagesToCloudinary,
} from "../services/cloudinaryService.js";
import { getUploadedFileUrl } from "../middleware/uploadMiddleware.js";
import { notifyUser } from "../utils/notify.js";

const sendProductError = (res, error, logPrefix, fallback) => {
  if (error.name === "ValidationError") {
    const details = Object.values(error.errors)
      .map((e) => e.message)
      .join(", ");
    return res.status(400).json({ success: false, message: details });
  }

  if (error.code === 11000) {
    return res.status(409).json({
      success: false,
      message:
        "A product with this name already exists. Please use a different name.",
    });
  }

  console.error(logPrefix, error);
  return res.status(500).json({
    success: false,
    message:
      process.env.NODE_ENV === "development"
        ? `${fallback}: ${error.message}`
        : fallback,
  });
};

const checkVendorApproved = (req, res) => {
  if (req.user.approvalStatus !== "approved") {
    return res.status(403).json({
      success: false,
      message:
        "Your vendor account is pending approval. Please wait for an admin to approve your store.",
      approvalStatus: req.user.approvalStatus,
    });
  }
  return null;
};

const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("Get vendor profile error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch vendor profile",
    });
  }
};

const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    const fields = [
      "name",
      "phone",
      "avatar",
      "businessName",
      "businessAddress",
      "businessDescription",
    ];

    fields.forEach((field) => {
      if (req.body[field] !== undefined) {
        user[field] = req.body[field];
      }
    });

    await user.save();

    const updated = await User.findById(req.user._id).select("-password");

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: updated,
    });
  } catch (error) {
    console.error("Update vendor profile error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update vendor profile",
    });
  }
};

const getDashboard = async (req, res) => {
  try {
    const blocked = checkVendorApproved(req, res);
    if (blocked) return blocked;

    const vendorId = req.user._id;

    const totalProducts = await Product.countDocuments({ vendor: vendorId });
    const totalOrders = await Order.countDocuments({
      "items.vendor": vendorId,
    });
    const pendingOrders = await Order.countDocuments({
      "items.vendor": vendorId,
      status: "pending",
    });
    const completedOrders = await Order.countDocuments({
      "items.vendor": vendorId,
      status: "delivered",
    });
    const lowStockProducts = await Product.countDocuments({
      vendor: vendorId,
      stock: { $lte: 5 },
    });

    const revenueResult = await Order.aggregate([
      { $match: { "items.vendor": vendorId, paymentStatus: "paid" } },
      { $unwind: "$items" },
      { $match: { "items.vendor": vendorId } },
      {
        $group: {
          _id: null,
          total: { $sum: { $multiply: ["$items.price", "$items.quantity"] } },
        },
      },
    ]);
    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].total : 0;

    const salesResult = await Order.aggregate([
      {
        $match: {
          "items.vendor": vendorId,
          status: { $in: ["delivered", "shipped", "processing"] },
        },
      },
      { $unwind: "$items" },
      { $match: { "items.vendor": vendorId } },
      {
        $group: {
          _id: null,
          total: { $sum: "$items.quantity" },
        },
      },
    ]);
    const totalSales = salesResult.length > 0 ? salesResult[0].total : 0;

    const recentOrders = await Order.find({ "items.vendor": vendorId })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("user", "name email");

    const recentProducts = await Product.find({ vendor: vendorId })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("category", "name");

    return res.status(200).json({
      success: true,
      stats: {
        totalProducts,
        totalOrders,
        pendingOrders,
        completedOrders,
        totalSales,
        totalRevenue,
        lowStockProducts,
        recentOrders,
        recentProducts,
      },
    });
  } catch (error) {
    console.error("Vendor dashboard error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch vendor dashboard",
    });
  }
};

const getProducts = async (req, res) => {
  try {
    const { search, status, page = 1, limit = 10 } = req.query;
    const vendorId = req.user._id;

    const query = { vendor: vendorId };
    if (search) {
      query.name = { $regex: search, $options: "i" };
    }
    if (status) query.status = status;

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Product.countDocuments(query);
    const products = await Product.find(query)
      .populate("category", "name")
      .populate("subcategory", "name")
      .populate("brand", "name")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    return res.status(200).json({
      success: true,
      products,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    console.error("Vendor get products error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch products",
    });
  }
};

const getProduct = async (req, res) => {
  try {
    const product = await Product.findOne({
      _id: req.params.id,
      vendor: req.user._id,
    })
      .populate("category", "name")
      .populate("subcategory", "name")
      .populate("brand", "name");

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found or you do not own this product",
      });
    }

    return res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    console.error("Vendor get product error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch product",
    });
  }
};

const createProduct = async (req, res) => {
  try {
    const blocked = checkVendorApproved(req, res);
    if (blocked) return blocked;

    const {
      name,
      description,
      price,
      discount,
      sku,
      category,
      subcategory,
      brand,
      stock,
      status,
      tags,
      images: imageUrls,
    } = req.body;

    if (!name || !price || !category) {
      return res.status(400).json({
        success: false,
        message: "Name, price, and category are required",
      });
    }

    if (Number(price) < 0) {
      return res.status(400).json({
        success: false,
        message: "Price cannot be negative",
      });
    }

    let images = Array.isArray(imageUrls)
      ? imageUrls.filter((img) => typeof img === "string")
      : [];
    if (req.files && req.files.length > 0) {
      const { urls, usedCloudinary } = await uploadImagesToCloudinary(
        req.files
      );
      if (usedCloudinary) {
        images = urls;
      } else {
        images = req.files.map((f) => getUploadedFileUrl(req, f));
      }
    }

    const product = await Product.create({
      name,
      description,
      price: Number(price),
      discount: discount ? Number(discount) : 0,
      sku,
      category,
      subcategory: subcategory || null,
      brand:
        brand && mongoose.Types.ObjectId.isValid(brand) ? brand : null,
      vendor: req.user._id,
      stock: stock ? Number(stock) : 0,
      images,
      status: status || "active",
      isApproved: true,
      tags,
    });

    const populated = await product.populate([
      { path: "category", select: "name" },
      { path: "subcategory", select: "name" },
      { path: "brand", select: "name" },
    ]);

    return res.status(201).json({
      success: true,
      message: "Product created successfully",
      product: populated,
    });
  } catch (error) {
    return sendProductError(
      res,
      error,
      "Vendor create product error:",
      "Failed to create product"
    );
  }
};

const updateProduct = async (req, res) => {
  try {
    const product = await Product.findOne({
      _id: req.params.id,
      vendor: req.user._id,
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found or you do not own this product",
      });
    }

    const textFields = [
      "name",
      "description",
      "discount",
      "sku",
      "category",
      "subcategory",
      "brand",
      "stock",
      "status",
      "tags",
    ];

    textFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        if (field === "discount" || field === "stock") {
          product[field] = Number(req.body[field]);
        } else if (field === "brand") {
          product[field] =
            req.body[field] && mongoose.Types.ObjectId.isValid(req.body[field])
              ? req.body[field]
              : null;
        } else {
          product[field] = req.body[field];
        }
      }
    });

    if (req.body.price !== undefined) {
      if (Number(req.body.price) < 0) {
        return res.status(400).json({
          success: false,
          message: "Price cannot be negative",
        });
      }
      product.price = Number(req.body.price);
    }

    if (req.body.images !== undefined) {
      product.images = Array.isArray(req.body.images)
        ? req.body.images.filter((img) => typeof img === "string")
        : [req.body.images].filter((img) => typeof img === "string");
    }

    if (req.files && req.files.length > 0) {
      const { urls, usedCloudinary } = await uploadImagesToCloudinary(
        req.files
      );
      let newImages = [];
      if (usedCloudinary) {
        newImages = urls;
      } else {
        newImages = req.files.map((f) => getUploadedFileUrl(req, f));
      }
      product.images = [...product.images, ...newImages];
    }

    await product.save();
    const populated = await product.populate([
      { path: "category", select: "name" },
      { path: "subcategory", select: "name" },
      { path: "brand", select: "name" },
    ]);

    return res.status(200).json({
      success: true,
      message: "Product updated successfully",
      product: populated,
    });
  } catch (error) {
    return sendProductError(
      res,
      error,
      "Vendor update product error:",
      "Failed to update product"
    );
  }
};

const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findOneAndDelete({
      _id: req.params.id,
      vendor: req.user._id,
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found or you do not own this product",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    console.error("Vendor delete product error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete product",
    });
  }
};

const getOrders = async (req, res) => {
  try {
    const { status, search, page = 1, limit = 10 } = req.query;
    const vendorId = req.user._id;

    const query = { "items.vendor": vendorId };
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { "shippingAddress.name": { $regex: search, $options: "i" } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Order.countDocuments(query);
    const orders = await Order.find(query)
      .populate("user", "name email phone")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const mappedOrders = orders.map((order) => {
      const orderObj = order.toObject();
      orderObj.items = orderObj.items.filter(
        (item) => String(item.vendor) === String(vendorId)
      );
      orderObj.vendorItemsTotal = orderObj.items.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );
      return orderObj;
    });

    return res.status(200).json({
      success: true,
      orders: mappedOrders,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    console.error("Vendor get orders error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch orders",
    });
  }
};

const getOrder = async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      "items.vendor": req.user._id,
    }).populate("user", "name email phone");

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found or not related to your store",
      });
    }

    const orderObj = order.toObject();
    orderObj.items = orderObj.items.filter(
      (item) => String(item.vendor) === String(req.user._id)
    );
    orderObj.vendorItemsTotal = orderObj.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    return res.status(200).json({
      success: true,
      order: orderObj,
    });
  } catch (error) {
    console.error("Vendor get order error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch order",
    });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const { orderId, itemId } = req.params;
    const { status } = req.body;

    const validStatuses = ["confirmed", "processing", "shipped", "out_for_delivery", "delivered"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order status for vendor",
      });
    }

    const order = await Order.findOne({
      _id: orderId,
      "items.vendor": req.user._id,
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found or not related to your store",
      });
    }

    const item = order.items.id(itemId);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Order item not found",
      });
    }

    if (String(item.vendor) !== String(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: "You cannot update this order item",
      });
    }

    item.status = status;
    order.status = status;

    if (status === "delivered") {
      order.deliveredAt = new Date();
    }

    await order.save();
    const populated = await order.populate("user", "name email phone");

    if ((status === "shipped" || status === "out_for_delivery" || status === "delivered") && order.user) {
      await notifyUser({
        recipient: order.user._id,
        type: status === "delivered" ? "order_delivered" : "order_shipped",
        title: status === "delivered" ? "Order Delivered" : "Order Shipped",
        message:
          status === "delivered"
            ? `Your order #${order.orderNumber} has been delivered. Enjoy your purchase!`
            : `Your order #${order.orderNumber} item "${item.name}" has been shipped and is on its way.`,
        link: `/account/orders/${order._id}`,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Order status updated",
      order: populated,
    });
  } catch (error) {
    console.error("Vendor update order status error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update order status",
    });
  }
};

const getCoupons = async (req, res) => {
  try {
    const { search, status, page = 1, limit = 10 } = req.query;
    const vendorId = req.user._id;

    const query = { vendor: { $in: [vendorId, null] } };
    if (search) query.code = { $regex: search, $options: "i" };
    if (status) query.status = status;

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Coupon.countDocuments(query);
    const coupons = await Coupon.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    return res.status(200).json({
      success: true,
      coupons,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    console.error("Vendor get coupons error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch coupons",
    });
  }
};

const createCoupon = async (req, res) => {
  try {
    const {
      code,
      description,
      discountType,
      discountValue,
      minPurchase,
      maxDiscount,
      usageLimit,
      startDate,
      endDate,
    } = req.body;

    if (!code || !discountType || !discountValue || !startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message:
          "Code, discount type, value, start date, and end date are required",
      });
    }

    const existing = await Coupon.findOne({ code: code.toUpperCase() });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: "Coupon already exists with this code",
      });
    }

    const coupon = await Coupon.create({
      code,
      description,
      discountType,
      discountValue,
      minPurchase,
      maxDiscount,
      usageLimit,
      startDate,
      endDate,
      vendor: req.user._id,
    });

    return res.status(201).json({
      success: true,
      message: "Coupon created successfully",
      coupon,
    });
  } catch (error) {
    console.error("Vendor create coupon error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create coupon",
    });
  }
};

const updateCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findOne({
      _id: req.params.id,
      vendor: req.user._id,
    });

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: "Coupon not found or you do not own this coupon",
      });
    }

    const fields = [
      "description",
      "discountType",
      "discountValue",
      "minPurchase",
      "maxDiscount",
      "usageLimit",
      "startDate",
      "endDate",
      "status",
    ];

    fields.forEach((field) => {
      if (req.body[field] !== undefined) {
        coupon[field] = req.body[field];
      }
    });

    await coupon.save();

    return res.status(200).json({
      success: true,
      message: "Coupon updated successfully",
      coupon,
    });
  } catch (error) {
    console.error("Vendor update coupon error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update coupon",
    });
  }
};

const deleteCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findOneAndDelete({
      _id: req.params.id,
      vendor: req.user._id,
    });

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: "Coupon not found or you do not own this coupon",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Coupon deleted successfully",
    });
  } catch (error) {
    console.error("Vendor delete coupon error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete coupon",
    });
  }
};

const getAnalytics = async (req, res) => {
  try {
    const vendorId = req.user._id;

    const dailySales = await Order.aggregate([
      { $match: { "items.vendor": vendorId, paymentStatus: "paid" } },
      { $unwind: "$items" },
      { $match: { "items.vendor": vendorId } },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
          },
          revenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } },
          units: { $sum: "$items.quantity" },
        },
      },
      { $sort: { _id: 1 } },
      { $limit: 30 },
    ]);

    const topProducts = await Order.aggregate([
      { $match: { "items.vendor": vendorId } },
      { $unwind: "$items" },
      { $match: { "items.vendor": vendorId } },
      {
        $group: {
          _id: "$items.product",
          name: { $first: "$items.name" },
          totalSold: { $sum: "$items.quantity" },
          revenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } },
        },
      },
      { $sort: { totalSold: -1 } },
      { $limit: 10 },
    ]);

    const ordersByStatus = await Order.aggregate([
      { $match: { "items.vendor": vendorId } },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);

    const monthlyRevenue = await Order.aggregate([
      { $match: { "items.vendor": vendorId, paymentStatus: "paid" } },
      { $unwind: "$items" },
      { $match: { "items.vendor": vendorId } },
      {
        $group: {
          _id: {
            month: { $month: "$createdAt" },
            year: { $year: "$createdAt" },
          },
          revenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } },
        },
      },
      { $sort: { "_id.year": -1, "_id.month": -1 } },
      { $limit: 12 },
    ]);

    return res.status(200).json({
      success: true,
      analytics: {
        dailySales,
        topProducts,
        ordersByStatus,
        monthlyRevenue,
      },
    });
  } catch (error) {
    console.error("Vendor analytics error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch analytics",
    });
  }
};

const getCategories = async (req, res) => {
  try {
    const Category = (await import("../models/Category.js")).default;
    const categories = await Category.find({ status: "active" }).sort({
      name: 1,
    });
    return res.status(200).json({
      success: true,
      categories,
    });
  } catch (error) {
    console.error("Vendor get categories error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch categories",
    });
  }
};

const getSubcategories = async (req, res) => {
  try {
    const Subcategory = (await import("../models/Subcategory.js")).default;
    const { category } = req.query;
    const query = { status: "active" };
    if (category) query.category = category;
    const subcategories = await Subcategory.find(query).sort({ name: 1 });
    return res.status(200).json({
      success: true,
      subcategories,
    });
  } catch (error) {
    console.error("Vendor get subcategories error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch subcategories",
    });
  }
};

const getBrands = async (req, res) => {
  try {
    const Brand = (await import("../models/Brand.js")).default;
    const brands = await Brand.find({ status: "active" })
      .sort({ name: 1 })
      .select("name _id");
    return res.status(200).json({
      success: true,
      brands,
    });
  } catch (error) {
    console.error("Vendor get brands error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch brands",
    });
  }
};

export {
  getProfile,
  updateProfile,
  getDashboard,
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  getOrders,
  getOrder,
  updateOrderStatus,
  getCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  getAnalytics,
  getCategories,
  getSubcategories,
  getBrands,
};

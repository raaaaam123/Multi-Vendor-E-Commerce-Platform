import User from "../models/User.js";
import Product from "../models/Product.js";
import Order from "../models/Order.js";
import { sendEmail } from "../utils/email.js";
import { vendorApprovalEmail } from "../utils/emailTemplates.js";
import { notifyUser } from "../utils/notify.js";

const getDashboardStats = async (req, res) => {
  try {
    const [
      totalUsers,
      totalVendors,
      totalProducts,
      totalOrders,
      pendingVendors,
      activeVendors,
    ] = await Promise.all([
      User.countDocuments({ role: "customer" }),
      User.countDocuments({ role: "vendor" }),
      Product.countDocuments(),
      Order.countDocuments(),
      User.countDocuments({ role: "vendor", status: "inactive" }),
      User.countDocuments({ role: "vendor", status: "active" }),
    ]);

    const revenueResult = await Order.aggregate([
      { $match: { paymentStatus: "paid" } },
      { $group: { _id: null, total: { $sum: "$totalPrice" } } },
    ]);
    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].total : 0;

    const pendingOrders = await Order.countDocuments({ status: "pending" });
    const completedOrders = await Order.countDocuments({ status: "delivered" });
    const cancelledOrders = await Order.countDocuments({ status: "cancelled" });

    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("user", "name email");

    const recentUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select("-password");

    const monthlyRevenue = await Order.aggregate([
      { $match: { paymentStatus: "paid" } },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          revenue: { $sum: "$totalPrice" },
          orders: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": -1, "_id.month": -1 } },
      { $limit: 12 },
    ]);

    return res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        totalVendors,
        totalProducts,
        totalOrders,
        totalRevenue,
        pendingOrders,
        completedOrders,
        cancelledOrders,
        pendingVendors,
        activeVendors,
        recentOrders,
        recentUsers,
        monthlyRevenue,
      },
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch dashboard statistics",
    });
  }
};

const getUsers = async (req, res) => {
  try {
    const { search, role, status, page = 1, limit = 10 } = req.query;

    const query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }
    if (role) query.role = role;
    if (status) query.status = status;

    const skip = (Number(page) - 1) * Number(limit);
    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .select("-password");

    return res.status(200).json({
      success: true,
      users,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    console.error("Get users error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch users",
    });
  }
};

const updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["active", "inactive", "suspended"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status value",
      });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.role === "admin") {
      return res.status(400).json({
        success: false,
        message: "Cannot modify admin status",
      });
    }

    user.status = status;
    await user.save();

    return res.status(200).json({
      success: true,
      message: `User status updated to ${status}`,
      user,
    });
  } catch (error) {
    console.error("Update user status error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update user status",
    });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.role === "admin") {
      return res.status(400).json({
        success: false,
        message: "Cannot delete admin user",
      });
    }

    await User.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error("Delete user error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete user",
    });
  }
};

const getVendors = async (req, res) => {
  try {
    const { search, status, page = 1, limit = 10 } = req.query;

    const query = { role: "vendor" };
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }
    if (status) query.status = status;

    const skip = (Number(page) - 1) * Number(limit);
    const total = await User.countDocuments(query);
    const vendors = await User.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .select("-password");

    return res.status(200).json({
      success: true,
      vendors,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    console.error("Get vendors error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch vendors",
    });
  }
};

const approveVendor = async (req, res) => {
  try {
    const { id } = req.params;

    const vendor = await User.findById(id);
    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: "Vendor not found",
      });
    }

    if (vendor.role !== "vendor") {
      return res.status(400).json({
        success: false,
        message: "User is not a vendor",
      });
    }

    vendor.status = "active";
    vendor.approvalStatus = "approved";
    await vendor.save();

    try {
      await sendEmail({
        to: vendor.email,
        subject: "Vendor Account Approved - ShopVerse",
        html: vendorApprovalEmail({
          name: vendor.name,
          businessName: vendor.businessName,
          approved: true,
        }),
      });
    } catch (emailError) {
      console.error("Vendor approval email failed:", emailError.message);
    }

    await notifyUser({
      recipient: vendor._id,
      type: "vendor_approved",
      title: "Vendor Account Approved",
      message: `Congratulations! Your vendor account${vendor.businessName ? ` for ${vendor.businessName}` : ""} has been approved. You can now start selling on ShopVerse.`,
      link: "/vendor/dashboard",
    });

    return res.status(200).json({
      success: true,
      message: "Vendor approved successfully",
      vendor,
    });
  } catch (error) {
    console.error("Approve vendor error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to approve vendor",
    });
  }
};

const rejectVendor = async (req, res) => {
  try {
    const { id } = req.params;

    const vendor = await User.findById(id);
    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: "Vendor not found",
      });
    }

    if (vendor.role !== "vendor") {
      return res.status(400).json({
        success: false,
        message: "User is not a vendor",
      });
    }

    vendor.status = "inactive";
    vendor.approvalStatus = "rejected";
    await vendor.save();

    try {
      await sendEmail({
        to: vendor.email,
        subject: "Vendor Application Update - ShopVerse",
        html: vendorApprovalEmail({
          name: vendor.name,
          businessName: vendor.businessName,
          approved: false,
        }),
      });
    } catch (emailError) {
      console.error("Vendor rejection email failed:", emailError.message);
    }

    await notifyUser({
      recipient: vendor._id,
      type: "vendor_rejected",
      title: "Vendor Application Update",
      message: `We're sorry, but your vendor account${vendor.businessName ? ` for ${vendor.businessName}` : ""} was rejected. Please contact support if you believe this is a mistake.`,
      link: "/vendor/profile",
    });

    return res.status(200).json({
      success: true,
      message: "Vendor rejected successfully",
      vendor,
    });
  } catch (error) {
    console.error("Reject vendor error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to reject vendor",
    });
  }
};

const blockVendor = async (req, res) => {
  try {
    const { id } = req.params;

    const vendor = await User.findById(id);
    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: "Vendor not found",
      });
    }

    if (vendor.role !== "vendor") {
      return res.status(400).json({
        success: false,
        message: "User is not a vendor",
      });
    }

    vendor.status = "suspended";
    await vendor.save();

    return res.status(200).json({
      success: true,
      message: "Vendor blocked successfully",
      vendor,
    });
  } catch (error) {
    console.error("Block vendor error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to block vendor",
    });
  }
};

const unblockVendor = async (req, res) => {
  try {
    const { id } = req.params;

    const vendor = await User.findById(id);
    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: "Vendor not found",
      });
    }

    if (vendor.role !== "vendor") {
      return res.status(400).json({
        success: false,
        message: "User is not a vendor",
      });
    }

    vendor.status = "active";
    await vendor.save();

    return res.status(200).json({
      success: true,
      message: "Vendor unblocked successfully",
      vendor,
    });
  } catch (error) {
    console.error("Unblock vendor error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to unblock vendor",
    });
  }
};

const getSalesReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const match = { paymentStatus: "paid" };
    if (startDate || endDate) {
      match.createdAt = {};
      if (startDate) match.createdAt.$gte = new Date(startDate);
      if (endDate) match.createdAt.$lte = new Date(endDate);
    }

    const dailySales = await Order.aggregate([
      { $match: match },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
          },
          revenue: { $sum: "$totalPrice" },
          orders: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const topProducts = await Order.aggregate([
      { $match: match },
      { $unwind: "$items" },
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

    const salesByCategory = await Order.aggregate([
      { $match: match },
      { $unwind: "$items" },
      {
        $lookup: {
          from: "products",
          localField: "items.product",
          foreignField: "_id",
          as: "productData",
        },
      },
      { $unwind: "$productData" },
      {
        $lookup: {
          from: "categories",
          localField: "productData.category",
          foreignField: "_id",
          as: "categoryData",
        },
      },
      { $unwind: { path: "$categoryData", preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: "$categoryData._id",
          name: { $first: "$categoryData.name" },
          revenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } },
          units: { $sum: "$items.quantity" },
        },
      },
      { $sort: { revenue: -1 } },
    ]);

    const salesByVendor = await Order.aggregate([
      { $match: match },
      { $unwind: "$items" },
      {
        $lookup: {
          from: "products",
          localField: "items.product",
          foreignField: "_id",
          as: "productData",
        },
      },
      { $unwind: "$productData" },
      {
        $lookup: {
          from: "users",
          localField: "productData.vendor",
          foreignField: "_id",
          as: "vendorData",
        },
      },
      { $unwind: { path: "$vendorData", preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: "$vendorData._id",
          name: {
            $first: {
              $ifNull: ["$vendorData.businessName", "$vendorData.name", "Unknown"],
            },
          },
          revenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } },
        },
      },
      { $sort: { revenue: -1 } },
    ]);

    const statusMatch = {};
    if (startDate || endDate) {
      statusMatch.createdAt = {};
      if (startDate) statusMatch.createdAt.$gte = new Date(startDate);
      if (endDate) statusMatch.createdAt.$lte = new Date(endDate);
    }

    const ordersByStatus = await Order.aggregate([
      { $match: statusMatch },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);

    return res.status(200).json({
      success: true,
      report: {
        dailySales,
        topProducts,
        salesByCategory,
        salesByVendor,
        ordersByStatus,
      },
    });
  } catch (error) {
    console.error("Sales report error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to generate sales report",
    });
  }
};

export {
  getDashboardStats,
  getUsers,
  updateUserStatus,
  deleteUser,
  getVendors,
  approveVendor,
  rejectVendor,
  blockVendor,
  unblockVendor,
  getSalesReport,
};

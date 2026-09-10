import Review from "../models/Review.js";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import mongoose from "mongoose";
import { notifyUser } from "../utils/notify.js";

const getProductReviews = async (req, res) => {
  try {
    const { productId } = req.params;
    const { page = 1, limit = 10, sort = "recent" } = req.query;

    const pageNum = Math.max(1, Number(page) || 1);
    const limitNum = Math.min(50, Math.max(1, Number(limit) || 10));
    const skip = (pageNum - 1) * limitNum;

    if (!mongoose.isValidObjectId(productId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product id",
      });
    }

    const product = await Product.findById(productId).select("_id");
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const match = { product: productId };
    const sortOptions = {
      recent: { createdAt: -1 },
      rating_desc: { rating: -1, createdAt: -1 },
      rating_asc: { rating: 1, createdAt: -1 },
    };

    const pipeline = [
      { $match: match },
      { $sort: sortOptions[sort] || sortOptions.recent },
      { $skip: skip },
      { $limit: limitNum },
      {
        $lookup: {
          from: "users",
          localField: "user",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "orders",
          localField: "order",
          foreignField: "_id",
          as: "orderInfo",
        },
      },
      { $unwind: { path: "$orderInfo", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          user: { name: 1, avatar: 1 },
          product: 1,
          order: 1,
          rating: 1,
          comment: 1,
          images: 1,
          createdAt: 1,
          updatedAt: 1,
          verifiedPurchase: { $eq: ["$orderInfo.status", "delivered"] },
        },
      },
    ];

    const [reviews, total] = await Promise.all([
      Review.aggregate(pipeline),
      Review.countDocuments(match),
    ]);

    return res.status(200).json({
      success: true,
      reviews,
      pagination: {
        total,
        page: pageNum,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error("Get product reviews error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch reviews",
    });
  }
};

const getReviewEligibility = async (req, res) => {
  try {
    const { productId } = req.params;

    if (!mongoose.isValidObjectId(productId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product id",
      });
    }

    const product = await Product.findById(productId).select("_id");
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const purchased = await hasPurchasedProduct(req.user._id, productId);
    const canReview = purchased;
    const alreadyReviewed = Boolean(
      await Review.findOne({
        user: req.user._id,
        product: productId,
      }).select("_id")
    );

    return res.status(200).json({
      success: true,
      eligibility: {
        purchased,
        canReview,
        alreadyReviewed,
      },
    });
  } catch (error) {
    console.error("Get review eligibility error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch review eligibility",
    });
  }
};

const getMyReview = async (req, res) => {
  try {
    const { productId } = req.params;

    if (!mongoose.isValidObjectId(productId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product id",
      });
    }

    const review = await Review.findOne({
      product: productId,
      user: req.user._id,
    });

    let result = null;
    if (review) {
      const order = await Order.findById(review.order).select("status");
      result = review.toObject();
      result.verifiedPurchase = order?.status === "delivered";
    }

    return res.status(200).json({
      success: true,
      review: result,
    });
  } catch (error) {
    console.error("Get my review error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch your review",
    });
  }
};

const hasPurchasedProduct = async (userId, productId) => {
  const order = await Order.findOne({
    user: userId,
    "items.product": productId,
    status: { $nin: ["cancelled", "returned"] },
  }).select("_id");

  return Boolean(order);
};

const createReview = async (req, res) => {
  try {
    const { productId } = req.params;
    const { rating, comment, images = [] } = req.body;

    const numericRating = Number(rating);
    if (!Number.isInteger(numericRating) || numericRating < 1 || numericRating > 5) {
      return res.status(400).json({
        success: false,
        message: "Rating must be a whole number between 1 and 5",
      });
    }

    if (!comment || !String(comment).trim()) {
      return res.status(400).json({
        success: false,
        message: "Review comment is required",
      });
    }
    if (String(comment).trim().length > 1000) {
      return res.status(400).json({
        success: false,
        message: "Review cannot exceed 1000 characters",
      });
    }

    if (!mongoose.isValidObjectId(productId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product id",
      });
    }

    const product = await Product.findById(productId).select("_id name vendor");
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const purchasedOrder = await Order.findOne({
      user: req.user._id,
      "items.product": productId,
      status: { $nin: ["cancelled", "returned"] },
    })
      .sort({ deliveredAt: -1, createdAt: -1 })
      .select("_id status");

    if (!purchasedOrder) {
      return res.status(403).json({
        success: false,
        message: "You can only review products you have purchased",
      });
    }

    const existingReview = await Review.findOne({
      user: req.user._id,
      product: productId,
    });

    if (existingReview) {
      return res.status(409).json({
        success: false,
        message: "You have already reviewed this product",
      });
    }

    const review = await Review.create({
      user: req.user._id,
      product: productId,
      order: purchasedOrder._id,
      rating: numericRating,
      comment: String(comment).trim(),
      images,
    });

    await updateProductRating(productId);

    if (product.vendor && String(product.vendor) !== String(req.user._id)) {
      await notifyUser({
        recipient: product.vendor,
        type: "new_review",
        title: "New Review Received",
        message: `Your product "${product.name}" received a ${numericRating}-star review.`,
        link: "/vendor/products",
      });
    }

    return res.status(201).json({
      success: true,
      message: "Review submitted successfully",
      review: {
        ...review.toObject(),
        verifiedPurchase: purchasedOrder.status === "delivered",
      },
    });
  } catch (error) {
    console.error("Create review error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to submit review",
    });
  }
};

const updateReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, comment, images } = req.body;

    const review = await Review.findById(id);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    if (review.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You can only edit your own review",
      });
    }

    if (rating !== undefined) {
      const numericRating = Number(rating);
      if (
        !Number.isInteger(numericRating) ||
        numericRating < 1 ||
        numericRating > 5
      ) {
        return res.status(400).json({
          success: false,
          message: "Rating must be a whole number between 1 and 5",
        });
      }
      review.rating = numericRating;
    }

    if (comment !== undefined) {
      const trimmed = String(comment).trim();
      if (!trimmed) {
        return res.status(400).json({
          success: false,
          message: "Review comment is required",
        });
      }
      if (trimmed.length > 1000) {
        return res.status(400).json({
          success: false,
          message: "Review cannot exceed 1000 characters",
        });
      }
      review.comment = trimmed;
    }

    if (Array.isArray(images)) {
      review.images = images;
    }

    await review.save();
    await updateProductRating(review.product);

    const order = await Order.findById(review.order).select("status");

    return res.status(200).json({
      success: true,
      message: "Review updated successfully",
      review: {
        ...review.toObject(),
        verifiedPurchase: order?.status === "delivered",
      },
    });
  } catch (error) {
    console.error("Update review error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update review",
    });
  }
};

const deleteReview = async (req, res) => {
  try {
    const { id } = req.params;

    const review = await Review.findById(id);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    const isOwner = review.user.toString() === req.user._id.toString();
    const isAdmin = req.user.role === "admin";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: "You can only delete your own review",
      });
    }

    const productId = review.product;
    await Review.findByIdAndDelete(id);
    await updateProductRating(productId);

    return res.status(200).json({
      success: true,
      message: "Review deleted successfully",
    });
  } catch (error) {
    console.error("Delete review error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete review",
    });
  }
};

const updateProductRating = async (productId) => {
  const result = await Review.aggregate([
    { $match: { product: productId } },
    {
      $group: {
        _id: "$product",
        avg: { $avg: "$rating" },
        count: { $sum: 1 },
      },
    },
  ]);

  if (result.length > 0) {
    const { avg, count } = result[0];
    const rounded = Math.round(avg * 10) / 10;
    await Product.findByIdAndUpdate(productId, {
      rating: rounded,
      numReviews: count,
    });
    return { rating: rounded, totalReviews: count };
  }

  await Product.findByIdAndUpdate(productId, {
    rating: 0,
    numReviews: 0,
  });
  return { rating: 0, totalReviews: 0 };
};

export {
  getProductReviews,
  getMyReview,
  getReviewEligibility,
  createReview,
  updateReview,
  deleteReview,
  updateProductRating,
};
import Product from "../models/Product.js";
import Category from "../models/Category.js";
import Subcategory from "../models/Subcategory.js";
import Brand from "../models/Brand.js";
import Order from "../models/Order.js";

const escapeRegex = (value) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const isObjectId = (value) => /^[0-9a-f]{24}$/i.test(value);

const resolveTaxonomyRef = async (param, Model) => {
  if (!param) return null;
  if (isObjectId(param)) return param;
  const doc = await Model.findOne({
    $or: [{ slug: param.toLowerCase() }, { name: param }],
    status: "active",
  })
    .select("_id")
    .lean();
  return doc ? doc._id : null;
};

const getProducts = async (req, res) => {
  try {
    const { search, category, brand, vendor, status, minPrice, maxPrice, page = 1, limit = 10 } = req.query;

    const query = {};
    if (search) {
      query.name = { $regex: search, $options: "i" };
    }
    if (category) query.category = category;
    if (brand) query.brand = brand;
    if (vendor) query.vendor = vendor;
    if (status) query.status = status;
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Product.countDocuments(query);
    const products = await Product.find(query)
      .populate("category", "name")
      .populate("subcategory", "name")
      .populate("brand", "name")
      .populate("vendor", "name email")
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
    console.error("Get products error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch products",
    });
  }
};

const getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate("category", "name")
      .populate("subcategory", "name")
      .populate("brand", "name")
      .populate("vendor", "name email");

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    return res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    console.error("Get product error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch product",
    });
  }
};

const createProduct = async (req, res) => {
  try {
    const {
      name, description, price, comparePrice, category,
      subcategory, brand, vendor, stock, images, status, featured, isApproved, tags,
    } = req.body;

    if (!name || !price || !category || !vendor) {
      return res.status(400).json({
        success: false,
        message: "Name, price, category, and vendor are required",
      });
    }

    if (price < 0) {
      return res.status(400).json({
        success: false,
        message: "Price cannot be negative",
      });
    }

    const product = await Product.create({
      name, description, price, comparePrice, category,
      subcategory, brand, vendor, stock, images, status, featured, isApproved, tags,
    });

    const populated = await product.populate([
      { path: "category", select: "name" },
      { path: "subcategory", select: "name" },
      { path: "brand", select: "name" },
      { path: "vendor", select: "name email" },
    ]);

    return res.status(201).json({
      success: true,
      message: "Product created successfully",
      product: populated,
    });
  } catch (error) {
    console.error("Create product error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create product",
    });
  }
};

const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const allowedFields = [
      "name", "description", "price", "comparePrice", "category",
      "subcategory", "brand", "vendor", "stock", "images", "status",
      "featured", "isApproved", "tags",
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        product[field] = req.body[field];
      }
    });

    await product.save();
    const populated = await product.populate([
      { path: "category", select: "name" },
      { path: "subcategory", select: "name" },
      { path: "brand", select: "name" },
      { path: "vendor", select: "name email" },
    ]);

    return res.status(200).json({
      success: true,
      message: "Product updated successfully",
      product: populated,
    });
  } catch (error) {
    console.error("Update product error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update product",
    });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    await Product.findByIdAndDelete(req.params.id);

    return res.status(200).json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    console.error("Delete product error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete product",
    });
  }
};

const getPublicProducts = async (req, res) => {
  try {
    const {
      search,
      category,
      subcategory,
      brand,
      minPrice,
      maxPrice,
      rating,
      availability,
      sort = "newest",
      page = 1,
      limit = 12,
    } = req.query;

    const pageNum = Math.max(1, Number(page) || 1);
    const limitNum = Math.min(60, Math.max(1, Number(limit) || 12));
    const skip = (pageNum - 1) * limitNum;

    const query = { status: "active", isApproved: true };

    const categoryId = await resolveTaxonomyRef(category, Category);
    if (category && !categoryId) {
      return res.status(200).json({
        success: true,
        products: [],
        page: pageNum,
        limit: limitNum,
        totalProducts: 0,
        totalPages: 0,
      });
    }
    if (categoryId) query.category = categoryId;

    const subcategoryId = await resolveTaxonomyRef(subcategory, Subcategory);
    if (subcategory && !subcategoryId) {
      return res.status(200).json({
        success: true,
        products: [],
        page: pageNum,
        limit: limitNum,
        totalProducts: 0,
        totalPages: 0,
      });
    }
    if (subcategoryId) query.subcategory = subcategoryId;

    const brandId = await resolveTaxonomyRef(brand, Brand);
    if (brand && !brandId) {
      return res.status(200).json({
        success: true,
        products: [],
        page: pageNum,
        limit: limitNum,
        totalProducts: 0,
        totalPages: 0,
      });
    }
    if (brandId) query.brand = brandId;

    if (search) {
      const regex = new RegExp(escapeRegex(search.trim()), "i");
      query.$or = [
        { name: regex },
        { description: regex },
        { sku: regex },
        { tags: regex },
      ];
    }

    if (rating) {
      query.rating = { $gte: Number(rating) };
    }

    if (availability === "in-stock") {
      query.stock = { $gt: 0 };
    } else if (availability === "out-of-stock") {
      query.stock = { $lte: 0 };
    }

    const hasPriceFilter = minPrice || maxPrice;
    if (hasPriceFilter) {
      const finalPriceExpr = {
        $subtract: [
          "$price",
          { $divide: [{ $multiply: ["$price", "$discount"] }, 100] },
        ],
      };
      const priceConditions = [];
      if (minPrice) priceConditions.push({ $gte: [finalPriceExpr, Number(minPrice)] });
      if (maxPrice) priceConditions.push({ $lte: [finalPriceExpr, Number(maxPrice)] });
      query.$expr = { $and: priceConditions };
    }

    const totalProducts = await Product.countDocuments(query);

    const sortOptions = {
      "price-low": { finalPrice: 1 },
      "price-high": { finalPrice: -1 },
      newest: { createdAt: -1 },
      rating: { rating: -1, numReviews: -1 },
      popular: { numReviews: -1, rating: -1 },
    };

    const sortUsed = sortOptions[sort] || sortOptions.newest;

    const lookupStages = [
      {
        $lookup: {
          from: "categories",
          localField: "category",
          foreignField: "_id",
          as: "category",
        },
      },
      { $unwind: { path: "$category", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "subcategories",
          localField: "subcategory",
          foreignField: "_id",
          as: "subcategory",
        },
      },
      { $unwind: { path: "$subcategory", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "brands",
          localField: "brand",
          foreignField: "_id",
          as: "brand",
        },
      },
      { $unwind: { path: "$brand", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "users",
          localField: "vendor",
          foreignField: "_id",
          as: "vendor",
        },
      },
      { $unwind: { path: "$vendor", preserveNullAndEmptyArrays: true } },
    ];

    const projectStage = (includeFinalPrice) => ({
      $project: {
        name: 1,
        slug: 1,
        description: 1,
        price: 1,
        discount: 1,
        sku: 1,
        stock: 1,
        images: 1,
        status: 1,
        featured: 1,
        isApproved: 1,
        rating: 1,
        numReviews: 1,
        tags: 1,
        createdAt: 1,
        updatedAt: 1,
        ...(includeFinalPrice ? { finalPrice: 1 } : {}),
        category: { name: 1, slug: 1 },
        subcategory: { name: 1, slug: 1 },
        brand: { name: 1, slug: 1 },
        vendor: { name: 1, email: 1, businessName: 1 },
      },
    });

    let products;

    if (sort === "price-low" || sort === "price-high") {
      const pipeline = [
        { $match: query },
        {
          $addFields: {
            finalPrice: {
              $round: [
                {
                  $subtract: [
                    "$price",
                    { $divide: [{ $multiply: ["$price", "$discount"] }, 100] },
                  ],
                },
                2,
              ],
            },
          },
        },
        { $sort: sortUsed },
        ...lookupStages,
        projectStage(true),
        { $skip: skip },
        { $limit: limitNum },
      ];
      products = await Product.aggregate(pipeline);
    } else {
      products = await Product.find(query)
        .sort(sortUsed)
        .skip(skip)
        .limit(limitNum)
        .populate("category", "name slug")
        .populate("subcategory", "name slug")
        .populate("brand", "name slug")
        .populate("vendor", "name email businessName");
    }

    return res.status(200).json({
      success: true,
      products,
      page: pageNum,
      limit: limitNum,
      totalProducts,
      totalPages: Math.ceil(totalProducts / limitNum),
    });
  } catch (error) {
    console.error("Get public products error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch products",
    });
  }
};

const getPublicProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const identifier = isObjectId(id)
      ? { _id: id }
      : { slug: id.toLowerCase() };

    const product = await Product.findOne({
      ...identifier,
      status: "active",
      isApproved: true,
    })
      .populate("category", "name slug image")
      .populate("subcategory", "name slug")
      .populate("brand", "name slug logo")
      .populate("vendor", "name email businessName businessAddress businessDescription");

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    return res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    console.error("Get public product error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch product",
    });
  }
};

const getRecommendedProducts = async (req, res) => {
  try {
    const purchasedOrders = await Order.find({
      user: req.user._id,
      paymentStatus: "paid",
    }).select("items.product");

    const purchasedIds = [];
    purchasedOrders.forEach((order) => {
      order.items.forEach((item) => {
        if (item.product) purchasedIds.push(String(item.product));
      });
    });

    let categoryIds = [];
    if (purchasedIds.length > 0) {
      const purchasedProducts = await Product.find({
        _id: { $in: purchasedIds },
      }).select("category");
      categoryIds = [
        ...new Set(
          purchasedProducts
            .map((p) => p.category?.toString())
            .filter(Boolean)
        ),
      ];
    }

    let products = [];
    if (categoryIds.length > 0) {
      products = await Product.find({
        category: { $in: categoryIds },
        status: "active",
        isApproved: true,
        stock: { $gt: 0 },
        _id: { $nin: purchasedIds },
      })
        .sort({ rating: -1, numReviews: -1 })
        .limit(8)
        .populate("category", "name slug")
        .populate("brand", "name")
        .populate("vendor", "name businessName");
    }

    if (products.length < 4) {
      const seen = new Set(products.map((p) => p._id.toString()));
      const existingIds = [...purchasedIds, ...products.map((p) => p._id.toString())];
      const fallback = await Product.find({
        status: "active",
        isApproved: true,
        stock: { $gt: 0 },
        _id: { $nin: existingIds },
      })
        .sort({ featured: -1, rating: -1, numReviews: -1 })
        .limit(8)
        .populate("category", "name slug")
        .populate("brand", "name")
        .populate("vendor", "name businessName");

      fallback.forEach((p) => {
        if (!seen.has(p._id.toString())) {
          products.push(p);
          seen.add(p._id.toString());
        }
      });
    }

    return res.status(200).json({
      success: true,
      products,
    });
  } catch (error) {
    console.error("Get recommended products error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch recommended products",
    });
  }
};

export {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  getPublicProducts,
  getPublicProduct,
  getRecommendedProducts,
};

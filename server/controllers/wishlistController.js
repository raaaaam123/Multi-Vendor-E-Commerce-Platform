import Wishlist from "../models/Wishlist.js";
import Product from "../models/Product.js";

const getOrCreateWishlist = async (userId) => {
  let wishlist = await Wishlist.findOne({ user: userId });
  if (!wishlist) {
    wishlist = await Wishlist.create({ user: userId, products: [] });
  }
  return wishlist;
};

const buildWishlistView = async (userId) => {
  const wishlist = await getOrCreateWishlist(userId);
  const products = await Product.find({
    _id: { $in: wishlist.products },
  })
    .select(
      "name slug price discount sku stock images rating numReviews category brand vendor"
    )
    .populate("category", "name slug")
    .populate("brand", "name")
    .populate("vendor", "businessName name");

  const keptIds = products.map((p) => p._id.toString());
  const stale = wishlist.products.filter(
    (id) => !keptIds.includes(id.toString())
  );
  if (stale.length > 0) {
    wishlist.products = wishlist.products.filter((id) =>
      keptIds.includes(id.toString())
    );
    await wishlist.save();
  }

  return { wishlist, products };
};

const getWishlist = async (req, res) => {
  try {
    const { products } = await buildWishlistView(req.user._id);
    return res.status(200).json({ success: true, products });
  } catch (error) {
    console.error("Get wishlist error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to load wishlist",
    });
  }
};

const addToWishlist = async (req, res) => {
  try {
    const { productId } = req.body;
    if (!productId) {
      return res.status(400).json({
        success: false,
        message: "Product id is required",
      });
    }

    const product = await Product.findById(productId).select(
      "name status isApproved"
    );
    if (!product) {
      return res.status(404).json({
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

    const wishlist = await getOrCreateWishlist(req.user._id);
    if (!wishlist.products.some((id) => id.toString() === productId)) {
      wishlist.products.push(productId);
      await wishlist.save();
    }

    const { products } = await buildWishlistView(req.user._id);
    return res.status(200).json({ success: true, products });
  } catch (error) {
    console.error("Add to wishlist error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to add item to wishlist",
    });
  }
};

const removeFromWishlist = async (req, res) => {
  try {
    const { productId } = req.params;
    const wishlist = await getOrCreateWishlist(req.user._id);
    wishlist.products = wishlist.products.filter(
      (id) => id.toString() !== productId
    );
    await wishlist.save();

    const { products } = await buildWishlistView(req.user._id);
    return res.status(200).json({ success: true, products });
  } catch (error) {
    console.error("Remove from wishlist error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to remove item from wishlist",
    });
  }
};

export { getWishlist, addToWishlist, removeFromWishlist };
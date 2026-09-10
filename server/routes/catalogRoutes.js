import express from "express";
import Category from "../models/Category.js";
import Subcategory from "../models/Subcategory.js";
import Brand from "../models/Brand.js";

const categoriesRouter = express.Router();

categoriesRouter.get("/", async (req, res) => {
  try {
    const categories = await Category.find({ status: "active" })
      .sort({ name: 1 })
      .lean();
    return res.status(200).json({ success: true, categories });
  } catch (error) {
    console.error("Public categories error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch categories",
    });
  }
});

categoriesRouter.get("/:idOrSlug", async (req, res) => {
  try {
    const { idOrSlug } = req.params;
    const isObjectId = /^[0-9a-f]{24}$/i.test(idOrSlug);
    const query = isObjectId ? { _id: idOrSlug } : { slug: idOrSlug };
    const category = await Category.findOne({ ...query, status: "active" }).lean();
    if (!category) {
      return res.status(404).json({ success: false, message: "Category not found" });
    }
    return res.status(200).json({ success: true, category });
  } catch (error) {
    console.error("Public category error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch category",
    });
  }
});

const subcategoriesRouter = express.Router();

subcategoriesRouter.get("/", async (req, res) => {
  try {
    const { category } = req.query;
    const query = { status: "active" };
    if (category) {
      query.category = category;
    }
    const subcategories = await Subcategory.find(query)
      .populate("category", "name slug")
      .sort({ name: 1 })
      .lean();
    return res.status(200).json({ success: true, subcategories });
  } catch (error) {
    console.error("Public subcategories error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch subcategories",
    });
  }
});

const brandsRouter = express.Router();

brandsRouter.get("/", async (req, res) => {
  try {
    const brands = await Brand.find({ status: "active" })
      .sort({ name: 1 })
      .lean();
    return res.status(200).json({ success: true, brands });
  } catch (error) {
    console.error("Public brands error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch brands",
    });
  }
});

brandsRouter.get("/:idOrSlug", async (req, res) => {
  try {
    const { idOrSlug } = req.params;
    const isObjectId = /^[0-9a-f]{24}$/i.test(idOrSlug);
    const query = isObjectId ? { _id: idOrSlug } : { slug: idOrSlug };
    const brand = await Brand.findOne({ ...query, status: "active" }).lean();
    if (!brand) {
      return res.status(404).json({ success: false, message: "Brand not found" });
    }
    return res.status(200).json({ success: true, brand });
  } catch (error) {
    console.error("Public brand error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch brand",
    });
  }
});

export { categoriesRouter, subcategoriesRouter, brandsRouter };

import Brand from "../models/Brand.js";

const getBrands = async (req, res) => {
  try {
    const { search, status, page = 1, limit = 10 } = req.query;

    const query = {};
    if (search) {
      query.name = { $regex: search, $options: "i" };
    }
    if (status) query.status = status;

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Brand.countDocuments(query);
    const brands = await Brand.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    return res.status(200).json({
      success: true,
      brands,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    console.error("Get brands error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch brands",
    });
  }
};

const getAllBrands = async (req, res) => {
  try {
    const brands = await Brand.find({ status: "active" }).sort({ name: 1 });
    return res.status(200).json({
      success: true,
      brands,
    });
  } catch (error) {
    console.error("Get all brands error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch brands",
    });
  }
};

const getBrand = async (req, res) => {
  try {
    const brand = await Brand.findById(req.params.id);
    if (!brand) {
      return res.status(404).json({
        success: false,
        message: "Brand not found",
      });
    }

    return res.status(200).json({
      success: true,
      brand,
    });
  } catch (error) {
    console.error("Get brand error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch brand",
    });
  }
};

const createBrand = async (req, res) => {
  try {
    const { name, description, logo, website, status } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Brand name is required",
      });
    }

    const existing = await Brand.findOne({ name });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: "Brand already exists with this name",
      });
    }

    const brand = await Brand.create({
      name,
      description,
      logo,
      website,
      status,
    });

    return res.status(201).json({
      success: true,
      message: "Brand created successfully",
      brand,
    });
  } catch (error) {
    console.error("Create brand error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create brand",
    });
  }
};

const updateBrand = async (req, res) => {
  try {
    const { name, description, logo, website, status } = req.body;
    const brand = await Brand.findById(req.params.id);

    if (!brand) {
      return res.status(404).json({
        success: false,
        message: "Brand not found",
      });
    }

    if (name && name !== brand.name) {
      const existing = await Brand.findOne({ name });
      if (existing) {
        return res.status(409).json({
          success: false,
          message: "Brand already exists with this name",
        });
      }
    }

    if (name !== undefined) brand.name = name;
    if (description !== undefined) brand.description = description;
    if (logo !== undefined) brand.logo = logo;
    if (website !== undefined) brand.website = website;
    if (status !== undefined) brand.status = status;

    await brand.save();

    return res.status(200).json({
      success: true,
      message: "Brand updated successfully",
      brand,
    });
  } catch (error) {
    console.error("Update brand error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update brand",
    });
  }
};

const deleteBrand = async (req, res) => {
  try {
    const brand = await Brand.findById(req.params.id);
    if (!brand) {
      return res.status(404).json({
        success: false,
        message: "Brand not found",
      });
    }

    await Brand.findByIdAndDelete(req.params.id);

    return res.status(200).json({
      success: true,
      message: "Brand deleted successfully",
    });
  } catch (error) {
    console.error("Delete brand error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete brand",
    });
  }
};

export { getBrands, getAllBrands, getBrand, createBrand, updateBrand, deleteBrand };

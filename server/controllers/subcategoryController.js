import Subcategory from "../models/Subcategory.js";

const getSubcategories = async (req, res) => {
  try {
    const { search, category, status, page = 1, limit = 10 } = req.query;

    const query = {};
    if (search) {
      query.name = { $regex: search, $options: "i" };
    }
    if (category) query.category = category;
    if (status) query.status = status;

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Subcategory.countDocuments(query);
    const subcategories = await Subcategory.find(query)
      .populate("category", "name")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    return res.status(200).json({
      success: true,
      subcategories,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    console.error("Get subcategories error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch subcategories",
    });
  }
};

const getSubcategory = async (req, res) => {
  try {
    const subcategory = await Subcategory.findById(req.params.id).populate(
      "category",
      "name"
    );
    if (!subcategory) {
      return res.status(404).json({
        success: false,
        message: "Subcategory not found",
      });
    }

    return res.status(200).json({
      success: true,
      subcategory,
    });
  } catch (error) {
    console.error("Get subcategory error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch subcategory",
    });
  }
};

const createSubcategory = async (req, res) => {
  try {
    const { name, category, description, image, status } = req.body;

    if (!name || !category) {
      return res.status(400).json({
        success: false,
        message: "Name and parent category are required",
      });
    }

    const existing = await Subcategory.findOne({ name });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: "Subcategory already exists with this name",
      });
    }

    const subcategory = await Subcategory.create({
      name,
      category,
      description,
      image,
      status,
    });

    const populated = await subcategory.populate("category", "name");

    return res.status(201).json({
      success: true,
      message: "Subcategory created successfully",
      subcategory: populated,
    });
  } catch (error) {
    console.error("Create subcategory error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create subcategory",
    });
  }
};

const updateSubcategory = async (req, res) => {
  try {
    const { name, category, description, image, status } = req.body;
    const subcategory = await Subcategory.findById(req.params.id);

    if (!subcategory) {
      return res.status(404).json({
        success: false,
        message: "Subcategory not found",
      });
    }

    if (name && name !== subcategory.name) {
      const existing = await Subcategory.findOne({ name });
      if (existing) {
        return res.status(409).json({
          success: false,
          message: "Subcategory already exists with this name",
        });
      }
    }

    if (name !== undefined) subcategory.name = name;
    if (category !== undefined) subcategory.category = category;
    if (description !== undefined) subcategory.description = description;
    if (image !== undefined) subcategory.image = image;
    if (status !== undefined) subcategory.status = status;

    await subcategory.save();
    const populated = await subcategory.populate("category", "name");

    return res.status(200).json({
      success: true,
      message: "Subcategory updated successfully",
      subcategory: populated,
    });
  } catch (error) {
    console.error("Update subcategory error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update subcategory",
    });
  }
};

const deleteSubcategory = async (req, res) => {
  try {
    const subcategory = await Subcategory.findById(req.params.id);
    if (!subcategory) {
      return res.status(404).json({
        success: false,
        message: "Subcategory not found",
      });
    }

    await Subcategory.findByIdAndDelete(req.params.id);

    return res.status(200).json({
      success: true,
      message: "Subcategory deleted successfully",
    });
  } catch (error) {
    console.error("Delete subcategory error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete subcategory",
    });
  }
};

export {
  getSubcategories,
  getSubcategory,
  createSubcategory,
  updateSubcategory,
  deleteSubcategory,
};

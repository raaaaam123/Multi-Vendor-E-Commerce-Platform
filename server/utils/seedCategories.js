import "dotenv/config";
import connectDB from "../config/db.js";
import Category from "../models/Category.js";

const categories = [
  { name: "Electronics", description: "Phones, computers, and gadgets" },
  { name: "Fashion", description: "Clothing, apparel, and accessories" },
  { name: "Home & Furniture", description: "Furniture and home decor" },
  { name: "Sports & Outdoors", description: "Sports gear and outdoor equipment" },
  { name: "Beauty", description: "Skincare, cosmetics, and beauty products" },
  { name: "Books", description: "Books and stationery" },
  { name: "Toys & Games", description: "Toys and games for all ages" },
  { name: "Food & Grocery", description: "Food and grocery items" },
  { name: "Automotive", description: "Cars, parts, and auto accessories" },
  { name: "Jewelry", description: "Jewelry and fine accessories" },
];

const seedCategories = async () => {
  try {
    await connectDB();

    let created = 0;
    let skipped = 0;

    for (const category of categories) {
      const existing = await Category.findOne({ name: category.name });
      if (existing) {
        if (existing.status !== "active") {
          existing.status = "active";
          await existing.save();
        }
        skipped += 1;
        continue;
      }
      await Category.create(category);
      created += 1;
    }

    const total = await Category.countDocuments({ status: "active" });
    console.log(
      `Categories seeded successfully: ${created} created, ${skipped} skipped (already present). Active total: ${total}`
    );
    process.exit(0);
  } catch (error) {
    console.error("Failed to seed categories:", error.message);
    process.exit(1);
  }
};

seedCategories();
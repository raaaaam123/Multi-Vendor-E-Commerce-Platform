import "dotenv/config";
import connectDB from "../config/db.js";
import User from "../models/User.js";

const createAdmin = async () => {
  try {
    const email = process.env.ADMIN_EMAIL || "admin@shopverse.com";
    const password = process.env.ADMIN_PASSWORD || "admin123";
    const name = process.env.ADMIN_NAME || "Admin";

    if (password.length < 6) {
      console.error("Password must be at least 6 characters.");
      process.exit(1);
    }

    await connectDB();

    let admin = await User.findOne({ email });

    if (admin) {
      admin.name = name;
      admin.role = "admin";
      admin.status = "active";
      admin.approvalStatus = "approved";
      admin.password = password;
      await admin.save();
    } else {
      admin = await User.create({
        name,
        email,
        password,
        role: "admin",
        status: "active",
        approvalStatus: "approved",
      });
    }

    console.log(
      admin
        ? `Admin created/verified successfully: ${admin.email} (role: ${admin.role})`
        : "Failed to create admin."
    );
    process.exit(0);
  } catch (error) {
    console.error("Failed to create admin:", error.message);
    process.exit(1);
  }
};

createAdmin();

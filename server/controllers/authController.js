import User from "../models/User.js";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../utils/generateToken.js";
import { sendEmail } from "../utils/email.js";
import { registrationEmail, passwordResetEmail } from "../utils/emailTemplates.js";
import jwt from "jsonwebtoken";

const getFrontendBaseUrl = () => {
  const clientUrl = (process.env.CLIENT_URL || process.env.FRONTEND_URL || "").trim();
  if (clientUrl) return clientUrl.replace(/\/+$/, "");
  if (process.env.NODE_ENV === "production") {
    return "https://multi-vendor-e-commerce-platform.vercel.app";
  }
  return "http://localhost:5173";
};

const setTokenCookies = (res, accessToken, refreshToken) => {
  const isProduction = process.env.NODE_ENV === "production";

  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax",
    maxAge: 24 * 60 * 60 * 1000,
  });

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};

const clearTokenCookies = (res) => {
  res.clearCookie("accessToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });
};

const register = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      phone,
      role,
      businessName,
      businessAddress,
      businessDescription,
    } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide name, email and password",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters",
      });
    }

    const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid email address",
      });
    }

    if (phone && !/^[0-9+\-\s()]{7,20}$/.test(phone)) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid phone number",
      });
    }

    let userRole = "customer";
    if (role && ["customer", "vendor"].includes(role)) {
      userRole = role;
    }

    if (userRole === "vendor") {
      if (!businessName || !businessAddress) {
        return res.status(400).json({
          success: false,
          message: "Business name and address are required for vendors",
        });
      }
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(409).json({
        success: false,
        message: "User already exists with this email",
      });
    }

    const user = await User.create({
      name,
      email,
      password,
      phone,
      role: userRole,
      businessName: userRole === "vendor" ? businessName : "",
      businessAddress: userRole === "vendor" ? businessAddress : "",
      businessDescription: userRole === "vendor" ? businessDescription : "",
      approvalStatus: userRole === "vendor" ? "pending" : "approved",
    });

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    setTokenCookies(res, accessToken, refreshToken);

    sendEmail({
      to: user.email,
      subject:
        userRole === "vendor"
          ? "Vendor Registration Received"
          : "Welcome to ShopVerse!",
      html: registrationEmail({
        name: user.name,
        role: user.role,
      }),
    }).catch((emailError) => {
      console.error("Registration email failed:", emailError.message);
    });

    return res.status(201).json({
      success: true,
      message: "Registration successful",
      user,
      accessToken,
      refreshToken,
    });
  } catch (error) {
    console.error("Register error:", error);
    return res.status(500).json({
      success: false,
      message: "Registration failed. Please try again.",
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide email and password",
      });
    }

    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    if (!user.password) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    let isPasswordValid = false;
    try {
      isPasswordValid = await user.matchPassword(password);
    } catch (compareError) {
      console.error("Password compare error:", compareError.message);
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    if (user.status !== "active") {
      return res.status(403).json({
        success: false,
        message: "Your account is not active. Please contact support.",
      });
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    setTokenCookies(res, accessToken, refreshToken);

    return res.status(200).json({
      success: true,
      message: "Login successful",
      user,
      accessToken,
      refreshToken,
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({
      success: false,
      message: "Login failed. Please try again.",
    });
  }
};

const logout = (req, res) => {
  try {
    clearTokenCookies(res);
    return res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    console.error("Logout error:", error);
    return res.status(500).json({
      success: false,
      message: "Logout failed. Please try again.",
    });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Please provide your email address",
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "No account found with this email",
      });
    }

    const resetToken = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );

    const resetUrl = `${getFrontendBaseUrl()}/reset-password?token=${resetToken}`;

    try {
      await sendEmail({
        to: user.email,
        subject: "Reset Your Password - ShopVerse",
        html: passwordResetEmail({
          name: user.name,
          resetUrl,
        }),
      });
    } catch (emailError) {
      console.error(
        "[FORGOT-PASSWORD] Email send failed:",
        emailError?.stack || emailError?.message || emailError
      );
      return res.status(500).json({
        success: false,
        message: "Failed to send password reset email. Please try again.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Password reset link sent to your email",
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to process password reset",
    });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({
        success: false,
        message: "Reset token and new password are required",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters",
      });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: "Reset link is invalid or has expired",
      });
    }

    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    user.password = password;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password reset successfully. You can now log in.",
    });
  } catch (error) {
    console.error("Reset password error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to reset password",
    });
  }
};

const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("GetMe error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch user data",
    });
  }
};

const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const fields = ["name", "phone"];
    fields.forEach((field) => {
      if (req.body[field] !== undefined) {
        user[field] = req.body[field];
      }
    });

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user,
    });
  } catch (error) {
    if (error?.name === "ValidationError") {
      const message = Object.values(error.errors)
        .map((err) => err.message)
        .join(", ");
      return res.status(400).json({
        success: false,
        message,
      });
    }
    console.error("Update profile error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update profile",
    });
  }
};

export { register, login, logout, getMe, updateProfile, forgotPassword, resetPassword };

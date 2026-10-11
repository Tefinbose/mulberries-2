const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { sendUserWelcome } = require("../services/emailService");

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || "7d" });

// @route POST /api/auth/register
const registerUser = async (req, res, next) => {
  try {
    const { name, email, password, phone } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: "Email already registered" });
    }

    const user = await User.create({ name, email, password, phone });

    // Send welcome email asynchronously
    sendUserWelcome(user).catch((err) => {
      console.error("Failed to send user welcome email:", err.message);
    });

    res.status(201).json({
      success: true,
      user: { _id: user._id, name: user.name, email: user.email, phone: user.phone, role: user.role, permissions: user.permissions, isActive: user.isActive },
      token: generateToken(user._id),
    });
  } catch (error) {
    next(error);
  }
};

// @route POST /api/auth/login
const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select("+password");
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }
    if (!user.isActive) return res.status(403).json({ success: false, message: "This account has been disabled" });

    // Track staff & admin login events in operation history
    if (["admin", "manager", "staff"].includes(user.role)) {
      const { logActivity } = require("../services/activityLogService");
      logActivity({
        req,
        user,
        action: "LOGIN",
        module: "auth",
        resourceId: user._id,
        resourceTitle: user.name,
        description: `${user.role.toUpperCase()} "${user.name}" logged into the administration dashboard`,
      });
    }

    res.json({
      success: true,
      user: { _id: user._id, name: user.name, email: user.email, phone: user.phone, role: user.role, permissions: user.permissions, isActive: user.isActive },
      token: generateToken(user._id),
    });
  } catch (error) {
    next(error);
  }
};

// @route GET /api/auth/profile
const getProfile = async (req, res, next) => {
  try {
    res.json({ success: true, user: req.user });
  } catch (error) {
    next(error);
  }
};

// @route PUT /api/auth/profile
const updateProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    user.name = req.body.name || user.name;
    user.phone = req.body.phone || user.phone;
    if (req.body.password) user.password = req.body.password;

    const updated = await user.save();
    res.json({
      success: true,
      user: { _id: updated._id, name: updated.name, email: updated.email, phone: updated.phone, role: updated.role, permissions: updated.permissions, isActive: updated.isActive },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { generateToken, registerUser, loginUser, getProfile, updateProfile };
